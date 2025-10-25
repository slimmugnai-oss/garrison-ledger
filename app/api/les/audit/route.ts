/**
 * LES MANUAL AUDIT ENDPOINT (V2 - Structured Format)
 * 
 * POST /api/les/audit
 * - Accepts structured manual LES entry with sections (allowances, taxes, deductions)
 * - Validates and normalizes line codes
 * - Computes expected values from DFAS tables
 * - Compares actual vs expected
 * - Generates actionable flags
 * 
 * Security:
 * - Clerk authentication required
 * - Rate limiting: 50 audits/day/user
 * - RLS enforced on database
 * 
 * Runtime: Node.js
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { normalizeLineCode } from '@/lib/les/codes';
import { compareDetailed } from '@/lib/les/compare';
import { buildExpectedSnapshotWithBases } from '@/lib/les/expected';
import { checkAndIncrement } from '@/lib/limits';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LineItem {
  code: string;
  description: string;
  amount_cents: number;
}

interface AuditRequest {
  month: number;  // 1-12
  year: number;   // 2020-2099
  profile: {
    paygrade: string;     // E01-E09, O01-O10, W01-W05
    yos: number;          // Years of service
    mhaOrZip: string;     // MHA code or ZIP
    withDependents: boolean;
    specials?: {
      sdap?: boolean;
      hfp?: boolean;
      fsa?: boolean;
      flpp?: boolean;
    };
  };
  actual: {
    allowances: LineItem[];
    taxes: LineItem[];
    deductions: LineItem[];
    allotments?: LineItem[];
    debts?: LineItem[];
    adjustments?: LineItem[];
  };
  net_pay_cents: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ===========================================================================
    // 1. AUTHENTICATION
    // ===========================================================================
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ===========================================================================
    // 2. RATE LIMITING (50 audits/day/user)
    // ===========================================================================
    const { allowed } = await checkAndIncrement(userId, '/api/les/audit', 50);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 50 audits per day.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }

    // ===========================================================================
    // 3. PARSE & VALIDATE REQUEST
    // ===========================================================================
    const body: AuditRequest = await req.json();
    const { month, year, profile, actual, net_pay_cents } = body;

    if (!month || !year || !profile || !actual || net_pay_cents === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: month, year, profile, actual, net_pay_cents' },
        { status: 400 }
      );
    }

    // ===========================================================================
    // 4. NORMALIZE LINE CODES (handle user variations)
    // ===========================================================================
    const normalizeSection = (items: LineItem[] = []) => items.map(item => ({
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

    // ===========================================================================
    // 5. CREATE AUDIT RECORD
    // ===========================================================================
    const { data: uploadRecord, error: uploadError } = await supabaseAdmin
      .from('les_uploads')
      .insert({
        user_id: userId,
        entry_type: 'manual',
        month,
        year,
        audit_status: 'draft',
        profile_snapshot: profile,
        original_filename: `manual-${year}-${String(month).padStart(2, '0')}`,
        storage_path: '',
        size_bytes: 0
      })
      .select()
      .single();

    if (uploadError || !uploadRecord) {
      logger.error('[LES Audit] Failed to create audit record', { userId, error: uploadError });
      return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
    }

    // ===========================================================================
    // 6. INSERT LINE ITEMS
    // ===========================================================================
    const allLines = [
      ...normalizedActual.allowances.map(item => ({ ...item, section: 'ALLOWANCE' as const })),
      ...normalizedActual.taxes.map(item => ({ ...item, section: 'TAX' as const })),
      ...normalizedActual.deductions.map(item => ({ ...item, section: 'DEDUCTION' as const })),
      ...normalizedActual.allotments.map(item => ({ ...item, section: 'ALLOTMENT' as const })),
      ...normalizedActual.debts.map(item => ({ ...item, section: 'DEBT' as const })),
      ...normalizedActual.adjustments.map(item => ({ ...item, section: 'ADJUSTMENT' as const }))
    ];

    const lineInserts = allLines.map(item => ({
      upload_id: uploadRecord.id,
      line_code: item.code,
      description: item.description,
      amount_cents: item.amount_cents,
      section: item.section,
      taxability: {} // Will be computed from codes.ts definitions
    }));

    await supabaseAdmin.from('les_lines').insert(lineInserts);

    // ===========================================================================
    // 7. COMPUTE EXPECTED VALUES
    // ===========================================================================
    const { expected, taxable_bases } = await buildExpectedSnapshotWithBases({
      userId,
      paygrade: profile.paygrade,
      yos: profile.yos,
      mhaOrZip: profile.mhaOrZip,
      withDependents: profile.withDependents,
      specials: profile.specials
    });

    // ===========================================================================
    // 8. RUN COMPARISON
    // ===========================================================================
    const comparisonResult = compareDetailed({
      expected,
      taxable_bases,
      actualLines: allLines.map(l => ({
        line_code: l.code,
        amount_cents: l.amount_cents,
        section: l.section
      })),
      netPayCents: net_pay_cents
    });

    // ===========================================================================
    // 9. STORE FLAGS
    // ===========================================================================
    const flagInserts = comparisonResult.flags.map(flag => ({
      upload_id: uploadRecord.id,
      severity: flag.severity,
      flag_code: flag.flag_code,
      message: flag.message,
      suggestion: flag.suggestion,
      delta_cents: flag.delta_cents,
      ref_url: flag.ref_url
    }));

    await supabaseAdmin.from('pay_flags').insert(flagInserts);

    // ===========================================================================
    // 10. UPDATE AUDIT STATUS
    // ===========================================================================
    await supabaseAdmin
      .from('les_uploads')
      .update({
        audit_status: 'completed',
        audit_completed_at: new Date().toISOString()
      })
      .eq('id', uploadRecord.id);

    // ===========================================================================
    // 11. EMIT ANALYTICS
    // ===========================================================================
    await supabaseAdmin.from('analytics_events').insert({
      user_id: userId,
      event_name: 'les_audit_run',
      properties: {
        entry_type: 'manual',
        month,
        year,
        red_flags: comparisonResult.flags.filter(f => f.severity === 'red').length,
        yellow_flags: comparisonResult.flags.filter(f => f.severity === 'yellow').length,
        green_flags: comparisonResult.flags.filter(f => f.severity === 'green').length,
        duration_ms: Date.now() - startTime
      }
    });

    logger.info('[LES Audit] Audit completed', {
      userId,
      uploadId: uploadRecord.id,
      flags: comparisonResult.flags.length,
      durationMs: Date.now() - startTime
    });

    // ===========================================================================
    // 12. RETURN RESULTS
    // ===========================================================================
    return NextResponse.json({
      summary: comparisonResult.summary,
      flags: comparisonResult.flags,
      mathProof: comparisonResult.mathProof,
      expected,
      taxable_bases,
      auditId: uploadRecord.id
    });

  } catch (error) {
    logger.error('[LES Audit] Error processing audit', { error });
    return NextResponse.json(
      { error: 'Failed to process audit. Please try again.' },
      { status: 500 }
    );
  }
}
