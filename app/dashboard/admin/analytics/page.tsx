import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

interface AtRiskUser {
  user_id: string;
  churn_risk_score: number;
  last_login_at: string | null;
  days_since_login: number;
  total_logins: number;
  total_plans_generated: number;
}

interface LTVMetrics {
  total_users: number;
  avg_ltv_cents: number;
  avg_lifetime_days: number;
  total_revenue_cents: number;
}

async function getAnalyticsData() {
  // Get at-risk users
  const { data: atRiskData } = await supabaseAdmin
    .rpc('get_at_risk_users', { p_risk_threshold: 60, p_limit: 20 });
  
  // Get LTV metrics
  const { data: ltvData } = await supabaseAdmin.rpc('get_average_ltv');
  
  // Get current month churn
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const { data: churnData } = await supabaseAdmin
    .rpc('get_monthly_churn_rate', { p_month: currentMonth });
  
  return {
    atRiskUsers: (atRiskData || []) as AtRiskUser[],
    ltvMetrics: ltvData?.[0] as LTVMetrics || null,
    churnRate: churnData?.[0] || null,
  };
}

export default async function AnalyticsAdminPage() {
  const user = await currentUser();
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const { atRiskUsers, ltvMetrics, churnRate } = await getAnalyticsData();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface-hover dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="TrendingUp" className="h-8 w-8 text-info dark:text-info" />
              <h1 className="text-4xl font-bold text-primary dark:text-white font-serif">
                Churn & LTV Analytics
              </h1>
            </div>
            <p className="text-body dark:text-muted">
              Business intelligence for user retention and lifetime value
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard delay={0}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-body dark:text-muted">Avg LTV</span>
                  <Icon name="DollarSign" className="h-5 w-5 text-success dark:text-green-400" />
                </div>
                <div className="text-3xl font-black text-primary dark:text-white">
                  ${ltvMetrics ? (ltvMetrics.avg_ltv_cents / 100).toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-muted dark:text-muted mt-1">
                  Per paying customer
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={50}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-body dark:text-muted">Avg Lifetime</span>
                  <Icon name="Timer" className="h-5 w-5 text-info dark:text-info" />
                </div>
                <div className="text-3xl font-black text-primary dark:text-white">
                  {ltvMetrics ? Math.round(ltvMetrics.avg_lifetime_days) : 0}
                </div>
                <div className="text-xs text-muted dark:text-muted mt-1">
                  Days active
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-body dark:text-muted">Monthly Churn</span>
                  <Icon name="TrendingDown" className="h-5 w-5 text-danger dark:text-red-400" />
                </div>
                <div className="text-3xl font-black text-primary dark:text-white">
                  {churnRate ? churnRate.churn_rate : 0}%
                </div>
                <div className="text-xs text-muted dark:text-muted mt-1">
                  {churnRate ? churnRate.churned : 0} / {churnRate ? churnRate.active_start : 0} users
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={150}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-body dark:text-muted">At Risk</span>
                  <Icon name="AlertCircle" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-3xl font-black text-primary dark:text-white">
                  {atRiskUsers.length}
                </div>
                <div className="text-xs text-muted dark:text-muted mt-1">
                  Churn risk ≥ 60%
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* At-Risk Users Table */}
          <AnimatedCard delay={200}>
            <div className="bg-surface dark:bg-slate-800 rounded-xl border border-subtle dark:border-slate-600 overflow-hidden">
              <div className="p-6 border-b border-subtle dark:border-slate-700">
                <h2 className="text-2xl font-bold text-primary dark:text-white flex items-center gap-2">
                  <Icon name="AlertCircle" className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  At-Risk Users (Churn Risk ≥ 60%)
                </h2>
                <p className="text-sm text-body dark:text-muted mt-1">
                  Users who haven&apos;t engaged recently - consider re-engagement campaigns
                </p>
              </div>
              
              {atRiskUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Icon name="CheckCircle" className="h-16 w-16 text-success dark:text-green-400 mx-auto mb-4" />
                  <p className="text-body dark:text-muted text-lg">
                    No at-risk users! Great retention 🎉
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-hover dark:bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">Risk Score</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">Days Inactive</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">Logins</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">Plans</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-body dark:text-muted uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {atRiskUsers.map((riskUser) => (
                        <tr key={riskUser.user_id} className="hover:bg-surface-hover dark:hover:bg-slate-700">
                          <td className="px-6 py-4 text-sm text-primary dark:text-white font-mono">
                            {riskUser.user_id.slice(0, 12)}...
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                riskUser.churn_risk_score >= 80
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : riskUser.churn_risk_score >= 60
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              }`}>
                                {riskUser.churn_risk_score}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-body dark:text-muted">
                            {riskUser.last_login_at 
                              ? new Date(riskUser.last_login_at).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="px-6 py-4 text-sm text-body dark:text-muted">
                            {riskUser.days_since_login} days
                          </td>
                          <td className="px-6 py-4 text-sm text-body dark:text-muted">
                            {riskUser.total_logins}
                          </td>
                          <td className="px-6 py-4 text-sm text-body dark:text-muted">
                            {riskUser.total_plans_generated}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-info dark:text-info hover:underline text-sm font-semibold">
                              Send Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard delay={250}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <Icon name="Mail" className="h-8 w-8 text-info dark:text-info mb-4" />
                <h3 className="text-lg font-bold text-primary dark:text-white mb-2">
                  Re-Engagement Campaign
                </h3>
                <p className="text-sm text-body dark:text-muted mb-4">
                  Send email to {atRiskUsers.length} at-risk users
                </p>
                <button className="w-full bg-info hover:bg-info dark:bg-info dark:hover:bg-info text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Launch Campaign
                </button>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={300}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <Icon name="Download" className="h-8 w-8 text-success dark:text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-primary dark:text-white mb-2">
                  Export Analytics
                </h3>
                <p className="text-sm text-body dark:text-muted mb-4">
                  Download CSV of all user metrics
                </p>
                <button className="w-full bg-success hover:bg-success dark:bg-success dark:hover:bg-success text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Export Data
                </button>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={350}>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-subtle dark:border-slate-600">
                <Icon name="RefreshCw" className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-primary dark:text-white mb-2">
                  Recalculate Risk Scores
                </h3>
                <p className="text-sm text-body dark:text-muted mb-4">
                  Run churn risk calculation for all users
                </p>
                <button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Recalculate All
                </button>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

