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
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-text mb-2">
                  Welcome back, {user.firstName || 'Commander'}
                </h1>
                <p className="text-xl text-muted">Your command center for military financial planning</p>
              </div>
              {isPremium ? (
                <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl shadow-xl border-2 border-amber-200">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Premium</span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
                  <span className="text-sm font-bold text-gray-700">Free Preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile completion CTA - only show if profile not complete */}
          {!profileComplete && (
            <AnimatedCard className="mb-10 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl border-0" delay={0}>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-black mb-2">Unlock AI-Powered Personalization</h2>
                  <p className="text-blue-50 text-lg mb-4 leading-relaxed">
                    Add your rank, branch, base, and goals to get hyper-personalized financial roadmaps powered by GPT-4o.
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
                    Complete the 5-minute assessment to unlock your tailored Military Financial Roadmap with curated content from our toolkit hubs.
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
              {/* Profile Snapshot - Dynamic based on what user has filled */}
              <AnimatedCard className="mb-10 p-8 md:p-10 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 shadow-xl" delay={0}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">👤</span>
                    </div>
                    <h2 className="text-3xl font-serif font-black text-text">Your Profile</h2>
                  </div>
                  <Link href="/dashboard/profile/setup" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all">
                    <span>{profileComplete ? '✏️ Edit' : '➕ Complete'}</span>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Military Identity */}
                  {(profileRow?.rank || profileRow?.branch) && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-3xl">⭐</span>
                        </div>
                        <div>
                          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Military</div>
                          <div className="text-2xl font-black text-text mb-1">
                            {profileRow?.rank || 'Service Member'}
                          </div>
                          {profileRow?.branch && (
                            <div className="text-sm font-semibold text-slate-600">{profileRow.branch}</div>
                          )}
                          {profileRow?.component && (
                            <div className="text-xs text-slate-500 mt-1">{profileRow.component}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Location & PCS */}
                  {(profileRow?.current_base || profileRow?.pcs_date) && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-3xl">📍</span>
                        </div>
                        <div>
                          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Station</div>
                          <div className="text-2xl font-black text-text mb-1">
                            {profileRow?.current_base || 'Unknown'}
                          </div>
                          {profileRow?.pcs_date && (
                            <div className="text-sm font-semibold text-slate-600">
                              PCS: {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Family */}
                  {(profileRow?.marital_status || profileRow?.num_children !== null) && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-3xl">👨‍👩‍👧‍👦</span>
                        </div>
                        <div>
                          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Family</div>
                          <div className="text-2xl font-black text-text capitalize mb-1">
                            {profileRow?.marital_status || 'Not specified'}
                          </div>
                          {profileRow?.num_children !== null && profileRow?.num_children > 0 && (
                            <div className="text-sm font-semibold text-slate-600">
                              {profileRow.num_children} {profileRow.num_children === 1 ? 'child' : 'children'}
                              {profileRow?.has_efmp && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">EFMP</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Financial Snapshot */}
                  {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range) && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-3xl">💰</span>
                        </div>
                        <div>
                          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Finances</div>
                          {profileRow?.tsp_balance_range && (
                            <div className="text-sm font-bold text-green-600">
                              TSP: {profileRow.tsp_balance_range}
                            </div>
                          )}
                          {profileRow?.debt_amount_range && (
                            <div className="text-sm font-bold text-red-600">
                              Debt: {profileRow.debt_amount_range}
                            </div>
                          )}
                        </div>
                      </div>
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
                
                {/* Career Interests & Goals */}
                {(profileRow?.career_interests?.length > 0 || profileRow?.financial_priorities?.length > 0) && (
                  <div className="mt-8 pt-8 border-t-2 border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {profileRow?.career_interests?.length > 0 && (
                        <div>
                          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-3">Career Interests</div>
                          <div className="flex flex-wrap gap-2">
                            {profileRow.career_interests.map((interest: string) => (
                              <span key={interest} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold capitalize shadow-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profileRow?.financial_priorities?.length > 0 && (
                        <div>
                          <div className="text-xs text-muted font-bold uppercase tracking-wider mb-3">Financial Priorities</div>
                          <div className="flex flex-wrap gap-2">
                            {profileRow.financial_priorities.map((priority: string) => (
                              <span key={priority} className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold capitalize shadow-sm">
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

              {/* Timeline View - PCS & Deployment */}
              {(profileRow?.pcs_date || profileRow?.deployment_status) && (
                <AnimatedCard className="mb-10 p-8 md:p-10 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-xl" delay={50}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">📅</span>
                    </div>
                    <h2 className="text-3xl font-serif font-black text-text">Your Timeline</h2>
                  </div>
                  <div className="space-y-6">
                    {/* PCS Timeline */}
                    {profileRow?.pcs_date && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-indigo-200">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-3xl">📍</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs text-muted font-bold uppercase tracking-wider">PCS Move</div>
                            {(() => {
                              const pcsDate = new Date(profileRow.pcs_date);
                              const today = new Date();
                              const daysUntil = Math.ceil((pcsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              const weeksUntil = Math.ceil(daysUntil / 7);
                              
                              if (daysUntil < 0) {
                                return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">Past</span>;
                              } else if (daysUntil <= 30) {
                                return <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">URGENT: {daysUntil} days</span>;
                              } else if (daysUntil <= 90) {
                                return <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full font-semibold">{weeksUntil} weeks</span>;
                              } else {
                                return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">{Math.ceil(daysUntil / 30)} months</span>;
                              }
                            })()}
                            </div>
                            <div className="text-2xl font-black text-text mb-1">
                              {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            {profileRow?.next_base && (
                              <div className="text-sm font-semibold text-slate-600">→ {profileRow.next_base}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deployment Status */}
                    {profileRow?.deployment_status && profileRow.deployment_status !== 'never' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-indigo-200">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-3xl">🌍</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted font-bold uppercase tracking-wider mb-2">Deployment</div>
                            <div className="text-2xl font-black text-text capitalize mb-1">
                              {profileRow.deployment_status.replace('-', ' ')}
                            </div>
                            {profileRow.deployment_count > 0 && (
                              <div className="text-sm font-semibold text-slate-600">{profileRow.deployment_count} deployment{profileRow.deployment_count > 1 ? 's' : ''} completed</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* Financial Snapshot */}
              {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range || profileRow?.emergency_fund_range) && (
                <AnimatedCard className="mb-10 p-8 md:p-10 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl" delay={100}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">💵</span>
                    </div>
                    <h2 className="text-3xl font-serif font-black text-text">Financial Snapshot</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-green-200">
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mb-2">TSP Balance</div>
                        <div className="text-3xl font-black text-green-600 mb-1">{profileRow.tsp_balance_range}</div>
                        <div className="text-xs text-slate-500">Thrift Savings Plan</div>
                      </div>
                    )}
                    {profileRow?.debt_amount_range && profileRow.debt_amount_range !== 'prefer-not-to-say' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-red-200">
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mb-2">Debt</div>
                        <div className="text-3xl font-black text-red-600 mb-1">{profileRow.debt_amount_range}</div>
                        <div className="text-xs text-slate-500">Total Obligations</div>
                      </div>
                    )}
                    {profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-200">
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mb-2">Emergency Fund</div>
                        <div className="text-3xl font-black text-blue-600 mb-1">{profileRow.emergency_fund_range}</div>
                        <div className="text-xs text-slate-500">Safety Net</div>
                      </div>
                    )}
                  </div>
                  {profileRow?.financial_priorities && profileRow.financial_priorities.length > 0 && (
                    <div className="mt-8 pt-8 border-t-2 border-green-200">
                      <div className="text-xs text-muted font-bold uppercase tracking-wider mb-3">Your Focus Areas</div>
                      <div className="flex flex-wrap gap-2">
                        {profileRow.financial_priorities.map((priority: string) => (
                          <span key={priority} className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold capitalize shadow-sm">
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
                        AI-Powered Roadmap
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

          {/* Wealth-Builder Tools */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🛠️</span>
              </div>
              <h2 className="text-3xl font-serif font-black text-text">Wealth-Builder Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard delay={0} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <Link href="/dashboard/tools/tsp-modeler" className="block p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                      📈
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-text group-hover:text-blue-600 transition-colors">TSP Modeler</h3>
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Calculator</div>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed">Model retirement scenarios with compound growth and allocation strategies</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={100} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <Link href="/dashboard/tools/sdp-strategist" className="block p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                      💵
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-text group-hover:text-green-600 transition-colors">SDP Strategist</h3>
                      <div className="text-xs text-green-600 font-bold uppercase tracking-wider">Calculator</div>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed">Calculate 10% guaranteed returns on deployment savings up to $10K</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={200} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <Link href="/dashboard/tools/house-hacking" className="block p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                      🏡
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-text group-hover:text-amber-600 transition-colors">House Hacking</h3>
                      <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">Calculator</div>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed">Analyze multi-unit property ROI with BAH and rental income</p>
                </Link>
              </AnimatedCard>
            </div>
          </div>


          {!hasAssessment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <AnimatedCard delay={0}>
                <Link href="/dashboard/directory" className="block p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-text mb-2">Provider Directory</h3>
                  <p className="text-muted">Find vetted financial advisors and service providers</p>
                </Link>
              </AnimatedCard>
              <AnimatedCard delay={100}>
                <Link href="/dashboard/upgrade" className="block p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-text mb-2">Upgrade to Premium</h3>
                  <p className="text-muted">Unlock advanced features and priority support</p>
                </Link>
              </AnimatedCard>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
