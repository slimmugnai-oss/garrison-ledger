/**
 * LES ALWAYS-ON AUDIT COMPONENT
 *
 * Split-panel design with real-time audit computation.
 * Left: Input fields | Right: Live audit report
 *
 * Features:
 * - Real-time computation (400ms debounce)
 * - Server-side paywall enforcement
 * - No "Run Audit" button - always computing
 * - Save/PDF for premium users only
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import { PremiumCurtain } from "@/app/components/paywall/PremiumCurtain";
import { useLesAudit } from "@/app/hooks/useLesAudit";
import type { AuditInputs } from "@/app/hooks/useLesAudit";
import type { Tier } from "@/lib/auth/subscription";

interface Props {
  tier: Tier;
  userProfile: {
    paygrade?: string;
    yos?: number;
    currentBase?: string;
    hasDependents?: boolean;
  };
}

export function LesAuditAlwaysOn({ tier, userProfile }: Props) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number | null>(new Date().getFullYear());

  // Profile
  const [paygrade, setPaygrade] = useState(userProfile.paygrade || "");
  const [yos, setYos] = useState(userProfile.yos || 0);
  const [mhaOrZip, setMhaOrZip] = useState(userProfile.currentBase || "");
  const [withDependents, setWithDependents] = useState(userProfile.hasDependents || false);

  // Allowances
  const [basePay, setBasePay] = useState(0);
  const [bah, setBah] = useState(0);
  const [bas, setBas] = useState(0);
  const [cola, setCola] = useState(0);

  // Deductions
  const [tsp, setTsp] = useState(0);
  const [sgli, setSgli] = useState(0);
  const [dental, setDental] = useState(0);

  // Taxes
  const [federalTax, setFederalTax] = useState(0);
  const [stateTax, setStateTax] = useState(0);
  const [fica, setFica] = useState(0);
  const [medicare, setMedicare] = useState(0);

  // Net Pay
  const [netPay, setNetPay] = useState<number | undefined>(undefined);

  // UI State
  const [saving, setSaving] = useState(false);
  const [loadingExpected, setLoadingExpected] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    entitlements: false,
    deductions: false,
    taxes: false,
  });

  // ============================================================================
  // MEMOIZED COMPUTATIONS
  // ============================================================================

  const completeness = useMemo(() => {
    const total = 12; // Base, BAH, BAS, COLA, TSP, SGLI, Dental, 4 taxes, Net
    const filled = [
      basePay,
      bah,
      bas,
      cola,
      tsp,
      sgli,
      dental,
      federalTax,
      stateTax,
      fica,
      medicare,
      netPay,
    ].filter((v) => (v || 0) > 0).length;
    return { filled, total, percentage: (filled / total) * 100 };
  }, [basePay, bah, bas, cola, tsp, sgli, dental, federalTax, stateTax, fica, medicare, netPay]);

  const entitlementCount = useMemo(
    () => [basePay, bah, bas, cola].filter((v) => v > 0).length,
    [basePay, bah, bas, cola]
  );

  const deductionCount = useMemo(
    () => [tsp, sgli, dental].filter((v) => v > 0).length,
    [tsp, sgli, dental]
  );

  const taxCount = useMemo(
    () => [federalTax, stateTax, fica, medicare].filter((v) => v > 0).length,
    [federalTax, stateTax, fica, medicare]
  );

  // ============================================================================
  // AUTO-POPULATE EXPECTED VALUES
  // ============================================================================

  useEffect(() => {
    const fetchExpectedValues = async () => {
      // Only fetch if we have complete profile data
      if (!month || !year || !paygrade || !mhaOrZip) return;

      setLoadingExpected(true);

      try {
        const response = await fetch("/api/les/expected-values", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month,
            year,
            rank: paygrade,
            location: mhaOrZip,
            hasDependents: withDependents,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Auto-fill allowances (official DFAS data)
          if (data.base_pay) setBasePay(data.base_pay);
          if (data.bah) setBah(data.bah);
          if (data.bas) setBas(data.bas);
          if (data.cola) setCola(data.cola);

          // Auto-fill deductions (from profile)
          if (data.tsp) setTsp(data.tsp);
          if (data.sgli) setSgli(data.sgli);
        }
      } catch (error) {
        console.error("Failed to fetch expected values:", error);
      } finally {
        setLoadingExpected(false);
      }
    };

    fetchExpectedValues();
  }, [month, year, paygrade, mhaOrZip, withDependents]);

  // ============================================================================
  // BUILD AUDIT INPUTS (MEMOIZED TO PREVENT RE-RENDER LOOP)
  // ============================================================================

  const inputs: AuditInputs = useMemo(() => ({
    month,
    year,
    profile:
      paygrade && yos && mhaOrZip
        ? {
            paygrade,
            yos,
            mhaOrZip,
            withDependents,
            specials: {},
          }
        : null,
    actual: {
      allowances: [
        basePay > 0 && { code: "BASEPAY", amount_cents: basePay },
        bah > 0 && { code: "BAH", amount_cents: bah },
        bas > 0 && { code: "BAS", amount_cents: bas },
        cola > 0 && { code: "COLA", amount_cents: cola },
      ].filter(Boolean) as Array<{ code: string; amount_cents: number }>,
      taxes: [
        federalTax > 0 && { code: "TAX_FED", amount_cents: federalTax },
        stateTax > 0 && { code: "TAX_STATE", amount_cents: stateTax },
        fica > 0 && { code: "FICA", amount_cents: fica },
        medicare > 0 && { code: "MEDICARE", amount_cents: medicare },
      ].filter(Boolean) as Array<{ code: string; amount_cents: number }>,
      deductions: [
        tsp > 0 && { code: "TSP", amount_cents: tsp },
        sgli > 0 && { code: "SGLI", amount_cents: sgli },
        dental > 0 && { code: "DENTAL", amount_cents: dental },
      ].filter(Boolean) as Array<{ code: string; amount_cents: number }>,
    },
    net_pay_cents: netPay,
  }), [month, year, paygrade, yos, mhaOrZip, withDependents, basePay, bah, bas, cola, 
      federalTax, stateTax, fica, medicare, tsp, sgli, dental, netPay]);

  // ============================================================================
  // REAL-TIME AUDIT COMPUTATION
  // ============================================================================

  const { result, loading, error } = useLesAudit(inputs, true);

  // ============================================================================
  // SAVE & PDF HANDLER
  // ============================================================================

  const handleSavePDF = async () => {
    if (!result) return;

    setSaving(true);

    try {
      const response = await fetch("/api/les/audit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          profile: inputs.profile,
          expected: {}, // Will be populated by server
          actual: inputs.actual,
          flags: result.flags,
          summary: result.totals,
        }),
      });

      if (response.status === 402) {
        const data = await response.json();
        alert(data.message || "Premium feature - upgrade to save audits");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save audit");
      }

      const data = await response.json();
      alert(`Audit saved! ${data.pdfUrl ? "PDF ready for download." : ""}`);
    } catch (error) {
      console.error("[Save PDF] Error:", error);
      alert("Failed to save audit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus month selector
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector("select")?.focus();
      }

      // Ctrl/Cmd + S: Save (if premium)
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && tier === "premium") {
        e.preventDefault();
        handleSavePDF();
      }

      // Escape: Collapse all sections
      if (e.key === "Escape") {
        setCollapsedSections({ entitlements: true, deductions: true, taxes: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tier, handleSavePDF]);

  // ============================================================================
  // RENDER: SPLIT-PANEL DESIGN
  // ============================================================================

  return (
    <div className="grid min-h-screen grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-6">
      {/* LEFT PANEL: INPUTS */}
      <div className="bg-gray-50 p-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:p-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          aria-label="LES data entry form"
          className="mx-auto max-w-2xl space-y-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Enter LES Data</h2>
            <button
              onClick={() => {
                if (confirm("Clear all entered data and start over?")) {
                  setBasePay(0);
                  setBah(0);
                  setBas(0);
                  setCola(0);
                  setTsp(0);
                  setSgli(0);
                  setDental(0);
                  setFederalTax(0);
                  setStateTax(0);
                  setFica(0);
                  setMedicare(0);
                  setNetPay(undefined);
                }
              }}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon name="RefreshCw" className="h-4 w-4" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
          </div>

          {/* Completeness Indicator - NEW */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Data Completeness</span>
              <span className="text-sm font-semibold text-blue-900">
                {completeness.filled}/{completeness.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-blue-700">
              Fill all fields for the most accurate audit
            </p>
          </div>

          {/* Month/Year */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Pay Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={month || ""}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={year || ""}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min="2020"
                  max="2099"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Entitlements Section */}
          <div className="rounded-lg border bg-white">
            <button
              onClick={() =>
                setCollapsedSections((prev) => ({ ...prev, entitlements: !prev.entitlements }))
              }
              className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
              aria-expanded={!collapsedSections.entitlements}
              aria-controls="entitlements-section"
            >
              <div className="flex items-center gap-3">
                <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">Entitlements</span>
                <Badge variant="info">{entitlementCount}/4</Badge>
              </div>
              <Icon
                name={collapsedSections.entitlements ? "ChevronDown" : "ChevronUp"}
                className="h-5 w-5 text-gray-400"
              />
            </button>

            {!collapsedSections.entitlements && (
              <div
                className="space-y-3 px-4 pb-4"
                id="entitlements-section"
                role="region"
                aria-label="Entitlements input fields"
              >
                {loadingExpected && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                    <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                    <span>Loading official DFAS rates...</span>
                  </div>
                )}
                {/* Base Pay, BAH, BAS, COLA inputs */}
                <CurrencyField
                  label="Base Pay"
                  value={basePay}
                  onChange={setBasePay}
                  helpText="Monthly basic pay (Entitlements section, top of LES)"
                />
                <CurrencyField
                  label="BAH"
                  value={bah}
                  onChange={setBah}
                  helpText="Basic Allowance for Housing (location-based)"
                />
                <CurrencyField
                  label="BAS"
                  value={bas}
                  onChange={setBas}
                  helpText="Basic Allowance for Subsistence (meals)"
                />
                <CurrencyField
                  label="COLA"
                  value={cola}
                  onChange={setCola}
                  helpText="Cost of Living Allowance (if applicable)"
                />
              </div>
            )}
          </div>

          {/* Deductions Section */}
          <div className="rounded-lg border bg-white">
            <button
              onClick={() =>
                setCollapsedSections((prev) => ({ ...prev, deductions: !prev.deductions }))
              }
              className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Icon name="Calculator" className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Deductions</span>
                <Badge variant="info">{deductionCount}/3</Badge>
              </div>
              <Icon
                name={collapsedSections.deductions ? "ChevronDown" : "ChevronUp"}
                className="h-5 w-5 text-gray-400"
              />
            </button>

            {!collapsedSections.deductions && (
              <div className="space-y-3 px-4 pb-4">
                <CurrencyField
                  label="TSP"
                  value={tsp}
                  onChange={setTsp}
                  helpText="Thrift Savings Plan contribution"
                />
                <CurrencyField
                  label="SGLI"
                  value={sgli}
                  onChange={setSgli}
                  helpText="Servicemembers' Group Life Insurance premium"
                />
                <CurrencyField
                  label="Dental"
                  value={dental}
                  onChange={setDental}
                  helpText="Dental insurance premium (if enrolled)"
                />
              </div>
            )}
          </div>

          {/* Taxes Section */}
          <div className="rounded-lg border bg-white">
            <button
              onClick={() => setCollapsedSections((prev) => ({ ...prev, taxes: !prev.taxes }))}
              className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Icon name="Landmark" className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-gray-900">Taxes</span>
                <Badge variant="info">{taxCount}/4</Badge>
              </div>
              <Icon
                name={collapsedSections.taxes ? "ChevronDown" : "ChevronUp"}
                className="h-5 w-5 text-gray-400"
              />
            </button>

            {!collapsedSections.taxes && (
              <div className="space-y-3 px-4 pb-4">
                <CurrencyField
                  label="Federal Tax"
                  value={federalTax}
                  onChange={setFederalTax}
                  helpText="Federal income tax withheld"
                />
                <CurrencyField
                  label="State Tax"
                  value={stateTax}
                  onChange={setStateTax}
                  helpText="State income tax withheld (if applicable)"
                />
                <CurrencyField
                  label="FICA"
                  value={fica}
                  onChange={setFica}
                  helpText="Social Security tax - should be ~6.2% of taxable pay"
                />
                <CurrencyField
                  label="Medicare"
                  value={medicare}
                  onChange={setMedicare}
                  helpText="Medicare tax - should be ~1.45% of taxable pay"
                />
              </div>
            )}
          </div>

          {/* Net Pay Section - NEW */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Net Pay (Bottom Line)</h3>
            <CurrencyField
              label="Actual Net Pay from LES"
              value={netPay || 0}
              onChange={setNetPay}
              helpText="This is your final take-home amount at the bottom of your LES"
            />
          </div>
        </form>
      </div>

      {/* RIGHT PANEL: AUDIT REPORT (ALWAYS VISIBLE) */}
      <div className="bg-white p-4 lg:overflow-y-auto lg:border-l lg:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Audit Report</h2>

          {/* Screen Reader Status Announcements */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {loading && "Computing audit..."}
            {error && `Error: ${error}`}
            {result && `Audit complete. ${result.flags.length} findings.`}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="animate-pulse space-y-4">
              {/* Summary skeleton */}
              <div className="h-32 rounded-lg bg-gray-100 p-6" />

              {/* Flags skeleton */}
              <div className="space-y-3">
                <div className="h-24 rounded-lg bg-gray-100 p-4" />
                <div className="h-24 rounded-lg bg-gray-100 p-4" />
                <div className="h-24 rounded-lg bg-gray-100 p-4" />
              </div>
            </div>
          )}

          {/* Error State - NEW */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Icon name="AlertCircle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Audit Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Summary Header */}
          {result && (
            <>
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Expected Net */}
                  <div>
                    <p className="mb-1 text-sm font-medium text-blue-700">Expected Net Pay</p>
                    {result.totals.computed_net !== null ? (
                      <p className="text-2xl font-bold text-blue-900">
                        ${(result.totals.computed_net / 100).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-lg text-blue-600">Premium feature</p>
                    )}
                  </div>

                  {/* Actual Net */}
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-700">Your LES Net Pay</p>
                    {result.totals.actual_net > 0 ? (
                      <p className="text-2xl font-bold text-gray-900">
                        ${(result.totals.actual_net / 100).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-sm italic text-gray-500">Enter above to compare</p>
                    )}
                  </div>

                  {/* Variance */}
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-700">Variance</p>
                    {result.totals.variance !== null ? (
                      <p
                        className={`text-2xl font-bold ${
                          Math.abs(result.totals.variance) <= 500
                            ? "text-green-600"
                            : Math.abs(result.totals.variance) <= 5000
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        ${Math.abs(result.totals.variance / 100).toFixed(2)}
                      </p>
                    ) : (
                      <Badge
                        variant={
                          result.totals.varianceBucket === "0-5"
                            ? "success"
                            : result.totals.varianceBucket === "5-50"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {result.totals.varianceBucket === "0-5" && "$0-$5"}
                        {result.totals.varianceBucket === "5-50" && "$5-$50"}
                        {result.totals.varianceBucket === ">50" && ">$50"}
                        {result.totals.varianceBucket === ">100" && ">$100"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Confidence Badge */}
                <div className="mt-4">
                  <Badge
                    variant={
                      result.confidence === "high"
                        ? "success"
                        : result.confidence === "medium"
                          ? "warning"
                          : "danger"
                    }
                  >
                    Confidence: {result.confidence.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Flags List */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Findings</h3>

                {/* Visible Flags */}
                <div className="space-y-3">
                  {result.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border-l-4 p-4 ${
                        flag.severity === "red"
                          ? "border-red-500 bg-red-50"
                          : flag.severity === "yellow"
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-green-500 bg-green-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Severity Icon - NEW */}
                        <div className="flex-shrink-0">
                          {flag.severity === "red" ? (
                            <Icon name="AlertCircle" className="h-6 w-6 text-red-600" />
                          ) : flag.severity === "yellow" ? (
                            <Icon name="AlertTriangle" className="h-6 w-6 text-yellow-600" />
                          ) : (
                            <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="mb-1 font-semibold text-gray-900">{flag.message}</p>
                          <p className="text-sm text-gray-700">{flag.suggestion}</p>
                        </div>

                        {tier === "premium" && (
                          <button className="flex-shrink-0 text-sm text-blue-600 hover:text-blue-700">
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hidden Flags (Free Tier) */}
                {result.hiddenFlagCount > 0 && (
                  <PremiumCurtain tier={tier} feature="flags" hiddenCount={result.hiddenFlagCount}>
                    <div className="rounded-lg bg-gray-100 p-4 text-center text-gray-500">
                      {result.hiddenFlagCount} more findings hidden
                    </div>
                  </PremiumCurtain>
                )}
              </div>

              {/* Waterfall (Premium Only) */}
              <PremiumCurtain tier={tier} feature="waterfall">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Detailed Reconciliation
                  </h3>
                  {result.waterfall && result.waterfall.length > 0 ? (
                    <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm">
                      {result.waterfall.map((row, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{row.label}</span>
                          <span>${(row.amount / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-100 p-8 text-center">
                      <p className="text-gray-600">Detailed line-by-line reconciliation</p>
                    </div>
                  )}
                </div>
              </PremiumCurtain>

              {/* Action Bar */}
              <div className="flex items-center gap-4 border-t pt-6">
                {tier === "premium" ? (
                  <button
                    onClick={handleSavePDF}
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    <Icon name="Download" className="h-5 w-5" />
                    {saving ? "Saving..." : "Save Audit & Generate PDF"}
                  </button>
                ) : (
                  <button
                    onClick={() => (window.location.href = "/dashboard/upgrade")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <Icon name="Zap" className="h-5 w-5" />
                    Upgrade to Save & Export
                  </button>
                )}
              </div>
            </>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div className="py-12 text-center">
              <Icon name="File" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Ready to Audit Your LES</h3>
              <p className="mb-4 text-gray-600">Enter your pay period and LES values on the left</p>
              <div className="inline-flex max-w-md items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
                <Icon name="Info" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-900">
                  <p className="mb-1 font-semibold">Quick Start:</p>
                  <ol className="list-inside list-decimal space-y-1 text-blue-800">
                    <li>Select month/year from your LES</li>
                    <li>Auto-filled values will load</li>
                    <li>Enter taxes and net pay from your LES</li>
                    <li>Report updates in real-time</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function CurrencyField({
  label,
  value,
  onChange,
  helpText,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  helpText?: string;
}) {
  // Convert cents to dollars for display
  const displayValue = value > 0 ? (value / 100).toFixed(2) : "";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const dollars = parseFloat(e.target.value) || 0;
            const cents = Math.round(dollars * 100);
            // Validate: no negatives, max $999,999
            const validated = Math.max(0, Math.min(99999900, cents));
            onChange(validated);
          }}
          min="0"
          max="999999"
          className="w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="0.00"
          step="0.01"
        />
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
