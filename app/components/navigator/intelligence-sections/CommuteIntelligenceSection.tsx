/**
 * COMMUTE INTELLIGENCE SECTION
 * Displays comprehensive commute analysis
 */

"use client";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
}

export default function CommuteIntelligenceSection({ neighborhood }: Props) {
  const commuteIntel = neighborhood.payload.commute_intelligence;

  if (!commuteIntel) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Icon name="Truck" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Commute intelligence not available for this neighborhood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Traffic Patterns */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
            <div className="font-bold text-slate-900">Best Departure Time</div>
          </div>
          <div className="mb-2 text-4xl font-bold text-green-600">
            {commuteIntel.best_departure_time.hour}:
            {commuteIntel.best_departure_time.minutes.toString().padStart(2, "0")} AM
          </div>
          <div className="mb-3 text-2xl font-semibold text-slate-900">
            {commuteIntel.best_departure_time.minutes} min
          </div>
          <p className="text-sm text-slate-600">{commuteIntel.best_departure_time.description}</p>
        </div>

        <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
            <div className="font-bold text-slate-900">Avoid This Time</div>
          </div>
          <div className="mb-2 text-4xl font-bold text-red-600">
            {commuteIntel.worst_departure_time.hour > 12
              ? `${commuteIntel.worst_departure_time.hour - 12}:${commuteIntel.worst_departure_time.minutes.toString().padStart(2, "0")} PM`
              : `${commuteIntel.worst_departure_time.hour}:${commuteIntel.worst_departure_time.minutes.toString().padStart(2, "0")} AM`}
          </div>
          <div className="mb-3 text-2xl font-semibold text-slate-900">
            {commuteIntel.worst_departure_time.minutes} min
          </div>
          <p className="text-sm text-slate-600">{commuteIntel.worst_departure_time.description}</p>
        </div>
      </div>

      {/* Cost & Impact Analysis */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6">
          <div className="mb-2 text-sm text-slate-600">Annual Fuel Cost</div>
          <div className="text-3xl font-bold text-slate-900">
            ${commuteIntel.annual_fuel_cost.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Based on {commuteIntel.primary_route_miles.toFixed(1)} mi route
          </div>
        </div>

        <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
          <div className="mb-2 text-sm text-slate-600">Weekly Time Cost</div>
          <div className="text-3xl font-bold text-slate-900">
            {commuteIntel.weekly_time_cost_hours.toFixed(1)} hrs
          </div>
          <div className="mt-1 text-xs text-slate-500">In car per week</div>
        </div>

        <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
          <div className="mb-2 text-sm text-slate-600">Work-Life Balance</div>
          <div className="text-3xl font-bold text-slate-900">
            {commuteIntel.work_life_balance_score}/100
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {commuteIntel.work_life_balance_score >= 80
              ? "Excellent"
              : commuteIntel.work_life_balance_score >= 60
                ? "Good"
                : "Fair"}
          </div>
        </div>
      </div>

      {/* Military Considerations */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="Shield" className="h-6 w-6" />
          <h4 className="text-lg font-bold">Military-Specific Considerations</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="mb-1 text-sm text-slate-300">Early Duty (0600)</div>
            <div className="font-semibold">{commuteIntel.early_duty_impact}</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-300">Late Duty (1900)</div>
            <div className="font-semibold">{commuteIntel.late_duty_impact}</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-300">Weekend Duty</div>
            <div className="font-semibold">{commuteIntel.weekend_flexibility}</div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="rounded-lg border-l-4 border-green-600 bg-green-50 p-6">
        <div className="mb-2 font-semibold text-green-900">Bottom Line</div>
        <p className="leading-relaxed text-slate-700">{commuteIntel.bottom_line}</p>
      </div>
    </div>
  );
}

