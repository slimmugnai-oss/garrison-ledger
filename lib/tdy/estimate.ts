/**
 * TDY ESTIMATE CALCULATOR
 * 
 * Computes day-by-day per-diem allowances and totals
 * Handles: 75% M&IE on travel days, lodging caps, taxes
 */

import type { EstimateTotals, TdyItem } from '@/app/types/tdy';
import { supabaseAdmin } from '@/lib/supabase';

import { computePerDiemSpans } from './perdiem';
import { getDateRange } from './util';

/**
 * Estimate trip totals and allowances
 */
export async function estimateTrip(args: {
  tripId: string;
  userId: string;
}): Promise<EstimateTotals> {
  
  const { tripId, userId } = args;

  // Get trip details
  const { data: trip, error: tripError } = await supabaseAdmin
    .from('tdy_trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single();

  if (tripError || !trip) {
    throw new Error('Trip not found');
  }

  // Get all normalized items
  const { data: items } = await supabaseAdmin
    .from('tdy_items_normalized')
    .select('*')
    .eq('trip_id', tripId);

  const allItems: TdyItem[] = items || [];

  // Compute per-diem spans
  const spans = await computePerDiemSpans({
    destination: trip.destination,
    startDate: trip.depart_date,
    endDate: trip.return_date
  });

  // Persist spans to database
  await supabaseAdmin
    .from('tdy_per_diem_snap')
    .delete()
    .eq('trip_id', tripId);

  if (spans.length > 0) {
    await supabaseAdmin
      .from('tdy_per_diem_snap')
      .insert(
        spans.map(span => ({
          trip_id: tripId,
          locality: span.locality,
          start_date: span.start,
          end_date: span.end,
          mie_cents: span.mie_cents,
          lodging_cap_cents: span.lodging_cap_cents,
          computed_at: new Date().toISOString()
        }))
      );
  }

  // Build day-by-day ledger
  const allDates = getDateRange(trip.depart_date, trip.return_date);
  const days = allDates.map((date, index) => {
    const isFirstDay = index === 0;
    const isLastDay = index === allDates.length - 1;
    const isTravelDay = isFirstDay || isLastDay;

    // Find applicable per-diem span for this date
    const span = spans.find(s => date >= s.start && date <= s.end);
    const mieDaily = span?.mie_cents || 0;
    const lodgingCap = span?.lodging_cap_cents || 0;

    // Apply 75% on travel days
    const mieAllowed = isTravelDay 
      ? Math.round(mieDaily * 0.75) 
      : mieDaily;

    return {
      date,
      mie_allowed_cents: mieAllowed,
      lodging_cap_cents: lodgingCap,
      is_travel_day: isTravelDay
    };
  });

  // Calculate totals
  const mie_total_cents = days.reduce((sum, d) => sum + d.mie_allowed_cents, 0);

  // Lodging: Apply cap per night, add taxes fully
  const lodgingItems = allItems.filter(i => i.item_type === 'lodging');
  let lodging_allowed_cents = 0;

  for (const item of lodgingItems) {
    const nights = item.meta?.nights || 1;
    const nightlyRate = item.meta?.nightly_rate_cents || (item.amount_cents / nights);
    const taxCents = item.meta?.tax_cents || 0;

    // Find applicable lodging cap for this date
    const day = days.find(d => d.date === item.tx_date);
    const cap = day?.lodging_cap_cents || 0;

    // Cap the nightly rate (pre-tax), then add taxes fully
    const cappedNightly = Math.min(nightlyRate, cap);
    const totalAllowed = (cappedNightly * nights) + taxCents;

    lodging_allowed_cents += totalAllowed;
  }

  // Mileage: Sum all mileage items
  const mileage_total_cents = allItems
    .filter(i => i.item_type === 'mileage')
    .reduce((sum, i) => sum + i.amount_cents, 0);

  // Misc: Sum all misc items
  const misc_total_cents = allItems
    .filter(i => i.item_type === 'misc')
    .reduce((sum, i) => sum + i.amount_cents, 0);

  // Grand total
  const grand_total_cents = 
    mie_total_cents +
    lodging_allowed_cents +
    mileage_total_cents +
    misc_total_cents;

  return {
    mie_total_cents,
    lodging_allowed_cents,
    mileage_total_cents,
    misc_total_cents,
    grand_total_cents,
    days
  };
}

