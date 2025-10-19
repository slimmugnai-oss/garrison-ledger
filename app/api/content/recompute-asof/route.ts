/**
 * RECOMPUTE AS-OF DATES API ENDPOINT
 * 
 * Updates as_of_date for content blocks that reference a specific source
 * Triggered when a feed is refreshed with new data
 * POST /api/content/recompute-asof
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RecomputeRequest {
  sourceKey: string;  // 'BAH', 'COLA', 'IRS_TSP_LIMITS', etc.
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: RecomputeRequest = await request.json();
    const { sourceKey } = body;

    if (!sourceKey) {
      return NextResponse.json(
        { error: 'Missing sourceKey' },
        { status: 400 }
      );
    }

    // Get all content_sources records for this source
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('content_sources')
      .select('block_id')
      .eq('source_key', sourceKey);

    if (sourcesError) {
      throw sourcesError;
    }

    if (!sources || sources.length === 0) {
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
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      updated: blockIds.length,
      sourceKey,
      asOfDate: today,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Content] Recompute as-of error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

