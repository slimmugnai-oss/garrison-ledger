/**
 * TDY COPILOT - CREATE TRIP
 * 
 * POST /api/tdy/create
 * Creates a new TDY trip
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purpose, origin, destination, depart_date, return_date } = body;

    // Validation
    if (!purpose || !origin || !destination || !depart_date || !return_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(depart_date) > new Date(return_date)) {
      return NextResponse.json(
        { error: 'Departure date must be before return date' },
        { status: 400 }
      );
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
      console.error('[TDY Create] Database error:', error);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    // Analytics
    const durationDays = Math.ceil(
      (new Date(return_date).getTime() - new Date(depart_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_trip_create',
        payload: {
          trip_id: data.id,
          purpose,
          duration_days: durationDays
        }
      });

    return NextResponse.json({ tripId: data.id });

  } catch (error) {
    console.error('[TDY Create] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

