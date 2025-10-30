"use client";

/**
 * LINE ITEM ROW
 * 
 * Inline editable row for a single LES line item
 * - Currency input with live editing
 * - Badges for Custom/Parsed/Auto-calc
 * - Delete action
 * - Touch-friendly (44px min height)
 */

import React, { useState, useRef, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import type { DynamicLineItem } from "@/app/types/les";
import { formatCurrency } from "@/lib/utils/currency";

interface LineItemRowProps {
  item: DynamicLineItem;
  onUpdate: (id: string, amountCents: number) => void;
  onDelete: (id: string) => void;
  isAutoCalculated?: boolean;
  autoCalcWarning?: string;
}

export default function LineItemRow({
  item,
  onUpdate,
  onDelete,
  isAutoCalculated = false,
  autoCalcWarning,
}: LineItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((item.amount_cents / 100).toFixed(2));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue((item.amount_cents / 100).toFixed(2));
  };

  // Handle save
  const handleSave = () => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value >= 0 && value <= 999999) {
      const cents = Math.round(value * 100);
      onUpdate(item.id, cents);
    }
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditValue((item.amount_cents / 100).toFixed(2));
    setIsEditing(false);
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Auto-cancel delete confirmation after 3s
  useEffect(() => {
    if (!showDeleteConfirm) return;
    const timer = setTimeout(() => setShowDeleteConfirm(false), 3000);
    return () => clearTimeout(timer);
  }, [showDeleteConfirm]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // Focus input when edit mode activates
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="group flex items-center justify-between gap-3 py-2.5 px-3 rounded-md hover:bg-slate-50 transition-colors min-h-[44px]">
      {/* Left: Code + Description + Badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-semibold text-slate-800">
            {item.line_code}
          </span>
          
          {item.isCustom && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Icon name="AlertTriangle" className="h-3 w-3" />
              Custom
            </span>
          )}
          
          {item.isParsed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              <Icon name="Upload" className="h-3 w-3" />
              Parsed
            </span>
          )}
          
          {isAutoCalculated && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <Icon name="Calculator" className="h-3 w-3" />
              Auto-calc
            </span>
          )}
        </div>
        
        <p className="text-sm text-slate-600 truncate mt-0.5">{item.description}</p>
        
        {isAutoCalculated && autoCalcWarning && isEditing && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Icon name="AlertTriangle" className="h-3 w-3" />
            {autoCalcWarning}
          </p>
        )}
      </div>

      {/* Right: Amount + Actions */}
      <div className="flex items-center gap-2">
        {/* Amount */}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0"
                max="999999"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="w-28 rounded-md border-blue-300 pl-6 pr-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="rounded-md p-1.5 text-green-600 hover:bg-green-50 transition-colors"
              aria-label="Save"
            >
              <Icon name="Check" className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Cancel"
            >
              <Icon name="X" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleEditClick}
              className="min-w-[100px] text-right font-semibold text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors text-lg"
            >
              {formatCurrency(item.amount_cents)}
            </button>
            
            {/* Delete button (visible on hover or mobile) */}
            <button
              onClick={handleDelete}
              className={`rounded-md p-1.5 transition-colors ${
                showDeleteConfirm
                  ? "bg-red-100 text-red-600"
                  : "text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 sm:opacity-100"
              }`}
              aria-label={showDeleteConfirm ? "Click again to confirm deletion" : "Delete item"}
              title={showDeleteConfirm ? "Click again to confirm" : "Delete"}
            >
              <Icon name="Trash2" className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
