import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AnimatedCard from '../components/ui/AnimatedCard';
import { generatePageMeta } from "@/lib/seo-config";
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';
import UpcomingExpirations from '../components/dashboard/UpcomingExpirations';
import IntelligenceWidget from '../components/dashboard/IntelligenceWidget';
import OnboardingTour from '../components/dashboard/OnboardingTour';
import StreakTracker from '../components/dashboard/StreakTracker';
import DailyTip from '../components/dashboard/DailyTip';
import FinancialReadinessScore from '../components/dashboard/FinancialReadinessScore';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import SavedItems from '../components/dashboard/SavedItems';
import BinderPreview from '../components/dashboard/BinderPreview';
import QuickActions from '../components/dashboard/QuickActions';
import MissionStatusTracker from '../components/dashboard/MissionStatusTracker';
import ContextualNextSteps from '../components/dashboard/ContextualNextSteps';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import SmartPremiumPrompt from '../components/dashboard/SmartPremiumPrompt';
import FinancialHealthScore from '../components/dashboard/FinancialHealthScore';
import EventsCalendar from '../components/dashboard/EventsCalendar';
import CalculatorInsights from '../components/dashboard/CalculatorInsights';
import NotificationsCenter from '../components/dashboard/NotificationsCenter';
import ReferralProgress from '../components/dashboard/ReferralProgress';
import IntelLibrarySync from '../components/dashboard/IntelLibrarySync';
import SpouseCollaborationStatus from '../components/dashboard/SpouseCollaborationStatus';
import AchievementBadges from '../components/dashboard/AchievementBadges';
import CommunityActivity from '../components/dashboard/CommunityActivity';
import { DashboardAnalyticsProvider } from '../components/dashboard/DashboardAnalyticsTracker';

export const metadata: Metadata = generatePageMeta({
  title: "Dashboard - Your Military Life Command Center",
  description: "Access your personalized action plan for PCS, career, deployment, and finances. Get curated guidance from 5 resource hubs and use premium calculators for TSP, SDP, and house hacking.",
  path: "/dashboard",
  keywords: ["military dashboard", "military life planning", "PCS planning", "deployment prep", "military career tools", "TSP calculator"]
});

export default async function CommandDashboard() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Load assessment and premium status
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Check premium
  let isPremium = false;
  const { data: entitlement, error: entError } = await supabase
    .from("entitlements")
    .select("tier, status, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  
  console.log('[Dashboard] User:', user.id);
  console.log('[Dashboard] Entitlement:', entitlement);
  console.log('[Dashboard] Error:', entError);
  
  if (entitlement) {
    isPremium = entitlement.tier === 'premium' && entitlement.status === 'active';
    console.log('[Dashboard] isPremium:', isPremium, 'tier:', entitlement.tier, 'status:', entitlement.status);
  } else {
    console.log('[Dashboard] No entitlement found for user');
  }
  const { data: aRow } = await supabase.from("assessments").select("answers").eq("user_id", user.id).maybeSingle();
  const answers = (aRow?.answers || {}) as Record<string, unknown>;
  const hasAssessment = Object.keys(answers).length > 0;

  // Load user profile
  const { data: profileRow } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
  const profileComplete = profileRow?.profile_completed || false;

  // Check if user has a personalized plan
  const { data: planRow } = await supabase.from("user_plans").select("generated_at, created_at, summary").eq("user_id", user.id).maybeSingle();
  const hasPlan = !!planRow?.summary; // Plan is complete when summary exists
  
  // Check if plan is currently generating (created recently but no summary yet)
  const planGenerating = planRow && !planRow.summary && planRow.created_at &&
    (new Date().getTime() - new Date(planRow.created_at).getTime()) < 120000; // 2 minutes

  return (
    <>
      <Header />
      <DashboardAnalyticsProvider>
        <div className="min-h-screen bg-background">
          {/* Subtle background gradient like home page */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Hero Header */}
          <div className="mb-16 text-center">
            <div className="mb-4">
              {isPremium ? (
                <Badge variant="warning">
                  <Icon name="Star" className="h-3 w-3 inline mr-1" /> Premium Member
                </Badge>
              ) : (
                <Badge variant="success">Free Forever</Badge>
              )}
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-text-headings mb-4">
              Welcome back, {user.firstName || 'Commander'}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-text-body">
              Your command center for military life planning
            </p>
          </div>

          {/* Onboarding Tour - Show for users who haven't completed everything */}
          {(!hasPlan || !profileComplete || !hasAssessment) && (
            <OnboardingTour
              userId={user.id}
              hasProfile={profileComplete}
              hasAssessment={hasAssessment}
              hasPlan={hasPlan}
            />
          )}

          {/* Quick Actions Command Bar - NEW */}
          <QuickActions />

          {/* Onboarding CTAs & Plan Widget */}
          {(!profileComplete || !hasAssessment || hasPlan || planGenerating) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Plan Generating Widget */}
              {planGenerating && (
                <AnimatedCard className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-8 text-white shadow-lg border border-amber-400/50" delay={0}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                        <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                      <div className="inline-flex items-center px-2.5 py-1 bg-white/20 border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                        Generating...
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif font-black mb-3 text-white">Your Plan is Being Created</h2>
                    <p className="text-orange-100 text-base mb-6 leading-relaxed flex-1">
                      Our AI is analyzing 410+ expert content blocks and curating 8-10 specifically for you. This takes ~30 seconds.
                    </p>
                    <Link 
                      href="/dashboard/plan"
                      className="inline-flex items-center justify-center bg-surface text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Check Status →
                    </Link>
                  </div>
                </AnimatedCard>
              )}

              {/* Your Personalized Plan - Show if they have one */}
              {hasPlan && (
                <AnimatedCard className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg border border-slate-700/50" delay={0}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                        <Icon name="Sparkles" className="h-7 w-7 text-white" />
                      </div>
                      <div className="inline-flex items-center px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-wider">
                        AI-Curated
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif font-black mb-3 text-white">Your Personalized Plan</h2>
                    <p className="text-white/90 text-base mb-6 leading-relaxed flex-1">
                      AI has analyzed your profile and selected 8-10 expert content blocks tailored specifically to your military situation and goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link 
                        href="/dashboard/plan"
                        className="inline-flex items-center justify-center bg-surface text-blue-900 hover:bg-info-subtle px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        View Your Plan →
                      </Link>
                      <Link 
                        href="/dashboard/assessment"
                        className="inline-flex items-center justify-center border-2 border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
                        Update Plan
                      </Link>
                    </div>
                  </div>
                </AnimatedCard>
              )}

              {/* Profile Completion CTA */}
              {!profileComplete && (
                <AnimatedCard className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-2xl p-8 text-white shadow-lg border border-slate-600/50" delay={hasPlan ? 50 : 0}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                        <Icon name="Target" className="h-7 w-7 text-white" />
                      </div>
                      <div className="inline-flex items-center px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-wider">
                        Quick Setup
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif font-black mb-3 text-white">Unlock Intelligent Personalization</h2>
                    <p className="text-slate-200 text-base mb-6 leading-relaxed flex-1">
                      Add your rank, branch, base, and goals to get hyper-personalized guidance for every aspect of military life.
                    </p>
                    <Link href="/dashboard/profile/setup" className="inline-flex items-center justify-center bg-surface text-slate-800 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      Complete Profile →
                    </Link>
                  </div>
                </AnimatedCard>
              )}

              {/* Assessment CTA */}
              {!hasAssessment && (
                <AnimatedCard className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg border border-slate-700/50" delay={hasPlan || !profileComplete ? 100 : 50}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                        <Icon name="ClipboardList" className="h-7 w-7 text-white" />
                      </div>
                      <div className="inline-flex items-center px-2.5 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-xs font-bold uppercase tracking-wider">
                        5 Minutes
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif font-black mb-3 text-white">Get Your Personalized Plan</h2>
                    <p className="text-indigo-100 text-base mb-6 leading-relaxed flex-1">
                      {profileComplete 
                        ? "Complete the assessment and AI will curate 8-10 expert content blocks tailored specifically to your military situation and goals."
                        : "Complete your profile first, then take the assessment to unlock your AI-curated personalized plan."
                      }
                    </p>
                    <Link 
                      href={profileComplete ? "/dashboard/assessment" : "/dashboard/profile/setup"}
                      className="inline-flex items-center justify-center bg-surface text-indigo-900 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {profileComplete ? "Start Assessment →" : "Complete Profile First →"}
                    </Link>
                  </div>
                </AnimatedCard>
              )}
            </div>
          )}

          {/* Notifications Center - High Priority Alerts */}
          <NotificationsCenter 
            profileData={{
              pcsDate: profileRow?.pcs_date,
              deploymentStatus: profileRow?.deployment_status
            }}
          />

          {/* Mission Status Tracker - NEW */}
          <MissionStatusTracker 
            userId={user.id}
            hasProfile={profileComplete}
            hasAssessment={hasAssessment}
            hasPlan={hasPlan}
          />

          {/* Contextual Next Steps - NEW */}
          <ContextualNextSteps 
            userState={{
              hasTSP: !!profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && profileRow.tsp_balance_range !== '$0',
              pcsDaysAway: profileRow?.pcs_date ? Math.ceil((new Date(profileRow.pcs_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined,
              deploymentStatus: profileRow?.deployment_status,
              hasEmergencyFund: !!profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && profileRow.emergency_fund_range !== '$0',
              calculatorUsageCount: 0
            }}
          />

          {/* Gamification Widgets - Streak, Daily Tip, Financial Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StreakTracker userId={user.id} />
            <DailyTip />
            <FinancialReadinessScore 
              userId={user.id}
              profileData={{
                hasCompletedProfile: profileComplete,
                hasCompletedAssessment: hasAssessment,
                hasPlan: hasPlan,
                hasTSP: !!profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && profileRow.tsp_balance_range !== '$0',
                hasEmergencyFund: !!profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && profileRow.emergency_fund_range !== '$0',
                hasDebt: !!profileRow?.debt_amount_range && profileRow.debt_amount_range !== 'prefer-not-to-say' && profileRow.debt_amount_range !== '$0'
              }}
            />
          </div>

          {/* Calculator Insights - Show ROI from calculations */}
          <CalculatorInsights userId={user.id} />

          {/* Financial Health Score - Comprehensive metric */}
          <FinancialHealthScore 
            profileData={{
              tspBalanceRange: profileRow?.tsp_balance_range,
              emergencyFundRange: profileRow?.emergency_fund_range,
              debtAmountRange: profileRow?.debt_amount_range,
              hasTSP: !!profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && profileRow.tsp_balance_range !== '$0',
              hasEmergencyFund: !!profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && profileRow.emergency_fund_range !== '$0',
              hasDebt: !!profileRow?.debt_amount_range && profileRow.debt_amount_range !== 'prefer-not-to-say' && profileRow.debt_amount_range !== '$0'
            }}
          />

          {/* Saved Items, Binder, Activity Feed, Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <SavedItems userId={user.id} />
            <BinderPreview userId={user.id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <ActivityFeed userId={user.id} />
            <EventsCalendar 
              profileData={{
                pcsDate: profileRow?.pcs_date,
                deploymentStatus: profileRow?.deployment_status
              }}
            />
          </div>

          {/* Spouse Collaboration & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <SpouseCollaborationStatus userId={user.id} />
            <AchievementBadges 
              userId={user.id}
              hasProfile={profileComplete}
              hasAssessment={hasAssessment}
              hasPlan={hasPlan}
            />
          </div>

          {/* Intel Library Sync & Community Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <IntelLibrarySync userId={user.id} />
            <CommunityActivity />
          </div>

          {/* Smart Premium Prompt - Contextual upgrade CTA */}
          <SmartPremiumPrompt isPremium={isPremium} userId={user.id} />

          {/* Referral Progress */}
          <ReferralProgress userId={user.id} />

          {/* AI-Powered Recommendations */}
          <div className="mb-12">
            <AIRecommendations />
          </div>

          {/* Financial Overview Dashboard */}
          <div className="mb-12">
            <FinancialOverview />
          </div>

          {/* Upcoming Expirations Widget */}
          <div className="mb-12">
            <UpcomingExpirations />
          </div>

          {/* Intelligence Library Widget - Show for all users with completed profile */}
          {profileComplete && (
            <div className="mb-12">
              <IntelligenceWidget userId={user.id} />
            </div>
          )}

          {/* Settings Widget - Always show */}
          <div className="mb-12">
            <AnimatedCard delay={300} className="bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                    <Icon name="Settings" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-headings">Account Settings</h3>
                    <p className="text-sm text-text-body">Manage your profile, billing, and preferences</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Icon name="Settings" className="w-4 h-4" />
                  Go to Settings
                </Link>
              </div>
            </AnimatedCard>
          </div>

          {/* Profile Snapshot - Always show if profile is completed */}
          {profileComplete && (
            <AnimatedCard className="mb-12 p-10 md:p-12 bg-card border border-border shadow-sm" delay={0}>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl md:text-4xl font-serif font-black text-text-headings">Your Profile</h2>
                <Link href="/dashboard/profile/setup" className="inline-flex items-center gap-2 rounded-lg border-2 border-default px-5 py-2.5 text-indigo-600 font-semibold transition-all hover:border-indigo-600 hover:-translate-y-[2px]">
                  <Icon name="Pencil" className="h-4 w-4 inline" /> Edit
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Military Identity - Clean home style */}
                {(profileRow?.rank || profileRow?.branch) && (
                  <div className="border border-subtle rounded-xl p-6 bg-surface-hover hover:shadow-md transition-shadow">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Military</div>
                    <div className="text-2xl font-black text-text-headings mb-1">
                      {profileRow?.rank || 'Service Member'}
                    </div>
                    {profileRow?.branch && (
                      <div className="text-sm font-medium text-body">{profileRow.branch}</div>
                    )}
                    {profileRow?.component && (
                      <div className="text-xs text-muted mt-1">{profileRow.component}</div>
                    )}
                  </div>
                )}
                
                {/* Location & PCS - Clean style */}
                {(profileRow?.current_base || profileRow?.pcs_date) && (
                  <div className="border border-subtle rounded-xl p-6 bg-surface-hover hover:shadow-md transition-shadow">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Station</div>
                    <div className="text-2xl font-black text-text-headings mb-1">
                      {profileRow?.current_base || 'Unknown'}
                    </div>
                    {profileRow?.pcs_date && (
                      <div className="text-sm font-medium text-body">
                        PCS: {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Family - Clean style */}
                {(profileRow?.marital_status || profileRow?.num_children !== null) && (
                  <div className="border border-subtle rounded-xl p-6 bg-surface-hover hover:shadow-md transition-shadow">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Family</div>
                    <div className="text-2xl font-black text-primary capitalize mb-1">
                      {profileRow?.marital_status || 'Not specified'}
                    </div>
                    {profileRow?.num_children !== null && profileRow?.num_children > 0 && (
                      <div className="text-sm font-medium text-body">
                        {profileRow.num_children} {profileRow.num_children === 1 ? 'child' : 'children'}
                        {profileRow?.has_efmp && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">EFMP</span>}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Financial Snapshot - Clean style */}
                {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range) && (
                  <div className="border border-subtle rounded-xl p-6 bg-surface-hover hover:shadow-md transition-shadow">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Finances</div>
                    {profileRow?.tsp_balance_range && (
                      <div className="text-sm font-semibold text-success mb-1">
                        TSP: {profileRow.tsp_balance_range}
                      </div>
                    )}
                    {profileRow?.debt_amount_range && (
                      <div className="text-sm font-medium text-body">
                        Debt: {profileRow.debt_amount_range}
                      </div>
                    )}
                    {profileRow?.emergency_fund_range && (
                      <div className="text-xs text-muted mt-1">
                        Emergency: {profileRow.emergency_fund_range}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Fallback if no profile data */}
                {!profileRow?.rank && !profileRow?.branch && !profileRow?.current_base && !profileRow?.marital_status && !profileRow?.tsp_balance_range && !profileRow?.debt_amount_range && (
                  <div className="col-span-full text-center py-6">
                    <p className="text-muted mb-4">Complete your profile to see personalized insights here</p>
                    <Link 
                      href="/dashboard/profile/setup"
                      className="inline-flex items-center bg-info hover:bg-info text-white px-6 py-3 rounded-lg font-bold transition-all shadow"
                    >
                      Set up profile →
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Career Interests & Goals - Subtle style */}
              {(profileRow?.career_interests?.length > 0 || profileRow?.financial_priorities?.length > 0) && (
                <div className="mt-8 pt-8 border-t border-subtle">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {profileRow?.career_interests?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Career Interests</div>
                        <div className="flex flex-wrap gap-2">
                          {profileRow.career_interests.map((interest: string) => (
                            <span key={interest} className="px-3 py-1.5 bg-info-subtle text-info border border-info rounded-lg text-sm font-medium capitalize">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profileRow?.financial_priorities?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Financial Priorities</div>
                        <div className="flex flex-wrap gap-2">
                          {profileRow.financial_priorities.map((priority: string) => (
                            <span key={priority} className="px-3 py-1.5 bg-success-subtle text-success border border-success rounded-lg text-sm font-medium capitalize">
                              {priority}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AnimatedCard>
          )}

          {hasAssessment && (
            <>
              {/* Executive Summary */}
              <AnimatedCard className="mb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-12 text-white shadow-2xl border-0" delay={profileComplete ? 50 : 0}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <Icon name="Zap" className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <Badge variant="primary">
                      <span className="text-white">Executive Summary</span>
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-serif font-black mt-2">Your Command Center</h2>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Profile Completion */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white/90">Profile Depth</span>
                      <span className="text-2xl font-black text-white">
                        {(() => {
                          // Required fields (70% weight)
                          let required = 0;
                          const requiredTotal = 10;
                          if (profileRow?.age) required++;
                          if (profileRow?.gender) required++;
                          if (profileRow?.years_of_service) required++;
                          if (profileRow?.service_status) required++;
                          if (profileRow?.branch || profileRow?.service_status === 'military_spouse') required++;
                          if (profileRow?.rank || profileRow?.service_status === 'military_spouse') required++;
                          if (profileRow?.marital_status) required++;
                          if (profileRow?.num_children !== null) required++;
                          if (profileRow?.tsp_balance_range) required++;
                          if (profileRow?.debt_amount_range) required++;
                          
                          // High-value optional fields (30% weight)
                          let optional = 0;
                          const optionalTotal = 10;
                          if (profileRow?.current_base) optional++;
                          if (profileRow?.mos_afsc_rate) optional++;
                          if (profileRow?.clearance_level) optional++;
                          if (profileRow?.deployment_status) optional++;
                          if (profileRow?.spouse_employed !== null && profileRow?.marital_status === 'married') optional++;
                          if (profileRow?.tsp_allocation) optional++;
                          if (profileRow?.housing_situation) optional++;
                          if (profileRow?.long_term_goal) optional++;
                          if (profileRow?.career_interests?.length > 0) optional++;
                          if (profileRow?.education_level) optional++;
                          
                          const score = Math.round((required / requiredTotal) * 70 + (optional / optionalTotal) * 30);
                          return score;
                        })()}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-surface rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(() => {
                          let required = 0;
                          const requiredTotal = 10;
                          if (profileRow?.age) required++;
                          if (profileRow?.gender) required++;
                          if (profileRow?.years_of_service) required++;
                          if (profileRow?.service_status) required++;
                          if (profileRow?.branch || profileRow?.service_status === 'military_spouse') required++;
                          if (profileRow?.rank || profileRow?.service_status === 'military_spouse') required++;
                          if (profileRow?.marital_status) required++;
                          if (profileRow?.num_children !== null) required++;
                          if (profileRow?.tsp_balance_range) required++;
                          if (profileRow?.debt_amount_range) required++;
                          
                          let optional = 0;
                          const optionalTotal = 10;
                          if (profileRow?.current_base) optional++;
                          if (profileRow?.mos_afsc_rate) optional++;
                          if (profileRow?.clearance_level) optional++;
                          if (profileRow?.deployment_status) optional++;
                          if (profileRow?.spouse_employed !== null && profileRow?.marital_status === 'married') optional++;
                          if (profileRow?.tsp_allocation) optional++;
                          if (profileRow?.housing_situation) optional++;
                          if (profileRow?.long_term_goal) optional++;
                          if (profileRow?.career_interests?.length > 0) optional++;
                          if (profileRow?.education_level) optional++;
                          
                          return Math.round((required / requiredTotal) * 70 + (optional / optionalTotal) * 30);
                        })()}%` }}
                      />
                    </div>
                  </div>

                  {/* Assessment Status */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white/90">AI-Curated Plan</span>
                      <span className="text-lg font-black text-green-300"><Icon name="Check" className="h-5 w-5 inline" /> Active</span>
                    </div>
                    <p className="text-sm text-white/90">Personalized plan with expert content</p>
                  </div>

                  {/* Premium Status */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white/90">Membership</span>
                      <span className={`text-lg font-black ${isPremium ? 'text-amber-300' : 'text-gray-300'}`}>
                        {isPremium ? <><Icon name="Star" className="h-4 w-4 inline" /> Premium</> : 'Free'}
                      </span>
                    </div>
                    {!isPremium && (
                      <Link href="/dashboard/upgrade" className="text-xs text-white/80 hover:text-white underline">
                        Upgrade for full access →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Icon name="Target" className="h-5 w-5" /> Your Priority Focus</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profileRow?.pcs_date && (() => {
                      const pcsDate = new Date(profileRow.pcs_date);
                      const today = new Date();
                      const daysUntil = Math.ceil((pcsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      if (daysUntil > 0 && daysUntil <= 90) {
                        return (
                          <div className="flex items-start gap-3">
                            <Icon name="Truck" className="h-6 w-6 text-body" />
                            <div>
                              <div className="font-bold text-white">PCS Move - {daysUntil} days away</div>
                              <div className="text-sm text-white/90">
                                {daysUntil <= 30 ? 'URGENT: Start packing and TMO coordination' : 
                                 daysUntil <= 60 ? 'Start planning and organizing' : 
                                 'Begin early preparation'}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {profileRow?.deployment_status === 'preparing' && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <div className="font-bold text-white">Deployment Preparation</div>
                          <div className="text-sm text-white/90">Review deployment checklist and SDP setup</div>
                        </div>
                      </div>
                    )}
                    
                    {profileRow?.financial_priorities?.includes('emergency-fund') && (
                      <div className="flex items-start gap-3">
                        <Icon name="DollarSign" className="h-6 w-6 text-body" />
                        <div>
                          <div className="font-bold text-white">Build Emergency Fund</div>
                          <div className="text-sm text-white/90">Target: 3-6 months of expenses</div>
                        </div>
                      </div>
                    )}
                    
                    {profileRow?.career_interests?.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Icon name="Briefcase" className="h-6 w-6 text-body" />
                        <div>
                          <div className="font-bold text-white">Career Development</div>
                          <div className="text-sm text-white/90">Explore {profileRow.career_interests.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>


              {/* Timeline View - Clean style */}
              {(profileRow?.pcs_date || profileRow?.deployment_status) && (
                <AnimatedCard className="mb-12 p-10 md:p-12 bg-card border border-border shadow-sm" delay={50}>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-primary mb-10">Your Timeline</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PCS Timeline - Clean card */}
                    {profileRow?.pcs_date && (
                      <div className="border border-subtle rounded-xl p-6 bg-surface-hover">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-semibold text-muted uppercase tracking-wider">PCS Move</div>
                            {(() => {
                              const pcsDate = new Date(profileRow.pcs_date);
                              const today = new Date();
                            const daysUntil = Math.ceil((pcsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const weeksUntil = Math.ceil(daysUntil / 7);
                            
                            if (daysUntil < 0) {
                              return <span className="text-xs bg-surface-hover text-body px-2.5 py-1 rounded-full font-medium">Past</span>;
                            } else if (daysUntil <= 30) {
                              return <span className="text-xs bg-danger-subtle text-danger border border-danger px-2.5 py-1 rounded-full font-semibold">URGENT: {daysUntil} days</span>;
                            } else if (daysUntil <= 90) {
                              return <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">{weeksUntil} weeks</span>;
                            } else {
                              return <span className="text-xs bg-info-subtle text-info border border-info px-2.5 py-1 rounded-full font-medium">{Math.ceil(daysUntil / 30)} months</span>;
                            }
                          })()}
                        </div>
                        <div className="text-2xl font-black text-text-headings mb-1">
                          {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        {profileRow?.next_base && (
                          <div className="text-sm font-medium text-body">→ {profileRow.next_base}</div>
                        )}
                      </div>
                    )}

                    {/* Deployment Status - Clean card */}
                    {profileRow?.deployment_status && profileRow.deployment_status !== 'never' && (
                      <div className="border border-subtle rounded-xl p-6 bg-surface-hover">
                        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Deployment</div>
                        <div className="text-2xl font-black text-primary capitalize mb-1">
                          {profileRow.deployment_status.replace('-', ' ')}
                        </div>
                        {profileRow.deployment_count > 0 && (
                          <div className="text-sm font-medium text-body">{profileRow.deployment_count} deployment{profileRow.deployment_count > 1 ? 's' : ''} completed</div>
                        )}
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* Financial Snapshot - Clean style */}
              {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range || profileRow?.emergency_fund_range) && (
                <AnimatedCard className="mb-12 p-10 md:p-12 bg-surface border border-subtle shadow-sm" delay={100}>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-primary mb-10">Financial Snapshot</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && (
                      <div className="border border-subtle rounded-xl p-6 bg-surface-hover">
                        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">TSP Balance</div>
                        <div className="text-3xl font-black text-primary mb-1">{profileRow.tsp_balance_range}</div>
                        <div className="text-xs text-muted">Thrift Savings Plan</div>
                      </div>
                    )}
                    {profileRow?.debt_amount_range && profileRow.debt_amount_range !== 'prefer-not-to-say' && (
                      <div className="border border-subtle rounded-xl p-6 bg-surface-hover">
                        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Debt</div>
                        <div className="text-3xl font-black text-primary mb-1">{profileRow.debt_amount_range}</div>
                        <div className="text-xs text-muted">Total Obligations</div>
                      </div>
                    )}
                    {profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && (
                      <div className="border border-subtle rounded-xl p-6 bg-surface-hover">
                        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Emergency Fund</div>
                        <div className="text-3xl font-black text-primary mb-1">{profileRow.emergency_fund_range}</div>
                        <div className="text-xs text-muted">Safety Net</div>
                      </div>
                    )}
                  </div>
                  {profileRow?.financial_priorities && profileRow.financial_priorities.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-subtle">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Your Focus Areas</div>
                      <div className="flex flex-wrap gap-2">
                        {profileRow.financial_priorities.map((priority: string) => (
                          <span key={priority} className="px-3 py-1.5 bg-success-subtle text-success border border-success rounded-lg text-sm font-medium capitalize">
                            {priority}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              )}

            </>
          )}

          {/* Premium Tools Grid - Comprehensive showcase */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4">Your Premium Toolkit</h2>
              <p className="text-xl text-body max-w-3xl mx-auto">
                {isPremium ? 'Access all 6 interactive calculators to optimize your military finances' : 'Upgrade to access powerful financial planning tools'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Financial Tools */}
              <AnimatedCard delay={0} className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/tsp-modeler" className="block p-8">
                  <Icon name="TrendingUp" className="h-12 w-12 text-body mb-4" />
                  <div className="inline-flex items-center px-2 py-1 bg-info-subtle text-info text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Financial
                  </div>
                  <h3 className="text-2xl font-bold text-text-headings mb-2">TSP Modeler</h3>
                  <p className="text-text-body leading-relaxed">Project retirement growth with allocation strategies</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={50} className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/sdp-strategist" className="block p-8">
                  <Icon name="Banknote" className="h-12 w-12 text-body mb-4" />
                  <div className="inline-flex items-center px-2 py-1 bg-info-subtle text-info text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Financial
                  </div>
                  <h3 className="text-2xl font-bold text-text-headings mb-2">SDP Strategist</h3>
                  <p className="text-text-body leading-relaxed">Calculate 10% guaranteed deployment savings returns</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={100} className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/house-hacking" className="block p-8">
                  <Icon name="House" className="h-12 w-12 text-body mb-4" />
                  <div className="inline-flex items-center px-2 py-1 bg-info-subtle text-info text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Financial
                  </div>
                  <h3 className="text-2xl font-bold text-text-headings mb-2">House Hacking</h3>
                  <p className="text-text-body leading-relaxed">Analyze multi-unit property ROI with BAH optimization</p>
                </Link>
              </AnimatedCard>

              {/* Planning Tools */}
              <AnimatedCard delay={150} className="border-2 border-success bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/pcs-planner" className="block p-8">
                  <Icon name="Truck" className="h-12 w-12 text-body mb-4" />
                  <div className="inline-flex items-center px-2 py-1 bg-success-subtle text-success text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Planning
                  </div>
                  <h3 className="text-2xl font-bold text-text-headings mb-2">PCS Planner</h3>
                  <p className="text-text-body leading-relaxed">Budget your move and estimate PPM profit potential</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={200} className="border-2 border-success bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/on-base-savings" className="block p-8">
                  <Icon name="ShoppingCart" className="h-12 w-12 text-body mb-4" />
                  <div className="inline-flex items-center px-2 py-1 bg-success-subtle text-success text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Planning
                  </div>
                  <h3 className="text-2xl font-bold text-text-headings mb-2">Annual Savings Center</h3>
                  <p className="text-text-body leading-relaxed">Strategic Commissary & Exchange savings dashboard</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={250} className="border-2 border-success bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/salary-calculator" className="block p-8">
                  <Icon name="Briefcase" className="h-12 w-12 text-body mb-4" />
                  <div className="inline-flex items-center px-2 py-1 bg-success-subtle text-success text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Planning
                  </div>
                  <h3 className="text-2xl font-bold text-text-headings mb-2">Career Opportunity Analyzer</h3>
                  <p className="text-text-body leading-relaxed">Complete financial analysis: salary, taxes, COL & total compensation</p>
                </Link>
              </AnimatedCard>
            </div>
          </div>


          {/* Quick Actions Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4">Quick Actions</h2>
              <p className="text-xl text-body">Jump to the most important areas of your military life planning</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedCard delay={0} className="border border-subtle bg-surface hover:shadow-lg transition-all">
                <Link href="/dashboard/plan" className="block p-6 text-center">
                  <Icon name="Sparkles" className="h-10 w-10 text-indigo-600 mb-3 mx-auto" />
                  <h3 className="text-lg font-bold text-text-headings mb-1">Your AI Plan</h3>
                  <p className="text-sm text-text-body">AI-curated content</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={50} className="border border-subtle bg-surface hover:shadow-lg transition-all">
                <Link href="/dashboard/assessment" className="block p-6 text-center">
                  <Icon name="CircleCheck" className="h-10 w-10 text-body mb-3 mx-auto" />
                  <h3 className="text-lg font-bold text-text-headings mb-1">Assessment</h3>
                  <p className="text-sm text-text-body">Update your profile</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={100} className="border border-subtle bg-surface hover:shadow-lg transition-all">
                <Link href="/dashboard/library" className="block p-6 text-center">
                  <Icon name="BookOpen" className="h-10 w-10 text-body mb-3 mx-auto" />
                  <h3 className="text-lg font-bold text-text-headings mb-1">Intel Library</h3>
                  <p className="text-sm text-text-body">Search 400+ resources</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={150} className="border border-subtle bg-surface hover:shadow-lg transition-all">
                <Link href="/dashboard/referrals" className="block p-6 text-center">
                  <Icon name="Gift" className="h-10 w-10 text-body mb-3 mx-auto" />
                  <h3 className="text-lg font-bold text-text-headings mb-1">Refer & Earn</h3>
                  <p className="text-sm text-text-body">Get rewards</p>
                </Link>
              </AnimatedCard>
            </div>
          </div>

          {/* Premium Upgrade CTA */}
          {!isPremium && (
            <AnimatedCard className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 text-white text-center shadow-2xl" delay={300}>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <Icon name="Star" className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-serif font-black mb-4">Unlock Full Access</h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Get unlimited access to all 6 premium calculators, the Intel Library, and personalized AI-enhanced planning for just $9.99/month.
              </p>
              <Link 
                href="/dashboard/upgrade"
                className="inline-flex items-center bg-surface text-purple-600 hover:bg-surface-hover px-10 py-5 rounded-xl font-black text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                Upgrade to Premium →
              </Link>
            </AnimatedCard>
          )}
        </div>
      </div>
      </DashboardAnalyticsProvider>
      <Footer />
    </>
  );
}
