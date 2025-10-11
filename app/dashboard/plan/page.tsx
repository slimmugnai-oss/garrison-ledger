'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import DownloadGuideButton from '@/app/components/DownloadGuideButton';
import { useUser } from '@clerk/nextjs';

type CuratedBlock = {
  slug: string;
  title: string;
  html: string;
  why: string;
  topics?: string[];
};

type StrategicPlanData = {
  primarySituation: string;
  priorityAction: string;
  blocks: CuratedBlock[];
};

export default function ExecutiveBriefing() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<StrategicPlanData | null>(null);

  useEffect(() => {
    async function loadPlan() {
      try {
        const r = await fetch('/api/strategic-plan', { cache: 'no-store' });
        if (!r.ok) {
          setLoading(false);
          return;
        }
        const data = await r.json();
        setPlan(data);
      } catch (e) {
        console.error('Error loading strategic plan:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
              <p className="text-xl text-gray-600">Generating your Executive Briefing...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <Header />
        <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-6">📋</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Required</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Complete the Strategic Assessment to generate your personalized Executive Briefing.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                Take Assessment
              </Link>
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
        {/* Premium Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-12 md:py-20 border-b-4 border-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center px-3 py-1 bg-blue-600/30 border border-blue-400/40 rounded-full text-blue-200 text-sm font-semibold mb-4">
                  Executive Briefing
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                  {user?.firstName || 'Your'}&apos;s Military Financial Roadmap
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  <strong className="text-white">{plan.primarySituation}</strong> · Personalized recommendations based on your current situation
                </p>
              </div>
              <div className="flex-shrink-0">
                <DownloadGuideButton />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Priority Action Card */}
          <div className="mb-12 bg-gradient-to-br from-amber-50 to-orange-50 border-l-8 border-amber-500 rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">!</span>
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                  Your #1 Priority
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {plan.priorityAction}
                </p>
              </div>
            </div>
          </div>

          {/* Curated Action Plan */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Curated Action Plan</h2>
            <p className="text-lg text-gray-600">
              {plan.blocks.length} essential {plan.blocks.length === 1 ? 'resource' : 'resources'} selected specifically for your situation
            </p>
          </div>

          {/* Content Blocks - Magazine Style */}
          <div className="space-y-12">
            {plan.blocks.map((block, idx) => (
              <article key={block.slug} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-8 md:p-10">
                  {/* Two-Column Layout */}
                  <div className="grid lg:grid-cols-[1fr,360px] gap-10">
                    {/* Main Content Column */}
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                        {block.title}
                      </h3>
                      
                      {block.topics && block.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
                          {block.topics.map((t) => (
                            <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Rich HTML Content with Premium Typography */}
                      <div 
                        className="prose prose-lg prose-slate max-w-none
                          prose-headings:font-bold prose-headings:text-gray-900
                          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                          prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                          prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
                          prose-ul:my-4 prose-ul:space-y-2
                          prose-ol:my-4 prose-ol:space-y-2
                          prose-li:text-gray-700 prose-li:leading-relaxed
                          prose-strong:text-gray-900 prose-strong:font-bold
                          prose-em:text-gray-700 prose-em:italic
                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-gray-800
                          prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          prose-table:border-collapse prose-table:w-full
                          prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-bold
                          prose-td:p-3 prose-td:border-t prose-td:border-slate-200"
                        dangerouslySetInnerHTML={{ __html: block.html }}
                      />
                    </div>

                    {/* Sticky Sidebar */}
                    <aside className="lg:sticky lg:top-24 self-start">
                      {/* Why This Matters Callout */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg mb-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">?</span>
                          </div>
                          <h4 className="font-black text-blue-900 text-lg">Why This Matters</h4>
                        </div>
                        <p className="text-blue-900 leading-relaxed font-medium">{block.why}</p>
                      </div>

                      {/* Sequential Navigation */}
                      {idx < plan.blocks.length - 1 && (
                        <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                          <div className="text-sm text-slate-600 font-semibold mb-2">Next Up</div>
                          <div className="text-slate-900 font-medium">{plan.blocks[idx + 1].title}</div>
                        </div>
                      )}
                    </aside>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Back to Dashboard CTA */}
          <div className="mt-16 text-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              ← Back to Command Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
