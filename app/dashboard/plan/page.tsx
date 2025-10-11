'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { runPlanRules, scoreResources } from '@/lib/plan/rules';
import ResourcesList from '@/app/components/ResourcesList';
import DownloadGuideButton from '@/app/components/DownloadGuideButton';
import toolkitData from '@/public/toolkit-map.json';

type Item = { title: string; url: string; tags: string[] };
type AssessmentAnswers = Record<string, unknown>;
type PlanBlock = { source_page: string; slug: string; title: string; html: string; tags: string[]; horder: number };

export default function PlanPage() {
  const [answers, setAnswers] = useState<AssessmentAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [ranked, setRanked] = useState<Item[]>([]);
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const [stageSummary, setStageSummary] = useState<string>("");
  const [tools, setTools] = useState<{ tspHref: string; sdpHref: string; houseHref: string } | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch('/api/assessment', { cache: 'no-store' });
        const data = await res.json();
        
        if (data.answers) {
          setAnswers(data.answers);
          
          // Run rules engine client-side
          const generatedTags = await runPlanRules(data.answers);
          setTags(generatedTags);
          
          // Score resources
          const scoredResources = scoreResources(generatedTags, toolkitData as Item[]).slice(0, 10);
          setRanked(scoredResources);
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, []);

  useEffect(() => {
    async function loadPlanBlocks() {
      try {
        const r = await fetch('/api/plan', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        setBlocks(j.blocks || []);
        setTools(j.tools || null);
        setStageSummary(j.stageSummary || "");
      } catch (e) {
        console.error('Error loading plan blocks:', e);
      }
    }
    loadPlanBlocks();
  }, []);

  // Deep links to tools from facts
  const personal = (answers as { personal?: { age?: number } })?.personal;
  const timeline = (answers as { timeline?: { sdpAmount?: number } })?.timeline;
  const housing = (answers as { housing?: { bahAmount?: number; houseHackingInterest?: boolean } })?.housing;
  const financial = (answers as { financial?: { tspBalance?: number; tspContribution?: number } })?.financial;

  const age = personal?.age ?? 30;
  const tspBalance = financial?.tspBalance ?? 50000;
  const tspContribution = financial?.tspContribution ?? 500;
  const tspHref = tools?.tspHref || `/dashboard/tools/tsp-modeler?age=${age}&retire=50&bal=${tspBalance}&cont=${tspContribution}&mix=C:70,S:30`;

  const sdpAmount = timeline?.sdpAmount ?? 10000;
  const sdpHref = tools?.sdpHref || `/dashboard/tools/sdp-strategist?amount=${sdpAmount}`;

  const bahAmount = housing?.bahAmount ?? 2400;
  const houseHref = tools?.houseHref || `/dashboard/tools/house-hacking?price=400000&rate=6.5&tax=4800&ins=1600&bah=${bahAmount}&rent=2200`;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your personalized plan...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Personalized Action Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{stageSummary || 'Tailored financial roadmap based on your military service stage and goals'}</p>
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

              {/* Recommended Sections (full content) */}
              {blocks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">🧭</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Recommended Sections for You</h2>
                  </div>
                  <div className="space-y-10">
                    {blocks.map((b) => (
                      <section key={`${b.source_page}:${b.slug}`} id={`cb-${b.slug}`} className="border-t border-gray-200 pt-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{b.title}</h3>
                        <article className="prose max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: b.html }} />
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

