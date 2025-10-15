'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import BookmarkButton from '@/app/components/library/BookmarkButton';
import RatingButton from '@/app/components/library/RatingButton';
import ShareButton from '@/app/components/library/ShareButton';

interface ContentBlock {
  id: string;
  title: string;
  summary: string | null;
  html: string;
  domain: string;
  difficulty_level: string;
  target_audience: string[];
  content_rating: number;
  content_freshness_score: number;
  est_read_min: number;
  tags: string[];
  seo_keywords: string[];
  relevance_score?: number;
  trend_score?: number;
  total_views?: number;
}

interface RelatedContent {
  content_id: string;
  title: string;
  content_domain: string;
  similarity_score: number;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

function IntelligenceLibraryContent() {
  const searchParams = useSearchParams();
  
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [personalizedBlocks, setPersonalizedBlocks] = useState<ContentBlock[]>([]);
  const [trendingBlocks, setTrendingBlocks] = useState<ContentBlock[]>([]);
  const [relatedBlocks, setRelatedBlocks] = useState<Record<string, RelatedContent[]>>({});
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [selectedDomain, setSelectedDomain] = useState(searchParams?.get('domain') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams?.get('difficulty') || '');
  const [selectedAudience, setSelectedAudience] = useState(searchParams?.get('audience') || '');
  const [minRating, setMinRating] = useState(3.0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1', 10));
  const [activeTab, setActiveTab] = useState<'all' | 'for-you' | 'trending' | 'saved'>('all');

  // Filter options
  const domains = [
    { label: 'Finance', value: 'finance' },
    { label: 'Career', value: 'career' },
    { label: 'PCS', value: 'pcs' },
    { label: 'Deployment', value: 'deployment' },
    { label: 'Lifestyle', value: 'lifestyle' },
  ];

  const difficulties = [
    { label: 'Beginner', value: 'beginner', icon: '🌱' },
    { label: 'Intermediate', value: 'intermediate', icon: '⚡' },
    { label: 'Advanced', value: 'advanced', icon: '🎯' },
  ];

  const audiences = [
    { label: 'Military Member', value: 'military-member' },
    { label: 'Military Spouse', value: 'military-spouse' },
    { label: 'Family', value: 'family' },
    { label: 'Veteran', value: 'veteran' },
    { label: 'Officer', value: 'officer' },
    { label: 'Enlisted', value: 'enlisted' },
  ];

  // Fetch personalized recommendations on mount
  useEffect(() => {
    const fetchPersonalized = async () => {
      try {
        const response = await fetch('/api/library/enhanced?section=personalized&limit=5');
        const data = await response.json();
        if (response.ok) {
          setPersonalizedBlocks(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch personalized content:', err);
      }
    };

    fetchPersonalized();
  }, []);

  // Fetch trending content on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/library/enhanced?section=trending&limit=5');
        const data = await response.json();
        if (response.ok) {
          setTrendingBlocks(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch trending content:', err);
      }
    };

    fetchTrending();
  }, []);

  // Fetch main content blocks
  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedDomain) params.set('domain', selectedDomain);
        if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
        if (selectedAudience) params.set('audience', selectedAudience);
        if (minRating > 0) params.set('minRating', minRating.toString());
        params.set('page', currentPage.toString());

        if (activeTab === 'for-you') {
          params.set('section', 'personalized');
        } else if (activeTab === 'trending') {
          params.set('section', 'trending');
        }

        const response = await fetch(`/api/library/enhanced?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch content blocks');
        }

        setBlocks(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [search, selectedDomain, selectedDifficulty, selectedAudience, minRating, currentPage, activeTab]);

  // Track interaction when viewing content
  const trackView = async (contentId: string) => {
    try {
      await fetch('/api/content/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          interactionType: 'view'
        })
      });
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  // Fetch related content when expanding
  const fetchRelated = async (contentId: string) => {
    if (relatedBlocks[contentId]) return; // Already fetched

    try {
      const response = await fetch(`/api/content/related?id=${contentId}&limit=3`);
      const data = await response.json();
      if (response.ok && data.related) {
        setRelatedBlocks(prev => ({
          ...prev,
          [contentId]: data.related
        }));
      }
    } catch (err) {
      console.error('Failed to fetch related content:', err);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId !== id) {
      setExpandedId(id);
      await trackView(id);
      await fetchRelated(id);
    } else {
      setExpandedId(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDomain('');
    setSelectedDifficulty('');
    setSelectedAudience('');
    setMinRating(3.0);
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'finance': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'career': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pcs': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'deployment': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'lifestyle': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderContentRating = (rating: number) => {
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < stars ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Hero Header */}
          <div className="mb-12 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                <span>⭐</span> AI-Powered Intelligence
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
              Intel Library
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Personalized, intelligent content discovery powered by AI
            </p>
          </div>

          {/* Personalized Recommendations Section */}
          {personalizedBlocks.length > 0 && (
            <AnimatedCard className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200" delay={0}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🎯</span> For You
                </h2>
                <button
                  onClick={() => setActiveTab('for-you')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All →
                </button>
              </div>
              <p className="text-gray-600 mb-4">Based on your profile and interests</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {personalizedBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => {
                      setExpandedId(block.id);
                      setActiveTab('all');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
                  >
                    <div className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      {block.title}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${getDomainColor(block.domain)}`}>
                        {block.domain}
                      </span>
                      {block.relevance_score && (
                        <span className="text-blue-600 font-bold">
                          {(block.relevance_score * 10).toFixed(0)}% match
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Trending Content Section */}
          {trendingBlocks.length > 0 && (
            <AnimatedCard className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200" delay={50}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🔥</span> Trending Now
                </h2>
                <button
                  onClick={() => setActiveTab('trending')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  View All →
                </button>
              </div>
              <p className="text-gray-600 mb-4">Most popular content this week</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {trendingBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => {
                      setExpandedId(block.id);
                      setActiveTab('all');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
                  >
                    <div className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      {block.title}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${getDomainColor(block.domain)}`}>
                        {block.domain}
                      </span>
                      {block.total_views && (
                        <span className="text-orange-600 font-bold">
                          {block.total_views} views
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Tabs */}
          <div className="mb-6 flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => { setActiveTab('for-you'); setCurrentPage(1); }}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'for-you'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 For You
            </button>
            <button
              onClick={() => { setActiveTab('trending'); setCurrentPage(1); }}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => { setActiveTab('saved'); setCurrentPage(1); }}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔖 Saved
            </button>
          </div>

          {/* Search Bar */}
          <AnimatedCard className="mb-6 p-6 bg-white border border-gray-200" delay={100}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by keyword (uses AI semantic search)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
              />
              <svg
                className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </AnimatedCard>

          {/* Smart Filters */}
          <AnimatedCard className="mb-8 p-6 bg-white border border-gray-200" delay={150}>
            <div className="space-y-6">
              {/* Domain Filters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Content Area
                </h3>
                <div className="flex flex-wrap gap-2">
                  {domains.map((domain) => (
                    <button
                      key={domain.value}
                      onClick={() => { setSelectedDomain(selectedDomain === domain.value ? '' : domain.value); setCurrentPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedDomain === domain.value
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {domain.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Difficulty Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => { setSelectedDifficulty(selectedDifficulty === difficulty.value ? '' : difficulty.value); setCurrentPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        selectedDifficulty === difficulty.value
                          ? 'bg-purple-600 text-white border-2 border-purple-600'
                          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{difficulty.icon}</span>
                      {difficulty.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience Filters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Target Audience
                </h3>
                <div className="flex flex-wrap gap-2">
                  {audiences.map((audience) => (
                    <button
                      key={audience.value}
                      onClick={() => { setSelectedAudience(selectedAudience === audience.value ? '' : audience.value); setCurrentPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedAudience === audience.value
                          ? 'bg-green-600 text-white border-2 border-green-600'
                          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {audience.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Minimum Quality Rating
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => { setMinRating(parseFloat(e.target.value)); setCurrentPage(1); }}
                    className="flex-1"
                  />
                  <span className="font-bold text-gray-900 w-20">{minRating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Clear Filters */}
              {(search || selectedDomain || selectedDifficulty || selectedAudience || minRating > 0) && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Results Count */}
          {pagination && (
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Showing <span className="font-bold text-gray-900">{blocks.length}</span> of{' '}
                <span className="font-bold text-gray-900">{pagination.totalCount}</span> results
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading content...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Error</div>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {/* Content Blocks Grid */}
          {!loading && !error && (
            <div className="space-y-4 mb-12">
              {blocks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <AnimatedCard
                    key={block.id}
                    className="bg-white border border-gray-200 hover:shadow-lg transition-all"
                    delay={index * 20}
                  >
                    <button
                      onClick={() => toggleExpand(block.id)}
                      className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">{block.title}</h3>
                            {block.est_read_min > 0 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                {block.est_read_min} min
                              </span>
                            )}
                            {block.relevance_score && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                                {(block.relevance_score * 10).toFixed(0)}% match
                              </span>
                            )}
                            {block.trend_score && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                                🔥 Trending
                              </span>
                            )}
                          </div>
                          
                          {block.summary && (
                            <p className="text-gray-600 mb-3">{block.summary}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize border ${getDomainColor(block.domain)}`}>
                              {block.domain}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize border ${getDifficultyColor(block.difficulty_level)}`}>
                              {block.difficulty_level}
                            </span>
                            {block.content_rating > 0 && renderContentRating(block.content_rating)}
                            {block.content_freshness_score >= 90 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                ✨ Fresh
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            <BookmarkButton contentId={block.id} />
                            <ShareButton contentId={block.id} title={block.title} />
                            <RatingButton contentId={block.id} initialRating={block.content_rating} />
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <svg
                            className={`w-6 h-6 text-gray-400 transition-transform ${
                              expandedId === block.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedId === block.id && (
                      <div className="px-6 pb-6 border-t border-gray-200">
                        <div
                          className="prose prose-sm max-w-none mt-6 text-gray-700"
                          dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                        
                        {/* Related Content */}
                        {relatedBlocks[block.id] && relatedBlocks[block.id].length > 0 && (
                          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <span>🔗</span> Related Content
                            </h4>
                            <div className="space-y-2">
                              {relatedBlocks[block.id].map((related) => (
                                <button
                                  key={related.content_id}
                                  onClick={() => toggleExpand(related.content_id)}
                                  className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all"
                                >
                                  <div className="font-semibold text-gray-900 text-sm mb-1">
                                    {related.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded ${getDomainColor(related.content_domain)}`}>
                                      {related.content_domain}
                                    </span>
                                    <span className="text-gray-500">
                                      {(related.similarity_score * 20).toFixed(0)}% similar
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedCard>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function IntelligenceLibrary() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading Intel Library...</p>
          </div>
        </div>
        <Footer />
      </>
    }>
      <IntelligenceLibraryContent />
    </Suspense>
  );
}

