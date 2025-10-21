/**
 * TDY RECEIPT NORMALIZER
 * 
 * Parses receipt text and extracts line items
 * Heuristic-based (v1) - expects common hotel/meal receipt formats
 */

import type { TdyItem, DocType } from '@/app/types/tdy';
import { parseDate } from './util';

/**
 * Normalize receipt text to structured line items
 */
export async function normalizeReceiptText(args: {
  trip: { depart_date: string; return_date: string };
  docType: DocType;
  text: string;
  mileageCentsPerMile: number;
}): Promise<Omit<TdyItem, 'id' | 'trip_id'>[]> {
  
  const { trip: _trip, docType, text, mileageCentsPerMile } = args;

  // Route to appropriate parser based on docType
  switch (docType) {
    case 'LODGING':
      return parseLodgingReceipt(text);
    
    case 'MEALS':
      return parseMealReceipt(text);
    
    case 'MILEAGE':
      return parseMileageDoc(text, mileageCentsPerMile);
    
    case 'MISC':
      return parseMiscReceipt(text);
    
    case 'ORDERS':
    case 'OTHER':
    default:
      // No auto-parsing for orders/other - user must manually enter
      return [];
  }
}

/**
 * Parse lodging receipt
 * Detects: check-in date, nights, room rate, tax, total
 */
function parseLodgingReceipt(text: string): Omit<TdyItem, 'id' | 'trip_id'>[] {
  const items: Omit<TdyItem, 'id' | 'trip_id'>[] = [];

  // Extract vendor (first line usually)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const vendor = lines[0]?.substring(0, 50) || 'Lodging';

  // Look for check-in date (common patterns)
  const datePatterns = [
    /check[- ]in.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /arrival.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /date.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i
  ];

  let checkInDate: string | null = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      checkInDate = parseDate(match[1]);
      if (checkInDate) break;
    }
  }

  // Look for nights
  const nightsMatch = text.match(/(\d+)\s*night/i);
  const nights = nightsMatch ? parseInt(nightsMatch[1]) : 1;

  // Look for amounts
  const amountPatterns = [
    /room.*?\$?([\d,]+\.\d{2})/i,
    /subtotal.*?\$?([\d,]+\.\d{2})/i,
    /total.*?\$?([\d,]+\.\d{2})/i
  ];

  let roomRate: number | null = null;
  let total: number | null = null;

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && !roomRate) {
      roomRate = parseCurrency(match[1]);
    }
  }

  // Look for tax
  const taxMatch = text.match(/tax.*?\$?([\d,]+\.\d{2})/i);
  const tax = taxMatch ? parseCurrency(taxMatch[1]) : 0;

  // If we found room rate, compute total
  if (roomRate) {
    total = roomRate * nights + tax;
  } else {
    // Fallback: find any $ amount
    const anyAmount = text.match(/\$?([\d,]+\.\d{2})/);
    if (anyAmount) {
      total = parseCurrency(anyAmount[1]);
      roomRate = total - tax;
    }
  }

  if (checkInDate && total) {
    items.push({
      item_type: 'lodging',
      tx_date: checkInDate,
      vendor,
      description: `${nights} night${nights > 1 ? 's' : ''}`,
      amount_cents: total,
      meta: {
        nights,
        nightly_rate_cents: roomRate ? Math.round(roomRate / nights) : undefined,
        tax_cents: tax
      }
    });
  }

  return items;
}

/**
 * Parse meal receipt
 */
function parseMealReceipt(text: string): Omit<TdyItem, 'id' | 'trip_id'>[] {
  const items: Omit<TdyItem, 'id' | 'trip_id'>[] = [];

  // Look for date
  const dateMatch = text.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
  const txDate = dateMatch ? parseDate(dateMatch[1]) : null;

  // Look for total
  const totalMatch = text.match(/total.*?\$?([\d,]+\.\d{2})/i);
  const total = totalMatch ? parseCurrency(totalMatch[1]) : null;

  // Vendor (first line)
  const vendor = text.split('\n')[0]?.substring(0, 50) || 'Meal';

  if (txDate && total) {
    items.push({
      item_type: 'meals',
      tx_date: txDate,
      vendor,
      amount_cents: total
    });
  }

  return items;
}

/**
 * Parse mileage document
 */
function parseMileageDoc(text: string, mileageCentsPerMile: number): Omit<TdyItem, 'id' | 'trip_id'>[] {
  const items: Omit<TdyItem, 'id' | 'trip_id'>[] = [];

  // Look for miles (common patterns)
  const milesMatch = text.match(/(\d+)\s*mile/i);
  const miles = milesMatch ? parseInt(milesMatch[1]) : null;

  if (miles) {
    const amountCents = miles * mileageCentsPerMile;

    items.push({
      item_type: 'mileage',
      tx_date: new Date().toISOString().split('T')[0], // Default to today
      description: `${miles} miles`,
      amount_cents: amountCents,
      meta: {
        miles
      }
    });
  }

  return items;
}

/**
 * Parse miscellaneous receipt (parking, tolls, etc.)
 */
function parseMiscReceipt(text: string): Omit<TdyItem, 'id' | 'trip_id'>[] {
  const items: Omit<TdyItem, 'id' | 'trip_id'>[] = [];

  // Look for date
  const dateMatch = text.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
  const txDate = dateMatch ? parseDate(dateMatch[1]) : null;

  // Look for amount
  const amountMatch = text.match(/\$?([\d,]+\.\d{2})/);
  const amount = amountMatch ? parseCurrency(amountMatch[1]) : null;

  // Try to detect category
  let description = 'Misc expense';
  if (/parking/i.test(text)) description = 'Parking';
  if (/toll/i.test(text)) description = 'Tolls';
  if (/baggage|luggage/i.test(text)) description = 'Baggage fee';
  if (/taxi|uber|lyft/i.test(text)) description = 'Local transport';

  const vendor = text.split('\n')[0]?.substring(0, 50) || description;

  if (txDate && amount) {
    items.push({
      item_type: 'misc',
      tx_date: txDate,
      vendor,
      description,
      amount_cents: amount
    });
  }

  return items;
}

/**
 * Parse currency string to cents
 */
function parseCurrency(str: string): number {
  // Remove commas and parse
  const cleaned = str.replace(/,/g, '');
  const dollars = parseFloat(cleaned);
  
  if (isNaN(dollars)) {
    return 0;
  }

  return Math.round(dollars * 100);
}

