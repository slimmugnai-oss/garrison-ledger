/**
 * TDY COPILOT - GENERATE VOUCHER
 * 
 * POST /api/tdy/voucher
 * Generates final voucher JSON (premium only)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { estimateTrip } from '@/lib/tdy/estimate';
import type { TdyVoucher } from '@/app/types/tdy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Voucher generation is a premium feature. Upgrade to download ready-to-submit package.' },
        { status: 402 }
      );
    }

    const { tripId } = await request.json();

    if (!tripId) {
      return NextResponse.json({ error: 'Missing tripId' }, { status: 400 });
    }

    // Verify ownership
    const { data: trip } = await supabaseAdmin
      .from('tdy_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (!trip || trip.user_id !== userId) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get totals
    const totals = await estimateTrip({ tripId, userId });

    // Get all line items
    const { data: items } = await supabaseAdmin
      .from('tdy_items_normalized')
      .select('*')
      .eq('trip_id', tripId)
      .order('tx_date', { ascending: true });

    // Get per-diem spans
    const { data: spans } = await supabaseAdmin
      .from('tdy_per_diem_snap')
      .select('*')
      .eq('trip_id', tripId);

    // Get flags (exclude green)
    const { data: flags } = await supabaseAdmin
      .from('tdy_flags')
      .select('*')
      .eq('trip_id', tripId)
      .neq('severity', 'green');

    // Build voucher
    const voucher: TdyVoucher = {
      trip: {
        purpose: trip.purpose,
        origin: trip.origin,
        destination: trip.destination,
        depart_date: trip.depart_date,
        return_date: trip.return_date
      },
      totals,
      line_items: {
        lodging: (items || []).filter(i => i.item_type === 'lodging'),
        meals: (items || []).filter(i => i.item_type === 'meals'),
        mileage: (items || []).filter(i => i.item_type === 'mileage'),
        misc: (items || []).filter(i => i.item_type === 'misc')
      },
      per_diem_spans: (spans || []).map(s => ({
        locality: s.locality,
        start: s.start_date,
        end: s.end_date,
        mie_cents: s.mie_cents,
        lodging_cap_cents: s.lodging_cap_cents
      })),
      flags: flags || [],
      checklist: [
        'Official orders (signed)',
        'Itemized lodging folio (separate room & tax)',
        'Receipts for any expense ≥ $75',
        'Mileage log (route & miles) or odometer photo',
        'Air/rail e-ticket & receipt (if applicable)'
      ],
      version: 1
    };

    // Analytics
    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_voucher_view',
        payload: { trip_id: tripId }
      });

    return NextResponse.json({ voucher });

  } catch (error) {
    console.error('[TDY Voucher] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

