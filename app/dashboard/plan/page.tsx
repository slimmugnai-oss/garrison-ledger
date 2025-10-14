'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  generatedAt?: string; // When the plan was last generated
};

export default function ExecutiveBriefing() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [hoursUntilRegen, setHoursUntilRegen] = useState<number | null>(null);

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
        
        // Calculate hours until regeneration available
        if (data.generatedAt) {
          const generated = new Date(data.generatedAt);
          const now = new Date();
          const hoursSince = (now.getTime() - generated.getTime()) / (1000 * 60 * 60);
          const hoursRemaining = Math.max(0, Math.ceil(24 - hoursSince));
          setHoursUntilRegen(hoursRemaining > 0 ? hoursRemaining : null);
        }
      } catch (e) {
        console.error('Error loading plan:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  async function handleRegenerate() {
    setRegenerating(true);
    setRateLimitError(null);
    try {
      const response = await fetch('/api/plan/regenerate', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited
          setRateLimitError(data.message || 'Please wait before regenerating');
          setHoursUntilRegen(data.hoursRemaining || null);
          setRegenerating(false);
          return;
        }
        throw new Error(data.error || 'Failed to regenerate');
      }
      
      // Success - reload to get fresh plan
      router.refresh();
      window.location.reload();
    } catch (e) {
      console.error('Regenerate failed:', e);
      setRateLimitError('Failed to regenerate plan. Please try again.');
      setRegenerating(false);
    }
  }

  if (loading || regenerating) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-primary-accent mb-8"></div>
              <p className="text-2xl font-serif font-bold text-text-headings">
                {regenerating ? 'Regenerating your plan with latest data...' : 'Assembling your Executive Briefing...'}
              </p>
              <p className="text-text-muted mt-2">
                {regenerating ? 'Using your updated profile and assessment' : 'Selecting the most relevant content for your situation'}
              </p>
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
        {/* Compact Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-10 md:py-14 border-b-4 border-primary-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-4xl">
                <div className="inline-flex items-center px-4 py-1.5 bg-primary-accent/30 border-2 border-indigo-400/50 rounded-full text-indigo-200 text-xs font-black mb-3 uppercase tracking-widest">
                  Executive Briefing
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-3 leading-tight">
                  {user?.firstName || 'Your'}&apos;s Military Financial Roadmap
                </h1>
                <p className="text-lg text-slate-200 leading-relaxed">
                  <strong className="text-white font-bold">{plan.primarySituation}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Executive Summary - Compact */}
          {plan.executiveSummary && (
            <div className="mb-10 bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
                <div>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-wide">
                    Executive Summary
                  </div>
                  <h2 className="text-lg font-serif font-bold text-gray-900 mt-1">Your Strategic Overview</h2>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {plan.executiveSummary}
                </p>
              </div>
            </div>
          )}

          {/* Priority Action Card - Compact */}
          <div className="mb-12 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-black">!</span>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                  Your #1 Priority
                </div>
                <p className="text-xl font-serif font-bold text-gray-900 leading-snug">
                  {plan.priorityAction}
                </p>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <SectionHeader icon="📚">
            Your Curated Action Plan
          </SectionHeader>
          <p className="text-xl text-text-body mb-8 -mt-6">
            {plan.blocks.length} essential {plan.blocks.length === 1 ? 'resource' : 'resources'} assembled for your situation
          </p>

          {/* Topic Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {(() => {
                const getDomain = (block: Block): string => {
                  if (block.domain) return block.domain;
                  const slug = block.slug;
                  if (slug.includes('pcs') || slug.includes('move') || slug.includes('station')) return 'pcs';
                  if (slug.includes('career') || slug.includes('tsp') || slug.includes('education') || slug.includes('mycaa')) return 'career';
                  if (slug.includes('deploy') || slug.includes('sdp')) return 'deployment';
                  return 'finance';
                };
                
                const domainCounts = plan.blocks.reduce((acc, block) => {
                  const domain = getDomain(block);
                  acc[domain] = (acc[domain] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const tabs = [
                  { id: 'all', label: 'All Topics', count: plan.blocks.length, icon: '📚' },
                  ...(domainCounts.pcs ? [{ id: 'pcs', label: 'PCS & Moving', count: domainCounts.pcs, icon: '🚚' }] : []),
                  ...(domainCounts.deployment ? [{ id: 'deployment', label: 'Deployment', count: domainCounts.deployment, icon: '🌍' }] : []),
                  ...(domainCounts.career ? [{ id: 'career', label: 'Career', count: domainCounts.career, icon: '💼' }] : []),
                  ...(domainCounts.finance ? [{ id: 'finance', label: 'Finance', count: domainCounts.finance, icon: '💰' }] : []),
                ];
                
                return tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* AI Enhancement Badge + Regenerate Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {plan.aiEnhanced && plan.blocks.some(b => b.aiReason) && (
                <div className="flex-1 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="font-bold text-purple-900">AI-Enhanced Personalization</div>
                    <div className="text-sm text-purple-700">This plan was intelligently curated using GPT-4o to analyze your specific situation</div>
                  </div>
                </div>
              )}
              <button
                onClick={handleRegenerate}
                disabled={regenerating || !!hoursUntilRegen}
                className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title={hoursUntilRegen ? `Available in ${hoursUntilRegen} hour${hoursUntilRegen !== 1 ? 's' : ''}` : ''}
              >
                {regenerating ? 'Regenerating...' : hoursUntilRegen ? `🔒 Available in ${hoursUntilRegen}h` : '🔄 Regenerate Plan'}
              </button>
            </div>
            {rateLimitError && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <div className="font-bold text-amber-900">Rate Limit Active</div>
                    <div className="text-amber-800">{rateLimitError}</div>
                    <div className="text-sm text-amber-700 mt-1">Plans can be regenerated once every 24 hours to ensure optimal AI performance and cost efficiency.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

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

              // Filter domains by active tab
              const filteredDomains = activeTab === 'all' 
                ? domainOrder.filter(d => domainBlocks[d]?.length > 0)
                : [activeTab];

              return filteredDomains.filter(d => domainBlocks[d]?.length > 0).map(domain => {
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
