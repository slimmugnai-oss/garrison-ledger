/**
 * JTR TRACKER CRON ENDPOINT
 * 
 * Triggered by Vercel Cron: Weekly on Monday at 8 AM EST
 * 
 * In vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/jtr",
 *     "schedule": "0 8 * * 1"
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import { executeJTRCron } from '@/lib/scrapers/cron-scheduler';

export const runtime = 'nodejs';
export const maxDuration = 120; // 120 seconds (PDF download can be slow)

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

    console.log('[API] JTR cron triggered');

    const result = await executeJTRCron();

    return NextResponse.json({
      success: result.success,
      scraper: 'jtr',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] JTR cron error:', error);

    return NextResponse.json(
      {
        success: false,
        scraper: 'jtr',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

