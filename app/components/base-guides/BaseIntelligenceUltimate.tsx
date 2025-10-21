'use client';

import { useState, useMemo } from 'react';
import { getAllBases } from '@/app/data/bases';
import type { BaseData } from '@/app/data/bases';
import Icon from '../ui/Icon';

interface ExternalData {
  schools?: {
    averageRating: number;
    ratingBand?: 'below_average' | 'average' | 'above_average';
    topSchool: string;
    schoolCount: number;
    source: string;
  };
  weather?: {
    avgTemp: number;
    feelsLike?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    source: string;
  };
  housing?: {
    medianRent: number;
    medianHomePrice: number;
    pricePerSqFt?: number;
    marketTrend: string;
    zestimate?: number;
    source: string;
    teaser?: boolean;
  };
  cached?: boolean;
  requiresPremium?: boolean;
  error?: string;
}

interface BaseCardUltimateProps {
  base: BaseData;
  index: number;
}

function BaseCardUltimate({ base, index }: BaseCardUltimateProps) {
  const [externalData, setExternalData] = useState<ExternalData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'Army': return 'from-green-500 to-green-600';
      case 'Navy': return 'from-blue-500 to-blue-600';
      case 'Air Force': return 'from-sky-500 to-sky-600';
      case 'Marine Corps': return 'from-red-500 to-red-600';
      case 'Joint': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getBranchIcon = (branch: string) => {
    switch (branch) {
      case 'Army': return 'Shield';
      case 'Navy': return 'Shield';
      case 'Air Force': return 'Shield';
      case 'Marine Corps': return 'Shield';
      case 'Joint': return 'Users';
      default: return 'Shield';
    }
  };

  const loadExternalData = async () => {
    try {
      setLoadingData(true);
      
      const params = new URLSearchParams({
        baseId: base.id,
        ...(base.state && { state: base.state }),
        ...(base.city && { city: base.city }),
        ...(base.lat && { lat: base.lat.toString() }),
        ...(base.lng && { lng: base.lng.toString() })
      });

      const response = await fetch(`/api/base-intelligence/external-data-v3?${params}`);
      const data = await response.json();
      
      setExternalData(data);
    } catch (error) {
      setExternalData({ error: 'Failed to load data' });
    } finally {
      setLoadingData(false);
    }
  };

  const location = base.region === 'OCONUS' 
    ? `${base.city}, ${base.country}` 
    : `${base.city}, ${base.state}`;

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg hover:shadow-xl'
      }`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        animationDelay: `${index * 100}ms`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header with branch gradient */}
      <div className={`relative bg-gradient-to-r ${getBranchColor(base.branch)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon name={getBranchIcon(base.branch)} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-white/90 transition-colors">
                  {base.title}
                </h3>
                <p className="text-white/80 text-sm flex items-center gap-2">
                  <Icon name="MapPin" className="h-4 w-4" />
                  {location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
                {base.branch}
              </span>
              {base.region && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
                  {base.region}
                </span>
              )}
              {base.size && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
                  {base.size}
                </span>
              )}
            </div>
          </div>
          
          {/* Floating action button */}
          <div className="relative">
            <button
              onClick={() => {
                if (!showDetails) {
                  setShowDetails(true);
                  if (!externalData) {
                    loadExternalData();
                  }
                } else {
                  setShowDetails(false);
                }
              }}
              className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:scale-110 ${
                showDetails ? 'bg-white/30 scale-110' : ''
              }`}
            >
              <Icon 
                name={showDetails ? "ChevronUp" : "ChevronDown"} 
                className="h-6 w-6 text-white transition-transform duration-300" 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6 relative">
        {/* Loading state */}
        {loadingData && (
          <div className="absolute inset-6 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-sm text-slate-600 font-medium">Loading intelligence data...</p>
            </div>
          </div>
        )}

        {/* Details Section */}
        {showDetails && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            {/* Weather Card */}
            {externalData?.weather && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <Icon name="Cloud" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      Current Weather
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Real-time conditions
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                      {externalData.weather.avgTemp}°
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300 capitalize">
                      {externalData.weather.condition}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {externalData.weather.humidity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700 dark:text-orange-300">Humidity</span>
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          {externalData.weather.humidity}%
                        </span>
                      </div>
                    )}
                    {externalData.weather.windSpeed && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700 dark:text-orange-300">Wind</span>
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          {externalData.weather.windSpeed} mph
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Housing Market Card */}
            {externalData?.housing && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Icon name="Home" className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-900 dark:text-green-100">
                        Housing Market
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {externalData.housing.teaser ? 'Preview data' : 'Complete market analysis'}
                      </p>
                    </div>
                  </div>
                  {externalData.housing.teaser && (
                    <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                      ${externalData.housing.medianHomePrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Median Home Price
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                      {externalData.housing.pricePerSqFt}/sq ft
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Price per Sq Ft
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Market: <span className="font-semibold text-green-900 dark:text-green-100">
                      {externalData.housing.marketTrend}
                    </span>
                  </div>
                  {externalData.housing.zestimate && (
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Est. Value: <span className="font-semibold text-green-900 dark:text-green-100">
                        ${externalData.housing.zestimate.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Premium Upsell */}
            {externalData?.requiresPremium && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border-2 border-amber-300/50 dark:border-amber-600/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="Crown" className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                      Unlock Complete Intelligence
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                      Get detailed school ratings, accurate housing data, and comprehensive market analysis for this base.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Upgrade to Premium
                        <Icon name="ArrowRight" className="h-4 w-4" />
                      </a>
                      <div className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Icon name="Star" className="h-3 w-3" />
                        <span>Trusted by 500+ military families</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schools Card (Premium only) */}
            {externalData?.schools && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Icon name="GraduationCap" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      School District
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {externalData.schools.schoolCount} schools analyzed
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                      {externalData.schools.averageRating}/10
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Average Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                      {externalData.schools.schoolCount}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Schools Found
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Top School:</span> {externalData.schools.topSchool}
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {externalData?.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <Icon name="AlertCircle" className="h-6 w-6 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">
                      Unable to load data
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {externalData.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <a
            href={base.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View Complete Guide
            <Icon name="ExternalLink" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BaseIntelligenceUltimate() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'CONUS' | 'OCONUS' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all bases
  const allBases = useMemo(() => getAllBases(), []);

  // Get state counts for CONUS bases
  const stateCounts = useMemo(() => {
    const conusBases = allBases.filter(base => !base.region || base.region === 'CONUS');
    const counts: Record<string, number> = {};
    
    conusBases.forEach(base => {
      if (base.state) {
        counts[base.state] = (counts[base.state] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a);
  }, [allBases]);

  // Get OCONUS counts
  const oconusCounts = useMemo(() => {
    const oconusBases = allBases.filter(base => base.region === 'OCONUS');
    const counts: Record<string, number> = {};
    
    oconusBases.forEach(base => {
      const key = base.country || 'Other';
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a);
  }, [allBases]);

  // Get filtered bases
  const filteredBases = useMemo(() => {
    let bases = [...allBases];

    if (selectedState) {
      bases = bases.filter(base => base.state === selectedState);
    } else if (selectedRegion === 'OCONUS') {
      bases = bases.filter(base => base.region === 'OCONUS');
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
  }, [allBases, selectedState, selectedRegion, searchQuery]);

  const clearSelection = () => {
    setSelectedState(null);
    setSelectedRegion(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Military Base Intelligence
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Comprehensive data, real-time insights, and expert analysis for every military installation
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search bases, cities, states, or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* State/Region Selection */}
        <div className="space-y-8">
          {/* CONUS States */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <Icon name="MapPin" className="h-4 w-4 text-white" />
              </div>
              United States Bases ({stateCounts.reduce((sum, [, count]) => sum + count, 0)} installations)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {stateCounts.map(([state, count]) => (
                <button
                  key={state}
                  onClick={() => {
                    setSelectedState(state);
                    setSelectedRegion(null);
                  }}
                  className={`group p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedState === state
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300 hover:shadow-lg'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-/// dark:text-slate-100 mb-2 group-hover:text-emerald-600 transition-colors">
                      {state}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {count} base{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* OCONUS */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Icon name="Globe" className="h-4 w-4 text-white" />
              </div>
              Worldwide Bases ({oconusCounts.reduce((sum, [, count]) => sum + count, 0)} installations)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {oconusCounts.map(([country, count]) => (
                <button
                  key={country}
                  onClick={() => {
                    setSelectedRegion('OCONUS');
                    setSelectedState(null);
                  }}
                  className={`group p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedRegion === 'OCONUS'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300 hover:shadow-lg'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-600 transition-colors">
                      {country}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {count} base{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Selection */}
        {(selectedState || selectedRegion || searchQuery) && (
          <div className="text-center mt-8">
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon name="RotateCcw" className="h-4 w-4" />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Base Cards */}
      {filteredBases.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {selectedState ? `${selectedState} Installations` : 
               selectedRegion === 'OCONUS' ? 'Worldwide Installations' :
               searchQuery ? 'Search Results' : 'All Installations'} ({filteredBases.length})
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Click on any base to explore detailed intelligence data
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBases.map((base, index) => (
              <BaseCardUltimate key={base.id} base={base} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBases.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Icon name="Search" className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            No bases found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Try adjusting your search or selecting a different state or region
          </p>
          <button
            onClick={clearSelection}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Icon name="RotateCcw" className="h-5 w-5" />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
