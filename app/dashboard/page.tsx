import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import PageHeader from '../components/ui/PageHeader';
import AnimatedCard from '../components/ui/AnimatedCard';
import StatCard from '../components/ui/StatCard';

export default async function CommandDashboard() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Load assessment and premium status
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Check premium
  let isPremium = false;
  try {
    const { data: entitlement } = await supabase.from("entitlements").select("tier, status").eq("user_id", user.id).single();
    isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';
  } catch {
    isPremium = false;
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
            subtitle="Your military financial command center"
            right={isPremium && (
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full text-sm font-black text-gray-900 shadow-lg">
                ⭐ Premium Member
              </div>
            )}
          />

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
              {/* Profile Snapshot */}
              <AnimatedCard className="mb-8 p-8" delay={0}>
                <h2 className="text-2xl font-serif font-bold text-text mb-6">Profile Snapshot</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted font-medium">Service</div>
                      <div className="text-lg font-bold text-text">{serviceDisplay}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted font-medium">Family</div>
                      <div className="text-lg font-bold text-text">
                        {familyDisplay}
                        {efmp && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-semibold">EFMP</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🧭</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted font-medium">Next Move</div>
                      <div className="text-lg font-bold text-text">{pcsDisplay}</div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

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
