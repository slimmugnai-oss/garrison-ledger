/**
 * BASE NAVIGATOR CLIENT
 * 
 * Interactive neighborhood analysis with Family Fit Score
 * Features: Filtering, ranking, premium gating, watchlists, listing analyzer
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import type { BaseSeed, NeighborhoodCard, NavigatorResponse, KidsGrade } from '@/app/types/navigator';

interface Props {
  base: BaseSeed;
  isPremium: boolean;
  userProfile: {
    rank?: string;
    currentBase?: string;
    hasDependents?: boolean | null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialWatchlist: any;
  initialBahCents?: number | null;
  bahSource?: 'auto' | 'manual';
}

export default function BaseNavigatorClient({ 
  base, 
  isPremium, 
  userProfile, 
  initialWatchlist,
  initialBahCents,
  bahSource = 'manual'
}: Props) {
  // Filters
  const [bedrooms, setBedrooms] = useState(3);
  const [bahMonthlyCents, setBahMonthlyCents] = useState(
    initialBahCents ?? 250000  // Use auto-filled value or default $2,500
  );
  const [kidsGrades, setKidsGrades] = useState<KidsGrade[]>([]);
  
  // Results
  const [results, setResults] = useState<NeighborhoodCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watchlist
  const [watchedZips, setWatchedZips] = useState<string[]>(initialWatchlist?.zips || []);

  // Modals
  const [_showAnalyzer, _setShowAnalyzer] = useState(false);
  const [_analyzeUrl, _setAnalyzeUrl] = useState('');

  /**
   * Compute rankings
   */
  const computeRankings = async () => {
    setLoading(true);
    setError(null);

    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Navigator] Computing rankings', {
        bedrooms,
        bahMonthlyCents,
        kidsGrades
      });
    }

    try {
      const response = await fetch('/api/navigator/base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseCode: base.code,
          bedrooms,
          bahMonthlyCents,
          kidsGrades
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to compute rankings');
      }

      const data: NavigatorResponse = await response.json();
      setResults(data.results);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle kids grade filter
   */
  const toggleGrade = (grade: KidsGrade) => {
    setKidsGrades(prev => {
      const newGrades = prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade];
      return newGrades;
    });
  };

  /**
   * Save to watchlist
   */
  const saveWatchlist = async (zip: string) => {
    if (!isPremium) {
      alert('Watchlists are a premium feature');
      return;
    }

    const newWatched = watchedZips.includes(zip)
      ? watchedZips.filter(z => z !== zip)
      : [...watchedZips, zip];

    setWatchedZips(newWatched);

    try {
      await fetch('/api/navigator/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseCode: base.code,
          zips: newWatched,
          max_rent_cents: bahMonthlyCents * 1.2,
          bedrooms,
          max_commute_minutes: 45,
          kids_grades: kidsGrades
        })
      });
    } catch {
    }
  };

  // Do NOT auto-compute on mount - wait for user to fill out filters and click button
  // useEffect(() => {
  //   if (bahMonthlyCents > 0) {
  //     computeRankings();
  //   }
  // }, []);

  // Determine which results to show (gating)
  const visibleResults = isPremium ? results : results.slice(0, 3);
  const _hasMore = results.length > 3 && !isPremium;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm mb-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</Link>
            <span className="mx-2 text-gray-400">→</span>
            <Link href="/dashboard/navigator" className="text-blue-600 hover:text-blue-700">Base Navigator</Link>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-gray-600">{base.name} Navigator</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 font-lora mb-3">
            {base.name} Navigator
          </h1>
          <p className="text-lg text-gray-600">
            Find the best neighborhoods for your family. Ranked by schools, rent vs BAH, commute, and weather.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 BR</option>
                <option value={3}>3 BR</option>
                <option value={4}>4 BR</option>
                <option value={5}>5 BR</option>
              </select>
            </div>

            {/* BAH */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Monthly BAH
              </label>
              <input
                type="number"
                value={Math.round(bahMonthlyCents / 100)}
                onChange={(e) => setBahMonthlyCents(Number(e.target.value) * 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2500"
              />
              <p className="text-xs text-gray-600 mt-1">
                {bahSource === 'auto' && userProfile.rank && base.mha ? (
                  <>
                    Auto-filled for {userProfile.rank} 
                    {userProfile.hasDependents ? ' with dependents' : ' without dependents'} 
                    at {base.name} ({base.mha}). You can adjust if needed.
                  </>
                ) : userProfile.rank && userProfile.hasDependents === null ? (
                  <>
                    For {base.mha} (check your LES). 
                    <a href="/dashboard/profile/quick-start" className="text-blue-600 hover:underline ml-1">
                      Update your profile
                    </a> to auto-fill this field.
                  </>
                ) : (
                  <>
                    For {base.mha} (check your LES or update your profile to auto-fill)
                  </>
                )}
              </p>
            </div>

            {/* Kids Grades */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kids Grade Levels (affects school scoring)
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['elem', 'middle', 'high'] as KidsGrade[]).map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      kidsGrades.includes(grade)
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {kidsGrades.includes(grade) && '✓ '}
                    {grade === 'elem' ? 'Elementary' : grade === 'middle' ? 'Middle' : 'High School'}
                  </button>
                ))}
              </div>
              {kidsGrades.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  {kidsGrades.length} grade level{kidsGrades.length > 1 ? 's' : ''} selected. Click "Find Best Neighborhoods" to update results.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={computeRankings}
            disabled={loading || bahMonthlyCents === 0}
            className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Computing Rankings...' : 'Find Best Neighborhoods'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-100 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-lora mb-2">
                {isPremium ? `All ${results.length} Neighborhoods Ranked` : 'Top 3 Neighborhoods'}
              </h2>
              <p className="text-gray-600">
                The best ZIP codes for your family, ranked by our comprehensive scoring algorithm.
              </p>
            </div>

            {/* Neighborhood Cards */}
            <div className="space-y-8">
              {visibleResults.map((result, index) => {
                const isWatched = watchedZips.includes(result.zip);
                const scoreBreakdown = getScoreBreakdown(result.family_fit_score);
                const rankColors = ['bg-gradient-to-r from-yellow-400 to-yellow-600', 'bg-gradient-to-r from-gray-300 to-gray-500', 'bg-gradient-to-r from-amber-600 to-amber-800', 'bg-gradient-to-r from-blue-500 to-blue-700'];
                const rankLabels = ['🥇 #1 Choice', '🥈 #2 Choice', '🥉 #3 Choice', `#${index + 1} Choice`];
                const rankColor = rankColors[Math.min(index, rankColors.length - 1)];
                const rankLabel = index < 3 ? rankLabels[index] : `#${index + 1} Choice`;

                return (
                  <AnimatedCard key={result.zip} delay={index * 0.1}>
                    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      
                      {/* Header Section */}
                      <div className={`${rankColor} text-white p-6`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold">
                                {rankLabel}
                              </span>
                              <h3 className="text-3xl font-bold">
                                ZIP {result.zip}
                              </h3>
                            </div>
                            <p className="text-lg opacity-90">
                              {scoreBreakdown.message}
                            </p>
                          </div>

                          {isPremium && (
                            <button
                              onClick={() => saveWatchlist(result.zip)}
                              className={`p-3 rounded-xl ${
                                isWatched
                                  ? 'bg-white bg-opacity-20 text-white'
                                  : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                              }`}
                              title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                              <Icon name="Star" className="w-6 h-6" />
                            </button>
                          )}
                        </div>

                        {/* Family Fit Score - Prominent */}
                        <div className="mt-4 bg-white bg-opacity-20 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">Family Fit Score</span>
                            <span className="text-5xl font-bold">
                              {Math.round(result.family_fit_score)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* Left Column - Scoring Breakdown */}
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-4">Score Breakdown</h4>
                            
                            {/* Enhanced Subscores */}
                            <div className="space-y-4">
                              {/* Schools */}
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="GraduationCap" className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-gray-900">Schools (30%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-green-600">
                                    {Math.round(result.subscores.schools)}
                                  </span>
                                </div>
                                <div className="h-3 bg-green-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${result.subscores.schools}%` }}
                                  />
                                </div>
                              </div>

                              {/* Rent vs BAH */}
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Home" className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-gray-900">Rent vs BAH (25%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {Math.round(result.subscores.rentVsBah)}
                                  </span>
                                </div>
                                <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${result.subscores.rentVsBah}%` }}
                                  />
                                </div>
                              </div>

                              {/* Commute */}
                              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="MapPin" className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold text-gray-900">Commute (15%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-purple-600">
                                    {Math.round(result.subscores.commute)}
                                  </span>
                                </div>
                                <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${result.subscores.commute}%` }}
                                  />
                                </div>
                              </div>

                              {/* Weather */}
                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Cloud" className="w-5 h-5 text-yellow-600" />
                                    <span className="font-semibold text-gray-900">Weather (10%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-yellow-600">
                                    {Math.round(result.subscores.weather)}
                                  </span>
                                </div>
                                <div className="h-3 bg-yellow-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${result.subscores.weather}%` }}
                                  />
                                </div>
                              </div>

                              {/* Safety */}
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Shield" className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-gray-900">Safety (10%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-red-600">
                                    {Math.round(result.subscores.safety)}
                                  </span>
                                </div>
                                <div className="h-3 bg-red-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${result.subscores.safety}%` }}
                                  />
                                </div>
                              </div>

                              {/* Amenities */}
                              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="ShoppingCart" className="w-5 h-5 text-indigo-600" />
                                    <span className="font-semibold text-gray-900">Amenities (5%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-indigo-600">
                                    {Math.round(result.subscores.amenities)}
                                  </span>
                                </div>
                                <div className="h-3 bg-indigo-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${result.subscores.amenities}%` }}
                                  />
                                </div>
                              </div>

                              {/* Military Amenities */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Shield" className="w-5 h-5 text-slate-600" />
                                    <span className="font-semibold text-gray-900">Military (2%)</span>
                                  </div>
                                  <span className="text-2xl font-bold text-slate-600">
                                    {Math.round(result.subscores.military)}
                                  </span>
                                </div>
                                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-slate-500 rounded-full"
                                    style={{ width: `${result.subscores.military}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Detailed Information */}
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-4">Neighborhood Details</h4>
                            
                            {/* Schools */}
                            <div className="mb-6">
                              <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Icon name="GraduationCap" className="w-5 h-5" />
                                Top Schools
                                {isPremium && (
                                  <Badge variant="info" className="ml-2">Premium</Badge>
                                )}
                              </h5>
                              {result.payload.top_schools.length > 0 ? (
                                <div className="space-y-2">
                                  {result.payload.top_schools.slice(0, 4).map((school, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                      <div>
                                        <span className="font-medium text-gray-900">{school.name}</span>
                                        <p className="text-sm text-gray-600">{school.grades} • {school.distance_mi?.toFixed(1)} mi</p>
                                      </div>
                                      <span className="text-lg font-bold text-green-600">
                                        {school.rating}/10
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : isPremium ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                  <p className="text-sm text-yellow-800">
                                    <strong>API Configuration Needed:</strong> School ratings require GreatSchools API key.
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-800">
                                    <a href="/dashboard/upgrade" className="underline hover:text-blue-900">
                                      Upgrade to Premium
                                    </a> to see school ratings from GreatSchools
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Housing */}
                            <div className="mb-6">
                              <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Icon name="Home" className="w-5 h-5" />
                                Housing Market
                              </h5>
                              {result.median_rent_cents ? (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700">Median Rent</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                      ${(result.median_rent_cents / 100).toLocaleString()}/mo
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Your BAH</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                      ${(bahMonthlyCents / 100).toLocaleString()}/mo
                                    </span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    {result.median_rent_cents <= bahMonthlyCents ? (
                                      <span className="text-green-600 font-semibold flex items-center gap-1">
                                        <Icon name="CheckCircle" className="w-4 h-4" />
                                        Under BAH - Great fit!
                                      </span>
                                    ) : (
                                      <span className="text-yellow-600 font-semibold">
                                        {Math.round((result.median_rent_cents / bahMonthlyCents - 1) * 100)}% over BAH
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500">No rent data available</p>
                              )}
                            </div>

                            {/* Commute & Weather */}
                            <div className="grid grid-cols-1 gap-4 mb-6">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h6 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                  <Icon name="MapPin" className="w-4 h-4" />
                                  Commute
                                </h6>
                                <p className="text-gray-700">{result.payload.commute_text}</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h6 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                  <Icon name="Cloud" className="w-4 h-4" />
                                  Weather
                                </h6>
                                <p className="text-gray-700">{result.payload.weather_note}</p>
                              </div>
                            </div>

                            {/* Safety & Crime */}
                            {result.payload.crime_data && (
                              <div className="mb-6">
                                <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Icon name="Shield" className="w-5 h-5" />
                                  Safety & Crime
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-gray-700 mb-2">{result.payload.crime_data.note}</p>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-600">Crime Rate:</span>
                                      <span className="ml-2 font-semibold">{result.payload.crime_data.crime_rate_per_1000}/1000</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Violent:</span>
                                      <span className="ml-2 font-semibold">{result.payload.crime_data.violent_crime_rate}/1000</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Amenities */}
                            {result.payload.amenities_data && (
                              <div className="mb-6">
                                <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Icon name="ShoppingCart" className="w-5 h-5" />
                                  Local Amenities
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-gray-700 mb-3">{result.payload.amenities_data.note}</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Icon name="ShoppingCart" className="w-4 h-4 text-gray-600" />
                                      <span>{result.payload.amenities_data.grocery_stores} Grocery</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Users" className="w-4 h-4 text-gray-600" />
                                      <span>{result.payload.amenities_data.restaurants} Restaurants</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Heart" className="w-4 h-4 text-gray-600" />
                                      <span>{result.payload.amenities_data.gyms} Gyms</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Shield" className="w-4 h-4 text-gray-600" />
                                      <span>{result.payload.amenities_data.hospitals} Hospitals</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Military Amenities */}
                            {result.payload.military_data && (
                              <div className="mb-6">
                                <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Icon name="Shield" className="w-5 h-5" />
                                  Military Amenities
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-gray-700 mb-3">{result.payload.military_data.note}</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {result.payload.military_data.commissary_distance_mi && (
                                      <div>
                                        <span className="text-gray-600">Commissary:</span>
                                        <span className="ml-2 font-semibold">{result.payload.military_data.commissary_distance_mi.toFixed(1)} mi</span>
                                      </div>
                                    )}
                                    {result.payload.military_data.exchange_distance_mi && (
                                      <div>
                                        <span className="text-gray-600">Exchange:</span>
                                        <span className="ml-2 font-semibold">{result.payload.military_data.exchange_distance_mi.toFixed(1)} mi</span>
                                      </div>
                                    )}
                                    {result.payload.military_data.va_facility_distance_mi && (
                                      <div>
                                        <span className="text-gray-600">VA Facility:</span>
                                        <span className="ml-2 font-semibold">{result.payload.military_data.va_facility_distance_mi.toFixed(1)} mi</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sample Listings */}
                        {result.payload.sample_listings.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <h5 className="text-lg font-semibold text-gray-900 mb-4">Available Listings</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {result.payload.sample_listings.slice(0, 4).map((listing, i) => (
                                <a
                                  key={i}
                                  href={listing.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {listing.title}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {listing.bedrooms}BR • {listing.bathrooms}BA
                                      </p>
                                    </div>
                                    <div className="ml-3 text-right">
                                      <p className="text-lg font-bold text-blue-600">
                                        ${(listing.price_cents / 100).toLocaleString()}/mo
                                      </p>
                                      <Icon name="ExternalLink" className="w-4 h-4 text-gray-400 ml-auto" />
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>

            {/* Premium Gate for Additional Results - Only show for non-premium users */}
            {results.length > 3 && !isPremium && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                <Icon name="Lock" className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                  {results.length - 3} More Neighborhoods Available
                </h3>
                <p className="text-blue-700 mb-6 text-lg">
                  Upgrade to Premium to see the complete ranking of all {results.length} neighborhoods, 
                  plus detailed school lists, commute analysis, and advanced filtering options.
                </p>
                <a
                  href="/dashboard/upgrade?feature=base-navigator"
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition-colors"
                >
                  Upgrade to Premium →
                </a>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Icon name="MapPin" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Results Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Set your filters and click "Find Best Neighborhoods" to compute rankings.
            </p>
          </div>
        )}

        {/* Attribution Footer */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center">
            School ratings © GreatSchools. Listings & median rent via Zillow. Commute & weather via Google.
            <br />
            Data cached 24h (schools/housing/commute) and 7d (weather). Scores are estimates - verify locally.
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Get score breakdown
 */
function getScoreBreakdown(score: number): {
  tier: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
  message: string;
} {
  if (score >= 80) {
    return {
      tier: 'excellent',
      color: 'green',
      message: 'Excellent fit - highly recommended'
    };
  }

  if (score >= 60) {
    return {
      tier: 'good',
      color: 'blue',
      message: 'Good fit - solid option'
    };
  }

  if (score >= 40) {
    return {
      tier: 'fair',
      color: 'yellow',
      message: 'Fair fit - consider trade-offs'
    };
  }

  return {
    tier: 'poor',
    color: 'red',
    message: 'Poor fit - explore other areas'
  };
}

