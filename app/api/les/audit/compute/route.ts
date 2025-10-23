/**
 * LES AUDIT REAL-TIME COMPUTE ENDPOINT
 * 
 * POST /api/les/audit/compute
 * - Called on every input change (debounced 400ms client-side)
 * - Computes expected values from DFAS tables (server-only)
 * - Runs comparison and generates flags
 * - Masks results based on user tier (free vs premium)
 * - Does NOT persist to database (that's /save)
 * 
 * Security:
 * - Clerk authentication required
 * - Server-side tier checking
 * - Exact values masked for free tier
 * - No rate limiting (computation is cheap, real-time UX critical)
 * 
 * Runtime: Edge (fast response time)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserTier, getLesAuditPolicy } from '@/lib/auth/subscription';
import { buildExpectedSnapshotWithBases } from '@/lib/les/expected';
import { compareDetailed } from '@/lib/les/compare';
import { applyAuditMasking, buildVarianceWaterfall, type AuditResult } from '@/lib/les/paywall';
import { normalizeLineCode } from '@/lib/les/codes';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';  // Need nodejs for Supabase queries
export const dynamic = 'force-dynamic';

interface ComputeRequest {
  month: number;
  year: number;
  profile: {
    paygrade: string;
    yos: number;
    mhaOrZip: string;
    withDependents: boolean;
    specials?: {
      sdap?: boolean;
      hfp?: boolean;
      fsa?: boolean;
      flpp?: boolean;
    };
  };
  actual: {
    allowances: Array<{ code: string; amount_cents: number }>;
    taxes: Array<{ code: string; amount_cents: number }>;
    deductions: Array<{ code: string; amount_cents: number }>;
    allotments?: Array<{ code: string; amount_cents: number }>;
    debts?: Array<{ code: string; amount_cents: number }>;
    adjustments?: Array<{ code: string; amount_cents: number }>;
  };
  net_pay_cents?: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ============================================================================
    // 1. AUTHENTICATION
    // ============================================================================
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================================================
    // 2. GET USER TIER & POLICY
    // ============================================================================
    const tier = await getUserTier(userId);
    const policy = getLesAuditPolicy(tier);

    // ============================================================================
    // 3. PARSE REQUEST
    // ============================================================================
    const body: ComputeRequest = await req.json();
    const { month, year, profile, actual, net_pay_cents } = body;

    // Validation
    if (!month || !year || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields: month, year, profile' },
        { status: 400 }
      );
    }

    // ============================================================================
    // 4. NORMALIZE LINE CODES
    // ============================================================================
    const normalizeSection = (items: Array<{ code: string; amount_cents: number }> = []) =>
      items.map(item => ({
        ...item,
        code: normalizeLineCode(item.code)
      }));

    const normalizedActual = {
      allowances: normalizeSection(actual.allowances),
      taxes: normalizeSection(actual.taxes),
      deductions: normalizeSection(actual.deductions),
      allotments: normalizeSection(actual.allotments),
      debts: normalizeSection(actual.debts),
      adjustments: normalizeSection(actual.adjustments)
    };

    // ============================================================================
    // 5. BUILD EXPECTED SNAPSHOT (server-only - DFAS tables)
    // ============================================================================
    const { expected, taxable_bases } = await buildExpectedSnapshotWithBases({
      userId,
      paygrade: profile.paygrade,
      yos: profile.yos,
      mhaOrZip: profile.mhaOrZip,
      withDependents: profile.withDependents,
      specials: profile.specials
    });

    // ============================================================================
    // 6. COMPUTE COMPARISON
    // ============================================================================
    const allLines = [
      ...normalizedActual.allowances.map(item => ({ ...item, line_code: item.code, section: 'ALLOWANCE' as const })),
      ...normalizedActual.taxes.map(item => ({ ...item, line_code: item.code, section: 'TAX' as const })),
      ...normalizedActual.deductions.map(item => ({ ...item, line_code: item.code, section: 'DEDUCTION' as const })),
      ...normalizedActual.allotments.map(item => ({ ...item, line_code: item.code, section: 'ALLOTMENT' as const })),
      ...normalizedActual.debts.map(item => ({ ...item, line_code: item.code, section: 'DEBT' as const })),
      ...normalizedActual.adjustments.map(item => ({ ...item, line_code: item.code, section: 'ADJUSTMENT' as const }))
    ];

    const comparisonResult = compareDetailed({
      expected,
      taxable_bases,
      actualLines: allLines,
      netPayCents: net_pay_cents || 0
    });

    // ============================================================================
    // 7. BUILD WATERFALL
    // ============================================================================
    const waterfall = buildVarianceWaterfall(comparisonResult.summary);

    // ============================================================================
    // 8. DETERMINE CONFIDENCE
    // ============================================================================
    // High: All required data present and from current tables
    // Medium: Some optional data missing
    // Low: Data gaps or mid-month changes detected
    
    let confidence: 'high' | 'medium' | 'low' = 'high';
    
    // Check for data availability issues
    if (!expected.bah_cents && profile.mhaOrZip) {
      confidence = 'low';  // BAH data unavailable
    } else if (!net_pay_cents) {
      confidence = 'medium';  // User hasn't entered net pay yet
    } else if (!actual.taxes || actual.taxes.length === 0) {
      confidence = 'medium';  // Tax data incomplete
    }

    // ============================================================================
    // 9. APPLY TIER-BASED MASKING
    // ============================================================================
    const fullResult: AuditResult = {
      flags: comparisonResult.flags,
      totals: comparisonResult.summary,
      waterfall,
      mathProof: comparisonResult.mathProof,
      confidence
    };

    const masked = applyAuditMasking(fullResult, policy);

    // ============================================================================
    // 10. ANALYTICS (sampled for free users)
    // ============================================================================
    const shouldTrack = tier === 'premium' || tier === 'staff' || Math.random() < 0.1;
    if (shouldTrack) {
      await supabaseAdmin.from('analytics_events').insert({
        user_id: userId,
        event_name: 'les_auto_audit_compute',
        properties: {
          tier,
          flagCount: fullResult.flags.length,
          hiddenCount: masked.hiddenFlagCount,
          confidence,
          varianceBucket: masked.totals.varianceBucket,
          duration_ms: Date.now() - startTime
        }
      });
    }

    // ============================================================================
    // 11. RETURN MASKED RESULT
    // ============================================================================
    return NextResponse.json({
      ...masked,
      tier,  // Client can use this for UI decisions
      policy: {
        maxVisibleFlags: policy.maxVisibleFlags,
        allowPdf: policy.allowPdf,
        allowHistory: policy.allowHistory
      }
    });

  } catch (error) {
    console.error('[LES Compute] Error:', error);
    return NextResponse.json(
      { error: 'Computation failed. Please try again.' },
      { status: 500 }
    );
  }
}

