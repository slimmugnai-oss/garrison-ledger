/**
 * BASE NAVIGATOR CLIENT
 *
 * Interactive neighborhood analysis with Family Fit Score
 * Features: Filtering, ranking, premium gating, watchlists, listing analyzer
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import type {
  BaseSeed,
  NeighborhoodCard,
  NavigatorResponse,
  KidsGrade,
} from "@/app/types/navigator";

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
  bahSource?: "auto" | "manual";
}

export default function BaseNavigatorClient({
  base,
  isPremium,
  userProfile,
  initialWatchlist,
  initialBahCents,
  bahSource = "manual",
}: Props) {
  // Filters
  const [bedrooms, setBedrooms] = useState(3);
  const [bahMonthlyCents, setBahMonthlyCents] = useState(
    initialBahCents ?? 250000 // Use auto-filled value or default $2,500
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
  const [_analyzeUrl, _setAnalyzeUrl] = useState("");

  /**
   * Compute rankings
   */
  const computeRankings = async () => {
    setLoading(true);
    setError(null);

    // Computing rankings with current filter values

    try {
      const response = await fetch("/api/navigator/base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCode: base.code,
          bedrooms,
          bahMonthlyCents,
          kidsGrades,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to compute rankings");
      }

      const data: NavigatorResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle kids grade filter
   */
  const toggleGrade = (grade: KidsGrade) => {
    setKidsGrades((prev) => {
      const newGrades = prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade];
      return newGrades;
    });
  };

  /**
   * Save to watchlist
   */
  const saveWatchlist = async (zip: string) => {
    if (!isPremium) {
      alert("Watchlists are a premium feature");
      return;
    }

    const newWatched = watchedZips.includes(zip)
      ? watchedZips.filter((z) => z !== zip)
      : [...watchedZips, zip];

    setWatchedZips(newWatched);

    try {
      await fetch("/api/navigator/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCode: base.code,
          zips: newWatched,
          max_rent_cents: bahMonthlyCents * 1.2,
          bedrooms,
          max_commute_minutes: 45,
          kids_grades: kidsGrades,
        }),
      });
    } catch {
      // Non-critical: Failed to save watchlist preferences
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4 text-sm">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Dashboard
            </Link>
            <span className="mx-2 text-gray-400">→</span>
            <Link href="/dashboard/navigator" className="text-blue-600 hover:text-blue-700">
              Base Navigator
            </Link>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-gray-600">{base.name} Navigator</span>
          </nav>

          <h1 className="font-lora mb-3 text-4xl font-bold text-gray-900">{base.name} Navigator</h1>
          <p className="text-lg text-gray-600">
            Find the best neighborhoods for your family. Ranked by schools, rent vs BAH, commute,
            and weather.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Bedrooms */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 BR</option>
                <option value={3}>3 BR</option>
                <option value={4}>4 BR</option>
                <option value={5}>5 BR</option>
              </select>
            </div>

            {/* BAH */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Your Monthly BAH
              </label>
              <input
                type="number"
                value={Math.round(bahMonthlyCents / 100)}
                onChange={(e) => setBahMonthlyCents(Number(e.target.value) * 100)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="2500"
              />
              <p className="mt-1 text-xs text-gray-600">
                {bahSource === "auto" && userProfile.rank && base.mha ? (
                  <>
                    Auto-filled for {userProfile.rank}
                    {userProfile.hasDependents ? " with dependents" : " without dependents"}
                    at {base.name} ({base.mha}). You can adjust if needed.
                  </>
                ) : userProfile.rank && userProfile.hasDependents === null ? (
                  <>
                    For {base.mha} (check your LES).
                    <a
                      href="/dashboard/profile/quick-start"
                      className="ml-1 text-blue-600 hover:underline"
                    >
                      Update your profile
                    </a>{" "}
                    to auto-fill this field.
                  </>
                ) : (
                  <>For {base.mha} (check your LES or update your profile to auto-fill)</>
                )}
              </p>
            </div>

            {/* Kids Grades */}
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kids Grade Levels (affects school scoring)
              </label>
              <div className="flex flex-wrap gap-2">
                {(["elem", "middle", "high"] as KidsGrade[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                      kidsGrades.includes(grade)
                        ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {kidsGrades.includes(grade) && "✓ "}
                    {grade === "elem"
                      ? "Elementary"
                      : grade === "middle"
                        ? "Middle"
                        : "High School"}
                  </button>
                ))}
              </div>
              {kidsGrades.length > 0 && (
                <p className="mt-2 text-xs text-blue-600">
                  {kidsGrades.length} grade level{kidsGrades.length > 1 ? "s" : ""} selected. Click
                  "Find Best Neighborhoods" to update results.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={computeRankings}
            disabled={loading || bahMonthlyCents === 0}
            className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {loading ? "Computing Rankings..." : "Find Best Neighborhoods"}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-4 h-6 rounded bg-gray-200"></div>
                <div className="mb-4 h-20 rounded bg-gray-100"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-lora mb-2 text-2xl font-bold text-gray-900">
                {isPremium ? `All ${results.length} Neighborhoods Ranked` : "Top 3 Neighborhoods"}
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
                const rankColors = [
                  "bg-gradient-to-r from-yellow-400 to-yellow-600",
                  "bg-gradient-to-r from-gray-300 to-gray-500",
                  "bg-gradient-to-r from-amber-600 to-amber-800",
                  "bg-gradient-to-r from-blue-500 to-blue-700",
                ];
                const rankLabels = [
                  "🥇 #1 Choice",
                  "🥈 #2 Choice",
                  "🥉 #3 Choice",
                  `#${index + 1} Choice`,
                ];
                const rankColor = rankColors[Math.min(index, rankColors.length - 1)];
                const rankLabel = index < 3 ? rankLabels[index] : `#${index + 1} Choice`;

                return (
                  <AnimatedCard key={result.zip} delay={index * 0.1}>
                    <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white transition-all duration-300 hover:shadow-xl">
                      {/* Header Section */}
                      <div className={`${rankColor} p-6 text-white`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="mb-2 flex items-center gap-3">
                              <span className="text-2xl font-bold">{rankLabel}</span>
                              <h3 className="text-3xl font-bold">ZIP {result.zip}</h3>
                            </div>
                            <p className="text-lg opacity-90">{scoreBreakdown.message}</p>
                          </div>

                          {isPremium && (
                            <button
                              onClick={() => saveWatchlist(result.zip)}
                              className={`rounded-xl p-3 ${
                                isWatched
                                  ? "bg-white bg-opacity-20 text-white"
                                  : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
                              }`}
                              title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                            >
                              <Icon name="Star" className="h-6 w-6" />
                            </button>
                          )}
                        </div>

                        {/* Family Fit Score - Prominent */}
                        <div className="mt-4 rounded-xl bg-white bg-opacity-20 p-4">
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
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                          {/* Left Column - Scoring Breakdown */}
                          <div>
                            <h4 className="mb-4 text-xl font-bold text-gray-900">
                              Score Breakdown
                            </h4>

                            {/* Enhanced Subscores */}
                            <div className="space-y-4">
                              {/* Schools */}
                              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="GraduationCap" className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-gray-900">
                                      Schools (30%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-green-600">
                                    {Math.round(result.subscores.schools)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-green-200">
                                  <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: `${result.subscores.schools}%` }}
                                  />
                                </div>
                              </div>

                              {/* Rent vs BAH */}
                              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Home" className="h-5 w-5 text-blue-600" />
                                    <span className="font-semibold text-gray-900">
                                      Rent vs BAH (25%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {Math.round(result.subscores.rentVsBah)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-blue-200">
                                  <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{ width: `${result.subscores.rentVsBah}%` }}
                                  />
                                </div>
                              </div>

                              {/* Commute */}
                              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
                                    <span className="font-semibold text-gray-900">
                                      Commute (15%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-purple-600">
                                    {Math.round(result.subscores.commute)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-purple-200">
                                  <div
                                    className="h-full rounded-full bg-purple-500"
                                    style={{ width: `${result.subscores.commute}%` }}
                                  />
                                </div>
                              </div>

                              {/* Weather */}
                              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Cloud" className="h-5 w-5 text-yellow-600" />
                                    <span className="font-semibold text-gray-900">
                                      Weather (10%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-yellow-600">
                                    {Math.round(result.subscores.weather)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-yellow-200">
                                  <div
                                    className="h-full rounded-full bg-yellow-500"
                                    style={{ width: `${result.subscores.weather}%` }}
                                  />
                                </div>
                              </div>

                              {/* Safety */}
                              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Shield" className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-gray-900">
                                      Safety (10%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-red-600">
                                    {Math.round(result.subscores.safety)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-red-200">
                                  <div
                                    className="h-full rounded-full bg-red-500"
                                    style={{ width: `${result.subscores.safety}%` }}
                                  />
                                </div>
                              </div>

                              {/* Amenities */}
                              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="ShoppingCart" className="h-5 w-5 text-indigo-600" />
                                    <span className="font-semibold text-gray-900">
                                      Amenities (5%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-indigo-600">
                                    {Math.round(result.subscores.amenities)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-indigo-200">
                                  <div
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{ width: `${result.subscores.amenities}%` }}
                                  />
                                </div>
                              </div>

                              {/* Military Amenities */}
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Shield" className="h-5 w-5 text-slate-600" />
                                    <span className="font-semibold text-gray-900">
                                      Military (2%)
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-slate-600">
                                    {Math.round(result.subscores.military)}
                                  </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-slate-500"
                                    style={{ width: `${result.subscores.military}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Detailed Information */}
                          <div>
                            <h4 className="mb-4 text-xl font-bold text-gray-900">
                              Neighborhood Details
                            </h4>

                            {/* Schools */}
                            <div className="mb-6">
                              <h5 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Icon name="GraduationCap" className="h-5 w-5" />
                                Top Schools
                                {isPremium && (
                                  <Badge variant="info" className="ml-2">
                                    Premium
                                  </Badge>
                                )}
                              </h5>
                              {result.payload.top_schools.length > 0 ? (
                                <div className="space-y-2">
                                  {result.payload.top_schools.slice(0, 4).map((school, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                    >
                                      <div>
                                        <span className="font-medium text-gray-900">
                                          {school.name}
                                        </span>
                                        <p className="text-sm text-gray-600">
                                          {school.grades} • {school.distance_mi?.toFixed(1)} mi
                                        </p>
                                      </div>
                                      <span className="text-lg font-bold text-green-600">
                                        {school.rating}/10
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : isPremium ? (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                  <p className="text-sm text-yellow-800">
                                    <strong>API Configuration Needed:</strong> School ratings
                                    require GreatSchools API key.
                                  </p>
                                </div>
                              ) : (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                  <p className="text-sm text-blue-800">
                                    <a
                                      href="/dashboard/upgrade"
                                      className="underline hover:text-blue-900"
                                    >
                                      Upgrade to Premium
                                    </a>{" "}
                                    to see school ratings from GreatSchools
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Housing */}
                            <div className="mb-6">
                              <h5 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Icon name="Home" className="h-5 w-5" />
                                Housing Market
                              </h5>
                              {result.median_rent_cents ? (
                                <div className="rounded-lg bg-gray-50 p-4">
                                  <div className="mb-2 flex items-center justify-between">
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
                                  <div className="mt-2 border-t border-gray-200 pt-2">
                                    {result.median_rent_cents <= bahMonthlyCents ? (
                                      <span className="flex items-center gap-1 font-semibold text-green-600">
                                        <Icon name="CheckCircle" className="h-4 w-4" />
                                        Under BAH - Great fit!
                                      </span>
                                    ) : (
                                      <span className="font-semibold text-yellow-600">
                                        {Math.round(
                                          (result.median_rent_cents / bahMonthlyCents - 1) * 100
                                        )}
                                        % over BAH
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500">No rent data available</p>
                              )}
                            </div>

                            {/* Commute & Weather */}
                            <div className="mb-6 grid grid-cols-1 gap-4">
                              <div className="rounded-lg bg-gray-50 p-4">
                                <h6 className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
                                  <Icon name="MapPin" className="h-4 w-4" />
                                  Commute
                                </h6>
                                <p className="text-gray-700">{result.payload.commute_text}</p>
                              </div>

                              <div className="rounded-lg bg-gray-50 p-4">
                                <h6 className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
                                  <Icon name="Cloud" className="h-4 w-4" />
                                  Weather
                                </h6>
                                <p className="text-gray-700">{result.payload.weather_note}</p>
                              </div>
                            </div>

                            {/* Safety & Crime */}
                            {result.payload.crime_data && (
                              <div className="mb-6">
                                <h5 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                  <Icon name="Shield" className="h-5 w-5" />
                                  Safety & Crime
                                </h5>
                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="mb-2 text-gray-700">
                                    {result.payload.crime_data.note}
                                  </p>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-600">Crime Rate:</span>
                                      <span className="ml-2 font-semibold">
                                        {result.payload.crime_data.crime_rate_per_1000}/1000
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Violent:</span>
                                      <span className="ml-2 font-semibold">
                                        {result.payload.crime_data.violent_crime_rate}/1000
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Amenities */}
                            {result.payload.amenities_data && (
                              <div className="mb-6">
                                <h5 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                  <Icon name="ShoppingCart" className="h-5 w-5" />
                                  Local Amenities
                                </h5>
                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="mb-3 text-gray-700">
                                    {result.payload.amenities_data.note}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Icon name="ShoppingCart" className="h-4 w-4 text-gray-600" />
                                      <span>
                                        {result.payload.amenities_data.grocery_stores} Grocery
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Users" className="h-4 w-4 text-gray-600" />
                                      <span>
                                        {result.payload.amenities_data.restaurants} Restaurants
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Heart" className="h-4 w-4 text-gray-600" />
                                      <span>{result.payload.amenities_data.gyms} Gyms</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Shield" className="h-4 w-4 text-gray-600" />
                                      <span>
                                        {result.payload.amenities_data.hospitals} Hospitals
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Military Amenities */}
                            {result.payload.military_data && (
                              <div className="mb-6">
                                <h5 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                  <Icon name="Shield" className="h-5 w-5" />
                                  Military Amenities
                                </h5>
                                <div className="rounded-lg bg-gray-50 p-4">
                                  <p className="mb-3 text-gray-700">
                                    {result.payload.military_data.note}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {result.payload.military_data.commissary_distance_mi && (
                                      <div>
                                        <span className="text-gray-600">Commissary:</span>
                                        <span className="ml-2 font-semibold">
                                          {result.payload.military_data.commissary_distance_mi.toFixed(
                                            1
                                          )}{" "}
                                          mi
                                        </span>
                                      </div>
                                    )}
                                    {result.payload.military_data.exchange_distance_mi && (
                                      <div>
                                        <span className="text-gray-600">Exchange:</span>
                                        <span className="ml-2 font-semibold">
                                          {result.payload.military_data.exchange_distance_mi.toFixed(
                                            1
                                          )}{" "}
                                          mi
                                        </span>
                                      </div>
                                    )}
                                    {result.payload.military_data.va_facility_distance_mi && (
                                      <div>
                                        <span className="text-gray-600">VA Facility:</span>
                                        <span className="ml-2 font-semibold">
                                          {result.payload.military_data.va_facility_distance_mi.toFixed(
                                            1
                                          )}{" "}
                                          mi
                                        </span>
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
                          <div className="mt-8 border-t border-gray-200 pt-6">
                            <h5 className="mb-4 text-lg font-semibold text-gray-900">
                              Available Listings
                            </h5>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {result.payload.sample_listings.slice(0, 4).map((listing, i) => (
                                <a
                                  key={i}
                                  href={listing.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-gray-900">
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
                                      <Icon
                                        name="ExternalLink"
                                        className="ml-auto h-4 w-4 text-gray-400"
                                      />
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
              <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center">
                <Icon name="Lock" className="mx-auto mb-4 h-16 w-16 text-blue-600" />
                <h3 className="mb-2 text-2xl font-bold text-blue-900">
                  {results.length - 3} More Neighborhoods Available
                </h3>
                <p className="mb-6 text-lg text-blue-700">
                  Upgrade to Premium to see the complete ranking of all {results.length}{" "}
                  neighborhoods, plus detailed school lists, commute analysis, and advanced
                  filtering options.
                </p>
                <a
                  href="/dashboard/upgrade?feature=base-navigator"
                  className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Upgrade to Premium →
                </a>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Icon name="MapPin" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Results Yet</h3>
            <p className="mb-4 text-gray-600">
              Set your filters and click "Find Best Neighborhoods" to compute rankings.
            </p>
          </div>
        )}

        {/* Attribution Footer */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-center text-xs text-gray-600">
            School ratings © GreatSchools. Listings & median rent via Zillow. Commute & weather via
            Google.
            <br />
            Data cached 24h (schools/housing/commute) and 7d (weather). Scores are estimates -
            verify locally.
          </p>
        </div>

        {/* Ask Expert CTA */}
        <div className="mt-8 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Icon name="MessageCircle" className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Need help deciding?</h3>
              <p className="mb-4 text-sm text-gray-700">
                Ask: "Should I live on-base or off-base at {base.name}?" or "What's the best
                neighborhood for families with kids?"
              </p>
              <Link
                href="/dashboard/ask"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Icon name="MessageCircle" className="h-4 w-4" />
                Ask Expert
              </Link>
            </div>
          </div>
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
  color: "green" | "blue" | "yellow" | "red";
  message: string;
} {
  if (score >= 80) {
    return {
      tier: "excellent",
      color: "green",
      message: "Excellent fit - highly recommended",
    };
  }

  if (score >= 60) {
    return {
      tier: "good",
      color: "blue",
      message: "Good fit - solid option",
    };
  }

  if (score >= 40) {
    return {
      tier: "fair",
      color: "yellow",
      message: "Fair fit - consider trade-offs",
    };
  }

  return {
    tier: "poor",
    color: "red",
    message: "Poor fit - explore other areas",
  };
}
