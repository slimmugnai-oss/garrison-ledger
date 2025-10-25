'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import EnhancedContentBlock from '@/app/components/library/EnhancedContentBlock';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

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
  type?: string;
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

function EnhancedIntelligenceLibrary() {
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
  
  // Enhanced filter states
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [selectedDomain, setSelectedDomain] = useState(searchParams?.get('domain') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams?.get('difficulty') || '');
  const [selectedAudience, setSelectedAudience] = useState(searchParams?.get('audience') || '');
  const [minRating, setMinRating] = useState(3.0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1', 10));
  const [activeTab, setActiveTab] = useState<'all' | 'for-you' | 'trending' | 'saved'>('all');
  
  // New UX states
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'trending' | 'newest' | 'rating'>('relevance');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Enhanced filter options with better organization
  const domains = [
    { label: '💰 Finance', value: 'finance', icon: 'DollarSign', color: 'blue' },
    { label: '💼 Career', value: 'career', icon: 'Briefcase', color: 'green' },
    { label: '🚚 PCS', value: 'pcs', icon: 'Truck', color: 'purple' },
    { label: '🎖️ Deployment', value: 'deployment', icon: 'Shield', color: 'orange' },
    { label: '🏖️ Retirement', value: 'retirement', icon: 'Sun', color: 'yellow' },
    { label: '🎓 Benefits', value: 'benefits', icon: 'Gift', color: 'pink' }
  ];

  const difficulties = [
    { label: '🟢 Beginner', value: 'beginner' },
    { label: '🟡 Intermediate', value: 'intermediate' },
    { label: '🔴 Advanced', value: 'advanced' }
  ];

  const audiences = [
    { label: '👨‍✈️ Officers', value: 'officers' },
    { label: '👨‍💼 Enlisted', value: 'enlisted' },
    { label: '👨‍👩‍👧‍👦 Families', value: 'families' },
    { label: '💍 Spouses', value: 'spouses' },
    { label: '🎖️ Veterans', value: 'veterans' }
  ];

  // Enhanced color functions
  const getDomainColor = (domain: string) => {
    const colors = {
      finance: 'bg-blue-100 text-blue-700 border-blue-200',
      career: 'bg-green-100 text-green-700 border-green-200',
      pcs: 'bg-purple-100 text-purple-700 border-purple-200',
      deployment: 'bg-orange-100 text-orange-700 border-orange-200',
      retirement: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      benefits: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[domain as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      advanced: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Toggle expand/collapse for content blocks
  const toggleExpand = async (blockId: string) => {
    if (expandedId === blockId) {
      setExpandedId(null);
    } else {
      setExpandedId(blockId);
      
      // Track content view
      try {
        await fetch('/api/content/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: blockId,
            action: 'view'
          })
        });
        
        // Load related content if not already loaded
        if (!relatedBlocks[blockId]) {
          const response = await fetch(`/api/content/related?contentId=${blockId}`);
          if (response.ok) {
            const data = await response.json();
            setRelatedBlocks(prev => ({ ...prev, [blockId]: data.related || [] }));
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }
  };

  // Handle action clicks
  const handleActionClick = (action: string, data?: any) => {
    switch (action) {
      case 'navigate':
        window.location.href = data.path;
        break;
      case 'calculate':
        // Navigate to relevant calculator
        const calcPaths = {
          'life-insurance': '/dashboard/tools/life-insurance-calculator',
          'tsp': '/dashboard/tools/tsp-modeler',
          'sdp': '/dashboard/tools/sdp-strategist'
        };
        if (calcPaths[data.type as keyof typeof calcPaths]) {
          window.location.href = calcPaths[data.type as keyof typeof calcPaths];
        }
        break;
      case 'compare':
        // Open comparison tool
        window.location.href = '/dashboard/tools/comparison-tool';
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedDomain('');
    setSelectedDifficulty('');
    setSelectedAudience('');
    setMinRating(3.0);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  // Fetch main content blocks
  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          domain: selectedDomain,
          difficulty: selectedDifficulty,
          audience: selectedAudience,
          minRating: minRating.toString(),
          search: search,
          sortBy: sortBy
        });

        const response = await fetch(`/api/content/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setBlocks(data.blocks || []);
          setPagination(data.pagination);
        } else {
          setError('Failed to load content');
        }
      } catch (err) {
        console.error('Failed to fetch blocks:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [currentPage, selectedDomain, selectedDifficulty, selectedAudience, minRating, search, sortBy]);

  // Fetch personalized recommendations
  useEffect(() => {
    const fetchPersonalized = async () => {
      setLoadingPersonalized(true);
      try {
        const response = await fetch('/api/content/personalized');
        if (response.ok) {
          const data = await response.json();
          setPersonalizedBlocks(data.blocks || []);
        }
      } catch (err) {
        console.error('Failed to fetch personalized blocks:', err);
      } finally {
        setLoadingPersonalized(false);
      }
    };

    fetchPersonalized();
  }, []);

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const response = await fetch('/api/content/trending');
        if (response.ok) {
          const data = await response.json();
          setTrendingBlocks(data.blocks || []);
        }
      } catch (err) {
        console.error('Failed to fetch trending blocks:', err);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrending();
  }, []);

  // Fetch bookmarks when saved tab is active
  useEffect(() => {
    if (activeTab === 'saved') {
      const fetchBookmarks = async () => {
        setLoadingBookmarks(true);
        try {
          const response = await fetch('/api/bookmarks');
          const data = await response.json();
          if (response.ok && data.bookmarks) {
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

  // Get active content based on tab
  const getActiveContent = () => {
    switch (activeTab) {
      case 'for-you': return personalizedBlocks;
      case 'trending': return trendingBlocks;
      case 'saved': return bookmarkedBlocks;
      default: return blocks;
    }
  };

  const activeContent = getActiveContent();

  if (!canView) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-primary mb-4">Library Access Limited</h1>
              <p className="text-body mb-6">{rateLimitMessage}</p>
              {!isPremium && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Upgrade to Premium</h3>
                  <p className="text-blue-700 mb-4">Get unlimited access to the Intelligence Library</p>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Enhanced Header */}
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

          {/* Enhanced Personalized Recommendations */}
          {(loadingPersonalized || personalizedBlocks.length > 0) && (
            <AnimatedCard className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-info" delay={0}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <span>🎯</span> For You
                  <span className="text-sm font-normal text-body">({personalizedBlocks.length} matches)</span>
                </h2>
                {!loadingPersonalized && personalizedBlocks.length > 0 && (
                  <button
                    onClick={() => setActiveTab('for-you')}
                    className="text-sm text-info hover:text-info font-semibold flex items-center gap-1"
                  >
                    View All <Icon name="ArrowRight" className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-body mb-4">Based on your profile and interests</p>
              
              {loadingPersonalized ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-surface rounded-lg border border-subtle p-4">
                        <div className="h-4 bg-surface-hover rounded mb-2"></div>
                        <div className="h-3 bg-surface-hover rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personalizedBlocks.slice(0, 3).map((block) => (
                    <button
                      key={block.id}
                      onClick={() => {
                        setExpandedId(block.id);
                        setActiveTab('all');
                        window.scrollTo({ top: 800, behavior: 'smooth' });
                      }}
                      className="p-4 bg-surface rounded-lg border border-subtle hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-primary line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {block.title}
                        </h3>
                        <span className="text-xs bg-info-subtle text-info px-2 py-1 rounded-full font-bold ml-2 flex-shrink-0">
                          {(block.relevance_score! * 10).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded ${getDomainColor(block.domain)}`}>
                          {block.domain}
                        </span>
                        <span className="text-muted">{block.est_read_min} min</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </AnimatedCard>
          )}

          {/* Enhanced Trending Section */}
          {(loadingTrending || trendingBlocks.length > 0) && (
            <AnimatedCard className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200" delay={50}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <span>🔥</span> Trending Now
                  <span className="text-sm font-normal text-body">({trendingBlocks.length} hot topics)</span>
                </h2>
                {!loadingTrending && trendingBlocks.length > 0 && (
                  <button
                    onClick={() => setActiveTab('trending')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                  >
                    View All <Icon name="ArrowRight" className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-body mb-4">Most popular content this week</p>
              
              {loadingTrending ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-surface rounded-lg border border-subtle p-3">
                        <div className="h-3 bg-surface-hover rounded mb-2"></div>
                        <div className="h-2 bg-surface-hover rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {trendingBlocks.slice(0, 5).map((block) => (
                    <button
                      key={block.id}
                      onClick={() => {
                        setExpandedId(block.id);
                        setActiveTab('all');
                        window.scrollTo({ top: 800, behavior: 'smooth' });
                      }}
                      className="p-3 bg-surface rounded-lg border border-subtle hover:shadow-md transition-all text-left group"
                    >
                      <div className="text-xs font-semibold text-primary mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {block.title}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getDomainColor(block.domain)}`}>
                          {block.domain}
                        </span>
                        <span className="text-orange-600 font-bold">
                          {block.total_views}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </AnimatedCard>
          )}

          {/* Enhanced Tab Navigation */}
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
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Icon name="LayoutDashboard" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Icon name="Menu" className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="trending">Trending</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                </select>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Icon name="Settings" className="h-4 w-4" />
                  Filters
                  {(selectedDomain || selectedDifficulty || selectedAudience || selectedTags.length > 0) && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(selectedDomain ? 1 : 0) + (selectedDifficulty ? 1 : 0) + (selectedAudience ? 1 : 0) + selectedTags.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative mb-4">
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
          </div>

          {/* Enhanced Filters (Collapsible) */}
          {showFilters && (
            <AnimatedCard className="mb-8 p-6 bg-surface border border-subtle" delay={100}>
              <div className="space-y-6">
                {/* Domain Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
                    Content Area
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {domains.map((domain) => (
                      <button
                        key={domain.value}
                        onClick={() => { setSelectedDomain(selectedDomain === domain.value ? '' : domain.value); setCurrentPage(1); }}
                        className={`p-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          selectedDomain === domain.value
                            ? 'bg-blue-600 text-white border-2 border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon name={domain.icon as any} className="h-4 w-4" />
                        <span className="text-sm">{domain.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty & Audience Filters */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
                      Difficulty Level
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map((difficulty) => (
                        <button
                          key={difficulty.value}
                          onClick={() => { setSelectedDifficulty(selectedDifficulty === difficulty.value ? '' : difficulty.value); setCurrentPage(1); }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedDifficulty === difficulty.value
                              ? 'bg-blue-600 text-white border-2 border-blue-600'
                              : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {difficulty.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                              ? 'bg-blue-600 text-white border-2 border-blue-600'
                              : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {audience.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedDomain || selectedDifficulty || selectedAudience || selectedTags.length > 0) && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
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
                    Showing <span className="font-bold text-primary">{activeContent.length}</span> of{' '}
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
              <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Error</div>
              <p className="text-body">{error}</p>
            </div>
          )}

          {/* Enhanced Content Blocks */}
          {!loading && !loadingBookmarks && !error && (
            <div className={`space-y-4 mb-12 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}`}>
              {activeContent.length === 0 ? (
                <div className="text-center py-16 col-span-full">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-primary mb-2">No results found</h3>
                  <p className="text-body mb-6">Try adjusting your search or filters</p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                activeContent.map((block, index) => (
                  <EnhancedContentBlock
                    key={block.id}
                    block={block}
                    isExpanded={expandedId === block.id}
                    onToggleExpand={() => toggleExpand(block.id)}
                    onActionClick={handleActionClick}
                  />
                ))
              )}
            </div>
          )}

          {/* Enhanced Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
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
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-body">Loading Intelligence Library...</p>
        </div>
      </div>
    }>
      <EnhancedIntelligenceLibrary />
    </Suspense>
  );
}
