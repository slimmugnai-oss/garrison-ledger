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

export const metadata: Metadata = {
  title: "Admin Dashboard - Garrison Ledger",
  description: "Site administration, monitoring, and optimization tools",
  robots: { index: false, follow: false },
};

// Admin user IDs (add your Clerk user ID here)
const ADMIN_USER_IDS = [
  'user_343xVqjkdILtBkaYAJfE5H8Wq0q', // slimmugnai@gmail.com
  // Add more admin IDs as needed
];

async function getSystemMetrics() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

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

  // Pro users (active WITH Stripe subscription - real paid users only)
  const { count: proUsers } = await supabase
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

  // New signups (last 30 days)
  const { count: newSignups30d } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo);

  // === CONVERSION METRICS ===

  // Users who completed profile
  const { count: profilesCompleted } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .not('rank', 'is', null)
    .not('branch', 'is', null);

  // Users who completed assessment
  const { count: assessmentsCompleted } = await supabase
    .from('user_assessments')
    .select('*', { count: 'exact', head: true })
    .eq('completed', true);

  // Users who generated a plan
  const { count: plansGenerated } = await supabase
    .from('user_plans')
    .select('*', { count: 'exact', head: true });

  // Plans generated today
  const { count: plansToday } = await supabase
    .from('user_plans')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  // Plans last 7 days
  const { count: plans7d } = await supabase
    .from('user_plans')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  // === TOOL USAGE ===

  // Tool calculations (last 30 days)
  const { count: toolCalcs30d } = await supabase
    .from('user_activity')
    .select('*', { count: 'exact', head: true })
    .eq('activity_type', 'tool_calculation')
    .gte('created_at', thirtyDaysAgo);

  // Binder uploads (total)
  const { count: binderUploads } = await supabase
    .from('binder_files')
    .select('*', { count: 'exact', head: true });

  // === ENGAGEMENT METRICS ===

  // Users with streaks > 0
  const { count: activeStreaks } = await supabase
    .from('user_gamification')
    .select('*', { count: 'exact', head: true })
    .gt('current_streak', 0);

  // Average streak (from top 10 users)
  const { data: topStreaks } = await supabase
    .from('user_gamification')
    .select('current_streak')
    .order('current_streak', { ascending: false })
    .limit(10);

  const avgTopStreak = topStreaks && topStreaks.length > 0
    ? Math.round(topStreaks.reduce((sum, u) => sum + (u.current_streak || 0), 0) / topStreaks.length)
    : 0;

  // === SUPPORT & CONTENT ===

  // Contact submissions (new)
  const { count: newTickets } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  // Feed items (new)
  const { count: feedItems } = await supabase
    .from('feed_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  // Content blocks (total)
  const { count: contentBlocks } = await supabase
    .from('content_blocks')
    .select('*', { count: 'exact', head: true });

  // === REVENUE METRICS ===

  const paidUsers = (premiumUsers || 0) + (proUsers || 0);
  const mrr = ((premiumUsers || 0) * 9.99) + ((proUsers || 0) * 24.99);
  const arr = mrr * 12;

  // Conversion rate (paid / total)
  const conversionRate = totalUsers && totalUsers > 0
    ? ((paidUsers / totalUsers) * 100).toFixed(1)
    : '0.0';

  // Activation rate (completed profile / total)
  const activationRate = totalUsers && totalUsers > 0
    ? ((profilesCompleted || 0) / totalUsers * 100).toFixed(1)
    : '0.0';

  return {
    // User counts
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
    proUsers: proUsers || 0,
    freeUsers: (totalUsers || 0) - paidUsers,
    paidUsers,
    newSignups7d: newSignups7d || 0,
    newSignups30d: newSignups30d || 0,

    // Funnel metrics
    profilesCompleted: profilesCompleted || 0,
    assessmentsCompleted: assessmentsCompleted || 0,
    plansGenerated: plansGenerated || 0,
    plansToday: plansToday || 0,
    plans7d: plans7d || 0,

    // Engagement
    toolCalcs30d: toolCalcs30d || 0,
    binderUploads: binderUploads || 0,
    activeStreaks: activeStreaks || 0,
    avgTopStreak,

    // Support & content
    newTickets: newTickets || 0,
    feedItems: feedItems || 0,
    contentBlocks: contentBlocks || 0,

    // Revenue
    mrr: mrr.toFixed(2),
    arr: arr.toFixed(0),
    conversionRate,
    activationRate,
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

  const metrics = await getSystemMetrics();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Shield" className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-serif font-black text-text-headings">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-text-body text-lg">
              System monitoring, content management, and optimization tools
            </p>
          </div>

          {/* === WEBSITE ANALYTICS === */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">📊 Website Analytics</h2>
            
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <AnimatedCard className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-700 text-sm font-semibold uppercase tracking-wide">MRR</span>
                  <Icon name="DollarSign" className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-900">${metrics.mrr}</div>
                <div className="text-sm text-emerald-700 mt-1">
                  ${metrics.arr} ARR
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6" delay={50}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 text-sm font-semibold uppercase tracking-wide">Paid Users</span>
                  <Icon name="TrendingUp" className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-blue-900">{metrics.paidUsers}</div>
                <div className="text-sm text-blue-700 mt-1">
                  {metrics.premiumUsers} Premium, {metrics.proUsers} Pro
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6" delay={100}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-700 text-sm font-semibold uppercase tracking-wide">Conversion Rate</span>
                  <Icon name="Target" className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-3xl font-black text-purple-900">{metrics.conversionRate}%</div>
                <div className="text-sm text-purple-700 mt-1">
                  Paid / Total Users
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 p-6" delay={150}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-700 text-sm font-semibold uppercase tracking-wide">Activation Rate</span>
                  <Icon name="CheckCircle" className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-amber-900">{metrics.activationRate}%</div>
                <div className="text-sm text-amber-700 mt-1">
                  Completed Profiles
                </div>
              </AnimatedCard>
            </div>

            {/* User Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <AnimatedCard className="bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Total Users</span>
                  <Icon name="Users" className="h-5 w-5 text-info" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.totalUsers}</div>
                <div className="text-sm text-text-muted mt-1">
                  {metrics.freeUsers} free users
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-card border border-border p-6" delay={50}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">New Signups (7d)</span>
                  <Icon name="UserPlus" className="h-5 w-5 text-success" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.newSignups7d}</div>
                <div className="text-sm text-text-muted mt-1">
                  {metrics.newSignups30d} in last 30 days
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-card border border-border p-6" delay={100}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Profiles Completed</span>
                  <Icon name="CheckCircle" className="h-5 w-5 text-info" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.profilesCompleted}</div>
                <div className="text-sm text-text-muted mt-1">
                  {metrics.assessmentsCompleted} assessments
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-card border border-border p-6" delay={150}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Plans Generated</span>
                  <Icon name="Sparkles" className="h-5 w-5 text-success" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.plansGenerated}</div>
                <div className="text-sm text-text-muted mt-1">
                  {metrics.plans7d} in last 7 days
                </div>
              </AnimatedCard>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedCard className="bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Tool Calculations</span>
                  <Icon name="Calculator" className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.toolCalcs30d}</div>
                <div className="text-sm text-text-muted mt-1">
                  Last 30 days
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-card border border-border p-6" delay={50}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Binder Uploads</span>
                  <Icon name="FolderOpen" className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.binderUploads}</div>
                <div className="text-sm text-text-muted mt-1">
                  Total files uploaded
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-card border border-border p-6" delay={100}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Active Streaks</span>
                  <Icon name="TrendingUp" className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.activeStreaks}</div>
                <div className="text-sm text-text-muted mt-1">
                  Avg top 10: {metrics.avgTopStreak} days
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-card border border-border p-6" delay={150}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm font-semibold">Support Tickets</span>
                  <Icon name="MessageSquare" className="h-5 w-5 text-info" />
                </div>
                <div className="text-3xl font-black text-text-headings">{metrics.newTickets}</div>
                <div className="text-sm text-text-muted mt-1">
                  Requires attention
                </div>
              </AnimatedCard>
            </div>
          </div>

          {/* === ADMIN TOOLS === */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">🛠️ Admin Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Health */}
            <AnimatedCard className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:shadow-xl transition-all">
              <Link href="/dashboard/admin/health" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                    <Icon name="Activity" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="success">100/100</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">System Health</h3>
                <p className="text-text-body">
                  Monitor performance, errors, and Core Web Vitals
                </p>
              </Link>
            </AnimatedCard>

            {/* Content Management */}
            <AnimatedCard className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:shadow-xl transition-all" delay={50}>
              <Link href="/dashboard/admin/briefing" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Icon name="BookOpen" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="warning">{metrics.feedItems} new</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">Content Curation</h3>
                <p className="text-text-body">
                  Manage Listening Post and content blocks
                </p>
              </Link>
            </AnimatedCard>

            {/* User Management */}
            <AnimatedCard className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-success hover:shadow-xl transition-all" delay={100}>
              <Link href="/dashboard/admin/users" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                    <Icon name="Users" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="primary">{metrics.totalUsers} users</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">User Management</h3>
                <p className="text-text-body">
                  View users, analytics, and engagement metrics
                </p>
              </Link>
            </AnimatedCard>

            {/* Support Tickets */}
            <AnimatedCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:shadow-xl transition-all" delay={150}>
              <Link href="/dashboard/admin/support" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                    <Icon name="MessageSquare" className="h-6 w-6 text-white" />
                  </div>
                  {metrics.newTickets > 0 && (
                    <Badge variant="warning">{metrics.newTickets} new</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">Support Tickets</h3>
                <p className="text-text-body">
                  Manage contact submissions and user support
                </p>
              </Link>
            </AnimatedCard>

            {/* Email Leads */}
            <AnimatedCard className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 hover:shadow-xl transition-all" delay={200}>
              <Link href="/dashboard/admin/leads" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                    <Icon name="Mail" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="success">NEW</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">Email Leads</h3>
                <p className="text-text-body">
                  Track exit-intent captures and lead magnets
                </p>
              </Link>
            </AnimatedCard>

            {/* Engagement Analytics */}
            <AnimatedCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:shadow-xl transition-all" delay={250}>
              <Link href="/dashboard/admin/engagement" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <Icon name="TrendingUp" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="success">NEW</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">User Engagement</h3>
                <p className="text-text-body">
                  Gamification analytics and streak leaderboards
                </p>
              </Link>
            </AnimatedCard>

            {/* Revenue Dashboard */}
            <AnimatedCard className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:shadow-xl transition-all" delay={300}>
              <Link href="/dashboard/admin/revenue" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Icon name="DollarSign" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="success">NEW</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">Revenue Dashboard</h3>
                <p className="text-text-body">
                  MRR tracking, conversion rates, and projections
                </p>
              </Link>
            </AnimatedCard>

            {/* Email Campaigns */}
            <AnimatedCard className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:shadow-xl transition-all" delay={350}>
              <Link href="/dashboard/admin/campaigns" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center">
                    <Icon name="Send" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="success">NEW</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">Email Campaigns</h3>
                <p className="text-text-body">
                  Manage automated sequences and send campaigns
                </p>
              </Link>
            </AnimatedCard>

            {/* Provider Directory */}
            <AnimatedCard className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:shadow-xl transition-all" delay={400}>
              <Link href="/dashboard/admin/providers" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                    <Icon name="Briefcase" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">Directory</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">Provider Management</h3>
                <p className="text-text-body">
                  Manage provider directory and referrals
                </p>
              </Link>
            </AnimatedCard>

            {/* AI Monitoring */}
            <AnimatedCard className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 hover:shadow-xl transition-all" delay={450}>
              <Link href="/dashboard/admin/ai-monitoring" className="block p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center">
                    <Icon name="Zap" className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="primary">AI Stats</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-headings mb-2">AI Monitoring</h3>
                <p className="text-text-body">
                  Track AI usage, costs, and performance
                </p>
              </Link>
            </AnimatedCard>
            </div>
          </div>

          {/* === QUICK LINKS === */}
          <div>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all flex items-center gap-3"
              >
                <Icon name="Globe" className="h-5 w-5 text-text-muted" />
                <span className="text-sm font-semibold text-text-body">Vercel</span>
              </a>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all flex items-center gap-3"
              >
                <Icon name="Database" className="h-5 w-5 text-text-muted" />
                <span className="text-sm font-semibold text-text-body">Supabase</span>
              </a>
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all flex items-center gap-3"
              >
                <Icon name="Key" className="h-5 w-5 text-text-muted" />
                <span className="text-sm font-semibold text-text-body">Clerk</span>
              </a>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all flex items-center gap-3"
              >
                <Icon name="CreditCard" className="h-5 w-5 text-text-muted" />
                <span className="text-sm font-semibold text-text-body">Stripe</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

