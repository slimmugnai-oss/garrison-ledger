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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = await request.json();

    if (!tripId) {
      return NextResponse.json({ error: 'Missing tripId' }, { status: 400 });
    }

    // Verify ownership
    const { data: trip } = await supabaseAdmin
      .from('tdy_trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (!trip || trip.user_id !== userId) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Run checks
    const flags = await runChecks(tripId, userId);

    // Clear old flags and insert new ones
    await supabaseAdmin
      .from('tdy_flags')
      .delete()
      .eq('trip_id', tripId);

    if (flags.length > 0) {
      await supabaseAdmin
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
    }

    // Analytics
    const redCount = flags.filter(f => f.severity === 'red').length;
    const yellowCount = flags.filter(f => f.severity === 'yellow').length;

    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_flags_view',
        payload: {
          trip_id: tripId,
          red: redCount,
          yellow: yellowCount
        }
      });

    return NextResponse.json({ flags });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

