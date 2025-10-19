/**
 * TDY ITEMS API
 * GET /api/tdy/items?tripId=XXX
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tripId = request.nextUrl.searchParams.get('tripId');
    if (!tripId) return NextResponse.json({ error: 'Missing tripId' }, { status: 400 });

    // Verify ownership
    const { data: trip } = await supabaseAdmin
      .from('tdy_trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (!trip || trip.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: items } = await supabaseAdmin
      .from('tdy_items_normalized')
      .select('*')
      .eq('trip_id', tripId)
      .order('tx_date', { ascending: true });

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

