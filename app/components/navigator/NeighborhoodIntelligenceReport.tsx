/**
 * NEIGHBORHOOD INTELLIGENCE REPORT - PREMIUM UI
 *
 * Magazine-quality presentation for world-class military relocation intelligence
 * Design philosophy: Visual hierarchy, progressive disclosure, emotional engagement
 * REVAMPED: Enhanced data visualization, better actionability, military-focused insights
 */

"use client";

import { useState } from "react";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
  rank: number;
  baseName: string;
}

export default function NeighborhoodIntelligenceReport({ neighborhood, rank, baseName }: Props) {
  const intel = neighborhood.payload.intelligence;
  const enhanced = neighborhood.payload.enhanced_amenities;
  const schoolsIntel = neighborhood.payload.schools_intelligence;
  const commuteIntel = neighborhood.payload.commute_intelligence;
  const weatherIntel = neighborhood.payload.weather_intelligence;
  const housingIntel = neighborhood.payload.housing_intelligence;

  const [activeTab, setActiveTab] = useState<string>("overview");

  // If no enhanced data, return null (show standard view)
  if (!intel || !enhanced) {
    return null;
  }

  const getRankBadge = () => {
    if (rank === 1) return { emoji: "🥇", label: "Top Choice", color: "from-yellow-400 to-yellow-600" };
    if (rank === 2) return { emoji: "🥈", label: "Runner-Up", color: "from-gray-300 to-gray-500" };
    if (rank === 3) return { emoji: "🥉", label: "Third Best", color: "from-orange-300 to-orange-500" };
    return { emoji: "📍", label: `Rank #${rank}`, color: "from-blue-400 to-blue-600" };
  };

  const badge = getRankBadge();

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "High Confidence";
    if (score >= 60) return "Good Confidence";
    return "Moderate Confidence";
  };

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  // Helper to get score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-amber-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-8 pb-8">
      {/* MISSION BRIEFING - Enhanced Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}></div>
        </div>

        {/* Rank Badge */}
        <div className="absolute right-8 top-8">
          <div className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${badge.color} px-4 py-2 text-sm font-bold text-white shadow-lg`}>
            <span className="text-lg">{badge.emoji}</span>
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Mission Header */}
        <div className="mb-6 max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Icon name="Shield" className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mission Briefing</div>
              <div className="text-xs text-slate-500">Intelligence Report for Military Families</div>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Icon name="MapPin" className="h-4 w-4" />
            ZIP {neighborhood.zip} • {baseName}
          </div>

          <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
            {intel.quick_verdict}
          </h2>
          
          {/* Enhanced Confidence Visualization */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="relative h-28 w-28">
                {/* Outer ring - gradient */}
                <svg className="h-28 w-28 -rotate-90 transform">
                  <defs>
                    <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: intel.confidence_score >= 80 ? '#10b981' : intel.confidence_score >= 60 ? '#3b82f6' : '#f59e0b', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: intel.confidence_score >= 80 ? '#059669' : intel.confidence_score >= 60 ? '#2563eb' : '#d97706', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="url(#confidenceGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - intel.confidence_score / 100)}`}
                    strokeLinecap="round"
                    className="drop-shadow-lg"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{intel.confidence_score}</div>
                    <div className="text-xs text-slate-300">of 100</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className={`rounded-full px-3 py-1 text-xs font-bold ${getConfidenceColor(intel.confidence_score)}`}>
                  {getConfidenceLabel(intel.confidence_score)}
                </div>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                Based on {enhanced.total_amenities}+ amenities,
                {schoolsIntel && ` ${schoolsIntel.total_schools} schools,`}
                {housingIntel && ` ${housingIntel.bah_analysis.properties_at_or_under_bah} BAH-friendly properties,`}
                {weatherIntel && ` ${weatherIntel.outdoor_season_months} outdoor-friendly months,`}
                {commuteIntel && ` and real-time commute data.`}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid gap-4 border-t border-slate-700 pt-6 md:grid-cols-4">
          {commuteIntel && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/20">
                <Icon name="Truck" className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Commute</div>
                <div className="font-bold">{commuteIntel.best_departure_time.minutes} min best</div>
              </div>
            </div>
          )}
          {schoolsIntel && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                <Icon name="GraduationCap" className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Schools</div>
                <div className="font-bold">{schoolsIntel.overall_avg_rating.toFixed(1)}/10 avg</div>
              </div>
            </div>
          )}
          {housingIntel && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/20">
                <Icon name="Home" className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">BAH Options</div>
                <div className="font-bold">{housingIntel.bah_analysis.properties_at_or_under_bah} properties</div>
              </div>
            </div>
          )}
          {weatherIntel && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                <Icon name="Sun" className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Weather</div>
                <div className="font-bold">{weatherIntel.overall_comfort_score}/100 comfort</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED INTELLIGENCE - Enhanced Tabbed Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Detailed Intelligence</h3>
            <p className="text-sm text-slate-600">Overview and deep-dive analysis across 5 key categories</p>
          </div>
        </div>
        
        {/* Tab Navigation - Enhanced */}
        <div className="border-b-2 border-gray-200">
          <div className="flex gap-2 overflow-x-auto pb-0">
            {[
              {
                id: "overview",
                label: "Overview",
                fullLabel: "Overview",
                subtitle: "At-a-glance summary",
                icon: "LayoutDashboard" as const,
                color: "slate",
              },
              {
                id: "schools",
                label: "Schools",
                fullLabel: "Schools Intelligence",
                subtitle: schoolsIntel ? `${schoolsIntel.total_schools} schools • ${schoolsIntel.overall_avg_rating.toFixed(1)}/10 avg` : "",
                icon: "GraduationCap" as const,
                color: "blue",
              },
              {
                id: "commute",
                label: "Commute",
                fullLabel: "Commute Intelligence",
                subtitle: commuteIntel ? `${commuteIntel.work_life_balance_score}/100 WLB • ${commuteIntel.primary_route_miles.toFixed(1)} mi` : "",
                icon: "Truck" as const,
                color: "green",
              },
              {
                id: "weather",
                label: "Weather",
                fullLabel: "Weather & Climate",
                subtitle: weatherIntel ? `${weatherIntel.overall_comfort_score}/100 comfort • ${weatherIntel.outdoor_season_months} mo outdoor` : "",
                icon: "Sun" as const,
                color: "amber",
              },
              {
                id: "housing",
                label: "Housing",
                fullLabel: "Housing Market",
                subtitle: housingIntel ? `${housingIntel.bah_analysis.properties_at_or_under_bah} at BAH • ${housingIntel.market_trends.competition_level}` : "",
                icon: "Home" as const,
                color: "slate",
              },
              {
                id: "amenities",
                label: "Amenities",
                fullLabel: "Local Amenities",
                subtitle: enhanced ? `${enhanced.total_amenities} total • 10 categories` : "",
                icon: "MapPin" as const,
                color: "purple",
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[70px] flex-shrink-0 flex-col items-start gap-1 rounded-t-xl px-5 py-3 text-sm transition-all ${
                    isActive
                      ? `border-b-4 border-${tab.color}-600 bg-${tab.color}-50 text-${tab.color}-700 shadow-lg`
                      : "border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <Icon name={tab.icon} className={`h-5 w-5 flex-shrink-0 ${isActive ? `text-${tab.color}-600` : ''}`} />
                    <span className="hidden lg:inline">{tab.fullLabel}</span>
                    <span className="lg:hidden">{tab.label}</span>
                  </div>
                  {tab.subtitle && (
                    <span className="hidden text-xs text-gray-600 md:inline">{tab.subtitle}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content - Enhanced Sections */}
        <div className="min-h-[500px]">
          {/* Overview Tab - NEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Executive Dashboard Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Schools Metric */}
                {schoolsIntel && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("schools")}
                    className="group rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Icon name="GraduationCap" className="h-8 w-8 text-blue-600" />
                      <div className="text-right">
                        <div className="text-4xl font-bold text-blue-600">
                          {schoolsIntel.overall_avg_rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">out of 10</div>
                      </div>
                    </div>
                    <div className="mb-1 font-semibold text-slate-900">Schools Quality</div>
                    <div className="text-sm text-slate-600">{schoolsIntel.total_schools} school{schoolsIntel.total_schools !== 1 ? 's' : ''} in district</div>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${(schoolsIntel.overall_avg_rating / 10) * 100}%` }}
                      />
                    </div>
                  </button>
                )}

                {/* Commute Metric */}
                {commuteIntel && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("commute")}
                    className="group rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 text-left transition-all hover:border-green-400 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Icon name="Truck" className="h-8 w-8 text-green-600" />
                      <div className="text-right">
                        <div className="text-4xl font-bold text-green-600">
                          {commuteIntel.work_life_balance_score}
                        </div>
                        <div className="text-xs text-slate-500">WLB score</div>
                      </div>
                    </div>
                    <div className="mb-1 font-semibold text-slate-900">Work-Life Balance</div>
                    <div className="text-sm text-slate-600">{commuteIntel.best_departure_time.minutes}min best time</div>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${commuteIntel.work_life_balance_score}%` }}
                      />
                    </div>
                  </button>
                )}

                {/* Housing Metric */}
                {housingIntel && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("housing")}
                    className="group rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 text-left transition-all hover:border-slate-400 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Icon name="Home" className="h-8 w-8 text-slate-700" />
                      <div className="text-right">
                        <div className="text-4xl font-bold text-slate-900">
                          {housingIntel.bah_analysis.properties_at_or_under_bah}
                        </div>
                        <div className="text-xs text-slate-500">at/under BAH</div>
                      </div>
                    </div>
                    <div className="mb-1 font-semibold text-slate-900">Housing Options</div>
                    <div className="text-sm text-slate-600">{housingIntel.market_trends.competition_level} competition</div>
                    <div className="mt-3 flex items-center gap-2">
                      {housingIntel.market_trends.competition_level === "low" && (
                        <span className="text-xs font-semibold text-green-600">🟢 Buyer's Market</span>
                      )}
                      {housingIntel.market_trends.competition_level === "moderate" && (
                        <span className="text-xs font-semibold text-amber-600">🟡 Balanced Market</span>
                      )}
                      {housingIntel.market_trends.competition_level === "high" && (
                        <span className="text-xs font-semibold text-red-600">🔴 Seller's Market</span>
                      )}
                    </div>
                  </button>
                )}

                {/* Weather Metric */}
                {weatherIntel && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("weather")}
                    className="group rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-left transition-all hover:border-amber-400 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Icon name="Sun" className="h-8 w-8 text-amber-600" />
                      <div className="text-right">
                        <div className="text-4xl font-bold text-amber-600">
                          {weatherIntel.overall_comfort_score}
                        </div>
                        <div className="text-xs text-slate-500">comfort</div>
                      </div>
                    </div>
                    <div className="mb-1 font-semibold text-slate-900">Climate Comfort</div>
                    <div className="text-sm text-slate-600">{weatherIntel.outdoor_season_months} outdoor months</div>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                        style={{ width: `${weatherIntel.overall_comfort_score}%` }}
                      />
                    </div>
                  </button>
                )}
              </div>

              {/* Strengths & Considerations - From Hero Section */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Key Strengths */}
                {intel.key_strengths.length > 0 && (
                  <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                        <Icon name="CheckCircle" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Key Strengths</h3>
                        <div className="text-xs text-green-700">What makes this neighborhood great</div>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {intel.key_strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-600">
                            <Icon name="Check" className="h-3 w-3 text-white" />
                          </div>
                          <span className="flex-1 text-slate-700 leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Considerations */}
                {intel.considerations.length > 0 && (
                  <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600">
                        <Icon name="AlertCircle" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Considerations</h3>
                        <div className="text-xs text-amber-700">Important factors to keep in mind</div>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {intel.considerations.map((consideration, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
                          </div>
                          <span className="flex-1 text-slate-700 leading-relaxed">{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schools Tab - COMPREHENSIVE */}
          {activeTab === "schools" && schoolsIntel && (
            <div className="space-y-8">
              {/* School Intelligence Overview */}
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-white p-6 border-l-4 border-blue-600 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Icon name="GraduationCap" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900">School District Intelligence</h4>
                    <div className="text-sm text-blue-700">{schoolsIntel.total_schools} school{schoolsIntel.total_schools !== 1 ? 's' : ''} in your district</div>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">{schoolsIntel.executive_summary}</p>
              </div>

              {/* Overall Rating Visualization */}
              <div className="rounded-xl border-2 border-blue-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Overall School Quality</div>
                    <div className="text-4xl font-bold text-blue-600">{schoolsIntel.overall_avg_rating.toFixed(1)}<span className="text-2xl text-slate-400">/10</span></div>
                  </div>
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full ${getScoreBg(schoolsIntel.overall_avg_rating * 10)}`}>
                    <div className={`text-3xl font-bold ${getScoreColor(schoolsIntel.overall_avg_rating * 10)}`}>
                      {schoolsIntel.overall_avg_rating >= 8 ? "A" : schoolsIntel.overall_avg_rating >= 6 ? "B" : schoolsIntel.overall_avg_rating >= 4 ? "C" : "D"}
                    </div>
                  </div>
                </div>
                {/* Rating bar with segments */}
                <div className="relative h-4 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500"
                    style={{ width: `${(schoolsIntel.overall_avg_rating / 10) * 100}%` }}
                  />
                  {/* Rating scale markers */}
                  <div className="absolute inset-0 flex">
                    {[2, 4, 6, 8].map((mark) => (
                      <div key={mark} className="flex-1 border-r border-white/30" />
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>0 Poor</span>
                  <span>5 Average</span>
                  <span>10 Excellent</span>
                </div>
              </div>

              {/* Detailed Analysis */}
              {schoolsIntel.detailed_analysis && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Info" className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-blue-900">Detailed Analysis</h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{schoolsIntel.detailed_analysis}</p>
                </div>
              )}

              {/* Grade Level Breakdown - Show ALL Schools */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="GraduationCap" className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Schools in Your District</h4>
                    <div className="text-sm text-slate-600">{schoolsIntel.total_schools} school{schoolsIntel.total_schools !== 1 ? 's' : ''} your children can attend</div>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {schoolsIntel.by_grade.elementary.count > 0 && (
                    <EnhancedGradeLevelCard
                      level="Elementary"
                      grades="K-5"
                      count={schoolsIntel.by_grade.elementary.count}
                      avgRating={schoolsIntel.by_grade.elementary.avg_rating}
                      topSchools={schoolsIntel.by_grade.elementary.top_picks}
                      color="blue"
                      showAll={true}
                    />
                  )}
                  {schoolsIntel.by_grade.middle.count > 0 && (
                    <EnhancedGradeLevelCard
                      level="Middle School"
                      grades="6-8"
                      count={schoolsIntel.by_grade.middle.count}
                      avgRating={schoolsIntel.by_grade.middle.avg_rating}
                      topSchools={schoolsIntel.by_grade.middle.top_picks}
                      color="green"
                      showAll={true}
                    />
                  )}
                  {schoolsIntel.by_grade.high.count > 0 && (
                    <EnhancedGradeLevelCard
                      level="High School"
                      grades="9-12"
                      count={schoolsIntel.by_grade.high.count}
                      avgRating={schoolsIntel.by_grade.high.avg_rating}
                      topSchools={schoolsIntel.by_grade.high.top_picks}
                      color="purple"
                      showAll={true}
                    />
                  )}
                </div>
              </div>

              {/* Private Schools */}
              {schoolsIntel.by_grade.private.count > 0 && (
                <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Icon name="Star" className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Private Schools</h4>
                      <div className="text-sm text-slate-600">{schoolsIntel.by_grade.private.count} schools • {schoolsIntel.by_grade.private.avg_rating.toFixed(1)}/10 avg</div>
                    </div>
                  </div>
                  <p className="text-slate-700">This area has {schoolsIntel.by_grade.private.count} private school options with an average rating of {schoolsIntel.by_grade.private.avg_rating.toFixed(1)}/10.</p>
                </div>
              )}
            </div>
          )}

          {/* Commute Tab - ENHANCED */}
          {activeTab === "commute" && commuteIntel && (
            <div className="space-y-8">
              {/* Commute Timeline Visualization */}
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-white p-6 border-l-4 border-green-600">
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Timer" className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-bold text-green-900">Your Commute Profile</h4>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Best Time */}
                  <div className="rounded-lg border-2 border-green-300 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="font-bold text-slate-900">Optimal Departure</div>
                    </div>
                    <div className="mb-2 flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-green-600">
                        {commuteIntel.best_departure_time.hour}:{commuteIntel.best_departure_time.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-slate-600">AM</div>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="text-2xl font-semibold text-slate-900">{commuteIntel.best_departure_time.minutes} min</div>
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Light Traffic</div>
                    </div>
                    <p className="text-sm text-slate-600">{commuteIntel.best_departure_time.description}</p>
                  </div>

                  {/* Worst Time */}
                  <div className="rounded-lg border-2 border-red-300 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="font-bold text-slate-900">Avoid This Time</div>
                    </div>
                    <div className="mb-2 flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-red-600">
                        {commuteIntel.worst_departure_time.hour > 12 
                          ? `${commuteIntel.worst_departure_time.hour - 12}:${commuteIntel.worst_departure_time.minutes.toString().padStart(2, '0')}`
                          : `${commuteIntel.worst_departure_time.hour}:${commuteIntel.worst_departure_time.minutes.toString().padStart(2, '0')}`
                        }
                      </div>
                      <div className="text-sm text-slate-600">{commuteIntel.worst_departure_time.hour >= 12 ? "PM" : "AM"}</div>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="text-2xl font-semibold text-slate-900">{commuteIntel.worst_departure_time.minutes} min</div>
                      <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Heavy Traffic</div>
                    </div>
                    <p className="text-sm text-slate-600">{commuteIntel.worst_departure_time.description}</p>
                  </div>
                </div>
              </div>

              {/* Cost Analysis - Enhanced */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-bold text-slate-900">Cost & Time Impact</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="DollarSign" className="h-5 w-5 text-amber-600" />
                      <div className="text-sm font-semibold text-slate-600">Annual Fuel Cost</div>
                    </div>
                    <div className="mb-1 text-3xl font-bold text-slate-900">
                      ${commuteIntel.annual_fuel_cost.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      Based on {commuteIntel.primary_route_miles.toFixed(1)} mi route • ~{Math.round(commuteIntel.annual_fuel_cost / 12)}/month
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="Timer" className="h-5 w-5 text-blue-600" />
                      <div className="text-sm font-semibold text-slate-600">Weekly Time Cost</div>
                    </div>
                    <div className="mb-1 text-3xl font-bold text-slate-900">
                      {commuteIntel.weekly_time_cost_hours.toFixed(1)} hrs
                    </div>
                    <div className="text-xs text-slate-500">
                      In car per week • ~{Math.round(commuteIntel.weekly_time_cost_hours * 52)} hours/year
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                      <div className="text-sm font-semibold text-slate-600">Work-Life Balance</div>
                    </div>
                    <div className="mb-1 text-3xl font-bold text-green-600">
                      {commuteIntel.work_life_balance_score}/100
                    </div>
                    <div className="text-xs text-slate-500">
                      {commuteIntel.work_life_balance_score >= 80 ? "Excellent" : commuteIntel.work_life_balance_score >= 60 ? "Good" : "Fair"} quality of life
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${commuteIntel.work_life_balance_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Military Considerations */}
              <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                    <Icon name="Shield" className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Military-Specific Considerations</h4>
                    <div className="text-sm text-slate-300">How this commute affects your service</div>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="Sun" className="h-5 w-5 text-amber-400" />
                      <div className="text-sm font-semibold text-slate-300">Early Duty (0600)</div>
                    </div>
                    <div className="text-lg font-bold">{commuteIntel.early_duty_impact}</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="Moon" className="h-5 w-5 text-blue-400" />
                      <div className="text-sm font-semibold text-slate-300">Late Duty (1900)</div>
                    </div>
                    <div className="text-lg font-bold">{commuteIntel.late_duty_impact}</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="Calendar" className="h-5 w-5 text-green-400" />
                      <div className="text-sm font-semibold text-slate-300">Weekend Duty</div>
                    </div>
                    <div className="text-lg font-bold">{commuteIntel.weekend_flexibility}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weather Tab - COMPREHENSIVE */}
          {activeTab === "weather" && weatherIntel && (
            <div className="space-y-8">
              {/* Climate Analysis Overview */}
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-white p-6 border-l-4 border-amber-600 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                    <Icon name="Sun" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-amber-900">Climate Analysis</h4>
                    <div className="text-sm text-amber-700">Year-round weather intelligence for military families</div>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">{weatherIntel.executive_summary}</p>
              </div>

              {/* Climate Overview - Enhanced */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Sun" className="h-5 w-5 text-amber-600" />
                  <h4 className="text-lg font-bold text-slate-900">Climate Overview</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Overall Comfort</div>
                      <Icon name="Heart" className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className={`mb-2 text-4xl font-bold ${getScoreColor(weatherIntel.overall_comfort_score)}`}>
                      {weatherIntel.overall_comfort_score}<span className="text-2xl text-slate-400">/100</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-3">
                      {weatherIntel.overall_comfort_score >= 80 ? "Excellent climate" : weatherIntel.overall_comfort_score >= 60 ? "Good climate" : "Fair climate"}
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${weatherIntel.overall_comfort_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Outdoor Season</div>
                      <Icon name="Activity" className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="mb-2 text-4xl font-bold text-green-600">
                      {weatherIntel.outdoor_season_months}<span className="text-2xl text-slate-400">/12</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-3">months per year</div>
                    <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${(weatherIntel.outdoor_season_months / 12) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Pool Season</div>
                      <Icon name="Sun" className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="mb-2 text-3xl font-bold text-purple-600">{weatherIntel.pool_season}</div>
                    <div className="text-sm text-slate-600">usable months</div>
                  </div>
                </div>
              </div>

              {/* Seasonal Breakdown - Visual Calendar Style */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Calendar" className="h-5 w-5 text-amber-600" />
                  <h4 className="text-lg font-bold text-slate-900">Seasonal Breakdown</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {weatherIntel.seasonal_breakdown.map((season, i) => {
                    const seasonIcons = {
                      "Spring": "Sun",
                      "Summer": "Sun",
                      "Fall": "Cloud",
                      "Autumn": "Cloud",
                      "Winter": "Cloud"
                    };
                    const seasonIcon = seasonIcons[season.season as keyof typeof seasonIcons] || "Cloud";
                    
                    return (
                      <div key={i} className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-3 flex items-center justify-between">
                      <div className="font-bold text-slate-900">{season.season}</div>
                      <Icon name={seasonIcon as "Sun" | "Cloud"} className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="mb-2 text-sm font-semibold text-slate-600">{season.months}</div>
                        <div className="mb-3 text-lg font-bold text-slate-700">{season.avg_temp_range}</div>
                        <div className="mb-3 text-sm text-slate-600 leading-snug">{season.conditions}</div>
                        <div className="rounded-lg bg-amber-50 p-2 text-xs text-slate-700">
                          <span className="font-semibold">Activities:</span> {season.outdoor_activities}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best/Worst Months */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                      <Icon name="Sun" className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-bold text-slate-900">Best Months</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weatherIntel.best_months.map((month, i) => (
                      <div key={i} className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        {month}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600">
                      <Icon name="Cloud" className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-bold text-slate-900">Challenging Months</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weatherIntel.worst_months.map((month, i) => (
                      <div key={i} className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extreme Weather Risks */}
              {weatherIntel.extreme_weather_risks.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Icon name="AlertTriangle" className="h-5 w-5 text-red-600" />
                    <h4 className="text-lg font-bold text-slate-900">Extreme Weather Risks</h4>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {weatherIntel.extreme_weather_risks.map((risk, i) => (
                      <div key={i} className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="font-bold text-red-900">{risk.type}</div>
                          <div className={`rounded-full px-3 py-1 text-xs font-bold ${
                            risk.risk_level.toLowerCase() === "high" ? "bg-red-600 text-white" :
                            risk.risk_level.toLowerCase() === "moderate" ? "bg-amber-600 text-white" :
                            "bg-green-600 text-white"
                          }`}>
                            {risk.risk_level} risk
                          </div>
                        </div>
                        <div className="mb-2 text-sm text-slate-700">
                          <span className="font-semibold">Season:</span> {risk.season}
                        </div>
                        <div className="rounded-lg bg-white p-3 text-sm text-slate-700">
                          <span className="font-semibold">Preparation:</span> {risk.preparation_needed}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Military Considerations */}
              <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-600">
                    <Icon name="Shield" className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Military Family Considerations</h4>
                    <div className="text-sm text-slate-300">How weather affects military life here</div>
                  </div>
                </div>
                <p className="text-slate-100 leading-relaxed text-lg">{weatherIntel.military_family_considerations}</p>
              </div>
            </div>
          )}

          {/* Housing Tab - PROPERTY LISTINGS FOCUSED */}
          {activeTab === "housing" && housingIntel && (
            <div className="space-y-8">
              {/* SECTION 1: AVAILABLE PROPERTIES (TOP PRIORITY) */}
              {neighborhood.payload.sample_listings && neighborhood.payload.sample_listings.length > 0 && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                        <Icon name="Home" className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900">Available Properties</h4>
                        <div className="text-sm text-slate-600">{neighborhood.payload.sample_listings.length} listings in this area</div>
                      </div>
                    </div>
                    <a 
                      href={`https://www.zillow.com/homes/for_rent/${neighborhood.zip}_rb/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      View All on Zillow
                      <Icon name="ExternalLink" className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Property Cards Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {neighborhood.payload.sample_listings.map((listing, i) => (
                      <a
                        key={i}
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300"
                      >
                        {/* Property Photo */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {listing.photo ? (
                            <img 
                              src={listing.photo} 
                              alt={listing.title}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                              <Icon name="Home" className="h-16 w-16 text-slate-400" />
                            </div>
                          )}
                          {/* Price Badge */}
                          <div className="absolute top-3 right-3 rounded-lg bg-blue-600 px-3 py-1 shadow-lg">
                            <div className="text-lg font-bold text-white">
                              ${Math.round(listing.price_cents / 100).toLocaleString()}
                            </div>
                            <div className="text-xs text-blue-100">/ month</div>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-4">
                          <h5 className="mb-3 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {listing.title}
                          </h5>
                          
                          {/* Beds/Baths */}
                          <div className="mb-3 flex items-center gap-4 text-sm text-slate-600">
                            {listing.bedrooms && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{listing.bedrooms}</span> bed{listing.bedrooms !== 1 ? 's' : ''}
                              </div>
                            )}
                            {listing.bathrooms && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{listing.bathrooms}</span> bath{listing.bathrooms !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>

                          {/* View Details Button */}
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                            View Details
                            <Icon name="ExternalLink" className="h-4 w-4" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: Market Intelligence Summary */}
              <div className="rounded-xl bg-gradient-to-r from-slate-50 to-white p-6 border-l-4 border-slate-600 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-600">
                    <Icon name="TrendingUp" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Market Intelligence</h4>
                    <div className="text-sm text-slate-600">Expert analysis for this neighborhood</div>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">{housingIntel.executive_summary}</p>
              </div>

              {/* BAH Analysis - Visual */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-bold text-slate-900">BAH Analysis</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200 p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                      <div className="text-sm font-semibold text-slate-600">At/Under BAH</div>
                    </div>
                    <div className="mb-1 text-4xl font-bold text-green-600">
                      {housingIntel.bah_analysis.properties_at_or_under_bah}
                    </div>
                    <div className="text-sm text-slate-600">properties available</div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="Target" className="h-5 w-5 text-blue-600" />
                      <div className="text-sm font-semibold text-slate-600">Sweet Spot Range</div>
                    </div>
                    <div className="mb-1 text-2xl font-bold text-blue-600">
                      ${Math.round(housingIntel.bah_analysis.sweet_spot_range.min_cents / 100).toLocaleString()}-
                      {Math.round(housingIntel.bah_analysis.sweet_spot_range.max_cents / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">per month</div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name="TrendingUp" className="h-5 w-5 text-slate-700" />
                      <div className="text-sm font-semibold text-slate-600">Avg Savings</div>
                    </div>
                    <div className="mb-1 text-3xl font-bold text-slate-900">
                      {housingIntel.bah_analysis.avg_savings_cents !== null 
                        ? `$${Math.round(housingIntel.bah_analysis.avg_savings_cents / 100).toLocaleString()}`
                        : "N/A"
                      }
                    </div>
                    <div className="text-sm text-slate-600">per month</div>
                  </div>
                </div>
              </div>

              {/* BAH Recommendation */}
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-white p-6 border-l-4 border-green-600 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Icon name="Lightbulb" className="h-5 w-5 text-green-600" />
                  <div className="font-bold text-green-900">BAH Recommendation</div>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">{housingIntel.bah_analysis.recommendation}</p>
              </div>

              {/* Property Types - Visual Distribution */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Home" className="h-5 w-5 text-slate-700" />
                  <h4 className="text-lg font-bold text-slate-900">Property Type Distribution</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Icon name="Home" className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="font-bold text-slate-900">Single Family</div>
                    </div>
                    <div className="mb-2 text-4xl font-bold text-slate-900">{housingIntel.property_types.single_family.count}</div>
                    <div className="text-sm text-slate-600 mb-3">properties</div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ 
                        width: `${(housingIntel.property_types.single_family.count / (housingIntel.property_types.single_family.count + housingIntel.property_types.townhouse.count + housingIntel.property_types.apartment.count)) * 100}%` 
                      }} />
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                        <Icon name="Home" className="h-7 w-7 text-green-600" />
                      </div>
                      <div className="font-bold text-slate-900">Townhouse</div>
                    </div>
                    <div className="mb-2 text-4xl font-bold text-slate-900">{housingIntel.property_types.townhouse.count}</div>
                    <div className="text-sm text-slate-600 mb-3">properties</div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-green-600" style={{ 
                        width: `${(housingIntel.property_types.townhouse.count / (housingIntel.property_types.single_family.count + housingIntel.property_types.townhouse.count + housingIntel.property_types.apartment.count)) * 100}%` 
                      }} />
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                        <Icon name="Home" className="h-7 w-7 text-purple-600" />
                      </div>
                      <div className="font-bold text-slate-900">Apartment</div>
                    </div>
                    <div className="mb-2 text-4xl font-bold text-slate-900">{housingIntel.property_types.apartment.count}</div>
                    <div className="text-sm text-slate-600 mb-3">properties</div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-600" style={{ 
                        width: `${(housingIntel.property_types.apartment.count / (housingIntel.property_types.single_family.count + housingIntel.property_types.townhouse.count + housingIntel.property_types.apartment.count)) * 100}%` 
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Trends - Enhanced */}
              <div className="rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                    <Icon name="TrendingUp" className="h-7 w-7 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Market Trends</h4>
                    <div className="text-sm text-slate-600">Current market conditions</div>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-600">Price Trend</div>
                    <div className="mb-1 text-xl font-bold text-slate-900">{housingIntel.market_trends.price_trend}</div>
                    <div className="text-sm text-slate-600">{housingIntel.market_trends.trend_description}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-600">Days on Market</div>
                    <div className="mb-1 text-xl font-bold text-slate-900">{housingIntel.market_trends.avg_days_on_market} days</div>
                    <div className="text-xs text-slate-500">Average listing duration</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-600">Competition Level</div>
                    <div className="mb-2 text-xl font-bold text-slate-900">{housingIntel.market_trends.competition_level}</div>
                    {housingIntel.market_trends.competition_level === "low" && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">🟢 Buyer's Market</span>
                    )}
                    {housingIntel.market_trends.competition_level === "moderate" && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">🟡 Balanced</span>
                    )}
                    {housingIntel.market_trends.competition_level === "high" && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">🔴 Seller's Market</span>
                    )}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-600">Negotiation Leverage</div>
                    <div className="text-xl font-bold text-slate-900">{housingIntel.market_trends.negotiation_leverage}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-600">Inventory Level</div>
                    <div className="text-xl font-bold text-slate-900">{housingIntel.market_trends.inventory_level}</div>
                  </div>
                </div>
              </div>

              {/* Property Amenities */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Star" className="h-5 w-5 text-amber-600" />
                  <h4 className="text-lg font-bold text-slate-900">Property Features</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="Heart" className="h-6 w-6 text-green-600" />
                      <div className="text-sm font-semibold text-slate-600">Pet Friendly</div>
                    </div>
                    <div className="text-4xl font-bold text-green-600">{housingIntel.pet_friendly_count}</div>
                    <div className="text-sm text-slate-600">properties</div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="Zap" className="h-6 w-6 text-blue-600" />
                      <div className="text-sm font-semibold text-slate-600">Utilities Included</div>
                    </div>
                    <div className="text-4xl font-bold text-blue-600">{housingIntel.utilities_included_count}</div>
                    <div className="text-sm text-slate-600">properties</div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="Home" className="h-6 w-6 text-slate-700" />
                      <div className="text-sm font-semibold text-slate-600">With Yard</div>
                    </div>
                    <div className="text-4xl font-bold text-slate-700">{housingIntel.yard_count}</div>
                    <div className="text-sm text-slate-600">properties</div>
                  </div>
                </div>
              </div>

              {/* Military Friendly Note */}
              <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                    <Icon name="Shield" className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Military-Friendly Housing</h4>
                    <div className="text-sm text-slate-300">Landlord and community insights</div>
                  </div>
                </div>
                <p className="text-slate-100 leading-relaxed text-lg">{housingIntel.military_friendly_note}</p>
              </div>
            </div>
          )}

          {/* Amenities Tab - ENHANCED */}
          {activeTab === "amenities" && enhanced && (
            <div className="space-y-8">
              {/* Quick Summary */}
              <div className="rounded-xl bg-gradient-to-r from-purple-50 to-white p-6 border-l-4 border-purple-600 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
                  <div className="font-bold text-purple-900">Quick Summary</div>
                </div>
                <p className="text-slate-700 leading-relaxed">{enhanced.quick_summary}</p>
              </div>

              {/* Key Metrics - Visual Dashboard */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="BarChart" className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-bold text-slate-900">Amenity Scores</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 p-6 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Total Amenities</div>
                      <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="mb-1 text-4xl font-bold text-purple-600">{enhanced.total_amenities}</div>
                    <div className="text-sm text-slate-600">within 3 miles</div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200 p-6 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Walkability</div>
                      <Icon name="Activity" className="h-5 w-5 text-green-600" />
                    </div>
                    <div className={`mb-2 text-4xl font-bold ${getScoreColor(enhanced.walkability_score)}`}>
                      {enhanced.walkability_score}<span className="text-2xl text-slate-400">/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${enhanced.walkability_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-6 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Family Friendly</div>
                      <Icon name="Users" className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className={`mb-2 text-4xl font-bold ${getScoreColor(enhanced.family_friendliness_score)}`}>
                      {enhanced.family_friendliness_score}<span className="text-2xl text-slate-400">/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${enhanced.family_friendliness_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 p-6 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-600">Overall Score</div>
                      <Icon name="Star" className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className={`mb-2 text-4xl font-bold ${getScoreColor(enhanced.overall_score)}`}>
                      {enhanced.overall_score}<span className="text-2xl text-slate-400">/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-700"
                        style={{ width: `${enhanced.overall_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenity Categories Grid - Enhanced - ALL 10 Categories */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Grid" className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-bold text-slate-900">All Amenity Categories (10 Total)</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {renderEnhancedAmenityCategory("Essentials", enhanced.essentials.top_picks, enhanced.essentials.count, "ShoppingCart", "purple")}
                  {renderEnhancedAmenityCategory("Family Activities", enhanced.family_activities.top_picks, enhanced.family_activities.count, "Users", "blue")}
                  {renderEnhancedAmenityCategory("Healthcare", enhanced.healthcare.top_picks, enhanced.healthcare.count, "Heart", "red")}
                  {renderEnhancedAmenityCategory("Dining", enhanced.dining.top_picks, enhanced.dining.count, "Utensils", "amber")}
                  {renderEnhancedAmenityCategory("Fitness", enhanced.fitness.top_picks, enhanced.fitness.count, "Zap", "green")}
                  {renderEnhancedAmenityCategory("Services", enhanced.services.top_picks, enhanced.services.count, "Briefcase", "slate")}
                  {renderEnhancedAmenityCategory("Spouse Employment", enhanced.spouse_employment.top_picks, enhanced.spouse_employment.count, "Briefcase", "blue")}
                  {renderEnhancedAmenityCategory("Pet Services", enhanced.pets.top_picks, enhanced.pets.count, "Heart", "green")}
                  {renderEnhancedAmenityCategory("Community", enhanced.community.top_picks, enhanced.community.count, "Users", "purple")}
                  {renderEnhancedAmenityCategory("Home & Auto", enhanced.home_auto.top_picks, enhanced.home_auto.count, "Home", "slate")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Enhanced Helper Components

interface EnhancedGradeLevelCardProps {
  level: string;
  grades: string;
  count: number;
  avgRating: number;
  topSchools: Array<{
    name: string;
    rating: number;
    grades: string;
    distance_mi?: number;
    address?: string;
    // Enhanced data
    school_id?: string;
    enrollment?: number;
    phone?: string;
    website_url?: string;
    is_charter?: boolean;
    is_magnet?: boolean;
    is_title_i?: boolean;
    state_rank?: number;
    district_name?: string;
  }>;
  color: string;
  showAll?: boolean;
}

function EnhancedGradeLevelCard({ level, grades, count, avgRating, topSchools, color, showAll = false }: EnhancedGradeLevelCardProps) {
  const colorMap: Record<string, {bg: string; border: string; text: string; icon: string}> = {
    blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-600", icon: "bg-blue-100" },
    green: { bg: "bg-green-50", border: "border-green-300", text: "text-green-600", icon: "bg-green-100" },
    purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-600", icon: "bg-purple-100" },
  };
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900">{level}</h4>
          <div className="text-sm text-slate-600">{grades}</div>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${colors.icon}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${colors.text}`}>{avgRating.toFixed(1)}</div>
            <div className="text-xs text-slate-500">of 10</div>
          </div>
        </div>
      </div>
      
      <div className="mb-4 text-sm text-slate-600">{count} school{count !== 1 ? 's' : ''} in area</div>
      
      {/* Rating bar */}
      <div className="mb-4 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
          style={{ width: `${(avgRating / 10) * 100}%` }}
        />
      </div>

      {topSchools.length > 0 && (
        <div>
          <div className="mb-4 text-sm font-bold text-slate-700">{showAll ? 'All Schools:' : 'Top Picks:'}</div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {topSchools.map((school, i) => (
              <div key={i} className="group rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all">
                {/* School Header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                      {school.name}
                    </h5>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs text-slate-600">{school.grades}</span>
                      {school.enrollment && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {school.enrollment.toLocaleString()} students
                        </span>
                      )}
                      {school.is_charter && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                          Charter
                        </span>
                      )}
                      {school.is_magnet && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                          Magnet
                        </span>
                      )}
                      {school.is_title_i && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                          Title I
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className={`flex flex-col items-center justify-center rounded-lg ${colors.bg} px-3 py-2 min-w-[60px]`}>
                    <div className={`text-2xl font-bold ${colors.text}`}>{school.rating.toFixed(1)}</div>
                    <div className="text-xs text-slate-600">/ 10</div>
                  </div>
                </div>

                {/* School Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {school.state_rank && (
                    <div className="flex items-center gap-2">
                      <Icon name="TrendingUp" className="h-4 w-4 text-amber-500" />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">Top {school.state_rank}%</div>
                        <div className="text-slate-500">in state</div>
                      </div>
                    </div>
                  )}
                  {school.distance_mi !== undefined && school.distance_mi > 0 && (
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" className="h-4 w-4 text-slate-500" />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">{school.distance_mi.toFixed(1)} mi</div>
                        <div className="text-slate-500">from ZIP</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {school.website_url && (
                  <a 
                    href={school.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View School Profile
                    <Icon name="ExternalLink" className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderEnhancedAmenityCategory(
  title: string,
  amenities: Array<{
    name: string;
    address: string;
    rating?: number;
    user_ratings_total?: number;
    distance_mi?: number;
    types?: string[];
  }>,
  count: number,
  iconName: "ShoppingCart" | "Users" | "Heart" | "Utensils" | "Zap" | "Briefcase" | "Home",
  color: string
) {
  const colorMap: Record<string, {bg: string; border: string; text: string; icon: string}> = {
    purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-600", icon: "bg-purple-100" },
    blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-600", icon: "bg-blue-100" },
    red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-600", icon: "bg-red-100" },
    amber: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-600", icon: "bg-amber-100" },
    green: { bg: "bg-green-50", border: "border-green-300", text: "text-green-600", icon: "bg-green-100" },
    slate: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-600", icon: "bg-slate-100" },
  };
  const colors = colorMap[color] || colorMap.purple;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}>
            <Icon name={iconName} className={`h-5 w-5 ${colors.text}`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <div className="text-sm text-slate-600">{count} total</div>
          </div>
        </div>
      </div>
      
      {amenities.length > 0 && (
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-700">Top Picks ({amenities.length > 5 ? '5 of ' + amenities.length : amenities.length}):</div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {amenities.slice(0, 5).map((amenity, i) => (
              <a
                key={i}
                href={`https://www.google.com/maps/search/${encodeURIComponent(amenity.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                    {amenity.name}
                  </span>
                  {amenity.rating && (
                    <div className="flex items-center gap-1">
                      <Icon name="Star" className="h-3 w-3 text-amber-500" />
                      <span className="font-bold text-slate-900 text-sm">{amenity.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {amenity.distance_mi && (
                  <div className="text-xs text-slate-500">📍 {amenity.distance_mi.toFixed(1)} mi • {amenity.distance_mi < 1 ? "Walking distance" : "Short drive"}</div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
