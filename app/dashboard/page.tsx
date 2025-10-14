import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AnimatedCard from '../components/ui/AnimatedCard';
import { generatePageMeta } from "@/lib/seo-config";

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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Subtle background gradient like home page */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Hero Header - Home page style */}
          <div className="mb-16 text-center">
            <div className="mb-4">
              {isPremium ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  <span>⭐</span> Premium Member
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Free Preview
                </span>
              )}
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
              Welcome back, {user.firstName || 'Commander'}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Your command center for military life planning
            </p>
          </div>

          {/* Profile completion CTA - only show if profile not complete */}
          {!profileComplete && (
            <AnimatedCard className="mb-10 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl border-0" delay={0}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-black mb-2">Unlock Intelligent Personalization</h2>
                  <p className="text-blue-50 text-lg mb-4 leading-relaxed">
                    Add your rank, branch, base, and goals to get hyper-personalized guidance for every aspect of military life.
                  </p>
                  <Link href="/dashboard/profile/setup" className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                    Complete Profile →
                  </Link>
                </div>
              </div>
            </AnimatedCard>
          )}

          {!hasAssessment && (
            <AnimatedCard className="mb-12 bg-gradient-to-br from-indigo-600 to-blue-600 p-10 text-white">
              <div className="flex items-start gap-6">
                <div className="text-6xl">📋</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-serif font-bold mb-3">Get Your Personalized Plan</h2>
                  <p className="text-xl text-blue-50 mb-6 leading-relaxed">
                    Complete the 5-minute assessment to unlock your tailored Military Life Roadmap with curated content from our toolkit hubs.
                  </p>
                  <Link 
                    href="/dashboard/assessment"
                    className="inline-flex items-center bg-white text-indigo-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-[2px]"
                  >
                    Start Assessment →
                  </Link>
                </div>
              </div>
            </AnimatedCard>
          )}

          {hasAssessment && (
            <>
              {/* Executive Summary - NEW! */}
              <AnimatedCard className="mb-12 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-10 md:p-12 text-white shadow-2xl border-0" delay={0}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <span className="text-4xl">⚡</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-black mb-2 uppercase tracking-widest">
                      Executive Summary
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-black">Your Command Center</h2>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Profile Completion */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-blue-100">Profile Completion</span>
                      <span className="text-2xl font-black text-white">
                        {(() => {
                          let score = 0;
                          if (profileRow?.rank) score += 20;
                          if (profileRow?.branch) score += 20;
                          if (profileRow?.current_base) score += 15;
                          if (profileRow?.marital_status) score += 10;
                          if (profileRow?.pcs_date) score += 15;
                          if (profileRow?.career_interests?.length > 0) score += 10;
                          if (profileRow?.financial_priorities?.length > 0) score += 10;
                          return score;
                        })()}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(() => {
                          let score = 0;
                          if (profileRow?.rank) score += 20;
                          if (profileRow?.branch) score += 20;
                          if (profileRow?.current_base) score += 15;
                          if (profileRow?.marital_status) score += 10;
                          if (profileRow?.pcs_date) score += 15;
                          if (profileRow?.career_interests?.length > 0) score += 10;
                          if (profileRow?.financial_priorities?.length > 0) score += 10;
                          return score;
                        })()}%` }}
                      />
                    </div>
                  </div>

                  {/* Assessment Status */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-blue-100">Strategic Plan</span>
                      <span className="text-lg font-black text-green-300">✓ Active</span>
                    </div>
                    <p className="text-sm text-blue-100">AI-personalized roadmap generated</p>
                  </div>

                  {/* Premium Status */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-blue-100">Membership</span>
                      <span className={`text-lg font-black ${isPremium ? 'text-amber-300' : 'text-gray-300'}`}>
                        {isPremium ? '⭐ Premium' : 'Free'}
                      </span>
                    </div>
                    {!isPremium && (
                      <Link href="/dashboard/upgrade" className="text-xs text-blue-200 hover:text-white underline">
                        Upgrade for full access →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🎯 Your Priority Focus</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profileRow?.pcs_date && (() => {
                      const pcsDate = new Date(profileRow.pcs_date);
                      const today = new Date();
                      const daysUntil = Math.ceil((pcsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      if (daysUntil > 0 && daysUntil <= 90) {
                        return (
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🚚</span>
                            <div>
                              <div className="font-bold text-white">PCS Move - {daysUntil} days away</div>
                              <div className="text-sm text-blue-100">
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
                          <div className="text-sm text-blue-100">Review deployment checklist and SDP setup</div>
                        </div>
                      </div>
                    )}
                    
                    {profileRow?.financial_priorities?.includes('emergency-fund') && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <div className="font-bold text-white">Build Emergency Fund</div>
                          <div className="text-sm text-blue-100">Target: 3-6 months of expenses</div>
                        </div>
                      </div>
                    )}
                    
                    {profileRow?.career_interests?.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💼</span>
                        <div>
                          <div className="font-bold text-white">Career Development</div>
                          <div className="text-sm text-blue-100">Explore {profileRow.career_interests.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>

              {/* Profile Snapshot - Home page style */}
              <AnimatedCard className="mb-12 p-10 md:p-12 bg-white border border-gray-200 shadow-sm" delay={50}>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900">Your Profile</h2>
                  <Link href="/dashboard/profile/setup" className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 px-5 py-2.5 text-indigo-600 font-semibold transition-all hover:border-indigo-600 hover:-translate-y-[2px]">
                    {profileComplete ? '✏️ Edit' : '➕ Complete'}
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Military Identity - Clean home style */}
                  {(profileRow?.rank || profileRow?.branch) && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Military</div>
                      <div className="text-2xl font-black text-gray-900 mb-1">
                        {profileRow?.rank || 'Service Member'}
                      </div>
                      {profileRow?.branch && (
                        <div className="text-sm font-medium text-gray-700">{profileRow.branch}</div>
                      )}
                      {profileRow?.component && (
                        <div className="text-xs text-gray-500 mt-1">{profileRow.component}</div>
                      )}
                    </div>
                  )}
                  
                  {/* Location & PCS - Clean style */}
                  {(profileRow?.current_base || profileRow?.pcs_date) && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Station</div>
                      <div className="text-2xl font-black text-gray-900 mb-1">
                        {profileRow?.current_base || 'Unknown'}
                      </div>
                      {profileRow?.pcs_date && (
                        <div className="text-sm font-medium text-gray-700">
                          PCS: {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Family - Clean style */}
                  {(profileRow?.marital_status || profileRow?.num_children !== null) && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Family</div>
                      <div className="text-2xl font-black text-gray-900 capitalize mb-1">
                        {profileRow?.marital_status || 'Not specified'}
                      </div>
                      {profileRow?.num_children !== null && profileRow?.num_children > 0 && (
                        <div className="text-sm font-medium text-gray-700">
                          {profileRow.num_children} {profileRow.num_children === 1 ? 'child' : 'children'}
                          {profileRow?.has_efmp && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">EFMP</span>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Financial Snapshot - Clean style */}
                  {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range) && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Finances</div>
                      {profileRow?.tsp_balance_range && (
                        <div className="text-sm font-semibold text-green-700 mb-1">
                          TSP: {profileRow.tsp_balance_range}
                        </div>
                      )}
                      {profileRow?.debt_amount_range && (
                        <div className="text-sm font-semibold text-red-700">
                          Debt: {profileRow.debt_amount_range}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Fallback if no profile data */}
                  {!profileRow?.rank && !profileRow?.branch && !profileRow?.current_base && !profileRow?.marital_status && (
                    <div className="col-span-full text-center py-6">
                      <p className="text-muted mb-4">Complete your profile to see personalized insights here</p>
                      <Link 
                        href="/dashboard/profile/setup"
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow"
                      >
                        Set up profile →
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Career Interests & Goals - Subtle style */}
                {(profileRow?.career_interests?.length > 0 || profileRow?.financial_priorities?.length > 0) && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {profileRow?.career_interests?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Career Interests</div>
                          <div className="flex flex-wrap gap-2">
                            {profileRow.career_interests.map((interest: string) => (
                              <span key={interest} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium capitalize">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profileRow?.financial_priorities?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Financial Priorities</div>
                          <div className="flex flex-wrap gap-2">
                            {profileRow.financial_priorities.map((priority: string) => (
                              <span key={priority} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium capitalize">
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

              {/* Timeline View - Clean style */}
              {(profileRow?.pcs_date || profileRow?.deployment_status) && (
                <AnimatedCard className="mb-12 p-10 md:p-12 bg-white border border-gray-200 shadow-sm" delay={50}>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900 mb-10">Your Timeline</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PCS Timeline - Clean card */}
                    {profileRow?.pcs_date && (
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PCS Move</div>
                            {(() => {
                              const pcsDate = new Date(profileRow.pcs_date);
                              const today = new Date();
                            const daysUntil = Math.ceil((pcsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const weeksUntil = Math.ceil(daysUntil / 7);
                            
                            if (daysUntil < 0) {
                              return <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">Past</span>;
                            } else if (daysUntil <= 30) {
                              return <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-semibold">URGENT: {daysUntil} days</span>;
                            } else if (daysUntil <= 90) {
                              return <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">{weeksUntil} weeks</span>;
                            } else {
                              return <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">{Math.ceil(daysUntil / 30)} months</span>;
                            }
                          })()}
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-1">
                          {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        {profileRow?.next_base && (
                          <div className="text-sm font-medium text-gray-700">→ {profileRow.next_base}</div>
                        )}
                      </div>
                    )}

                    {/* Deployment Status - Clean card */}
                    {profileRow?.deployment_status && profileRow.deployment_status !== 'never' && (
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deployment</div>
                        <div className="text-2xl font-black text-gray-900 capitalize mb-1">
                          {profileRow.deployment_status.replace('-', ' ')}
                        </div>
                        {profileRow.deployment_count > 0 && (
                          <div className="text-sm font-medium text-gray-700">{profileRow.deployment_count} deployment{profileRow.deployment_count > 1 ? 's' : ''} completed</div>
                        )}
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* Financial Snapshot - Clean style */}
              {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range || profileRow?.emergency_fund_range) && (
                <AnimatedCard className="mb-12 p-10 md:p-12 bg-white border border-gray-200 shadow-sm" delay={100}>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900 mb-10">Financial Snapshot</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && (
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TSP Balance</div>
                        <div className="text-3xl font-black text-gray-900 mb-1">{profileRow.tsp_balance_range}</div>
                        <div className="text-xs text-gray-500">Thrift Savings Plan</div>
                      </div>
                    )}
                    {profileRow?.debt_amount_range && profileRow.debt_amount_range !== 'prefer-not-to-say' && (
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Debt</div>
                        <div className="text-3xl font-black text-gray-900 mb-1">{profileRow.debt_amount_range}</div>
                        <div className="text-xs text-gray-500">Total Obligations</div>
                      </div>
                    )}
                    {profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && (
                      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Emergency Fund</div>
                        <div className="text-3xl font-black text-gray-900 mb-1">{profileRow.emergency_fund_range}</div>
                        <div className="text-xs text-gray-500">Safety Net</div>
                      </div>
                    )}
                  </div>
                  {profileRow?.financial_priorities && profileRow.financial_priorities.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Focus Areas</div>
                      <div className="flex flex-wrap gap-2">
                        {profileRow.financial_priorities.map((priority: string) => (
                          <span key={priority} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium capitalize">
                            {priority}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              )}

              {/* Plan Ready - Premium CTA */}
              <AnimatedCard className="mb-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-10 md:p-12 text-white shadow-2xl border-0" delay={150}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/20">
                      <span className="text-5xl">📋</span>
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-black mb-3 uppercase tracking-widest">
                        Intelligent Roadmap
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif font-black mb-3">
                        Your Strategic Plan is Ready
                      </h2>
                      <p className="text-xl text-slate-200 leading-relaxed">
                        GPT-4o analyzed your profile and curated the most relevant content from 379 expert blocks.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link 
                      href="/dashboard/plan"
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-center whitespace-nowrap"
                    >
                      View Full Plan →
                    </Link>
                    <Link 
                      href="/dashboard/assessment"
                      className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-all text-center whitespace-nowrap"
                    >
                      Retake Assessment
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </>
          )}

          {/* Premium Tools Grid - Comprehensive showcase */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">Your Premium Toolkit</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isPremium ? 'Access all 6 interactive calculators to optimize your military finances' : 'Upgrade to access powerful financial planning tools'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Financial Tools */}
              <AnimatedCard delay={0} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/tsp-modeler" className="block p-8">
                  <div className="text-5xl mb-4">📈</div>
                  <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Financial
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">TSP Modeler</h3>
                  <p className="text-gray-600 leading-relaxed">Project retirement growth with allocation strategies</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={50} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/sdp-strategist" className="block p-8">
                  <div className="text-5xl mb-4">💵</div>
                  <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Financial
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">SDP Strategist</h3>
                  <p className="text-gray-600 leading-relaxed">Calculate 10% guaranteed deployment savings returns</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={100} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/house-hacking" className="block p-8">
                  <div className="text-5xl mb-4">🏡</div>
                  <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Financial
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">House Hacking</h3>
                  <p className="text-gray-600 leading-relaxed">Analyze multi-unit property ROI with BAH optimization</p>
                </Link>
              </AnimatedCard>

              {/* Planning Tools */}
              <AnimatedCard delay={150} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/pcs-planner" className="block p-8">
                  <div className="text-5xl mb-4">🚚</div>
                  <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Planning
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">PCS Planner</h3>
                  <p className="text-gray-600 leading-relaxed">Budget your move and estimate PPM profit potential</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={200} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/on-base-savings" className="block p-8">
                  <div className="text-5xl mb-4">🛒</div>
                  <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Planning
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">On-Base Savings</h3>
                  <p className="text-gray-600 leading-relaxed">Calculate Commissary & Exchange annual savings</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={250} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href="/dashboard/tools/salary-calculator" className="block p-8">
                  <div className="text-5xl mb-4">💼</div>
                  <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Planning
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Salary Calculator</h3>
                  <p className="text-gray-600 leading-relaxed">Compare job offers with cost-of-living adjustments</p>
                </Link>
              </AnimatedCard>
            </div>
          </div>


          {/* Quick Actions Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">Quick Actions</h2>
              <p className="text-xl text-gray-600">Jump to the most important areas of your military life planning</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedCard delay={0} className="border border-gray-200 bg-white hover:shadow-lg transition-all">
                <Link href="/dashboard/plan" className="block p-6 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Strategic Plan</h3>
                  <p className="text-sm text-gray-600">View your roadmap</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={50} className="border border-gray-200 bg-white hover:shadow-lg transition-all">
                <Link href="/dashboard/assessment" className="block p-6 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Assessment</h3>
                  <p className="text-sm text-gray-600">Update your profile</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={100} className="border border-gray-200 bg-white hover:shadow-lg transition-all">
                <Link href="/dashboard/library" className="block p-6 text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Intel Library</h3>
                  <p className="text-sm text-gray-600">Search 400+ resources</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={150} className="border border-gray-200 bg-white hover:shadow-lg transition-all">
                <Link href="/dashboard/referrals" className="block p-6 text-center">
                  <div className="text-4xl mb-3">🎁</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Refer & Earn</h3>
                  <p className="text-sm text-gray-600">Get rewards</p>
                </Link>
              </AnimatedCard>
            </div>
          </div>

          {/* Additional Resources */}
          {!isPremium && (
            <AnimatedCard className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-10 text-center" delay={300}>
              <div className="text-5xl mb-4">⭐</div>
              <h2 className="text-3xl font-serif font-black text-gray-900 mb-3">Unlock Full Access</h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Get unlimited access to all 6 premium calculators, the Intel Library, and personalized AI-enhanced planning for just $9.99/month.
              </p>
              <Link 
                href="/dashboard/upgrade"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-5 text-white font-black text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                Upgrade to Premium →
              </Link>
            </AnimatedCard>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
