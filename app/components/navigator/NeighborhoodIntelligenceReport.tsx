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

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

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
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-blue-400 hover:shadow-lg" onClick={() => toggleSection("schools")}>
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
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-green-400 hover:shadow-lg" onClick={() => toggleSection("commute")}>
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
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-slate-400 hover:shadow-lg" onClick={() => toggleSection("housing")}>
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
          <div className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-amber-400 hover:shadow-lg" onClick={() => toggleSection("weather")}>
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

      {/* DETAILED INTELLIGENCE - Expandable Sections */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Detailed Intelligence</h3>
        <p className="text-sm text-slate-600">Click any section to expand for comprehensive analysis</p>

        {/* Schools Section */}
        {schoolsIntel && (
          <IntelligenceSection
            icon="GraduationCap"
            title="Schools Intelligence"
            subtitle={`${schoolsIntel.total_schools} schools • Avg ${schoolsIntel.overall_avg_rating.toFixed(1)}/10 rating`}
            isExpanded={expandedSections.has("schools")}
            onToggle={() => toggleSection("schools")}
            color="blue"
          >
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
          </IntelligenceSection>
        )}

        {/* Commute Section */}
        {commuteIntel && (
          <IntelligenceSection
            icon="Truck"
            title="Commute Intelligence"
            subtitle={`${commuteIntel.work_life_balance_score}/100 work-life balance • ${commuteIntel.primary_route_miles.toFixed(1)} miles`}
            isExpanded={expandedSections.has("commute")}
            onToggle={() => toggleSection("commute")}
            color="green"
          >
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
          </IntelligenceSection>
        )}

        {/* Weather Section */}
        {weatherIntel && (
          <IntelligenceSection
            icon="Sun"
            title="Weather & Climate Intelligence"
            subtitle={`${weatherIntel.overall_comfort_score}/100 comfort • ${weatherIntel.outdoor_season_months} months outdoor-friendly`}
            isExpanded={expandedSections.has("weather")}
            onToggle={() => toggleSection("weather")}
            color="amber"
          >
            <div className="space-y-6">
              {/* Seasonal Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {weatherIntel.seasonal_breakdown.map((season) => (
                  <div key={season.season} className="rounded-lg border-2 border-slate-200 bg-white p-4">
                    <div className="mb-2 font-bold text-slate-900">{season.season}</div>
                    <div className="text-2xl font-bold text-amber-600 mb-2">{season.avg_temp_range}</div>
                    <p className="text-sm text-slate-600 mb-3">{season.conditions}</p>
                    <div className="text-xs text-slate-500">
                      <div className="font-semibold mb-1">Activities:</div>
                      <div>{season.outdoor_activities}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best/Worst Months */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <div className="font-bold text-green-900">Best Months</div>
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mb-2">
                    {weatherIntel.best_months.join(", ")}
                  </div>
                  <p className="text-sm text-slate-700">Ideal weather for outdoor activities and comfortable living</p>
                </div>

                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="XCircle" className="h-5 w-5 text-red-600" />
                    <div className="font-bold text-red-900">Challenging Months</div>
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mb-2">
                    {weatherIntel.worst_months.join(", ")}
                  </div>
                  <p className="text-sm text-slate-700">Prepare for extreme temperatures or challenging conditions</p>
                </div>
              </div>

              {/* Extreme Weather Risks */}
              {weatherIntel.extreme_weather_risks.length > 0 && (
                <div className="rounded-lg bg-amber-50 border-2 border-amber-200 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Icon name="AlertTriangle" className="h-6 w-6 text-amber-600" />
                    <h4 className="font-bold text-slate-900">Extreme Weather Risks</h4>
                  </div>
                  <div className="space-y-4">
                    {weatherIntel.extreme_weather_risks.map((risk, i) => (
                      <div key={i} className="rounded-lg bg-white p-4 border border-amber-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-slate-900">{risk.type}</div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            risk.risk_level === "high" ? "bg-red-100 text-red-700" :
                            risk.risk_level === "moderate" ? "bg-amber-100 text-amber-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {risk.risk_level.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">Season: {risk.season}</div>
                        <p className="text-sm text-slate-700">{risk.preparation_needed}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </IntelligenceSection>
        )}

        {/* Housing Section */}
        {housingIntel && (
          <IntelligenceSection
            icon="Home"
            title="Housing Market Intelligence"
            subtitle={`${housingIntel.bah_analysis.properties_at_or_under_bah} properties at/under BAH • ${housingIntel.market_trends.competition_level} competition`}
            isExpanded={expandedSections.has("housing")}
            onToggle={() => toggleSection("housing")}
            color="purple"
          >
            <div className="space-y-6">
              {/* BAH Optimization - Hero */}
              <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white">
                <div className="mb-4">
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-1">BAH Optimization</div>
                  <div className="text-3xl font-bold">{housingIntel.bah_analysis.properties_at_or_under_bah} Properties At/Under BAH</div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="text-sm text-slate-300 mb-1">Sweet Spot Range</div>
                    <div className="font-bold">
                      ${(housingIntel.bah_analysis.sweet_spot_range.min_cents / 100).toFixed(0)} - ${(housingIntel.bah_analysis.sweet_spot_range.max_cents / 100).toFixed(0)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="text-sm text-slate-300 mb-1">Avg Savings</div>
                    <div className="font-bold">
                      {housingIntel.bah_analysis.avg_savings_cents !== null
                        ? housingIntel.bah_analysis.avg_savings_cents >= 0
                          ? `$${Math.abs(housingIntel.bah_analysis.avg_savings_cents / 100).toLocaleString()}/mo`
                          : `-$${Math.abs(housingIntel.bah_analysis.avg_savings_cents / 100).toLocaleString()}/mo`
                        : "Varies"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4">
                    <div className="text-sm text-slate-300 mb-1">Strategy</div>
                    <div className="font-bold text-sm">{housingIntel.bah_analysis.recommendation.split(".")[0]}</div>
                  </div>
                </div>
              </div>

              {/* Sample Listings */}
              {neighborhood.payload.sample_listings && neighborhood.payload.sample_listings.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-lg">Available Properties</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {neighborhood.payload.sample_listings.map((listing, i) => (
                      <a
                        key={i}
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-lg border-2 border-slate-200 bg-white overflow-hidden transition-all hover:border-blue-400 hover:shadow-lg"
                      >
                        {listing.photo && (
                          <div className="h-48 w-full bg-gray-200 overflow-hidden">
                            <img
                              src={listing.photo}
                              alt={listing.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            ${(listing.price_cents / 100).toLocaleString()}/mo
                          </div>
                          <h5 className="font-semibold text-slate-900 mb-2 line-clamp-2">{listing.title}</h5>
                          {(listing.bedrooms || listing.bathrooms) && (
                            <div className="text-sm text-slate-600 mb-3">
                              {listing.bedrooms && `${listing.bedrooms} bed`}
                              {listing.bedrooms && listing.bathrooms && " • "}
                              {listing.bathrooms && `${listing.bathrooms} bath`}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                            <span>View Listing</span>
                            <Icon name="ExternalLink" className="h-4 w-4" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Trends */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
                  <div className="text-sm text-slate-600 mb-1">Price Trend</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    housingIntel.market_trends.price_trend === "rising" ? "text-red-600" :
                    housingIntel.market_trends.price_trend === "falling" ? "text-green-600" :
                    "text-slate-900"
                  }`}>
                    {housingIntel.market_trends.price_trend.charAt(0).toUpperCase() + housingIntel.market_trends.price_trend.slice(1)}
                  </div>
                </div>

                <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
                  <div className="text-sm text-slate-600 mb-1">Inventory</div>
                  <div className="text-2xl font-bold text-slate-900 mb-1 capitalize">
                    {housingIntel.market_trends.inventory_level}
                  </div>
                </div>

                <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
                  <div className="text-sm text-slate-600 mb-1">Your Leverage</div>
                  <div className="text-2xl font-bold text-slate-900 mb-1 capitalize">
                    {housingIntel.market_trends.negotiation_leverage}
                  </div>
                </div>
              </div>

              {/* Property Types */}
              <div className="rounded-lg bg-white border-2 border-slate-200 p-6">
                <h4 className="font-bold text-slate-900 mb-4">Property Type Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(housingIntel.property_types).map(([type, data]) => {
                    const totalCount = Object.values(housingIntel.property_types).reduce((sum, t) => sum + t.count, 0);
                    const percentage = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;
                    const label = type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    
                    if (data.count === 0) return null;
                    
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{label}</span>
                          <span className="text-sm text-slate-600">{data.count} available • {percentage}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Military-Friendly Features */}
              <div className="rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Shield" className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Military-Friendly Features</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Pet-Friendly</div>
                    <div className="text-2xl font-bold">{housingIntel.pet_friendly_count}</div>
                    <div className="text-xs text-slate-400">properties</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Utilities Included</div>
                    <div className="text-2xl font-bold">{housingIntel.utilities_included_count}</div>
                    <div className="text-xs text-slate-400">properties</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">With Yard</div>
                    <div className="text-2xl font-bold">{housingIntel.yard_count}</div>
                    <div className="text-xs text-slate-400">properties</div>
                  </div>
                </div>
              </div>

              {/* Bottom Line */}
              <div className="rounded-lg bg-slate-50 p-4 border-l-4 border-slate-600">
                <div className="font-semibold text-slate-900 mb-2">Bottom Line</div>
                <p className="text-slate-700 leading-relaxed">{housingIntel.bottom_line}</p>
              </div>
            </div>
          </IntelligenceSection>
        )}

        {/* Amenities Section */}
        {enhanced && (
          <IntelligenceSection
            icon="MapPin"
            title="Local Amenities (30+ Categories)"
            subtitle={`${enhanced.total_amenities} amenities within 3 miles • Walkability ${enhanced.walkability_score}/100`}
            isExpanded={expandedSections.has("amenities")}
            onToggle={() => toggleSection("amenities")}
            color="indigo"
          >
            <div className="space-y-6">
              {/* Lifestyle Scores */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 p-6">
                  <div className="text-sm text-slate-600 mb-2">Walkability</div>
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{enhanced.walkability_score}</div>
                  <div className="text-xs text-slate-500">out of 100</div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${enhanced.walkability_score}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-green-50 to-white border-2 border-green-200 p-6">
                  <div className="text-sm text-slate-600 mb-2">Family-Friendliness</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">{enhanced.family_friendliness_score}</div>
                  <div className="text-xs text-slate-500">out of 100</div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      style={{ width: `${enhanced.family_friendliness_score}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 p-6">
                  <div className="text-sm text-slate-600 mb-2">Overall Amenities</div>
                  <div className="text-4xl font-bold text-slate-700 mb-2">{enhanced.overall_score}</div>
                  <div className="text-xs text-slate-500">out of 100</div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full"
                      style={{ width: `${enhanced.overall_score}%` }}
                    />
                  </div>
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
                {renderAmenityCategory("Spouse Employment", enhanced.spouse_employment, "TrendingUp")}
                {renderAmenityCategory("Pets", enhanced.pets, "Home")}
                {renderAmenityCategory("Community", enhanced.community, "Users")}
                {renderAmenityCategory("Home & Auto", enhanced.home_auto, "Settings")}
              </div>
            </div>
          </IntelligenceSection>
        )}
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

// Expandable Section Component
interface IntelligenceSectionProps {
  icon: string;
  title: string;
  subtitle: string;
  isExpanded: boolean;
  onToggle: () => void;
  color: "blue" | "green" | "amber" | "purple" | "indigo";
  children: React.ReactNode;
}

function IntelligenceSection({ icon, title, subtitle, isExpanded, onToggle, color, children }: IntelligenceSectionProps) {
  const colorClasses = {
    blue: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-600", hover: "hover:border-blue-400" },
    green: { border: "border-green-200", bg: "bg-green-50", text: "text-green-600", hover: "hover:border-green-400" },
    amber: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-600", hover: "hover:border-amber-400" },
    purple: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-700", hover: "hover:border-slate-400" },
    indigo: { border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-600", hover: "hover:border-indigo-400" },
  };

  const colors = colorClasses[color];

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${isExpanded ? colors.bg : "bg-white"} overflow-hidden transition-all ${colors.hover}`}>
      <button
        onClick={onToggle}
        className="w-full p-6 text-left transition-colors hover:bg-slate-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`rounded-full ${colors.bg} p-3`}>
            <Icon name={icon as any} className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          className="h-6 w-6 text-slate-400 flex-shrink-0"
        />
      </button>
      {isExpanded && (
        <div className="p-6 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

// Grade Level Card Component
interface GradeLevelCardProps {
  level: string;
  count: number;
  avgRating: number;
  topSchools: Array<{ name: string; rating: number; distance_mi?: number }>;
}

function GradeLevelCard({ level, count, avgRating, topSchools }: GradeLevelCardProps) {
  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-bold text-slate-900">{level}</div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{avgRating.toFixed(1)}</div>
          <div className="text-xs text-slate-500">avg rating</div>
        </div>
      </div>
      <div className="text-sm text-slate-600 mb-3">{count} schools available</div>
      {topSchools.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 uppercase">Top Picks:</div>
          {topSchools.slice(0, 2).map((school, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{school.name}</span>
                <span className="text-blue-600 font-bold">{school.rating.toFixed(1)}/10</span>
              </div>
              <div className="text-xs text-slate-500">{school.distance_mi ? `${school.distance_mi.toFixed(1)} mi away` : 'Nearby'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Amenity Category Renderer
function renderAmenityCategory(title: string, category: any, iconName: string) {
  if (!category || category.count === 0) return null;

  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={iconName as any} className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-slate-900">{title}</span>
        </div>
        <span className="text-2xl font-bold text-indigo-600">{category.count}</span>
      </div>
      {category.top_picks && category.top_picks.length > 0 && (
        <div className="space-y-2">
          {category.top_picks.slice(0, 2).map((place: any, i: number) => (
            <a
              key={i}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.name + (place.address ? " " + place.address : "")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm border-t border-slate-100 pt-2 transition-colors hover:bg-blue-50 rounded px-2 -mx-2 py-2"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-900 line-clamp-1">{place.name}</span>
                <span className="flex-shrink-0 text-amber-600 font-bold">{place.rating?.toFixed(1) || "N/A"}</span>
              </div>
              <div className="text-xs text-slate-500 mb-1">{place.distance_mi?.toFixed(1)} mi • {place.reviews || 0} reviews</div>
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <span>Open in Google Maps</span>
                <Icon name="ExternalLink" className="h-3 w-3" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
