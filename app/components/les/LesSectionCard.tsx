"use client";

/**
 * LES SECTION CARD
 * 
 * Collapsible card for a single LES section (Allowances, Taxes, etc.)
 * - Header with icon, label, item count, subtotal
 * - Collapsible body with line item rows
 * - Add button at bottom (filtered to section)
 */

import React, { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import LineItemRow from "./LineItemRow";
import type { DynamicLineItem, LesSection } from "@/app/types/les";

interface LesSectionCardProps {
  section: LesSection;
  label: string;
  icon: string;
  items: DynamicLineItem[];
  subtotal: number; // in cents
  onUpdateItem: (id: string, amountCents: number) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (section: LesSection) => void;
  autoCalcCodes?: string[]; // Codes that are auto-calculated
  defaultCollapsed?: boolean;
}

const SECTION_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "border-green-200 bg-green-50",
  TAX: "border-red-200 bg-red-50",
  DEDUCTION: "border-orange-200 bg-orange-50",
  ALLOTMENT: "border-blue-200 bg-blue-50",
  DEBT: "border-gray-200 bg-gray-50",
  ADJUSTMENT: "border-purple-200 bg-purple-50",
  OTHER: "border-gray-200 bg-gray-50",
};

const SECTION_ICON_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "text-green-600",
  TAX: "text-red-600",
  DEDUCTION: "text-orange-600",
  ALLOTMENT: "text-blue-600",
  DEBT: "text-gray-600",
  ADJUSTMENT: "text-purple-600",
  OTHER: "text-gray-600",
};

export default function LesSectionCard({
  section,
  label,
  icon,
  items,
  subtotal,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  autoCalcCodes = [],
  defaultCollapsed = false,
}: LesSectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isEmpty = items.length === 0;

  return (
    <div className={`rounded-lg border-2 ${SECTION_COLORS[section]} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 transition-colors"
        aria-expanded={!isCollapsed}
        aria-controls={`section-${section}`}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon as any} className={`h-5 w-5 ${SECTION_ICON_COLORS[section]}`} />
          <h3 className="font-semibold text-slate-900">{label}</h3>
          {items.length > 0 && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {items.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isEmpty && (
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(subtotal)}
            </span>
          )}
          <Icon
            name={isCollapsed ? "ChevronDown" : "ChevronUp"}
            className="h-5 w-5 text-slate-400 transition-transform"
          />
        </div>
      </button>

      {/* Body */}
      {!isCollapsed && (
        <div id={`section-${section}`} className="bg-white">
          {isEmpty ? (
            /* Empty State */
            <div className="px-4 py-8 text-center">
              <Icon name={icon as any} className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm font-medium text-slate-600 mb-1">No {label.toLowerCase()} items</p>
              <p className="text-xs text-slate-500 mb-4">
                Add your {label.toLowerCase()} from your LES
              </p>
              <button
                onClick={() => onAddItem(section)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
              >
                <Icon name="Plus" className="h-4 w-4" />
                Add {label} Item
              </button>
            </div>
          ) : (
            /* Line Items */
            <>
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={onUpdateItem}
                    onDelete={onDeleteItem}
                    isAutoCalculated={autoCalcCodes.includes(item.line_code)}
                    autoCalcWarning={
                      autoCalcCodes.includes(item.line_code)
                        ? "This value is auto-calculated. Manual changes will override the calculation."
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Subtotal Row */}
              <div className="border-t-2 border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Total {label}</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>

              {/* Add Button at Bottom */}
              <div className="border-t border-slate-200 bg-white px-4 py-3">
                <button
                  onClick={() => onAddItem(section)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Icon name="Plus" className="h-4 w-4" />
                  Add {label} Item
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

