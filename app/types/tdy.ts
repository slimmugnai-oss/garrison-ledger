/**
 * TDY COPILOT TYPES
 * 
 * Types for travel voucher processing
 */

export type DocType = 'ORDERS' | 'LODGING' | 'MEALS' | 'MILEAGE' | 'MISC' | 'OTHER';
export type ItemType = 'lodging' | 'meals' | 'mileage' | 'misc';
export type Severity = 'red' | 'yellow' | 'green';

export interface TdyTrip {
  id: string;
  user_id: string;
  purpose: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TdyDoc {
  id: string;
  trip_id: string;
  doc_type: DocType;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  parsed_ok: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsed: Record<string, any>;
  created_at?: string;
}

export interface TdyItem {
  id?: number;
  trip_id: string;
  source_doc?: string | null;
  item_type: ItemType;
  tx_date: string;
  vendor?: string;
  description?: string;
  amount_cents: number;
  meta?: {
    nights?: number;
    nightly_rate_cents?: number;
    tax_cents?: number;
    miles?: number;
    includes_tax?: boolean;
    pretax_cents?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface PerDiemSpan {
  locality: string;
  start: string;
  end: string;
  mie_cents: number;
  lodging_cap_cents: number;
}

export interface EstimateTotals {
  mie_total_cents: number;
  lodging_allowed_cents: number;
  mileage_total_cents: number;
  misc_total_cents: number;
  grand_total_cents: number;
  days: Array<{
    date: string;
    mie_allowed_cents: number;
    lodging_cap_cents: number;
    is_travel_day: boolean;
  }>;
}

export interface TdyFlag {
  severity: Severity;
  flag_code: 'DUP_RECEIPT' | 'OUT_OF_WINDOW' | 'OVER_LODGING_CAP' | 'MISSING_RECEIPT' | 'RATE_LOOKUP_FAILED';
  message: string;
  suggestion: string;
  ref?: string;
}

export interface TdyVoucher {
  trip: {
    purpose: string;
    origin: string;
    destination: string;
    depart_date: string;
    return_date: string;
  };
  totals: EstimateTotals;
  line_items: {
    lodging: TdyItem[];
    meals: TdyItem[];
    mileage: TdyItem[];
    misc: TdyItem[];
  };
  per_diem_spans: PerDiemSpan[];
  flags: TdyFlag[];
  checklist: string[];
  version: number;
}

