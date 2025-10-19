'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import type { BaseData } from '@/app/data/bases';

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

interface BaseGuideCardProProps {
  base: BaseData;
  autoLoadData?: boolean;
}

export default function BaseGuideCardPro({ base, autoLoadData = false }: BaseGuideCardProProps) {
  const [externalData, setExternalData] = useState<ExternalData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Auto-load weather data on mount if enabled
  useEffect(() => {
    if (autoLoadData && !externalData && !loadingData) {
      loadExternalData();
    }
  }, [autoLoadData]);

  const loadExternalData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams({
        baseId: base.id,
        ...(base.state && { state: base.state }),
        ...(base.city && { city: base.city }),
        ...(base.lat && { lat: base.lat.toString() }),
        ...(base.lng && { lng: base.lng.toString() })
      });

      // Use the v3 endpoint which actually exists
      const response = await fetch(`/api/base-intelligence/external-data-v3?${params}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setExternalData(data);
    } catch (error) {
      console.error('Failed to load external data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden group">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-600 transition-colors">
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

        {/* Quick Weather Preview (Auto-loaded) */}
        {loadingData && !externalData && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Loading weather data...
              </p>
            </div>
          </div>
        )}

        {externalData?.weather && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 mb-4">
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

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <Icon name="AlertCircle" className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {/* Premium Upsell */}
        {externalData?.requiresPremium && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4 mb-4 border-2 border-amber-300 dark:border-amber-600">
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

        {/* Schools & Housing Data (Premium) */}
        {externalData?.schools && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
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

          {!externalData && !loadingData && (
            <button
              onClick={loadExternalData}
              className="inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
              title="Load weather and data"
            >
              <Icon name="Cloud" className="h-4 w-4" />
              <span className="hidden sm:inline">Load Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
