"use client";

/**
 * UPLOAD REVIEW STEPPER
 *
 * 3-step wizard for reviewing parsed LES items after upload
 * Step 1: Review parsed items
 * Step 2: Add missing items
 * Step 3: Final review before audit
 */

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import type { DynamicLineItem } from "@/app/types/les";
import { generateLineItemId } from "@/lib/utils/line-item-ids";

interface Props {
  parsedItems: DynamicLineItem[];
  onComplete: (items: DynamicLineItem[]) => void;
  onBack: () => void;
}

type Step = 1 | 2 | 3;

export default function UploadReviewStepper({ parsedItems, onComplete, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [items, setItems] = useState<DynamicLineItem[]>(parsedItems);
  const [editedItems, setEditedItems] = useState<Set<string>>(new Set());

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      onComplete(items);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      onBack();
    }
  };

  const handleEdit = (item: DynamicLineItem, updatedItem: DynamicLineItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
    setEditedItems((prev) => new Set(prev).add(item.id));
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddItem = (item: DynamicLineItem) => {
    setItems((prev) => [...prev, item]);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          {/* Step 1 */}
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep >= 1
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              <span className="font-semibold">1</span>
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep >= 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              Review Parsed
            </span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 w-16 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />

          {/* Step 2 */}
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep >= 2
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              <span className="font-semibold">2</span>
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep >= 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              Add Missing
            </span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 w-16 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"}`} />

          {/* Step 3 */}
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep >= 3
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              <span className="font-semibold">3</span>
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep >= 3 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              Final Review
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] rounded-lg border bg-white p-6">
        {currentStep === 1 && (
          <ParsedItemsReviewStep
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            editedItems={editedItems}
          />
        )}
        {currentStep === 2 && <MissingItemsStep items={items} onAddItem={handleAddItem} />}
        {currentStep === 3 && <FinalReviewStep items={items} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100"
          aria-label="Go back"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          aria-label={currentStep === 3 ? "Run audit" : "Continue"}
        >
          {currentStep === 3 ? "Run Audit" : "Continue"}
          <Icon name="ArrowRight" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Step 1: Review Parsed Items
function ParsedItemsReviewStep({
  items,
  onEdit,
  onDelete,
  editedItems,
}: {
  items: DynamicLineItem[];
  onEdit: (item: DynamicLineItem, updatedItem: DynamicLineItem) => void;
  onDelete: (id: string) => void;
  editedItems: Set<string>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Review Parsed Line Items</h3>
        <p className="text-sm text-gray-600">
          Verify the parsed items from your LES. Edit any incorrect amounts or delete items that
          shouldn't be there.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="AlertCircle" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">No items were parsed from your LES.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                editedItems.has(item.id) ? "border-blue-200 bg-blue-50" : "bg-gray-50"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.line_code}</span>
                  {editedItems.has(item.id) && (
                    <span className="text-xs text-blue-600">Edited</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-lg font-bold text-gray-900">
                  ${(item.amount_cents / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Inline editing: prompt for new amount
                    const currentDollars = (item.amount_cents / 100).toFixed(2);
                    const newAmount = prompt(
                      `Enter new amount for ${item.description}:`,
                      currentDollars
                    );
                    if (newAmount !== null && newAmount.trim()) {
                      const amountNum = parseFloat(newAmount);
                      if (
                        isNaN(amountNum) ||
                        !isFinite(amountNum) ||
                        amountNum < 0 ||
                        amountNum > 999999
                      ) {
                        alert("Invalid amount. Please enter a number between $0 and $999,999.");
                      } else {
                        const amountCents = Math.round(amountNum * 100);
                        onEdit(item, { ...item, amount_cents: amountCents });
                      }
                    }
                  }}
                  className="rounded-md p-2 text-gray-600 hover:bg-white"
                  aria-label={`Edit ${item.description}`}
                  type="button"
                >
                  <Icon name="Edit" className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-md p-2 text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${item.description}`}
                  type="button"
                >
                  <Icon name="Trash2" className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Step 2: Add Missing Items
function MissingItemsStep({
  items,
  onAddItem,
}: {
  items: DynamicLineItem[];
  onAddItem: (item: DynamicLineItem) => void;
}) {
  const existingCodes = new Set(items.map((i) => i.line_code));

  // Common missing items
  const commonMissing = [
    { code: "TSP", description: "Thrift Savings Plan", section: "DEDUCTION" as const },
    { code: "SGLI", description: "SGLI Life Insurance", section: "DEDUCTION" as const },
    { code: "SDAP", description: "Special Duty Assignment Pay", section: "ALLOWANCE" as const },
    { code: "FLIGHT_PAY", description: "Flight Pay", section: "ALLOWANCE" as const },
    { code: "HFP", description: "Hostile Fire Pay", section: "ALLOWANCE" as const },
  ].filter((item) => !existingCodes.has(item.code));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Add Missing Items</h3>
        <p className="text-sm text-gray-600">
          Add any line items that weren't parsed from your LES but should be included in the audit.
        </p>
      </div>

      {commonMissing.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700">Common Missing Items:</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {commonMissing.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  // Create item with 0 amount - user will need to edit
                  onAddItem({
                    id: generateLineItemId(),
                    line_code: item.code,
                    description: item.description,
                    amount_cents: 0,
                    section: item.section,
                    isCustom: true,
                    isParsed: false,
                  });
                }}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50"
              >
                <div>
                  <span className="font-medium text-gray-900">{item.code}</span>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Icon name="Plus" className="h-4 w-4 text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <p className="mb-2 text-sm text-gray-600">
          Don't see what you need? Use the full line item manager to add any item.
        </p>
      </div>
    </div>
  );
}

// Step 3: Final Review
function FinalReviewStep({ items }: { items: DynamicLineItem[] }) {
  const totalAllowances = items
    .filter((i) => i.section === "ALLOWANCE")
    .reduce((sum, i) => sum + i.amount_cents, 0);
  const totalTaxes = items
    .filter((i) => i.section === "TAX")
    .reduce((sum, i) => sum + i.amount_cents, 0);
  const totalDeductions = items
    .filter((i) => i.section === "DEDUCTION")
    .reduce((sum, i) => sum + i.amount_cents, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Final Review</h3>
        <p className="text-sm text-gray-600">
          Review your complete line item list. Click "Run Audit" to compute the audit results.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">Total Allowances</p>
          <p className="text-2xl font-bold text-green-900">${(totalAllowances / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">Total Taxes</p>
          <p className="text-2xl font-bold text-red-900">${(totalTaxes / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-700">Total Deductions</p>
          <p className="text-2xl font-bold text-orange-900">
            ${(totalDeductions / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">
          {items.length} Line Items Ready for Audit
        </h4>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border bg-gray-50 p-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded p-2 text-sm hover:bg-white"
            >
              <span className="font-medium text-gray-900">{item.line_code}</span>
              <span className="text-gray-700">${(item.amount_cents / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
