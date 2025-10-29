"use client";

/**
 * LES ALWAYS-ON AUDIT COMPONENT
 *
 * Split-panel design with real-time audit computation.
 * Left: Dynamic line item manager | Right: Live audit report
 *
 * Features:
 * - Real-time computation (400ms debounce)
 * - Server-side paywall enforcement
 * - No "Run Audit" button - always computing
 * - Dynamic line item management with templates
 */

import { logger } from "@/lib/logger";

interface LESLine {
  line_code: string;
  description: string;
  amount_cents: number;
  section: string;
}

import React, { useState, useEffect, useMemo, useCallback } from "react";

import { PremiumCurtain } from "@/app/components/paywall/PremiumCurtain";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import DynamicLineItemManager from "./DynamicLineItemManager";
import SmartTemplateSelector from "./SmartTemplateSelector";
import UploadReviewStepper from "./UploadReviewStepper";
import { useLesAudit } from "@/app/hooks/useLesAudit";
import type { AuditInputs } from "@/app/hooks/useLesAudit";
import type { Tier } from "@/lib/auth/subscription";
import type { DynamicLineItem } from "@/app/types/les";
import { convertLineItemsToAuditInputs } from "@/lib/les/line-item-converter";
import { generateLineItemId } from "@/lib/utils/line-item-ids";
import { computeTaxableBases } from "@/lib/les/codes";

interface Props {
  tier: Tier;
  userProfile: {
    paygrade?: string;
    yos?: number;
    mhaCode?: string;
    hasDependents?: boolean;
  };
}

export function LesAuditAlwaysOn({ tier, userProfile }: Props) {
  // Debug tier value
  logger.info("[LesAuditAlwaysOn] Tier:", { tier, userProfile });

  // ============================================================================
  // STATE
  // ============================================================================

  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number | null>(new Date().getFullYear());

  // Profile
  const [paygrade, setPaygrade] = useState(userProfile.paygrade || "");
  const [yos, setYos] = useState(userProfile.yos || 0);
  const [mhaOrZip, setMhaOrZip] = useState(userProfile.mhaCode || "");
  const [withDependents, setWithDependents] = useState(userProfile.hasDependents || false);

  // NEW: Dynamic line items (replaces all individual state variables)
  const [lineItems, setLineItems] = useState<DynamicLineItem[]>([]);
  const [templateSelected, setTemplateSelected] = useState(false);

  // UI State
  const [saving, setSaving] = useState(false);
  const [lastSavedAuditId, setLastSavedAuditId] = useState<string | null>(null);
  const [loadingExpected, setLoadingExpected] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [entryMode, setEntryMode] = useState<"upload" | "manual">("manual");
  const [uploading, setUploading] = useState(false);
  const [uploadedItems, setUploadedItems] = useState<DynamicLineItem[] | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [netPay, setNetPay] = useState<string>(""); // Net pay from LES (user-entered)

  // ============================================================================
  // AUTO-POPULATE EXPECTED VALUES (Auto-fill line items from profile)
  // ============================================================================

  useEffect(() => {
    const fetchExpectedValues = async () => {
      // Only fetch if we have complete profile data and no items yet
      if (!month || !year || !paygrade || !mhaOrZip || lineItems.length > 0) return;

      logger.info("[LesAuditAlwaysOn] Fetching expected values with:", {
        month,
        year,
        rank: paygrade,
        location: mhaOrZip,
        hasDependents: withDependents,
      });

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

          logger.info("[LesAuditAlwaysOn] Received expected values:", data);

          // Auto-fill line items from expected values
          const newItems: DynamicLineItem[] = [];

          if (data.base_pay) {
            newItems.push({
              id: generateLineItemId(),
              line_code: "BASEPAY",
              description: "Base Pay",
              amount_cents: data.base_pay,
              section: "ALLOWANCE",
              isCustom: false,
              isParsed: false,
            });
          }
          if (data.bah) {
            newItems.push({
              id: generateLineItemId(),
              line_code: "BAH",
              description: "Basic Allowance for Housing",
              amount_cents: data.bah,
              section: "ALLOWANCE",
              isCustom: false,
              isParsed: false,
            });
          }
          if (data.bas) {
            newItems.push({
              id: generateLineItemId(),
              line_code: "BAS",
              description: "Basic Allowance for Subsistence",
              amount_cents: data.bas,
              section: "ALLOWANCE",
              isCustom: false,
              isParsed: false,
            });
          }
          if (data.tsp) {
            newItems.push({
              id: generateLineItemId(),
              line_code: "TSP",
              description: "Thrift Savings Plan",
              amount_cents: data.tsp,
              section: "DEDUCTION",
              isCustom: false,
              isParsed: false,
            });
          }
          if (data.sgli) {
            newItems.push({
              id: generateLineItemId(),
              line_code: "SGLI",
              description: "SGLI Life Insurance",
              amount_cents: data.sgli,
              section: "DEDUCTION",
              isCustom: false,
              isParsed: false,
            });
          }

          if (newItems.length > 0) {
            setLineItems(newItems);
          }
        }
      } catch (error) {
        logger.error("Failed to fetch expected values:", error);
      } finally {
        setLoadingExpected(false);
      }
    };

    fetchExpectedValues();
  }, [month, year, paygrade, mhaOrZip, withDependents, lineItems.length]);

  // ============================================================================
  // AUTO-CALCULATE FICA & MEDICARE (Auto-add to line items if missing)
  // ============================================================================

  useEffect(() => {
    // Build allowances array for taxable base calculation
    const allowances = lineItems
      .filter((item) => item.section === "ALLOWANCE")
      .map((item) => ({
        code: item.line_code,
        amount_cents: item.amount_cents,
      }));

    // Calculate correct FICA/Medicare taxable base (includes Base Pay, COLA, and taxable special pays)
    const taxableBases = computeTaxableBases(allowances);
    const ficaMedicareGross = taxableBases.oasdi; // FICA and Medicare use same base

    if (ficaMedicareGross > 0) {
      // Check what we have in current state
      const hasFica = lineItems.some((item) => item.line_code === "FICA");
      const hasMedicare = lineItems.some((item) => item.line_code === "MEDICARE");

      // Only add if missing
      if (!hasFica || !hasMedicare) {
        setLineItems((prev) => {
          // Double-check in prev state to prevent race conditions
          const prevHasFica = prev.some((item) => item.line_code === "FICA");
          const prevHasMedicare = prev.some((item) => item.line_code === "MEDICARE");

          // If both already present, no changes needed
          if (prevHasFica && prevHasMedicare) {
            return prev;
          }

          // Recalculate taxable base from prev state to ensure consistency
          const prevAllowances = prev
            .filter((item) => item.section === "ALLOWANCE")
            .map((item) => ({
              code: item.line_code,
              amount_cents: item.amount_cents,
            }));
          const prevTaxableBases = computeTaxableBases(prevAllowances);
          const prevFicaMedicareGross = prevTaxableBases.oasdi;

          // If no taxable gross in prev state, no point adding taxes
          if (prevFicaMedicareGross === 0) {
            return prev;
          }

          const updates = [...prev];

          if (!prevHasFica) {
            // FICA = 6.2% of FICA/Medicare taxable gross (Base Pay + COLA + taxable special pays)
            const calculatedFica = Math.round(prevFicaMedicareGross * 0.062);
            updates.push({
              id: generateLineItemId(),
              line_code: "FICA",
              description: "FICA (Social Security)",
              amount_cents: calculatedFica,
              section: "TAX",
              isCustom: false,
              isParsed: false,
            });
          }

          if (!prevHasMedicare) {
            // Medicare = 1.45% of FICA/Medicare taxable gross
            const calculatedMedicare = Math.round(prevFicaMedicareGross * 0.0145);
            updates.push({
              id: generateLineItemId(),
              line_code: "MEDICARE",
              description: "Medicare Tax",
              amount_cents: calculatedMedicare,
              section: "TAX",
              isCustom: false,
              isParsed: false,
            });
          }

          return updates;
        });
      }
    }
  }, [lineItems]);

  // ============================================================================
  // FETCH AUDIT HISTORY
  // ============================================================================

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/les/audit/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sortBy: "date-desc",
          limit: 12,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        logger.info("[LesAuditAlwaysOn] Fetched history:", data.audits?.length || 0, "audits");
        setHistory(data.audits || []);
      } else {
        logger.error("[LesAuditAlwaysOn] Failed to fetch history:", response.status);
      }
    } catch (error) {
      logger.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ============================================================================
  // BUILD AUDIT INPUTS (Convert line items to audit input format)
  // ============================================================================

  const inputs: AuditInputs = useMemo(
    () =>
      convertLineItemsToAuditInputs(
        lineItems,
        month,
        year,
        paygrade && mhaOrZip && yos >= 0
          ? {
              paygrade,
              yos,
              mhaOrZip,
              withDependents,
            }
          : null,
        netPay ? Math.round(parseFloat(netPay) * 100) : undefined
      ),
    [lineItems, month, year, paygrade, yos, mhaOrZip, withDependents, netPay]
  );

  // ============================================================================
  // REAL-TIME AUDIT COMPUTATION
  // ============================================================================

  const { result, loading, error } = useLesAudit(inputs, true);

  // ============================================================================
  // SAVE & PDF HANDLER (useCallback to prevent event listener churn)
  // ============================================================================

  const handleSavePDF = useCallback(async () => {
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

      // Store the saved audit ID for print functionality
      setLastSavedAuditId(data.auditId || data.uploadId);

      // Show success toast and auto-expand history section
      const successMessage = `Audit saved for ${month ? new Date(2000, month - 1).toLocaleString("default", { month: "long" }) : ""} ${year}!`;

      // Refresh history to show newly saved audit
      await fetchHistory();

      // Auto-expand and scroll to history section
      setHistoryExpanded(true);
      setTimeout(() => {
        const historyEl = document.getElementById("saved-audits-section");
        if (historyEl) {
          historyEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        // Show brief success message
        alert(successMessage);
      }, 300);
    } catch (error) {
      logger.error("[Save] Error:", error);
      alert("Failed to save audit. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [result, month, year, inputs, fetchHistory]);

  // ============================================================================
  // PRINT HANDLER - Opens dedicated summary page like PCS Copilot
  // ============================================================================

  const handlePrint = useCallback(async () => {
    if (!result) return;

    // If audit is already saved, open summary page directly
    if (lastSavedAuditId) {
      window.open(`/dashboard/paycheck-audit/${lastSavedAuditId}/summary`, "_blank");
      return;
    }

    // Otherwise, save first, then open summary page
    setSaving(true);
    try {
      const response = await fetch("/api/les/audit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          profile: inputs.profile,
          expected: {},
          actual: inputs.actual,
          flags: result.flags,
          summary: result.totals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save audit");
      }

      const data = await response.json();
      const auditId = data.auditId || data.uploadId;

      if (auditId) {
        setLastSavedAuditId(auditId);
        // Open summary page in new tab
        window.open(`/dashboard/paycheck-audit/${auditId}/summary`, "_blank");
      } else {
        throw new Error("No audit ID returned");
      }
    } catch (error) {
      logger.error("[Print] Error:", error);
      alert("Failed to open print summary. Please save audit first.");
    } finally {
      setSaving(false);
    }
  }, [result, lastSavedAuditId, month, year, inputs]);

  // ============================================================================
  // LOAD PREVIOUS AUDIT (Reuse)
  // ============================================================================

  const handleLoadAudit = useCallback(async (auditId: string) => {
    try {
      const response = await fetch(`/api/les/audit/${auditId}`);
      if (!response.ok) throw new Error("Failed to load audit");

      const data = await response.json();

      // Validate response has required structure
      if (!data.metadata || !data.linesBySection) {
        throw new Error("Invalid audit data structure");
      }

      // Convert loaded audit data to DynamicLineItem array
      const loadedItems: DynamicLineItem[] = [];

      // Process all sections
      Object.entries(data.linesBySection).forEach(([section, lines]) => {
        if (Array.isArray(lines)) {
          lines.forEach((line: LESLine) => {
            if (line.amount_cents > 0) {
              loadedItems.push({
                id: generateLineItemId(),
                line_code: line.line_code,
                description: line.description,
                amount_cents: line.amount_cents,
                section: section as any,
                isCustom: false,
                isParsed: false,
              });
            }
          });
        }
      });

      setLineItems(loadedItems);

      // Set month/year
      setMonth(data.metadata.month);
      setYear(data.metadata.year);

      // Format month name correctly
      const monthName = new Date(2000, data.metadata.month - 1).toLocaleString("default", {
        month: "long",
      });
      alert(`Loaded audit from ${monthName} ${data.metadata.year}. Edit and re-run as needed.`);
    } catch (error) {
      logger.error("[Load Audit] Error:", error);
      alert("Failed to load audit. Please try again.");
    }
  }, []);

  // ============================================================================
  // DELETE AUDIT
  // ============================================================================

  const handleDeleteAudit = useCallback(
    async (auditId: string, auditDate: string) => {
      if (!confirm(`Delete audit for ${auditDate}? This cannot be undone.`)) return;

      try {
        const response = await fetch(`/api/les/audit/${auditId}/delete`, {
          method: "POST",
        });

        if (response.ok) {
          alert("Audit deleted successfully");
          fetchHistory(); // Refresh list
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        logger.error("[Delete Audit] Error:", error);
        alert("Failed to delete audit.");
      }
    },
    [fetchHistory]
  );

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

      // Escape: Reset form (clear all line items)
      if (e.key === "Escape" && lineItems.length > 0) {
        if (confirm("Clear all line items?")) {
          setLineItems([]);
          setTemplateSelected(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tier, handleSavePDF, lineItems.length]);

  // ============================================================================
  // UPLOAD HANDLER
  // ============================================================================

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/les/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      const parsedId = uploadData.uploadId || uploadData.id;

      // Convert parsed lines to DynamicLineItem format
      if (uploadData.lines && Array.isArray(uploadData.lines)) {
        const parsedItems: DynamicLineItem[] = uploadData.lines.map((line: any) => ({
          id: generateLineItemId(),
          line_code: line.line_code || line.code,
          description: line.description || line.line_code,
          amount_cents: line.amount_cents || 0,
          section: line.section || "OTHER",
          isCustom: false,
          isParsed: true,
          dbId: line.id,
        }));

        setUploadedItems(parsedItems);
        setUploadId(parsedId);
        setEntryMode("manual"); // Switch to manual mode to show review stepper
      } else {
        // Fallback: redirect to audit detail page
        window.location.href = `/dashboard/paycheck-audit/${parsedId}`;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed. Please try manual entry.");
      setEntryMode("manual");
    } finally {
      setUploading(false);
    }
  };

  // ============================================================================
  // RENDER: SPLIT-PANEL DESIGN
  // ============================================================================

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Entry Mode Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setEntryMode("manual")}
            className={`relative px-6 py-3 font-medium transition-colors ${
              entryMode === "manual"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="Edit" className="mr-2 inline-block h-4 w-4" />
            Manual Entry
          </button>
          <button
            onClick={() => setEntryMode("upload")}
            disabled
            className="relative cursor-not-allowed px-6 py-3 font-medium text-gray-400"
            title="Coming soon - PDF upload with automatic parsing"
          >
            <Icon name="Upload" className="mr-2 inline-block h-4 w-4" />
            Upload PDF
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* Military-Grade Security Badge (Upload Mode) */}
      {entryMode === "upload" && (
        <div className="mb-6 rounded-xl border-2 border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-600 p-3">
              <Icon name="Shield" className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-bold text-green-900">
                Military-Grade Zero-Storage Security
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-green-800">
                Your LES is processed in-memory and <strong>immediately deleted</strong>. We NEVER
                store your SSN, bank account, or personal information. Only line items (BAH, BAS,
                etc.) are kept for audit history.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                  <Icon name="Check" className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">No SSN storage</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                  <Icon name="Check" className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">No bank info</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                  <Icon name="Check" className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">GDPR compliant</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                  <Icon name="Check" className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Parse & purge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload UI */}
      {entryMode === "upload" && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Icon name="Upload" className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-900">Upload Your LES PDF</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              We'll automatically extract your pay line items and compare to official DFAS rates.
              Supports both digital and scanned LES.
            </p>

            {/* File Drop Zone */}
            <label
              htmlFor="les-upload"
              className="group mx-auto block max-w-2xl cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-all hover:border-blue-500 hover:bg-blue-50"
            >
              <input
                id="les-upload"
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <div className="text-center">
                <Icon
                  name="File"
                  className="mx-auto mb-4 h-16 w-16 text-gray-400 transition-colors group-hover:text-blue-500"
                />
                <p className="mb-2 text-xl font-semibold text-gray-700">
                  {uploading ? "Processing..." : "Click to upload or drag and drop"}
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  PDF only • Max 5MB • Works with digital or scanned LES
                </p>
                <div className="mx-auto max-w-md rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                  <Icon name="Info" className="mr-1 inline-block h-3 w-3" />
                  Supports myPay, AMS, BUPERS, and scanned paper LES from all service branches
                </div>
              </div>
            </label>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Icon name="Lock" className="h-3.5 w-3.5 text-green-600" />
              <span>
                <strong className="text-green-600">Zero PII storage:</strong> Your LES is parsed and
                deleted immediately
              </span>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setEntryMode("manual")}
                className="text-sm text-blue-600 hover:underline"
              >
                Prefer manual entry instead? Click here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry UI - NEW Dynamic Line Item Manager */}
      {entryMode === "manual" && (
        <div className="grid min-h-screen grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-6">
          {/* LEFT PANEL: DYNAMIC LINE ITEM MANAGER */}
          <div className="bg-gray-50 p-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:p-6">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Enter LES Data</h2>
                <button
                  onClick={() => {
                    if (confirm("Clear all entered data and start over?")) {
                      setLineItems([]);
                      setTemplateSelected(false);
                    }
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Icon name="RefreshCw" className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset Form</span>
                </button>
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
                    <label htmlFor="year" className="mb-1 block text-sm font-medium text-gray-700">
                      Year
                    </label>
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

              {/* Net Pay Input */}
              <div className="rounded-lg border bg-white p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Net Pay from LES</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Enter the actual net pay shown on your LES statement. This is used to verify the
                  audit calculation matches your paycheck.
                </p>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999"
                    value={netPay}
                    onChange={(e) => setNetPay(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {netPay && (
                  <p className="mt-2 text-xs text-gray-500">
                    This will be compared against computed net pay to catch discrepancies.
                  </p>
                )}
              </div>

              {/* Upload Review Wizard (show if items from upload) */}
              {uploadedItems && uploadedItems.length > 0 && lineItems.length === 0 && (
                <div className="mb-6">
                  <UploadReviewStepper
                    parsedItems={uploadedItems}
                    onComplete={(items) => {
                      setLineItems(items);
                      setUploadedItems(null);
                    }}
                    onBack={() => {
                      setUploadedItems(null);
                      setLineItems([]);
                      setEntryMode("upload");
                    }}
                  />
                </div>
              )}

              {/* Template Selector (show if no items and no upload review) */}
              {!uploadedItems && !templateSelected && lineItems.length === 0 && (
                <div className="mb-6">
                  <SmartTemplateSelector
                    onSelect={(items) => {
                      setLineItems(items);
                      setTemplateSelected(true);
                    }}
                  />
                </div>
              )}

              {/* Loading Expected Values */}
              {loadingExpected && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                  <span>Loading official DFAS rates...</span>
                </div>
              )}

              {/* Dynamic Line Item Manager */}
              <DynamicLineItemManager
                lineItems={lineItems}
                onChange={setLineItems}
                allowEdit={true}
              />
            </div>
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
                        {tier !== "premium" && tier !== "staff" ? (
                          <p className="text-lg text-blue-600">Premium feature</p>
                        ) : result.totals.actual_net > 0 ? (
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
                        {tier !== "premium" && tier !== "staff" ? (
                          <p className="text-lg text-blue-600">Premium feature</p>
                        ) : result.totals.variance !== null ? (
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
                  </div>

                  {/* Flags List */}
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Findings</h3>

                    {/* Complete paywall for free users */}
                    {tier !== "premium" && tier !== "staff" ? (
                      <div className="rounded-lg border border-blue-300 bg-blue-50 p-8 text-center">
                        <Icon name="Lock" className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                        <h3 className="mb-3 text-xl font-semibold text-blue-900">
                          Premium Feature: Complete LES Audit
                        </h3>
                        <p className="mb-2 text-sm text-blue-800">
                          Your audit is complete, but full results are for Premium members only.
                        </p>
                        <p className="mb-6 text-sm text-blue-700">
                          Premium unlocks: all flags, variance analysis, email templates, unlimited
                          audits
                        </p>
                        <a
                          href="/dashboard/upgrade?feature=paycheck-audit"
                          className="inline-block rounded-md bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Upgrade to Premium
                        </a>
                      </div>
                    ) : (
                      <>
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
                                    <Icon
                                      name="AlertTriangle"
                                      className="h-6 w-6 text-yellow-600"
                                    />
                                  ) : (
                                    <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <p className="mb-1 font-semibold text-gray-900">{flag.message}</p>
                                  <p className="text-sm text-gray-700">{flag.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hidden Flags (Free Tier) */}
                        {result.hiddenFlagCount > 0 && (
                          <PremiumCurtain
                            tier={tier}
                            feature="flags"
                            hiddenCount={result.hiddenFlagCount}
                          >
                            <div className="rounded-lg bg-gray-100 p-4 text-center text-gray-500">
                              {result.hiddenFlagCount} more findings hidden
                            </div>
                          </PremiumCurtain>
                        )}
                      </>
                    )}
                  </div>

                  {/* Waterfall (Premium Only) */}
                  {tier !== "premium" && tier !== "staff" ? (
                    <div className="rounded-lg border border-blue-300 bg-blue-50 p-8 text-center">
                      <Icon name="Lock" className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                      <h3 className="mb-3 text-xl font-semibold text-blue-900">
                        Premium Feature: Detailed Reconciliation
                      </h3>
                      <p className="mb-2 text-sm text-blue-800">
                        Line-by-line variance breakdown is for Premium members only.
                      </p>
                      <p className="mb-6 text-sm text-blue-700">
                        Premium unlocks: detailed reconciliation, all flags, variance analysis,
                        unlimited audits
                      </p>
                      <a
                        href="/dashboard/upgrade?feature=paycheck-audit"
                        className="inline-block rounded-md bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Upgrade to Premium
                      </a>
                    </div>
                  ) : (
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
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center gap-3 border-t pt-6">
                    {/* Save Button (Primary) */}
                    {tier === "premium" || tier === "staff" ? (
                      <button
                        onClick={handleSavePDF}
                        disabled={saving}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        <Icon name="CheckCircle" className="h-5 w-5" />
                        {saving ? "Saving..." : "Save Audit"}
                      </button>
                    ) : (
                      <button
                        onClick={() => (window.location.href = "/dashboard/upgrade")}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        <Icon name="Crown" className="h-5 w-5" />
                        Upgrade to Save Audits
                      </button>
                    )}

                    {/* Print Button */}
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 print:hidden"
                    >
                      <Icon name="Printer" className="h-5 w-5" />
                      Print / Save PDF
                    </button>

                    {/* View Saved Audits Button */}
                    {(tier === "premium" || tier === "staff") && history.length > 0 && (
                      <button
                        onClick={() => {
                          setHistoryExpanded(!historyExpanded);
                          setTimeout(() => {
                            const historyEl = document.getElementById("saved-audits-section");
                            if (historyEl) {
                              historyEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
                            }
                          }, 100);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Icon name="Archive" className="h-5 w-5" />
                        View Saved ({history.length})
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Empty State */}
              {!result && !loading && !error && (
                <div className="py-12 text-center">
                  <Icon name="File" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Ready to Audit Your LES
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Enter your pay period and LES values on the left
                  </p>
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

              {/* Audit History - Always visible for premium/staff */}
              {(tier === "premium" || tier === "staff") && (
                <div id="saved-audits-section" className="mt-8 border-t pt-6">
                  {loadingHistory ? (
                    <div className="text-center py-8">
                      <Icon name="RefreshCw" className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Loading saved audits...</p>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <Icon name="File" className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No Saved Audits Yet
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Save your first audit to track pay discrepancies over time.
                      </p>
                      {result && (
                        <button
                          onClick={handleSavePDF}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                        >
                          <Icon name="Download" className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Current Audit"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setHistoryExpanded(!historyExpanded)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">Saved Audits</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{history.length}</Badge>
                          <Icon
                            name={historyExpanded ? "ChevronUp" : "ChevronDown"}
                            className="h-5 w-5 text-gray-400"
                          />
                        </div>
                      </button>

                      {historyExpanded && (
                        <div className="mt-4 space-y-2">
                          {history.map((audit) => (
                            <div
                              key={audit.id}
                              className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {new Date(2000, audit.month - 1).toLocaleString("default", {
                                    month: "long",
                                  })}{" "}
                                  {audit.year}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(audit.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleLoadAudit(audit.id)}
                                  className="flex items-center gap-1 rounded px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                                >
                                  <Icon name="Upload" className="h-4 w-4" />
                                  Load
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteAudit(
                                      audit.id,
                                      `${new Date(2000, audit.month - 1).toLocaleString("default", { month: "short" })} ${audit.year}`
                                    )
                                  }
                                  className="flex items-center gap-1 rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                                >
                                  <Icon name="Trash2" className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
