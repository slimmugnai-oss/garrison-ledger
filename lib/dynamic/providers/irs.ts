/**
 * IRS / TSP LIMITS PROVIDER
 * 
 * IRS tax limits and TSP contribution limits from admin_constants table
 * Data source: admin_constants (manually updated by admins)
 * TTL: 24 hours (limits change annually, usually November for next year)
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { ResolvedData, ProviderResult } from '../types';

export interface IRSParams {
  field: string;  // e.g., 'IRS_STANDARD_DEDUCTION_2025_SINGLE', 'TSP_ELECTIVE_DEFERRAL_LIMIT_2025'
  year?: number;  // Tax year (defaults to current year)
}

/**
 * Get IRS/TSP limit from admin_constants
 * Returns value as integer (dollars or cents depending on how it's stored)
 */
export async function getIRSLimit(params: IRSParams): Promise<ProviderResult> {
  const { field, year = new Date().getFullYear() } = params;

  try {
    // If year not in field name, append it
    let lookupKey = field;
    if (!field.includes(year.toString())) {
      lookupKey = `${field}_${year}`;
    }

    const { data, error } = await supabaseAdmin
      .from('admin_constants')
      .select('value_json, as_of_date, source_url, source_name, category')
      .eq('key', lookupKey)
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: `No IRS/TSP limit found for ${lookupKey}`,
        cached: false
      };
    }

    // Parse value_json (should be a number string or number)
    const value = typeof data.value_json === 'string' 
      ? parseInt(data.value_json, 10)
      : Number(data.value_json);

    if (isNaN(value)) {
      return {
        data: null,
        error: `Invalid value for ${lookupKey}: ${data.value_json}`,
        cached: false
      };
    }

    // Determine format based on field name
    let format: 'money' | 'plain' = 'plain';
    let currency: string | undefined;
    let displayValue: string;

    if (field.includes('DEDUCTION') || field.includes('LIMIT') || field.includes('DEFERRAL')) {
      // These are dollar amounts (not cents)
      format = 'money';
      currency = 'USD';
      displayValue = formatDollars(value);
    } else {
      displayValue = value.toString();
    }

    const resolved: ResolvedData = {
      value,
      currency,
      asOf: data.as_of_date,
      sourceName: data.source_name || 'IRS',
      sourceUrl: data.source_url,
      format,
      displayValue
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
 * Get all TSP limits for a year
 */
export async function getAllTSPLimits(year: number = new Date().getFullYear()): Promise<{
  electiveDeferral?: ResolvedData;
  catchUp?: ResolvedData;
  annualAdditions?: ResolvedData;
}> {
  const [elective, catchUp, additions] = await Promise.all([
    getIRSLimit({ field: 'TSP_ELECTIVE_DEFERRAL_LIMIT', year }),
    getIRSLimit({ field: 'TSP_CATCH_UP_LIMIT', year }),
    getIRSLimit({ field: 'TSP_ANNUAL_ADDITIONS_LIMIT', year })
  ]);

  return {
    electiveDeferral: elective.data || undefined,
    catchUp: catchUp.data || undefined,
    annualAdditions: additions.data || undefined
  };
}

/**
 * Get all IRS standard deductions for a year
 */
export async function getAllStandardDeductions(year: number = new Date().getFullYear()): Promise<{
  single?: ResolvedData;
  marriedFilingJointly?: ResolvedData;
  headOfHousehold?: ResolvedData;
}> {
  const [single, married, hoh] = await Promise.all([
    getIRSLimit({ field: 'IRS_STANDARD_DEDUCTION', year }),
    getIRSLimit({ field: 'IRS_STANDARD_DEDUCTION_MARRIED_FILING_JOINTLY', year }),
    getIRSLimit({ field: 'IRS_STANDARD_DEDUCTION_HEAD_OF_HOUSEHOLD', year })
  ]);

  return {
    single: single.data || undefined,
    marriedFilingJointly: married.data || undefined,
    headOfHousehold: hoh.data || undefined
  };
}

/**
 * Format dollars as USD currency
 */
function formatDollars(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(dollars);
}

