/**
 * TDY COPILOT - ESTIMATE TOTALS
 * 
 * POST /api/tdy/estimate
 * Recomputes per-diem and totals for a trip
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { estimateTrip } from '@/lib/tdy/estimate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    const { tripId } = await request.json();

    if (!tripId) {
      throw Errors.invalidInput('tripId is required');
    }

    // Verify ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('tdy_trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      logger.warn('TDY trip not found', { tripId, userId: userId.substring(0, 8) + '...' });
      throw Errors.notFound('TDY Trip');
    }

    if (trip.user_id !== userId) {
      logger.warn('TDY trip access denied', { 
        tripId, 
        requestingUser: userId.substring(0, 8) + '...',
        owner: trip.user_id.substring(0, 8) + '...'
      });
      throw Errors.forbidden('You do not have access to this trip');
    }

    // Compute estimate
    const totals = await estimateTrip({ tripId, userId });

    // Analytics (non-blocking)
    try {
      await supabaseAdmin
        .from('events')
        .insert({
          user_id: userId,
          event_type: 'tdy_estimate_run',
          payload: { trip_id: tripId }
        });
    } catch (analyticsError) {
      logger.warn('Failed to record TDY analytics', {
        error: analyticsError instanceof Error ? analyticsError.message : 'Unknown'
      });
    }

    const duration = Date.now() - startTime;
    
    logger.info('TDY estimate calculated', {
      userId: userId.substring(0, 8) + '...',
      tripId,
      duration_ms: duration
    });

    return NextResponse.json({ totals });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('TDY estimate failed', error, { duration_ms: duration });
    return errorResponse(error);
  }
}

