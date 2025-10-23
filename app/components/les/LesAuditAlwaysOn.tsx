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

import { useState, useEffect } from "react";
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
  const [mhaOrZip, setMhaOrZip] = useState("");
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
  // AUTO-POPULATE EXPECTED VALUES
  // ============================================================================

  useEffect(() => {
    const fetchExpectedValues = async () => {
      // Only fetch if we have complete profile data
      if (!month || !year || !paygrade || !userProfile.currentBase) return;

      setLoadingExpected(true);

      try {
        const response = await fetch("/api/les/expected-values", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month,
            year,
            rank: paygrade,
            location: userProfile.currentBase,
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
  }, [month, year, paygrade, userProfile.currentBase, withDependents]);

  // ============================================================================
  // BUILD AUDIT INPUTS
  // ============================================================================

  const inputs: AuditInputs = {
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
  };

  // ============================================================================
  // REAL-TIME AUDIT COMPUTATION
  // ============================================================================

  const { result, loading } = useLesAudit(inputs, true);

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
  // RENDER: SPLIT-PANEL DESIGN
  // ============================================================================

  return (
    <div className="grid h-screen grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT PANEL: INPUTS */}
      <div className="overflow-y-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Enter LES Data</h2>

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
            >
              <div className="flex items-center gap-3">
                <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">Entitlements</span>
                <Badge variant="info">
                  {[basePay, bah, bas, cola].filter((v) => v > 0).length}/4
                </Badge>
              </div>
              <Icon
                name={collapsedSections.entitlements ? "ChevronDown" : "ChevronUp"}
                className="h-5 w-5 text-gray-400"
              />
            </button>

            {!collapsedSections.entitlements && (
              <div className="space-y-3 px-4 pb-4">
                {loadingExpected && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                    <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                    <span>Loading official DFAS rates...</span>
                  </div>
                )}
                {/* Base Pay, BAH, BAS, COLA inputs */}
                <CurrencyField label="Base Pay" value={basePay} onChange={setBasePay} />
                <CurrencyField label="BAH" value={bah} onChange={setBah} />
                <CurrencyField label="BAS" value={bas} onChange={setBas} />
                <CurrencyField label="COLA" value={cola} onChange={setCola} />
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
                <Badge variant="info">{[tsp, sgli, dental].filter((v) => v > 0).length}/3</Badge>
              </div>
              <Icon
                name={collapsedSections.deductions ? "ChevronDown" : "ChevronUp"}
                className="h-5 w-5 text-gray-400"
              />
            </button>

            {!collapsedSections.deductions && (
              <div className="space-y-3 px-4 pb-4">
                <CurrencyField label="TSP" value={tsp} onChange={setTsp} />
                <CurrencyField label="SGLI" value={sgli} onChange={setSgli} />
                <CurrencyField label="Dental" value={dental} onChange={setDental} />
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
                <Badge variant="info">
                  {[federalTax, stateTax, fica, medicare].filter((v) => v > 0).length}/4
                </Badge>
              </div>
              <Icon
                name={collapsedSections.taxes ? "ChevronDown" : "ChevronUp"}
                className="h-5 w-5 text-gray-400"
              />
            </button>

            {!collapsedSections.taxes && (
              <div className="space-y-3 px-4 pb-4">
                <CurrencyField label="Federal Tax" value={federalTax} onChange={setFederalTax} />
                <CurrencyField label="State Tax" value={stateTax} onChange={setStateTax} />
                <CurrencyField label="FICA" value={fica} onChange={setFica} />
                <CurrencyField label="Medicare" value={medicare} onChange={setMedicare} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AUDIT REPORT (ALWAYS VISIBLE) */}
      <div className="overflow-y-auto border-l bg-white p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Audit Report</h2>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
              <Icon name="Loader" className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-blue-900">Computing audit...</span>
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="mb-1 font-semibold text-gray-900">{flag.message}</p>
                          <p className="text-sm text-gray-700">{flag.suggestion}</p>
                        </div>
                        {tier === "premium" && (
                          <button className="text-sm text-blue-600 hover:text-blue-700">
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
          {!result && !loading && (
            <div className="py-12 text-center">
              <Icon name="File" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-gray-600">
                Enter your LES data on the left to see your audit report
              </p>
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
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="0"
      />
    </div>
  );
}
