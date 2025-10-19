'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getAllBases } from '@/app/data/bases';
import type { BaseData } from '@/app/data/bases';
import Icon from '../ui/Icon';
import BaseGuideCardPro from './BaseGuideCardPro';

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

export default function BaseIntelligencePro() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<'CONUS' | 'OCONUS' | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [autoLoadWeather, setAutoLoadWeather] = useState(false);
  const [recommendations, setRecommendations] = useState<BaseRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  // Get all bases
  const allBases = useMemo(() => getAllBases(), []);

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoadingRecs(true);
      const response = await fetch('/api/base-intelligence/recommend');
      const data = await response.json();
      
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  // Optimized filtering with useMemo
  const filteredBases = useMemo(() => {
    let bases = [...allBases];

    // Filter by region
    if (selectedRegion !== 'All') {
      if (selectedRegion === 'CONUS') {
        bases = bases.filter(base => !base.region || base.region === 'CONUS');
      } else if (selectedRegion === 'OCONUS') {
        bases = bases.filter(base => base.region === 'OCONUS');
      }
    }

    // Filter by branch
    if (selectedBranch !== 'All') {
      bases = bases.filter(base => base.branch === selectedBranch);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      bases = bases.filter(base =>
        base.title.toLowerCase().includes(lowerQuery) ||
        base.state.toLowerCase().includes(lowerQuery) ||
        base.city.toLowerCase().includes(lowerQuery) ||
        base.branch.toLowerCase().includes(lowerQuery) ||
        (base.country && base.country.toLowerCase().includes(lowerQuery))
      );
    }

    return bases;
  }, [allBases, searchQuery, selectedBranch, selectedRegion]);

  // Group bases by state/country for quick filters
  const topLocations = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    filteredBases.forEach(base => {
      const key = base.region === 'OCONUS' ? (base.country || 'Other') : base.state;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
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

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedBranch('All');
    setSelectedRegion('All');
  }, []);

  return (
    <div className="space-y-8">
      {/* AI Recommendations Section */}
      {recommendations.length > 0 && showRecommendations && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  AI-Recommended Bases for You
                </h2>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Based on your profile and preferences
              </p>
            </div>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              <Icon name="X" className="h-5 w-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec) => (
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
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getBranchColor(rec.branch)}`}>
                        {rec.branch}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rec.city}, {rec.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{rec.matchScore}%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Match</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Why this base:
                  </h4>
                  <ul className="space-y-1">
                    {rec.reasons.slice(0, 3).map((reason, idx) => (
                      <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm w-full justify-center"
                >
                  View Base Guide
                  <Icon name="ExternalLink" className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Explore Military Installations
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Grid view"
            >
              <Icon name="Grid" className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="List view"
            >
              <Icon name="List" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by base name, city, state, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="All">All Branches</option>
              <option value="Army">Army</option>
              <option value="Navy">Navy</option>
              <option value="Air Force">Air Force</option>
              <option value="Marine Corps">Marine Corps</option>
              <option value="Joint">Joint</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Location
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as 'CONUS' | 'OCONUS' | 'All')}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="All">All Locations</option>
              <option value="CONUS">United States</option>
              <option value="OCONUS">Worldwide</option>
            </select>
          </div>

          {/* Auto-load toggle */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Weather Data
            </label>
            <button
              onClick={() => setAutoLoadWeather(!autoLoadWeather)}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                autoLoadWeather
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              <Icon name={autoLoadWeather ? "Cloud" : "CloudOff"} className="h-5 w-5 inline mr-2" />
              {autoLoadWeather ? 'Auto-loading' : 'Manual Load'}
            </button>
          </div>
        </div>

        {/* Results Summary & Quick Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <span className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">
                {filteredBases.length}
              </span>
              <span className="text-sm text-emerald-700 dark:text-emerald-300 ml-2">
                bases found
              </span>
            </div>
            
            {(searchQuery || selectedBranch !== 'All' || selectedRegion !== 'All') && (
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Icon name="X" className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>

          {/* Top Locations Quick Filter */}
          {topLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topLocations.map(([location, count]) => (
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
          )}
        </div>
      </div>

      {/* Base Cards Grid */}
      {filteredBases.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredBases.map((base) => (
            <BaseGuideCardPro 
              key={base.id} 
              base={base} 
              autoLoadData={autoLoadWeather}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <Icon name="Search" className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            No bases found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Icon name="RotateCcw" className="h-5 w-5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
