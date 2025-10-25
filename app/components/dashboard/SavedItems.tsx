'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface SavedContent {
  id: string;
  title: string;
  domain: string;
  est_read_min: number;
  content_rating: number;
  type?: string;
}

interface SavedScenario {
  id: string;
  calculator_type: string;
  scenario_name: string;
  inputs: Record<string, unknown>;
  result_summary: string;
  created_at: string;
}

interface SavedItemsProps {
  userId: string;
}

export default function SavedItems({ userId }: SavedItemsProps) {
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'scenarios' | 'all'>('all');

  useEffect(() => {
    fetchSavedItems();
  }, [userId]);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      // Fetch saved content from bookmarks
      const contentResponse = await fetch('/api/bookmarks');
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        const blocks = contentData.bookmarks
          ?.map((b: { content_block: unknown }) => b.content_block)
          .filter(Boolean)
          .slice(0, 6) || [];
        setSavedContent(blocks);
      }

      // Fetch saved calculator scenarios
      const scenariosResponse = await fetch('/api/calculator/scenarios');
      if (scenariosResponse.ok) {
        const scenariosData = await scenariosResponse.json();
        setSavedScenarios(scenariosData.scenarios?.slice(0, 6) || []);
      }
    } catch {
      // Non-critical: Failed to delete - user can retry
    } finally {
      setLoading(false);
    }
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      finance: 'bg-blue-100 text-blue-700 border-blue-200',
      career: 'bg-green-100 text-green-700 border-green-200',
      pcs: 'bg-purple-100 text-purple-700 border-purple-200',
      deployment: 'bg-orange-100 text-orange-700 border-orange-200',
      retirement: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      benefits: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[domain] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getCalculatorIcon = (type: string) => {
    const icons: Record<string, string> = {
      'tsp-modeler': 'BarChart',
      'sdp-strategist': 'PiggyBank',
      'pcs-planner': 'Truck',
      'house-hacking': 'Home',
      'on-base-savings': 'ShoppingCart',
      'salary-calculator': 'Briefcase'
    };
    return icons[type] || 'Calculator';
  };

  const getCalculatorColor = (type: string) => {
    const colors: Record<string, string> = {
      'tsp-modeler': 'text-blue-600',
      'sdp-strategist': 'text-green-600',
      'pcs-planner': 'text-purple-600',
      'house-hacking': 'text-indigo-600',
      'on-base-savings': 'text-orange-600',
      'salary-calculator': 'text-emerald-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const totalSaved = savedContent.length + savedScenarios.length;

  if (loading) {
    return (
      <AnimatedCard className="bg-card border border-border p-8" delay={200}>
        <div className="animate-pulse">
          <div className="h-8 bg-surface-hover rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-hover rounded"></div>
            ))}
          </div>
        </div>
      </AnimatedCard>
    );
  }

  if (totalSaved === 0) {
    return (
      <AnimatedCard className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-8" delay={200}>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="BookOpen" className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">No Saved Items Yet</h3>
          <p className="text-body mb-6">
            Bookmark content from the Intel Library or save calculator scenarios to see them here
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard/library"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Icon name="BookOpen" className="h-4 w-4" />
              Browse Intel Library
            </Link>
            <Link
              href="/dashboard/tools"
              className="inline-flex items-center gap-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Icon name="Calculator" className="h-4 w-4" />
              Use Calculators
            </Link>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  const filteredContent = activeTab === 'scenarios' ? [] : savedContent;
  const filteredScenarios = activeTab === 'content' ? [] : savedScenarios;

  return (
    <AnimatedCard className="bg-card border border-border" delay={200}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Icon name="BookOpen" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black text-text-headings">Your Saved Items</h2>
              <p className="text-sm text-text-body">
                {totalSaved} {totalSaved === 1 ? 'item' : 'items'} saved for quick access
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({totalSaved})
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Content ({savedContent.length})
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'scenarios'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Scenarios ({savedScenarios.length})
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Saved Content */}
          {filteredContent.map((content) => (
            <Link
              key={content.id}
              href={`/dashboard/library?contentId=${content.id}`}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getDomainColor(content.domain)}`}>
                  {content.domain}
                </span>
                <Icon name="BookOpen" className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-primary group-hover:text-blue-600 mb-2 line-clamp-2 transition-colors">
                {content.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{content.est_read_min} min read</span>
                <span className="flex items-center gap-1">
                  <Icon name="Star" className="h-3 w-3 text-yellow-500" />
                  {content.content_rating.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}

          {/* Saved Scenarios */}
          {filteredScenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/dashboard/tools/${scenario.calculator_type}?scenarioId=${scenario.id}`}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <Icon 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={getCalculatorIcon(scenario.calculator_type) as any} // Dynamic icon name 
                  className={`h-5 w-5 ${getCalculatorColor(scenario.calculator_type)}`} 
                />
                <Icon name="Calculator" className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-primary group-hover:text-green-600 mb-2 line-clamp-2 transition-colors">
                {scenario.scenario_name}
              </h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{scenario.result_summary}</p>
              <div className="text-xs text-gray-500">
                {new Date(scenario.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {totalSaved > 6 && (
          <div className="mt-6 text-center">
            <Link
              href={activeTab === 'scenarios' ? '/dashboard/tools' : '/dashboard/library?tab=saved'}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              View All {activeTab === 'all' ? 'Saved Items' : activeTab === 'content' ? 'Content' : 'Scenarios'}
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

