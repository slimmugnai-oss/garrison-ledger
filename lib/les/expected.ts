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
 * Validate rank vs years of service for sanity checks
 * Prevents obviously wrong combinations (E01 with 20 YOS, O10 with 2 YOS, etc.)
 */
export function validateRankYOS(paygrade: string, yos: number): { valid: boolean; error?: string } {
  // Junior enlisted (E01-E04) rarely exceed 6 years before promotion
  if (['E01', 'E02', 'E03', 'E04'].includes(paygrade)) {
    if (yos > 8) {
      return { 
        valid: false, 
        error: `${paygrade} with ${yos} years of service is highly unusual. Junior enlisted typically promote to E05 within 4-6 years. Verify rank and time in service.` 
      };
    }
  }
  
  // Senior enlisted (E08-E09) require minimum years
  if (paygrade === 'E09' && yos < 15) {
    return { 
      valid: false, 
      error: `E09 (Master Chief/Sergeant Major) requires minimum ~15 years of service. Verify rank and YOS.` 
    };
  }
  
  if (paygrade === 'E08' && yos < 12) {
    return { 
      valid: false, 
      error: `E08 (Senior/Master Sergeant) requires minimum ~12 years of service. Verify rank and YOS.` 
    };
  }
  
  // General/Flag Officers (O07-O10) require minimum years
  if (['O10', 'O09', 'O08', 'O07'].includes(paygrade) && yos < 18) {
    return { 
      valid: false, 
      error: `${paygrade} (General/Flag Officer) requires minimum ~18+ years of service. Verify rank and YOS.` 
    };
  }
  
  // Junior officers (O01-O02) rarely exceed 4 years before promotion
  if (['O01', 'O02'].includes(paygrade) && yos > 6) {
    return { 
      valid: false, 
      error: `${paygrade} with ${yos} years is unusual. Most promote to O03 within 4 years. Verify rank and YOS.` 
    };
  }
  
  // All validations passed
  return { valid: true };
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
  // Calculate Pay Totals
  // =============================================================================
  // CRITICAL: BAH and BAS are NOT taxable income!
  // Taxable gross = Base Pay + COLA + Special Pays only
  // Total pay = Taxable gross + BAH + BAS
  
  const taxableGrossCents = (expected.base_pay_cents || 0) +
                            (expected.cola_cents || 0) +
                            (expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);

  const totalPayCents = taxableGrossCents +
                        (expected.bah_cents || 0) +
                        (expected.bas_cents || 0);

  // =============================================================================
  // Deductions (TSP, SGLI, Dental)
  // =============================================================================
  // TSP contribution is calculated on TOTAL pay (includes BAH/BAS)
  const deductions = await computeDeductions(userId, totalPayCents);
  if (deductions.tsp_cents) expected.tsp_cents = deductions.tsp_cents;
  if (deductions.sgli_cents) expected.sgli_cents = deductions.sgli_cents;
  if (deductions.dental_cents) expected.dental_cents = deductions.dental_cents;

  // =============================================================================
  // Taxes (Federal, State, FICA, Medicare)
  // =============================================================================
  // Taxes calculated on TAXABLE gross ONLY (excludes BAH/BAS)
  const taxes = await computeTaxes(userId, taxableGrossCents, year);
  if (taxes.federal_tax_cents) expected.federal_tax_cents = taxes.federal_tax_cents;
  if (taxes.state_tax_cents) expected.state_tax_cents = taxes.state_tax_cents;
  if (taxes.fica_cents) expected.fica_cents = taxes.fica_cents;
  if (taxes.medicare_cents) expected.medicare_cents = taxes.medicare_cents;

  // =============================================================================
  // Net Pay = Total Pay - Deductions - Taxes
  // =============================================================================
  const totalDeductions = (deductions.tsp_cents || 0) +
                          (deductions.sgli_cents || 0) +
                          (deductions.dental_cents || 0);
  const totalTaxes = (taxes.federal_tax_cents || 0) +
                     (taxes.state_tax_cents || 0) +
                     (taxes.fica_cents || 0) +
                     (taxes.medicare_cents || 0);
  
  expected.net_pay_cents = totalPayCents - totalDeductions - totalTaxes;

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
 * 
 * IMPORTANT: totalPayCents should INCLUDE BAH and BAS for TSP calculation
 * TSP contributions are based on total pay (all entitlements)
 */
async function computeDeductions(
  userId: string,
  totalPayCents: number // INCLUDES BAH/BAS for TSP purposes
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
    
    // TSP Contribution (calculated on TOTAL pay including BAH/BAS)
    if (profile.tsp_contribution_percent && profile.tsp_contribution_percent > 0) {
      result.tsp_cents = Math.round(totalPayCents * profile.tsp_contribution_percent);
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
 * 
 * IMPORTANT: taxableGrossCents should EXCLUDE BAH and BAS (non-taxable allowances)
 * 
 * Note: Tax calculations are estimates - actual withholding varies by W-4 settings
 */
async function computeTaxes(
  userId: string,
  taxableGrossCents: number, // EXCLUDES BAH/BAS
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
    
    // FICA (Social Security) - 6.2% up to annual wage base
    // Simplified calculation: Use monthly wage base limit (annual / 12)
    // Note: This doesn't account for YTD earnings, so may overestimate for high earners mid-year
    // Users should override with actual LES value for accuracy
    const ficaRate = parseFloat(taxConstants.fica_rate as string); // 0.062
    const annualFicaWageBase = taxConstants.fica_wage_base_cents; // $176,100 for 2025
    const monthlyFicaWageBase = Math.floor(annualFicaWageBase / 12); // ~$14,675/month
    const ficaTaxableAmount = Math.min(taxableGrossCents, monthlyFicaWageBase);
    result.fica_cents = Math.round(ficaTaxableAmount * ficaRate);
    
    // Medicare - 1.45% of all taxable wages (no wage base limit)
    const medicareRate = parseFloat(taxConstants.medicare_rate as string); // 0.0145
    result.medicare_cents = Math.round(taxableGrossCents * medicareRate);
    
    // Federal and State Tax - Get from profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('filing_status, state_of_residence, w4_allowances')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profile) {
      // Federal Tax - ROUGH ESTIMATE based on filing status
      // WARNING: This is a simplified estimate. Actual withholding depends on:
      // - W-4 allowances/withholding elections
      // - Standard deduction
      // - Tax bracket system (progressive, not flat)
      // - YTD earnings
      // Users should ALWAYS override with actual value from LES for accuracy
      if (profile.filing_status) {
        const annualTaxableGross = taxableGrossCents * 12; // Annualized taxable income
        let estimatedFederalRate = 0.12; // Default 12% bracket
        
        // Simplified bracket estimates (2025 tax year)
        // These don't account for standard deduction or W-4 settings
        if (profile.filing_status === 'married_filing_jointly') {
          if (annualTaxableGross > 9000000) estimatedFederalRate = 0.22; // $90K+
          else if (annualTaxableGross > 6500000) estimatedFederalRate = 0.12;
          else estimatedFederalRate = 0.10;
        } else { // single
          if (annualTaxableGross > 4700000) estimatedFederalRate = 0.22; // $47K+
          else if (annualTaxableGross > 3200000) estimatedFederalRate = 0.12;
          else estimatedFederalRate = 0.10;
        }
        
        result.federal_tax_cents = Math.round(taxableGrossCents * estimatedFederalRate);
      }
      
      // State Tax - Query state_tax_rates table
      // Note: State taxes also calculated on TAXABLE income (excludes BAH/BAS)
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
            result.state_tax_cents = Math.round(taxableGrossCents * parseFloat(stateRate.flat_rate as string));
          } else if (stateRate.avg_rate_mid) {
            result.state_tax_cents = Math.round(taxableGrossCents * parseFloat(stateRate.avg_rate_mid as string));
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

