/**
 * DATA STALENESS CHECK CRON JOB
 * 
 * Runs daily to check if any rate tables or data sources are stale.
 * Creates system alerts for admins to verify/update data.
 * 
 * Vercel Cron: Add to vercel.json
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-staleness",
 *     "schedule": "0 9 * * *"  // 9 AM UTC daily
 *   }]
 * }
 * 
 * Manual trigger: https://garrisonledger.com/api/cron/check-staleness?secret=CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this automatically)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production with Vercel Cron, authorization header will be set
    // For manual testing, allow ?secret=CRON_SECRET query param
    const querySecret = req.nextUrl.searchParams.get('secret');

    if (process.env.NODE_ENV === 'production') {
      if (!authHeader && querySecret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    logger.info('[StalenessCheck] Running daily staleness check...');

    // ==========================================================================
    // 1. RUN STALENESS CHECK FUNCTION
    // ==========================================================================
    const { data: stalenessData, error: stalenessError } = await supabaseAdmin
      .rpc('check_data_staleness');

    if (stalenessError) {
      logger.error('[StalenessCheck] Failed to check staleness', stalenessError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // ==========================================================================
    // 2. CREATE ALERTS FOR STALE SOURCES
    // ==========================================================================
    const { data: alertCount, error: alertError } = await supabaseAdmin
      .rpc('create_staleness_alerts');

    if (alertError) {
      logger.error('[StalenessCheck] Failed to create alerts', alertError);
    }

    // ==========================================================================
    // 3. ANALYZE RESULTS
    // ==========================================================================
    const results = stalenessData as Array<{
      source_name: string;
      source_type: string;
      days_since_verification: number;
      status: string;
      recommended_action: string;
    }> || [];

    const critical = results.filter(r => r.status === 'critical');
    const warning = results.filter(r => r.status === 'warning');
    const current = results.filter(r => r.status === 'current');

    logger.info('[StalenessCheck] Check complete', {
      total: results.length,
      critical: critical.length,
      warning: warning.length,
      current: current.length,
      alertsCreated: alertCount || 0
    });

    // ==========================================================================
    // 4. LOG CRITICAL ISSUES
    // ==========================================================================
    if (critical.length > 0) {
      logger.error('[StalenessCheck] CRITICAL: Stale data sources found', {
        sources: critical.map(c => ({
          name: c.source_name,
          days: c.days_since_verification,
          action: c.recommended_action
        }))
      });

      // Log to error_logs for admin visibility
      await supabaseAdmin.from('error_logs').insert({
        level: 'error',
        source: 'staleness_check',
        message: `${critical.length} critical data sources are stale`,
        metadata: {
          critical_sources: critical.map(c => c.source_name),
          days_stale: critical.map(c => c.days_since_verification)
        }
      });
    }

    if (warning.length > 0) {
      logger.warn('[StalenessCheck] WARNING: Data sources need verification', {
        sources: warning.map(w => w.source_name)
      });
    }

    // ==========================================================================
    // 5. UPDATE ROW COUNTS (FOR DRIFT DETECTION)
    // ==========================================================================
    const tableCounts = {
      bah_rates: await getTableCount('bah_rates'),
      military_pay_tables: await getTableCount('military_pay_tables'),
      sgli_rates: await getTableCount('sgli_rates'),
      state_tax_rates: await getTableCount('state_tax_rates'),
      conus_cola_rates: await getTableCount('conus_cola_rates'),
      oconus_cola_rates: await getTableCount('oconus_cola_rates'),
      entitlements_data: await getTableCount('entitlements_data'),
      jtr_rules: await getTableCount('jtr_rules'),
      content_blocks: await getTableCount('content_blocks'),
    };

    // Update counts
    for (const [tableName, count] of Object.entries(tableCounts)) {
      if (count !== null) {
        await supabaseAdmin
          .from('data_sources_metadata')
          .update({ current_row_count: count, updated_at: new Date().toISOString() })
          .eq('source_name', tableName);
      }
    }

    // ==========================================================================
    // 6. RETURN SUMMARY
    // ==========================================================================
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_sources: results.length,
        critical: critical.length,
        warning: warning.length,
        current: current.length,
        alerts_created: alertCount || 0
      },
      critical_sources: critical.map(c => ({
        name: c.source_name,
        days_stale: c.days_since_verification,
        url: results.find(r => r.source_name === c.source_name)?.source_type
      })),
      warning_sources: warning.map(w => w.source_name),
      row_counts: tableCounts
    });

  } catch (error) {
    logger.error('[StalenessCheck] Unhandled error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get table row count
 */
async function getTableCount(tableName: string): Promise<number | null> {
  try {
    const { count, error } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      logger.warn(`[StalenessCheck] Could not count ${tableName}`, { error: error.message });
      return null;
    }

    return count;
  } catch (err) {
    logger.warn(`[StalenessCheck] Error counting ${tableName}`, { error: err });
    return null;
  }
}

