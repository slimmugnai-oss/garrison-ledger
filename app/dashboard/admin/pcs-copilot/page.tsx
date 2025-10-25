import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import PCSCopilotMetrics from "@/app/components/admin/PCSCopilotMetrics";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import PageHeader from "@/app/components/ui/PageHeader";
import { supabaseAdmin } from "@/lib/supabase";

export default async function AdminPCSCopilotPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Check admin status
  const { data: entitlement } = await supabaseAdmin
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (entitlement?.tier !== "premium") {
    redirect("/dashboard");
  }

  // Fetch PCS Copilot metrics
  const { data: metrics } = await supabaseAdmin.rpc("get_pcs_copilot_metrics");

  // Fetch recent claims
  const { data: recentClaims } = await supabaseAdmin
    .from("pcs_claims")
    .select(
      `
      id,
      claim_name,
      status,
      readiness_score,
      completion_percentage,
      created_at,
      user_profiles (
        rank,
        branch
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch validation issues (fetch all, aggregate client-side)
  const { data: allChecks } = await supabaseAdmin
    .from("pcs_claim_checks")
    .select("check_category, severity")
    .eq("is_resolved", false);

  // Aggregate validation issues client-side
  const validationIssues = allChecks
    ? Object.entries(
        allChecks.reduce(
          (acc, check) => {
            const key = `${check.check_category}__${check.severity}`;
            acc[key] = {
              check_category: check.check_category,
              severity: check.severity,
              count: (acc[key]?.count || 0) + 1,
            };
            return acc;
          },
          {} as Record<string, { check_category: string; severity: string; count: number }>
        )
      )
        .map(([_, value]) => value)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : [];

  // Fetch rate health
  const { data: rateHealth } = await supabaseAdmin
    .from("jtr_rates_cache")
    .select("rate_type, last_verified, verification_status")
    .order("last_verified", { ascending: true });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="mobile-container">
          <PageHeader
            title="PCS Copilot Admin"
            subtitle="Usage metrics, data quality monitoring, and performance tracking"
          />

          <PCSCopilotMetrics
            metrics={metrics}
            recentClaims={recentClaims || []}
            validationIssues={validationIssues || []}
            rateHealth={rateHealth || []}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
