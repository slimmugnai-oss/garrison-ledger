"use client";

/**
 * LES FINDINGS COMPACT
 * 
 * Compact version of findings for sidebar display
 * - Collapsible with flag count badge
 * - Color-coded by severity
 * - Links to upgrade if needed
 */

import React, { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { Tier } from "@/lib/auth/subscription";

interface Flag {
  severity: "red" | "yellow" | "green";
  flag_code: string;
  message: string;
  suggestion?: string;
}

interface LesFindingsCompactProps {
  flags: Flag[];
  tier: Tier;
  hiddenFlagCount?: number;
  onUpgrade: () => void;
}

export default function LesFindingsCompact({
  flags,
  tier,
  hiddenFlagCount = 0,
  onUpgrade,
}: LesFindingsCompactProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPremium = tier === "premium" || tier === "staff";
  
  const redFlags = flags.filter(f => f.severity === "red");
  const yellowFlags = flags.filter(f => f.severity === "yellow");
  const greenFlags = flags.filter(f => f.severity === "green");

  const totalFlags = flags.length;
  const visibleFlags = isPremium ? flags : flags.slice(0, 3);
  const hasHiddenFlags = hiddenFlagCount > 0 || (!isPremium && flags.length > 3);

  if (totalFlags === 0) return null;

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Icon name="AlertCircle" className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-900">Findings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {redFlags.length > 0 && (
              <Badge variant="danger" className="text-xs">{redFlags.length}</Badge>
            )}
            {yellowFlags.length > 0 && (
              <Badge variant="warning" className="text-xs">{yellowFlags.length}</Badge>
            )}
            {greenFlags.length > 0 && (
              <Badge variant="success" className="text-xs">{greenFlags.length}</Badge>
            )}
          </div>
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            className="h-4 w-4 text-slate-400"
          />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
          {visibleFlags.map((flag, idx) => (
            <div
              key={idx}
              className={`rounded-md p-3 text-xs ${
                flag.severity === "red"
                  ? "bg-red-50 border border-red-200"
                  : flag.severity === "yellow"
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <Icon
                  name={flag.severity === "red" ? "AlertTriangle" : flag.severity === "yellow" ? "AlertCircle" : "CheckCircle"}
                  className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                    flag.severity === "red"
                      ? "text-red-600"
                      : flag.severity === "yellow"
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{flag.message}</p>
                  {flag.suggestion && (
                    <p className="mt-1 text-slate-600">{flag.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasHiddenFlags && (
            <button
              onClick={onUpgrade}
              className="w-full rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Icon name="Crown" className="inline-block h-3 w-3 mr-1" />
              Upgrade to see all {isPremium ? hiddenFlagCount : flags.length - 3} findings
            </button>
          )}
        </div>
      )}
    </div>
  );
}

