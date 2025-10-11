import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default async function CommandDashboard() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Load assessment to populate profile snapshot
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: aRow } = await supabase.from("assessments").select("answers").eq("user_id", user.id).maybeSingle();
  const answers = (aRow?.answers || {}) as Record<string, unknown>;
  const v21 = (answers as Record<string, unknown>)?.v21 as Record<string, unknown> | undefined || {};

  // Extract profile data
  const serviceYears = String(v21?.foundation?.serviceYears || '');
  const familySnapshot = String(v21?.move?.familySnapshot || 'none');
  const efmp = Boolean(v21?.foundation?.efmp);
  const pcsSituation = String(v21?.move?.pcsSituation || '');
  const hasAssessment = Object.keys(answers).length > 0;

  // Profile summary strings
  const yearsMap: Record<string,string> = { '0-4': '0-4 Years Service', '5-10': '5-10 Years', '11-15': '11-15 Years', '16+': '16+ Years' };
  const serviceDisplay = yearsMap[serviceYears] || 'Service Member';
  
  const familyMap: Record<string,string> = { none: 'No Children', young_children: 'Young Children', school_age: 'School-Age Kids', mixed: 'Mixed Ages' };
  const familyDisplay = familyMap[familySnapshot] || familySnapshot;
  
  const pcsMap: Record<string,string> = { arrived: 'Just Arrived', dwell: 'Dwell Time', window: 'PCS Window', orders: 'Orders in Hand', none: 'No PCS Expected' };
  const pcsDisplay = pcsMap[pcsSituation] || 'Status Unknown';

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Welcome Widget */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName || 'Commander'}! 👋
            </h1>
            <p className="text-lg text-gray-600">Your military financial command center</p>
          </div>

          {!hasAssessment && (
            <div className="mb-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📋</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">Get Your Personalized Plan</h2>
                  <p className="text-xl text-blue-100 mb-6">
                    Complete the 5-minute assessment to unlock your tailored Military Financial Roadmap with curated content from our toolkit hubs.
                  </p>
                  <Link 
                    href="/dashboard/assessment"
                    className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold transition-colors text-lg shadow-lg"
                  >
                    Start Assessment →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {hasAssessment && (
            <>
              {/* Profile Snapshot Widget */}
              <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Snapshot</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Service</div>
                      <div className="text-lg font-bold text-gray-900">{serviceDisplay}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Family</div>
                      <div className="text-lg font-bold text-gray-900">
                        {familyDisplay}
                        {efmp && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">EFMP</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🧭</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Next Move</div>
                      <div className="text-lg font-bold text-gray-900">{pcsDisplay}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Progress Widget */}
              <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Action Plan</h2>
                    <p className="text-gray-600">Personalized recommendations ready to review</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-green-500">
                      <div className="text-center">
                        <div className="text-3xl font-black text-green-600">✓</div>
                        <div className="text-xs text-gray-600 font-semibold">Ready</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Actions Widget */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Wealth-Builder Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/tools/tsp-modeler" className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📈
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">TSP Modeler</h3>
                </div>
                <p className="text-gray-600">Optimize retirement savings allocation</p>
              </Link>

              <Link href="/dashboard/tools/sdp-strategist" className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    💵
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">SDP Strategist</h3>
                </div>
                <p className="text-gray-600">Maximize deployment windfall</p>
              </Link>

              <Link href="/dashboard/tools/house-hacking" className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🏡
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">House Hacking</h3>
                </div>
                <p className="text-gray-600">Analyze multi-unit property ROI</p>
              </Link>
            </div>
          </div>

          {/* Main CTA Widget */}
          {hasAssessment && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)' }}></div>
              </div>
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-4">
                  Personalized for You
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  Your Military Financial Roadmap is Ready
                </h2>
                <p className="text-xl text-slate-200 mb-8 leading-relaxed">
                  Based on your assessment, we&apos;ve curated the most relevant content from our PCS, Career, Deployment, and Financial hubs. View your complete executive briefing with personalized recommendations, priority actions, and interactive tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/dashboard/plan"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold transition-colors text-lg shadow-lg hover:shadow-xl"
                  >
                    View My Full Plan →
                  </Link>
                  <Link 
                    href="/dashboard/assessment"
                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold transition-colors"
                  >
                    Retake Assessment
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!hasAssessment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <Link href="/dashboard/tools" className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Explore All Tools</h3>
                <p className="text-gray-600">Browse our complete suite of financial calculators and planners</p>
              </Link>
              <Link href="/dashboard/directory" className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Provider Directory</h3>
                <p className="text-gray-600">Find vetted financial advisors and service providers</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
