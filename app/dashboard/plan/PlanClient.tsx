'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import Icon from '@/app/components/ui/Icon';
import { IconName } from '@/app/components/ui/icon-registry';
import FeedbackModal from '@/app/components/plan/FeedbackModal';
import SharePlanButton from '@/app/components/plan/SharePlanButton';

interface ContentBlock {
  id: string;
  title: string;
  domain: string;
  html: string;
  text_content: string;
  est_read_min: number;
  relevanceScore: number;
  relevanceReason: string;
  personalizedIntro: string;
  whyThisMatters: string;
  actionableNextStep: string;
}

interface RecommendedTool {
  toolName: string;
  reason: string;
}

interface PlanData {
  executiveSummary: string;
  primaryFocus: string;
  secondaryFocus: string;
  urgencyLevel: string;
  contentBlocks: ContentBlock[];
  finalRecommendations: string[];
  recommendedTools: RecommendedTool[];
  generatedAt: string;
}

interface PlanClientProps {
  initialPlan: PlanData & {
    version?: number;
    regeneration_count?: number;
    last_regenerated_at?: string;
  };
  isPremium: boolean;
}

type TabType = 'overview' | 'content' | 'tools' | 'action';

const toolPaths: Record<string, string> = {
  'TSP Modeler': '/dashboard/tools/tsp-modeler',
  'PCS Planner': '/dashboard/tools/pcs-planner',
  'House Hacking': '/dashboard/tools/house-hacking',
  'SDP Strategist': '/dashboard/tools/sdp-strategist',
  'Salary Calculator': '/dashboard/tools/salary-calculator',
  'On-Base Savings': '/dashboard/tools/on-base-savings',
};

export default function PlanClient({ initialPlan, isPremium }: PlanClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [readBlocks, setReadBlocks] = useState<Set<string>>(new Set());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Free users see 2 blocks, premium users see all
  const visibleBlocks = isPremium ? initialPlan.contentBlocks : initialPlan.contentBlocks.slice(0, 2);
  const lockedBlocksCount = isPremium ? 0 : Math.max(0, initialPlan.contentBlocks.length - 2);

  // Handle URL hash navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabType;
    if (hash && ['overview', 'content', 'tools', 'action'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `#${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
        // Mark as read when expanded
        setReadBlocks(prevRead => {
          const newReadSet = new Set(prevRead);
          newReadSet.add(blockId);
          return newReadSet;
        });
      }
      return newSet;
    });
  };
  
  const trackCalculatorClick = (toolName: string) => {
    // Track analytics (fire-and-forget)
    void fetch('/api/plan/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'tool_clicked',
        tool_name: toolName
      })
    });
  };

  const urgencyColor = {
    low: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }[initialPlan.urgencyLevel] || 'bg-blue-100 text-blue-800';

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: IconName;
    count: number | string | null;
    locked?: boolean;
  }> = [
    { 
      id: 'overview' as TabType, 
      label: 'Overview', 
      icon: 'File' as IconName,
      count: null 
    },
    { 
      id: 'content' as TabType, 
      label: 'Content', 
      icon: 'BookOpen' as IconName,
      count: isPremium ? initialPlan.contentBlocks.length : `${visibleBlocks.length}/${initialPlan.contentBlocks.length}`,
      locked: !isPremium
    },
    { 
      id: 'tools' as TabType, 
      label: 'Tools', 
      icon: 'Calculator' as IconName,
      count: initialPlan.recommendedTools?.length || 0 
    },
    { 
      id: 'action' as TabType, 
      label: 'Action Plan', 
      icon: 'CheckCircle' as IconName,
      count: initialPlan.finalRecommendations?.length || 0 
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="primary">AI-Curated Plan</Badge>
              {initialPlan.version && initialPlan.version > 1 && (
                <Badge variant="secondary">Version {initialPlan.version}</Badge>
              )}
            </div>
            <SharePlanButton className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all" />
          </div>
          <PageHeader 
            title="Your Personalized Financial Plan"
            subtitle={
              initialPlan.last_regenerated_at 
                ? `Last updated ${new Date(initialPlan.last_regenerated_at).toLocaleDateString()} • ${initialPlan.regeneration_count || 0} regenerations`
                : "AI-selected expert content tailored to your military situation"
            }
          />

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Plan sections">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => changeTab(tab.id)}
                      className={`
                        group relative inline-flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm whitespace-nowrap transition-all
                        ${isActive 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-text-muted hover:text-text hover:border-border-hover'
                        }
                      `}
                    >
                      <Icon name={tab.icon} className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span className={`
                          inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold
                          ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {tab.count}
                        </span>
                      )}
                      {tab.locked && !isPremium && (
                        <Icon name="Lock" className="w-3 h-3 text-orange-500" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[60vh]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Executive Summary */}
                <AnimatedCard>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-serif font-bold text-text">Executive Summary</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${urgencyColor}`}>
                        {initialPlan.urgencyLevel.charAt(0).toUpperCase() + initialPlan.urgencyLevel.slice(1)} Priority
                      </span>
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-text-body whitespace-pre-line mb-6">
                      {isPremium 
                        ? initialPlan.executiveSummary 
                        : initialPlan.executiveSummary?.split('\n\n').slice(0, 2).join('\n\n')}
                      {!isPremium && initialPlan.executiveSummary?.split('\n\n').length > 2 && (
                        <div className="mt-4 p-4 bg-info-subtle rounded-lg border border-info">
                          <p className="text-blue-900 font-semibold mb-2">💎 Complete summary available with premium</p>
                          <Link 
                            href="/dashboard/upgrade"
                            className="text-info hover:text-info font-semibold text-sm underline"
                          >
                            Unlock full executive summary →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Focus Areas */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-info-subtle rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Target" className="w-5 h-5 text-info" />
                          <span className="font-semibold text-text">Primary Focus</span>
                        </div>
                        <p className="text-text-body">{initialPlan.primaryFocus}</p>
                      </div>
                      <div className="bg-success-subtle rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="TrendingUp" className="w-5 h-5 text-success" />
                          <span className="font-semibold text-text">Secondary Focus</span>
                        </div>
                        <p className="text-text-body">{initialPlan.secondaryFocus}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Plan Stats */}
                <AnimatedCard>
                  <div className="p-8">
                    <h3 className="text-xl font-serif font-bold text-text mb-6">Your Plan at a Glance</h3>
                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-info-subtle rounded-full mb-3">
                          <Icon name="BookOpen" className="w-8 h-8 text-info" />
                        </div>
                        <div className="text-3xl font-bold text-text mb-1">
                          {isPremium ? initialPlan.contentBlocks.length : `${visibleBlocks.length}/${initialPlan.contentBlocks.length}`}
                        </div>
                        <div className="text-sm text-text-muted">Curated Articles</div>
                        {!isPremium && lockedBlocksCount > 0 && (
                          <button
                            onClick={() => changeTab('content')}
                            className="mt-2 text-xs text-info hover:text-info font-semibold"
                          >
                            Preview available →
                          </button>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-subtle rounded-full mb-3">
                          <Icon name="Calculator" className="w-8 h-8 text-success" />
                        </div>
                        <div className="text-3xl font-bold text-text mb-1">{initialPlan.recommendedTools?.length || 0}</div>
                        <div className="text-sm text-text-muted">Recommended Tools</div>
                        <button
                          onClick={() => changeTab('tools')}
                          className="mt-2 text-xs text-success hover:text-success font-semibold"
                        >
                          View tools →
                        </button>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                          <Icon name="CheckCircle" className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-text mb-1">{initialPlan.finalRecommendations?.length || 0}</div>
                        <div className="text-sm text-text-muted">Action Items</div>
                        <button
                          onClick={() => changeTab('action')}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          See actions →
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Quick Navigation */}
                <AnimatedCard>
                  <div className="p-8">
                    <h3 className="text-xl font-serif font-bold text-text mb-4">Explore Your Plan</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => changeTab('content')}
                        className="flex items-start gap-4 p-4 bg-info-subtle rounded-lg hover:bg-info-subtle transition-colors text-left"
                      >
                        <Icon name="BookOpen" className="w-6 h-6 text-info flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-text mb-1">Read Curated Content</div>
                          <div className="text-sm text-text-body">
                            {isPremium 
                              ? `Dive into ${initialPlan.contentBlocks.length} hand-selected articles` 
                              : `Preview ${visibleBlocks.length} articles, unlock ${lockedBlocksCount} more`
                            }
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => changeTab('tools')}
                        className="flex items-start gap-4 p-4 bg-success-subtle rounded-lg hover:bg-success-subtle transition-colors text-left"
                      >
                        <Icon name="Calculator" className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-text mb-1">Try Recommended Calculators</div>
                          <div className="text-sm text-text-body">Use AI-recommended tools for your situation</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </AnimatedCard>

                {/* CTA for free users */}
                {!isPremium && lockedBlocksCount > 0 && (
                  <AnimatedCard className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                        <Icon name="Lock" className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-3">
                        Unlock Your Complete Plan
                      </h3>
                      <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                        Get access to {lockedBlocksCount} more curated articles, complete executive summary, and full AI analysis tailored to your military financial situation.
                      </p>
                      <Link
                        href="/dashboard/upgrade"
                        className="inline-block px-8 py-4 bg-surface text-blue-900 font-bold rounded-lg hover:bg-info-subtle transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        Upgrade to Premium - $9.99/month
                      </Link>
                    </div>
                  </AnimatedCard>
                )}
              </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Progress Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-text">
                      Your Curated Content
                    </h2>
                    <p className="text-text-muted mt-1">
                      {isPremium 
                        ? `${initialPlan.contentBlocks.length} articles hand-selected by AI for your situation`
                        : `Previewing ${visibleBlocks.length} of ${initialPlan.contentBlocks.length} articles`
                      }
                    </p>
                  </div>
                  {isPremium && readBlocks.size > 0 && (
                    <div className="text-right">
                      <div className="text-sm text-text-muted mb-1">Reading Progress</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-surface-hover rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-info transition-all duration-300"
                            style={{ width: `${(readBlocks.size / initialPlan.contentBlocks.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-text">
                          {readBlocks.size}/{initialPlan.contentBlocks.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Blocks */}
                <div className="space-y-4">
                  {visibleBlocks.map((block, index) => (
                    <AnimatedCard key={block.id} className="overflow-hidden">
                      <div className="p-6">
                        {/* Block Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                readBlocks.has(block.id) 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {readBlocks.has(block.id) ? '✓' : index + 1}
                              </span>
                              <Badge variant="secondary"><span className="capitalize">{block.domain}</span></Badge>
                              <span className="text-sm text-text-muted">{block.est_read_min} min read</span>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-text mb-2">
                              {block.title}
                            </h3>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-1">
                              <Icon name="Star" className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-semibold text-text">
                                {block.relevanceScore.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AI-Generated Personalized Context */}
                        <div className="bg-info-subtle rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Icon name="Sparkles" className="w-5 h-5 text-info flex-shrink-0 mt-1" />
                            <div>
                              <p className="text-sm font-semibold text-text mb-1">Why This Matters For You</p>
                              <p className="text-sm text-text-body">{block.whyThisMatters}</p>
                            </div>
                          </div>
                        </div>

                        {/* Personalized Introduction */}
                        {block.personalizedIntro && (
                          <div className="mb-4">
                            <p className="text-text-body italic">
                              {block.personalizedIntro}
                            </p>
                          </div>
                        )}

                        {/* Content Preview / Full Content */}
                        <div className={`${!expandedBlocks.has(block.id) ? 'max-h-32 overflow-hidden relative' : ''}`}>
                          <div 
                            className="prose prose-sm max-w-none text-text-body"
                            dangerouslySetInnerHTML={{ __html: block.html }}
                          />
                          {!expandedBlocks.has(block.id) && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                          )}
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleBlock(block.id)}
                          className="mt-4 text-info hover:text-info font-semibold text-sm flex items-center gap-2"
                        >
                          {expandedBlocks.has(block.id) ? (
                            <>
                              <Icon name="ChevronUp" className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <Icon name="ChevronDown" className="w-4 h-4" />
                              Read Full Article
                            </>
                          )}
                        </button>

                        {/* Action Step */}
                        {block.actionableNextStep && (
                          <div className="mt-4 bg-success-subtle rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Icon name="CheckCircle" className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-sm font-semibold text-text mb-1">Your Next Step</p>
                                <p className="text-sm text-text-body">{block.actionableNextStep}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </AnimatedCard>
                  ))}
                  
                  {/* Upgrade CTA for Free Users */}
                  {!isPremium && lockedBlocksCount > 0 && (
                    <AnimatedCard className="mt-6 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                          <Icon name="Lock" className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-3">
                          Unlock {lockedBlocksCount} More Curated Blocks
                        </h3>
                        <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                          AI has selected {lockedBlocksCount} additional expert content blocks specifically for your situation. Upgrade to premium to access your complete personalized plan with all recommendations and action items.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <Link
                            href="/dashboard/upgrade"
                            className="px-8 py-4 bg-surface text-blue-900 font-bold rounded-lg hover:bg-info-subtle transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          >
                            Unlock Full Plan - $9.99/month
                          </Link>
                        </div>
                      </div>
                    </AnimatedCard>
                  )}
                </div>
              </div>
            )}

            {/* TOOLS TAB */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                <AnimatedCard>
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-text mb-2">
                        Recommended Calculators
                      </h2>
                      <p className="text-text-body">
                        Based on your military situation and goals, these calculators will help you make informed financial decisions.
                      </p>
                    </div>

                    {initialPlan.recommendedTools && initialPlan.recommendedTools.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {initialPlan.recommendedTools.map((tool, index) => (
                          <Link
                            key={index}
                            href={toolPaths[tool.toolName] || '/dashboard/tools'}
                            onClick={() => trackCalculatorClick(tool.toolName)}
                            className="block bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all border border-slate-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-info rounded-lg flex items-center justify-center">
                                <Icon name="Calculator" className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-bold text-text text-lg">{tool.toolName}</p>
                                  <Icon name="ChevronRight" className="w-4 h-4 text-info" />
                                </div>
                                <p className="text-sm text-text-body mb-3">{tool.reason}</p>
                                <div className="inline-flex items-center gap-1 text-xs font-semibold text-info">
                                  <span>Try Calculator</span>
                                  <Icon name="ChevronRight" className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-hover rounded-full mb-4">
                          <Icon name="Calculator" className="w-8 h-8 text-muted" />
                        </div>
                        <p className="text-text-muted">No specific calculator recommendations for this plan.</p>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-border">
                      <div className="bg-success-subtle rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <Icon name="HelpCircle" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-text mb-1">All calculators are free to use</p>
                            <p className="text-sm text-text-body">
                              Every calculator includes AI-powered explanations. Premium members get full AI analysis, while free users see previews.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* All Tools Link */}
                <AnimatedCard>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text mb-1">Explore All Calculators</p>
                        <p className="text-sm text-text-muted">Access all 6 financial and planning calculators</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-info text-white font-semibold rounded-lg hover:bg-info transition-colors"
                      >
                        View All Tools
                      </Link>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* ACTION PLAN TAB */}
            {activeTab === 'action' && (
              <div className="space-y-6">
                <AnimatedCard>
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-text mb-2">
                        Your Action Plan
                      </h2>
                      <p className="text-text-body">
                        Prioritized next steps based on your AI-curated financial plan. Start with action #1 and work your way through.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {initialPlan.finalRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-lg border border-slate-200">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-info text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-text-body">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>

                {/* Next Steps */}
                <AnimatedCard>
                  <div className="p-8">
                    <h3 className="text-xl font-serif font-bold text-text mb-4">What&apos;s Next?</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-info-subtle rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="BookOpen" className="w-5 h-5 text-info" />
                          <span className="font-semibold text-text">Read the Content</span>
                        </div>
                        <p className="text-sm text-text-body mb-3">
                          Review the {isPremium ? initialPlan.contentBlocks.length : visibleBlocks.length} curated articles for detailed guidance
                        </p>
                        <button
                          onClick={() => changeTab('content')}
                          className="text-sm text-info hover:text-info font-semibold"
                        >
                          Go to Content →
                        </button>
                      </div>
                      <div className="bg-success-subtle rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Calculator" className="w-5 h-5 text-success" />
                          <span className="font-semibold text-text">Use the Tools</span>
                        </div>
                        <p className="text-sm text-text-body mb-3">
                          Try the {initialPlan.recommendedTools?.length || 0} recommended calculators for your situation
                        </p>
                        <button
                          onClick={() => changeTab('tools')}
                          className="text-sm text-success hover:text-success font-semibold"
                        >
                          Go to Tools →
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* CTA Section */}
                <AnimatedCard>
                  <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-text mb-1">Need to update your plan?</p>
                        <p className="text-sm text-text-muted">
                          {isPremium 
                            ? 'You can retake the assessment up to 3 times per day to regenerate your plan.'
                            : 'Upgrade to premium to regenerate your plan up to 3 times per day as your situation changes.'
                          }
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href="/dashboard"
                          className="px-6 py-3 border-2 border-blue-600 text-info font-semibold rounded-lg hover:bg-info-subtle transition-colors text-center"
                        >
                          Return to Dashboard
                        </Link>
                        {!isPremium && (
                          <Link
                            href="/dashboard/upgrade"
                            className="px-6 py-3 bg-info text-white font-semibold rounded-lg hover:bg-info transition-colors text-center"
                          >
                            Upgrade to Premium
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Floating Feedback Button */}
      {!feedbackSubmitted && (
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="fixed bottom-8 right-8 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full font-semibold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all flex items-center gap-2 z-40"
        >
          <Icon name="MessageCircle" className="h-5 w-5" />
          <span className="hidden sm:inline">Rate This Plan</span>
          <span className="sm:hidden">Rate Plan</span>
        </button>
      )}
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={() => {
          setFeedbackSubmitted(true);
          setShowFeedbackModal(false);
        }}
      />
    </>
  );
}
