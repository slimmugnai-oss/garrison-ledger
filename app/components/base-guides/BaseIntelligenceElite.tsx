'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

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

interface BaseCardEliteProps {
  base: BaseData;
  index: number;
  onCompare?: (base: BaseData) => void;
  isComparing?: boolean;
  onFavorite?: (base: BaseData) => void;
  isFavorite?: boolean;
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      <div className="space-y-3">
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
    </div>
  );
}

function BaseCardElite({ base, index, onCompare, isComparing, onFavorite, isFavorite }: BaseCardEliteProps) {
  const [externalData, setExternalData] = useState<ExternalData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getBranchGradient = (branch: string) => {
    switch (branch) {
      case 'Army': return 'from-green-600 via-green-500 to-emerald-600';
      case 'Navy': return 'from-blue-600 via-blue-500 to-indigo-600';
      case 'Air Force': return 'from-sky-600 via-sky-500 to-cyan-600';
      case 'Marine Corps': return 'from-red-600 via-red-500 to-rose-600';
      case 'Joint': return 'from-purple-600 via-purple-500 to-fuchsia-600';
      default: return 'from-slate-600 via-slate-500 to-gray-600';
    }
  };

  const loadExternalData = useCallback(async (isRetry = false) => {
    try {
      setLoadingData(true);
      setError(null);
      
      const params = new URLSearchParams({
        baseId: base.id,
        ...(base.state && { state: base.state }),
        ...(base.city && { city: base.city }),
        ...(base.lat && { lat: base.lat.toString() }),
        ...(base.lng && { lng: base.lng.toString() })
      });

      const response = await fetch(`/api/base-intelligence/external-data-v3?${params}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      setExternalData(data);
      setRetryCount(0);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMsg);
      
      // Exponential backoff retry
      if (!isRetry && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadExternalData(true);
        }, delay);
      }
    } finally {
      setLoadingData(false);
    }
  }, [base, retryCount]);

  const location = base.region === 'OCONUS' 
    ? `${base.city}, ${base.country}` 
    : `${base.city}, ${base.state}`;

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBranchGradient(base.branch)} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      {/* Header */}
      <div className={`relative bg-gradient-to-r ${getBranchGradient(base.branch)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30">
                <Icon name="Shield" className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {base.title}
                </h3>
                <p className="text-white/90 text-sm flex items-center gap-2">
                  <Icon name="MapPin" className="h-4 w-4" />
                  {location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
                {base.branch}
              </span>
              {base.region && (
                <span className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
                  {base.region}
                </span>
              )}
              {base.size && (
                <span className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
                  {base.size}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onFavorite?.(base)}
              className={`w-12 h-12 rounded-full backdrop-blur-sm border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isFavorite 
                  ? 'bg-white/30 border-white/50' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Icon name={isFavorite ? "Heart" : "Heart"} className={`h-5 w-5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
            
            {onCompare && (
              <button
                onClick={() => onCompare(base)}
                className={`w-12 h-12 rounded-full backdrop-blur-sm border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isComparing 
                    ? 'bg-white/30 border-white/50' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
                title={isComparing ? "Remove from comparison" : "Add to comparison"}
              >
                <Icon name="CheckCircle" className="h-5 w-5" />
              </button>
            )}
            
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
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:scale-110"
            >
              <Icon name={showDetails ? "ChevronUp" : "ChevronDown"} className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative">
        {/* Details Section */}
        {showDetails && (
          <div className="space-y-6 mb-6" style={{ animation: 'slideDown 0.3s ease-out' }}>
            {/* Loading skeleton */}
            {loadingData && <SkeletonLoader />}

            {/* Error state with retry */}
            {error && !loadingData && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <Icon name="AlertCircle" className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                      Unable to load data
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      {error}
                    </p>
                    <button
                      onClick={() => loadExternalData()}
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                    >
                      <Icon name="RotateCcw" className="h-4 w-4" />
                      Retry {retryCount > 0 && `(Attempt ${retryCount + 1})`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Weather Card */}
            {externalData?.weather && !loadingData && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200/50 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <Icon name="Cloud" className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      Current Weather
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Real-time conditions
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                      {externalData.weather.avgTemp}°F
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 capitalize">
                      {externalData.weather.condition}
                    </div>
                  </div>
                  {externalData.weather.humidity && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                        {externalData.weather.humidity}%
                      </div>
                      <div className="text-xs text-orange-700 dark:text-orange-300">
                        Humidity
                      </div>
                    </div>
                  )}
                  {externalData.weather.windSpeed && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                        {externalData.weather.windSpeed}
                      </div>
                      <div className="text-xs text-orange-700 dark:text-orange-300">
                        mph wind
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Housing Card */}
            {externalData?.housing && !loadingData && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                      <Icon name="Home" className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-green-900 dark:text-green-100">
                        Housing Market
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {externalData.housing.marketTrend}
                      </p>
                    </div>
                  </div>
                  {externalData.housing.teaser && (
                    <div className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                      Median Home Price
                    </div>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                      ${externalData.housing.medianHomePrice.toLocaleString()}
                    </div>
                  </div>
                  {externalData.housing.pricePerSqFt && (
                    <div>
                      <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                        Price per Sq Ft
                      </div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                        ${externalData.housing.pricePerSqFt}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress bar for market trend */}
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-green-200 dark:bg-green-900/30">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: externalData.housing.teaser ? '75%' : '100%' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Upsell */}
            {externalData?.requiresPremium && !loadingData && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border-2 border-amber-300/50 dark:border-amber-600/50 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Icon name="Crown" className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                      Unlock Complete Intelligence
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                      Get accurate housing data, detailed school ratings, and comprehensive market analysis. Join 500+ military families who trust Garrison Ledger.
                    </p>
                    <div className="flex gap-3 items-center">
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Upgrade to Premium
                        <Icon name="ArrowRight" className="h-4 w-4" />
                      </a>
                      <div className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Icon name="Shield" className="h-4 w-4" />
                        <span className="font-semibold">Veteran-founded & military-trusted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schools (Premium) */}
            {externalData?.schools && !loadingData && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                    <Icon name="GraduationCap" className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      School District
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {externalData.schools.schoolCount} schools analyzed
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                      Average Rating
                    </div>
                    <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                      {externalData.schools.averageRating}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                      Top School
                    </div>
                    <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {externalData.schools.topSchool}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <a
          href={base.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-center gap-2">
            <span>View Complete Base Guide</span>
            <Icon name="ExternalLink" className="h-5 w-5" />
          </div>
        </a>
      </div>
    </div>
  );
}

export default function BaseIntelligenceElite() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'CONUS' | 'OCONUS' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comparingBases, setComparingBases] = useState<BaseData[]>([]);
  const [favoriteBases, setFavoriteBases] = useState<string[]>([]);
  
  // Get all bases
  const allBases = useMemo(() => getAllBases(), []);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('garrison-favorites');
    if (saved) {
      try {
        setFavoriteBases(JSON.parse(saved));
        } catch {
          // Non-critical: Failed to load cached data - user can retry
        }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('garrison-favorites', JSON.stringify(favoriteBases));
  }, [favoriteBases]);

  // Get state counts
  const stateCounts = useMemo(() => {
    const conusBases = allBases.filter(base => !base.region || base.region === 'CONUS');
    const counts: Record<string, number> = {};
    
    conusBases.forEach(base => {
      if (base.state) {
        counts[base.state] = (counts[base.state] || 0) + 1;
      }
    });
    
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [allBases]);

  // Get OCONUS counts
  const oconusCounts = useMemo(() => {
    const oconusBases = allBases.filter(base => base.region === 'OCONUS');
    return oconusBases.length;
  }, [allBases]);

  // Get filtered bases
  const filteredBases = useMemo(() => {
    let bases = [...allBases];

    // Filter by favorites if showing favorites
    if (favoriteBases.length > 0 && !selectedState && !selectedRegion) {
      bases = bases.filter(base => favoriteBases.includes(base.id));
    }

    if (selectedState) {
      bases = bases.filter(base => base.state === selectedState);
    } else if (selectedRegion === 'OCONUS') {
      bases = bases.filter(base => base.region === 'OCONUS');
    }

    // Search filter
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
  }, [allBases, selectedState, selectedRegion, searchQuery, favoriteBases]);

  const handleCompare = (base: BaseData) => {
    setComparingBases(prev => {
      const exists = prev.find(b => b.id === base.id);
      if (exists) {
        return prev.filter(b => b.id !== base.id);
      } else if (prev.length < 3) {
        return [...prev, base];
      }
      return prev;
    });
  };

  const handleFavorite = (base: BaseData) => {
    setFavoriteBases(prev => {
      const exists = prev.includes(base.id);
      if (exists) {
        return prev.filter(id => id !== base.id);
      } else {
        return [...prev, base.id];
      }
    });
  };

  const clearSelection = () => {
    setSelectedState(null);
    setSelectedRegion(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 2000px;
          }
        }
      `}</style>

      {/* Hero */}
      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Military Base Intelligence
          </span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
          Real-time weather, housing market data, and school ratings for every military installation
        </p>
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Shield" className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Veteran-Founded</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Users" className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">500+ Families Trust Us</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Real-Time Data</span>
          </div>
        </div>
      </div>

      {/* Search & Comparison Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <Icon name="Search" className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search by base name, city, state, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-5 py-5 text-lg border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Comparing indicator */}
        {comparingBases.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Comparing {comparingBases.length} base{comparingBases.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setComparingBases([])}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
              >
                Clear comparison
              </button>
            </div>
          </div>
        )}

        {/* State Selection */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
              <Icon name="MapPin" className="h-5 w-5 text-white" />
            </div>
            United States ({stateCounts.reduce((sum, [, count]) => sum + count, 0)} bases)
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
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 shadow-lg'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-600 transition-colors">
                    {state}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {count}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* OCONUS Selection */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Icon name="Globe" className="h-5 w-5 text-white" />
            </div>
            Worldwide ({oconusCounts} bases)
          </h3>
          <button
            onClick={() => {
              setSelectedRegion('OCONUS');
              setSelectedState(null);
            }}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              selectedRegion === 'OCONUS'
                ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                OCONUS
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {oconusCounts} bases worldwide
              </div>
            </div>
          </button>
        </div>

        {/* Clear button */}
        {(selectedState || selectedRegion || searchQuery) && (
          <div className="text-center mt-8">
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-md hover:shadow-lg"
            >
              <Icon name="RotateCcw" className="h-5 w-5" />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Base Cards */}
      {filteredBases.length > 0 && (
        <div className="space-y-8">
          <div className="text-center bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {selectedState ? `${selectedState} Installations` : 
               selectedRegion === 'OCONUS' ? 'Worldwide Installations' :
               searchQuery ? 'Search Results' : 
               favoriteBases.length > 0 ? 'Your Favorites' : 'All Installations'}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {filteredBases.length} base{filteredBases.length !== 1 ? 's' : ''} • Click Details to explore intelligence data
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBases.map((base, index) => (
              <BaseCardElite 
                key={base.id} 
                base={base} 
                index={index}
                onCompare={handleCompare}
                isComparing={comparingBases.some(b => b.id === base.id)}
                onFavorite={handleFavorite}
                isFavorite={favoriteBases.includes(base.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBases.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Icon name="Search" className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            No bases found
          </h3>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-md mx-auto">
            Try adjusting your search or selecting a different state or region
          </p>
          <button
            onClick={clearSelection}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-10 py-5 rounded-2xl font-bold hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            <Icon name="RotateCcw" className="h-6 w-6" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
