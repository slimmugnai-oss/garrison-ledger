import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from "next";
import Link from 'next/link';
import { redirect } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Badge from '@/app/components/ui/Badge';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';

export const metadata: Metadata = {
  title: "AI Monitoring - Admin Dashboard",
  description: "Track AI usage, costs, and performance metrics",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

async function getAIMetrics() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Plans system removed - set to 0
  const plansToday = 0;
  const plansThisMonth = 0;
  const totalPlans = 0;

  // Feed items curated (all time)
  const { count: curatedItems } = await supabase
    .from('content_blocks')
    .select('*', { count: 'exact', head: true });

  return {
    plansToday: plansToday || 0,
    plansThisMonth: plansThisMonth || 0,
    totalPlans: totalPlans || 0,
    curatedItems: curatedItems || 0,
  };
}

export default async function AIMonitoringPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const metrics = await getAIMetrics();

  // Calculate costs
  const costToday = metrics.plansToday * 0.02;
  const costThisMonth = metrics.plansThisMonth * 0.02;
  const costAllTime = metrics.totalPlans * 0.02;
  const curationCost = metrics.curatedItems * 0.001;

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
              title="AI Monitoring" 
              subtitle="Track AI usage, costs, and performance metrics"
            />
          </div>

          {/* AI Cost Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <AnimatedCard className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon name="DollarSign" className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-white/90">Total AI Costs (All Time)</div>
              </div>
              <div className="text-5xl font-black mb-2">${(costAllTime + curationCost).toFixed(2)}</div>
              <div className="text-white/90">
                Plans: ${costAllTime.toFixed(2)} + Curation: ${curationCost.toFixed(2)}
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white" delay={50}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon name="TrendingUp" className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-white/90">This Month</div>
              </div>
              <div className="text-5xl font-black mb-2">${costThisMonth.toFixed(2)}</div>
              <div className="text-white/90">
                {metrics.plansThisMonth} plans × $0.02 each
              </div>
            </AnimatedCard>
          </div>

          {/* Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="bg-card border border-border p-6" delay={100}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Zap" className="h-5 w-5 text-info" />
                <span className="text-text-muted text-sm font-semibold">Plans Today</span>
              </div>
              <div className="text-3xl font-black text-text-headings">{metrics.plansToday}</div>
              <div className="text-sm text-text-muted mt-1">${costToday.toFixed(2)} cost</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={125}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Calendar" className="h-5 w-5 text-success" />
                <span className="text-text-muted text-sm font-semibold">Plans This Month</span>
              </div>
              <div className="text-3xl font-black text-text-headings">{metrics.plansThisMonth}</div>
              <div className="text-sm text-text-muted mt-1">${costThisMonth.toFixed(2)} cost</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={150}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Globe" className="h-5 w-5 text-purple-600" />
                <span className="text-text-muted text-sm font-semibold">Total Plans</span>
              </div>
              <div className="text-3xl font-black text-text-headings">{metrics.totalPlans}</div>
              <div className="text-sm text-text-muted mt-1">${costAllTime.toFixed(2)} total</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={175}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" className="h-5 w-5 text-amber-600" />
                <span className="text-text-muted text-sm font-semibold">Avg Cost/Plan</span>
              </div>
              <div className="text-3xl font-black text-text-headings">$0.02</div>
              <div className="text-sm text-text-muted mt-1">GPT-4o-mini</div>
            </AnimatedCard>
          </div>

          {/* AI Models */}
          <AnimatedCard className="bg-card border border-border p-6 mb-8" delay={200}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">AI Models in Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-info-subtle rounded-lg flex items-center justify-center">
                    <Icon name="Brain" className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <div className="font-bold text-text-headings">GPT-4o-mini</div>
                    <div className="text-xs text-text-muted">Plan Generation</div>
                  </div>
                </div>
                <div className="text-sm text-text-body space-y-1">
                  <div>• Two-phase: Curator + Weaver</div>
                  <div>• ~$0.02 per plan</div>
                  <div>• 20-30 second generation</div>
                  <div>• 187 blocks analyzed</div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="Sparkles" className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-text-headings">Gemini 2.0 Flash</div>
                    <div className="text-xs text-text-muted">Content Curation</div>
                  </div>
                </div>
                <div className="text-sm text-text-body space-y-1">
                  <div>• Auto-curate feed items</div>
                  <div>• ~$0.001 per item</div>
                  <div>• 5-10 second processing</div>
                  <div>• Full metadata enrichment</div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-success-subtle rounded-lg flex items-center justify-center">
                    <Icon name="MessageSquare" className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-bold text-text-headings">GPT-4o-mini</div>
                    <div className="text-xs text-text-muted">AI Explainer</div>
                  </div>
                </div>
                <div className="text-sm text-text-body space-y-1">
                  <div>• Calculator explanations</div>
                  <div>• ~$0.01 per explanation</div>
                  <div>• 2-3 second generation</div>
                  <div>• Preview mode for free</div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Cost Optimization Tips */}
          <AnimatedCard className="bg-card border border-border p-6" delay={250}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-4">Cost Optimization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-text-headings mb-3 flex items-center gap-2">
                  <Icon name="CheckCircle2" className="h-5 w-5 text-success" />
                  Currently Implemented
                </h3>
                <ul className="space-y-2 text-sm text-text-body">
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">✓</span>
                    Using GPT-4o-mini (87% cheaper than GPT-4)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">✓</span>
                    Pre-filtering to top 187 blocks (token efficiency)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">✓</span>
                    Rate limiting (1/week free, 3/day premium)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">✓</span>
                    Gemini for curation (99% cheaper than GPT-4)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">✓</span>
                    Storing plans (no re-generation needed)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-text-headings mb-3 flex items-center gap-2">
                  <Icon name="Lightbulb" className="h-5 w-5 text-amber-600" />
                  Future Optimizations
                </h3>
                <ul className="space-y-2 text-sm text-text-body">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    Cache common plan variations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    Batch process multiple plans
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    Use embeddings for faster matching
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    A/B test prompt optimization
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedCard>

          {/* Budget Tracking */}
          <AnimatedCard className="bg-card border border-border p-6 mt-8" delay={300}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">Budget Tracking</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-text-headings">Today&apos;s AI Costs</div>
                  <div className="text-sm text-text-muted">{metrics.plansToday} plans generated</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-info">${costToday.toFixed(2)}</div>
                  <div className="text-xs text-text-muted">Target: &lt; $2.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-text-headings">This Month&apos;s AI Costs</div>
                  <div className="text-sm text-text-muted">{metrics.plansThisMonth} plans generated</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-success">${costThisMonth.toFixed(2)}</div>
                  <div className="text-xs text-text-muted">Target: &lt; $50.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-text-headings">All-Time AI Investment</div>
                  <div className="text-sm text-text-muted">{metrics.totalPlans} plans + {metrics.curatedItems} curated</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-purple-600">${(costAllTime + curationCost).toFixed(2)}</div>
                  <div className="text-xs text-text-muted">Lifetime value</div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* SQL Queries for AI Analytics */}
          <AnimatedCard className="bg-card border border-border p-6 mt-8" delay={350}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-4">Analytics Queries</h2>
            <p className="text-text-body mb-6">
              Run these in Supabase SQL Editor for detailed AI usage analytics
            </p>
            <div className="space-y-4">
              <div className="bg-surface-hover p-4 rounded-lg border border-border">
                <div className="font-semibold text-text-headings mb-2">Daily Plan Generation Trend</div>
                <pre className="text-xs bg-surface p-3 rounded border border-border overflow-x-auto">
{`SELECT 
  DATE(created_at) as date,
  COUNT(*) as plans,
  COUNT(*) * 0.02 as cost_usd
-- Plans system removed - no data available
SELECT 'No plans system' as message;`}
                </pre>
              </div>

              <div className="bg-surface-hover p-4 rounded-lg border border-border">
                <div className="font-semibold text-text-headings mb-2">Top AI Users (Check for Abuse)</div>
                <pre className="text-xs bg-surface p-3 rounded border border-border overflow-x-auto">
{`SELECT 
  user_id,
  COUNT(*) as plan_count,
  COUNT(*) * 0.02 as cost_per_user
-- Plans system removed - no data available
SELECT 'No plans system' as message;`}
                </pre>
              </div>

              <div className="bg-surface-hover p-4 rounded-lg border border-border">
                <div className="font-semibold text-text-headings mb-2">Monthly AI Cost Projection</div>
                <pre className="text-xs bg-surface p-3 rounded border border-border overflow-x-auto">
{`SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as plans,
  COUNT(*) * 0.02 as total_cost
-- Plans system removed - no cost data available
SELECT 'No plans system' as message;`}
                </pre>
              </div>
            </div>
          </AnimatedCard>

          {/* Alerts */}
          <AnimatedCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-6 mt-8" delay={400}>
            <h3 className="text-xl font-bold text-text-headings mb-4 flex items-center gap-2">
              <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
              Cost Alert Thresholds
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-body">Daily cost &gt; $10.00</span>
                <Badge variant="warning">Alert</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-body">Monthly cost &gt; $100.00</span>
                <Badge variant="warning">Critical Alert</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-body">Single user &gt; 10 plans/week</span>
                <Badge variant="warning">Potential Abuse</Badge>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

