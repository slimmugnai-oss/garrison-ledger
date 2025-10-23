/**
 * LES AUDIT SAVE & PDF ENDPOINT
 * 
 * POST /api/les/audit/save
 * - Premium-only feature (free tier receives 402 PAYWALL)
 * - Persists audit snapshot to database
 * - Generates PDF export
 * - Increments monthly quota
 * 
 * Security:
 * - Clerk authentication required
 * - Tier validation (premium only)
 * - Monthly quota enforcement (free: 1/month, premium: unlimited)
 * - Server-side PDF generation only
 * 
 * Runtime: Node.js (needs database and PDF generation)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserTier, getLesAuditPolicy, checkLesAuditQuota } from '@/lib/auth/subscription';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SaveRequest {
  month: number;
  year: number;
  profile: Record<string, unknown>;
  expected: Record<string, unknown>;
  taxable_bases: Record<string, number>;
  actual: {
    allowances: Array<{ code: string; description: string; amount_cents: number }>;
    taxes: Array<{ code: string; description: string; amount_cents: number }>;
    deductions: Array<{ code: string; description: string; amount_cents: number }>;
    allotments?: Array<{ code: string; description: string; amount_cents: number }>;
    debts?: Array<{ code: string; description: string; amount_cents: number }>;
    adjustments?: Array<{ code: string; description: string; amount_cents: number }>;
  };
  flags: Array<{
    severity: 'red' | 'yellow' | 'green';
    flag_code: string;
    message: string;
    suggestion: string;
    delta_cents?: number;
    ref_url?: string;
  }>;
  summary: {
    computed_net: number;
    actual_net: number;
    net_delta: number;
  };
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
    // 2. TIER & QUOTA CHECK
    // ===========================================================================
    const tier = await getUserTier(userId);
    const policy = getLesAuditPolicy(tier);

    // Check if PDF generation is allowed for this tier
    if (!policy.allowPdf) {
      // Track paywall block
      await supabaseAdmin.from('analytics_events').insert({
        user_id: userId,
        event_name: 'paywall_block_402',
        properties: {
          feature: 'pdf_export',
          tier,
          endpoint: '/api/les/audit/save'
        }
      });

      return NextResponse.json(
        { 
          error: 'PAYWALL',
          requiresUpgrade: true,
          feature: 'pdf_export',
          message: 'PDF export is a premium feature. Upgrade to save and export your audits.'
        },
        { status: 402 }
      );
    }

    // Check monthly quota
    const quota = await checkLesAuditQuota(userId, tier);
    if (!quota.allowed) {
      // Track quota exceeded
      await supabaseAdmin.from('analytics_events').insert({
        user_id: userId,
        event_name: 'paywall_block_402',
        properties: {
          feature: 'les_audit_quota',
          tier,
          quota: {
            period: 'month',
            limit: quota.limit,
            used: quota.used
          }
        }
      });

      return NextResponse.json(
        { 
          error: 'PAYWALL',
          requiresUpgrade: tier === 'free',
          feature: 'les_audit',
          quota: {
            period: 'month',
            limit: quota.limit,
            used: quota.used,
            resetsAt: quota.resetsAt
          },
          message: tier === 'free' 
            ? 'You\'ve used your 1 free audit this month. Upgrade to premium for unlimited audits.'
            : 'Monthly audit limit reached.'
        },
        { status: 402 }
      );
    }

    // ===========================================================================
    // 3. PARSE REQUEST
    // ===========================================================================
    const body: SaveRequest = await req.json();
    const { month, year, profile, expected, actual, flags, summary } = body;

    if (!month || !year || !actual || !flags) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ===========================================================================
    // 4. PERSIST AUDIT RECORD
    // ===========================================================================
    const { data: uploadRecord, error: uploadError } = await supabaseAdmin
      .from('les_uploads')
      .insert({
        user_id: userId,
        entry_type: 'manual',
        month,
        year,
        audit_status: 'completed',
        audit_completed_at: new Date().toISOString(),
        profile_snapshot: profile,
        original_filename: `manual-${year}-${String(month).padStart(2, '0')}`,
        storage_path: '',
        size_bytes: 0
      })
      .select()
      .single();

    if (uploadError || !uploadRecord) {
      logger.error('[LES Save] Failed to create audit record', { userId, error: uploadError });
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 });
    }

    // ===========================================================================
    // 5. INSERT LINE ITEMS
    // ===========================================================================
    const allLines = [
      ...actual.allowances.map(item => ({ ...item, section: 'ALLOWANCE' as const })),
      ...actual.taxes.map(item => ({ ...item, section: 'TAX' as const })),
      ...actual.deductions.map(item => ({ ...item, section: 'DEDUCTION' as const })),
      ...(actual.allotments || []).map(item => ({ ...item, section: 'ALLOTMENT' as const })),
      ...(actual.debts || []).map(item => ({ ...item, section: 'DEBT' as const })),
      ...(actual.adjustments || []).map(item => ({ ...item, section: 'ADJUSTMENT' as const }))
    ];

    const lineInserts = allLines.map(item => ({
      upload_id: uploadRecord.id,
      line_code: item.code,
      description: item.description || item.code, // Use code as fallback if description missing
      amount_cents: item.amount_cents,
      section: item.section,
      taxability: {}
    }));

    const { error: linesError } = await supabaseAdmin.from('les_lines').insert(lineInserts);
    
    if (linesError) {
      logger.error('[LES Save] Failed to insert line items', { userId, error: linesError });
      // Continue anyway - audit record is saved, just missing line details
    }

    // ===========================================================================
    // 6. INSERT FLAGS
    // ===========================================================================
    const flagInserts = flags.map(flag => ({
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
    // 7. INCREMENT QUOTA
    // ===========================================================================
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    await supabaseAdmin.from('api_quota').upsert({
      user_id: userId,
      route: '/api/les/audit/save',
      day: monthKey,
      count: (quota.used || 0) + 1
    });

    // ===========================================================================
    // 8. GENERATE PDF (placeholder - implement with jsPDF later)
    // ===========================================================================
    // TODO: Implement PDF generation
    const pdfUrl = null;  // Will be: await generateAuditPDF(uploadRecord.id)

    // ===========================================================================
    // 9. ANALYTICS
    // ===========================================================================
    await supabaseAdmin.from('analytics_events').insert({
      user_id: userId,
      event_name: 'les_audit_save_pdf',
      properties: {
        tier,
        audit_id: uploadRecord.id,
        month,
        year,
        flagCount: flags.length,
        variance: summary.net_delta,
        duration_ms: Date.now() - startTime
      }
    });

    logger.info('[LES Save] Audit saved successfully', {
      userId,
      auditId: uploadRecord.id,
      tier,
      flagCount: flags.length
    });

    // ===========================================================================
    // 10. RETURN SUCCESS
    // ===========================================================================
    return NextResponse.json({
      success: true,
      auditId: uploadRecord.id,
      pdfUrl,
      saved: true,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        resetsAt: quota.resetsAt
      }
    });

  } catch (error) {
    logger.error('[LES Save] Error saving audit', { error });
    return NextResponse.json(
      { error: 'Failed to save audit. Please try again.' },
      { status: 500 }
    );
  }
}

