'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import BookmarkButton from '@/app/components/library/BookmarkButton';
import RatingButton from '@/app/components/library/RatingButton';
import ShareButton from '@/app/components/library/ShareButton';
import Icon from '@/app/components/ui/Icon';
import OnboardingTour from '@/app/components/library/OnboardingTour';

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
  const [bookmarkedBlocks, setBookmarkedBlocks] = useState<ContentBlock[]>([]);
  const [relatedBlocks, setRelatedBlocks] = useState<Record<string, RelatedContent[]>>({});
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPersonalized, setLoadingPersonalized] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
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
  
  // Enhanced UX states
  const [showFilters, setShowFilters] = useState(false);

  // Rate limiting state
  const [canView, setCanView] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [viewsRemaining, setViewsRemaining] = useState(5);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');

  // Check rate limit on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/library/can-view');
        if (response.ok) {
          const data = await response.json();
          setCanView(data.canView);
          setIsPremium(data.isPremium);
          setViewsRemaining(data.remaining || 0);
          if (!data.canView) {
            setRateLimitMessage(data.reason || 'Rate limit exceeded');
          }
        }
      } catch (err) {
        console.error('Failed to check library access:', err);
      }
    };
    checkAccess();
  }, []);

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
      setLoadingPersonalized(true);
      try {
        const response = await fetch('/api/library/enhanced?section=personalized&limit=5');
        const data = await response.json();
        if (response.ok) {
          setPersonalizedBlocks(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch personalized content:', err);
      } finally {
        setLoadingPersonalized(false);
      }
    };

    fetchPersonalized();
  }, []);

  // Fetch trending content on mount
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const response = await fetch('/api/library/enhanced?section=trending&limit=5');
        const data = await response.json();
        if (response.ok) {
          setTrendingBlocks(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch trending content:', err);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrending();
  }, []);

  // Fetch bookmarked content when "Saved" tab is active
  useEffect(() => {
    if (activeTab === 'saved') {
      const fetchBookmarks = async () => {
        setLoadingBookmarks(true);
        try {
          const response = await fetch('/api/bookmarks');
          const data = await response.json();
          if (response.ok && data.bookmarks) {
            // Extract content blocks from bookmarks
            const blocks = data.bookmarks.map((b: { content_block: ContentBlock }) => b.content_block).filter(Boolean);
            setBookmarkedBlocks(blocks);
          } else {
            setBookmarkedBlocks([]);
          }
        } catch (err) {
          console.error('Failed to fetch bookmarks:', err);
          setBookmarkedBlocks([]);
        } finally {
          setLoadingBookmarks(false);
        }
      };

      fetchBookmarks();
    }
  }, [activeTab]);

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
      // Track content interaction
      await fetch('/api/content/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          interactionType: 'view'
        })
      });

      // Record library view for rate limiting (free users only)
      await fetch('/api/library/record-view', {
        method: 'POST'
      });

      // Update local state
      if (!isPremium) {
        setViewsRemaining(Math.max(0, viewsRemaining - 1));
      }
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
        <span className="text-xs text-body ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };


  // Rate limit screen
  if (!canView) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-surface">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
          
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <AnimatedCard className="text-center p-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-4">Daily Article Limit Reached</h1>
              <p className="text-lg text-body mb-2">{rateLimitMessage}</p>
              <p className="text-sm text-muted mb-6">Come back tomorrow or upgrade to premium for unlimited access</p>

              {!isPremium && (
                <div className="bg-info-subtle rounded-lg p-6 mb-6">
                  <p className="text-blue-900 font-semibold mb-3">Want unlimited access to 410+ expert articles?</p>
                  <p className="text-info mb-4">Premium members get unlimited library access, plus full AI-curated plans, bookmarking, and priority support.</p>
                  <a
                    href="/dashboard/upgrade"
                    className="inline-block px-6 py-3 bg-info text-white font-bold rounded-lg hover:bg-info transition-colors"
                  >
                    Upgrade to Premium - $9.99/month
                  </a>
                </div>
              )}

              <a
                href="/dashboard"
                className="inline-block px-6 py-3 border-2 border-blue-600 text-info font-semibold rounded-lg hover:bg-info-subtle transition-colors"
              >
                Return to Dashboard
              </a>
            </AnimatedCard>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <OnboardingTour />
      <Header />
      <div className="min-h-screen bg-surface">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Rate limit indicator for free users */}
          {!isPremium && viewsRemaining <= 2 && (
            <div className="mb-6 bg-warning-subtle border border-warning rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-warning">
                    {viewsRemaining} article{viewsRemaining === 1 ? '' : 's'} remaining today
                  </p>
                  <p className="text-sm text-warning">
                    Free users can view 5 articles per day. <a href="/dashboard/upgrade" className="underline font-semibold">Upgrade for unlimited access</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Hero Header */}
          <div className="mb-12 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                <span>⭐</span> AI-Powered Intelligence
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-primary mb-4">
              Intel Library
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-body mb-6">
              410+ expert-curated content blocks that power your AI-generated plan
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 text-sm text-body">
              <div className="flex items-center gap-2">
                <Icon name="File" className="h-4 w-4 text-blue-600" />
                <span><strong>{blocks.length}</strong> Content Blocks</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" className="h-4 w-4 text-green-600" />
                <span><strong>95%</strong> Military Relevance</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-purple-600" />
                <span><strong>4.8/5</strong> Expert Rating</span>
              </div>
            </div>
          </div>

          {/* What's the Difference Explainer */}
          <AnimatedCard delay={0} className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-success rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">📚</span>
                <div>
                  <h3 className="font-bold text-primary mb-2">Expert-Curated Financial Guidance</h3>
                  <p className="text-body mb-3">
                    This library contains <strong>410+ hand-curated content blocks</strong> written by military financial experts. 
                    When you take your assessment, our AI Master Curator selects 8-10 of these blocks and weaves them into 
                    your personalized financial plan.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-success mb-1">✅ Intelligence Library (This Page)</div>
                      <p className="text-body">
                        <strong>Evergreen expert content</strong> - Your AI plan pulls from these 410+ curated blocks. 
                        Browse, search, bookmark, and discover the knowledge base that powers your personalized guidance.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-info mb-1">📡 Listening Post</div>
                      <p className="text-body">
                        <strong>Current military financial news</strong> - Breaking updates from Military Times, Stars & Stripes, etc. 
                        Great for staying informed, but separate from your AI plan.
                        <a href="/dashboard/listening-post" className="ml-1 underline font-semibold">
                          Visit Listening Post →
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Personalized Recommendations Section */}
          {(loadingPersonalized || personalizedBlocks.length > 0) && (
            <AnimatedCard className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200" delay={0}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <span>🎯</span> For You
                </h2>
                {!loadingPersonalized && (
                  <button
                    onClick={() => setActiveTab('for-you')}
                    className="text-sm text-info hover:text-info font-semibold"
                  >
                    View All →
                  </button>
                )}
              </div>
              <p className="text-body mb-4">Based on your profile and interests</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {loadingPersonalized ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-surface rounded-lg border border-subtle p-4">
                        <div className="h-4 bg-surface-hover rounded mb-2"></div>
                        <div className="h-3 bg-surface-hover rounded w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  personalizedBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => {
                      setExpandedId(block.id);
                      setActiveTab('all');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="p-4 bg-surface rounded-lg border border-subtle hover:shadow-md transition-all text-left"
                  >
                    <div className="text-sm font-semibold text-primary mb-2 line-clamp-2">
                      {block.title}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${getDomainColor(block.domain)}`}>
                        {block.domain}
                      </span>
                      {block.relevance_score && (
                        <span className="text-info font-bold">
                          {(block.relevance_score * 10).toFixed(0)}% match
                        </span>
                      )}
                    </div>
                  </button>
                  ))
                )}
              </div>
            </AnimatedCard>
          )}

          {/* Trending Content Section */}
          {(loadingTrending || trendingBlocks.length > 0) && (
            <AnimatedCard className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200" delay={50}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <span>🔥</span> Trending Now
                </h2>
                {!loadingTrending && (
                  <button
                    onClick={() => setActiveTab('trending')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    View All →
                  </button>
                )}
              </div>
              <p className="text-body mb-4">Most popular content this week</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {loadingTrending ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-surface rounded-lg border border-subtle p-4">
                        <div className="h-4 bg-surface-hover rounded mb-2"></div>
                        <div className="h-3 bg-surface-hover rounded w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  trendingBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => {
                      setExpandedId(block.id);
                      setActiveTab('all');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="p-4 bg-surface rounded-lg border border-subtle hover:shadow-md transition-all text-left"
                  >
                    <div className="text-sm font-semibold text-primary mb-2 line-clamp-2">
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
                  ))
                )}
              </div>
            </AnimatedCard>
          )}

          {/* Enhanced Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 border-b border-subtle">
                <button
                  onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                  className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'all'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon name="File" className="h-4 w-4" />
                  All Content
                </button>
                <button
                  onClick={() => { setActiveTab('for-you'); setCurrentPage(1); }}
                  className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'for-you'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>🎯</span> For You
                </button>
                <button
                  onClick={() => { setActiveTab('trending'); setCurrentPage(1); }}
                  className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'trending'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>🔥</span> Trending
                </button>
                <button
                  onClick={() => { setActiveTab('saved'); setCurrentPage(1); }}
                  className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'saved'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon name="BookOpen" className="h-4 w-4" />
                  Saved
                </button>
              </div>

              {/* Enhanced Controls */}
              <div className="flex items-center gap-4">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 filter-toggle"
                >
                  <Icon name="Settings" className="h-4 w-4" />
                  Filters
                  {(selectedDomain || selectedDifficulty || selectedAudience) && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(selectedDomain ? 1 : 0) + (selectedDifficulty ? 1 : 0) + (selectedAudience ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative mb-4 search-bar">
            <input
              type="text"
              placeholder="Search 410+ content blocks (AI semantic search)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Icon name="X" className="h-4 w-4 text-gray-500" />
                </button>
              )}
              <Icon name="Search" className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Enhanced Filters (Collapsible) */}
          {showFilters && (
            <AnimatedCard className="mb-8 p-6 bg-surface border border-subtle" delay={150}>
            <div className="space-y-6">
              {/* Domain Filters */}
              <div>
                <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
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
                <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
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
                <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
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
                <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
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
                  <span className="font-bold text-primary w-20">{minRating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Clear Filters */}
              {(search || selectedDomain || selectedDifficulty || selectedAudience || minRating > 0) && (
                <div className="pt-4 border-t border-subtle">
                  <button
                    onClick={clearFilters}
                    className="text-info hover:text-info font-semibold text-sm flex items-center gap-2"
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
          )}

          {/* Results Count */}
          {pagination && (
            <div className="mb-6 text-center">
              <p className="text-body">
                {activeTab === 'saved' ? (
                  <>
                    <span className="font-bold text-primary">{bookmarkedBlocks.length}</span> saved article{bookmarkedBlocks.length !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    Showing <span className="font-bold text-primary">{blocks.length}</span> of{' '}
                    <span className="font-bold text-primary">{pagination.totalCount}</span> results
                  </>
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-body">Loading content...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-danger text-lg font-semibold mb-2">⚠️ Error</div>
              <p className="text-body">{error}</p>
            </div>
          )}

          {/* Content Blocks Grid */}
          {!loading && !loadingBookmarks && !error && (
            <div className="space-y-4 mb-12">
              {/* Show appropriate blocks based on active tab */}
              {(() => {
                const displayBlocks = activeTab === 'saved' ? bookmarkedBlocks : blocks;
                
                if (displayBlocks.length === 0) {
                  if (activeTab === 'saved') {
                    return (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔖</div>
                        <h3 className="text-2xl font-bold text-primary mb-2">No saved content yet</h3>
                        <p className="text-body mb-6">
                          Click the bookmark icon on any article to save it for later
                        </p>
                        <button
                          onClick={() => setActiveTab('all')}
                          className="bg-info hover:bg-info text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Explore Content
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-2xl font-bold text-primary mb-2">No results found</h3>
                      <p className="text-body mb-6">Try adjusting your search or filters</p>
                      <button
                        onClick={clearFilters}
                        className="bg-info hover:bg-info text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Clear filters
                      </button>
                    </div>
                  );
                }
                
                return displayBlocks.map((block, index) => (
                  <AnimatedCard
                    key={block.id}
                    className="bg-surface border border-subtle hover:shadow-lg transition-all"
                    delay={index * 20}
                  >
                    <button
                      onClick={() => toggleExpand(block.id)}
                      className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-primary">{block.title}</h3>
                            {block.est_read_min > 0 && (
                              <span className="text-xs bg-surface-hover text-body px-2 py-1 rounded-full font-medium">
                                {block.est_read_min} min
                              </span>
                            )}
                            {block.relevance_score && (
                              <span className="text-xs bg-info-subtle text-info px-2 py-1 rounded-full font-bold">
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
                            <p className="text-body mb-3">{block.summary}</p>
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
                              <span className="text-xs bg-success-subtle text-success px-2 py-1 rounded-full font-medium">
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
                      <div className="px-6 pb-6 border-t border-subtle">
                        <div
                          className="prose prose-sm max-w-none mt-6 text-body"
                          dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                        
                        {/* Related Content */}
                        {relatedBlocks[block.id] && relatedBlocks[block.id].length > 0 && (
                          <div className="mt-8 p-4 bg-info-subtle rounded-lg border border-info">
                            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                              <span>🔗</span> Related Content
                            </h4>
                            <div className="space-y-2">
                              {relatedBlocks[block.id].map((related) => (
                                <button
                                  key={related.content_id}
                                  onClick={() => toggleExpand(related.content_id)}
                                  className="w-full text-left p-3 bg-surface rounded-lg border border-info hover:shadow-md transition-all"
                                >
                                  <div className="font-semibold text-primary text-sm mb-1">
                                    {related.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded ${getDomainColor(related.content_domain)}`}>
                                      {related.content_domain}
                                    </span>
                                    <span className="text-muted">
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
                ));
              })()}
            </div>
          )}

          {/* Pagination (hide on Saved tab) */}
          {pagination && pagination.totalPages > 1 && activeTab !== 'saved' && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-default rounded-lg font-medium text-body hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="px-4 py-2 border border-default rounded-lg font-medium text-body hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-body">Loading Intel Library...</p>
          </div>
        </div>
        <Footer />
      </>
    }>
      <IntelligenceLibraryContent />
    </Suspense>
  );
}

