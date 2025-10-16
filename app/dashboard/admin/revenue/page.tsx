import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

export const metadata: Metadata = {
  title: "Revenue Dashboard - Admin",
  description: "MRR tracking, conversion rates, and growth metrics",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

async function getRevenueMetrics() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  // Premium users (active subscriptions)
  const { count: premiumUsers } = await supabase
    .from('entitlements')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'premium')
    .eq('status', 'active');

  // New users this month
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const { count: newUsersThisMonth } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstOfMonth.toISOString());

  // New premium this month
  const { count: newPremiumThisMonth } = await supabase
    .from('entitlements')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'premium')
    .eq('status', 'active')
    .gte('created_at', firstOfMonth.toISOString());

  // Calculate metrics
  const conversionRate = totalUsers && totalUsers > 0
    ? ((premiumUsers || 0) / totalUsers * 100).toFixed(2)
    : '0.00';

  const mrr = (premiumUsers || 0) * 9.99;
  const arr = mrr * 12;

  // Projected growth (conservative)
  const projectedMRR = mrr + ((newPremiumThisMonth || 0) * 9.99);
  const projectedARR = projectedMRR * 12;

  return {
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    newPremiumThisMonth: newPremiumThisMonth || 0,
    conversionRate: parseFloat(conversionRate),
    mrr,
    arr,
    projectedMRR,
    projectedARR,
    avgRevenuePerUser: totalUsers && totalUsers > 0 ? (mrr / totalUsers).toFixed(2) : '0.00'
  };
}

export default async function AdminRevenuePage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const metrics = await getRevenueMetrics();

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
              title="Revenue Dashboard" 
              subtitle="MRR tracking, conversion funnel, and growth projections"
            />
          </div>

          {/* Primary Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard delay={0} className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <Icon name="DollarSign" className="h-12 w-12" />
                <div className="text-right">
                  <div className="text-sm opacity-90 mb-1">Monthly Recurring Revenue</div>
                  <div className="text-4xl font-black">${metrics.mrr.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-sm opacity-90">
                {metrics.premiumUsers} active premium × $9.99/month
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <Icon name="TrendingUp" className="h-12 w-12" />
                <div className="text-right">
                  <div className="text-sm opacity-90 mb-1">Annual Recurring Revenue</div>
                  <div className="text-4xl font-black">${metrics.arr.toFixed(0)}</div>
                </div>
              </div>
              <div className="text-sm opacity-90">
                MRR × 12 months
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200} className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <Icon name="Target" className="h-12 w-12" />
                <div className="text-right">
                  <div className="text-sm opacity-90 mb-1">Conversion Rate</div>
                  <div className="text-4xl font-black">{metrics.conversionRate}%</div>
                </div>
              </div>
              <div className="text-sm opacity-90">
                {metrics.premiumUsers} of {metrics.totalUsers} users
              </div>
            </AnimatedCard>
          </div>

          {/* Conversion Funnel */}
          <AnimatedCard delay={300} className="mb-8">
            <h2 className="text-2xl font-bold text-text-headings mb-6">Conversion Funnel</h2>
            <div className="space-y-4">
              {/* Total Users */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-body">Total Users</span>
                  <span className="text-lg font-black text-primary">{metrics.totalUsers}</span>
                </div>
                <div className="w-full bg-surface-hover rounded-full h-3">
                  <div className="bg-info h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Premium Conversion */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-body">Premium Users</span>
                  <span className="text-lg font-black text-success">{metrics.premiumUsers}</span>
                </div>
                <div className="w-full bg-surface-hover rounded-full h-3">
                  <div 
                    className="bg-success h-3 rounded-full transition-all" 
                    style={{ width: `${metrics.conversionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted mt-1">{metrics.conversionRate}% conversion rate</div>
              </div>
            </div>

            {/* Conversion Target */}
            <div className="mt-6 p-4 bg-info-subtle border-2 border-info rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Target" className="h-5 w-5 text-info" />
                <h3 className="font-bold text-primary">Conversion Goals</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-body">Current</div>
                  <div className="text-xl font-black text-info">{metrics.conversionRate}%</div>
                </div>
                <div>
                  <div className="text-body">Target</div>
                  <div className="text-xl font-black text-success">8-10%</div>
                </div>
                <div>
                  <div className="text-body">Gap</div>
                  <div className="text-xl font-black text-orange-600">
                    {(8 - metrics.conversionRate).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-body">Potential MRR</div>
                  <div className="text-xl font-black text-purple-600">
                    ${((metrics.totalUsers * 0.08 * 9.99) - metrics.mrr).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AnimatedCard delay={400}>
              <h3 className="text-xl font-bold text-text-headings mb-4">This Month&apos;s Growth</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-info-subtle rounded-lg">
                  <span className="text-sm font-semibold text-body">New Users</span>
                  <span className="text-2xl font-black text-info">+{metrics.newUsersThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-success-subtle rounded-lg">
                  <span className="text-sm font-semibold text-body">New Premium</span>
                  <span className="text-2xl font-black text-success">+{metrics.newPremiumThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-sm font-semibold text-body">MRR Growth</span>
                  <span className="text-2xl font-black text-purple-600">
                    +${(metrics.newPremiumThisMonth * 9.99).toFixed(2)}
                  </span>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={500}>
              <h3 className="text-xl font-bold text-text-headings mb-4">12-Month Projection</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-info rounded-lg">
                  <div className="text-sm text-body mb-1">If growth continues...</div>
                  <div className="text-3xl font-black text-info">
                    ${(metrics.projectedMRR * 12).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted">ARR in 12 months</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-success rounded-lg">
                  <div className="text-sm text-body mb-1">With 8% conversion...</div>
                  <div className="text-3xl font-black text-success">
                    ${((metrics.totalUsers * 3) * 0.08 * 9.99 * 12).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted">Potential ARR (3x users)</div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Key Insights */}
          <AnimatedCard delay={600} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="Lightbulb" className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-bold text-primary">Revenue Insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-primary mb-2">Current Performance</h4>
                <ul className="space-y-2 text-sm text-body">
                  <li className="flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>Current MRR: <strong>${metrics.mrr.toFixed(2)}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>ARPU: <strong>${metrics.avgRevenuePerUser}</strong> per user</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>Conversion: <strong>{metrics.conversionRate}%</strong> (target: 8-10%)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Growth Opportunities</h4>
                <ul className="space-y-2 text-sm text-body">
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>Reaching 8% conversion = <strong>+${((metrics.totalUsers * 0.08 * 9.99) - metrics.mrr).toFixed(0)} MRR</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>100 more users = <strong>+$80 MRR</strong> (8% conversion)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>1,000 users at 8% = <strong>$799 MRR</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

