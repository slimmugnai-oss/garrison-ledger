"use client";

/**
 * LES FINDINGS ACCORDION
 * 
 * Collapsible detailed findings section with colored severity sections
 * Critical Issues → Warnings → Verified Items
 */

import React, { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import type { PayFlag } from "@/app/types/les";

interface LesFindingsAccordionProps {
  flags: PayFlag[];
  tier: "free" | "premium" | "staff";
  hiddenFlagCount?: number;
  onUpgrade?: () => void;
}

export default function LesFindingsAccordion({
  flags,
  tier,
  hiddenFlagCount = 0,
  onUpgrade,
}: LesFindingsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [redFlagsExpanded, setRedFlagsExpanded] = useState(true);
  const [yellowFlagsExpanded, setYellowFlagsExpanded] = useState(true);
  const [greenFlagsExpanded, setGreenFlagsExpanded] = useState(false);

  const redFlags = flags.filter(f => f.severity === "red");
  const yellowFlags = flags.filter(f => f.severity === "yellow");
  const greenFlags = flags.filter(f => f.severity === "green");

  const isPremium = tier === "premium" || tier === "staff";

  const formatAmount = (cents: number) => {
    return `$${(Math.abs(cents) / 100).toFixed(2)}`;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "red": return "AlertCircle";
      case "yellow": return "AlertTriangle";
      case "green": return "CheckCircle";
      default: return "Info";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "red": return "text-red-600";
      case "yellow": return "text-amber-600";
      case "green": return "text-green-600";
      default: return "text-slate-600";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "red": return "border-red-200 bg-red-50";
      case "yellow": return "border-amber-200 bg-amber-50";
      case "green": return "border-green-200 bg-green-50";
      default: return "border-slate-200 bg-slate-50";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Detailed Findings</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
          {isExpanded ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Premium Gate */}
      {!isPremium ? (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-6 text-center">
          <Icon name="Lock" className="mx-auto mb-4 h-12 w-12 text-blue-600" />
          <h3 className="mb-3 text-xl font-semibold text-blue-900">
            Premium Feature: Complete LES Audit
          </h3>
          <p className="mb-2 text-sm text-blue-800">
            Your audit is complete, but full results are for Premium members only.
          </p>
          <p className="mb-6 text-sm text-blue-700">
            Premium unlocks: all flags, variance analysis, email templates, unlimited audits
          </p>
          <button
            onClick={onUpgrade}
            className="inline-block rounded-md bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Upgrade to Premium
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{redFlags.length}</div>
              <div className="text-sm font-medium text-slate-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{yellowFlags.length}</div>
              <div className="text-sm font-medium text-slate-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{greenFlags.length}</div>
              <div className="text-sm font-medium text-slate-600">Verified</div>
            </div>
          </div>

          {/* Detailed Findings */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Critical Issues */}
              {redFlags.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => setRedFlagsExpanded(!redFlagsExpanded)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <h4 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                      <Icon name="AlertCircle" className="h-5 w-5 text-red-600" />
                      Critical Issues
                      <Badge variant="danger" className="text-xs">
                        {redFlags.length}
                      </Badge>
                    </h4>
                    <Icon
                      name={redFlagsExpanded ? "ChevronUp" : "ChevronDown"}
                      className="h-5 w-5 text-slate-400"
                    />
                  </button>
                  {redFlagsExpanded && (
                    <div className="space-y-3 border-t border-slate-200 p-4">
                      {redFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-red-200 bg-red-50 p-4"
                        >
                          <div className="flex gap-3">
                            <Icon
                              name="AlertCircle"
                              className="h-5 w-5 flex-shrink-0 text-red-600"
                            />
                            <div className="flex-1 space-y-2">
                              <h5 className="text-sm font-semibold text-slate-900">
                                {flag.message}
                              </h5>
                              <p className="text-sm text-slate-600">
                                <strong>What to do:</strong> {flag.suggestion}
                              </p>
                              {flag.delta_cents && (
                                <p className="text-sm font-semibold text-red-600">
                                  Potential amount: {formatAmount(flag.delta_cents)}
                                </p>
                              )}
                              {flag.ref_url && (
                                <a
                                  href={flag.ref_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                  Learn More
                                  <Icon name="ExternalLink" className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Warnings */}
              {yellowFlags.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => setYellowFlagsExpanded(!yellowFlagsExpanded)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <h4 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                      <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
                      Warnings
                      <Badge variant="warning" className="text-xs">
                        {yellowFlags.length}
                      </Badge>
                    </h4>
                    <Icon
                      name={yellowFlagsExpanded ? "ChevronUp" : "ChevronDown"}
                      className="h-5 w-5 text-slate-400"
                    />
                  </button>
                  {yellowFlagsExpanded && (
                    <div className="space-y-3 border-t border-slate-200 p-4">
                      {yellowFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                        >
                          <div className="flex gap-3">
                            <Icon
                              name="AlertTriangle"
                              className="h-5 w-5 flex-shrink-0 text-amber-600"
                            />
                            <div className="flex-1 space-y-2">
                              <h5 className="text-sm font-semibold text-slate-900">
                                {flag.message}
                              </h5>
                              <p className="text-sm text-slate-600">
                                <strong>What to do:</strong> {flag.suggestion}
                              </p>
                              {flag.delta_cents && (
                                <p className="text-sm font-semibold text-amber-600">
                                  Variance: {formatAmount(flag.delta_cents)}
                                </p>
                              )}
                              {flag.ref_url && (
                                <a
                                  href={flag.ref_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                  Learn More
                                  <Icon name="ExternalLink" className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Verified Correct */}
              {greenFlags.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => setGreenFlagsExpanded(!greenFlagsExpanded)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <h4 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                      <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                      Verified Correct
                      <Badge variant="success" className="text-xs">
                        {greenFlags.length}
                      </Badge>
                    </h4>
                    <Icon
                      name={greenFlagsExpanded ? "ChevronUp" : "ChevronDown"}
                      className="h-5 w-5 text-slate-400"
                    />
                  </button>
                  {greenFlagsExpanded && (
                    <div className="space-y-3 border-t border-slate-200 p-4">
                      {greenFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-green-200 bg-green-50 p-4"
                        >
                          <div className="flex gap-3">
                            <Icon
                              name="CheckCircle"
                              className="h-5 w-5 flex-shrink-0 text-green-600"
                            />
                            <div className="flex-1 space-y-2">
                              <h5 className="text-sm font-semibold text-slate-900">
                                {flag.message}
                              </h5>
                              <p className="text-sm text-slate-600">
                                <strong>What to do:</strong> {flag.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hidden Flags (Free Tier) */}
              {hiddenFlagCount > 0 && (
                <div className="rounded-lg border border-blue-300 bg-blue-50 p-6 text-center">
                  <Icon name="Lock" className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                  <h3 className="mb-3 text-xl font-semibold text-blue-900">
                    {hiddenFlagCount} More Findings Hidden
                  </h3>
                  <p className="mb-2 text-sm text-blue-800">
                    Additional audit findings are available for Premium members.
                  </p>
                  <p className="mb-6 text-sm text-blue-700">
                    Upgrade to see all findings and detailed variance analysis.
                  </p>
                  <button
                    onClick={onUpgrade}
                    className="inline-block rounded-md bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
