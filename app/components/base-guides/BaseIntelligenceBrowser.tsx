'use client';

import { useState, useMemo, useEffect } from 'react';
import { basesData } from '@/app/data/bases';
import type { BaseData } from '@/app/data/bases';
import Icon from '../ui/Icon';
import Link from 'next/link';
import EnhancedBaseCard from './EnhancedBaseCard';

interface BaseRecommendation {
  baseId: string;
  baseName: string;
  matchScore: number;
  reasons: string[];
  considerations: string[];
  branch: string;
  state: string;
  city: string;
  url: string;
}

export default function BaseIntelligenceBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<'CONUS' | 'OCONUS' | 'All'>('All');
  const [recommendations, setRecommendations] = useState<BaseRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const response = await fetch('/api/base-intelligence/recommend');
      const data = await response.json();
      
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else if (data.needsAssessment) {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Filter bases
  const filteredBases = useMemo(() => {
    let bases = [...basesData];

    // Filter by region
    if (selectedRegion !== 'All') {
      bases = bases.filter(base => base.region === selectedRegion);
    }

    // Filter by branch
    if (selectedBranch !== 'All') {
      bases = bases.filter(base => base.branch === selectedBranch);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      bases = bases.filter(base =>
        base.title.toLowerCase().includes(query) ||
        base.city.toLowerCase().includes(query) ||
        base.state.toLowerCase().includes(query) ||
        (base.country && base.country.toLowerCase().includes(query))
      );
    }

    return bases;
  }, [searchQuery, selectedBranch, selectedRegion]);

  // Group bases by state/country
  const groupedBases = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    filteredBases.forEach(base => {
      const key = base.region === 'OCONUS' ? (base.country || 'Other') : base.state;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return grouped;
  }, [filteredBases]);

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'Army': return 'bg-green-600';
      case 'Navy': return 'bg-blue-600';
      case 'Air Force': return 'bg-sky-600';
      case 'Marine Corps': return 'bg-red-600';
      case 'Joint': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Recommendations Section */}
      {recommendations.length > 0 && showRecommendations && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  Recommended for You
                </h2>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Based on your profile, these bases may be great fits for your family
              </p>
            </div>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <Icon name="X" className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.baseId}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {rec.baseName}
                      </h3>
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getBranchColor(rec.branch)}`}>
                        {rec.branch}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rec.city}, {rec.state}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-600">{rec.matchScore}%</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Match</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                      Why this base:
                    </h4>
                    <ul className="space-y-1">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.considerations && rec.considerations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                        Consider:
                      </h4>
                      <ul className="space-y-1">
                        {rec.considerations.map((consideration, idx) => (
                          <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  View Base Guide
                  <Icon name="ExternalLink" className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={loadRecommendations}
              disabled={loadingRecs}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold"
            >
              {loadingRecs ? 'Refreshing...' : 'Refresh Recommendations'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Browse All Bases
        </h2>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="md:col-span-3">
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by base name, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="All">All Branches</option>
            <option value="Army">Army</option>
            <option value="Navy">Navy</option>
            <option value="Air Force">Air Force</option>
            <option value="Marine Corps">Marine Corps</option>
            <option value="Joint">Joint</option>
          </select>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as 'CONUS' | 'OCONUS' | 'All')}
            className="px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="All">All Locations</option>
            <option value="CONUS">United States</option>
            <option value="OCONUS">Worldwide</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center md:justify-start px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {filteredBases.length} bases found
            </span>
          </div>
        </div>

        {/* Location Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(groupedBases)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([location, count]) => (
              <button
                key={location}
                onClick={() => setSearchQuery(location)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-emerald-50 hover:border-emerald-500 dark:hover:bg-emerald-900/20"
              >
                <span>{location}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600">
                  {count}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Base Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBases.map((base) => (
          <EnhancedBaseCard key={base.id} base={base} />
        ))}
      </div>

      {filteredBases.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            No bases found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBranch('All');
              setSelectedRegion('All');
            }}
            className="text-emerald-600 hover:text-emerald-800 font-semibold"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function BaseCard({ base }: { base: BaseData }) {
  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'Army': return 'bg-green-600';
      case 'Navy': return 'bg-blue-600';
      case 'Air Force': return 'bg-sky-600';
      case 'Marine Corps': return 'bg-red-600';
      case 'Joint': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const location = base.region === 'OCONUS' 
    ? `${base.city}, ${base.country}` 
    : `${base.city}, ${base.state}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            {base.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {location}
          </p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getBranchColor(base.branch)}`}>
              {base.branch}
            </span>
            {base.region && (
              <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {base.region}
              </span>
            )}
            {base.size && (
              <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {base.size}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={base.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm"
        >
          View Guide
          <Icon name="ExternalLink" className="h-4 w-4" />
        </a>
        
        <Link
          href={`https://www.defensetravel.dod.mil/site/bahCalc.cfm`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          <Icon name="Calculator" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

