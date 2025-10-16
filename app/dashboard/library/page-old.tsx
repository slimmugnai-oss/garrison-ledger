'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface ContentBlock {
  id: string;
  title: string;
  summary: string | null;
  html: string;
  source_page: string;
  type: string | null;
  topics: string[] | null;
  tags: string[];
  est_read_min: number;
  block_type: string;
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
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [selectedSource, setSelectedSource] = useState(searchParams?.get('source') || '');
  const [selectedType, setSelectedType] = useState(searchParams?.get('type') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1', 10));

  // Available filter options (based on actual source_page values)
  const sources = [
    { label: 'PCS Hub', value: 'pcs-hub' },
    { label: 'Career Hub', value: 'career-hub' },
    { label: 'Deployment', value: 'deployment' },
    { label: 'Shopping & Finance', value: 'on-base-shopping' },
    { label: 'Base Guides', value: 'base-guides' },
  ];
  const types = ['tool', 'checklist', 'pro_tip_list', 'faq_section', 'guide', 'calculator'];

  // Fetch content blocks
  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedSource) params.set('source', selectedSource);
        if (selectedType) params.set('type', selectedType);
        params.set('page', currentPage.toString());

        const response = await fetch(`/api/library?${params.toString()}`);
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
  }, [search, selectedSource, selectedType, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedSource) params.set('source', selectedSource);
    if (selectedType) params.set('type', selectedType);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : '/dashboard/library';
    window.history.replaceState({}, '', newUrl);
  }, [search, selectedSource, selectedType, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source === selectedSource ? '' : source);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type === selectedType ? '' : type);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSource('');
    setSelectedType('');
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.04),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Hero Header */}
          <div className="mb-12 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                <span>⭐</span> Premium Feature
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-primary mb-4">
              Intel Library
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-body">
              Search and explore our entire collection of 400+ expert-curated content blocks
            </p>
          </div>

          {/* Search Bar */}
          <AnimatedCard className="mb-8 p-6 bg-surface border border-subtle" delay={0}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by keyword (e.g., TSP, PCS, deployment)..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-default rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
              />
              <svg
                className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted"
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

          {/* Filters */}
          <AnimatedCard className="mb-8 p-6 bg-surface border border-subtle" delay={50}>
            <div className="space-y-6">
              {/* Source Filters */}
              <div>
                <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
                  Content Hub
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <button
                      key={source.value}
                      onClick={() => handleSourceChange(source.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSource === source.value
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filters */}
              <div>
                <h3 className="text-sm font-semibold text-body uppercase tracking-wider mb-3">
                  Content Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        selectedType === type
                          ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(search || selectedSource || selectedType) && (
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

          {/* Results Count */}
          {pagination && (
            <div className="mb-6 text-center">
              <p className="text-body">
                Showing <span className="font-bold text-primary">{blocks.length}</span> of{' '}
                <span className="font-bold text-primary">{pagination.totalCount}</span> results
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
          {!loading && !error && (
            <div className="space-y-4 mb-12">
              {blocks.length === 0 ? (
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
              ) : (
                blocks.map((block, index) => (
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
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-primary">{block.title}</h3>
                            {block.est_read_min > 0 && (
                              <span className="text-xs bg-surface-hover text-body px-2 py-1 rounded-full font-medium">
                                {block.est_read_min} min
                              </span>
                            )}
                          </div>
                          
                          {block.summary && (
                            <p className="text-body mb-3">{block.summary}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {block.source_page && (
                              <span className="px-2 py-1 bg-info-subtle text-info border border-info rounded text-xs font-semibold capitalize">
                                {block.source_page.replace(/-/g, ' ')}
                              </span>
                            )}
                            {block.type && (
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold capitalize">
                                {block.type.replace('_', ' ')}
                              </span>
                            )}
                            {block.topics?.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-1 bg-success-subtle text-success border border-success rounded text-xs font-medium"
                              >
                                {topic}
                              </span>
                            ))}
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

