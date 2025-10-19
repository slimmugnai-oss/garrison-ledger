/**
 * EXPECTED PAY CALCULATOR
 * 
 * Computes expected pay values (BAH, BAS, COLA, special pays) based on:
 * - User profile (paygrade, dependents, location, YOS)
 * - BAH rates table (from existing bah_rates)
 * - BAS from SSOT
 * - COLA rates (if available)
 * 
 * Data Integrity: FACTUAL ONLY - no estimates or guesses.
 * If data is unavailable, omit rather than fabricate.
 */

import type { ExpectedSnapshot, ExpectedSpecialPay } from '@/app/types/les';
import { supabaseAdmin } from '@/lib/supabase';
import { ssot } from '@/lib/ssot';
import { isOfficer, isEnlisted } from '@/app/types/les';

export interface ExpectedPayParams {
  userId: string;
  month: number;      // 1-12
  year: number;
  paygrade: string;   // E01-E09, O01-O10, W01-W05
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;       // Years of service
}

/**
 * Build expected pay snapshot for a given month/year
 * 
 * @param params User profile and period
 * @returns ExpectedSnapshot with computed values
 */
export async function buildExpectedSnapshot(
  params: ExpectedPayParams
): Promise<ExpectedSnapshot> {
  const {
    userId,
    month,
    year,
    paygrade,
    mha_or_zip,
    with_dependents,
    yos
  } = params;

  // Compute last day of the month for "effective as of" date checks
  const lastDayOfMonth = new Date(year, month, 0); // month is 0-indexed in Date constructor

  const expected: ExpectedSnapshot['expected'] = {};

  // =============================================================================
  // BAH (Basic Allowance for Housing)
  // =============================================================================
  if (mha_or_zip) {
    const bahCents = await computeBAH({
      paygrade,
      mha_or_zip,
      with_dependents,
      effectiveDate: lastDayOfMonth
    });
    
    if (bahCents !== null) {
      expected.bah_cents = bahCents;
    }
    // If null, omit (data not available - don't guess)
  }

  // =============================================================================
  // BAS (Basic Allowance for Subsistence)
  // =============================================================================
  const basCents = computeBAS(paygrade);
  if (basCents !== null) {
    expected.bas_cents = basCents;
  }

  // =============================================================================
  // COLA (Cost of Living Allowance)
  // =============================================================================
  if (mha_or_zip) {
    const colaCents = await computeCOLA({
      mha_or_zip,
      paygrade,
      with_dependents,
      effectiveDate: lastDayOfMonth
    });
    
    if (colaCents !== null) {
      expected.cola_cents = colaCents;
    }
  }

  // =============================================================================
  // Special Pays (SDAP, HFP/IDP, etc.)
  // =============================================================================
  // TODO: Implement when profile toggles for special pays are available
  // For v1, omit unless explicitly configured in user profile
  const specials = await computeSpecialPays(userId, year, month);
  if (specials.length > 0) {
    expected.specials = specials;
  }

  return {
    user_id: userId,
    month,
    year,
    paygrade,
    mha_or_zip,
    with_dependents,
    yos,
    expected
  };
}

/**
 * Compute BAH from bah_rates table
 * Returns cents or null if not found (FACTUAL ONLY)
 */
async function computeBAH(params: {
  paygrade: string;
  mha_or_zip: string;
  with_dependents: boolean;
  effectiveDate: Date;
}): Promise<number | null> {
  const { paygrade, mha_or_zip, with_dependents, effectiveDate } = params;

  try {
    // Query bah_rates table for matching record
    // Find the latest effective_date <= lastDayOfMonth
    const { data, error } = await supabaseAdmin
      .from('bah_rates')
      .select('rate_cents')
      .eq('paygrade', paygrade)
      .eq('mha', mha_or_zip.toUpperCase())
      .eq('with_dependents', with_dependents)
      .lte('effective_date', effectiveDate.toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Expected] BAH query error:', error);
      return null;
    }

    if (!data) {
      // No BAH rate found - omit rather than guess
      console.warn(`[Expected] No BAH rate found for ${paygrade} at ${mha_or_zip} (deps: ${with_dependents})`);
      return null;
    }

    return data.rate_cents;
  } catch (error) {
    console.error('[Expected] BAH computation error:', error);
    return null;
  }
}

/**
 * Compute BAS from SSOT
 * Returns cents or null
 */
function computeBAS(paygrade: string): number | null {
  try {
    if (isOfficer(paygrade)) {
      return ssot.militaryPay.basMonthlyCents.officer;
    } else if (isEnlisted(paygrade)) {
      return ssot.militaryPay.basMonthlyCents.enlisted;
    }
    return null;
  } catch (error) {
    console.error('[Expected] BAS computation error:', error);
    return null;
  }
}

/**
 * Compute COLA from conus_cola_rates table (if available)
 * Returns cents or null
 * 
 * TODO: Add OCONUS COLA support when table is available
 */
async function computeCOLA(params: {
  mha_or_zip: string;
  paygrade: string;
  with_dependents: boolean;
  effectiveDate: Date;
}): Promise<number | null> {
  const { mha_or_zip, paygrade, with_dependents, effectiveDate } = params;

  try {
    // Check if conus_cola_rates table exists
    const { data, error } = await supabaseAdmin
      .from('conus_cola_rates')
      .select('monthly_amount_cents')
      .eq('mha', mha_or_zip.toUpperCase())
      .eq('paygrade', paygrade)
      .eq('with_dependents', with_dependents)
      .lte('effective_date', effectiveDate.toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Table might not exist yet - that's OK, just omit COLA
      if (error.code === '42P01') { // Table doesn't exist
        return null;
      }
      console.error('[Expected] COLA query error:', error);
      return null;
    }

    if (!data) {
      // No COLA rate found - this location might not have COLA
      return null;
    }

    return data.monthly_amount_cents;
  } catch (error) {
    console.error('[Expected] COLA computation error:', error);
    return null;
  }
}

/**
 * Compute special pays from user profile toggles
 * Returns array of special pays or empty array
 * 
 * TODO: Implement when user profile has special pay flags
 */
async function computeSpecialPays(
  userId: string,
  year: number,
  month: number
): Promise<ExpectedSpecialPay[]> {
  // v1: Return empty array
  // v1.1: Query user profile for special pay flags (SDAP, HFP/IDP, FLPP, FSA, etc.)
  // and compute expected amounts from allowances tables or profile-stored values
  
  try {
    // Example structure (not implemented yet):
    /*
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('special_pays')
      .eq('user_id', userId)
      .single();
    
    if (profile?.special_pays) {
      return profile.special_pays.map(sp => ({
        code: sp.code,
        cents: sp.monthly_cents
      }));
    }
    */
    
    return [];
  } catch (error) {
    console.error('[Expected] Special pays computation error:', error);
    return [];
  }
}

/**
 * Helper: Get last day of month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0);
}

/**
 * Helper: Format effective date for query
 */
export function formatEffectiveDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

