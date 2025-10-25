/**
 * BAH PROVIDER
 * 
 * Fetches Basic Allowance for Housing (BAH) rates from bah_rates table
 * Data source: DFAS official BAH rates (updated annually, usually January)
 * TTL: 24 hours (rates are static, updated yearly)
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

import type { ResolvedData, ProviderResult } from '../types';

export interface BAHParams {
  paygrade: string;           // E01-E09, O01-O10, W01-W05
  mhaOrZip: string;           // MHA code (e.g., 'WA408') or ZIP
  withDependents: boolean;
  effectiveDate?: Date;       // Defaults to today
}

/**
 * Get BAH rate for given parameters
 * Returns rate in cents or null if not found
 */
export async function getBAHRate(params: BAHParams): Promise<ProviderResult> {
  const { paygrade, mhaOrZip, withDependents, effectiveDate = new Date() } = params;

  try {
    // Normalize MHA (uppercase, strip non-alphanumeric)
    const mha = mhaOrZip.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Query bah_rates table
    const { data, error } = await supabaseAdmin
      .from('bah_rates')
      .select('rate_cents, effective_date, location_name')
      .eq('paygrade', paygrade.toUpperCase())
      .eq('mha', mha)
      .eq('with_dependents', withDependents)
      .lte('effective_date', effectiveDate.toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        data: null,
        error: `Database error: ${error.message}`,
        cached: false
      };
    }

    if (!data) {
      return {
        data: null,
        error: `No BAH rate found for ${paygrade} at ${mha}`,
        cached: false
      };
    }

    // Format as ResolvedData
    const resolved: ResolvedData = {
      value: data.rate_cents,
      currency: 'USD',
      asOf: data.effective_date,
      sourceName: 'DFAS BAH Rates',
      sourceUrl: 'https://www.defensetravel.dod.mil/site/bahCalc.cfm',
      format: 'money',
      displayValue: formatCents(data.rate_cents)
    };

    return {
      data: resolved,
      cached: false // Cache handled by registry layer
    };

  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
      cached: false
    };
  }
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

/**
 * Get all BAH rates for a location (all paygrades)
 * Useful for comparison tables
 */
export async function getBAHRatesByLocation(params: {
  mhaOrZip: string;
  withDependents: boolean;
  effectiveDate?: Date;
}): Promise<Array<{ paygrade: string; rateCents: number }>> {
  const { mhaOrZip, withDependents, effectiveDate = new Date() } = params;

  try {
    const mha = mhaOrZip.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const { data, error } = await supabaseAdmin
      .from('bah_rates')
      .select('paygrade, rate_cents')
      .eq('mha', mha)
      .eq('with_dependents', withDependents)
      .lte('effective_date', effectiveDate.toISOString().split('T')[0])
      .order('effective_date', { ascending: false });

    if (error || !data) {
      return [];
    }

    // Get latest rate per paygrade
    const ratesByPaygrade = new Map<string, number>();
    for (const row of data) {
      if (!ratesByPaygrade.has(row.paygrade)) {
        ratesByPaygrade.set(row.paygrade, row.rate_cents);
      }
    }

    return Array.from(ratesByPaygrade.entries()).map(([paygrade, rateCents]) => ({
      paygrade,
      rateCents
    }));

  } catch {
    return [];
  }
}

