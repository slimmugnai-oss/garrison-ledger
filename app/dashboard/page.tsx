import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import PageHeader from '../components/ui/PageHeader';
import AnimatedCard from '../components/ui/AnimatedCard';
import StatCard from '../components/ui/StatCard';
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
  
  // Try both data structures (v21 and comprehensive)
  const v21Obj = (answers as Record<string, unknown>)?.v21 as Record<string, unknown> | undefined;
  const comprehensiveObj = (answers as Record<string, unknown>)?.comprehensive as Record<string, unknown> | undefined;
  
  // Use comprehensive if available, fallback to v21
  const foundation = (comprehensiveObj?.foundation as Record<string, unknown> | undefined) || 
                     (v21Obj?.foundation as Record<string, unknown> | undefined) || {};
  const move = (comprehensiveObj?.move as Record<string, unknown> | undefined) || 
               (v21Obj?.move as Record<string, unknown> | undefined) || {};

  const serviceYears = String(foundation?.serviceYears || '');
  const familySnapshot = String(foundation?.familySnapshot || 'none'); // Fixed: was move?.familySnapshot
  const efmp = Boolean(foundation?.efmpEnrolled); // Fixed: was foundation?.efmp
  const pcsSituation = String(move?.pcsSituation || '');
  const hasAssessment = Object.keys(answers).length > 0;

  // Load user profile
  const { data: profileRow } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
  const profileComplete = profileRow?.profile_completed || false;

  const yearsMap: Record<string,string> = { '0-4': '0-4 Years Service', '5-10': '5-10 Years', '11-15': '11-15 Years', '16+': '16+ Years' };
  const serviceDisplay = yearsMap[serviceYears] || 'Service Member';
  
  const familyMap: Record<string,string> = { none: 'No Children', young_children: 'Young Children', school_age: 'School-Age Kids', mixed: 'Mixed Ages' };
  const familyDisplay = familyMap[familySnapshot] || familySnapshot;
  
  const pcsMap: Record<string,string> = { arrived: 'Just Arrived', dwell: 'Dwell Time', window: 'PCS Window', orders: 'Orders in Hand', none: 'No PCS Expected' };
  const pcsDisplay = pcsMap[pcsSituation] || 'Status Unknown';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageHeader 
            title={`Welcome back, ${user.firstName || 'Commander'}! 👋`}
            subtitle="Your military life command center"
            right={
              isPremium ? (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-sm font-black text-gray-900 shadow-lg">
                  ⭐ Premium Member
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-sm font-semibold text-gray-700">
                  Free Preview
                </div>
              )
            }
          />

          {/* Profile completion CTA - only show if profile not complete */}
          {!profileComplete && (
            <AnimatedCard className="mb-8 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 border-2 border-amber-200" delay={0}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">📝</div>
                <div className="flex-1">
                  <h2 className="text-xl font-serif font-bold text-text mb-1">Boost personalization with your profile</h2>
                  <p className="text-muted mb-3">Add rank, branch, move timeline, and goals to get sharper AI recommendations.</p>
                  <Link href="/dashboard/profile/setup" className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow">
                    Complete your profile →
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
              <AnimatedCard className="mb-8 p-8" delay={0}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-text">Your Profile</h2>
                  <Link href="/dashboard/profile/setup" className="text-sm text-blue-600 hover:underline font-semibold">
                    {profileComplete ? 'Edit' : 'Complete Profile'}
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Military Identity */}
                  {(profileRow?.rank || profileRow?.branch) && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted font-medium">Military</div>
                        <div className="text-lg font-bold text-text">
                          {profileRow?.rank || 'Service Member'}
                        </div>
                        {profileRow?.branch && (
                          <div className="text-sm text-muted">{profileRow.branch}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Location & PCS */}
                  {(profileRow?.current_base || profileRow?.pcs_date) && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📍</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted font-medium">Station</div>
                        <div className="text-lg font-bold text-text">
                          {profileRow?.current_base || 'Unknown'}
                        </div>
                        {profileRow?.pcs_date && (
                          <div className="text-sm text-muted">
                            PCS: {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Family */}
                  {(profileRow?.marital_status || profileRow?.num_children !== null) && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">👨‍👩‍👧‍👦</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted font-medium">Family</div>
                        <div className="text-lg font-bold text-text capitalize">
                          {profileRow?.marital_status || 'Not specified'}
                        </div>
                        {profileRow?.num_children !== null && profileRow?.num_children > 0 && (
                          <div className="text-sm text-muted">
                            {profileRow.num_children} {profileRow.num_children === 1 ? 'child' : 'children'}
                            {profileRow?.has_efmp && <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">EFMP</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Financial Snapshot */}
                  {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range) && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted font-medium">Finances</div>
                        {profileRow?.tsp_balance_range && (
                          <div className="text-sm text-text">
                            TSP: <span className="font-semibold">{profileRow.tsp_balance_range}</span>
                          </div>
                        )}
                        {profileRow?.debt_amount_range && (
                          <div className="text-sm text-text">
                            Debt: <span className="font-semibold">{profileRow.debt_amount_range}</span>
                          </div>
                        )}
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
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profileRow?.career_interests?.length > 0 && (
                        <div>
                          <div className="text-sm text-muted font-medium mb-2">Career Interests</div>
                          <div className="flex flex-wrap gap-2">
                            {profileRow.career_interests.map((interest: string) => (
                              <span key={interest} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profileRow?.financial_priorities?.length > 0 && (
                        <div>
                          <div className="text-sm text-muted font-medium mb-2">Financial Priorities</div>
                          <div className="flex flex-wrap gap-2">
                            {profileRow.financial_priorities.map((priority: string) => (
                              <span key={priority} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
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
                <AnimatedCard className="mb-8 p-8" delay={50}>
                  <h2 className="text-2xl font-serif font-bold text-text mb-6">Your Timeline</h2>
                  <div className="space-y-6">
                    {/* PCS Timeline */}
                    {profileRow?.pcs_date && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📍</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-muted font-medium">PCS Move</div>
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
                          <div className="text-lg font-bold text-text">
                            {new Date(profileRow.pcs_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          {profileRow?.next_base && (
                            <div className="text-sm text-muted">→ {profileRow.next_base}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deployment Status */}
                    {profileRow?.deployment_status && profileRow.deployment_status !== 'never' && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🌍</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-muted font-medium mb-2">Deployment</div>
                          <div className="text-lg font-bold text-text capitalize">
                            {profileRow.deployment_status.replace('-', ' ')}
                          </div>
                          {profileRow.deployment_count > 0 && (
                            <div className="text-sm text-muted">{profileRow.deployment_count} deployment{profileRow.deployment_count > 1 ? 's' : ''} completed</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* Financial Snapshot */}
              {(profileRow?.tsp_balance_range || profileRow?.debt_amount_range || profileRow?.emergency_fund_range) && (
                <AnimatedCard className="mb-8 p-8" delay={100}>
                  <h2 className="text-2xl font-serif font-bold text-text mb-6">Financial Snapshot</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profileRow?.tsp_balance_range && profileRow.tsp_balance_range !== 'prefer-not-to-say' && (
                      <div>
                        <div className="text-sm text-muted font-medium mb-2">TSP Balance</div>
                        <div className="text-2xl font-bold text-green-600">{profileRow.tsp_balance_range}</div>
                      </div>
                    )}
                    {profileRow?.debt_amount_range && profileRow.debt_amount_range !== 'prefer-not-to-say' && (
                      <div>
                        <div className="text-sm text-muted font-medium mb-2">Debt</div>
                        <div className="text-2xl font-bold text-red-600">{profileRow.debt_amount_range}</div>
                      </div>
                    )}
                    {profileRow?.emergency_fund_range && profileRow.emergency_fund_range !== 'prefer-not-to-say' && (
                      <div>
                        <div className="text-sm text-muted font-medium mb-2">Emergency Fund</div>
                        <div className="text-2xl font-bold text-blue-600">{profileRow.emergency_fund_range}</div>
                      </div>
                    )}
                  </div>
                  {profileRow?.financial_priorities && profileRow.financial_priorities.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="text-sm text-muted font-medium mb-3">Your Focus Areas</div>
                      <div className="flex flex-wrap gap-2">
                        {profileRow.financial_priorities.map((priority: string) => (
                          <span key={priority} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium capitalize">
                            {priority}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              )}

              {/* Plan Ready */}
              <AnimatedCard className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 p-8 border-2 border-green-200" delay={100}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-text mb-2">Your Action Plan</h2>
                    <p className="text-muted">Personalized recommendations ready to review</p>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-green-500">
                    <div className="text-center">
                      <div className="text-3xl font-black text-green-600">✓</div>
                      <div className="text-xs text-muted font-semibold">Ready</div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </>
          )}

          {/* Wealth-Builder Tools */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-text mb-6">Wealth-Builder Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard delay={0}>
                <Link href="/dashboard/tools/tsp-modeler" className="block p-6 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      📈
                    </div>
                    <h3 className="text-xl font-bold text-text">TSP Modeler</h3>
                  </div>
                  <p className="text-muted text-sm">Optimize retirement savings allocation</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={100}>
                <Link href="/dashboard/tools/sdp-strategist" className="block p-6 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      💵
                    </div>
                    <h3 className="text-xl font-bold text-text">SDP Strategist</h3>
                  </div>
                  <p className="text-muted text-sm">Maximize deployment windfall</p>
                </Link>
              </AnimatedCard>

              <AnimatedCard delay={200}>
                <Link href="/dashboard/tools/house-hacking" className="block p-6 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🏡
                    </div>
                    <h3 className="text-xl font-bold text-text">House Hacking</h3>
                  </div>
                  <p className="text-muted text-sm">Analyze multi-unit property ROI</p>
                </Link>
              </AnimatedCard>
            </div>
          </div>

          {/* Main CTA */}
          {hasAssessment && (
            <AnimatedCard className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 md:p-12 text-white" delay={300}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-bold mb-4 uppercase tracking-wider">
                    Personalized for You
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black mb-4">
                    Your Military Financial Roadmap is Ready
                  </h2>
                  <p className="text-xl text-slate-200 leading-relaxed">
                    Based on your assessment, we&apos;ve curated the most relevant content from our PCS, Career, Deployment, and Financial hubs.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link 
                    href="/dashboard/plan"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-center"
                  >
                    View My Full Plan →
                  </Link>
                  <Link 
                    href="/dashboard/assessment"
                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-all text-center"
                  >
                    Retake Assessment
                  </Link>
                </div>
              </div>
            </AnimatedCard>
          )}

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
