'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    precipitation?: number;
    climate?: string;
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
}

interface EnhancedBaseCardProps {
  base: BaseData;
  showDetails?: boolean;
}

export default function EnhancedBaseCard({ base, showDetails = false }: EnhancedBaseCardProps) {
  const [externalData, setExternalData] = useState<ExternalData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [expanded, setExpanded] = useState(showDetails);

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

  const loadExternalData = async () => {
    try {
      setLoadingData(true);
      
      // Build query params
      const params = new URLSearchParams({
        baseId: base.id,
        ...(base.state && { state: base.state }),
        ...(base.city && { city: base.city }),
        ...(base.lat && { lat: base.lat.toString() }),
        ...(base.lng && { lng: base.lng.toString() })
      });

      const response = await fetch(`/api/base-intelligence/external-data-v3?${params}`);
      const data = await response.json();
      
      if (!data.error) {
        setExternalData(data);
      }
    } catch {
      // Log error but don't show to user - external data is optional enhancement
      if (process.env.NODE_ENV === 'development') {
        // Failed to load external data - non-critical enhancement
      }
      // Keep externalData as null - card will function without it
    } finally {
      setLoadingData(false);
    }
  };

  // Load external data when expanded
  useEffect(() => {
    if (expanded && !externalData && !loadingData) {
      loadExternalData();
    }
  }, [expanded, externalData, loadExternalData, loadingData]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {base.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {location}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
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

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <a
            href={base.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            View Guide
            <Icon name="ExternalLink" className="h-4 w-4" />
          </a>

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
            title={expanded ? "Hide Details" : "Show Weather, Housing & School Data"}
          >
            <Icon name={expanded ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
            <span className="hidden sm:inline">{expanded ? "Hide" : "Details"}</span>
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            {loadingData && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Loading real-time data...
                </p>
              </div>
            )}

            {externalData && !loadingData && (
              <div className="space-y-4">
                {/* Premium Upsell for Schools */}
                {externalData.requiresPremium && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-6 border-2 border-amber-300 dark:border-amber-600">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="GraduationCap" className="h-6 w-6 text-amber-600" />
                      <h4 className="font-bold text-amber-900 dark:text-amber-100">
                        Unlock School Ratings ⭐
                      </h4>
                    </div>
                    
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                      Upgrade to Premium to see real school data from GreatSchools.org:
                    </p>
                    
                    <ul className="space-y-2 mb-4 text-sm text-amber-700 dark:text-amber-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">✓</span>
                        <span>Average school rating (1-10 scale)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">✓</span>
                        <span>Rating band (above/below average)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">✓</span>
                        <span>Top schools in the area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">✓</span>
                        <span>Number of schools nearby</span>
                      </li>
                    </ul>
                    
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors w-full justify-center"
                    >
                      Upgrade to Premium
                      <Icon name="Crown" className="h-4 w-4" />
                    </Link>
                    
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 text-center">
                      Only $9.99/month • School data from GreatSchools.org
                    </p>
                  </div>
                )}

                {/* Schools Data (Premium/Pro Only) */}
                {externalData.schools && (
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
                    <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                      Source: {externalData.schools.source}
                    </p>
                  </div>
                )}

                {/* Weather Data */}
                {externalData.weather && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Cloud" className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-900 dark:text-orange-300">
                        Current Weather
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-orange-700 dark:text-orange-400 font-medium">
                          Temperature
                        </p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                          {externalData.weather.avgTemp}°F
                        </p>
                        {externalData.weather.feelsLike && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            Feels like {externalData.weather.feelsLike}°F
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-orange-700 dark:text-orange-400 font-medium">
                          Conditions
                        </p>
                        <p className="text-sm font-bold text-orange-900 dark:text-orange-100 capitalize">
                          {externalData.weather.condition || externalData.weather.climate}
                        </p>
                        {externalData.weather.humidity && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {externalData.weather.humidity}% humidity
                          </p>
                        )}
                      </div>
                    </div>
                    {externalData.weather.windSpeed && (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        Wind: {externalData.weather.windSpeed} mph
                      </div>
                    )}
                    <p className="text-xs text-orange-500 dark:text-orange-500 mt-2">
                      Source: {externalData.weather.source}
                    </p>
                  </div>
                )}

                {/* Housing Data (Zillow) */}
                {externalData.housing && externalData.housing.medianHomePrice > 0 && (
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
                          Median Home Price
                        </p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          ${externalData.housing.medianHomePrice.toLocaleString()}
                        </p>
                        {externalData.housing.zestimate && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Zestimate: ${externalData.housing.zestimate.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-green-700 dark:text-green-400 font-medium">
                          Price per Sq Ft
                        </p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          ${externalData.housing.pricePerSqFt?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Market: {externalData.housing.marketTrend}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-green-500 dark:text-green-500 mt-2">
                      Source: {externalData.housing.source}
                    </p>
                  </div>
                )}

                {externalData.cached && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Data cached for fast loading • Updates monthly
                  </p>
                )}
              </div>
            )}

            {!externalData && !loadingData && (
              <div className="text-center py-4">
                <button
                  onClick={loadExternalData}
                  className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm"
                >
                  Load School & Weather Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


