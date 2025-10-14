'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import SectionHeader from '@/app/components/ui/SectionHeader';
import ContentCard from '@/app/components/ui/ContentCard';
import { useUser } from '@clerk/nextjs';
import Footer from '@/app/components/Footer';

type Block = {
  slug: string;
  title: string;
  html: string;
  type: string;
  domain?: string; // Explicit domain from database
  topics?: string[];
  tags?: string[];
  aiReason?: string; // AI-generated "why this matters"
  score?: number;
  isRecent?: boolean;
};

type Section = {
  domain: string;
  title: string;
  intro: string;
};

type PlanData = {
  primarySituation: string;
  priorityAction: string;
  blocks: Block[];
  aiEnhanced?: boolean; // Flag if AI scoring worked
  executiveSummary?: string | null;
  sections?: Section[];
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
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-primary-accent mb-8"></div>
              <p className="text-2xl font-serif font-bold text-text-headings">Assembling your Executive Briefing...</p>
              <p className="text-text-muted mt-2">Selecting the most relevant content for your situation</p>
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
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="bg-card rounded-3xl shadow-2xl p-16 text-center border-2 border-border">
              <div className="text-8xl mb-8">📋</div>
              <h2 className="text-5xl font-serif font-black text-text-headings mb-6">Assessment Required</h2>
              <p className="text-2xl text-text-body mb-12 max-w-2xl mx-auto leading-relaxed">
                Complete the comprehensive assessment to receive your personalized Executive Briefing.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-block bg-primary-accent hover:bg-primary-hover text-white font-bold py-6 px-14 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl text-xl"
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
      <div className="min-h-screen bg-background">
        {/* Premium Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-20 md:py-28 border-b-4 border-primary-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
              <div className="max-w-4xl">
                <div className="inline-flex items-center px-5 py-2 bg-primary-accent/30 border-2 border-indigo-400/50 rounded-full text-indigo-200 text-sm font-black mb-6 uppercase tracking-widest">
                  Executive Briefing
                </div>
                <h1 className="text-6xl md:text-7xl font-serif font-black tracking-tight mb-6 leading-none">
                  {user?.firstName || 'Your'}&apos;s Military Financial Roadmap
                </h1>
                <p className="text-2xl text-slate-200 leading-relaxed">
                  <strong className="text-white font-bold">{plan.primarySituation}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Executive Summary */}
          {plan.executiveSummary && (
            <div className="mb-16 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 rounded-3xl shadow-2xl p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">📋</span>
                </div>
                <div>
                  <div className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-full text-xs font-black mb-2 uppercase tracking-widest shadow-md">
                    Executive Summary
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-text-headings">Your Strategic Overview</h2>
                </div>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line font-serif">
                  {plan.executiveSummary}
                </p>
              </div>
            </div>
          )}

          {/* Priority Action Card */}
          <div className="mb-20 bg-gradient-to-br from-amber-50 to-orange-50 border-l-8 border-amber-500 rounded-2xl shadow-2xl p-12">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-5xl font-black">!</span>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-5 py-2 bg-amber-500 text-white rounded-full text-sm font-black mb-5 uppercase tracking-widest shadow-md">
                  Your #1 Priority
                </div>
                <p className="text-3xl md:text-4xl font-serif font-bold text-text-headings leading-tight">
                  {plan.priorityAction}
                </p>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <SectionHeader icon="📚">
            Your Curated Action Plan
          </SectionHeader>
          <p className="text-xl text-text-body mb-12 -mt-6">
            {plan.blocks.length} essential {plan.blocks.length === 1 ? 'resource' : 'resources'} assembled for your situation
          </p>

          {/* AI Enhancement Badge - Only show if we actually have AI reasoning */}
          {plan.aiEnhanced && plan.blocks.some(b => b.aiReason) && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-bold text-purple-900">AI-Enhanced Personalization</div>
                <div className="text-sm text-purple-700">This plan was intelligently curated using GPT-4o to analyze your specific situation</div>
              </div>
            </div>
          )}

          {/* Content Blocks - Organized by Domain */}
          <div className="space-y-16">
            {(() => {
              // Group blocks by domain (use explicit domain field, fallback to slug detection)
              const getDomain = (block: Block): string => {
                if (block.domain) return block.domain;
                // Fallback for blocks without domain field
                const slug = block.slug;
                if (slug.includes('pcs') || slug.includes('move') || slug.includes('station')) return 'pcs';
                if (slug.includes('career') || slug.includes('tsp') || slug.includes('education') || slug.includes('mycaa')) return 'career';
                if (slug.includes('deploy') || slug.includes('sdp')) return 'deployment';
                return 'finance';
              };

              const domainBlocks = plan.blocks.reduce((acc, block) => {
                const domain = getDomain(block);
                if (!acc[domain]) acc[domain] = [];
                acc[domain].push(block);
                return acc;
              }, {} as Record<string, Block[]>);

              const domainOrder = ['pcs', 'deployment', 'career', 'finance'];
              const domainIcons: Record<string, string> = {
                pcs: '🚚',
                deployment: '🌍',
                career: '💼',
                finance: '💰'
              };

              return domainOrder.filter(d => domainBlocks[d]?.length > 0).map(domain => {
                const blocks = domainBlocks[domain];
                const sectionMeta = plan.sections?.find(s => s.domain === domain);

                return (
                  <div key={domain} className="border-t-4 border-gray-200 pt-12">
                    {/* Section Header */}
                    <div className="mb-10">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl">{domainIcons[domain]}</span>
                        <h2 className="text-4xl font-serif font-black text-text-headings capitalize">
                          {sectionMeta?.title || domain}
                        </h2>
                      </div>
                      {sectionMeta?.intro && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-xl p-6 shadow-sm">
                          <p className="text-gray-800 leading-relaxed text-lg font-medium">
                            {sectionMeta.intro}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Blocks in this domain */}
                    <div className="space-y-12">
                      {blocks.map((block, index) => (
                        <div key={block.slug}>
                          {/* AI Reasoning (if available) */}
                          {block.aiReason && (
                            <div className="mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-indigo-600 rounded-r-xl p-6 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                    Why This Matters for You
                                  </div>
                                  <p className="text-gray-800 leading-relaxed font-medium">
                                    {block.aiReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Content Card */}
                          <ContentCard
                            title={block.title}
                            html={block.html}
                            type={block.type}
                            topics={block.topics}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Back Link */}
          <div className="mt-24 text-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-3 text-primary-accent hover:text-primary-hover font-bold text-xl transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>Back to Command Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
