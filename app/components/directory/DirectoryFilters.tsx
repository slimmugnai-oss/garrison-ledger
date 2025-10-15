'use client';

import { useState } from 'react';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface DirectoryFiltersProps {
  // Search
  search: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  
  // Type filter
  type: string;
  onTypeChange: (value: string) => void;
  
  // State filter
  state: string;
  onStateChange: (value: string) => void;
  
  // Military-friendly filter
  militaryFriendly: boolean;
  onMilitaryFriendlyChange: (value: boolean) => void;
  
  // Actions
  onSearch: () => void;
  onClearFilters: () => void;
  loading: boolean;
  
  // Count
  totalCount: number;
  hasSearched: boolean;
}

export default function DirectoryFilters({
  search,
  onSearchChange,
  onSearchKeyDown,
  type,
  onTypeChange,
  state,
  onStateChange,
  militaryFriendly,
  onMilitaryFriendlyChange,
  onSearch,
  onClearFilters,
  loading,
  totalCount,
  hasSearched
}: DirectoryFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Count active filters
  const activeFilterCount = [
    search,
    type,
    state,
    !militaryFriendly // militaryFriendly defaults to true, so false is "active"
  ].filter(Boolean).length;

  const FilterContent = () => (
    <>
      <div className="grid gap-3 sm:grid-cols-5">
        <input 
          placeholder="Search name, city, notes…" 
          value={search} 
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={onSearchKeyDown} 
          className="border rounded px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <select 
          value={type} 
          onChange={e => onTypeChange(e.target.value)} 
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any type</option>
          <option value="agent">Agent</option>
          <option value="lender">Lender</option>
          <option value="property_manager">Property Manager</option>
          <option value="other">Other</option>
        </select>
        <input 
          placeholder="State (e.g., TX)" 
          maxLength={2} 
          value={state} 
          onChange={e => onStateChange(e.target.value.toUpperCase())} 
          className="border rounded px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={militaryFriendly} 
            onChange={e => onMilitaryFriendlyChange(e.target.checked)} 
            className="w-4 h-4" 
          />
          Military-friendly
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button 
          onClick={onSearch} 
          disabled={loading}
          className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button 
          onClick={onClearFilters} 
          disabled={loading}
          className="rounded border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
      
      {/* Filter count preview */}
      {hasSearched && (
        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
          {totalCount > 0 ? (
            <>Found <span className="font-semibold">{totalCount}</span> {totalCount === 1 ? 'provider' : 'providers'}</>
          ) : (
            <>No providers found</>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: Always visible */}
      <div className="hidden md:block">
        <AnimatedCard className="p-4">
          <FilterContent />
        </AnimatedCard>
      </div>

      {/* Mobile: Filter button + drawer */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full rounded border bg-white p-4 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter content */}
            <div className="p-4">
              <FilterContent />
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 transition-colors font-medium"
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

