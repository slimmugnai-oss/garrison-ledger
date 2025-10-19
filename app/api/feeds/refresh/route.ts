/**
 * FEED REFRESH API ENDPOINT
 * 
 * Endpoint for manual and cron-triggered feed refreshes
 * GET /api/feeds/refresh?source=BAH,COLA
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshSourceData, invalidateCachePattern } from '@/lib/dynamic/fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (prevent unauthorized refreshes)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get source(s) from query params
    const searchParams = request.nextUrl.searchParams;
    const sourceParam = searchParams.get('source');

    if (!sourceParam) {
      return NextResponse.json(
        { error: 'Missing source parameter' },
        { status: 400 }
      );
    }

    // Support comma-separated sources
    const sources = sourceParam.split(',').map(s => s.trim());

    // Refresh each source
    const results = [];
    for (const source of sources) {
      console.log(`[Feeds] Refreshing ${source}...`);
      const result = await refreshSourceData(source);
      results.push({
        source,
        ...result
      });
    }

    // Calculate totals
    const totalRefreshed = results.reduce((sum, r) => sum + r.refreshed, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    return NextResponse.json({
      success: true,
      refreshed: totalRefreshed,
      errors: totalErrors,
      details: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Feeds] Refresh error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

