'use client';

import { useState } from 'react';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface LibraryFiltersProps {
  // Search
  search: string;
  onSearchChange: (value: string) => void;
  
  // Domain filter
  selectedDomain: string;
  onDomainChange: (value: string) => void;
  domains: Array<{ label: string; value: string }>;
  
  // Difficulty filter
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  difficulties: Array<{ label: string; value: string; icon: string }>;
  
  // Audience filter
  selectedAudience: string;
  onAudienceChange: (value: string) => void;
  audiences: Array<{ label: string; value: string }>;
  
  // Rating filter
  minRating: number;
  onRatingChange: (value: number) => void;
  
  // Actions
  onClearFilters: () => void;
  
  // Stats
  resultCount?: number;
  totalCount?: number;
}

export default function LibraryFilters({
  search,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  domains,
  selectedDifficulty,
  onDifficultyChange,
  difficulties,
  selectedAudience,
  onAudienceChange,
  audiences,
  minRating,
  onRatingChange,
  onClearFilters,
  resultCount,
  totalCount,
}: LibraryFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const activeFiltersCount = [
    selectedDomain,
    selectedDifficulty,
    selectedAudience,
    minRating > 0 ? minRating : null
  ].filter(Boolean).length;

  const FilterContent = () => (
    <>
      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Domain Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Domain</label>
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <button
              key={domain.value}
              onClick={() => onDomainChange(selectedDomain === domain.value ? '' : domain.value)}
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

      {/* Difficulty Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.value}
              onClick={() => onDifficultyChange(selectedDifficulty === difficulty.value ? '' : difficulty.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedDifficulty === difficulty.value
                  ? 'bg-purple-600 text-white border-2 border-purple-600'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{difficulty.icon}</span>
              <span>{difficulty.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audience Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Audience</label>
        <div className="flex flex-wrap gap-2">
          {audiences.map((audience) => (
            <button
              key={audience.value}
              onClick={() => onAudienceChange(selectedAudience === audience.value ? '' : audience.value)}
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

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Minimum Rating
        </label>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 3.5, 4].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                minRating === rating
                  ? 'bg-yellow-600 text-white border-2 border-yellow-600'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              {rating === 0 ? 'All' : `${rating}+ ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <button
          onClick={onClearFilters}
          className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all filters
        </button>
      )}

      {/* Results Count */}
      {resultCount !== undefined && totalCount !== undefined && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold text-center">
            {activeFiltersCount > 0 ? (
              <>
                Found <span className="text-blue-600">{resultCount}</span> of{' '}
                <span className="text-blue-600">{totalCount}</span> articles
              </>
            ) : (
              <>
                Showing <span className="text-blue-600">{totalCount}</span> articles
              </>
            )}
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <AnimatedCard className="p-6 sticky top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
          <FilterContent />
        </AnimatedCard>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileFiltersOpen(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <FilterContent />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-6 px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

