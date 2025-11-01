/**
 * DFAS SCRAPER CRON ENDPOINT
 * 
 * Triggered by Vercel Cron: Daily at 6 AM EST
 * 
 * In vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/dfas",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import { executeDFASCron } from '@/lib/scrapers/cron-scheduler';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution

export async function GET(request: Request) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] DFAS cron triggered');

    const result = await executeDFASCron();

    return NextResponse.json({
      success: result.success,
      scraper: 'dfas',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] DFAS cron error:', error);

    return NextResponse.json(
      {
        success: false,
        scraper: 'dfas',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

