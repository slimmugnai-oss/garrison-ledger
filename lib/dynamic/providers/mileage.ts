/**
 * MILEAGE RATE PROVIDER
 * 
 * DFAS official mileage reimbursement rate from admin_constants
 * Data source: admin_constants (updated periodically by DFAS)
 * TTL: 7 days (changes 1-2 times per year)
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { ResolvedData, ProviderResult } from '../types';

export interface MileageParams {
  year?: number;  // Defaults to current year
}

/**
 * Get DFAS mileage rate (per mile)
 * Returns rate as decimal (e.g., 0.70 for $0.70/mile)
 */
export async function getMileageRate(params: MileageParams = {}): Promise<ProviderResult> {
  const { year = new Date().getFullYear() } = params;

  try {
    const lookupKey = `DFAS_MILEAGE_RATE_${year}`;

    const { data, error } = await supabaseAdmin
      .from('admin_constants')
      .select('value_json, as_of_date, source_url, source_name')
      .eq('key', lookupKey)
      .maybeSingle();

    if (error || !data) {
      console.warn(`[Mileage Provider] No rate found for ${lookupKey}`);
      return {
        data: null,
        error: `No mileage rate found for ${lookupKey}`,
        cached: false
      };
    }

    // Parse value_json (should be decimal string like "0.70")
    const rate = typeof data.value_json === 'string' 
      ? parseFloat(data.value_json)
      : Number(data.value_json);

    if (isNaN(rate)) {
      return {
        data: null,
        error: `Invalid mileage rate for ${lookupKey}: ${data.value_json}`,
        cached: false
      };
    }

    const resolved: ResolvedData = {
      value: rate,
      currency: 'USD',
      asOf: data.as_of_date,
      sourceName: data.source_name || 'DFAS Mileage Rates',
      sourceUrl: data.source_url || 'https://www.defensetravel.dod.mil/site/mileageRates.cfm',
      format: 'money',
      displayValue: `$${rate.toFixed(2)}/mile`
    };

    return {
      data: resolved,
      cached: false
    };

  } catch (error) {
    console.error('[Mileage Provider] Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false
    };
  }
}

/**
 * Calculate total mileage reimbursement for a trip
 */
export async function calculateMileageReimbursement(params: {
  miles: number;
  year?: number;
}): Promise<{
  miles: number;
  ratePerMile: number;
  totalCents: number;
  displayValue: string;
}> {
  const { miles, year } = params;

  const result = await getMileageRate({ year });

  if (!result.data) {
    throw new Error('Mileage rate not available');
  }

  const totalCents = Math.round(miles * result.data.value * 100);
  const totalDollars = totalCents / 100;

  return {
    miles,
    ratePerMile: result.data.value,
    totalCents,
    displayValue: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(totalDollars)
  };
}

