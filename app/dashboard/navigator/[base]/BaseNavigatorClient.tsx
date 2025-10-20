/**
 * BASE NAVIGATOR CLIENT
 * 
 * Interactive neighborhood analysis with Family Fit Score
 * Features: Filtering, ranking, premium gating, watchlists, listing analyzer
 */

'use client';

import { useState, useEffect } from 'react';
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
  };
  initialWatchlist: any;
}

export default function BaseNavigatorClient({ base, isPremium, userProfile, initialWatchlist }: Props) {
  // Filters
  const [bedrooms, setBedrooms] = useState(3);
  const [bahMonthlyCents, setBahMonthlyCents] = useState(250000); // Default $2,500
  const [kidsGrades, setKidsGrades] = useState<KidsGrade[]>([]);
  
  // Results
  const [results, setResults] = useState<NeighborhoodCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watchlist
  const [watchedZips, setWatchedZips] = useState<string[]>(initialWatchlist?.zips || []);

  // Modals
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [analyzeUrl, setAnalyzeUrl] = useState('');

  /**
   * Compute rankings
   */
  const computeRankings = async () => {
    setLoading(true);
    setError(null);

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
    setKidsGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
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
    } catch (err) {
      console.error('Failed to save watchlist:', err);
    }
  };

  // Auto-compute on mount
  useEffect(() => {
    if (bahMonthlyCents > 0) {
      computeRankings();
    }
  }, []);

  // Determine which results to show (gating)
  const visibleResults = isPremium ? results : results.slice(0, 3);
  const hasMore = results.length > 3 && !isPremium;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm mb-4">
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</a>
            <span className="mx-2 text-gray-400">→</span>
            <a href="/dashboard/navigator" className="text-blue-600 hover:text-blue-700">Base Navigator</a>
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
              <p className="text-xs text-gray-500 mt-1">
                For {base.mha} (check your LES)
              </p>
            </div>

            {/* Kids Grades */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kids Grade Levels (affects school scoring)
              </label>
              <div className="flex gap-2">
                {(['elem', 'middle', 'high'] as KidsGrade[]).map(grade => (
                  <button
                    key={grade}
                    onClick={() => toggleGrade(grade)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      kidsGrades.includes(grade)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {grade === 'elem' ? 'Elementary' : grade === 'middle' ? 'Middle' : 'High School'}
                  </button>
                ))}
              </div>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleResults.map((result, index) => {
                const isWatched = watchedZips.includes(result.zip);
                const scoreBreakdown = getScoreBreakdown(result.family_fit_score);

                return (
                  <AnimatedCard key={result.zip} delay={index * 0.05}>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      {/* Rank + ZIP */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-400">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">
                              ZIP {result.zip}
                            </h3>
                          </div>
                        </div>

                        {isPremium && (
                          <button
                            onClick={() => saveWatchlist(result.zip)}
                            className={`p-2 rounded-lg ${
                              isWatched
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            <Icon name="Star" className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Family Fit Score */}
                      <div className={`mb-4 p-4 rounded-lg border-2 ${
                        scoreBreakdown.color === 'green' ? 'bg-green-50 border-green-300' :
                        scoreBreakdown.color === 'blue' ? 'bg-blue-50 border-blue-300' :
                        scoreBreakdown.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
                        'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Family Fit Score</span>
                          <span className={`text-3xl font-bold ${
                            scoreBreakdown.color === 'green' ? 'text-green-600' :
                            scoreBreakdown.color === 'blue' ? 'text-blue-600' :
                            scoreBreakdown.color === 'yellow' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {Math.round(result.family_fit_score)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{scoreBreakdown.message}</p>
                      </div>

                      {/* Subscores */}
                      <div className="space-y-2 mb-4">
                        {/* Schools */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700">Schools (40%)</span>
                            <span className="font-semibold">{Math.round(result.subscores.schools)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${result.subscores.schools}%` }}
                            />
                          </div>
                        </div>

                        {/* Rent vs BAH */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700">Rent vs BAH (30%)</span>
                            <span className="font-semibold">{Math.round(result.subscores.rentVsBah)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${result.subscores.rentVsBah}%` }}
                            />
                          </div>
                        </div>

                        {/* Commute */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700">Commute (20%)</span>
                            <span className="font-semibold">{Math.round(result.subscores.commute)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${result.subscores.commute}%` }}
                            />
                          </div>
                        </div>

                        {/* Weather */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700">Weather (10%)</span>
                            <span className="font-semibold">{Math.round(result.subscores.weather)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500"
                              style={{ width: `${result.subscores.weather}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        {/* Schools */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                            <Icon name="GraduationCap" className="w-4 h-4" />
                            Top Schools
                          </h4>
                          {result.payload.top_schools.length > 0 ? (
                            <div className="space-y-1">
                              {result.payload.top_schools.map((school, i) => (
                                <div key={i} className="text-sm flex items-center justify-between">
                                  <span className="text-gray-700 truncate">{school.name}</span>
                                  <span className="font-semibold text-green-600 ml-2">
                                    {school.rating}/10
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No school data</p>
                          )}
                        </div>

                        {/* Housing */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                            <Icon name="Home" className="w-4 h-4" />
                            Housing
                          </h4>
                          {result.median_rent_cents ? (
                            <div className="text-sm">
                              <p className="text-gray-700">
                                Median rent: <span className="font-semibold">${(result.median_rent_cents / 100).toLocaleString()}/mo</span>
                              </p>
                              <p className="text-gray-600 text-xs">
                                Your BAH: ${(bahMonthlyCents / 100).toLocaleString()}/mo
                                {result.median_rent_cents <= bahMonthlyCents ? (
                                  <span className="text-green-600 ml-1">✓ Under BAH</span>
                                ) : (
                                  <span className="text-yellow-600 ml-1">
                                    ({Math.round((result.median_rent_cents / bahMonthlyCents - 1) * 100)}% over)
                                  </span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No rent data</p>
                          )}
                        </div>

                        {/* Commute */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                            <Icon name="MapPin" className="w-4 h-4" />
                            Commute
                          </h4>
                          <p className="text-sm text-gray-700">{result.payload.commute_text}</p>
                        </div>

                        {/* Weather */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                            <Icon name="Cloud" className="w-4 h-4" />
                            Weather
                          </h4>
                          <p className="text-sm text-gray-700">{result.payload.weather_note}</p>
                        </div>
                      </div>

                      {/* Sample Listings */}
                      {result.payload.sample_listings.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Sample Listings</h4>
                          <div className="space-y-2">
                            {result.payload.sample_listings.slice(0, 2).map((listing, i) => (
                              <a
                                key={i}
                                href={listing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 hover:text-blue-700 truncate"
                              >
                                {listing.title} - ${(listing.price_cents / 100).toLocaleString()}/mo →
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>

            {/* Premium Gate */}
            {hasMore && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <Icon name="Lock" className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  {results.length - 3} More Neighborhoods
                </h3>
                <p className="text-blue-700 mb-4">
                  Upgrade to see full rankings, detailed school lists, commute times, and listing comparisons.
                </p>
                <a
                  href="/dashboard/upgrade?feature=base-navigator"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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

