'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import DownloadGuideButton from '@/app/components/DownloadGuideButton';
import { useUser } from '@clerk/nextjs';

// Atomic Component Imports
import ToolCard from '@/app/components/atomic/ToolCard';
import ChecklistCard from '@/app/components/atomic/ChecklistCard';
import ProTipCard from '@/app/components/atomic/ProTipCard';
import GuideCard from '@/app/components/atomic/GuideCard';
import FAQCard from '@/app/components/atomic/FAQCard';
import CalculatorCard from '@/app/components/atomic/CalculatorCard';

type AtomicBlock = {
  slug: string;
  title: string;
  html: string;
  type: string;
  topics: string[];
  why: string;
};

type PlanData = {
  primarySituation: string;
  priorityAction: string;
  blocks: AtomicBlock[];
};

export default function ExecutiveBriefing() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanData | null>(null);

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
        console.error('Error loading plan:', e);
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
              <p className="text-2xl font-semibold text-gray-700">Assembling your Executive Briefing...</p>
              <p className="text-gray-500 mt-2">Selecting the most relevant content for your situation</p>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-gray-200">
              <div className="text-7xl mb-6">📋</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Assessment Required</h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Complete the Strategic Assessment to receive your personalized Executive Briefing with curated content from our toolkit hubs.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-12 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl text-xl"
              >
                Take Assessment →
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-16 md:py-24 border-b-4 border-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-full text-blue-200 text-sm font-bold mb-5 uppercase tracking-wider">
                  Executive Briefing
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
                  {user?.firstName || 'Your'}&apos;s Military Financial Roadmap
                </h1>
                <p className="text-2xl text-slate-300 leading-relaxed">
                  <strong className="text-white">{plan.primarySituation}</strong> · Curated content for your unique situation
                </p>
              </div>
              <div className="flex-shrink-0">
                <DownloadGuideButton />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Priority Action Card */}
          <div className="mb-16 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-l-8 border-amber-500 rounded-2xl shadow-2xl p-10 md:p-12">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-4xl font-black">!</span>
              </div>
              <div>
                <div className="inline-flex items-center px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-black mb-5 uppercase tracking-wide shadow-md">
                  Your #1 Priority
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {plan.priorityAction}
                </p>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Your Curated Action Plan</h2>
            <p className="text-xl text-gray-600">
              {plan.blocks.length} essential {plan.blocks.length === 1 ? 'resource' : 'resources'} selected for your situation
            </p>
          </div>

          {/* Dynamic Atomic Content Blocks */}
          <div className="space-y-12">
            {plan.blocks.map((block, idx) => (
              <div key={block.slug} className="relative">
                {/* Two-Column Layout */}
                <div className="grid lg:grid-cols-[1fr,380px] gap-10">
                  {/* Main Content - Dynamic Component Selection */}
                  <div>
                    {block.type === 'tool' && <ToolCard title={block.title} html={block.html} />}
                    {block.type === 'checklist' && <ChecklistCard title={block.title} html={block.html} />}
                    {block.type === 'pro_tip_list' && <ProTipCard title={block.title} html={block.html} />}
                    {block.type === 'faq_section' && <FAQCard title={block.title} html={block.html} />}
                    {block.type === 'calculator' && <CalculatorCard title={block.title} html={block.html} />}
                    {block.type === 'guide' && <GuideCard title={block.title} html={block.html} />}
                  </div>

                  {/* Sticky Sidebar */}
                  <aside className="lg:sticky lg:top-24 self-start">
                    {/* Why This Matters */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-400 shadow-lg mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-xl">?</span>
                        </div>
                        <h4 className="font-black text-blue-900 text-lg">Why This Matters</h4>
                      </div>
                      <p className="text-blue-900 leading-relaxed font-medium text-base">{block.why}</p>
                    </div>

                    {/* Topic Tags */}
                    {block.topics && block.topics.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                        <div className="text-sm font-semibold text-gray-600 mb-3">Related Topics</div>
                        <div className="flex flex-wrap gap-2">
                          {block.topics.map((t) => (
                            <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sequential Navigation */}
                    {idx < plan.blocks.length - 1 && (
                      <div className="bg-slate-100 rounded-lg p-5 border-2 border-slate-300">
                        <div className="text-sm text-slate-600 font-bold mb-2 uppercase tracking-wide">Next Up</div>
                        <div className="text-slate-900 font-semibold text-base">{plan.blocks[idx + 1].title}</div>
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            ))}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-20 pt-12 border-t-2 border-gray-200 text-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-xl transition-colors"
            >
              <span>←</span>
              <span>Back to Command Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
