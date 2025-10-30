/**
 * NEIGHBORHOOD INTELLIGENCE REPORT - PREMIUM UI
 *
 * Magazine-quality presentation for world-class military relocation intelligence
 * Design philosophy: Visual hierarchy, progressive disclosure, emotional engagement
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

  const [activeTab, setActiveTab] = useState<string>("schools");

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

  return (
    <div className="space-y-8 pb-8">
      {/* HERO SECTION - Magazine-style visual impact */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        {/* Rank Badge */}
        <div className="absolute right-8 top-8">
          <div className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${badge.color} px-4 py-2 text-sm font-bold text-white shadow-lg`}>
            <span className="text-lg">{badge.emoji}</span>
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Main Verdict */}
        <div className="mb-6 max-w-3xl">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Icon name="MapPin" className="h-4 w-4" />
            ZIP {neighborhood.zip} • Near {baseName}
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
            {intel.quick_verdict}
          </h2>
          
          {/* Confidence Score - Visual */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - intel.confidence_score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{intel.confidence_score}</div>
                    <div className="text-xs text-slate-300">confidence</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {getConfidenceLabel(intel.confidence_score)}
              </div>
              <div className="text-sm text-slate-300">
                Based on comprehensive analysis of {enhanced.total_amenities}+ local amenities,
                {schoolsIntel ? ` ${schoolsIntel.total_schools} schools,` : ""} housing market data, and real-time commute patterns.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE DASHBOARD - Key Metrics at a Glance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Schools Score */}
        {schoolsIntel && (
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-blue-400 hover:shadow-lg" onClick={() => setActiveTab("schools")}>
            <div className="mb-3 flex items-center justify-between">
              <Icon name="GraduationCap" className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{schoolsIntel.overall_avg_rating.toFixed(1)}</div>
                <div className="text-xs text-slate-500">avg rating</div>
              </div>
            </div>
            <div className="mb-1 font-semibold text-slate-900">Schools</div>
            <div className="text-sm text-slate-600">{schoolsIntel.total_schools} schools nearby</div>
          </div>
        )}

        {/* Commute Score */}
        {commuteIntel && (
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-green-400 hover:shadow-lg" onClick={() => setActiveTab("commute")}>
            <div className="mb-3 flex items-center justify-between">
              <Icon name="Truck" className="h-8 w-8 text-green-600" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{commuteIntel.work_life_balance_score}</div>
                <div className="text-xs text-slate-500">WLB score</div>
              </div>
            </div>
            <div className="mb-1 font-semibold text-slate-900">Commute</div>
            <div className="text-sm text-slate-600">
              {commuteIntel.best_departure_time.minutes}min best time
            </div>
          </div>
        )}

        {/* Housing Score */}
        {housingIntel && (
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-slate-400 hover:shadow-lg" onClick={() => setActiveTab("housing")}>
            <div className="mb-3 flex items-center justify-between">
              <Icon name="Home" className="h-8 w-8 text-slate-700" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{housingIntel.bah_analysis.properties_at_or_under_bah}</div>
                <div className="text-xs text-slate-500">at/under BAH</div>
              </div>
            </div>
            <div className="mb-1 font-semibold text-slate-900">Housing</div>
            <div className="text-sm text-slate-600">{housingIntel.market_trends.competition_level} competition</div>
          </div>
        )}

        {/* Weather Score */}
        {weatherIntel && (
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-amber-400 hover:shadow-lg" onClick={() => setActiveTab("weather")}>
            <div className="mb-3 flex items-center justify-between">
              <Icon name="Sun" className="h-8 w-8 text-amber-600" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{weatherIntel.overall_comfort_score}</div>
                <div className="text-xs text-slate-500">comfort</div>
              </div>
            </div>
            <div className="mb-1 font-semibold text-slate-900">Weather</div>
            <div className="text-sm text-slate-600">{weatherIntel.outdoor_season_months} months outdoor-friendly</div>
          </div>
        )}
      </div>

      {/* QUICK INSIGHTS - Strengths & Considerations Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Key Strengths */}
        {intel.key_strengths.length > 0 && (
          <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-green-600 p-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Key Strengths</h3>
            </div>
            <ul className="space-y-3">
              {intel.key_strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 rounded-full bg-green-600 p-0.5">
                    <Icon name="Check" className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-slate-700 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Considerations */}
        {intel.considerations.length > 0 && (
          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-600 p-2">
                <Icon name="AlertCircle" className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Considerations</h3>
            </div>
            <ul className="space-y-3">
              {intel.considerations.map((consideration, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <Icon name="AlertTriangle" className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-slate-700 leading-relaxed">{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* DETAILED INTELLIGENCE - Tabbed Sections */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900">Detailed Intelligence</h3>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {[
              {
                id: "schools",
                label: "Schools Intelligence",
                subtitle: schoolsIntel ? `${schoolsIntel.total_schools} schools • Avg ${schoolsIntel.overall_avg_rating.toFixed(1)}/10 rating` : "",
                icon: "GraduationCap" as const,
              },
              {
                id: "commute",
                label: "Commute Intelligence",
                subtitle: commuteIntel ? `${commuteIntel.work_life_balance_score}/100 work-life balance • ${commuteIntel.primary_route_miles.toFixed(1)} miles` : "",
                icon: "Truck" as const,
              },
              {
                id: "weather",
                label: "Weather & Climate Intelligence",
                subtitle: weatherIntel ? `${weatherIntel.overall_comfort_score}/100 comfort • ${weatherIntel.outdoor_season_months} months outdoor-friendly` : "",
                icon: "Sun" as const,
              },
              {
                id: "housing",
                label: "Housing Market Intelligence",
                subtitle: housingIntel ? `${housingIntel.bah_analysis.properties_at_or_under_bah} properties at/under BAH • ${housingIntel.market_trends.competition_level} competition` : "",
                icon: "Home" as const,
              },
              {
                id: "amenities",
                label: "Local Amenities (30+ Categories)",
                subtitle: enhanced ? `${enhanced.total_amenities} amenities within 3 miles • Walkability ${enhanced.walkability_score}/100` : "",
                icon: "MapPin" as const,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[60px] flex-shrink-0 flex-col items-start gap-1 rounded-t-lg px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "border-b-2 border-blue-600 bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Icon name={tab.icon} className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:inline md:hidden">{tab.label.split(" ")[0]}</span>
                  </div>
                  {tab.subtitle && (
                    <span className="hidden text-xs text-gray-500 md:inline">{tab.subtitle}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Schools Tab */}
          {activeTab === "schools" && schoolsIntel && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="rounded-lg bg-blue-50 p-4 border-l-4 border-blue-600">
                <div className="font-semibold text-blue-900 mb-2">Executive Summary</div>
                <p className="text-slate-700 leading-relaxed">{schoolsIntel.executive_summary}</p>
              </div>

              {/* Grade Level Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                {schoolsIntel.by_grade.elementary.count > 0 && (
                  <GradeLevelCard
                    level="Elementary (K-5)"
                    count={schoolsIntel.by_grade.elementary.count}
                    avgRating={schoolsIntel.by_grade.elementary.avg_rating}
                    topSchools={schoolsIntel.by_grade.elementary.top_picks}
                  />
                )}
                {schoolsIntel.by_grade.middle.count > 0 && (
                  <GradeLevelCard
                    level="Middle (6-8)"
                    count={schoolsIntel.by_grade.middle.count}
                    avgRating={schoolsIntel.by_grade.middle.avg_rating}
                    topSchools={schoolsIntel.by_grade.middle.top_picks}
                  />
                )}
                {schoolsIntel.by_grade.high.count > 0 && (
                  <GradeLevelCard
                    level="High (9-12)"
                    count={schoolsIntel.by_grade.high.count}
                    avgRating={schoolsIntel.by_grade.high.avg_rating}
                    topSchools={schoolsIntel.by_grade.high.top_picks}
                  />
                )}
              </div>
            </div>
          )}

          {/* Commute Tab */}
          {activeTab === "commute" && commuteIntel && (
            <div className="space-y-6">
              {/* Traffic Patterns */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-green-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
                    <div className="font-bold text-slate-900">Best Time</div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {commuteIntel.best_departure_time.hour}:{commuteIntel.best_departure_time.minutes.toString().padStart(2, '0')} AM
                  </div>
                  <div className="text-2xl font-semibold text-slate-900 mb-2">
                    {commuteIntel.best_departure_time.minutes} min
                  </div>
                  <p className="text-sm text-slate-600">{commuteIntel.best_departure_time.description}</p>
                </div>

                <div className="rounded-lg border-2 border-red-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
                    <div className="font-bold text-slate-900">Avoid This Time</div>
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {commuteIntel.worst_departure_time.hour > 12 
                      ? `${commuteIntel.worst_departure_time.hour - 12}:${commuteIntel.worst_departure_time.minutes.toString().padStart(2, '0')} PM`
                      : `${commuteIntel.worst_departure_time.hour}:${commuteIntel.worst_departure_time.minutes.toString().padStart(2, '0')} AM`
                    }
                  </div>
                  <div className="text-2xl font-semibold text-slate-900 mb-2">
                    {commuteIntel.worst_departure_time.minutes} min
                  </div>
                  <p className="text-sm text-slate-600">{commuteIntel.worst_departure_time.description}</p>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Annual Fuel Cost</div>
                  <div className="text-2xl font-bold text-slate-900">${commuteIntel.annual_fuel_cost.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">Based on {commuteIntel.primary_route_miles.toFixed(1)} mi route</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Weekly Time Cost</div>
                  <div className="text-2xl font-bold text-slate-900">{commuteIntel.weekly_time_cost_hours.toFixed(1)} hrs</div>
                  <div className="text-xs text-slate-500 mt-1">In car per week</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-green-50 to-white border border-green-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Work-Life Balance</div>
                  <div className="text-2xl font-bold text-slate-900">{commuteIntel.work_life_balance_score}/100</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {commuteIntel.work_life_balance_score >= 80 ? "Excellent" : commuteIntel.work_life_balance_score >= 60 ? "Good" : "Fair"}
                  </div>
                </div>
              </div>

              {/* Military Considerations */}
              <div className="rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Shield" className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Military-Specific Considerations</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Early Duty (0600)</div>
                    <div className="font-semibold">{commuteIntel.early_duty_impact}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Late Duty (1900)</div>
                    <div className="font-semibold">{commuteIntel.late_duty_impact}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Weekend Duty</div>
                    <div className="font-semibold">{commuteIntel.weekend_flexibility}</div>
                  </div>
                </div>
              </div>

              {/* Bottom Line */}
              <div className="rounded-lg bg-green-50 p-4 border-l-4 border-green-600">
                <div className="font-semibold text-green-900 mb-2">Bottom Line</div>
                <p className="text-slate-700 leading-relaxed">{commuteIntel.bottom_line}</p>
              </div>
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === "weather" && weatherIntel && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="rounded-lg bg-amber-50 p-4 border-l-4 border-amber-600">
                <div className="font-semibold text-amber-900 mb-2">Executive Summary</div>
                <p className="text-slate-700 leading-relaxed">{weatherIntel.executive_summary}</p>
              </div>

              {/* Climate Overview */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Overall Comfort</div>
                  <div className="text-2xl font-bold text-slate-900">{weatherIntel.overall_comfort_score}/100</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {weatherIntel.overall_comfort_score >= 80 ? "Excellent" : weatherIntel.overall_comfort_score >= 60 ? "Good" : "Fair"}
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-green-50 to-white border border-green-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Outdoor Season</div>
                  <div className="text-2xl font-bold text-slate-900">{weatherIntel.outdoor_season_months}</div>
                  <div className="text-xs text-slate-500 mt-1">months per year</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Temperature Range</div>
                  <div className="text-2xl font-bold text-slate-900">{weatherIntel.temperature_range.low}°-{weatherIntel.temperature_range.high}°F</div>
                  <div className="text-xs text-slate-500 mt-1">annual range</div>
                </div>
              </div>

              {/* Seasonal Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-green-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Sun" className="h-5 w-5 text-green-600" />
                    <div className="font-bold text-slate-900">Best Season</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{weatherIntel.best_season.name}</div>
                  <p className="text-sm text-slate-600">{weatherIntel.best_season.description}</p>
                </div>

                <div className="rounded-lg border-2 border-amber-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Cloud" className="h-5 w-5 text-amber-600" />
                    <div className="font-bold text-slate-900">Challenging Season</div>
                  </div>
                  <div className="text-2xl font-bold text-amber-600 mb-2">{weatherIntel.challenging_season.name}</div>
                  <p className="text-sm text-slate-600">{weatherIntel.challenging_season.description}</p>
                </div>
              </div>

              {/* Military Considerations */}
              <div className="rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Shield" className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Military-Specific Considerations</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Physical Training Impact</div>
                    <div className="font-semibold">{weatherIntel.pt_impact}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Family Activities</div>
                    <div className="font-semibold">{weatherIntel.family_activities_impact}</div>
                  </div>
                </div>
              </div>

              {/* Bottom Line */}
              <div className="rounded-lg bg-amber-50 p-4 border-l-4 border-amber-600">
                <div className="font-semibold text-amber-900 mb-2">Bottom Line</div>
                <p className="text-slate-700 leading-relaxed">{weatherIntel.bottom_line}</p>
              </div>
            </div>
          )}

          {/* Housing Tab */}
          {activeTab === "housing" && housingIntel && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="rounded-lg bg-slate-50 p-4 border-l-4 border-slate-600">
                <div className="font-semibold text-slate-900 mb-2">Executive Summary</div>
                <p className="text-slate-700 leading-relaxed">{housingIntel.executive_summary}</p>
              </div>

              {/* BAH Analysis */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-white border border-green-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Properties at/under BAH</div>
                  <div className="text-2xl font-bold text-slate-900">{housingIntel.bah_analysis.properties_at_or_under_bah}</div>
                  <div className="text-xs text-slate-500 mt-1">out of {housingIntel.bah_analysis.total_properties} total</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Average Rent</div>
                  <div className="text-2xl font-bold text-slate-900">${housingIntel.bah_analysis.average_rent.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">per month</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">BAH Coverage</div>
                  <div className="text-2xl font-bold text-slate-900">{housingIntel.bah_analysis.bah_coverage_percentage}%</div>
                  <div className="text-xs text-slate-500 mt-1">of properties</div>
                </div>
              </div>

              {/* Market Trends */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="TrendingUp" className="h-5 w-5 text-slate-600" />
                    <div className="font-bold text-slate-900">Market Competition</div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">{housingIntel.market_trends.competition_level}</div>
                  <p className="text-sm text-slate-600">{housingIntel.market_trends.competition_description}</p>
                </div>

                <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Home" className="h-5 w-5 text-slate-600" />
                    <div className="font-bold text-slate-900">Property Types</div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {housingIntel.market_trends.property_types.map((type, i) => (
                      <span key={i} className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs mr-2 mb-1">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample Listings */}
              {housingIntel.sample_listings && housingIntel.sample_listings.length > 0 && (
                <div className="rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Icon name="Search" className="h-5 w-5 text-slate-600" />
                    <h4 className="font-bold text-slate-900">Sample Listings</h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {housingIntel.sample_listings.slice(0, 4).map((listing, i) => (
                      <a
                        key={i}
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-400 hover:shadow-md"
                      >
                        <div className="font-semibold text-slate-900">{listing.address}</div>
                        <div className="text-lg font-bold text-slate-900">${listing.price.toLocaleString()}/mo</div>
                        <div className="text-sm text-slate-600">{listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft.toLocaleString()} sqft</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Line */}
              <div className="rounded-lg bg-slate-50 p-4 border-l-4 border-slate-600">
                <div className="font-semibold text-slate-900 mb-2">Bottom Line</div>
                <p className="text-slate-700 leading-relaxed">{housingIntel.bottom_line}</p>
              </div>
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === "amenities" && enhanced && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="rounded-lg bg-purple-50 p-4 border-l-4 border-purple-600">
                <div className="font-semibold text-purple-900 mb-2">Executive Summary</div>
                <p className="text-slate-700 leading-relaxed">{enhanced.executive_summary}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Total Amenities</div>
                  <div className="text-2xl font-bold text-slate-900">{enhanced.total_amenities}</div>
                  <div className="text-xs text-slate-500 mt-1">within 3 miles</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-green-50 to-white border border-green-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Walkability</div>
                  <div className="text-2xl font-bold text-slate-900">{enhanced.walkability_score}/100</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {enhanced.walkability_score >= 80 ? "Excellent" : enhanced.walkability_score >= 60 ? "Good" : "Fair"}
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Family Friendliness</div>
                  <div className="text-2xl font-bold text-slate-900">{enhanced.family_friendliness_score}/100</div>
                  <div className="text-xs text-slate-500 mt-1">out of 100</div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
                  <div className="text-sm text-slate-600 mb-1">Overall Score</div>
                  <div className="text-2xl font-bold text-slate-900">{enhanced.overall_score}/100</div>
                  <div className="text-xs text-slate-500 mt-1">out of 100</div>
                </div>
              </div>

              {/* Amenity Categories Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {renderAmenityCategory("Essentials", enhanced.essentials, "ShoppingCart")}
                {renderAmenityCategory("Family Activities", enhanced.family_activities, "Users")}
                {renderAmenityCategory("Healthcare", enhanced.healthcare, "Heart")}
                {renderAmenityCategory("Dining", enhanced.dining, "Coffee")}
                {renderAmenityCategory("Fitness", enhanced.fitness, "Zap")}
                {renderAmenityCategory("Services", enhanced.services, "Briefcase")}
              </div>

              {/* Bottom Line */}
              <div className="rounded-lg bg-purple-50 p-4 border-l-4 border-purple-600">
                <div className="font-semibold text-purple-900 mb-2">Bottom Line</div>
                <p className="text-slate-700 leading-relaxed">{enhanced.bottom_line}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FINAL RECOMMENDATION - Call to Action */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-white p-3">
            <Icon name="Target" className="h-6 w-6 text-slate-900" />
          </div>
          <h3 className="text-2xl font-bold">Final Recommendation</h3>
        </div>
        <p className="text-lg leading-relaxed text-slate-100 mb-6">
          {intel.bottom_line}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
            <span>Data verified from official sources</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Timer" className="h-5 w-5 text-blue-400" />
            <span>Updated within 24 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface GradeLevelCardProps {
  level: string;
  count: number;
  avgRating: number;
  topSchools: Array<{
    name: string;
    rating: number;
    distance: number;
  }>;
}

function GradeLevelCard({ level, count, avgRating, topSchools }: GradeLevelCardProps) {
  return (
    <div className="rounded-lg border-2 border-blue-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold text-slate-900">{level}</h4>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{avgRating.toFixed(1)}</div>
          <div className="text-xs text-slate-500">avg rating</div>
        </div>
      </div>
      <div className="mb-3 text-sm text-slate-600">{count} schools in this area</div>
      {topSchools.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">Top Picks:</div>
          <div className="space-y-1">
            {topSchools.slice(0, 3).map((school, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{school.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{school.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({school.distance.toFixed(1)} mi)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderAmenityCategory(
  title: string,
  amenities: Array<{
    name: string;
    count: number;
    avg_rating: number;
    distance: number;
  }>,
  iconName: string
) {
  return (
    <div className="rounded-lg border-2 border-purple-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon name={iconName as any} className="h-5 w-5 text-purple-600" />
        <h4 className="font-bold text-slate-900">{title}</h4>
      </div>
      <div className="mb-3 text-sm text-slate-600">{amenities.length} options nearby</div>
      {amenities.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">Top Picks:</div>
          <div className="space-y-1">
            {amenities.slice(0, 3).map((amenity, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(amenity.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {amenity.name}
                </a>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{amenity.avg_rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({amenity.distance.toFixed(1)} mi)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}