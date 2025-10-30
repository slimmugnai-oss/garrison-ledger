/**
 * WEATHER INTELLIGENCE SECTION
 * Displays comprehensive weather and climate analysis
 */

"use client";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
}

export default function WeatherIntelligenceSection({ neighborhood }: Props) {
  const weatherIntel = neighborhood.payload.weather_intelligence;

  if (!weatherIntel) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Icon name="Sun" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Weather intelligence not available for this neighborhood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Comfort Score */}
      <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
        <div className="text-sm text-slate-600">Overall Comfort Score</div>
        <div className="text-4xl font-bold text-amber-600">{weatherIntel.overall_comfort_score}</div>
        <div className="text-sm text-slate-500">out of 100</div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600"
            style={{ width: `${weatherIntel.overall_comfort_score}%` }}
          />
        </div>
      </div>

      {/* Seasonal Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900">Seasonal Guide</h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {weatherIntel.seasonal_breakdown.map((season) => (
            <div key={season.season} className="rounded-lg border-2 border-slate-200 bg-white p-4">
              <div className="mb-2 font-bold text-slate-900">{season.season}</div>
              <div className="mb-2 text-2xl font-bold text-amber-600">{season.avg_temp_range}</div>
              <p className="mb-3 text-sm text-slate-600">{season.conditions}</p>
              <div className="text-xs text-slate-500">
                <div className="mb-1 font-semibold">Activities:</div>
                <div>{season.outdoor_activities}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best/Worst Months */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
            <div className="font-bold text-green-900">Best Months</div>
          </div>
          <div className="mb-2 text-xl font-semibold text-slate-900">
            {weatherIntel.best_months.join(", ")}
          </div>
          <p className="text-sm text-slate-700">Ideal weather for outdoor activities and comfortable living</p>
        </div>

        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="XCircle" className="h-5 w-5 text-red-600" />
            <div className="font-bold text-red-900">Challenging Months</div>
          </div>
          <div className="mb-2 text-xl font-semibold text-slate-900">
            {weatherIntel.worst_months.join(", ")}
          </div>
          <p className="text-sm text-slate-700">Prepare for extreme temperatures or challenging conditions</p>
        </div>
      </div>

      {/* Extreme Weather Risks */}
      {weatherIntel.extreme_weather_risks.length > 0 && (
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="AlertTriangle" className="h-6 w-6 text-amber-600" />
            <h4 className="font-bold text-slate-900">Extreme Weather Risks</h4>
          </div>
          <div className="space-y-4">
            {weatherIntel.extreme_weather_risks.map((risk, i) => (
              <div key={i} className="rounded-lg border border-amber-200 bg-white p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="font-semibold text-slate-900">{risk.type}</div>
                  <div
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      risk.risk_level === "high"
                        ? "bg-red-100 text-red-700"
                        : risk.risk_level === "moderate"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {risk.risk_level.toUpperCase()}
                  </div>
                </div>
                <div className="mb-2 text-sm text-slate-600">Season: {risk.season}</div>
                <p className="text-sm text-slate-700">{risk.preparation_needed}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outdoor Activity Calendar */}
      <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
        <h4 className="mb-4 font-bold text-slate-900">Outdoor Activity Calendar</h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="mb-1 text-sm text-slate-600">Pool Season</div>
            <div className="text-xl font-bold text-blue-600">{weatherIntel.pool_season}</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-600">Park Season</div>
            <div className="text-xl font-bold text-green-600">{weatherIntel.park_season}</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-600">Outdoor Months</div>
            <div className="text-xl font-bold text-amber-600">{weatherIntel.outdoor_season_months} months</div>
          </div>
        </div>
      </div>

      {/* Military Family Considerations */}
      <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-6">
        <div className="mb-2 font-semibold text-blue-900">Military Family Considerations</div>
        <p className="leading-relaxed text-slate-700">{weatherIntel.military_family_considerations}</p>
      </div>
    </div>
  );
}

