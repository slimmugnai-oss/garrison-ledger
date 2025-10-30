/**
 * BASE NAVIGATOR CLIENT
 *
 * Interactive neighborhood analysis with Family Fit Score
 * Features: Filtering, ranking, premium gating, watchlists, listing analyzer
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import NeighborhoodIntelligenceReport from "@/app/components/navigator/NeighborhoodIntelligenceReport";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Icon from "@/app/components/ui/Icon";
import type {
  BaseSeed,
  NeighborhoodCard,
  NavigatorResponse,
} from "@/app/types/navigator";
import { getScoreBreakdown } from "@/lib/navigator/score";

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
  // Single filter: BAH
  const [bahMonthlyCents, setBahMonthlyCents] = useState(250000);

  // Results
  const [results, setResults] = useState<NeighborhoodCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watchlist
  const [watchedZips, setWatchedZips] = useState<string[]>([]);

  // Modals
  const [_showAnalyzer, _setShowAnalyzer] = useState(false);
  const [_analyzeUrl, _setAnalyzeUrl] = useState("");

  // Tab state for each neighborhood card
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  // Initialize BAH from props after hydration to avoid mismatch
  useEffect(() => {
    if (initialBahCents && initialBahCents > 0) {
      setBahMonthlyCents(initialBahCents);
    }
  }, [initialBahCents]);

  // Initialize watchlist from props after hydration to avoid mismatch
  useEffect(() => {
    if (initialWatchlist?.zips) {
      setWatchedZips(initialWatchlist.zips);
    }
  }, [initialWatchlist?.zips]);

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
          bedrooms: 3, // Default to 3BR for comprehensive analysis
          bahMonthlyCents,
          kidsGrades: [], // Empty array = comprehensive analysis of all grades
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
   * Switch tab for a specific neighborhood
   */
  const switchTab = (zip: string, tab: string) => {
    setActiveTabs((prev) => ({ ...prev, [zip]: tab }));
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
          bedrooms: 3,
          max_commute_minutes: 45,
          kids_grades: [],
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

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}></div>
            </div>
            
            <div className="relative p-8 md:p-10">
              {/* Mission Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                  <Icon name="Shield" className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Base Navigator</div>
                  <div className="text-xs text-slate-500">Premium Military Housing Intelligence</div>
                </div>
              </div>

              {/* Base Info Badges */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  <Icon name="MapPin" className="h-4 w-4 text-blue-400" />
                  <span>{base.state}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  <Icon name="Shield" className="h-4 w-4 text-green-400" />
                  <span>{base.branch}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  <Icon name="Key" className="h-4 w-4 text-amber-400" />
                  <span>MHA {base.mha}</span>
                </div>
              </div>

              {/* Main Title */}
              <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
                {base.name} Navigator
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
                AI-powered neighborhood intelligence analyzing schools, commute, weather, housing, and local amenities to find your perfect home near {base.name}.
              </p>

              {/* Stats Bar */}
              <div className="mt-8 grid gap-4 border-t border-slate-700 pt-6 md:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                    <Icon name="Home" className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Analyzing</div>
                    <div className="font-bold text-white">Top 3 ZIPs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/20">
                    <Icon name="BarChart" className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Data Points</div>
                    <div className="font-bold text-white">300+ Per ZIP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                    <Icon name="Zap" className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Analysis Time</div>
                    <div className="font-bold text-white">~30 seconds</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/20">
                    <Icon name="Shield" className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Military-Focused</div>
                    <div className="font-bold text-white">100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Control - Enhanced Search Interface */}
        <div className="mb-10 overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          {/* Header */}
          <div className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Icon name="Target" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mission Parameters</h2>
                <div className="text-sm text-slate-300">Set your search criteria to begin analysis</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {/* BAH Input - Enhanced */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                  <label htmlFor="monthly_bah_input" className="text-lg font-bold text-slate-900">
                    Your Monthly BAH
                  </label>
                </div>
                
                <div className="max-w-md">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                      <span className="text-2xl font-bold text-slate-400">$</span>
                    </div>
                    <input
                      id="monthly_bah_input"
                      type="number"
                      value={Math.round(bahMonthlyCents / 100)}
                      onChange={(e) => setBahMonthlyCents(Number(e.target.value) * 100)}
                      className="min-h-[64px] w-full rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-2xl font-bold text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="2500"
                    />
                  </div>
                  
                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                    <Icon name="Info" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    <p>
                      {bahSource === "auto" && userProfile.rank && base.mha ? (
                        <>
                          <span className="font-semibold text-green-600">✓ Auto-filled</span> for {userProfile.rank}
                          {userProfile.hasDependents ? " with dependents" : " without dependents"} at {base.mha}. You can adjust if needed.
                        </>
                      ) : userProfile.rank && userProfile.hasDependents === null ? (
                        <>
                          For {base.mha} (check your LES).{" "}
                          <a href="/dashboard/profile/quick-start" className="font-semibold text-blue-600 hover:underline">
                            Update profile
                          </a>{" "}
                          to auto-fill.
                        </>
                      ) : (
                        <>For {base.mha} (check your LES or <a href="/dashboard/profile/quick-start" className="font-semibold text-blue-600 hover:underline">update profile</a> to auto-fill)</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Intelligence Scope */}
              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Icon name="Search" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">Comprehensive Intelligence Scope</div>
                    <div className="text-sm text-blue-700">What we analyze for you</div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                    <Icon name="Home" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-900">All Property Types</div>
                      <div className="text-sm text-slate-600">2-5 bedrooms, all housing styles</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                    <Icon name="GraduationCap" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <div className="font-semibold text-slate-900">All School Grades</div>
                      <div className="text-sm text-slate-600">K-12, comprehensive coverage</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                    <Icon name="MapPin" className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <div>
                      <div className="font-semibold text-slate-900">30+ Amenity Types</div>
                      <div className="text-sm text-slate-600">From groceries to healthcare</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                    <Icon name="Truck" className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Real-Time Commute</div>
                      <div className="text-sm text-slate-600">Traffic patterns & duty impact</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="border-t-2 border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6 md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Zap" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <div className="font-bold text-white">Ready to find your perfect neighborhood?</div>
                    <div className="text-sm text-slate-300">Get comprehensive intelligence in ~30 seconds</div>
                  </div>
                </div>
                <button
                  onClick={computeRankings}
                  disabled={loading || bahMonthlyCents === 0}
                  className="group relative min-h-[56px] overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Icon name="Loader" className="h-5 w-5 animate-spin" />
                        <span>Analyzing Neighborhoods...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Search" className="h-5 w-5" />
                        <span>Find Best Neighborhoods</span>
                      </>
                    )}
                  </div>
                  {!loading && (
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-20" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-red-900">
                  Unable to Load Neighborhoods
                </h3>
                <p className="mb-4 text-sm text-red-700">{error}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Try these solutions:</p>
                  <ul className="ml-4 space-y-1 text-sm text-red-600">
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
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border-2 border-gray-200 bg-white"
              >
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
                      badge: "bg-yellow-100 text-yellow-800",
                    };
                  } else if (index === 1) {
                    return {
                      gradient: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
                      shadow: "shadow-lg shadow-gray-200",
                      border: "border-gray-300",
                      label: "🥈 #2 Choice",
                      badge: "bg-gray-100 text-gray-800",
                    };
                  } else if (index === 2) {
                    return {
                      gradient: "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700",
                      shadow: "shadow-lg shadow-amber-200",
                      border: "border-amber-300",
                      label: "🥉 #3 Choice",
                      badge: "bg-amber-100 text-amber-800",
                    };
                  } else {
                    return {
                      gradient: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
                      shadow: "shadow-lg shadow-blue-200",
                      border: "border-blue-300",
                      label: `#${index + 1} Choice`,
                      badge: "bg-blue-100 text-blue-800",
                    };
                  }
                };

                const rankStyle = getRankStyle(index);

                return (
                  <AnimatedCard key={result.zip} delay={index * 0.1}>
                    <div
                      className={`overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition-all duration-300 hover:shadow-lg`}
                    >
                      {/* Header Section - Only for results 4-5 */}
                      {index >= 3 && (
                        <div className={`${rankStyle.gradient} p-4 text-white sm:p-6`}>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                              <span className="text-xl font-bold sm:text-2xl">
                                {rankStyle.label}
                              </span>
                              <h3 className="text-2xl font-bold sm:text-3xl">ZIP {result.zip}</h3>
                            </div>
                            <p className="text-base opacity-90 sm:text-lg">
                              {scoreBreakdown.message}
                            </p>
                          </div>

                          {isPremium && (
                            <button
                              onClick={() => saveWatchlist(result.zip)}
                              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-3 ${
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

                        {/* Family Fit Score - Mobile Optimized */}
                        <div className="mt-4 rounded-xl bg-white bg-opacity-20 p-4">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                              <span className="text-base font-semibold sm:text-lg">
                                Family Fit Score
                              </span>
                              <div
                                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${rankStyle.badge}`}
                              >
                                {result.family_fit_score >= 80
                                  ? "Excellent"
                                  : result.family_fit_score >= 60
                                    ? "Good"
                                    : "Fair"}
                              </div>
                            </div>
                            <span className="text-4xl font-bold sm:text-5xl">
                              {Math.round(result.family_fit_score)}
                            </span>
                          </div>
                        </div>
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="p-4 sm:p-6">
                        {/* Tab Navigation */}
                        <div className="mb-6">
                          <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-0">
                            {[
                              // Single Intelligence Report tab for top 3
                              ...(index < 3 && result.payload.intelligence
                                ? [
                                    {
                                      id: "intelligence",
                                      label: "Intelligence Report",
                                      shortLabel: "Intel",
                                      icon: "File" as const,
                                    },
                                  ]
                                : [
                                    {
                                      id: "overview",
                                      label: "Overview",
                                      shortLabel: "Overview",
                                      icon: "BarChart" as const,
                                    },
                                  ]),
                            ].map((tab) => {
                              const defaultTab = index < 3 && result.payload.intelligence ? "intelligence" : "overview";
                              const isActive = (activeTabs[result.zip] || defaultTab) === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => switchTab(result.zip, tab.id)}
                                  className={`flex min-h-[44px] flex-shrink-0 items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-medium transition-colors ${
                                    isActive
                                      ? "border-b-2 border-blue-600 bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  <Icon name={tab.icon} className="h-4 w-4 flex-shrink-0" />
                                  <span className="hidden sm:inline">{tab.label}</span>
                                  <span className="sm:hidden">{tab.shortLabel}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                          {/* Intelligence Report (Top 3 only) */}
                          {index < 3 && result.payload.intelligence && (activeTabs[result.zip] || "intelligence") === "intelligence" && (
                            <NeighborhoodIntelligenceReport
                              neighborhood={result}
                              rank={index + 1}
                              baseName={base.name}
                            />
                          )}


                          {(activeTabs[result.zip] || "overview") === "schools" && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  School Information
                                </h4>
                                <div className="text-sm text-gray-600">
                                  Rating: {Math.round(result.subscores.schools)}/100
                                </div>
                              </div>

                              {/* School Data Provenance */}
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>
                                    <strong>Data Source:</strong> SchoolDigger • Updated daily •
                                    <a
                                      href="https://www.schooldigger.com"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1 underline hover:text-blue-900"
                                    >
                                      View on SchoolDigger
                                    </a>
                                  </span>
                                </div>
                              </div>

                              {result.payload.top_schools &&
                              result.payload.top_schools.length > 0 ? (
                                <div className="space-y-4">
                                  {result.payload.top_schools.map((school, i) => {
                                    // Convert 0-10 rating to 1-5 stars for display
                                    const starRating = Math.round((school.rating / 10) * 5);
                                    const stars =
                                      "★".repeat(starRating) + "☆".repeat(5 - starRating);

                                    return (
                                      <div
                                        key={i}
                                        className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                              <h5 className="font-semibold text-gray-900">
                                                {school.name}
                                              </h5>
                                              <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                  school.type === "private"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-blue-100 text-blue-800"
                                                }`}
                                              >
                                                {school.type === "private" ? "Private" : "Public"}
                                              </span>
                                            </div>
                                            <p className="mb-2 text-sm text-gray-600">
                                              {school.grades} •{" "}
                                              {school.distance_mi?.toFixed(1) || "0.0"} mi away
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg text-yellow-500">
                                                {stars}
                                              </span>
                                              <span className="text-sm text-gray-600">
                                                ({starRating}/5 stars)
                                              </span>
                                            </div>
                                          </div>
                                          <div className="ml-4 text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                              {school.rating.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-gray-500">out of 10</div>
                                            <a
                                              href={`https://www.schooldigger.com/go/${school.name.replace(/\s+/g, "-").toLowerCase()}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                              <Icon name="ExternalLink" className="h-3 w-3" />
                                              View Details
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                  <p className="text-sm text-yellow-800">
                                    <strong>School data unavailable</strong> - This may be due to
                                    API configuration or data limitations.
                                  </p>
                                </div>
                              )}

                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>Data source: SchoolDigger • Updated daily</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {(activeTabs[result.zip] || "overview") === "housing" && (
                            <div className="space-y-6">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Housing Market
                              </h4>

                              {/* Housing Data Provenance */}
                              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                <div className="flex items-center gap-2 text-sm text-green-800">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>
                                    <strong>Data Source:</strong> Zillow via RapidAPI • Cached 30
                                    days •
                                    <a
                                      href="https://www.zillow.com"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1 underline hover:text-green-900"
                                    >
                                      View on Zillow
                                    </a>
                                  </span>
                                </div>
                              </div>

                              {/* Rent vs BAH Comparison */}
                              <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-900">Rent vs Your BAH</h5>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {Math.round(result.subscores.rentVsBah)}/100
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Median Rent</span>
                                    <span className="text-xl font-bold text-gray-900">
                                      $
                                      {result.median_rent_cents
                                        ? (result.median_rent_cents / 100).toLocaleString()
                                        : "N/A"}
                                      /mo
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Your BAH</span>
                                    <span className="text-xl font-bold text-blue-600">
                                      ${(bahMonthlyCents / 100).toLocaleString()}/mo
                                    </span>
                                  </div>
                                  <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">Monthly Difference</span>
                                      <span
                                        className={`text-lg font-semibold ${
                                          result.median_rent_cents &&
                                          result.median_rent_cents <= bahMonthlyCents
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {result.median_rent_cents
                                          ? result.median_rent_cents <= bahMonthlyCents
                                            ? `+$${((bahMonthlyCents - result.median_rent_cents) / 100).toLocaleString()}/mo`
                                            : `-$${((result.median_rent_cents - bahMonthlyCents) / 100).toLocaleString()}/mo`
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Sample Listings */}
                              {result.payload.sample_listings.length > 0 && (
                                <div>
                                  <h5 className="mb-4 font-semibold text-gray-900">
                                    Available Listings
                                  </h5>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {result.payload.sample_listings
                                      .slice(0, 4)
                                      .map((listing, i) => (
                                        <a
                                          key={i}
                                          href={listing.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
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

                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>Data source: Zillow via RapidAPI • Cached 30 days</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {(activeTabs[result.zip] || "overview") === "commute" && (
                            <div className="space-y-6">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Commute to {base.name}
                              </h4>

                              {/* Commute Data Provenance */}
                              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                                <div className="flex items-center gap-2 text-sm text-purple-800">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>
                                    <strong>Data Source:</strong> Google Distance Matrix • Updated
                                    daily •
                                    <a
                                      href={`https://maps.google.com/maps?q=${base.center.lat},${base.center.lng}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1 underline hover:text-purple-900"
                                    >
                                      View on Google Maps
                                    </a>
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-900">Commute Times</h5>
                                  <div className="text-2xl font-bold text-purple-600">
                                    {Math.round(result.subscores.commute)}/100
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">
                                      {result.commute_am_minutes || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-600">AM Rush (min)</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">
                                      {result.commute_pm_minutes || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-600">PM Rush (min)</div>
                                  </div>
                                </div>

                                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                  <p className="text-sm text-gray-700">
                                    {result.payload.commute_text}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>Data source: Google Distance Matrix • Updated daily</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {(activeTabs[result.zip] || "overview") === "quality" && (
                            <div className="space-y-6">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Quality of Life
                              </h4>

                              {/* Quality of Life Data Provenance */}
                              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                                <div className="flex items-center gap-2 text-sm text-orange-800">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>
                                    <strong>Data Sources:</strong> Google Weather, Google Places •
                                    Updated daily •
                                    <a
                                      href="https://developers.google.com/maps/documentation/places/web-service"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1 underline hover:text-orange-900"
                                    >
                                      View API Documentation
                                    </a>
                                  </span>
                                </div>
                              </div>

                              {/* Weather */}
                              <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-900">Weather Comfort</h5>
                                  <div className="text-2xl font-bold text-orange-600">
                                    {result.weather_index}/10
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {result.payload.weather_note}
                                </p>
                              </div>

                              {/* Amenities */}
                              {result.payload.amenities_data && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6">
                                  <div className="mb-4 flex items-center justify-between">
                                    <h5 className="font-semibold text-gray-900">Local Amenities</h5>
                                    <div className="text-2xl font-bold text-indigo-600">
                                      {Math.round(result.subscores.amenities)}/100
                                    </div>
                                  </div>
                                  <p className="mb-4 text-sm text-gray-700">
                                    {result.payload.amenities_data.note}
                                  </p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                      <Icon name="ShoppingCart" className="h-5 w-5 text-gray-600" />
                                      <span className="text-sm text-gray-700">
                                        {result.payload.amenities_data.grocery_stores} Grocery
                                        Stores
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Users" className="h-5 w-5 text-gray-600" />
                                      <span className="text-sm text-gray-700">
                                        {result.payload.amenities_data.restaurants} Restaurants
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Heart" className="h-5 w-5 text-gray-600" />
                                      <span className="text-sm text-gray-700">
                                        {result.payload.amenities_data.gyms} Gyms
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon name="Shield" className="h-5 w-5 text-gray-600" />
                                      <span className="text-sm text-gray-700">
                                        {result.payload.amenities_data.hospitals} Hospitals
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Military Amenities */}
                              {result.payload.military_data && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6">
                                  <div className="mb-4 flex items-center justify-between">
                                    <h5 className="font-semibold text-gray-900">
                                      Military Amenities
                                    </h5>
                                    <div className="text-2xl font-bold text-gray-600">
                                      {Math.round(result.subscores.military)}/100
                                    </div>
                                  </div>
                                  <p className="mb-4 text-sm text-gray-700">
                                    {result.payload.military_data.note}
                                  </p>
                                  <div className="grid grid-cols-2 gap-4">
                                    {result.payload.military_data.commissary_distance_mi && (
                                      <div className="flex items-center gap-2">
                                        <Icon
                                          name="ShoppingCart"
                                          className="h-5 w-5 text-gray-600"
                                        />
                                        <span className="text-sm text-gray-700">
                                          Commissary:{" "}
                                          {result.payload.military_data.commissary_distance_mi.toFixed(
                                            1
                                          )}{" "}
                                          mi
                                        </span>
                                      </div>
                                    )}
                                    {result.payload.military_data.exchange_distance_mi && (
                                      <div className="flex items-center gap-2">
                                        <Icon
                                          name="ShoppingCart"
                                          className="h-5 w-5 text-gray-600"
                                        />
                                        <span className="text-sm text-gray-700">
                                          Exchange:{" "}
                                          {result.payload.military_data.exchange_distance_mi.toFixed(
                                            1
                                          )}{" "}
                                          mi
                                        </span>
                                      </div>
                                    )}
                                    {result.payload.military_data.va_facility_distance_mi && (
                                      <div className="flex items-center gap-2">
                                        <Icon name="Shield" className="h-5 w-5 text-gray-600" />
                                        <span className="text-sm text-gray-700">
                                          VA Facility:{" "}
                                          {result.payload.military_data.va_facility_distance_mi.toFixed(
                                            1
                                          )}{" "}
                                          mi
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Demographics */}
                              {result.payload.demographics_data && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6">
                                  <div className="mb-4 flex items-center justify-between">
                                    <h5 className="font-semibold text-gray-900">Demographics</h5>
                                    <div className="text-2xl font-bold text-pink-600">
                                      {Math.round(result.subscores.demographics)}/100
                                    </div>
                                  </div>
                                  <p className="mb-4 text-sm text-gray-700">
                                    {result.payload.demographics_data.note}
                                  </p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-sm text-gray-600">Population:</span>
                                      <span className="ml-2 text-sm font-semibold">
                                        {result.payload.demographics_data.population.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600">Median Age:</span>
                                      <span className="ml-2 text-sm font-semibold">
                                        {result.payload.demographics_data.median_age}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600">Median Income:</span>
                                      <span className="ml-2 text-sm font-semibold">
                                        $
                                        {result.payload.demographics_data.median_income.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600">Diversity:</span>
                                      <span className="ml-2 text-sm font-semibold">
                                        {(
                                          result.payload.demographics_data.diversity_index * 100
                                        ).toFixed(0)}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Icon name="Info" className="h-4 w-4" />
                                  <span>
                                    Data sources: Google Weather, Google Places • Updated daily
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Ready to Find Your Perfect Neighborhood?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
              Set your search criteria above and click "Find Best Neighborhoods" to discover the top
              5 areas near {base.name} that match your family's needs.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={computeRankings}
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700"
              >
                Find Best Neighborhoods
              </button>
              <Link
                href="/dashboard/navigator"
                className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Browse Other Bases
              </Link>
            </div>
          </div>
        )}

        {/* Enhanced Attribution Footer */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="text-center">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Data Sources & Attribution</h4>
            <div className="grid grid-cols-1 gap-4 text-xs text-gray-600 md:grid-cols-3">
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
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                •
                <button onClick={computeRankings} className="ml-1 text-blue-600 hover:underline">
                  Refresh data
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Scores are estimates based on available data - verify locally before making
                decisions.
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
              <h3 className="text-lg font-semibold text-indigo-900">Need Help Deciding?</h3>
              <p className="mt-1 text-sm text-indigo-700">
                Get personalized advice from our military financial experts. They understand the
                unique challenges of military moves and can help you make the best decision for your
                family.
              </p>
              <div className="mt-4">
                <a
                  href="/dashboard/ask"
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Ask Military Expert
                  <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
