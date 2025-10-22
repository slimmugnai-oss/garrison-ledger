import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AdminDashboardClient from "./AdminDashboardClient";
import { Alert } from "./components/AlertPanel";

export const metadata: Metadata = {
  title: "Admin Command Center - Garrison Ledger",
  description: "Comprehensive administrative control center for system management",
  robots: { index: false, follow: false },
};

// Admin user IDs (add your Clerk user ID here)
const ADMIN_USER_IDS = [
  "user_343xVqjkdILtBkaYAJfE5H8Wq0q", // slimmugnai@gmail.com
  // Add more admin IDs as needed
];

async function getAdminData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // === USER METRICS ===

  // Total users
  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  // Premium users (active WITH Stripe subscription - real paid users only)
  const { count: premiumUsers } = await supabase
    .from("entitlements")
    .select("*", { count: "exact", head: true })
    .eq("tier", "premium")
    .eq("status", "active")
    .not("stripe_subscription_id", "is", null);

  // New signups (last 7 days)
  const { count: newSignups7d } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  // New premium (last 7 days)
  const { count: newPremium7d } = await supabase
    .from("entitlements")
    .select("*", { count: "exact", head: true })
    .eq("tier", "premium")
    .eq("status", "active")
    .gte("created_at", sevenDaysAgo);

  // Users with completed profiles
  const { count: profilesCompleted } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .not("rank", "is", null)
    .not("branch", "is", null);

  // Support tickets (new)
  const { count: newTickets } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  // Feed items (new)
  const { count: feedItems } = await supabase
    .from("feed_items")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  // === REVENUE METRICS ===
  const mrr = (premiumUsers || 0) * 9.99;
  const conversionRate =
    totalUsers && totalUsers > 0 ? ((premiumUsers || 0) / totalUsers) * 100 : 0;
  const activationRate =
    totalUsers && totalUsers > 0 ? ((profilesCompleted || 0) / totalUsers) * 100 : 0;

  // === RECENT ACTIVITY ===
  const { data: recentUsers } = await supabase
    .from("user_profiles")
    .select("user_id, created_at, rank, branch")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentActivity = (recentUsers || []).map((user, index) => ({
    id: `activity-${index}`,
    type: "signup" as const,
    message: `New user signed up${user.rank ? ` (${user.rank})` : ""}`,
    timestamp: new Date(user.created_at).toLocaleString(),
    userId: user.user_id,
  }));

  // === SYSTEM ALERTS ===
  const alerts: Alert[] = [];

  // Check for new support tickets
  if (newTickets && newTickets > 0) {
    alerts.push({
      id: "support-tickets",
      severity: newTickets > 5 ? "high" : "medium",
      category: "user",
      message: `${newTickets} support ticket${newTickets > 1 ? "s" : ""} need${newTickets === 1 ? "s" : ""} response`,
      details: "Users are waiting for support. Average response time target: < 24 hours.",
      dismissible: true,
    });
  }

  // Check for new feed items to review
  if (feedItems && feedItems > 0) {
    alerts.push({
      id: "feed-items",
      severity: "low",
      category: "data",
      message: `${feedItems} new feed item${feedItems > 1 ? "s" : ""} ready for curation`,
      details: "Review and promote quality content to the Listening Post.",
      dismissible: true,
    });
  }

  // Check conversion rate
  if (conversionRate < 5) {
    alerts.push({
      id: "low-conversion",
      severity: "medium",
      category: "revenue",
      message: `Conversion rate is below target (${conversionRate.toFixed(1)}% vs 8-10% target)`,
      details:
        "Consider improving onboarding flow, premium value proposition, or targeting strategies.",
      dismissible: true,
    });
  }

  // Check for stale BAH data (example alert)
  const { data: latestBah } = await supabase
    .from("bah_rates")
    .select("effective_date")
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestBah && latestBah.effective_date < "2025-01-01") {
    alerts.push({
      id: "stale-bah",
      severity: "high",
      category: "data",
      message: "BAH data may be outdated - review needed",
      details: `Latest BAH data is from ${latestBah.effective_date}. Annual updates typically occur in January.`,
      dismissible: false,
    });
  }

  return {
    metrics: {
      mrr,
      totalUsers: totalUsers || 0,
      premiumUsers: premiumUsers || 0,
      conversionRate,
      newSignups7d: newSignups7d || 0,
      newPremium7d: newPremium7d || 0,
      activationRate,
      supportTickets: newTickets || 0,
    },
    alerts,
    recentActivity,
    badges: {
      overview: alerts.filter((a) => a.severity === "critical" || a.severity === "high").length,
      users: newSignups7d || 0,
      content: feedItems || 0,
      system: alerts.filter((a) => a.category === "data" || a.category === "api").length,
    },
  };
}

export default async function AdminDashboard() {
  let user;

  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    redirect("/sign-in");
  }

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  if (!ADMIN_USER_IDS.includes(user.id)) {
    // Show error page instead of redirecting - helps with debugging
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto max-w-md rounded-xl border-2 border-danger bg-card p-8 text-center">
            <div className="mb-4 text-6xl">🚫</div>
            <h1 className="text-text-headings mb-2 text-2xl font-bold">Access Denied</h1>
            <p className="text-text-muted mb-4">You need admin privileges to access this page.</p>
            <div className="bg-surface-hover mb-4 rounded-lg p-4">
              <p className="text-text-muted mb-2 text-xs">Your User ID:</p>
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">{user.id}</code>
            </div>
            <a
              href="/dashboard"
              className="hover:bg-primary-hover inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  let adminData;

  try {
    adminData = await getAdminData();
  } catch (error) {
    console.error("Error loading admin data:", error);
    // Return error page instead of crashing
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="border-warning mx-auto max-w-md rounded-xl border-2 bg-card p-8 text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h1 className="text-text-headings mb-2 text-2xl font-bold">Error Loading Data</h1>
            <p className="text-text-muted mb-4">There was an error loading admin dashboard data.</p>
            <p className="text-text-muted mb-4 text-sm">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="hover:bg-primary-hover rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <AdminDashboardClient
          metrics={adminData.metrics}
          alerts={adminData.alerts}
          recentActivity={adminData.recentActivity}
          badges={adminData.badges}
        />
      </div>
      <Footer />
    </>
  );
}
