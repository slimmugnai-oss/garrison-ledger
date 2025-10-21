'use client';

import { useState, useEffect } from 'react';
import { getComparisonList, removeFromComparison, clearComparison } from '@/app/lib/base-analytics';
import { badgeColors } from '@/app/data/bases';

export default function ComparisonBar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comparisonBases, setComparisonBases] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load initial comparison list
    const loadComparison = () => {
      const bases = getComparisonList();
      setComparisonBases(bases);
      setIsVisible(bases.length > 0);
    };

    loadComparison();

    // Listen for storage changes (from other components)
    const handleStorageChange = () => loadComparison();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('comparison-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('comparison-updated', handleStorageChange);
    };
  }, []);

  const handleRemove = (baseId: string) => {
    const result = removeFromComparison(baseId);
    if (result.success) {
      const updated = getComparisonList();
      setComparisonBases(updated);
      setIsVisible(updated.length > 0);
      window.dispatchEvent(new Event('comparison-updated'));
    }
  };

  const handleClear = () => {
    clearComparison();
    setComparisonBases([]);
    setIsVisible(false);
    window.dispatchEvent(new Event('comparison-updated'));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-4 border-emerald-500 shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title & Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-primary">Compare Bases</h3>
              <p className="text-xs text-muted">
                {comparisonBases.length} of 3 selected
              </p>
            </div>
          </div>

          {/* Middle: Base Chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {comparisonBases.map((base) => (
              <div
                key={base.baseId}
                className="flex items-center gap-2 bg-surface-hover rounded-full px-3 py-1.5 whitespace-nowrap"
              >
                <span className={`w-2 h-2 rounded-full ${badgeColors[base.branch as keyof typeof badgeColors].replace('bg-', 'bg-opacity-100 bg-')}`}></span>
                <span className="text-sm font-medium text-body">{base.baseName}</span>
                <button
                  onClick={() => handleRemove(base.baseId)}
                  className="ml-1 text-muted hover:text-danger transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="text-sm font-medium text-muted hover:text-body transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                // Navigate to comparison page (we'll create this)
                const baseIds = comparisonBases.map(b => b.baseId).join(',');
                window.open(`/base-guides/compare?bases=${baseIds}`, '_blank');
              }}
              disabled={comparisonBases.length < 2}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                comparisonBases.length >= 2
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Compare Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

