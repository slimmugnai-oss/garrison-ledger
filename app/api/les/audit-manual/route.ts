/**
 * LES MANUAL ENTRY AUDIT ENDPOINT
 * 
 * POST /api/les/audit-manual
 * - Accepts manually-entered allowance values (no PDF)
 * - Creates manual entry record
 * - Runs same audit comparison logic
 * - Enforces same tier gating as PDF uploads
 * 
 * Security:
 * - Clerk authentication required
 * - Tier gating (Free: 1/month, Premium: unlimited)
 * - User ownership validation
 * 
 * Runtime: Node.js
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { buildExpectedSnapshot } from '@/lib/les/expected';
import { compareLesToExpected } from '@/lib/les/compare';
import type { LesLine } from '@/app/types/les';
import { ssot } from '@/lib/ssot';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ManualEntryRequest {
  month: number;
  year: number;
  allowances: {
    BAH?: number;      // in cents
    BAS?: number;      // in cents
    COLA?: number;     // in cents
    SDAP?: number;     // in cents
    HFP_IDP?: number;  // in cents
    FSA?: number;      // in cents
    FLPP?: number;     // in cents
  };
  basePay?: number;    // in cents
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // ==========================================================================
    // 1. AUTHENTICATION
    // ==========================================================================
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // ==========================================================================
    // 2. TIER GATING & QUOTA CHECK
    // ==========================================================================
    const tier = await getUserTier(userId);
    const monthlyQuota = tier === 'free' 
      ? ssot.features.lesAuditor.freeUploadsPerMonth
      : ssot.features.lesAuditor.premiumUploadsPerMonth;

    if (monthlyQuota !== null) {
      const { count, error: countError } = await supabaseAdmin
        .from('les_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('entry_type', 'manual'); // Only count manual entries against quota

      if (countError) {
        return NextResponse.json(
          { error: 'Failed to check entry quota' },
          { status: 500 }
        );
      }

      if (count !== null && count >= monthlyQuota) {
        return NextResponse.json(
          {
            error: 'Monthly entry limit reached',
            quota: monthlyQuota,
            used: count,
            upgradeRequired: tier === 'free'
          },
          { status: 429 }
        );
      }
    }

    // ==========================================================================
    // 3. PARSE REQUEST
    // ==========================================================================
    const body: ManualEntryRequest = await req.json();
    const { month, year, allowances, basePay } = body;

    if (!month || !year || !allowances) {
      throw Errors.invalidInput('month, year, and allowances are required');
    }

    // Validate month/year
    if (month < 1 || month > 12) {
      throw Errors.invalidInput('Invalid month (must be 1-12)');
    }

    if (year < 2020 || year > new Date().getFullYear() + 1) {
      throw Errors.invalidInput('Invalid year');
    }

    // ==========================================================================
    // 4. CREATE MANUAL ENTRY RECORD
    // ==========================================================================
    // Calculate total allowances (including base pay)
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (val || 0), 0) + (basePay || 0);
    
    const { data: uploadRecord, error: insertError } = await supabaseAdmin
      .from('les_uploads')
      .insert({
        user_id: userId,
        entry_type: 'manual',
        original_filename: 'manual-entry',
        mime_type: 'application/json',
        size_bytes: 0,
        storage_path: '',
        month,
        year,
        parsed_ok: true, // Manual entries are always "parsed"
        parsed_at: new Date().toISOString(),
        parsed_summary: {
          totalsBySection: {
            ALLOWANCE: totalAllowances,
            DEDUCTION: 0,
            ALLOTMENT: 0,
            TAX: 0,
            OTHER: 0
          },
          allowancesByCode: { ...allowances, ...(basePay ? { BASE_PAY: basePay } : {}) },
          deductionsByCode: {}
        }
      })
      .select('*')
      .single();

    if (insertError || !uploadRecord) {
      return NextResponse.json(
        { error: 'Failed to save manual entry' },
        { status: 500 }
      );
    }

    // ==========================================================================
    // 5. CREATE LINE ITEMS FROM MANUAL ENTRY
    // ==========================================================================
    const lines: LesLine[] = [];

    // Base Allowances
    if (allowances.BAH) {
      lines.push({
        line_code: 'BAH',
        description: 'Basic Allowance for Housing (Manual Entry)',
        amount_cents: allowances.BAH,
        section: 'ALLOWANCE'
      });
    }

    if (allowances.BAS) {
      lines.push({
        line_code: 'BAS',
        description: 'Basic Allowance for Subsistence (Manual Entry)',
        amount_cents: allowances.BAS,
        section: 'ALLOWANCE'
      });
    }

    if (allowances.COLA) {
      lines.push({
        line_code: 'COLA',
        description: 'Cost of Living Allowance (Manual Entry)',
        amount_cents: allowances.COLA,
        section: 'ALLOWANCE'
      });
    }

    // Special Pays
    if (allowances.SDAP) {
      lines.push({
        line_code: 'SDAP',
        description: 'Special Duty Assignment Pay (Manual Entry)',
        amount_cents: allowances.SDAP,
        section: 'ALLOWANCE'
      });
    }

    if (allowances.HFP_IDP) {
      lines.push({
        line_code: 'HFP_IDP',
        description: 'Hostile Fire Pay / Imminent Danger Pay (Manual Entry)',
        amount_cents: allowances.HFP_IDP,
        section: 'ALLOWANCE'
      });
    }

    if (allowances.FSA) {
      lines.push({
        line_code: 'FSA',
        description: 'Family Separation Allowance (Manual Entry)',
        amount_cents: allowances.FSA,
        section: 'ALLOWANCE'
      });
    }

    if (allowances.FLPP) {
      lines.push({
        line_code: 'FLPP',
        description: 'Foreign Language Proficiency Pay (Manual Entry)',
        amount_cents: allowances.FLPP,
        section: 'ALLOWANCE'
      });
    }

    // Base Pay
    if (basePay) {
      lines.push({
        line_code: 'BASE_PAY',
        description: 'Base Pay (Manual Entry)',
        amount_cents: basePay,
        section: 'ALLOWANCE'
      });
    }

    // Insert lines
    if (lines.length > 0) {
      const lineRows = lines.map(line => ({
        upload_id: uploadRecord.id,
        ...line
      }));

      const { error: linesError } = await supabaseAdmin
        .from('les_lines')
        .insert(lineRows);

      if (linesError) {
        logger.warn('[LESManual] Failed to insert line items', { userId, uploadId: uploadRecord.id, error: linesError });
      }
    }

    // ==========================================================================
    // 6. LOAD USER PROFILE
    // ==========================================================================
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      logger.warn('[LESManual] Profile incomplete', { userId });
      throw Errors.invalidInput('Please complete your profile (paygrade, location, dependents) before running audit');
    }

    // ==========================================================================
    // 7. BUILD EXPECTED SNAPSHOT
    // ==========================================================================
    const snapshot = await buildExpectedSnapshot({
      userId,
      month,
      year,
      paygrade: profile.paygrade,
      mha_or_zip: profile.mha_or_zip,
      with_dependents: profile.with_dependents,
      yos: profile.yos
    });

    // Store snapshot
    await supabaseAdmin
      .from('expected_pay_snapshot')
      .insert({
        user_id: userId,
        upload_id: uploadRecord.id,
        month,
        year,
        paygrade: profile.paygrade,
        mha_or_zip: profile.mha_or_zip,
        with_dependents: profile.with_dependents,
        yos: profile.yos,
        expected_bah_cents: snapshot.expected.bah_cents,
        expected_bas_cents: snapshot.expected.bas_cents,
        expected_cola_cents: snapshot.expected.cola_cents,
        expected_specials: snapshot.expected.specials
      });

    // ==========================================================================
    // 8. COMPARE ACTUAL VS EXPECTED
    // ==========================================================================
    const comparison = compareLesToExpected(lines, snapshot);

    // Store flags
    if (comparison.flags.length > 0) {
      const flagRows = comparison.flags.map(flag => ({
        upload_id: uploadRecord.id,
        severity: flag.severity,
        flag_code: flag.flag_code,
        message: flag.message,
        suggestion: flag.suggestion,
        ref_url: flag.ref_url,
        delta_cents: flag.delta_cents
      }));

      await supabaseAdmin
        .from('pay_flags')
        .insert(flagRows);
    }

    // Update upload status to audit_complete
    await supabaseAdmin
      .from('les_uploads')
      .update({ upload_status: 'audit_complete' })
      .eq('id', uploadRecord.id);

    // ==========================================================================
    // 9. ANALYTICS
    // ==========================================================================
    const duration = Date.now() - startTime;

    // Analytics (fire and forget)
    recordAnalyticsEvent(userId, 'les_audit_run', {
      upload_id: uploadRecord.id,
      month,
      year,
      entry_type: 'manual',
      num_flags: comparison.flags.length,
      red_count: comparison.flags.filter(f => f.severity === 'red').length
    }).catch((analyticsError) => {
      logger.warn('[LESManual] Failed to track analytics', { userId, error: analyticsError });
    });

    logger.info('[LESManual] Manual audit completed', { 
      userId, 
      month, 
      year,
      flagCount: comparison.flags.length,
      duration
    });

    // ==========================================================================
    // 10. RETURN RESPONSE
    // ==========================================================================
    return NextResponse.json({
      snapshot,
      flags: comparison.flags,
      summary: comparison.totals
    });

  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Get user's subscription tier
 */
async function getUserTier(userId: string): Promise<'free' | 'premium'> {
  try {
    const { data, error } = await supabaseAdmin
      .from('entitlements')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return 'free';
    }

    return (data.tier as 'free' | 'premium') || 'free';
  } catch (tierError) {
    logger.warn('[LESManual] Failed to get user tier, defaulting to free', { userId, error: tierError });
    return 'free';
  }
}

/**
 * Get user profile
 */
async function getUserProfile(userId: string): Promise<{
  paygrade: string;
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;
} | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('paygrade, mha_code, mha_code_override, has_dependents, time_in_service_months')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Validate required computed fields
    if (!data.paygrade) {
      logger.warn('[LESManual] Missing paygrade - profile needs computed fields', {
        userId: userId.substring(0, 8) + '...'
      });
      return null;
    }

    // Use override if present, otherwise use computed mha_code
    const mhaCode = data.mha_code_override || data.mha_code;
    
    if (!mhaCode) {
      logger.warn('[LESManual] Missing mha_code - base not recognized', {
        userId: userId.substring(0, 8) + '...'
      });
      return null;
    }

    if (data.has_dependents === null) {
      logger.warn('[LESManual] Missing has_dependents', {
        userId: userId.substring(0, 8) + '...'
      });
      return null;
    }

    return {
      paygrade: data.paygrade,
      mha_or_zip: mhaCode,
      with_dependents: Boolean(data.has_dependents),
      yos: data.time_in_service_months ? Math.floor(data.time_in_service_months / 12) : undefined
    };
  } catch (profileError) {
    logger.warn('[LESManual] Failed to get user profile', { userId, error: profileError });
    return null;
  }
}

/**
 * Record analytics event
 */
async function recordAnalyticsEvent(userId: string, event: string, properties: Record<string, unknown>) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: { ...properties, user_id: userId },
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    logger.warn('[LESManual] Analytics fetch failed', { userId, event, error });
  }
}

