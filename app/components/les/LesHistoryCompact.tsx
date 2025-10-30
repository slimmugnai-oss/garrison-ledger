"use client";

/**
 * LES HISTORY COMPACT
 * 
 * Compact version of audit history for sidebar display
 * - Collapsible list of recent audits
 * - Load/delete actions
 * - Responsive to tier (premium only)
 */

import React, { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { Tier } from "@/lib/auth/subscription";

interface AuditHistoryItem {
  id: string;
  month: number;
  year: number;
  created_at: string;
  variance?: number;
}

interface LesHistoryCompactProps {
  history: AuditHistoryItem[];
  loading: boolean;
  tier: Tier;
  onSave?: () => void;
  saving?: boolean;
}

export default function LesHistoryCompact({
  history,
  loading,
  tier,
  onSave,
  saving = false,
}: LesHistoryCompactProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPremium = tier === "premium" || tier === "staff";

  if (!isPremium) return null;

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Icon name="Archive" className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-900">Saved Audits</span>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Badge variant="info" className="text-xs">{history.length}</Badge>
          )}
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            className="h-4 w-4 text-slate-400"
          />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="py-4 text-center">
              <Icon name="RefreshCw" className="mx-auto h-6 w-6 animate-spin text-slate-400" />
              <p className="mt-2 text-xs text-slate-600">Loading...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-md bg-slate-50 p-4 text-center">
              <Icon name="File" className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-xs font-medium text-slate-600 mb-1">No saved audits yet</p>
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="mt-2 inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Icon name="Download" className="h-3 w-3" />
                  {saving ? "Saving..." : "Save Current"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((audit) => (
                <div
                  key={audit.id}
                  className="rounded-md border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {new Date(2000, audit.month - 1).toLocaleString("default", { month: "short" })}{" "}
                        {audit.year}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => alert("Load audit functionality coming soon")}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label="Load audit"
                        title="Load"
                      >
                        <Icon name="Upload" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete audit? This cannot be undone.`)) {
                            alert("Delete audit functionality coming soon");
                          }
                        }}
                        className="rounded p-1 text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Delete audit"
                        title="Delete"
                      >
                        <Icon name="Trash2" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {history.length > 5 && (
                <p className="text-xs text-center text-slate-500 pt-2">
                  +{history.length - 5} more audits
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

