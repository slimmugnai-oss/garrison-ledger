'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';
import type { PayFlag, FlagSeverity } from '@/app/types/les';
import { centsToDoollars } from '@/app/types/les';

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

  // Sort flags by severity
  const redFlags = flags.filter(f => f.severity === 'red');
  const yellowFlags = flags.filter(f => f.severity === 'yellow');
  const greenFlags = flags.filter(f => f.severity === 'green');

  // Free tier: show max 2 flags
  const isFree = tier === 'free';
  const visibleFlags = isFree ? flags.slice(0, 2) : flags;
  const hiddenCount = isFree && flags.length > 2 ? flags.length - 2 : 0;

  const handleCopyTemplate = async (flag: PayFlag, index: number) => {
    const template = generateEmailTemplate(flag, summary);
    
    try {
      await navigator.clipboard.writeText(template);
      setCopiedFlagId(`${index}`);
      setTimeout(() => setCopiedFlagId(null), 2000);
      
      // Track analytics
      if (typeof window !== 'undefined') {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'les_copy_template',
            properties: { flag_code: flag.flag_code },
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (err) {
      console.error('Error tracking LES copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="BarChart" className="h-5 w-5 text-blue-600" />
          Audit Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {redFlags.length}
            </div>
            <div className="text-sm text-red-600 font-medium">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {yellowFlags.length}
            </div>
            <div className="text-sm text-amber-600 font-medium">Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {greenFlags.length}
            </div>
            <div className="text-sm text-green-600 font-medium">Verified</div>
          </div>
        </div>
        {summary.deltaCents !== 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">Total Variance</div>
            <div className={`text-xl font-bold ${summary.deltaCents > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.deltaCents > 0 ? '+' : ''}{centsToDoollars(summary.deltaCents)}
              <span className="text-sm font-normal text-gray-600 ml-2">
                {summary.deltaCents > 0 ? '(underpaid)' : '(overpaid)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Red Flags (Critical) */}
      {redFlags.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-red-900 flex items-center gap-2">
            <Icon name="AlertCircle" className="h-5 w-5 text-red-600" />
            Critical Issues ({redFlags.length})
          </h3>
          {redFlags.slice(0, isFree ? Math.min(2, redFlags.length) : undefined).map((flag, idx) => (
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

      {/* Yellow Flags (Warnings) */}
      {yellowFlags.length > 0 && !isFree && (
        <div className="space-y-3">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
            Warnings ({yellowFlags.length})
          </h3>
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

      {/* Green Flags (All Clear) */}
      {greenFlags.length > 0 && !isFree && (
        <div className="space-y-3">
          <h3 className="font-semibold text-green-900 flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
            Verified Correct ({greenFlags.length})
          </h3>
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

      {/* Premium Upsell (Free Tier) */}
      {hiddenCount > 0 && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-6 text-center">
          <Icon name="Lock" className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-blue-900 mb-2">
            {hiddenCount} More Finding{hiddenCount > 1 ? 's' : ''} Available
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Upgrade to Premium to view all audit findings and get unlimited LES uploads.
          </p>
          <Link
            href="/dashboard/upgrade?feature=paycheck-audit"
            className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Unlock All Findings
          </Link>
        </div>
      )}
    </div>
  );
}

// Flag Card Component
function FlagCard({
  flag,
  index,
  onCopy,
  copied,
  showCopy = true
}: {
  flag: PayFlag;
  index: number;
  onCopy: () => void;
  copied: boolean;
  showCopy?: boolean;
}) {
  const severityColors = {
    red: 'border-red-300 bg-red-50',
    yellow: 'border-amber-300 bg-amber-50',
    green: 'border-green-300 bg-green-50'
  };

  const severityIcons: Record<FlagSeverity, any> = {
    red: 'AlertCircle',
    yellow: 'AlertTriangle',
    green: 'CheckCircle'
  };

  const severityIconColors = {
    red: 'text-red-600',
    yellow: 'text-amber-600',
    green: 'text-green-600'
  };

  return (
    <div className={`rounded-lg border p-6 ${severityColors[flag.severity]}`}>
      <div className="flex items-start gap-4">
        <Icon
          name={severityIcons[flag.severity]}
          className={`h-6 w-6 ${severityIconColors[flag.severity]} flex-shrink-0`}
        />
        <div className="flex-1 min-w-0">
          {/* Message (BLUF) */}
          <h4 className="font-semibold mb-2">{flag.message}</h4>
          
          {/* Suggestion */}
          <p className="text-sm mb-4 text-gray-700">
            <strong>What to do:</strong> {flag.suggestion}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {showCopy && flag.severity !== 'green' && (
              <button
                onClick={onCopy}
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium border hover:bg-gray-50 transition-colors"
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
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
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
function generateEmailTemplate(flag: PayFlag, summary: any): string {
  const now = new Date();
  const monthYear = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return `Subject: Pay Discrepancy – ${flag.flag_code.replace(/_/g, ' ')} (${monthYear})

BLUF: ${flag.message}

What to do next:
${flag.suggestion}

${flag.ref_url ? `Reference: ${flag.ref_url}` : ''}

Respectfully,
[Your Name]
[Rank/Rate]
[SSN Last 4]

---
Generated by Garrison Ledger Paycheck Audit
This is an unofficial audit. Verify all information with your finance office.
`;
}

