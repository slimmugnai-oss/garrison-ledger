/**
 * FEED REFRESH API ENDPOINT
 * 
 * Endpoint for manual and cron-triggered feed refreshes
 * GET /api/feeds/refresh?source=BAH,COLA
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { refreshSourceData } from '@/lib/dynamic/fetch';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret OR authenticated user (allow manual admin refresh)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow if: has valid cron secret OR is authenticated user
    const hasCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const { userId } = await auth();
    
    if (!hasCronAuth && !userId) {
      logger.warn('Unauthorized feed refresh attempt', { hasCronAuth, hasUserId: !!userId });
      throw Errors.unauthorized();
    }

    // Get source(s) from query params
    const searchParams = request.nextUrl.searchParams;
    const sourceParam = searchParams.get('source');

    if (!sourceParam) {
      throw Errors.invalidInput('source parameter required');
    }

    // Support comma-separated sources
    const sources = sourceParam.split(',').map(s => s.trim());

    logger.info('Starting feed refresh', { sources, triggeredBy: hasCronAuth ? 'cron' : 'user' });

    // Refresh each source
    const results = [];
    for (const source of sources) {
      try {
        const result = await refreshSourceData(source);
        results.push({
          source,
          ...result
        });
      } catch (sourceError) {
        logger.error('Failed to refresh source', sourceError, { source });
        results.push({
          source,
          refreshed: 0,
          errors: 1,
          error: sourceError instanceof Error ? sourceError.message : 'Unknown error'
        });
      }
    }

    // Calculate totals
    const totalRefreshed = results.reduce((sum, r) => sum + (r.refreshed || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);

    const duration = Date.now() - startTime;
    logger.info('Feed refresh complete', {
      duration,
      sources: sources.length,
      refreshed: totalRefreshed,
      errors: totalErrors
    });

    return NextResponse.json({
      success: true,
      refreshed: totalRefreshed,
      errors: totalErrors,
      details: results,
      durationMs: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return errorResponse(error);
  }
}

