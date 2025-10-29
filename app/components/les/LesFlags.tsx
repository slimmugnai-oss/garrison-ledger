"use client";

import Link from "next/link";
import { useState } from "react";

import Icon from "@/app/components/ui/Icon";
import type { PayFlag, FlagSeverity } from "@/app/types/les";
import { centsToDoollars } from "@/app/types/les";

interface Props {
  flags: PayFlag[];
  tier: string;
  summary: {
    actualAllowancesCents: number;
    expectedAllowancesCents: number;
    deltaCents: number;
  };
}

export default function LesFlags({ flags, tier, summary }: Props) {
  const [copiedFlagId, setCopiedFlagId] = useState<string | null>(null);
  
  // State for collapsible sections
  const [redFlagsExpanded, setRedFlagsExpanded] = useState(true);
  const [yellowFlagsExpanded, setYellowFlagsExpanded] = useState(true);
  const [greenFlagsExpanded, setGreenFlagsExpanded] = useState(false);

  // Sort flags by severity
  const redFlags = flags.filter((f) => f.severity === "red");
  const yellowFlags = flags.filter((f) => f.severity === "yellow");
  const greenFlags = flags.filter((f) => f.severity === "green");

  // Calculate total money potentially owed
  const calculateTotalOwed = (flags: PayFlag[]) => {
    return flags.reduce((total, flag) => {
      // Extract dollar amount from flag message if it contains a variance
      const match = flag.message.match(/\$[\d,]+\.?\d*/);
      if (match) {
        const amount = parseFloat(match[0].replace(/[$,]/g, ''));
        return total + amount;
      }
      return total;
    }, 0);
  };

  const totalOwed = calculateTotalOwed(redFlags);

  // Free tier: complete paywall (no partial info)
  const isFree = tier === "free";

  // Complete paywall for free users - no partial info shown
  if (isFree) {
    return (
      <div className="rounded-lg border border-blue-300 bg-blue-50 p-8 text-center">
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
        <Link
          href="/dashboard/upgrade?feature=paycheck-audit"
          className="inline-block rounded-md bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Upgrade to Premium
        </Link>
      </div>
    );
  }

  const handleCopyTemplate = async (flag: PayFlag, index: number) => {
    const template = generateEmailTemplate(flag, summary);

    try {
      await navigator.clipboard.writeText(template);
      setCopiedFlagId(`${index}`);
      setTimeout(() => setCopiedFlagId(null), 2000);

      // Track analytics
      if (typeof window !== "undefined") {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "les_copy_template",
            properties: { flag_code: flag.flag_code },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch {
      // Tracking error - non-critical
    }
  };

  // Premium users: show full audit results
  return (
    <div className="space-y-8">
      {/* Enhanced Summary Card */}
      <div className="rounded-xl border-2 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
        {/* Hero Metric - Total Variance */}
        <div className="mb-6 text-center">
          <div className="text-sm font-medium uppercase tracking-wide text-gray-600">
            Total Pay Variance
          </div>
          <div className={`text-5xl font-black ${summary.deltaCents > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {summary.deltaCents > 0 ? '+' : ''}{centsToDoollars(summary.deltaCents)}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {summary.deltaCents > 0 ? 'You may be owed money' : 'Everything looks correct'}
          </div>
        </div>
        
        {/* Issue Breakdown Grid */}
        <div className="grid grid-cols-3 gap-6 border-t pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{redFlags.length}</div>
            <div className="text-sm font-semibold text-red-600 uppercase tracking-wide">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{yellowFlags.length}</div>
            <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{greenFlags.length}</div>
            <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">Verified</div>
          </div>
        </div>
      </div>

      {/* Actionable Insights Dashboard */}
      {redFlags.length > 0 && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-900">
            <Icon name="DollarSign" className="h-6 w-6" />
            Action Required
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
              <span className="font-semibold text-gray-900">Total Money Potentially Owed:</span>
              <span className="text-2xl font-black text-red-600">
                ${totalOwed.toFixed(2)}
              </span>
            </div>
            <button className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700 transition-colors">
              Generate Finance Office Email
            </button>
          </div>
        </div>
      )}

      {/* Red Flags (Critical) with collapse */}
      {redFlags.length > 0 && (
        <div className="rounded-xl border-2 bg-white shadow-sm">
          <button 
            onClick={() => setRedFlagsExpanded(!redFlagsExpanded)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h3 className="flex items-center gap-3 text-xl font-bold text-red-900">
              <Icon name="AlertCircle" className="h-6 w-6 text-red-600" />
              Critical Issues
              <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                {redFlags.length}
              </span>
            </h3>
            <Icon name={redFlagsExpanded ? "ChevronUp" : "ChevronDown"} className="h-5 w-5" />
          </button>
          {redFlagsExpanded && (
            <div className="space-y-3 border-t px-6 pb-6 pt-4">
              {redFlags.map((flag, idx) => (
                <FlagCard
                  key={idx}
                  flag={flag}
                  index={idx}
                  onCopy={() => handleCopyTemplate(flag, idx)}
                  copied={copiedFlagId === `${idx}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yellow Flags (Warnings) with collapse */}
      {yellowFlags.length > 0 && (
        <div className="rounded-xl border-2 bg-white shadow-sm">
          <button 
            onClick={() => setYellowFlagsExpanded(!yellowFlagsExpanded)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h3 className="flex items-center gap-3 text-xl font-bold text-amber-900">
              <Icon name="AlertTriangle" className="h-6 w-6 text-amber-600" />
              Warnings
              <span className="rounded-full bg-amber-600 px-3 py-1 text-sm font-semibold text-white">
                {yellowFlags.length}
              </span>
            </h3>
            <Icon name={yellowFlagsExpanded ? "ChevronUp" : "ChevronDown"} className="h-5 w-5" />
          </button>
          {yellowFlagsExpanded && (
            <div className="space-y-3 border-t px-6 pb-6 pt-4">
              {yellowFlags.map((flag, idx) => (
                <FlagCard
                  key={idx}
                  flag={flag}
                  index={redFlags.length + idx}
                  onCopy={() => handleCopyTemplate(flag, idx)}
                  copied={copiedFlagId === `${redFlags.length + idx}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Green Flags (All Clear) with collapse */}
      {greenFlags.length > 0 && (
        <div className="rounded-xl border-2 bg-white shadow-sm">
          <button 
            onClick={() => setGreenFlagsExpanded(!greenFlagsExpanded)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h3 className="flex items-center gap-3 text-xl font-bold text-green-900">
              <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
              Verified Correct
              <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                {greenFlags.length}
              </span>
            </h3>
            <Icon name={greenFlagsExpanded ? "ChevronUp" : "ChevronDown"} className="h-5 w-5" />
          </button>
          {greenFlagsExpanded && (
            <div className="space-y-3 border-t px-6 pb-6 pt-4">
              {greenFlags.map((flag, idx) => (
                <FlagCard
                  key={idx}
                  flag={flag}
                  index={redFlags.length + yellowFlags.length + idx}
                  onCopy={() => handleCopyTemplate(flag, idx)}
                  copied={false}
                  showCopy={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export Options */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Export Options</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 transition-colors">
            <Icon name="Download" className="h-4 w-4" />
            Download PDF Report
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 transition-colors">
            <Icon name="Mail" className="h-4 w-4" />
            Email to Finance Office
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-3 font-semibold text-white hover:bg-gray-700 transition-colors">
            <Icon name="Save" className="h-4 w-4" />
            Save to History
          </button>
        </div>
      </div>
    </div>
  );
}

// Flag Card Component
function FlagCard({
  flag,
  index: _index,
  onCopy,
  copied,
  showCopy = true,
}: {
  flag: PayFlag;
  index: number;
  onCopy: () => void;
  copied: boolean;
  showCopy?: boolean;
}) {
  const severityColors = {
    red: "border-red-300 bg-red-50",
    yellow: "border-amber-300 bg-amber-50",
    green: "border-green-300 bg-green-50",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const severityIcons: Record<FlagSeverity, any> = {
    red: "AlertCircle",
    yellow: "AlertTriangle",
    green: "CheckCircle",
  };

  const severityIconColors = {
    red: "text-red-600",
    yellow: "text-amber-600",
    green: "text-green-600",
  };

  return (
    <div className={`rounded-xl border-2 p-4 md:p-6 ${severityColors[flag.severity]} shadow-sm`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Icon - larger on mobile */}
        <Icon
          name={severityIcons[flag.severity]}
          className={`h-8 w-8 md:h-6 md:w-6 ${severityIconColors[flag.severity]} flex-shrink-0`}
        />
        
        <div className="flex-1 space-y-3">
          {/* Stack message/suggestion vertically on mobile */}
          <h4 className="text-base font-bold md:text-lg">{flag.message}</h4>
          <p className="text-sm leading-relaxed text-gray-700">
            <strong>What to do:</strong> {flag.suggestion}
          </p>
          
          {/* Stack buttons vertically on mobile */}
          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            {showCopy && flag.severity !== "green" && (
              <button
                onClick={onCopy}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Icon name="Check" className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="h-4 w-4" />
                    Copy Email Template
                  </>
                )}
              </button>
            )}
            {flag.ref_url && (
              <a
                href={flag.ref_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Learn More
                <Icon name="ExternalLink" className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate email template for flag
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateEmailTemplate(flag: PayFlag, _summary: any): string {
  const now = new Date();
  const monthYear = `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  return `Subject: Pay Discrepancy – ${flag.flag_code.replace(/_/g, " ")} (${monthYear})

BLUF: ${flag.message}

What to do next:
${flag.suggestion}

${flag.ref_url ? `Reference: ${flag.ref_url}` : ""}

Respectfully,
[Your Name]
[Rank/Rate]
[SSN Last 4]

---
Generated by Garrison Ledger Paycheck Audit
This is an unofficial audit. Verify all information with your finance office.
`;
}
