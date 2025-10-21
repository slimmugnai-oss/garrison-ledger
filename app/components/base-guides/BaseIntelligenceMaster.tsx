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
  };
  cached?: boolean;
  requiresPremium?: boolean;
  error?: string;
}

interface BaseCardProps {
  base: BaseData;
}

function BaseCard({ base }: BaseCardProps) {
  const [externalData, setExternalData] = useState<ExternalData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'Army': return 'bg-green-600';
      case 'Navy': return 'bg-blue-600';
      case 'Air Force': return 'bg-sky-600';
      case 'org': return 'bg-red-600';
      case 'Joint': return 'bg-purple-600';
      default: return 'bg-gray-600';
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
    } catch {
      setExternalData({ error: 'Failed to load data' });
    } finally {
      setLoadingData(false);
    }
  };

  const location = base.region === 'OCONUS' 
    ? `${base.city}, ${base.country}` 
    : `${base.city}, ${base.state}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {base.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Icon name="MapPin" className="h-4 w-4" />
              {location}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getBranchColor(base.branch)}`}>
                {base.branch}
              </span>
              {base.region && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {base.region}
                </span>
              )}
              {base.size && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {base.size}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div className="mb-6 space-y-4">
            {loadingData && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Loading data...
                  </p>
                </div>
              </div>
            )}

            {externalData?.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <Icon name="AlertCircle" className="h-4 w-4" />
                  {externalData.error}
                </p>
              </div>
            )}

            {externalData?.weather && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Cloud" className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {externalData.weather.avgTemp}°F
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 capitalize">
                        {externalData.weather.condition}
                      </p>
                    </div>
                  </div>
                  {externalData.weather.humidity && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        {externalData.weather.humidity}%
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Humidity
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {externalData?.requiresPremium && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4 border-2 border-amber-300 dark:border-amber-600">
                <div className="flex items-start gap-3">
                  <Icon name="Crown" className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                      Unlock School & Housing Data
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-200 mb-3">
                      Get detailed school ratings and housing market data for this base
                    </p>
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-2 bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors text-xs"
                    >
                      Upgrade to Premium
                      <Icon name="ArrowRight" className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {externalData?.schools && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="GraduationCap" className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                    Schools
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-400 font-medium">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {externalData.schools.averageRating}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-400 font-medium">
                      Schools Found
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {externalData.schools.schoolCount}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Top: {externalData.schools.topSchool}
                </p>
              </div>
            )}

            {externalData?.housing && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Home" className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900 dark:text-green-300">
                    Housing Market
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-green-700 dark:text-green-400 font-medium">
                      Median Rent
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${externalData.housing.medianRent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700 dark:text-green-400 font-medium">
                      Home Price
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${externalData.housing.medianHomePrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Market: {externalData.housing.marketTrend}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={base.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-md hover:shadow-lg"
          >
            View Full Guide
            <Icon name="ExternalLink" className="h-4 w-4" />
          </a>

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
            className="inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            <Icon name={showDetails ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showDetails ? 'Hide' : 'Details'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BaseIntelligenceMaster() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'CONUS' | 'OCONUS' | null>(null);
  
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
    if (selectedState) {
      return allBases.filter(base => base.state === selectedState);
    } else if (selectedRegion === 'OCONUS') {
      return allBases.filter(base => base.region === 'OCONUS');
    }
    return [];
  }, [allBases, selectedState, selectedRegion]);

  const clearSelection = () => {
    setSelectedState(null);
    setSelectedRegion(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Military Base Intelligence
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Click on a state or region to explore bases
            </p>
          </div>
          {(selectedState || selectedRegion) && (
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon name="X" className="h-4 w-4" />
              Clear Selection
            </button>
          )}
        </div>

        {/* CONUS States */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            United States Bases ({stateCounts.reduce((sum, [, count]) => sum + count, 0)} bases)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {stateCounts.map(([state, count]) => (
              <button
                key={state}
                onClick={() => {
                  setSelectedState(state);
                  setSelectedRegion(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  selectedState === state
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
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
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Worldwide Bases ({oconusCounts.reduce((sum, [, count]) => sum + count, 0)} bases)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {oconusCounts.map(([country, count]) => (
              <button
                key={country}
                onClick={() => {
                  setSelectedRegion('OCONUS');
                  setSelectedState(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  selectedRegion === 'OCONUS'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
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

      {/* Base Cards */}
      {filteredBases.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            {selectedState ? `${selectedState} Bases` : 'Worldwide Bases'} ({filteredBases.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBases.map((base) => (
              <BaseCard key={base.id} base={base} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedState && !selectedRegion && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <Icon name="MapPin" className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Select a State or Region
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Click on any state or country above to explore military bases
          </p>
        </div>
      )}
    </div>
  );
}
