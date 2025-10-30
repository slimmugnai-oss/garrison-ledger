"use client";

/**
 * ADD/EDIT LINE ITEM MODAL
 *
 * Modal for adding or editing a single LES line item
 * Supports autocomplete for line codes and auto-fills description/section
 */

import { useState, useEffect, useRef } from "react";
import Icon from "@/app/components/ui/Icon";
import LineItemAutocomplete from "./LineItemAutocomplete";
import type { DynamicLineItem, LesSection, LineCodeOption } from "@/app/types/les";
import { LINE_CODES, getCodesBySection } from "@/lib/les/codes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<DynamicLineItem, "id">) => void;
  editingItem?: DynamicLineItem | null;
  existingCodes?: string[]; // For duplicate detection
  defaultSection?: LesSection | null; // Pre-select section when adding
}

export default function AddLineItemModal({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
  existingCodes = [],
  defaultSection = null,
}: Props) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [section, setSection] = useState<LesSection>("ALLOWANCE");
  const [errors, setErrors] = useState<{
    code?: string;
    description?: string;
    amount?: string;
  }>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Filter codes by section and exclude already-added codes
  const allowedCodes = defaultSection
    ? getCodesBySection(defaultSection).filter(code => !existingCodes.includes(code))
    : undefined;

  // Initialize form when editing or opening
  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.line_code);
      setDescription(editingItem.description);
      setAmount((editingItem.amount_cents / 100).toFixed(2));
      setSection(editingItem.section);
    } else {
      // Reset form
      setCode("");
      setDescription("");
      setAmount("");
      setSection(defaultSection || "ALLOWANCE");
      setErrors({});
    }
  }, [editingItem, isOpen, defaultSection]);

  // Auto-fill description and section when code is selected
  const handleCodeSelect = (option: LineCodeOption) => {
    setCode(option.code);
    setDescription(option.description);
    setSection(option.section);
  };

  // Auto-detect section from code
  useEffect(() => {
    if (code && !editingItem) {
      try {
        // Auto-fill description and section if code is known
        const codeDef = LINE_CODES[code.toUpperCase()];
        if (codeDef) {
          setSection(codeDef.section as LesSection);
          if (!description) {
            setDescription(codeDef.description);
          }
        }
      } catch {
        // Unknown code, keep current values
      }
    }
  }, [code, description, editingItem]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Code validation
    if (!code.trim()) {
      newErrors.code = "Line code is required";
    } else if (!/^[A-Z_]+$/.test(code)) {
      newErrors.code = "Code must be uppercase letters and underscores (e.g., FLIGHT_PAY)";
    } else if (!editingItem && existingCodes.some((c) => c.toUpperCase() === code.toUpperCase())) {
      newErrors.code = `${code} already exists. Edit the existing line instead.`;
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    // Amount validation
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = "Amount is required";
    } else if (amountNum < 0) {
      newErrors.amount = "Amount cannot be negative";
    } else if (amountNum > 999999) {
      newErrors.amount = "Amount cannot exceed $999,999";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    const amountNum = parseFloat(amount);
    // Double-check for NaN/Infinity after validation
    if (isNaN(amountNum) || !isFinite(amountNum) || amountNum < 0 || amountNum > 999999) {
      setErrors({ ...errors, amount: "Invalid amount" });
      return;
    }

    const amountCents = Math.round(amountNum * 100);

    onSave({
      line_code: code.toUpperCase().trim(),
      description: description.trim(),
      amount_cents: amountCents,
      section,
      isCustom: !LINE_CODES[code.toUpperCase()],
      isParsed: false,
      dbId: editingItem?.dbId,
    });

    onClose();
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl"
        onKeyDown={(e) => {
          // Trap focus inside modal
          if (e.key === "Tab") {
            const focusableElements = Array.from(
              (e.currentTarget as HTMLElement).querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              )
            ) as HTMLElement[];

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-800">
            {editingItem ? "Edit Line Item" : "Add Line Item"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div id="modal-description" className="space-y-6 px-6 py-6">
          {/* Section Selector */}
          <div>
            <label
              htmlFor="section-select"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Section
            </label>
            <select
              id="section-select"
              value={section}
              onChange={(e) => setSection(e.target.value as LesSection)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-required="true"
            >
              <option value="ALLOWANCE">Allowance (Income)</option>
              <option value="TAX">Tax</option>
              <option value="DEDUCTION">Deduction</option>
              <option value="ALLOTMENT">Allotment</option>
              <option value="DEBT">Debt</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="OTHER">Other</option>
            </select>
            <p className="mt-2 text-xs text-slate-600">This will appear in the {section} section</p>
          </div>

          {/* Line Code */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Line Code <span className="text-red-500">*</span>
            </label>
            <LineItemAutocomplete
              value={code}
              onChange={setCode}
              onSelect={handleCodeSelect}
              placeholder="e.g., FLIGHT_PAY, SDAP, BAH..."
              allowedCodes={allowedCodes}
            />
            {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code}</p>}
            {code && !LINE_CODES[code.toUpperCase()] && !errors.code && (
              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <Icon name="AlertTriangle" className="h-3 w-3" />
                Unknown code - will be saved as custom line item
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Aviation Career Incentive Pay"
              className={`w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Amount (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-slate-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="999999"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full rounded-lg border-slate-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.amount ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            type="button"
            aria-label="Cancel and close modal"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
            type="button"
            aria-label={editingItem ? "Save changes to line item" : "Add new line item"}
            disabled={!code || !description || !amount || Object.keys(errors).length > 0}
          >
            {editingItem ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
