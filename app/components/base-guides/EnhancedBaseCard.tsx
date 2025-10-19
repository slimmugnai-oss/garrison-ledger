'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import Link from 'next/link';
import type { BaseData } from '@/app/data/bases';

interface ExternalData {
  schools?: {
    averageRating: number;
    topSchool: string;
    schoolCount: number;
    source: string;
  };
  weather?: {
    avgTemp: number;
    precipitation: number;
    climate: string;
    source: string;
  };
  housing?: {
    medianRent: number;
    medianHomePrice: number;
    marketTrend: string;
    source: string;
  };
  cached?: boolean;
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

  // Load external data when expanded
  useEffect(() => {
    if (expanded && !externalData && !loadingData) {
      loadExternalData();
    }
  }, [expanded]);

  const loadExternalData = async () => {
    try {
      setLoadingData(true);
      
      // Build query params
      const params = new URLSearchParams({
        baseId: base.id,
        ...(base.lat && { lat: base.lat.toString() }),
        ...(base.lng && { lng: base.lng.toString() })
      });

      const response = await fetch(`/api/base-intelligence/external-data?${params}`);
      const data = await response.json();
      
      if (!data.error) {
        setExternalData(data);
      }
    } catch (error) {
      console.error('Failed to load external data:', error);
    } finally {
      setLoadingData(false);
    }
  };

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
          
          <Link
            href={`https://www.defensetravel.dod.mil/site/bahCalc.cfm`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            <Icon name="Calculator" className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            <Icon name={expanded ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
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
                {/* Schools Data */}
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
                        Climate
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-orange-700 dark:text-orange-400 font-medium">
                          Current Temp
                        </p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                          {externalData.weather.avgTemp}°F
                        </p>
                      </div>
                      <div>
                        <p className="text-orange-700 dark:text-orange-400 font-medium">
                          Conditions
                        </p>
                        <p className="text-sm font-bold text-orange-900 dark:text-orange-100 capitalize">
                          {externalData.weather.climate}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-orange-500 dark:text-orange-500 mt-2">
                      Source: {externalData.weather.source}
                    </p>
                  </div>
                )}

                {/* Housing Data (Placeholder) */}
                {externalData.housing && externalData.housing.marketTrend !== 'Data not available' && (
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
                      Trend: {externalData.housing.marketTrend}
                    </p>
                    <p className="text-xs text-green-500 dark:text-green-500 mt-1">
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

