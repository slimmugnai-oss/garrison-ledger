/**
 * TDY COMPLIANCE CHECKER
 * 
 * Generates flags for compliance issues:
 * - Duplicate receipts
 * - Out-of-window expenses
 * - Over lodging cap
 * - Missing receipts
 * - Rate lookup failures
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { TdyFlag, TdyItem } from '@/app/types/tdy';

/**
 * Run all compliance checks for a trip
 */
export async function runChecks(tripId: string, userId: string): Promise<TdyFlag[]> {
  
  const flags: TdyFlag[] = [];

  // Get trip
  const { data: trip } = await supabaseAdmin
    .from('tdy_trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single();

  if (!trip) {
    return flags;
  }

  // Get all items
  const { data: items } = await supabaseAdmin
    .from('tdy_items_normalized')
    .select('*')
    .eq('trip_id', tripId);

  const allItems: TdyItem[] = items || [];

  // Get per-diem spans
  const { data: spans } = await supabaseAdmin
    .from('tdy_per_diem_snap')
    .select('*')
    .eq('trip_id', tripId);

  // Check 1: Duplicates
  flags.push(...checkDuplicates(allItems));

  // Check 2: Out of window
  flags.push(...checkOutOfWindow(allItems, trip.depart_date, trip.return_date));

  // Check 3: Over lodging cap
  flags.push(...checkOverLodgingCap(allItems, spans || []));

  // Check 4: Missing receipts (>$75)
  flags.push(...checkMissingReceipts(allItems));

  // Check 5: Rate lookup failed
  if (spans && spans.some(s => s.mie_cents === 0 || s.lodging_cap_cents === 0)) {
    flags.push({
      severity: 'yellow',
      flag_code: 'RATE_LOOKUP_FAILED',
      message: 'Could not verify GSA per-diem rate for destination',
      suggestion: 'Confirm ZIP code or city/state. Attach GSA rate screenshot or memo.',
      ref: 'https://www.gsa.gov/travel/plan-book/per-diem-rates'
    });
  }

  // If no issues, add green flag
  if (flags.length === 0) {
    flags.push({
      severity: 'green',
      flag_code: 'ALL_CLEAR' as any,
      message: 'No compliance issues detected',
      suggestion: 'Review totals and proceed to voucher generation'
    });
  }

  return flags;
}

/**
 * Check for duplicate receipts
 */
function checkDuplicates(items: TdyItem[]): TdyFlag[] {
  const flags: TdyFlag[] = [];
  const seen = new Map<string, TdyItem>();

  for (const item of items) {
    const key = `${item.item_type}:${item.tx_date}:${item.amount_cents}`;
    
    if (seen.has(key)) {
      flags.push({
        severity: 'red',
        flag_code: 'DUP_RECEIPT',
        message: `Duplicate ${item.item_type} receipt: $${(item.amount_cents / 100).toFixed(2)} on ${item.tx_date}`,
        suggestion: 'Remove duplicate or annotate if legitimate split payment. Only one will be reimbursed.',
        ref: 'DFAS: Only one receipt per expense'
      });
    } else {
      seen.set(key, item);
    }
  }

  return flags;
}

/**
 * Check for expenses outside travel window
 */
function checkOutOfWindow(
  items: TdyItem[],
  departDate: string,
  returnDate: string
): TdyFlag[] {
  
  const flags: TdyFlag[] = [];

  for (const item of items) {
    const txDate = item.tx_date;
    
    if (txDate < departDate || txDate > returnDate) {
      // Calculate days outside window
      const daysBefore = txDate < departDate 
        ? daysDiff(txDate, departDate)
        : 0;
      const daysAfter = txDate > returnDate
        ? daysDiff(returnDate, txDate)
        : 0;
      
      const daysOutside = daysBefore || daysAfter;

      // Yellow if within ±7 days (possible prepayment)
      // Red if > 7 days
      const severity: 'red' | 'yellow' = daysOutside <= 7 ? 'yellow' : 'red';

      flags.push({
        severity,
        flag_code: 'OUT_OF_WINDOW',
        message: `${item.item_type} expense on ${txDate} is outside travel window (${departDate} to ${returnDate})`,
        suggestion: daysOutside <= 7
          ? 'If prepayment (airfare/hotel booking), add note and attach itinerary'
          : 'Remove expense or verify dates are correct',
        ref: 'Travel window: departure to return date only'
      });
    }
  }

  return flags;
}

/**
 * Check for lodging over cap
 */
function checkOverLodgingCap(
  items: TdyItem[],
  spans: Array<{ start_date: string; end_date: string; lodging_cap_cents: number }>
): TdyFlag[] {
  
  const flags: TdyFlag[] = [];

  const lodgingItems = items.filter(i => i.item_type === 'lodging');

  for (const item of lodgingItems) {
    // Find applicable span
    const span = spans.find(s => item.tx_date >= s.start_date && item.tx_date <= s.end_date);
    
    if (!span) continue;

    const nightlyRate = item.meta?.nightly_rate_cents || item.amount_cents;
    const cap = span.lodging_cap_cents;

    if (nightlyRate > cap) {
      const delta = nightlyRate - cap;

      flags.push({
        severity: 'red',
        flag_code: 'OVER_LODGING_CAP',
        message: `Lodging on ${item.tx_date}: $${(nightlyRate / 100).toFixed(2)}/night exceeds cap of $${(cap / 100).toFixed(2)}`,
        suggestion: `Over by $${(delta / 100).toFixed(2)}. Reduce to cap, split taxes separately, or attach authorization memo.`,
        ref: 'GSA lodging caps apply unless authorized exception'
      });
    }
  }

  return flags;
}

/**
 * Check for missing receipts (≥$75 threshold)
 */
function checkMissingReceipts(items: TdyItem[]): TdyFlag[] {
  const flags: TdyFlag[] = [];

  // Items requiring receipts: lodging always, misc if ≥$75
  const requireReceipt = items.filter(i => 
    i.item_type === 'lodging' || 
    (i.item_type === 'misc' && i.amount_cents >= 7500)
  );

  for (const item of requireReceipt) {
    // If no source_doc, it was manually entered
    if (!item.source_doc) {
      flags.push({
        severity: 'yellow',
        flag_code: 'MISSING_RECEIPT',
        message: `${item.item_type} expense of $${(item.amount_cents / 100).toFixed(2)} on ${item.tx_date} has no receipt`,
        suggestion: 'Upload receipt PDF or attach missing-receipt affidavit per local policy',
        ref: 'Receipts required for lodging and expenses ≥ $75'
      });
    }
  }

  return flags;
}

/**
 * Helper: Days difference
 */
function daysDiff(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

