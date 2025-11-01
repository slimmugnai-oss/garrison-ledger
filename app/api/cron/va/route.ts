/**
 * VA MONITOR CRON ENDPOINT
 * 
 * Triggered by Vercel Cron: Daily at 7 AM EST
 * 
 * In vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/va",
 *     "schedule": "0 7 * * *"
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import { executeVACron } from '@/lib/scrapers/cron-scheduler';

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

    console.log('[API] VA cron triggered');

    const result = await executeVACron();

    return NextResponse.json({
      success: result.success,
      scraper: 'va',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] VA cron error:', error);

    return NextResponse.json(
      {
        success: false,
        scraper: 'va',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

