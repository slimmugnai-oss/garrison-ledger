"use client";

/**
 * LES ALWAYS-ON AUDIT COMPONENT
 *
 * New professional layout with:
 * - Hero section with prominent variance display
 * - Tabbed data entry system
 * - Collapsible findings section below
 *
 * Features:
 * - Real-time computation (400ms debounce)
 * - Server-side paywall enforcement
 * - Professional financial system UI
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
import { useLesAudit } from "@/app/hooks/useLesAudit";
import type { AuditInputs } from "@/app/hooks/useLesAudit";
import type { DynamicLineItem, LesSection } from "@/app/types/les";
import type { Tier } from "@/lib/auth/subscription";
import { computeTaxableBases } from "@/lib/les/codes";
import { convertLineItemsToAuditInputs } from "@/lib/les/line-item-converter";
import { generateLineItemId } from "@/lib/utils/line-item-ids";

import LesVarianceHero from "./LesVarianceHero";
import LesFindingsAccordion from "./LesFindingsAccordion";
import UploadReviewStepper from "./UploadReviewStepper";
import AddLineItemModal from "./AddLineItemModal";
import LesEditorLayout from "./LesEditorLayout";
import LesSummarySticky from "./LesSummarySticky";
import LesSectionCard from "./LesSectionCard";

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

  // Dynamic line items
  const [lineItems, setLineItems] = useState<DynamicLineItem[]>([]);

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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DynamicLineItem | null>(null);
  const [addingToSection, setAddingToSection] = useState<LesSection | null>(null);

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

          // Add standard tax line items (user enters actual amounts from LES)
          newItems.push(
            {
              id: generateLineItemId(),
              line_code: "TAX_FED",
              description: "Federal Income Tax Withheld",
              amount_cents: 0,
              section: "TAX",
              isCustom: false,
              isParsed: false,
            },
            {
              id: generateLineItemId(),
              line_code: "TAX_STATE",
              description: "State Income Tax Withheld",
              amount_cents: 0,
              section: "TAX",
              isCustom: false,
              isParsed: false,
            },
            {
              id: generateLineItemId(),
              line_code: "FICA",
              description: "FICA (Social Security Tax)",
              amount_cents: 0,
              section: "TAX",
              isCustom: false,
              isParsed: false,
            },
            {
              id: generateLineItemId(),
              line_code: "MEDICARE",
              description: "Medicare Tax",
              amount_cents: 0,
              section: "TAX",
              isCustom: false,
              isParsed: false,
            }
          );

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
      const ficaItem = lineItems.find((item) => item.line_code === "FICA");
      const medicareItem = lineItems.find((item) => item.line_code === "MEDICARE");
      const hasFica = !!ficaItem;
      const hasMedicare = !!medicareItem;
      
      // Check if existing items have zero amounts (need calculation)
      const ficaNeedsCalculation = !hasFica || ficaItem?.amount_cents === 0;
      const medicareNeedsCalculation = !hasMedicare || medicareItem?.amount_cents === 0;

      // Add or update if missing or have zero amounts
      if (ficaNeedsCalculation || medicareNeedsCalculation) {
        setLineItems((prev) => {
          // Double-check in prev state to prevent race conditions
          const prevFicaItem = prev.find((item) => item.line_code === "FICA");
          const prevMedicareItem = prev.find((item) => item.line_code === "MEDICARE");
          const prevHasFica = !!prevFicaItem;
          const prevHasMedicare = !!prevMedicareItem;
          
          // Check if existing items have zero amounts (need calculation)
          const prevFicaNeedsCalculation = !prevHasFica || prevFicaItem?.amount_cents === 0;
          const prevMedicareNeedsCalculation = !prevHasMedicare || prevMedicareItem?.amount_cents === 0;

          // If both already present with non-zero amounts, no changes needed
          if (!prevFicaNeedsCalculation && !prevMedicareNeedsCalculation) {
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

          if (prevFicaNeedsCalculation) {
            // FICA = 6.2% of FICA/Medicare taxable gross (Base Pay + COLA + taxable special pays)
            const calculatedFica = Math.round(prevFicaMedicareGross * 0.062);
            
            if (prevHasFica) {
              // Update existing FICA item
              const ficaIndex = updates.findIndex(item => item.line_code === "FICA");
              if (ficaIndex !== -1) {
                updates[ficaIndex] = {
                  ...updates[ficaIndex],
                  amount_cents: calculatedFica,
                };
              }
            } else {
              // Add new FICA item
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
          }

          if (prevMedicareNeedsCalculation) {
            // Medicare = 1.45% of FICA/Medicare taxable gross
            const calculatedMedicare = Math.round(prevFicaMedicareGross * 0.0145);
            
            if (prevHasMedicare) {
              // Update existing Medicare item
              const medicareIndex = updates.findIndex(item => item.line_code === "MEDICARE");
              if (medicareIndex !== -1) {
                updates[medicareIndex] = {
                  ...updates[medicareIndex],
                  amount_cents: calculatedMedicare,
                };
              }
            } else {
              // Add new Medicare item
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
        logger.info("[LesAuditAlwaysOn] Fetched history:", { count: data.audits?.length || 0 });
        setHistory(data.audits || []);
      } else {
        logger.error("[LesAuditAlwaysOn] Failed to fetch history:", { status: response.status });
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
  // SAVE & PDF HANDLER
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
  // PRINT HANDLER
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
  // LINE ITEM HANDLERS
  // ============================================================================

  const handleAddItem = (section: LesSection) => {
    setAddingToSection(section);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: DynamicLineItem) => {
    setEditingItem(item);
    setAddingToSection(null);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveItem = (itemData: Omit<DynamicLineItem, "id">) => {
    if (editingItem) {
      // Update existing item
      setLineItems(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...itemData, id: editingItem.id, dbId: editingItem.dbId }
            : item
        )
      );
        } else {
      // Add new item
      setLineItems(prev => [
        ...prev,
        {
          ...itemData,
          id: generateLineItemId(),
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
    setAddingToSection(null);
  };

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
  // HELPER FUNCTIONS FOR NEW LAYOUT
  // ============================================================================

  // Group line items by section
  const lineItemsBySection = useMemo(() => {
    return {
      ALLOWANCE: lineItems.filter(item => item.section === "ALLOWANCE"),
      TAX: lineItems.filter(item => item.section === "TAX"),
      DEDUCTION: lineItems.filter(item => item.section === "DEDUCTION"),
      ALLOTMENT: lineItems.filter(item => item.section === "ALLOTMENT"),
      DEBT: lineItems.filter(item => item.section === "DEBT"),
      ADJUSTMENT: lineItems.filter(item => item.section === "ADJUSTMENT"),
      OTHER: lineItems.filter(item => item.section === "OTHER"),
    };
  }, [lineItems]);

  // Compute section totals
  const sectionTotals = useMemo(() => {
    return {
      ALLOWANCE: lineItemsBySection.ALLOWANCE.reduce((sum, item) => sum + item.amount_cents, 0),
      TAX: lineItemsBySection.TAX.reduce((sum, item) => sum + item.amount_cents, 0),
      DEDUCTION: lineItemsBySection.DEDUCTION.reduce((sum, item) => sum + item.amount_cents, 0),
      ALLOTMENT: lineItemsBySection.ALLOTMENT.reduce((sum, item) => sum + item.amount_cents, 0),
      DEBT: lineItemsBySection.DEBT.reduce((sum, item) => sum + item.amount_cents, 0),
      ADJUSTMENT: lineItemsBySection.ADJUSTMENT.reduce((sum, item) => sum + item.amount_cents, 0),
      OTHER: lineItemsBySection.OTHER.reduce((sum, item) => sum + item.amount_cents, 0),
    };
  }, [lineItemsBySection]);

  // Compute net pay
  const computedNetPay = useMemo(() => {
    return sectionTotals.ALLOWANCE - sectionTotals.TAX - sectionTotals.DEDUCTION - sectionTotals.ALLOTMENT - sectionTotals.DEBT;
  }, [sectionTotals]);

  // Handle line item update
  const handleUpdateItem = useCallback((id: string, amountCents: number) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, amount_cents: amountCents } : item
    ));
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Hero Section - Variance Display */}
      <LesVarianceHero
        variance={result?.totals.variance || null}
        flags={result?.flags || []}
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        netPay={computedNetPay}
        isPremium={tier === "premium" || tier === "staff"}
        loading={loading}
      />

      {/* New 2-Column Layout */}
      <LesEditorLayout
        summary={
          <LesSummarySticky
            allowancesTotal={sectionTotals.ALLOWANCE}
            taxesTotal={sectionTotals.TAX}
            deductionsTotal={sectionTotals.DEDUCTION}
            netPay={computedNetPay}
            variance={result?.totals.variance || null}
            variancePercent={result?.totals.variance && computedNetPay ? (result.totals.variance / computedNetPay) * 100 : undefined}
            confidence={
              result && result.flags
                ? result.flags.filter(f => f.severity === "red").length === 0
                  ? result.flags.filter(f => f.severity === "yellow").length === 0
                    ? "excellent"
                    : "good"
                  : "needs_work"
                : "fair"
            }
            flagCount={result?.flags?.length || 0}
            tier={tier}
            onSave={handleSavePDF}
            onPrint={handlePrint}
            saving={saving}
          />
        }
      >
        {/* Section Cards */}
        <LesSectionCard
          section="ALLOWANCE"
          label="Pay & Allowances"
          icon="DollarSign"
          items={lineItemsBySection.ALLOWANCE}
          subtotal={sectionTotals.ALLOWANCE}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
        />

        <LesSectionCard
          section="TAX"
          label="Taxes"
          icon="Landmark"
          items={lineItemsBySection.TAX}
          subtotal={sectionTotals.TAX}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
          autoCalcCodes={["FICA", "MEDICARE"]}
        />

        <LesSectionCard
          section="DEDUCTION"
          label="Deductions"
          icon="Calculator"
          items={lineItemsBySection.DEDUCTION}
          subtotal={sectionTotals.DEDUCTION}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
        />

        {lineItemsBySection.ALLOTMENT.length > 0 && (
          <LesSectionCard
            section="ALLOTMENT"
            label="Allotments"
            icon="Banknote"
            items={lineItemsBySection.ALLOTMENT}
            subtotal={sectionTotals.ALLOTMENT}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
          />
        )}

        {lineItemsBySection.DEBT.length > 0 && (
          <LesSectionCard
            section="DEBT"
            label="Debts"
            icon="AlertCircle"
            items={lineItemsBySection.DEBT}
            subtotal={sectionTotals.DEBT}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
          />
        )}

        {lineItemsBySection.ADJUSTMENT.length > 0 && (
          <LesSectionCard
            section="ADJUSTMENT"
            label="Adjustments"
            icon="RefreshCw"
            items={lineItemsBySection.ADJUSTMENT}
            subtotal={sectionTotals.ADJUSTMENT}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
          />
        )}

        {/* Findings Panel */}
        {result && (
          <LesFindingsAccordion
            flags={result.flags}
            tier={tier}
            hiddenFlagCount={result.hiddenFlagCount || 0}
            onUpgrade={() => (window.location.href = "/dashboard/upgrade?feature=paycheck-audit")}
          />
        )}
      </LesEditorLayout>

      {/* Audit History */}
              {(tier === "premium" || tier === "staff") && (
                <div id="saved-audits-section" className="mt-8 border-t pt-6">
                  {loadingHistory ? (
                    <div className="py-8 text-center">
                      <Icon
                        name="RefreshCw"
                className="mx-auto h-8 w-8 animate-spin text-slate-400"
                      />
              <p className="mt-2 text-sm text-slate-600">Loading saved audits...</p>
                    </div>
                  ) : history.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Icon name="File" className="mx-auto mb-3 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                        No Saved Audits Yet
                      </h3>
              <p className="mb-4 text-sm text-slate-600">
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
                <h3 className="text-lg font-semibold text-slate-900">Saved Audits</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{history.length}</Badge>
                          <Icon
                            name={historyExpanded ? "ChevronUp" : "ChevronDown"}
                    className="h-5 w-5 text-slate-400"
                          />
                        </div>
                      </button>

                      {historyExpanded && (
                        <div className="mt-4 space-y-2">
                          {history.map((audit) => (
                            <div
                              key={audit.id}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                            >
                              <div className="flex-1">
                        <p className="font-medium text-slate-900">
                                  {new Date(2000, audit.month - 1).toLocaleString("default", {
                                    month: "long",
                                  })}{" "}
                                  {audit.year}
                                </p>
                        <p className="text-xs text-slate-600">
                                  {new Date(audit.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                          onClick={() => {
                            // Load audit logic would go here
                            alert("Load audit functionality coming soon");
                          }}
                                  className="flex items-center gap-1 rounded px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                                >
                                  <Icon name="Upload" className="h-4 w-4" />
                                  Load
                                </button>
                                <button
                          onClick={() => {
                            if (confirm(`Delete audit for ${new Date(2000, audit.month - 1).toLocaleString("default", { month: "short" })} ${audit.year}? This cannot be undone.`)) {
                              // Delete audit logic would go here
                              alert("Delete audit functionality coming soon");
                            }
                          }}
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

      {/* Add/Edit Modal */}
      <AddLineItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setAddingToSection(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        defaultSection={addingToSection}
        existingCodes={editingItem ? [] : lineItems.map(item => item.line_code)}
      />
    </div>
  );
}