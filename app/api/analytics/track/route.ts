import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { event, properties, timestamp } = body;

    if (!event) {
      logger.warn('[AnalyticsTrack] Missing event name');
      return NextResponse.json({ success: true }); // Don't fail - analytics shouldn't break UX
    }

    // Store event in database for admin analytics (fire and forget)
    supabaseAdmin.from('analytics_events').insert({
      user_id: userId || 'anonymous',
      event_name: event,
      properties: properties || {},
      created_at: timestamp || new Date().toISOString()
    }).catch((trackError) => {
      logger.warn('[AnalyticsTrack] Failed to store event', { userId, event, error: trackError });
    });

    logger.debug('[AnalyticsTrack] Event tracked', { userId, event });
    return NextResponse.json({ success: true });

  } catch (error) {
    // Don't fail the request - analytics shouldn't break user experience
    logger.warn('[AnalyticsTrack] Request failed, returning success', { error });
    return NextResponse.json({ success: true });
  }
}

