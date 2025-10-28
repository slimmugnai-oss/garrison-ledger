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

import type { ExpectedSnapshot, ExpectedSpecialPay } from "@/app/types/les";
import { isOfficer, isEnlisted } from "@/app/types/les";
import { ssot } from "@/lib/ssot";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface ExpectedPayParams {
  userId: string;
  month: number; // 1-12
  year: number;
  paygrade: string; // E01-E09, O01-O10, W01-W05
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number; // Years of service
}

/**
 * Validate rank vs years of service for sanity checks
 * Prevents obviously wrong combinations (E01 with 20 YOS, O10 with 2 YOS, etc.)
 */
export function validateRankYOS(paygrade: string, yos: number): { valid: boolean; error?: string } {
  // Junior enlisted (E01-E04) rarely exceed 6 years before promotion
  if (["E01", "E02", "E03", "E04"].includes(paygrade)) {
    if (yos > 8) {
      return {
        valid: false,
        error: `${paygrade} with ${yos} years of service is highly unusual. Junior enlisted typically promote to E05 within 4-6 years. Verify rank and time in service.`,
      };
    }
  }

  // Senior enlisted (E08-E09) require minimum years
  if (paygrade === "E09" && yos < 15) {
    return {
      valid: false,
      error: `E09 (Master Chief/Sergeant Major) requires minimum ~15 years of service. Verify rank and YOS.`,
    };
  }

  if (paygrade === "E08" && yos < 12) {
    return {
      valid: false,
      error: `E08 (Senior/Master Sergeant) requires minimum ~12 years of service. Verify rank and YOS.`,
    };
  }

  // General/Flag Officers (O07-O10) require minimum years
  if (["O10", "O09", "O08", "O07"].includes(paygrade) && yos < 18) {
    return {
      valid: false,
      error: `${paygrade} (General/Flag Officer) requires minimum ~18+ years of service. Verify rank and YOS.`,
    };
  }

  // Junior officers (O01-O02) rarely exceed 4 years before promotion
  if (["O01", "O02"].includes(paygrade) && yos > 6) {
    return {
      valid: false,
      error: `${paygrade} with ${yos} years is unusual. Most promote to O03 within 4 years. Verify rank and YOS.`,
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
export async function buildExpectedSnapshot(params: ExpectedPayParams): Promise<ExpectedSnapshot> {
  const { userId, month, year, paygrade, mha_or_zip, with_dependents, yos } = params;

  // Compute last day of the month for "effective as of" date checks
  const lastDayOfMonth = new Date(year, month, 0); // month is 0-indexed in Date constructor

  const expected: ExpectedSnapshot["expected"] = {};

  // =========================================================================
  // CZTE (Combat Zone Tax Exclusion) Status
  // =========================================================================
  let czteActive = false;
  try {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("currently_deployed_czte")
      .eq("user_id", userId)
      .maybeSingle();

    czteActive = profile?.currently_deployed_czte || false;
  } catch {
    czteActive = false;
  }

  // =============================================================================
  // BAH (Basic Allowance for Housing)
  // =============================================================================
  if (mha_or_zip) {
    const bahCents = await computeBAH({
      paygrade,
      mha_or_zip,
      with_dependents,
      effectiveDate: lastDayOfMonth,
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
      effectiveDate: lastDayOfMonth,
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
  // CRITICAL TAX TREATMENT (OCONUS COLA):
  // - BAH: NOT taxable (fed/state/FICA/Medicare)
  // - BAS: NOT taxable (fed/state/FICA/Medicare)
  // - OCONUS COLA: NOT taxable for fed/state, BUT taxable for FICA/Medicare
  // - Base Pay: Fully taxable
  // - Special Pays: Varies by type (see codes.ts for each)

  // For FICA/Medicare calculations: includes OCONUS COLA
  const ficaMedicareGrossCents =
    (expected.base_pay_cents || 0) +
    (expected.cola_cents || 0) + // OCONUS COLA subject to FICA/Medicare
    (expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);

  const totalPayCents =
    ficaMedicareGrossCents + (expected.bah_cents || 0) + (expected.bas_cents || 0);

  // =============================================================================
  // Deductions (TSP, SGLI, Dental)
  // =============================================================================
  // TSP contribution is calculated on BASIC PAY ONLY (not BAH/BAS)
  // User can override if they elected contributions from other pay sources
  const deductions = await computeDeductions(userId, expected.base_pay_cents || 0);
  if (deductions.tsp_cents) expected.tsp_cents = deductions.tsp_cents;
  if (deductions.sgli_cents) expected.sgli_cents = deductions.sgli_cents;
  if (deductions.dental_cents) expected.dental_cents = deductions.dental_cents;

  // =============================================================================
  // Tax Percentage Validation (Simplified Approach)
  // =============================================================================
  // We NO LONGER auto-fill tax amounts - users enter actual values from LES
  // Instead, we provide expected percentages for validation:
  // - FICA should be 6.2% of FICA/Medicare gross (Base + OCONUS COLA + taxable specials)
  // - Medicare should be 1.45% of FICA/Medicare gross
  // - Federal/State tax user enters manually (too complex to estimate accurately)

  // Store expected tax PERCENTAGES for validation (not amounts)
  // IMPORTANT: Use ficaMedicareGrossCents which INCLUDES OCONUS COLA
  expected.fica_cents = Math.round(ficaMedicareGrossCents * 0.062); // 6.2% for reference
  expected.medicare_cents = Math.round(ficaMedicareGrossCents * 0.0145); // 1.45% for reference

  // Federal and state tax are NOT auto-calculated
  // Users enter actual values from their LES
  // We just validate the overall net pay math is correct

  // Note: We don't calculate expected net_pay_cents here because we don't have
  // actual federal/state tax values yet (users will enter those manually).
  // Net pay validation happens during comparison when we have all actual values.

  return {
    user_id: userId,
    month,
    year,
    paygrade,
    mha_or_zip,
    with_dependents,
    yos,
    expected,
    czteActive, // Combat Zone Tax Exclusion status
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
      .from("bah_rates")
      .select("rate_cents")
      .eq("paygrade", paygrade)
      .eq("mha", mha_or_zip.toUpperCase())
      .eq("with_dependents", with_dependents)
      .lte("effective_date", effectiveDate.toISOString().split("T")[0])
      .order("effective_date", { ascending: false })
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
      .from("conus_cola_rates")
      .select("monthly_amount_cents")
      .eq("mha", mha_or_zip.toUpperCase())
      .eq("paygrade", paygrade)
      .eq("with_dependents", with_dependents)
      .lte("effective_date", effectiveDate.toISOString().split("T")[0])
      .order("effective_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Table might not exist yet - that's OK, just omit COLA
      if (error.code === "42P01") {
        // Table doesn't exist
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
 * Compute special pays from user profile - HYBRID V1 IMPLEMENTATION
 * Returns array of special pays or empty array
 *
 * HYBRID MERGE LOGIC:
 * 1. Read from user_profiles (4 legacy special pays: SDAP, HFP_IDP, FSA, FLPP)
 * 2. Read from user_special_pay_assignments (6 new catalog-based pays: SEA, FLIGHT, SUB, DIVE, JUMP, HDP)
 * 3. Merge by code (assignments take precedence over profile fields)
 * 4. For flat_monthly with no amount, use default_amount_cents from catalog
 * 5. Skip rate_table pays in v1 (deferred to v2)
 */
async function computeSpecialPays(
  userId: string,
  year: number,
  month: number
): Promise<ExpectedSpecialPay[]> {
  try {
    const specialsMap = new Map<string, number>();

    // =========================================================================
    // STEP 1: Read from user_profiles (4 legacy special pays)
    // =========================================================================
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select(
        "receives_sdap, sdap_monthly_cents, receives_hfp_idp, hfp_idp_monthly_cents, receives_fsa, fsa_monthly_cents, receives_flpp, flpp_monthly_cents"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      // SDAP - Special Duty Assignment Pay
      if (profile.receives_sdap && profile.sdap_monthly_cents) {
        specialsMap.set("SDAP", profile.sdap_monthly_cents);
      }

      // HFP/IDP - Hostile Fire Pay / Imminent Danger Pay
      if (profile.receives_hfp_idp && profile.hfp_idp_monthly_cents) {
        specialsMap.set("IDP", profile.hfp_idp_monthly_cents);
      }

      // FSA - Family Separation Allowance
      if (profile.receives_fsa && profile.fsa_monthly_cents) {
        specialsMap.set("FSA", profile.fsa_monthly_cents);
      }

      // FLPP - Foreign Language Proficiency Pay
      if (profile.receives_flpp && profile.flpp_monthly_cents) {
        specialsMap.set("FLPP", profile.flpp_monthly_cents);
      }
    }

    // =========================================================================
    // STEP 2: Read from user_special_pay_assignments (catalog-based pays)
    // =========================================================================
    // Compute audit period boundaries
    const auditDate = new Date(year, month - 1, 15); // Mid-month of audit period
    const auditDateStr = auditDate.toISOString().split("T")[0];

    const { data: assignments } = await supabaseAdmin
      .from("user_special_pay_assignments")
      .select("code, amount_override_cents")
      .eq("user_id", userId)
      .lte("start_date", auditDateStr)
      .or(`end_date.is.null,end_date.gte.${auditDateStr}`);

    // =========================================================================
    // STEP 3: Load catalog defaults for assignments without override amounts
    // =========================================================================
    if (assignments && assignments.length > 0) {
      const assignmentCodes = assignments.map((a) => a.code);

      const { data: catalogEntries } = await supabaseAdmin
        .from("special_pay_catalog")
        .select("code, calc_method, default_amount_cents")
        .in("code", assignmentCodes);

      const catalogMap = new Map(catalogEntries?.map((c) => [c.code, c]) || []);

      // =========================================================================
      // STEP 4: Merge assignments (takes precedence over profile fields)
      // =========================================================================
      for (const assignment of assignments) {
        const catalogEntry = catalogMap.get(assignment.code);

        // Skip rate_table pays in v1 (SEA, FLIGHT, SUB, DIVE, JUMP)
        if (catalogEntry?.calc_method === "rate_table") {
          continue;
        }

        // Use amount_override_cents if present, otherwise use catalog default
        const amountCents = assignment.amount_override_cents || catalogEntry?.default_amount_cents;

        if (amountCents) {
          specialsMap.set(assignment.code, amountCents);
        }
      }
    }

    // =========================================================================
    // STEP 5: Convert map to array
    // =========================================================================
    return Array.from(specialsMap.entries()).map(([code, cents]) => ({
      code,
      cents,
    }));
  } catch (error) {
    // Log error but don't fail the audit
    console.error("[computeSpecialPays] Error:", error);
    return [];
  }
}

/**
 * Compute base pay from military_pay_tables
 * Returns cents or null if not found
 */
async function computeBasePay(paygrade: string, yos: number): Promise<number | null> {
  try {
    // Query military_pay_tables for base pay
    // Find the row for this paygrade where yos matches or is the highest yos <= user's yos
    const { data, error } = await supabaseAdmin
      .from("military_pay_tables")
      .select("monthly_rate_cents")
      .eq("paygrade", paygrade)
      .lte("years_of_service", yos)
      .order("years_of_service", { ascending: false })
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
 * TSP PREFILL ASSUMES % OF BASIC PAY ONLY
 * User can override if they elected contributions from special pays, incentive pays, or other sources.
 *
 * @param userId - User ID to fetch profile
 * @param basePayCents - BASIC PAY amount in cents (excludes BAH/BAS/special pays)
 */
async function computeDeductions(
  userId: string,
  basePayCents: number // BASIC PAY ONLY (not BAH/BAS)
): Promise<{
  tsp_cents?: number;
  sgli_cents?: number;
  dental_cents?: number;
}> {
  const result: { tsp_cents?: number; sgli_cents?: number; dental_cents?: number } = {};

  try {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("tsp_contribution_percent, sgli_coverage_amount, has_dental_insurance")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) return result;

    // TSP Contribution (calculated on BASIC PAY ONLY)
    // User can override in UI if they elected contributions from other pay sources
    if (profile.tsp_contribution_percent && profile.tsp_contribution_percent > 0) {
      result.tsp_cents = Math.round(basePayCents * profile.tsp_contribution_percent);
    }

    // SGLI Premium (query from sgli_rates table)
    if (profile.sgli_coverage_amount && profile.sgli_coverage_amount > 0) {
      const { data: sgliRate } = await supabaseAdmin
        .from("sgli_rates")
        .select("monthly_premium_cents")
        .eq("coverage_amount", profile.sgli_coverage_amount)
        .maybeSingle();

      if (sgliRate) {
        result.sgli_cents = sgliRate.monthly_premium_cents;
      }
    }

    // Dental Insurance - REMOVED AUTO-FILL
    // Dental premiums vary too much by plan type and family size
    // Users should enter actual premium from their LES
    // We don't auto-fill this anymore

    return result;
  } catch {
    return result;
  }
}

/**
 * Calculate expected FICA and Medicare percentages for validation
 *
 * SIMPLIFIED APPROACH: We don't auto-fill tax amounts anymore.
 * Users enter actual tax values from their LES.
 * We just validate the PERCENTAGES are correct.
 *
 * @param taxableGrossCents - Taxable gross (excludes BAH/BAS)
 * @returns Expected FICA and Medicare amounts for percentage validation
 */
export function calculateExpectedTaxPercentages(taxableGrossCents: number): {
  fica_cents: number; // 6.2% of taxable gross
  medicare_cents: number; // 1.45% of taxable gross
} {
  return {
    fica_cents: Math.round(taxableGrossCents * 0.062), // 6.2% FICA
    medicare_cents: Math.round(taxableGrossCents * 0.0145), // 1.45% Medicare
  };
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
  return date.toISOString().split("T")[0];
}

/**
 * BUILD EXPECTED PAY SNAPSHOT WITH TAXABLE BASES
 * Wrapper around buildExpectedSnapshot that also computes taxable income bases
 *
 * @param profile - User profile snapshot
 * @param asOfDate - Date for which to compute (defaults to current month)
 * @returns Expected values and taxable bases
 */
export async function buildExpectedSnapshotWithBases(
  profile: {
    userId: string;
    paygrade: string;
    yos: number;
    mhaOrZip: string;
    withDependents: boolean;
    specials?: {
      sdap?: boolean;
      hfp?: boolean;
      fsa?: boolean;
      flpp?: boolean;
    };
  },
  asOfDate?: Date
): Promise<{
  expected: {
    base_pay_cents: number;
    bah_cents: number;
    bas_cents: number;
    cola_cents: number;
    specials: ExpectedSpecialPay[];
  };
  taxable_bases: {
    fed: number;
    state: number;
    oasdi: number;
    medicare: number;
  };
}> {
  const date = asOfDate || new Date();
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  // Build expected values using existing function
  const snapshot = await buildExpectedSnapshot({
    userId: profile.userId,
    month,
    year,
    paygrade: profile.paygrade,
    mha_or_zip: profile.mhaOrZip,
    with_dependents: profile.withDependents,
    yos: profile.yos,
  });

  // Import codes module for taxable base computation
  const { computeTaxableBases } = await import("./codes");

  // Build line items for taxable base calculation
  const lines = [
    { code: "BASEPAY", amount_cents: snapshot.expected.base_pay_cents || 0 },
    { code: "BAH", amount_cents: snapshot.expected.bah_cents || 0 },
    { code: "BAS", amount_cents: snapshot.expected.bas_cents || 0 },
    { code: "COLA", amount_cents: snapshot.expected.cola_cents || 0 },
    ...(snapshot.expected.specials || []).map((s) => ({
      code: s.code,
      amount_cents: s.cents,
    })),
  ];

  // Compute taxable bases using codes.ts logic
  const taxable_bases = computeTaxableBases(lines);

  return {
    expected: {
      base_pay_cents: snapshot.expected.base_pay_cents || 0,
      bah_cents: snapshot.expected.bah_cents || 0,
      bas_cents: snapshot.expected.bas_cents || 0,
      cola_cents: snapshot.expected.cola_cents || 0,
      specials: snapshot.expected.specials || [],
    },
    taxable_bases,
  };
}
