"use client";

/**
 * LINE ITEM ROW
 *
 * Individual editable line item optimized for table layout
 * Clean, professional styling with slate-800 theme
 */

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { DynamicLineItem } from "@/app/types/les";

interface Props {
  item: DynamicLineItem;
  onEdit: (item: DynamicLineItem) => void;
  onDelete: (id: string) => void;
  variant?: "table" | "card"; // New prop for layout variant
}

const SECTION_ICONS: Record<string, string> = {
  ALLOWANCE: "DollarSign",
  TAX: "Landmark",
  DEDUCTION: "Calculator",
  ALLOTMENT: "Banknote",
  DEBT: "AlertCircle",
  ADJUSTMENT: "RefreshCw",
  OTHER: "File",
};

export default function LineItemRow({ item, onEdit, onDelete, variant = "table" }: Props) {
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

  if (variant === "card") {
    // Mobile card layout
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors">
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
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => onEdit(item)}
              className="rounded-md p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
              aria-label={`Edit ${item.description}`}
            >
              <Icon name="Edit" className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className={`rounded-md p-2 transition-colors ${
                confirmDelete
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "text-slate-600 hover:bg-red-100 hover:text-red-600"
              }`}
              aria-label={`Delete ${item.description}`}
            >
              <Icon name={confirmDelete ? "AlertCircle" : "Trash2"} className="h-4 w-4" />
            </button>
          </div>
        </div>
        {confirmDelete && (
          <div className="mt-2 text-xs text-red-700">Click again to confirm deletion</div>
        )}
      </div>
    );
  }

  // Table row layout (default)
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
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
            onClick={handleDelete}
            className={`rounded-md p-1.5 transition-colors ${
              confirmDelete
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "text-slate-600 hover:bg-red-100 hover:text-red-600"
            }`}
            aria-label={`Delete ${item.description}`}
          >
            <Icon name={confirmDelete ? "AlertCircle" : "Trash2"} className="h-4 w-4" />
          </button>
        </div>
        {confirmDelete && (
          <div className="mt-1 text-xs text-red-700">Click again to confirm</div>
        )}
      </td>
    </tr>
  );
}
