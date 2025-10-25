/**
 * TDY COPILOT - GENERATE VOUCHER
 * 
 * POST /api/tdy/voucher
 * Generates final voucher JSON (premium only)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import type { TdyVoucher } from '@/app/types/tdy';
import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { estimateTrip } from '@/lib/tdy/estimate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      throw Errors.premiumRequired('Voucher generation is a premium feature. Upgrade to download ready-to-submit package');
    }

    const { tripId } = await request.json();

    if (!tripId) {
      throw Errors.invalidInput('tripId is required');
    }

    // Verify ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('tdy_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip || trip.user_id !== userId) {
      logger.warn('[TDYVoucher] Trip not found', { userId, tripId });
      throw Errors.notFound('TDY trip');
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

    // Analytics (fire and forget)
    supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'tdy_voucher_view',
        payload: { trip_id: tripId }
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[TDYVoucher] Failed to track analytics', { userId, tripId, error: analyticsError.message });
        }
      });

    const duration = Date.now() - startTime;
    logger.info('[TDYVoucher] Voucher generated', { 
      userId, 
      tripId, 
      itemCount: (items?.length || 0),
      flagCount: (flags?.length || 0),
      duration
    });

    return NextResponse.json({ voucher });

  } catch (error) {
    return errorResponse(error);
  }
}

