"use client";

/**
 * LES SUMMARY STICKY
 * 
 * Sticky sidebar summary panel showing:
 * - Live totals (Allowances, Taxes, Deductions, Net Pay)
 * - Variance banner with confidence meter
 * - Provenance popover (data sources)
 * - Primary actions (Save, Print/Export)
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { Tier } from "@/lib/auth/subscription";
import { formatCurrency } from "@/lib/utils/currency";

interface LesSummaryStickyProps {
  allowancesTotal: number; // in cents
  taxesTotal: number; // in cents
  deductionsTotal: number; // in cents
  netPay: number; // in cents
  variance: number | null; // in cents
  variancePercent?: number;
  confidence?: "excellent" | "good" | "fair" | "needs_work";
  flagCount?: number;
  tier: Tier;
  onSave: () => void;
  onPrint: () => void;
  saving?: boolean;
}

export default function LesSummarySticky({
  allowancesTotal,
  taxesTotal,
  deductionsTotal,
  netPay,
  variance,
  variancePercent,
  confidence = "good",
  flagCount = 0,
  tier,
  onSave,
  onPrint,
  saving = false,
}: LesSummaryStickyProps) {
  const [showProvenance, setShowProvenance] = useState(false);
  const router = useRouter();

  const isPremium = tier === "premium" || tier === "staff";

  // Variance color based on confidence
  const varianceColor =
    confidence === "excellent"
      ? "bg-green-50 border-green-200 text-green-800"
      : confidence === "good"
        ? "bg-blue-50 border-blue-200 text-blue-800"
        : confidence === "fair"
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-red-50 border-red-200 text-red-800";

  const confidenceLabel = {
    excellent: "Excellent Match",
    good: "Good Match",
    fair: "Fair Match",
    needs_work: "Needs Review",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Summary</h3>
          <button
            onClick={() => setShowProvenance(!showProvenance)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="View data sources"
          >
            <Icon name="Info" className="h-3.5 w-3.5" />
            Sources
          </button>
        </div>
      </div>

      {/* Provenance Popover */}
      {showProvenance && (
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">Official DFAS Pay Tables</p>
                <p className="text-slate-600">Base pay, BAH, BAS rates (verified 2025)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">IRS Tax Constants</p>
                <p className="text-slate-600">FICA (6.2%), Medicare (1.45%) for 2025</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">State Tax Authorities</p>
                <p className="text-slate-600">51 states + territories (updated 2025)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-3 px-6 py-4">
        {/* Allowances */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="DollarSign" className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-slate-700">Allowances</span>
          </div>
          <span className="font-semibold text-green-700">{formatCurrency(allowancesTotal)}</span>
        </div>

        {/* Taxes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Landmark" className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-slate-700">Taxes</span>
          </div>
          <span className="font-semibold text-red-700">-{formatCurrency(taxesTotal)}</span>
        </div>

        {/* Deductions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Calculator" className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-slate-700">Deductions</span>
          </div>
          <span className="font-semibold text-orange-700">-{formatCurrency(deductionsTotal)}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">Net Pay</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(netPay)}</span>
          </div>
        </div>
      </div>

      {/* Variance Banner */}
      {variance !== null && (
        <div className={`border-t px-6 py-4 ${varianceColor}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name={confidence === "excellent" || confidence === "good" ? "CheckCircle" : "AlertTriangle"}
                  className="h-4 w-4"
                />
                <span className="text-sm font-semibold">{confidenceLabel[confidence]}</span>
              </div>
              <p className="text-xs opacity-90">
                {variance === 0
                  ? "Your pay matches expected amounts"
                  : variance > 0
                    ? `You may be owed ${formatCurrency(Math.abs(variance))}`
                    : `Possible overpayment of ${formatCurrency(Math.abs(variance))}`}
              </p>
              {variancePercent !== undefined && (
                <p className="text-xs opacity-75 mt-1">
                  {Math.abs(variancePercent).toFixed(1)}% difference from expected
                </p>
              )}
            </div>
            {flagCount > 0 && (
              <Badge variant="warning" className="flex-shrink-0">
                {flagCount} {flagCount === 1 ? "flag" : "flags"}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 border-t border-slate-200 px-6 py-4">
        {isPremium ? (
          <>
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name={saving ? "RefreshCw" : "CheckCircle"} className={`h-5 w-5 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving..." : "Save Audit"}
            </button>
            <button
              onClick={onPrint}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon name="Printer" className="h-4 w-4" />
              Print / Export PDF
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/dashboard/upgrade?feature=les-auditor")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Icon name="Crown" className="h-5 w-5" />
            Upgrade to Save Audits
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <p className="text-xs text-slate-600">
          <Icon name="Shield" className="inline-block h-3.5 w-3.5 mr-1" />
          Your LES data is encrypted and never stored
        </p>
      </div>
    </div>
  );
}

