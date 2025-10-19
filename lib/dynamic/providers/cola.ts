/**
 * COLA PROVIDER
 * 
 * Cost of Living Allowance (COLA) rates for CONUS and OCONUS
 * Data source: conus_cola_rates and oconus_cola_rates tables
 * TTL: 24 hours (COLA updates quarterly)
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { ResolvedData, ProviderResult } from '../types';

export interface COLAParams {
  location: string;           // MHA for CONUS, location_code for OCONUS
  paygrade: string;
  withDependents: boolean;
  type?: 'conus' | 'oconus';  // Auto-detect if not provided
  effectiveDate?: Date;
}

/**
 * Get COLA rate (auto-detects CONUS vs OCONUS)
 * Returns monthly amount in cents or null if not found
 */
export async function getCOLARate(params: COLAParams): Promise<ProviderResult> {
  const { location, paygrade, withDependents, type, effectiveDate = new Date() } = params;

  try {
    // Try CONUS first if type not specified
    if (!type || type === 'conus') {
      const conusResult = await getCONUSCOLA({
        mha: location,
        paygrade,
        withDependents,
        effectiveDate
      });
      
      if (conusResult.data) {
        return conusResult;
      }
    }

    // Try OCONUS if CONUS failed or type is oconus
    if (!type || type === 'oconus') {
      const oconusResult = await getOCONUSCOLA({
        locationCode: location,
        paygrade,
        withDependents,
        effectiveDate
      });
      
      if (oconusResult.data) {
        return oconusResult;
      }
    }

    // Not found in either table
    return {
      data: null,
      error: `No COLA rate found for location ${location}`,
      cached: false
    };

  } catch (error) {
    console.error('[COLA Provider] Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false
    };
  }
}

/**
 * Get CONUS COLA rate
 */
async function getCONUSCOLA(params: {
  mha: string;
  paygrade: string;
  withDependents: boolean;
  effectiveDate: Date;
}): Promise<ProviderResult> {
  const { mha, paygrade, withDependents, effectiveDate } = params;

  const { data, error } = await supabaseAdmin
    .from('conus_cola_rates')
    .select('monthly_amount_cents, effective_date, location_name, cola_index')
    .eq('mha', mha.toUpperCase())
    .eq('paygrade', paygrade.toUpperCase())
    .eq('with_dependents', withDependents)
    .lte('effective_date', effectiveDate.toISOString().split('T')[0])
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { data: null, cached: false };
  }

  const resolved: ResolvedData = {
    value: data.monthly_amount_cents,
    currency: 'USD',
    asOf: data.effective_date,
    sourceName: 'CONUS COLA Rates',
    sourceUrl: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/CONUS-Cost-of-Living-Allowance/',
    format: 'money',
    displayValue: formatCents(data.monthly_amount_cents)
  };

  return { data: resolved, cached: false };
}

/**
 * Get OCONUS COLA rate
 */
async function getOCONUSCOLA(params: {
  locationCode: string;
  paygrade: string;
  withDependents: boolean;
  effectiveDate: Date;
}): Promise<ProviderResult> {
  const { locationCode, paygrade, withDependents, effectiveDate } = params;

  const { data, error } = await supabaseAdmin
    .from('oconus_cola_rates')
    .select('monthly_amount_cents, effective_date, location_name, cola_index')
    .eq('location_code', locationCode.toUpperCase())
    .eq('paygrade', paygrade.toUpperCase())
    .eq('with_dependents', withDependents)
    .lte('effective_date', effectiveDate.toISOString().split('T')[0])
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { data: null, cached: false };
  }

  const resolved: ResolvedData = {
    value: data.monthly_amount_cents,
    currency: 'USD',
    asOf: data.effective_date,
    sourceName: 'OCONUS COLA Rates',
    sourceUrl: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Overseas-COLA/',
    format: 'money',
    displayValue: formatCents(data.monthly_amount_cents)
  };

  return { data: resolved, cached: false };
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

