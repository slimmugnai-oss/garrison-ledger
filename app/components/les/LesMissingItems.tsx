"use client";

import { useState, useMemo } from "react";

import Icon from "@/app/components/ui/Icon";
import type { LesLine } from "@/app/types/les";

interface Props {
  parsedLines: LesLine[];
  uploadId: string;
  userProfile?: {
    paygrade?: string;
    branch?: string;
    hasDependents?: boolean;
    currentBase?: string;
  };
  onItemsAdded: (newLines: LesLine[]) => void;
  onSkip: () => void;
}

interface Suggestion {
  code: string;
  description: string;
  category: "ALLOWANCE" | "DEDUCTION" | "TAX" | "ALLOTMENT";
  likely: "high" | "medium" | "low";
  reason: string;
  suggestedAmount?: number;
}

const SPECIAL_PAY_CODES = [
  "SDAP",
  "HFP",
  "IDP",
  "FSA",
  "FLPP",
  "SEA_PAY",
  "SUB_PAY",
  "FLIGHT_PAY",
  "DIVE_PAY",
  "JUMP_PAY",
  "HDP",
];

const COMMON_DEDUCTIONS = ["DENTAL", "VISION", "SGLI_FAMILY", "AFRH", "CHILD_SUPPORT"];

export default function LesMissingItems({
  parsedLines,
  uploadId,
  userProfile,
  onItemsAdded,
  onSkip,
}: Props) {
  const [customItems, setCustomItems] = useState<
    Array<{
      code: string;
      description: string;
      amount: string;
      category: "ALLOWANCE" | "DEDUCTION" | "TAX" | "ALLOTMENT";
    }>
  >([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomCode, setNewCustomCode] = useState("");
  const [newCustomDesc, setNewCustomDesc] = useState("");
  const [newCustomAmount, setNewCustomAmount] = useState("");
  const [newCustomCategory, setNewCustomCategory] = useState<
    "ALLOWANCE" | "DEDUCTION" | "TAX" | "ALLOTMENT"
  >("ALLOWANCE");

  // Analyze what's present and what might be missing
  const suggestions = useMemo(() => {
    const found = new Set(parsedLines.map((l) => l.line_code));
    const missing: Suggestion[] = [];

    // Check for missing BASE_PAY
    if (!found.has("BASEPAY") && !found.has("BASE_PAY")) {
      missing.push({
        code: "BASEPAY",
        description: "Base Pay",
        category: "ALLOWANCE",
        likely: "high",
        reason: "Base pay is standard for all service members",
      });
    }

    // Check for special pays (based on service context)
    const paygrade = userProfile?.paygrade || "";
    const branch = userProfile?.branch?.toUpperCase() || "";

    // Service-specific common pays
    if (branch === "NAVY" || branch === "USMC" || branch === "COAST_GUARD") {
      if (!found.has("SEA_PAY") && !found.has("SUB_PAY")) {
        missing.push({
          code: "SEA_PAY",
          description: "Career Sea Pay (if on sea duty)",
          category: "ALLOWANCE",
          likely: "medium",
          reason: "Common for Navy/USMC/Coast Guard on sea duty",
        });
      }
    }

    if (branch === "ARMY") {
      if (!found.has("JUMP_PAY")) {
        missing.push({
          code: "JUMP_PAY",
          description: "Parachute Duty Pay (if airborne qualified)",
          category: "ALLOWANCE",
          likely: "medium",
          reason: "Common for Army airborne units",
        });
      }
    }

    if (branch === "AF" || branch === "AIR_FORCE") {
      if (!found.has("FLIGHT_PAY")) {
        missing.push({
          code: "FLIGHT_PAY",
          description: "Aviation Career Incentive Pay (ACIP)",
          category: "ALLOWANCE",
          likely: "medium",
          reason: "Common for Air Force aviators",
        });
      }
    }

    // Check for common deductions that might be missed
    if (!found.has("DENTAL")) {
      missing.push({
        code: "DENTAL",
        description: "Dental Insurance Premium",
        category: "DEDUCTION",
        likely: "medium",
        reason: "Tricare Dental is common but may be listed differently",
      });
    }

    if (userProfile?.hasDependents && !found.has("SGLI_FAMILY")) {
      missing.push({
        code: "SGLI_FAMILY",
        description: "Family SGLI Coverage",
        category: "DEDUCTION",
        likely: "medium",
        reason: "Family SGLI is common when you have dependents",
      });
    }

    // Check for other common special pays
    SPECIAL_PAY_CODES.forEach((code) => {
      if (!found.has(code)) {
        missing.push({
          code,
          description: getCodeDescription(code),
          category: "ALLOWANCE",
          likely: "low", // Lower likelihood since it's assignment-specific
          reason: `May be applicable depending on your duty assignment`,
        });
      }
    });

    return missing.sort((a, b) => {
      // Sort by likelihood (high -> medium -> low)
      const likelihoodOrder = { high: 0, medium: 1, low: 2 };
      return likelihoodOrder[a.likely] - likelihoodOrder[b.likely];
    });
  }, [parsedLines, userProfile]);

  const handleAddSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestions((prev) => new Set([...prev, suggestion.code]));
  };

  const handleRemoveSuggestion = (code: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  };

  const handleAddCustomItem = () => {
    if (!newCustomCode || !newCustomDesc || !newCustomAmount) return;

    setCustomItems((prev) => [
      ...prev,
      {
        code: newCustomCode.toUpperCase(),
        description: newCustomDesc,
        amount: newCustomAmount,
        category: newCustomCategory,
      },
    ]);

    // Reset form
    setNewCustomCode("");
    setNewCustomDesc("");
    setNewCustomAmount("");
    setShowAddCustom(false);
  };

  const handleSaveAndContinue = async () => {
    const newLines: LesLine[] = [];

    // Add selected suggestions
    suggestions.forEach((suggestion) => {
      if (selectedSuggestions.has(suggestion.code)) {
        newLines.push({
          line_code: suggestion.code,
          description: suggestion.description,
          amount_cents: suggestion.suggestedAmount || 0,
          section: suggestion.category,
        });
      }
    });

    // Add custom items
    customItems.forEach((item) => {
      const amountStr = item.amount.replace(/[^0-9.]/g, "");
      const amountCents = Math.round(parseFloat(amountStr || "0") * 100);

      newLines.push({
        line_code: item.code,
        description: item.description,
        amount_cents: amountCents,
        section: item.category,
      });
    });

    if (newLines.length > 0) {
      // Save to database via API
      try {
        const response = await fetch(`/api/les/upload/${uploadId}/add-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: newLines }),
        });

        if (!response.ok) {
          throw new Error("Failed to save items");
        }

        onItemsAdded(newLines);
      } catch (error) {
        console.error("Failed to add items:", error);
        alert("Failed to save items. Please try again.");
      }
    } else {
      onSkip();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Review Parsed Items</h3>
        <p className="mt-2 text-sm text-gray-600">
          Found {parsedLines.length} line items. Add any missing items before running the audit.
        </p>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Suggested Missing Items</h4>
            <span className="text-sm text-gray-600">{suggestions.length} suggestions</span>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const isSelected = selectedSuggestions.has(suggestion.code);
              const likelihoodColor =
                suggestion.likely === "high"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : suggestion.likely === "medium"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-gray-100 text-gray-800 border-gray-300";

              return (
                <div
                  key={suggestion.code}
                  className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                    isSelected ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() =>
                      isSelected
                        ? handleRemoveSuggestion(suggestion.code)
                        : handleAddSuggestion(suggestion)
                    }
                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300 bg-white hover:border-blue-400"
                    }`}
                  >
                    {isSelected && <Icon name="Check" className="h-3 w-3 text-white" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{suggestion.code}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${likelihoodColor}`}
                      >
                        {suggestion.likely === "high"
                          ? "Likely"
                          : suggestion.likely === "medium"
                            ? "Possible"
                            : "Check if applicable"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">{suggestion.description}</div>
                    <div className="mt-1 text-xs text-gray-500">{suggestion.reason}</div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="$0.00"
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                        onChange={(e) => {
                          // Allow user to enter amount
                          const value = e.target.value;
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Items */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Custom Items</h4>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Icon name="Plus" className="h-4 w-4" />
            Add Custom Item
          </button>
        </div>

        {/* Add custom form */}
        {showAddCustom && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value={newCustomCode}
                  onChange={(e) => setNewCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SDAP, CUSTOM"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Category</label>
                <select
                  value={newCustomCategory}
                  onChange={(e) =>
                    setNewCustomCategory(
                      e.target.value as "ALLOWANCE" | "DEDUCTION" | "TAX" | "ALLOTMENT"
                    )
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="ALLOWANCE">Allowance</option>
                  <option value="DEDUCTION">Deduction</option>
                  <option value="TAX">Tax</option>
                  <option value="ALLOTMENT">Allotment</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={newCustomDesc}
                  onChange={(e) => setNewCustomDesc(e.target.value)}
                  placeholder="e.g., Special Duty Assignment Pay"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Amount</label>
                <input
                  type="text"
                  value={newCustomAmount}
                  onChange={(e) => setNewCustomAmount(e.target.value)}
                  placeholder="$0.00"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddCustomItem}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List of custom items */}
        {customItems.length > 0 && (
          <div className="space-y-2">
            {customItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-3"
              >
                <div>
                  <div className="font-medium text-gray-900">{item.code}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    ${parseFloat(item.amount.replace(/[^0-9.]/g, "") || "0").toFixed(2)}
                  </span>
                  <button
                    onClick={() => setCustomItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Icon name="X" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <button onClick={onSkip} className="text-sm text-gray-600 hover:text-gray-900">
          Skip - Continue with parsed items only
        </button>
        <button
          onClick={handleSaveAndContinue}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          disabled={selectedSuggestions.size === 0 && customItems.length === 0}
        >
          <Icon name="CheckCircle" className="h-5 w-5" />
          Save & Continue to Audit
        </button>
      </div>
    </div>
  );
}

function getCodeDescription(code: string): string {
  const descriptions: Record<string, string> = {
    SDAP: "Special Duty Assignment Pay",
    HFP: "Hostile Fire Pay",
    IDP: "Imminent Danger Pay",
    FSA: "Family Separation Allowance",
    FLPP: "Foreign Language Proficiency Pay",
    SEA_PAY: "Career Sea Pay",
    SUB_PAY: "Submarine Duty Pay",
    FLIGHT_PAY: "Aviation Career Incentive Pay (ACIP)",
    DIVE_PAY: "Diving Duty Pay",
    JUMP_PAY: "Parachute Duty Pay",
    HDP: "Hardship Duty Pay",
  };
  return descriptions[code] || code;
}
