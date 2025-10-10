import { cookies } from 'next/headers';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { runPlanRules, scoreResources } from '@/lib/plan/rules';
import ResourcesList from '@/app/components/ResourcesList';
import DownloadGuideButton from '@/app/components/DownloadGuideButton';

type Item = { title: string; url: string; tags: string[] };

async function getAnswers() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/assessment`, { 
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });
    const j = await res.json().catch(() => ({}));
    return j.answers ?? null;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return null;
  }
}

async function getToolkit(): Promise<Item[]> {
  try {
    // For server-side, we need to read the file directly or fetch it
    const toolkit = await import('@/public/toolkit-map.json');
    return toolkit.default as Item[];
  } catch {
    return [];
  }
}

export default async function PlanPage() {
  const answers = await getAnswers();
  const toolkit = await getToolkit();
  
  // Run rules engine if we have answers
  let tags = new Set<string>();
  let ranked: Item[] = [];
  
  if (answers) {
    tags = await runPlanRules(answers);
    ranked = scoreResources(tags, toolkit).slice(0, 10);
  }

  // Deep links to tools from facts
  const age = answers?.tsp?.age ?? 30;
  const retire = answers?.tsp?.retire ?? 50;
  const tspHref = `/dashboard/tools/tsp-modeler?age=${age}&retire=${retire}&bal=50000&cont=500&mix=C:70,S:30`;

  const sdpAmount = answers?.sdp?.amount ?? 10000;
  const sdpHref = `/dashboard/tools/sdp-strategist?amount=${sdpAmount}`;

  const houseHref = `/dashboard/tools/house-hacking?price=400000&rate=6.5&tax=4800&ins=1600&bah=2400&rent=2200`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Personalized Action Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored financial roadmap based on your military service stage and goals
            </p>
          </div>

          {!answers && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Required</h2>
              <p className="text-gray-600 mb-6">
                Complete the Readiness Assessment to get your personalized plan.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Take Assessment
              </Link>
            </div>
          )}

          {answers && (
            <div className="space-y-8">
              {/* Download Guide Section */}
              <div className="mb-6">
                <DownloadGuideButton />
              </div>

              {/* Priority Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Priority Actions</h2>
                </div>
                <p className="text-gray-600 mb-6">Focus on these next steps:</p>
                <ul className="space-y-4">
                  {tags.has("tool:tsp") && (
                    <li className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-2xl">📈</span>
                      <div>
                        <p className="font-semibold text-gray-900">Optimize Your TSP</p>
                        <p className="text-gray-600 mb-2">Model your TSP strategy and review allocation differences</p>
                        <Link href={tspHref} className="text-blue-600 hover:text-blue-700 underline font-medium">
                          Open TSP Modeler →
                        </Link>
                      </div>
                    </li>
                  )}
                  {tags.has("tool:sdp") && (
                    <li className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="font-semibold text-gray-900">Plan Your SDP Windfall</p>
                        <p className="text-gray-600 mb-2">Compare growth scenarios for your SDP payout</p>
                        <Link href={sdpHref} className="text-green-600 hover:text-green-700 underline font-medium">
                          Open SDP Strategist →
                        </Link>
                      </div>
                    </li>
                  )}
                  {tags.has("tool:house") && (
                    <li className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <span className="text-2xl">🏡</span>
                      <div>
                        <p className="font-semibold text-gray-900">Analyze House Hacking</p>
                        <p className="text-gray-600 mb-2">See if a duplex scenario makes financial sense</p>
                        <Link href={houseHref} className="text-purple-600 hover:text-purple-700 underline font-medium">
                          Open House Calculator →
                        </Link>
                      </div>
                    </li>
                  )}
                  {tags.has("topic:financial_first_aid") && (
                    <li className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-2xl">🚨</span>
                      <div>
                        <p className="font-semibold text-gray-900">Stabilize Cash Flow</p>
                        <p className="text-gray-600">Build emergency buffer and automate bills before investing</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Your Resources */}
              {ranked.length > 0 && (
                <div className="bg-white rounded-xl p-8 border border-gray-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📚</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Recommended Resources</h2>
                  </div>
                  <ResourcesList ranked={ranked} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

