import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AdminDashboardClient from './AdminDashboardClient';
import { Alert } from './components/AlertPanel';

export const metadata: Metadata = {
  title: "Admin Command Center - Garrison Ledger",
  description: "Comprehensive administrative control center for system management",
  robots: { index: false, follow: false },
};

// Admin user IDs (add your Clerk user ID here)
const ADMIN_USER_IDS = [
  'user_343xVqjkdILtBkaYAJfE5H8Wq0q', // slimmugnai@gmail.com
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
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  // Premium users (active WITH Stripe subscription - real paid users only)
  const { count: premiumUsers } = await supabase
    .from('entitlements')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'premium')
    .eq('status', 'active')
    .not('stripe_subscription_id', 'is', null);

  // New signups (last 7 days)
  const { count: newSignups7d } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  // New premium (last 7 days)
  const { count: newPremium7d } = await supabase
    .from('entitlements')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'premium')
    .eq('status', 'active')
    .gte('created_at', sevenDaysAgo);

  // Users with completed profiles
  const { count: profilesCompleted } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .not('rank', 'is', null)
    .not('branch', 'is', null);

  // Support tickets (new)
  const { count: newTickets } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  // Feed items (new)
  const { count: feedItems } = await supabase
    .from('feed_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  // === REVENUE METRICS ===
  const mrr = (premiumUsers || 0) * 9.99;
  const conversionRate = totalUsers && totalUsers > 0
    ? ((premiumUsers || 0) / totalUsers * 100)
    : 0;
  const activationRate = totalUsers && totalUsers > 0
    ? ((profilesCompleted || 0) / totalUsers * 100)
    : 0;

  // === RECENT ACTIVITY ===
  const { data: recentUsers } = await supabase
    .from('user_profiles')
    .select('user_id, created_at, rank, branch')
    .order('created_at', { ascending: false })
    .limit(5);

  const recentActivity = (recentUsers || []).map((user, index) => ({
    id: `activity-${index}`,
    type: 'signup' as const,
    message: `New user signed up${user.rank ? ` (${user.rank})` : ''}`,
    timestamp: new Date(user.created_at).toLocaleString(),
    userId: user.user_id,
  }));

  // === SYSTEM ALERTS ===
  const alerts: Alert[] = [];

  // Check for new support tickets
  if (newTickets && newTickets > 0) {
    alerts.push({
      id: 'support-tickets',
      severity: newTickets > 5 ? 'high' : 'medium',
      category: 'user',
      message: `${newTickets} support ticket${newTickets > 1 ? 's' : ''} need${newTickets === 1 ? 's' : ''} response`,
      details: 'Users are waiting for support. Average response time target: < 24 hours.',
      action: {
        label: 'View Support Tickets',
        onClick: () => {}, // Will be handled client-side
      },
      dismissible: true,
    });
  }

  // Check for new feed items to review
  if (feedItems && feedItems > 0) {
    alerts.push({
      id: 'feed-items',
      severity: 'low',
      category: 'data',
      message: `${feedItems} new feed item${feedItems > 1 ? 's' : ''} ready for curation`,
      details: 'Review and promote quality content to the Listening Post.',
      action: {
        label: 'Review Content',
        onClick: () => {}, // Will be handled client-side
      },
      dismissible: true,
    });
  }

  // Check conversion rate
  if (conversionRate < 5) {
    alerts.push({
      id: 'low-conversion',
      severity: 'medium',
      category: 'revenue',
      message: `Conversion rate is below target (${conversionRate.toFixed(1)}% vs 8-10% target)`,
      details: 'Consider improving onboarding flow, premium value proposition, or targeting strategies.',
      dismissible: true,
    });
  }

  // Check for stale BAH data (example alert)
  const { data: latestBah } = await supabase
    .from('bah_rates')
    .select('effective_date')
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestBah && latestBah.effective_date < '2025-01-01') {
    alerts.push({
      id: 'stale-bah',
      severity: 'high',
      category: 'data',
      message: 'BAH data may be outdated - review needed',
      details: `Latest BAH data is from ${latestBah.effective_date}. Annual updates typically occur in January.`,
      action: {
        label: 'Check Data Sources',
        onClick: () => {}, // Will be handled client-side
      },
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
      overview: alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length,
      users: newSignups7d || 0,
      content: feedItems || 0,
      system: alerts.filter(a => a.category === 'data' || a.category === 'api').length,
    },
  };
}

export default async function AdminDashboard() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  if (!ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const adminData = await getAdminData();

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
