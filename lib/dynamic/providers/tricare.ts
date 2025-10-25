/**
 * TRICARE COSTS PROVIDER
 * 
 * TRICARE deductibles, premiums, and cost-shares from admin_constants
 * Data source: admin_constants (manually updated annually)
 * TTL: 7 days (TRICARE costs change annually, usually January)
 */

import { supabaseAdmin } from '@/lib/supabase';

import type { ResolvedData, ProviderResult } from '../types';

export interface TRICAREParams {
  field: string;  // e.g., 'TRICARE_SELECT_INDIVIDUAL_DEDUCTIBLE_E1_E4_2025'
  year?: number;  // Defaults to current year
}

/**
 * Get TRICARE cost from admin_constants
 * Returns value in cents
 */
export async function getTRICARECost(params: TRICAREParams): Promise<ProviderResult> {
  const { field, year = new Date().getFullYear() } = params;

  try {
    // Append year if not in field name
    let lookupKey = field;
    if (!field.includes(year.toString())) {
      lookupKey = `${field}_${year}`;
    }

    const { data, error } = await supabaseAdmin
      .from('admin_constants')
      .select('value_json, as_of_date, source_url, source_name')
      .eq('key', lookupKey)
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: `No TRICARE cost found for ${lookupKey}`,
        cached: false
      };
    }

    // Parse value_json (should be cents as integer)
    const cents = typeof data.value_json === 'string' 
      ? parseInt(data.value_json, 10)
      : Number(data.value_json);

    if (isNaN(cents)) {
      return {
        data: null,
        error: `Invalid value for ${lookupKey}: ${data.value_json}`,
        cached: false
      };
    }

    const resolved: ResolvedData = {
      value: cents,
      currency: 'USD',
      asOf: data.as_of_date,
      sourceName: data.source_name || 'TRICARE',
      sourceUrl: data.source_url || 'https://www.tricare.mil/Costs',
      format: 'money',
      displayValue: formatCents(cents)
    };

    return {
      data: resolved,
      cached: false
    };

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false
    };
  }
}

/**
 * Get all TRICARE Select deductibles for a year
 */
export async function getTRICARESelectDeductibles(year: number = new Date().getFullYear()): Promise<{
  individualE1E4?: ResolvedData;
  individualE5Plus?: ResolvedData;
  familyE1E4?: ResolvedData;
  familyE5Plus?: ResolvedData;
}> {
  const [indivE1E4, indivE5, famE1E4, famE5] = await Promise.all([
    getTRICARECost({ field: 'TRICARE_SELECT_INDIVIDUAL_DEDUCTIBLE_E1_E4', year }),
    getTRICARECost({ field: 'TRICARE_SELECT_INDIVIDUAL_DEDUCTIBLE_E5_AND_ABOVE', year }),
    getTRICARECost({ field: 'TRICARE_SELECT_FAMILY_DEDUCTIBLE_E1_E4', year }),
    getTRICARECost({ field: 'TRICARE_SELECT_FAMILY_DEDUCTIBLE_E5_AND_ABOVE', year })
  ]);

  return {
    individualE1E4: indivE1E4.data || undefined,
    individualE5Plus: indivE5.data || undefined,
    familyE1E4: famE1E4.data || undefined,
    familyE5Plus: famE5.data || undefined
  };
}

/**
 * Format cents as USD currency
 */
function formatCents(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

