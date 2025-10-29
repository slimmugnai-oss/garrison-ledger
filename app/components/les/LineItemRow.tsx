"use client";

/**
 * LINE ITEM ROW
 *
 * Individual editable line item with inline controls
 */

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { DynamicLineItem } from "@/app/types/les";

interface Props {
  item: DynamicLineItem;
  onEdit: (item: DynamicLineItem) => void;
  onDelete: (id: string) => void;
}

const SECTION_COLORS: Record<string, string> = {
  ALLOWANCE: "border-green-200 bg-green-50 hover:bg-green-100",
  TAX: "border-red-200 bg-red-50 hover:bg-red-100",
  DEDUCTION: "border-orange-200 bg-orange-50 hover:bg-orange-100",
  ALLOTMENT: "border-blue-200 bg-blue-50 hover:bg-blue-100",
  DEBT: "border-gray-200 bg-gray-50 hover:bg-gray-100",
  ADJUSTMENT: "border-purple-200 bg-purple-50 hover:bg-purple-100",
  OTHER: "border-gray-200 bg-gray-50 hover:bg-gray-100",
};

const SECTION_ICONS: Record<string, string> = {
  ALLOWANCE: "DollarSign",
  TAX: "Landmark",
  DEDUCTION: "Calculator",
  ALLOTMENT: "Banknote",
  DEBT: "AlertCircle",
  ADJUSTMENT: "RefreshCw",
  OTHER: "File",
};

export default function LineItemRow({ item, onEdit, onDelete }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    if (confirm(`Delete ${item.description}?`)) {
      onDelete(item.id);
    }
    setConfirmDelete(false);
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div
      className={`group rounded-lg border p-3 transition-colors ${
        SECTION_COLORS[item.section] || SECTION_COLORS.OTHER
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setConfirmDelete(false);
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Code + Description */}
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <Icon
              name={SECTION_ICONS[item.section] as any}
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-all font-semibold text-gray-900">{item.line_code}</span>
                {item.isCustom && (
                  <Badge variant="warning" className="shrink-0 text-xs">
                    Custom
                  </Badge>
                )}
                {item.isParsed && (
                  <Badge variant="info" className="shrink-0 text-xs">
                    Parsed
                  </Badge>
                )}
              </div>
              <p className="break-words text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Amount + Actions */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="shrink-0 text-lg font-bold text-gray-900">
            {formatAmount(item.amount_cents)}
          </span>

          {/* Action buttons - ALWAYS visible on mobile, show on hover desktop */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <button
              onClick={() => onEdit(item)}
              className="touch-manipulation rounded-md bg-white p-2 text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
              aria-label={`Edit ${item.description}`}
              style={{ minWidth: "44px", minHeight: "44px" }}
            >
              <Icon name="Edit" className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className={`touch-manipulation rounded-md p-2 shadow-sm transition-colors ${
                confirmDelete
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600"
              }`}
              aria-label={`Delete ${item.description}`}
              style={{ minWidth: "44px", minHeight: "44px" }}
            >
              <Icon name={confirmDelete ? "AlertCircle" : "Trash2"} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation hint */}
      {confirmDelete && (
        <div className="mt-2 text-xs text-red-700">Click again to confirm deletion</div>
      )}
    </div>
  );
}
