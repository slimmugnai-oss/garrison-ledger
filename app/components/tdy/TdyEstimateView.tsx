/**
 * TDY ESTIMATE VIEW
 * 
 * Displays per-diem calculations and totals
 */

'use client';

import Icon from '../ui/Icon';
import type { EstimateTotals } from '@/app/types/tdy';

interface Props {
  totals: EstimateTotals;
}

export default function TdyEstimateView({ totals }: Props) {
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Reimbursement Estimate</h3>
        <p className="text-sm text-gray-600 mt-1">
          Based on GSA per-diem rates and uploaded receipts
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* M&IE */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">M&IE (Meals & Incidentals)</p>
              <p className="text-xs text-gray-600">
                {totals.days.filter(d => d.is_travel_day).length} travel days at 75%, rest at 100%
              </p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCents(totals.mie_total_cents)}
          </p>
        </div>

        {/* Lodging */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Home" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Lodging (Capped + Taxes)</p>
              <p className="text-xs text-gray-600">
                Room rate capped at per-diem, taxes reimbursed fully
              </p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCents(totals.lodging_allowed_cents)}
          </p>
        </div>

        {/* Mileage */}
        {totals.mileage_total_cents > 0 && (
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="MapPin" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mileage</p>
                <p className="text-xs text-gray-600">$0.67 per mile (2025 rate)</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCents(totals.mileage_total_cents)}
            </p>
          </div>
        )}

        {/* Misc */}
        {totals.misc_total_cents > 0 && (
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon name="File" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Miscellaneous</p>
                <p className="text-xs text-gray-600">Parking, tolls, baggage, etc.</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCents(totals.misc_total_cents)}
            </p>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="p-6 bg-blue-50 border-t-2 border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-blue-900">Total Reimbursement</span>
          <span className="text-3xl font-bold text-blue-600">
            {formatCents(totals.grand_total_cents)}
          </span>
        </div>
      </div>

      {/* Day-by-Day (Collapsed) */}
      <details className="border-t border-gray-200">
        <summary className="p-4 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
          Day-by-Day Breakdown ({totals.days.length} days)
        </summary>
        <div className="p-4 bg-gray-50 space-y-2">
          {totals.days.map((day, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {day.is_travel_day && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    75% M&IE
                  </span>
                )}
              </span>
              <span className="text-gray-900 font-medium">
                {formatCents(day.mie_allowed_cents)}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

