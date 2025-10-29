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
  const [sortPriority, setSortPriority] = useState<'overall' | 'schools' | 'housing' | 'commute'>('overall');

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
  const visibleResults = results; // Always show all results (max 5 from API)
  // No pagination needed - API returns max 5 results

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
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

          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-lora mb-2 text-4xl font-bold">{base.name} Navigator</h1>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-lg">
                  <span className="flex items-center gap-2">
                    <Icon name="MapPin" className="h-5 w-5" />
                    {base.state}
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon name="Shield" className="h-5 w-5" />
                    {base.branch}
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon name="Hash" className="h-5 w-5" />
                    {base.mha}
                  </span>
                </div>
                <p className="text-xl text-blue-100">
                  Find your perfect neighborhood near {base.name}
                </p>
                <p className="mt-2 text-blue-200">
                  Data-driven analysis of schools, housing, commute, and quality of life
                </p>
              </div>
              <div className="hidden md:block">
                <div className="rounded-lg bg-white bg-opacity-20 px-4 py-2">
                  <div className="text-sm text-blue-100">Premium Feature</div>
                  <div className="text-lg font-semibold">Base Navigator</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streamlined Filters */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Search Criteria</h2>

          <div className="space-y-6">
            {/* Row 1: Bedrooms and BAH */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <label
                  htmlFor="your_monthly_bah_"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Monthly BAH
                </label>
                <input
                  id="input_pozstmjkt"
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
            </div>

            {/* Row 2: Kids Grades and Sort Priority */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Kids Grades */}
              <div>
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
                    {kidsGrades.length} grade level{kidsGrades.length > 1 ? "s" : ""} selected.
                  </p>
                )}
              </div>

              {/* Sort Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort Priority
                </label>
                <select
                  value={sortPriority}
                  onChange={(e) => setSortPriority(e.target.value as typeof sortPriority)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overall">Best Overall Fit</option>
                  <option value="schools">Best Schools First</option>
                  <option value="housing">Lowest Housing Cost</option>
                  <option value="commute">Shortest Commute</option>
                </select>
                <p className="mt-1 text-xs text-gray-600">
                  How should we prioritize the results?
                </p>
              </div>
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

        {/* Enhanced Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Neighborhoods</h3>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <div className="space-y-2">
                  <p className="text-sm text-red-600 font-medium">Try these solutions:</p>
                  <ul className="text-sm text-red-600 space-y-1 ml-4">
                    <li>• Check your internet connection</li>
                    <li>• Verify your BAH amount is correct</li>
                    <li>• Try adjusting your search criteria</li>
                    <li>• Refresh the page and try again</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    onClick={computeRankings}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Try Again
                  </button>
                  <a
                    href="/dashboard/support"
                    className="ml-3 text-sm text-red-600 underline hover:no-underline"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State - Enhanced Skeleton */}
        {loading && (
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                {/* Header Skeleton */}
                <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                
                {/* Content Skeleton */}
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="h-6 w-32 rounded bg-gray-200"></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="flex items-center justify-between">
                            <div className="h-4 w-24 rounded bg-gray-200"></div>
                            <div className="h-4 w-16 rounded bg-gray-200"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="h-6 w-32 rounded bg-gray-200"></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-4 w-full rounded bg-gray-200"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
                Top {results.length} Neighborhoods Ranked
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
                // Enhanced medal system for top 3, professional for others
                const getRankStyle = (index: number) => {
                  if (index === 0) {
                    return {
                      gradient: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
                      shadow: "shadow-lg shadow-yellow-200",
                      border: "border-yellow-300",
                      label: "🥇 #1 Choice",
                      badge: "bg-yellow-100 text-yellow-800"
                    };
                  } else if (index === 1) {
                    return {
                      gradient: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
                      shadow: "shadow-lg shadow-gray-200",
                      border: "border-gray-300",
                      label: "🥈 #2 Choice",
                      badge: "bg-gray-100 text-gray-800"
                    };
                  } else if (index === 2) {
                    return {
                      gradient: "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700",
                      shadow: "shadow-lg shadow-amber-200",
                      border: "border-amber-300",
                      label: "🥉 #3 Choice",
                      badge: "bg-amber-100 text-amber-800"
                    };
                  } else {
                    return {
                      gradient: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
                      shadow: "shadow-lg shadow-blue-200",
                      border: "border-blue-300",
                      label: `#${index + 1} Choice`,
                      badge: "bg-blue-100 text-blue-800"
                    };
                  }
                };

                const rankStyle = getRankStyle(index);

                return (
                  <AnimatedCard key={result.zip} delay={index * 0.1}>
                    <div className={`overflow-hidden rounded-2xl border-2 ${rankStyle.border} bg-white transition-all duration-300 hover:shadow-xl ${rankStyle.shadow}`}>
                      {/* Header Section */}
                      <div className={`${rankStyle.gradient} p-6 text-white`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="mb-2 flex items-center gap-3">
                              <span className="text-2xl font-bold">{rankStyle.label}</span>
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
                            <div>
                              <span className="text-lg font-semibold">Family Fit Score</span>
                              <div className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${rankStyle.badge}`}>
                                {result.family_fit_score >= 80 ? 'Excellent' : result.family_fit_score >= 60 ? 'Good' : 'Fair'}
                              </div>
                            </div>
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
                                      Schools (35%)
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

                              {/* Amenities */}
                              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon name="ShoppingCart" className="h-5 w-5 text-indigo-600" />
                                    <span className="font-semibold text-gray-900">
                                      Amenities (8%)
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
                                    require SchoolDigger API key.
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
                                    to see school ratings from SchoolDigger
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

          </>
        )}

        {/* Enhanced Empty State */}
        {!loading && results.length === 0 && (
          <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 text-center">
            <Icon name="MapPin" className="mx-auto mb-6 h-20 w-20 text-gray-300" />
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Ready to Find Your Perfect Neighborhood?</h3>
            <p className="mb-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Set your search criteria above and click "Find Best Neighborhoods" to discover the top 5 areas near {base.name} that match your family's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={computeRankings}
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700"
              >
                Find Best Neighborhoods
              </button>
              <a
                href="/dashboard/navigator"
                className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Browse Other Bases
              </a>
            </div>
          </div>
        )}

        {/* Enhanced Attribution Footer */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="text-center">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Data Sources & Attribution</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs text-gray-600">
              <div className="space-y-1">
                <div className="font-medium text-gray-800">Schools</div>
                <div>© SchoolDigger</div>
                <div>Updated daily</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-800">Housing & Commute</div>
                <div>Zillow via RapidAPI • Google Maps</div>
                <div>Cached 30 days</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-800">Weather & Amenities</div>
                <div>Google Weather • Google Places</div>
                <div>Cached 7 days</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} • 
                <button 
                  onClick={computeRankings}
                  className="ml-1 text-blue-600 hover:underline"
                >
                  Refresh data
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Scores are estimates based on available data - verify locally before making decisions.
              </p>
            </div>
          </div>
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
