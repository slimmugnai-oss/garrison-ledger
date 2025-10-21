/**
 * TDY COPILOT - CREATE TRIP
 * 
 * POST /api/tdy/create
 * Creates a new TDY trip
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await request.json();
    const { purpose, origin, destination, depart_date, return_date } = body;

    // Validation
    if (!purpose || !origin || !destination || !depart_date || !return_date) {
      throw Errors.invalidInput('Missing required fields: purpose, origin, destination, depart_date, return_date');
    }

    // Validate dates
    if (new Date(depart_date) > new Date(return_date)) {
      throw Errors.invalidInput('Departure date must be before return date');
    }

    // Create trip
    const { data, error } = await supabaseAdmin
      .from('tdy_trips')
      .insert({
        user_id: userId,
        purpose,
        origin,
        destination,
        depart_date,
        return_date
      })
      .select('id')
      .single();

    if (error) {
      logger.error('[TDYCreate] Failed to create trip', error, { userId });
      throw Errors.databaseError('Failed to create trip');
    }

    // Analytics (fire and forget)
    const durationDays = Math.ceil(
      (new Date(return_date).getTime() - new Date(depart_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_trip_create',
        payload: {
          trip_id: data.id,
          purpose,
          duration_days: durationDays
        }
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[TDYCreate] Failed to track analytics', { userId, tripId: data.id, error: analyticsError.message });
        }
      });

    logger.info('[TDYCreate] Trip created', { userId, tripId: data.id, durationDays });
    return NextResponse.json({ tripId: data.id });

  } catch (error) {
    return errorResponse(error);
  }
}

