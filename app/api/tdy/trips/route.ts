/**
 * TDY TRIPS API
 * 
 * GET /api/tdy/trips
 * Returns user's TDY trips
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { data: trips, error } = await supabaseAdmin
      .from('tdy_trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('[TDYTrips] Failed to fetch trips', error, { userId });
      throw Errors.databaseError('Failed to fetch trips');
    }

    logger.info('[TDYTrips] Trips fetched', { userId, count: trips?.length || 0 });
    return NextResponse.json({ trips: trips || [] });

  } catch (error) {
    return errorResponse(error);
  }
}

