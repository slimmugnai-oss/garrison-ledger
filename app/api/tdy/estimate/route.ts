/**
 * TDY COPILOT - ESTIMATE TOTALS
 * 
 * POST /api/tdy/estimate
 * Recomputes per-diem and totals for a trip
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { estimateTrip } from '@/lib/tdy/estimate';

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

    // Compute estimate
    const totals = await estimateTrip({ tripId, userId });

    // Analytics
    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_estimate_run',
        payload: { trip_id: tripId }
      });

    return NextResponse.json({ totals });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

