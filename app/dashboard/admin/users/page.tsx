import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Badge from '@/app/components/ui/Badge';
import PageHeader from '@/app/components/ui/PageHeader';

export const metadata: Metadata = {
  title: "User Management - Admin Dashboard",
  description: "View and manage user accounts and analytics",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_2r5JqYQZ8kX9wL2mN3pT4vU6'];

interface RecentUser {
  user_id: string;
  rank: string | null;
  branch: string | null;
  created_at: string;
  profile_completed: boolean | null;
  plan_generated_count: number | null;
}

async function getUserAnalytics() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  // Get users with completed profiles
  const { count: completedProfiles } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('profile_completed', true);

  // Get users with plans
  const { count: usersWithPlans } = await supabase
    .from('user_plans')
    .select('user_id', { count: 'exact', head: true });

  // Get premium users
  const { count: premiumUsers } = await supabase
    .from('entitlements')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'premium')
    .eq('status', 'active');

  // Get recent signups (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentSignups } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  // Get active users (generated plan in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: activeUsers } = await supabase
    .from('user_plans')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo);

  // Get recent users with details
  const { data: recentUsers } = await supabase
    .from('user_profiles')
    .select('user_id, rank, branch, created_at, profile_completed, plan_generated_count')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    totalUsers: totalUsers || 0,
    completedProfiles: completedProfiles || 0,
    usersWithPlans: usersWithPlans || 0,
    premiumUsers: premiumUsers || 0,
    recentSignups: recentSignups || 0,
    activeUsers: activeUsers || 0,
    recentUsers: (recentUsers as RecentUser[]) || [],
  };
}

export default async function UserManagementPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const analytics = await getUserAnalytics();
  const conversionRate = analytics.totalUsers > 0 
    ? ((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)
    : '0.0';
  const completionRate = analytics.totalUsers > 0
    ? ((analytics.completedProfiles / analytics.totalUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <Link href="/dashboard/admin" className="text-text-muted hover:text-text-body">
              <Icon name="ChevronLeft" className="h-6 w-6" />
            </Link>
            <PageHeader 
              title="User Management" 
              subtitle="User analytics, engagement metrics, and account management"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            <AnimatedCard className="bg-card border border-border p-6">
              <div className="text-text-muted text-sm font-semibold mb-2">Total Users</div>
              <div className="text-3xl font-black text-text-headings">{analytics.totalUsers}</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={25}>
              <div className="text-text-muted text-sm font-semibold mb-2">Premium</div>
              <div className="text-3xl font-black text-green-600">{analytics.premiumUsers}</div>
              <div className="text-xs text-text-muted mt-1">{conversionRate}% conversion</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={50}>
              <div className="text-text-muted text-sm font-semibold mb-2">With Plans</div>
              <div className="text-3xl font-black text-blue-600">{analytics.usersWithPlans}</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={75}>
              <div className="text-text-muted text-sm font-semibold mb-2">Profile Complete</div>
              <div className="text-3xl font-black text-purple-600">{analytics.completedProfiles}</div>
              <div className="text-xs text-text-muted mt-1">{completionRate}% rate</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={100}>
              <div className="text-text-muted text-sm font-semibold mb-2">New (7d)</div>
              <div className="text-3xl font-black text-amber-600">{analytics.recentSignups}</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={125}>
              <div className="text-text-muted text-sm font-semibold mb-2">Active (30d)</div>
              <div className="text-3xl font-black text-cyan-600">{analytics.activeUsers}</div>
            </AnimatedCard>
          </div>

          {/* Recent Users */}
          <AnimatedCard className="bg-card border border-border p-6" delay={150}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">Recent Signups</h2>
            {analytics.recentUsers.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Icon name="Users" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent signups</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 text-sm font-semibold text-text-muted">User ID</th>
                      <th className="pb-3 text-sm font-semibold text-text-muted">Rank</th>
                      <th className="pb-3 text-sm font-semibold text-text-muted">Branch</th>
                      <th className="pb-3 text-sm font-semibold text-text-muted">Profile</th>
                      <th className="pb-3 text-sm font-semibold text-text-muted">Plans</th>
                      <th className="pb-3 text-sm font-semibold text-text-muted">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentUsers.map((u) => (
                      <tr key={u.user_id} className="border-b border-border hover:bg-gray-50">
                        <td className="py-3 text-sm font-mono text-text-body">
                          {u.user_id.substring(0, 12)}...
                        </td>
                        <td className="py-3 text-sm text-text-body">{u.rank || '-'}</td>
                        <td className="py-3 text-sm text-text-body">{u.branch || '-'}</td>
                        <td className="py-3">
                          {u.profile_completed ? (
                            <Badge variant="success">Complete</Badge>
                          ) : (
                            <Badge variant="secondary">Incomplete</Badge>
                          )}
                        </td>
                        <td className="py-3 text-sm font-semibold text-text-body">
                          {u.plan_generated_count || 0}
                        </td>
                        <td className="py-3 text-sm text-text-muted">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatedCard>

          {/* Admin SQL Queries */}
          <AnimatedCard className="bg-card border border-border p-6 mt-8" delay={200}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-4">Useful SQL Queries</h2>
            <p className="text-text-body mb-6">
              Run these in Supabase SQL Editor for detailed analytics
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-border">
                <div className="font-semibold text-text-headings mb-2 flex items-center gap-2">
                  <Icon name="TrendingUp" className="h-4 w-4" />
                  User Growth by Month
                </div>
                <pre className="text-xs bg-white p-3 rounded border border-border overflow-x-auto">
{`SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users
FROM user_profiles
GROUP BY month
ORDER BY month DESC
LIMIT 12;`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-border">
                <div className="font-semibold text-text-headings mb-2 flex items-center gap-2">
                  <Icon name="DollarSign" className="h-4 w-4" />
                  Premium Conversion Funnel
                </div>
                <pre className="text-xs bg-white p-3 rounded border border-border overflow-x-auto">
{`SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN profile_completed THEN 1 ELSE 0 END) as completed_profile,
  (SELECT COUNT(*) FROM user_plans) as generated_plans,
  (SELECT COUNT(*) FROM entitlements WHERE tier = 'premium') as premium_users
FROM user_profiles;`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-border">
                <div className="font-semibold text-text-headings mb-2 flex items-center gap-2">
                  <Icon name="Activity" className="h-4 w-4" />
                  Most Engaged Users
                </div>
                <pre className="text-xs bg-white p-3 rounded border border-border overflow-x-auto">
{`SELECT 
  up.user_id,
  up.rank,
  up.branch,
  COUNT(p.user_id) as plan_count
FROM user_profiles up
LEFT JOIN user_plans p ON up.user_id = p.user_id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
GROUP BY up.user_id, up.rank, up.branch
ORDER BY plan_count DESC
LIMIT 20;`}
                </pre>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

