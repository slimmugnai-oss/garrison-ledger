'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { basesData } from '@/app/data/bases';
import type { BaseData } from '@/app/data/bases';

export default function BaseComparisonPanel() {
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load comparison list from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('base_comparison_list');
      if (saved) {
        try {
          setComparisonList(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse comparison list:', e);
        }
      }
    }
  }, []);

  const addToComparison = (baseId: string) => {
    if (comparisonList.includes(baseId)) {
      return; // Already in list
    }

    if (comparisonList.length >= 5) {
      alert('You can compare up to 5 bases at a time');
      return;
    }

    const newList = [...comparisonList, baseId];
    setComparisonList(newList);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('base_comparison_list', JSON.stringify(newList));
    }

    setIsOpen(true);
  };

  const removeFromComparison = (baseId: string) => {
    const newList = comparisonList.filter(id => id !== baseId);
    setComparisonList(newList);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('base_comparison_list', JSON.stringify(newList));
    }
  };

  const clearComparison = () => {
    setComparisonList([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('base_comparison_list');
    }
  };

  const compareBases = basesData.filter(base => comparisonList.includes(base.id));

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t-4 border-emerald-600 shadow-2xl">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              {isOpen ? (
                <Icon name="ChevronDown" className="h-6 w-6" />
              ) : (
                <Icon name="ChevronUp" className="h-6 w-6" />
              )}
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Comparing {comparisonList.length} Base{comparisonList.length > 1 ? 's' : ''}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearComparison}
              className="text-sm text-red-600 hover:text-red-800 font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        {isOpen && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {compareBases.map(base => (
              <div
                key={base.id}
                className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 relative"
              >
                <button
                  onClick={() => removeFromComparison(base.id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  <Icon name="X" className="h-4 w-4" />
                </button>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 pr-6">
                  {base.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {base.city}, {base.state}
                </p>
                <span className="text-xs px-2 py-1 rounded bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200">
                  {base.branch}
                </span>
              </div>
            ))}

            {comparisonList.length < 5 && (
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Add up to {5 - comparisonList.length} more base{5 - comparisonList.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

