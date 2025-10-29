"use client";

/**
 * LES CATEGORY TABLE
 * 
 * Clean table view for line items within a specific category
 * Replaces scattered accordion items with professional table layout
 */

import React from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { DynamicLineItem, LesSection } from "@/app/types/les";

interface LesCategoryTableProps {
  section: LesSection;
  items: DynamicLineItem[];
  onEdit: (item: DynamicLineItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  allowEdit?: boolean;
  showHeader?: boolean;
}

const SECTION_LABELS: Record<LesSection, string> = {
  ALLOWANCE: "Allowances",
  TAX: "Taxes",
  DEDUCTION: "Deductions",
  ALLOTMENT: "Allotments",
  DEBT: "Debts",
  ADJUSTMENT: "Adjustments",
  OTHER: "Other",
};

const SECTION_ICONS: Record<LesSection, string> = {
  ALLOWANCE: "DollarSign",
  TAX: "Landmark",
  DEDUCTION: "Calculator",
  ALLOTMENT: "Banknote",
  DEBT: "AlertCircle",
  ADJUSTMENT: "RefreshCw",
  OTHER: "File",
};

const SECTION_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "border-green-200 bg-green-50",
  TAX: "border-red-200 bg-red-50",
  DEDUCTION: "border-orange-200 bg-orange-50",
  ALLOTMENT: "border-blue-200 bg-blue-50",
  DEBT: "border-gray-200 bg-gray-50",
  ADJUSTMENT: "border-purple-200 bg-purple-50",
  OTHER: "border-gray-200 bg-gray-50",
};

const SECTION_ACCENT_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "text-green-600",
  TAX: "text-red-600",
  DEDUCTION: "text-orange-600",
  ALLOTMENT: "text-blue-600",
  DEBT: "text-gray-600",
  ADJUSTMENT: "text-purple-600",
  OTHER: "text-gray-600",
};

export default function LesCategoryTable({
  section,
  items,
  onEdit,
  onDelete,
  onAdd,
  allowEdit = true,
  showHeader = true,
}: LesCategoryTableProps) {
  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const total = items.reduce((sum, item) => sum + item.amount_cents, 0);

  return (
    <div className={`rounded-lg border ${SECTION_COLORS[section]}`}>
      {/* Section Header */}
      {showHeader && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon name={SECTION_ICONS[section] as any} className={`h-5 w-5 ${SECTION_ACCENT_COLORS[section]}`} />
            <span className="font-semibold text-slate-800">{SECTION_LABELS[section]}</span>
            <Badge variant="info" className="text-xs">
              {items.length}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            {total > 0 && (
              <span className="text-lg font-bold text-slate-700">
                {formatAmount(total)}
              </span>
            )}
            {allowEdit && (
              <button
                onClick={onAdd}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 ${
                  section === "ALLOWANCE" ? "bg-green-600" :
                  section === "TAX" ? "bg-red-600" :
                  section === "DEDUCTION" ? "bg-orange-600" :
                  section === "ALLOTMENT" ? "bg-blue-600" :
                  "bg-slate-600"
                }`}
              >
                <Icon name="Plus" className="h-3 w-3" />
                Add Item
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Content */}
      {items.length === 0 ? (
        <div className="p-8 text-center">
          <Icon name={SECTION_ICONS[section] as any} className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <h4 className="mb-2 font-semibold text-slate-700">No {SECTION_LABELS[section]} items</h4>
          <p className="mb-4 text-sm text-slate-600">
            Add your {SECTION_LABELS[section].toLowerCase()} from your LES
          </p>
          {allowEdit && (
            <button
              onClick={onAdd}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 ${
                section === "ALLOWANCE" ? "bg-green-600" :
                section === "TAX" ? "bg-red-600" :
                section === "DEDUCTION" ? "bg-orange-600" :
                section === "ALLOTMENT" ? "bg-blue-600" :
                "bg-slate-600"
              }`}
            >
              <Icon name="Plus" className="h-4 w-4" />
              Add {SECTION_LABELS[section]} Item
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  {allowEdit && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {item.line_code}
                        </span>
                        {item.isCustom && (
                          <Badge variant="warning" className="text-xs">
                            Custom
                          </Badge>
                        )}
                        {item.isParsed && (
                          <Badge variant="info" className="text-xs">
                            Parsed
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{item.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-slate-800">
                        {formatAmount(item.amount_cents)}
                      </span>
                    </td>
                    {allowEdit && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEdit(item)}
                            className="rounded-md p-1.5 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            aria-label={`Edit ${item.description}`}
                          >
                            <Icon name="Edit" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="rounded-md p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                            aria-label={`Delete ${item.description}`}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-2 p-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-slate-800">
                        {item.line_code}
                      </span>
                      {item.isCustom && (
                        <Badge variant="warning" className="text-xs">
                          Custom
                        </Badge>
                      )}
                      {item.isParsed && (
                        <Badge variant="info" className="text-xs">
                          Parsed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{item.description}</p>
                    <span className="text-lg font-bold text-slate-800">
                      {formatAmount(item.amount_cents)}
                    </span>
                  </div>
                  {allowEdit && (
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-md p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        aria-label={`Edit ${item.description}`}
                      >
                        <Icon name="Edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="rounded-md p-2 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                        aria-label={`Delete ${item.description}`}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Total */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">
              Total {SECTION_LABELS[section]}
            </span>
            <span className="text-lg font-bold text-slate-800">
              {formatAmount(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
