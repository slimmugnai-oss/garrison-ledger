'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import Icon from '@/app/components/ui/Icon';

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
  initialPlan: PlanData;
  isPremium: boolean;
}

const toolPaths: Record<string, string> = {
  'TSP Modeler': '/dashboard/tools/tsp-modeler',
  'PCS Planner': '/dashboard/tools/pcs-planner',
  'House Hacking': '/dashboard/tools/house-hacking',
  'SDP Strategist': '/dashboard/tools/sdp-strategist',
  'Salary Calculator': '/dashboard/tools/salary-calculator',
  'On-Base Savings': '/dashboard/tools/on-base-savings',
};

export default function PlanClient({ initialPlan, isPremium }: PlanClientProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  
  // Free users see 2 blocks, premium users see all
  const visibleBlocks = isPremium ? initialPlan.contentBlocks : initialPlan.contentBlocks.slice(0, 2);
  const lockedBlocksCount = isPremium ? 0 : Math.max(0, initialPlan.contentBlocks.length - 2);

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const urgencyColor = {
    low: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }[initialPlan.urgencyLevel] || 'bg-blue-100 text-blue-800';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="primary">AI-Curated Plan</Badge>
          </div>
          <PageHeader 
            title="Your Personalized Financial Plan"
            subtitle="AI-selected expert content tailored to your military situation"
          />

          {/* Executive Summary */}
          <AnimatedCard className="mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-text">Executive Summary</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${urgencyColor}`}>
                  {initialPlan.urgencyLevel.charAt(0).toUpperCase() + initialPlan.urgencyLevel.slice(1)} Priority
                </span>
              </div>
              
              <div className="prose prose-lg max-w-none text-text-body whitespace-pre-line">
                {isPremium 
                  ? initialPlan.executiveSummary 
                  : initialPlan.executiveSummary?.split('\n\n').slice(0, 2).join('\n\n')}
                {!isPremium && initialPlan.executiveSummary?.split('\n\n').length > 2 && (
                  <div className="mt-4 text-blue-600 font-semibold">
                    ... Upgrade to read complete executive summary
                  </div>
                )}
              </div>

              {/* Focus Areas */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Target" className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-text">Primary Focus</span>
                  </div>
                  <p className="text-text-body">{initialPlan.primaryFocus}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="TrendingUp" className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-text">Secondary Focus</span>
                  </div>
                  <p className="text-text-body">{initialPlan.secondaryFocus}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Content Blocks */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-text mb-4">
              Your Curated Content ({isPremium ? initialPlan.contentBlocks.length : `${visibleBlocks.length} of ${initialPlan.contentBlocks.length}`} Articles)
            </h2>
            <p className="text-text-body mb-6">
              {isPremium 
                ? 'Each piece of content has been hand-selected by AI based on your specific military situation, goals, and priorities.'
                : 'Preview of AI-curated content blocks. Upgrade to unlock all blocks with complete analysis and recommendations.'}
            </p>

            <div className="space-y-4">
              {visibleBlocks.map((block, index) => (
                <AnimatedCard key={block.id} className="overflow-hidden">
                  <div className="p-6">
                    {/* Block Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                            {index + 1}
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
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Icon name="Sparkles" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
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
                      className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
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
                      <div className="mt-4 bg-green-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
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
                    <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
                      AI has selected {lockedBlocksCount} additional expert content blocks specifically for your situation. Upgrade to premium to access your complete personalized plan with all recommendations and action items.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link
                        href="/dashboard/upgrade"
                        className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        Unlock Full Plan - $9.99/month
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
                      >
                        Back to Dashboard
                      </Link>
                    </div>
                  </div>
                </AnimatedCard>
              )}
            </div>
          </div>

          {/* Recommended Tools */}
          {initialPlan.recommendedTools && initialPlan.recommendedTools.length > 0 && (
            <AnimatedCard className="mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold text-text mb-4">
                  Recommended Calculators
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {initialPlan.recommendedTools.map((tool, index) => (
                    <Link
                      key={index}
                      href={toolPaths[tool.toolName] || '/dashboard/tools'}
                      className="block bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon name="Calculator" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-text mb-1">{tool.toolName}</p>
                          <p className="text-sm text-text-body">{tool.reason}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Final Recommendations */}
          <AnimatedCard>
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold text-text mb-4">
                Your Action Plan
              </h2>
              <div className="space-y-3">
                {initialPlan.finalRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-text-body flex-1">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Return to Dashboard
                  </Link>
                  {!isPremium && (
                    <Link
                      href="/dashboard/upgrade"
                      className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      Upgrade to See Full Plan
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

