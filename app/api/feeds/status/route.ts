/**
 * FEED STATUS API ENDPOINT
 * 
 * Get status of all dynamic data feeds
 * GET /api/feeds/status
 */

import { NextResponse } from 'next/server';
import { getAllFeedStatuses } from '@/lib/dynamic/fetch';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    return NextResponse.json({
      feeds: feedsWithStatus,
      summary: {
        total: feeds.length,
        ok: feeds.filter(f => f.status === 'ok').length,
        stale: feedsWithStatus.filter(f => f.isStale).length,
        error: feeds.filter(f => f.status === 'error').length
      },
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

