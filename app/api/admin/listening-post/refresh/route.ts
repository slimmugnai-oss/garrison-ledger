import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

/**
 * ADMIN ENDPOINT: Manually trigger Listening Post RSS feed refresh
 * Calls the /api/ingest/feeds endpoint with CRON_SECRET
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    // Trigger the feed ingestion endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ingest/feeds`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Feed refresh failed', details: error },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Feed refresh triggered successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error triggering feed refresh:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

