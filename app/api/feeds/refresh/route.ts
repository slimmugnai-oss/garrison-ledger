/**
 * FEED REFRESH API ENDPOINT
 * 
 * Endpoint for manual and cron-triggered feed refreshes
 * GET /api/feeds/refresh?source=BAH,COLA
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { refreshSourceData, invalidateCachePattern } from '@/lib/dynamic/fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret OR authenticated user (allow manual admin refresh)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow if: has valid cron secret OR is authenticated user
    const hasCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const { userId } = await auth();
    
    if (!hasCronAuth && !userId) {
      return NextResponse.json(
        { error: 'Unauthorized - requires authentication' },
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
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

