/**
 * LES AUDIT ENDPOINT
 * 
 * POST /api/les/audit
 * - Loads uploaded LES and user profile
 * - Computes expected pay values (BAH, BAS, COLA, specials)
 * - Compares actual vs expected
 * - Generates actionable flags
 * - Stores snapshot and flags
 * 
 * Security:
 * - Clerk authentication required
 * - User ownership validation
 * - RLS enforced
 * 
 * Runtime: Node.js
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { buildExpectedSnapshot } from '@/lib/les/expected';
import { compareLesToExpected } from '@/lib/les/compare';

/**
 * Record server-side analytics event
 */
async function recordAnalyticsEvent(userId: string, event: string, properties: Record<string, any>) {
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
    console.error('[Analytics] Failed to record event:', error);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // ==========================================================================
    // 1. AUTHENTICATION
    // ==========================================================================
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ==========================================================================
    // 2. PARSE REQUEST
    // ==========================================================================
    const body = await req.json();
    const { uploadId } = body;

    if (!uploadId) {
      return NextResponse.json(
        { error: 'uploadId is required' },
        { status: 400 }
      );
    }

    // ==========================================================================
    // 3. LOAD UPLOAD & VALIDATE OWNERSHIP
    // ==========================================================================
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('les_uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (upload.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - not your upload' },
        { status: 403 }
      );
    }

    // Verify parse succeeded
    if (!upload.parsed_ok) {
      return NextResponse.json(
        {
          error: 'LES not parsed successfully',
          suggestion: 'Try re-uploading the file or use a different PDF export'
        },
        { status: 400 }
      );
    }

    // ==========================================================================
    // 4. LOAD PARSED LINES
    // ==========================================================================
    const { data: lines, error: linesError } = await supabaseAdmin
      .from('les_lines')
      .select('line_code, description, amount_cents, section, raw')
      .eq('upload_id', uploadId);

    if (linesError) {
      console.error('[LES Audit] Lines fetch error:', linesError);
      return NextResponse.json(
        { error: 'Failed to load parsed lines' },
        { status: 500 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: 'No parsed lines found' },
        { status: 400 }
      );
    }

    // ==========================================================================
    // 5. LOAD USER PROFILE
    // ==========================================================================
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json(
        {
          error: 'Profile not found',
          suggestion: 'Please complete your profile (paygrade, location, dependents) before running audit'
        },
        { status: 400 }
      );
    }

    // ==========================================================================
    // 6. BUILD EXPECTED SNAPSHOT
    // ==========================================================================
    const snapshot = await buildExpectedSnapshot({
      userId,
      month: upload.month,
      year: upload.year,
      paygrade: profile.paygrade,
      mha_or_zip: profile.mha_or_zip,
      with_dependents: profile.with_dependents,
      yos: profile.yos
    });

    // Store snapshot in database
    const { data: snapshotRecord, error: snapshotError } = await supabaseAdmin
      .from('expected_pay_snapshot')
      .insert({
        user_id: userId,
        upload_id: uploadId,
        month: upload.month,
        year: upload.year,
        paygrade: profile.paygrade,
        mha_or_zip: profile.mha_or_zip,
        with_dependents: profile.with_dependents,
        yos: profile.yos,
        expected_bah_cents: snapshot.expected.bah_cents,
        expected_bas_cents: snapshot.expected.bas_cents,
        expected_cola_cents: snapshot.expected.cola_cents,
        expected_specials: snapshot.expected.specials
      })
      .select('*')
      .single();

    if (snapshotError) {
      console.error('[LES Audit] Snapshot insert error:', snapshotError);
      // Continue anyway - not critical
    }

    // ==========================================================================
    // 7. COMPARE ACTUAL VS EXPECTED
    // ==========================================================================
    const comparison = compareLesToExpected(lines, snapshot);

    // Store flags in database
    if (comparison.flags.length > 0) {
      const flagRows = comparison.flags.map(flag => ({
        upload_id: uploadId,
        severity: flag.severity,
        flag_code: flag.flag_code,
        message: flag.message,
        suggestion: flag.suggestion,
        ref_url: flag.ref_url,
        delta_cents: flag.delta_cents
      }));

      const { error: flagsError } = await supabaseAdmin
        .from('pay_flags')
        .insert(flagRows);

      if (flagsError) {
        console.error('[LES Audit] Flags insert error:', flagsError);
        // Continue anyway - flags are in response
      }
    }

    // ==========================================================================
    // 8. ANALYTICS
    // ==========================================================================
    const redCount = comparison.flags.filter(f => f.severity === 'red').length;
    await recordAnalyticsEvent(userId, 'les_audit_run', {
      upload_id: uploadId,
      month: upload.month,
      year: upload.year,
      num_flags: comparison.flags.length,
      red_count: redCount
    });

    // ==========================================================================
    // 9. RETURN RESPONSE
    // ==========================================================================
    return NextResponse.json({
      snapshot,
      flags: comparison.flags,
      summary: comparison.totals
    });

  } catch (error) {
    console.error('[LES Audit] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user profile with required fields for audit
 * TODO: Integrate with your user_profiles table structure
 */
async function getUserProfile(userId: string): Promise<{
  paygrade: string;
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;
} | null> {
  try {
    // This is a placeholder - adjust to match your actual profile schema
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('paygrade, duty_station, dependents, years_of_service')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('[LES Audit] Profile not found for user:', userId);
      return null;
    }

    // Map your profile fields to expected format
    return {
      paygrade: data.paygrade,
      mha_or_zip: data.duty_station, // Adjust field name as needed
      with_dependents: Boolean(data.dependents),
      yos: data.years_of_service
    };
  } catch (error) {
    console.error('[LES Audit] Profile fetch error:', error);
    return null;
  }
}

