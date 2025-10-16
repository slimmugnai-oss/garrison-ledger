'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

interface FeedItem {
  id: string;
  source_id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  published_at: string;
  status: string;
}

function ListeningPostContent() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load feed items
  useEffect(() => {
    const loadFeedItems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedTag !== 'all') {
          params.append('tag', selectedTag);
        }
        
        const response = await fetch(`/api/listening-post?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to load feed');
        
        const data = await response.json();
        setFeedItems(data.items || []);
      } catch (err) {
        console.error('Error loading feed:', err);
        setError('Failed to load news feed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFeedItems();
  }, [selectedTag]);

  const tags = [
    { value: 'all', label: 'All News', icon: 'Globe' },
    { value: 'pcs', label: 'PCS', icon: 'Truck' },
    { value: 'tsp', label: 'TSP', icon: 'TrendingUp' },
    { value: 'deployment', label: 'Deployment', icon: 'Shield' },
    { value: 'bah', label: 'BAH/BAS', icon: 'Home' },
    { value: 'career', label: 'Career', icon: 'Briefcase' },
    { value: 'commissary', label: 'Shopping', icon: 'ShoppingCart' },
  ];

  const getSourceBadge = (sourceId: string) => {
    const sources: Record<string, { name: string; color: string }> = {
      'military-times': { name: 'Military Times', color: 'bg-red-100 text-red-700 border-red-300' },
      'stars-stripes': { name: 'Stars & Stripes', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'task-purpose': { name: 'Task & Purpose', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      'military-com': { name: 'Military.com', color: 'bg-green-100 text-green-700 border-green-300' },
      'dfas': { name: 'DFAS', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    };
    
    const source = sources[sourceId] || { name: sourceId, color: 'bg-gray-100 text-gray-700 border-gray-300' };
    return (
      <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${source.color}`}>
        {source.name}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="Radio" className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-serif">Listening Post</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Real-time military financial news & updates from trusted sources
            </p>
            
            {/* What's the Difference Explainer */}
            <AnimatedCard delay={0}>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Icon name="Info" className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">What&apos;s the Difference?</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">📡 Listening Post (This Page)</div>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Current events & breaking news</strong> from Military Times, Stars & Stripes, and other trusted sources. 
                          Updated daily. Great for staying informed.
                        </p>
                      </div>
                      <div>
                        <div className="font-semibold text-green-600 dark:text-green-400 mb-1">📚 Intelligence Library</div>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>410+ expert-curated content blocks</strong> used by our AI to build your personalized plan. 
                          Evergreen financial guidance. Your AI plan pulls from here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Tag Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setSelectedTag(tag.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTag === tag.value
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600'
                  }`}
                >
                  <Icon name={tag.icon as any} className="h-4 w-4" />
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading latest news...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <Icon name="AlertCircle" className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-900 dark:text-red-200 font-semibold">{error}</p>
            </div>
          )}

          {/* Feed Items */}
          {!loading && !error && (
            <div className="space-y-6">
              {feedItems.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600">
                  <Icon name="Newspaper" className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No news items found for this filter.</p>
                  <button
                    onClick={() => setSelectedTag('all')}
                    className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    View All News →
                  </button>
                </div>
              ) : (
                feedItems.map((item, idx) => (
                  <AnimatedCard key={item.id} delay={idx * 50}>
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-6 hover:shadow-lg transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSourceBadge(item.source_id)}
                            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.published_at)}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h3>
                        </div>
                        <Icon name="ExternalLink" className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      </div>

                      {/* Summary */}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {item.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                      >
                        Read Full Article
                        <Icon name="ArrowRight" className="h-4 w-4" />
                      </a>
                    </div>
                  </AnimatedCard>
                ))
              )}
            </div>
          )}

          {/* Footer CTA */}
          {!loading && feedItems.length > 0 && (
            <div className="mt-12 text-center">
              <AnimatedCard delay={300}>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-8">
                  <Icon name="Sparkles" className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Want AI-Curated Financial Guidance?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    These news articles are great for staying informed. For personalized financial planning, 
                    check out our <strong>Intelligence Library</strong> where 410+ expert content blocks power your AI-generated plan.
                  </p>
                  <a
                    href="/dashboard/library"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg"
                  >
                    <Icon name="BookOpen" className="h-5 w-5" />
                    Browse Intelligence Library
                  </a>
                </div>
              </AnimatedCard>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ListeningPostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Listening Post...</p>
        </div>
      </div>
    }>
      <ListeningPostContent />
    </Suspense>
  );
}

