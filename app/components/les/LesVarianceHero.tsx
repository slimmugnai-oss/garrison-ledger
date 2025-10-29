"use client";

/**
 * LES VARIANCE HERO
 * 
 * Prominent display of Total Pay Variance - the main feature of LES Auditor
 * Shows variance amount, status, quick stats, and month/year selector
 */

import React from "react";
import Icon from "@/app/components/ui/Icon";
import type { PayFlag } from "@/app/types/les";

interface LesVarianceHeroProps {
  variance: number | null; // in cents, null if premium feature locked
  flags: PayFlag[];
  month: number | null;
  year: number | null;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  netPay?: number; // in cents, optional
  isPremium: boolean;
  loading?: boolean;
}

export default function LesVarianceHero({
  variance,
  flags,
  month,
  year,
  onMonthChange,
  onYearChange,
  netPay,
  isPremium,
  loading = false,
}: LesVarianceHeroProps) {
  // Calculate flag counts
  const redFlags = flags.filter(f => f.severity === "red");
  const yellowFlags = flags.filter(f => f.severity === "yellow");
  const greenFlags = flags.filter(f => f.severity === "green");

  // Determine status
  const getStatus = () => {
    if (loading) return { text: "Computing...", color: "text-slate-600", icon: "RefreshCw" };
    if (!isPremium) return { text: "Upgrade to see variance", color: "text-slate-600", icon: "Lock" };
    if (variance === null) return { text: "Enter data to audit", color: "text-slate-600", icon: "File" };
    if (variance > 0) return { text: "You may be owed money", color: "text-red-600", icon: "AlertCircle" };
    if (variance < 0) return { text: "Overpayment detected", color: "text-amber-600", icon: "AlertTriangle" };
    return { text: "Everything looks correct", color: "text-green-600", icon: "CheckCircle" };
  };

  const status = getStatus();

  const formatAmount = (cents: number) => {
    return `$${(Math.abs(cents) / 100).toFixed(2)}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header with Month/Year Selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">LES Audit Results</h1>
          <p className="text-slate-600">Verify your pay against official DFAS rates</p>
        </div>
        
        <div className="flex gap-3">
          <div>
            <label htmlFor="month-select" className="sr-only">Month</label>
            <select
              id="month-select"
              value={month || ""}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year-select" className="sr-only">Year</label>
            <input
              id="year-select"
              type="number"
              value={year || ""}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              min="2020"
              max="2099"
              placeholder="Year"
              className="w-24 rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Main Variance Display */}
      <div className="mb-8 text-center">
        <div className="mb-2 text-sm font-medium text-slate-600">
          Total Pay Variance
        </div>
        <div className={`mb-3 text-5xl font-bold ${status.color}`}>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Icon name="RefreshCw" className="h-12 w-12 animate-spin text-slate-400" />
            </div>
          ) : variance !== null ? (
            <>
              {variance > 0 ? "+" : ""}
              {formatAmount(variance)}
            </>
          ) : (
            "Premium Feature"
          )}
        </div>
        <div className={`flex items-center justify-center gap-2 text-lg font-medium ${status.color}`}>
          <Icon name={status.icon as any} className="h-5 w-5" />
          {status.text}
        </div>
        
        {/* Net Pay Comparison */}
        {netPay && (
          <div className="mt-4 text-sm text-slate-600">
            LES Net Pay: {formatAmount(netPay)}
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {redFlags.length}
          </div>
          <div className="text-sm font-medium text-slate-600">Critical Issues</div>
          {redFlags.length > 0 && (
            <div className="mt-1 text-xs text-red-600">
              Requires immediate action
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-600">
            {yellowFlags.length}
          </div>
          <div className="text-sm font-medium text-slate-600">Warnings</div>
          {yellowFlags.length > 0 && (
            <div className="mt-1 text-xs text-amber-600">
              Review recommended
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {greenFlags.length}
          </div>
          <div className="text-sm font-medium text-slate-600">Verified Correct</div>
          {greenFlags.length > 0 && (
            <div className="mt-1 text-xs text-green-600">
              All good
            </div>
          )}
        </div>
      </div>

      {/* Data Provenance */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Icon name="Shield" className="h-4 w-4 text-green-600" />
        <span>Based on official DFAS 2025 rates</span>
        <span>•</span>
        <span>JTR-compliant calculations</span>
      </div>
    </div>
  );
}
