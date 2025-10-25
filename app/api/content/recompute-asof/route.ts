/**
 * RECOMPUTE AS-OF DATES API ENDPOINT
 * 
 * Updates as_of_date for content blocks that reference a specific source
 * Triggered when a feed is refreshed with new data
 * POST /api/content/recompute-asof
 */

import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RecomputeRequest {
  sourceKey: string;  // 'BAH', 'COLA', 'IRS_TSP_LIMITS', etc.
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('[RecomputeAsOf] Unauthorized cron attempt');
      throw Errors.unauthorized();
    }

    const body: RecomputeRequest = await request.json();
    const { sourceKey } = body;

    if (!sourceKey) {
      throw Errors.invalidInput('sourceKey is required');
    }

    // Get all content_sources records for this source
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('content_sources')
      .select('block_id')
      .eq('source_key', sourceKey);

    if (sourcesError) {
      logger.error('[RecomputeAsOf] Failed to fetch content sources', sourcesError, { sourceKey });
      throw Errors.databaseError('Failed to fetch content sources');
    }

    if (!sources || sources.length === 0) {
      logger.info('[RecomputeAsOf] No content blocks reference this source', { sourceKey });
      return NextResponse.json({
        success: true,
        updated: 0,
        message: `No content blocks reference ${sourceKey}`
      });
    }

    // Get unique block IDs
    const blockIds = [...new Set(sources.map(s => s.block_id))];

    // Update as_of_date for all blocks that reference this source
    const today = new Date().toISOString().split('T')[0];
    const { error: updateError } = await supabaseAdmin
      .from('content_blocks')
      .update({
        as_of_date: today,
        updated_at: new Date().toISOString()
      })
      .in('id', blockIds);

    if (updateError) {
      logger.error('[RecomputeAsOf] Failed to update as-of dates', updateError, { sourceKey, blockCount: blockIds.length });
      throw Errors.databaseError('Failed to update content as-of dates');
    }

    const duration = Date.now() - startTime;
    logger.info('[RecomputeAsOf] As-of dates updated', { sourceKey, updated: blockIds.length, asOfDate: today, duration });

    return NextResponse.json({
      success: true,
      updated: blockIds.length,
      sourceKey,
      asOfDate: today,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return errorResponse(error);
  }
}

