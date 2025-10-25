/**
 * FEED STATUS API ENDPOINT
 * 
 * Get status of all dynamic data feeds
 * GET /api/feeds/status
 */

import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-errors';
import { getAllFeedStatuses } from '@/lib/dynamic/fetch';
import { logger } from '@/lib/logger';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('Fetching feed statuses');

    const feeds = await getAllFeedStatuses();

    // Calculate staleness for each feed
    const now = Date.now();
    const feedsWithStatus = feeds.map(feed => {
      const lastRefresh = feed.lastRefreshAt 
        ? new Date(feed.lastRefreshAt).getTime()
        : null;

      const isStale = lastRefresh 
        ? (now - lastRefresh) > (feed.ttlSeconds * 1000)
        : true;

      const hoursSinceRefresh = lastRefresh
        ? Math.floor((now - lastRefresh) / (1000 * 60 * 60))
        : null;

      return {
        ...feed,
        isStale,
        hoursSinceRefresh,
        ttlHours: Math.floor(feed.ttlSeconds / 3600)
      };
    });

    const summary = {
      total: feeds.length,
      ok: feeds.filter(f => f.status === 'ok').length,
      stale: feedsWithStatus.filter(f => f.isStale).length,
      error: feeds.filter(f => f.status === 'error').length
    };

    logger.info('Feed status retrieved', summary);

    return NextResponse.json({
      feeds: feedsWithStatus,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return errorResponse(error);
  }
}

