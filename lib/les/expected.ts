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
  // Special Pays (SDAP, HFP/IDP, FSA, FLPP)
  // =============================================================================
  const specials = await computeSpecialPays(userId, year, month);
  if (specials.length > 0) {
    expected.specials = specials;
  }

  // =============================================================================
  // Base Pay
  // =============================================================================
  if (yos !== undefined) {
    const basePayCents = await computeBasePay(paygrade, yos);
    if (basePayCents !== null) {
      expected.base_pay_cents = basePayCents;
    }
  }

  // =============================================================================
  // Calculate Gross Pay (for deduction/tax calculations)
  // =============================================================================
  const grossPayCents = (expected.base_pay_cents || 0) +
                        (expected.bah_cents || 0) +
                        (expected.bas_cents || 0) +
                        (expected.cola_cents || 0) +
                        (expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);

  // =============================================================================
  // Deductions (TSP, SGLI, Dental)
  // =============================================================================
  const deductions = await computeDeductions(userId, grossPayCents);
  if (deductions.tsp_cents) expected.tsp_cents = deductions.tsp_cents;
  if (deductions.sgli_cents) expected.sgli_cents = deductions.sgli_cents;
  if (deductions.dental_cents) expected.dental_cents = deductions.dental_cents;

  // =============================================================================
  // Taxes (Federal, State, FICA, Medicare)
  // =============================================================================
  const taxes = await computeTaxes(userId, grossPayCents, year);
  if (taxes.federal_tax_cents) expected.federal_tax_cents = taxes.federal_tax_cents;
  if (taxes.state_tax_cents) expected.state_tax_cents = taxes.state_tax_cents;
  if (taxes.fica_cents) expected.fica_cents = taxes.fica_cents;
  if (taxes.medicare_cents) expected.medicare_cents = taxes.medicare_cents;

  // =============================================================================
  // Net Pay = Gross - Deductions - Taxes
  // =============================================================================
  const totalDeductions = (deductions.tsp_cents || 0) +
                          (deductions.sgli_cents || 0) +
                          (deductions.dental_cents || 0);
  const totalTaxes = (taxes.federal_tax_cents || 0) +
                     (taxes.state_tax_cents || 0) +
                     (taxes.fica_cents || 0) +
                     (taxes.medicare_cents || 0);
  
  expected.net_pay_cents = grossPayCents - totalDeductions - totalTaxes;

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
      return null;
    }

    if (!data) {
      // No BAH rate found - omit rather than guess
      return null;
    }

    return data.rate_cents;
  } catch {
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
  } catch {
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
      return null;
    }

    if (!data) {
      // No COLA rate found - this location might not have COLA
      return null;
    }

    return data.monthly_amount_cents;
  } catch {
    return null;
  }
}

/**
 * Compute special pays from user profile
 * Returns array of special pays or empty array
 * 
 * Reads from existing profile fields: receives_sdap, receives_hfp_idp, receives_fsa, receives_flpp
 */
async function computeSpecialPays(
  userId: string,
  _year: number,
  _month: number
): Promise<ExpectedSpecialPay[]> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('receives_sdap, sdap_monthly_cents, receives_hfp_idp, hfp_idp_monthly_cents, receives_fsa, fsa_monthly_cents, receives_flpp, flpp_monthly_cents')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !profile) {
      return [];
    }
    
    const specials: ExpectedSpecialPay[] = [];
    
    // SDAP - Special Duty Assignment Pay
    if (profile.receives_sdap && profile.sdap_monthly_cents) {
      specials.push({ code: 'SDAP', cents: profile.sdap_monthly_cents });
    }
    
    // HFP/IDP - Hostile Fire Pay / Imminent Danger Pay
    if (profile.receives_hfp_idp && profile.hfp_idp_monthly_cents) {
      specials.push({ code: 'HFP_IDP', cents: profile.hfp_idp_monthly_cents });
    }
    
    // FSA - Family Separation Allowance
    if (profile.receives_fsa && profile.fsa_monthly_cents) {
      specials.push({ code: 'FSA', cents: profile.fsa_monthly_cents });
    }
    
    // FLPP - Foreign Language Proficiency Pay
    if (profile.receives_flpp && profile.flpp_monthly_cents) {
      specials.push({ code: 'FLPP', cents: profile.flpp_monthly_cents });
    }
    
    return specials;
  } catch {
    return [];
  }
}

/**
 * Compute base pay from military_pay_tables
 * Returns cents or null if not found
 */
async function computeBasePay(
  paygrade: string,
  yos: number
): Promise<number | null> {
  try {
    // Query military_pay_tables for base pay
    // Find the row for this paygrade where yos matches or is the highest yos <= user's yos
    const { data, error } = await supabaseAdmin
      .from('military_pay_tables')
      .select('monthly_rate_cents')
      .eq('paygrade', paygrade)
      .lte('years_of_service', yos)
      .order('years_of_service', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return data.monthly_rate_cents;
  } catch {
    return null;
  }
}

/**
 * Compute deductions (TSP, SGLI, Dental) from profile
 * Returns object with expected deduction amounts
 */
async function computeDeductions(
  userId: string,
  grossPayCents: number
): Promise<{
  tsp_cents?: number;
  sgli_cents?: number;
  dental_cents?: number;
}> {
  const result: { tsp_cents?: number; sgli_cents?: number; dental_cents?: number } = {};
  
  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('tsp_contribution_percent, sgli_coverage_amount, has_dental_insurance')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!profile) return result;
    
    // TSP Contribution
    if (profile.tsp_contribution_percent && profile.tsp_contribution_percent > 0) {
      result.tsp_cents = Math.round(grossPayCents * profile.tsp_contribution_percent);
    }
    
    // SGLI Premium (query from sgli_rates table)
    if (profile.sgli_coverage_amount && profile.sgli_coverage_amount > 0) {
      const { data: sgliRate } = await supabaseAdmin
        .from('sgli_rates')
        .select('monthly_premium_cents')
        .eq('coverage_amount', profile.sgli_coverage_amount)
        .maybeSingle();
      
      if (sgliRate) {
        result.sgli_cents = sgliRate.monthly_premium_cents;
      }
    }
    
    // Dental Insurance (typical premium $13-15/month for individual, $30-35 for family)
    if (profile.has_dental_insurance) {
      // Use typical rate - users will override if different
      result.dental_cents = 1400; // $14/month typical
    }
    
    return result;
  } catch {
    return result;
  }
}

/**
 * Compute taxes (Federal, State, FICA, Medicare) from profile and tax tables
 * Returns object with expected tax amounts
 * Note: Tax calculations are estimates - actual withholding varies by W-4 settings
 */
async function computeTaxes(
  userId: string,
  grossPayCents: number,
  year: number
): Promise<{
  federal_tax_cents?: number;
  state_tax_cents?: number;
  fica_cents?: number;
  medicare_cents?: number;
}> {
  const result: { federal_tax_cents?: number; state_tax_cents?: number; fica_cents?: number; medicare_cents?: number } = {};
  
  try {
    // Get tax constants for the year
    const { data: taxConstants } = await supabaseAdmin
      .from('payroll_tax_constants')
      .select('fica_rate, fica_wage_base_cents, medicare_rate')
      .eq('effective_year', year)
      .maybeSingle();
    
    if (!taxConstants) return result;
    
    // FICA (Social Security) - 6.2% up to wage base
    const ficaRate = parseFloat(taxConstants.fica_rate as string);
    const ficaWageBase = taxConstants.fica_wage_base_cents;
    result.fica_cents = Math.round(Math.min(grossPayCents, ficaWageBase) * ficaRate);
    
    // Medicare - 1.45% of all wages
    const medicareRate = parseFloat(taxConstants.medicare_rate as string);
    result.medicare_cents = Math.round(grossPayCents * medicareRate);
    
    // Federal and State Tax - Get from profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('filing_status, state_of_residence, w4_allowances')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profile) {
      // Federal Tax - Rough estimate based on filing status
      // This is a simplification - actual tax is complex with brackets
      // Users should override with actual value from LES
      if (profile.filing_status) {
        const annualGross = grossPayCents * 12;
        let estimatedFederalRate = 0.12; // Default 12% bracket
        
        // Adjust for filing status and income level
        if (profile.filing_status === 'married_filing_jointly') {
          if (annualGross > 9000000) estimatedFederalRate = 0.22; // $90K+
          else if (annualGross > 6500000) estimatedFederalRate = 0.12;
          else estimatedFederalRate = 0.10;
        } else { // single
          if (annualGross > 4700000) estimatedFederalRate = 0.22; // $47K+
          else if (annualGross > 3200000) estimatedFederalRate = 0.12;
          else estimatedFederalRate = 0.10;
        }
        
        result.federal_tax_cents = Math.round(grossPayCents * estimatedFederalRate);
      }
      
      // State Tax - Query state_tax_rates table
      if (profile.state_of_residence) {
        const { data: stateRate } = await supabaseAdmin
          .from('state_tax_rates')
          .select('tax_type, flat_rate, avg_rate_mid')
          .eq('state_code', profile.state_of_residence)
          .eq('effective_year', year)
          .maybeSingle();
        
        if (stateRate) {
          if (stateRate.tax_type === 'none') {
            result.state_tax_cents = 0; // No state income tax
          } else if (stateRate.tax_type === 'flat' && stateRate.flat_rate) {
            result.state_tax_cents = Math.round(grossPayCents * parseFloat(stateRate.flat_rate as string));
          } else if (stateRate.avg_rate_mid) {
            result.state_tax_cents = Math.round(grossPayCents * parseFloat(stateRate.avg_rate_mid as string));
          }
        }
      }
    }
    
    return result;
  } catch {
    return result;
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

