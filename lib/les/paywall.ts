/**
 * LES AUDITOR PAYWALL MASKING
 * 
 * Server-side masking of audit results based on user tier.
 * Ensures free users cannot access premium data via API inspection.
 * 
 * Security: All masking happens server-side. Never send exact values to free tier clients.
 */

import type { PayFlag } from '@/app/types/les';
import type { getLesAuditPolicy } from '@/lib/auth/subscription';

export interface AuditResult {
  flags: PayFlag[];
  totals: {
    total_allowances: number;
    total_deductions: number;
    total_taxes: number;
    total_allotments: number;
    total_debts: number;
    total_adjustments: number;
    computed_net: number;
    actual_net: number;
    net_delta: number;
  };
  waterfall: WaterfallRow[];
  mathProof: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface WaterfallRow {
  label: string;
  amount: number;
  type: 'add' | 'subtract';
  section: 'allowance' | 'deduction' | 'tax' | 'allotment' | 'debt' | 'adjustment' | 'net';
}

export interface MaskedAuditResult {
  flags: PayFlag[];
  hiddenFlagCount: number;
  totals: {
    total_allowances: number | null;
    total_deductions: number | null;
    total_taxes: number | null;
    computed_net: number | null;
    actual_net: number;
    variance: number | null;
    varianceBucket: '0-5' | '5-50' | '>50' | '>100';
  };
  waterfall: WaterfallRow[] | null;
  mathProof: string | null;
  confidence: 'high' | 'medium' | 'low';
  requiresUpgrade: boolean;
  pdfUrl: string | null;
}

/**
 * Calculate variance bucket for free tier display
 */
function getVarianceBucket(varianceCents: number): '0-5' | '5-50' | '>50' | '>100' {
  const absVariance = Math.abs(varianceCents);
  
  if (absVariance <= 500) return '0-5';        // $0-$5
  if (absVariance <= 5000) return '5-50';      // $5-$50
  if (absVariance <= 10000) return '>50';      // $50-$100
  return '>100';                                // >$100
}

/**
 * Apply tier-based masking to audit results
 * 
 * Free tier sees:
 * - Top 2 flags only
 * - Variance bucket (not exact amount)
 * - No waterfall details
 * - No PDF access
 * 
 * Premium tier sees:
 * - All flags
 * - Exact variance
 * - Full waterfall
 * - PDF generation
 * 
 * @param fullResult - Complete unmasked audit result
 * @param policy - Tier policy from getLesAuditPolicy()
 * @returns Masked result appropriate for user's tier
 */
export function applyAuditMasking(
  fullResult: AuditResult,
  policy: ReturnType<typeof getLesAuditPolicy>
): MaskedAuditResult {
  // Premium/staff users get everything
  if (policy.showExactVariance) {
    return {
      flags: fullResult.flags,
      hiddenFlagCount: 0,
      totals: {
        total_allowances: fullResult.totals.total_allowances,
        total_deductions: fullResult.totals.total_deductions,
        total_taxes: fullResult.totals.total_taxes,
        computed_net: fullResult.totals.computed_net,
        actual_net: fullResult.totals.actual_net,
        variance: fullResult.totals.net_delta,
        varianceBucket: getVarianceBucket(fullResult.totals.net_delta)
      },
      waterfall: fullResult.waterfall,
      mathProof: fullResult.mathProof,
      confidence: fullResult.confidence,
      requiresUpgrade: false,
      pdfUrl: null // Set separately after save
    };
  }
  
  // Free tier - mask sensitive data
  const visibleFlags = fullResult.flags
    .sort((a, b) => {
      // Sort by severity (red > yellow > green), then by delta
      const severityOrder = { red: 0, yellow: 1, green: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return Math.abs(b.delta_cents || 0) - Math.abs(a.delta_cents || 0);
    })
    .slice(0, policy.maxVisibleFlags);
  
  return {
    flags: visibleFlags,
    hiddenFlagCount: Math.max(0, fullResult.flags.length - policy.maxVisibleFlags),
    totals: {
      total_allowances: null,  // Hidden for free
      total_deductions: null,  // Hidden for free
      total_taxes: null,       // Hidden for free
      computed_net: null,      // Hidden for free
      actual_net: fullResult.totals.actual_net,  // Always show (user entered)
      variance: null,          // Hidden - show bucket instead
      varianceBucket: getVarianceBucket(fullResult.totals.net_delta)
    },
    waterfall: null,  // Locked for free
    mathProof: null,  // Locked for free
    confidence: fullResult.confidence,
    requiresUpgrade: true,
    pdfUrl: null
  };
}

/**
 * Build variance waterfall for detailed reconciliation
 * Shows exactly how expected net becomes actual net
 */
export function buildVarianceWaterfall(totals: AuditResult['totals']): WaterfallRow[] {
  return [
    {
      label: 'Total Entitlements',
      amount: totals.total_allowances,
      type: 'add',
      section: 'allowance'
    },
    {
      label: 'Federal & State Taxes',
      amount: totals.total_taxes,
      type: 'subtract',
      section: 'tax'
    },
    {
      label: 'Deductions (TSP, SGLI, Dental)',
      amount: totals.total_deductions,
      type: 'subtract',
      section: 'deduction'
    },
    {
      label: 'Allotments',
      amount: totals.total_allotments,
      type: 'subtract',
      section: 'allotment'
    },
    {
      label: 'Debts & Collections',
      amount: totals.total_debts,
      type: 'subtract',
      section: 'debt'
    },
    {
      label: 'Adjustments',
      amount: totals.total_adjustments,
      type: 'add',
      section: 'adjustment'
    },
    {
      label: 'Expected Net Pay',
      amount: totals.computed_net,
      type: 'add',
      section: 'net'
    }
  ];
}

