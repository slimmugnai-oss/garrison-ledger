/**
 * TDY COPILOT - COMPLIANCE CHECK
 * 
 * POST /api/tdy/check
 * Runs compliance checks and generates flags
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { runChecks } from '@/lib/tdy/check';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

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

    if (tripError || !trip || trip.user_id !== userId) {
      logger.warn('[TDYCheck] Trip not found', { userId, tripId });
      throw Errors.notFound('TDY trip');
    }

    // Run checks
    const flags = await runChecks(tripId, userId);

    // Clear old flags and insert new ones
    await supabaseAdmin
      .from('tdy_flags')
      .delete()
      .eq('trip_id', tripId);

    if (flags.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('tdy_flags')
        .insert(
          flags.map(flag => ({
            trip_id: tripId,
            severity: flag.severity,
            flag_code: flag.flag_code,
            message: flag.message,
            suggestion: flag.suggestion,
            ref: flag.ref
          }))
        );
      
      if (insertError) {
        logger.error('[TDYCheck] Failed to insert flags', insertError, { userId, tripId });
      }
    }

    // Analytics (fire and forget)
    const redCount = flags.filter(f => f.severity === 'red').length;
    const yellowCount = flags.filter(f => f.severity === 'yellow').length;

    supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_flags_view',
        payload: {
          trip_id: tripId,
          red: redCount,
          yellow: yellowCount
        }
      })
      .catch((analyticsError) => {
        logger.warn('[TDYCheck] Failed to track analytics', { userId, tripId, error: analyticsError });
      });

    const duration = Date.now() - startTime;
    logger.info('[TDYCheck] Compliance check completed', { 
      userId, 
      tripId, 
      flagCount: flags.length,
      redCount,
      yellowCount,
      duration
    });

    return NextResponse.json({ flags });

  } catch (error) {
    return errorResponse(error);
  }
}

