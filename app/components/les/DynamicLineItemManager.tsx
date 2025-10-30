"use client";

/**
 * DYNAMIC LINE ITEM MANAGER
 *
 * Main container managing line items array with add/edit/delete functionality
 * Replaces fixed-form fields with flexible spreadsheet-like interface
 */

import { useState, useMemo, useCallback } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import LineItemRow from "./LineItemRow";
import AddLineItemModal from "./AddLineItemModal";
import type { DynamicLineItem, LesSection } from "@/app/types/les";
import { generateLineItemId } from "@/lib/utils/line-item-ids";

interface Props {
  lineItems: DynamicLineItem[];
  onChange: (items: DynamicLineItem[]) => void;
  allowEdit?: boolean;
  onUndo?: (item: DynamicLineItem) => void; // Optional undo callback
}

const SECTION_ORDER: LesSection[] = [
  "ALLOWANCE",
  "TAX",
  "DEDUCTION",
  "ALLOTMENT",
  "DEBT",
  "ADJUSTMENT",
  "OTHER",
];

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

export default function DynamicLineItemManager({
  lineItems,
  onChange,
  allowEdit = true,
  onUndo,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DynamicLineItem | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<LesSection>>(new Set());
  const [deletedItem, setDeletedItem] = useState<DynamicLineItem | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Group items by section
  const itemsBySection = useMemo(() => {
    const groups: Record<LesSection, DynamicLineItem[]> = {
      ALLOWANCE: [],
      TAX: [],
      DEDUCTION: [],
      ALLOTMENT: [],
      DEBT: [],
      ADJUSTMENT: [],
      OTHER: [],
    };

    lineItems.forEach((item) => {
      groups[item.section].push(item);
    });

    return groups;
  }, [lineItems]);

  // Calculate totals by section
  const sectionTotals = useMemo(() => {
    const totals: Record<LesSection, number> = {
      ALLOWANCE: 0,
      TAX: 0,
      DEDUCTION: 0,
      ALLOTMENT: 0,
      DEBT: 0,
      ADJUSTMENT: 0,
      OTHER: 0,
    };

    lineItems.forEach((item) => {
      totals[item.section] += item.amount_cents;
    });

    return totals;
  }, [lineItems]);

  // Get existing codes for duplicate detection
  const existingCodes = useMemo(() => {
    return lineItems.map((item) => item.line_code);
  }, [lineItems]);

  // Handle add new item
  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Handle update item (inline editing)
  const handleUpdate = useCallback(
    (id: string, amountCents: number) => {
      onChange(
        lineItems.map((item) => (item.id === id ? { ...item, amount_cents: amountCents } : item))
      );
    },
    [lineItems, onChange]
  );

  // Handle delete item with undo
  const handleDelete = useCallback(
    (id: string) => {
      const itemToDelete = lineItems.find((item) => item.id === id);
      if (!itemToDelete) return;

      // Remove item
      onChange(lineItems.filter((item) => item.id !== id));

      // Store for undo
      setDeletedItem(itemToDelete);
      if (undoTimeout) clearTimeout(undoTimeout);

      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        setDeletedItem(null);
      }, 5000);
      setUndoTimeout(timeout);

      // Call parent undo callback if provided
      if (onUndo) {
        onUndo(itemToDelete);
      }
    },
    [lineItems, onChange, onUndo, undoTimeout]
  );

  // Handle undo delete
  const handleUndo = useCallback(() => {
    if (deletedItem && undoTimeout) {
      clearTimeout(undoTimeout);
      onChange([...lineItems, deletedItem]);
      setDeletedItem(null);
      setUndoTimeout(null);
    }
  }, [deletedItem, lineItems, onChange, undoTimeout]);

  // Handle save from modal
  const handleSave = useCallback(
    (itemData: Omit<DynamicLineItem, "id">) => {
      if (editingItem) {
        // Update existing item
        onChange(
          lineItems.map((item) =>
            item.id === editingItem.id
              ? { ...itemData, id: editingItem.id, dbId: editingItem.dbId }
              : item
          )
        );
      } else {
        // Add new item
        onChange([
          ...lineItems,
          {
            ...itemData,
            id: generateLineItemId(),
          },
        ]);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    },
    [editingItem, lineItems, onChange]
  );

  // Toggle section collapse
  const toggleSection = (section: LesSection) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isEmpty = lineItems.length === 0;

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      {allowEdit && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            aria-label="Add new line item"
          >
            <Icon name="Plus" className="h-4 w-4" />
            <span className="hidden sm:inline">Add Line Item</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Icon name="File" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h4 className="mb-2 text-lg font-semibold text-gray-900">No line items yet</h4>
          <p className="mb-4 text-sm text-gray-600">
            Start by adding your LES line items. You can add allowances, taxes, deductions, and
            more.
          </p>
          {allowEdit && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Icon name="Plus" className="h-4 w-4" />
              Add Your First Line Item
            </button>
          )}
        </div>
      )}

      {/* Line Items by Section */}
      {!isEmpty && (
        <div className="space-y-4">
          {SECTION_ORDER.map((section) => {
            const items = itemsBySection[section];
            if (items.length === 0) return null;

            const isCollapsed = collapsedSections.has(section);
            const total = sectionTotals[section];

            return (
              <div key={section} className="rounded-lg border border-gray-200 bg-white">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section)}
                  className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon name={SECTION_ICONS[section] as any} className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{SECTION_LABELS[section]}</span>
                    <Badge variant="info">{items.length}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    {total > 0 && (
                      <span className="text-sm font-semibold text-gray-700">
                        {formatAmount(total)}
                      </span>
                    )}
                    <Icon
                      name={isCollapsed ? "ChevronDown" : "ChevronUp"}
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                </button>

                {/* Section Items */}
                {!isCollapsed && (
                  <div className="space-y-2 px-4 pb-4">
                    {items.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {!isEmpty && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Line Items</span>
            <span className="text-lg font-bold text-gray-900">{lineItems.length}</span>
          </div>
        </div>
      )}

      {/* Undo Delete Toast */}
      {deletedItem && (
        <div className="animate-in slide-in-from-bottom-4 fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-lg">
          <div className="flex items-center gap-4">
            <Icon name="Trash2" className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-gray-900">Item deleted</p>
              <p className="text-sm text-gray-600">{deletedItem.description}</p>
            </div>
            <button
              onClick={handleUndo}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {allowEdit && (
        <AddLineItemModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          editingItem={editingItem}
          existingCodes={editingItem ? [] : existingCodes}
        />
      )}
    </div>
  );
}
