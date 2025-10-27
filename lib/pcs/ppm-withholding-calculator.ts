/**
 * PPM WITHHOLDING CALCULATOR
 *
 * Estimates DFAS withholding on PPM incentive payments using IRS supplemental wage rates.
 *
 * ⚠️  IMPORTANT: This is NOT tax advice. Shows estimated withholding only.
 * Actual tax liability depends on total annual income, filing status, and deductions.
 *
 * Uses:
 * - IRS flat supplemental rate: 22% federal (public knowledge)
 * - State supplemental rates from state_tax_rates table
 * - FICA: 6.2% (up to annual cap)
 * - Medicare: 1.45% (no cap)
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export interface PPMWithholdingInput {
  gccAmount: number; // From MilMove or estimator
  incentivePercentage: number; // 100% current (or admin override)
  mode?: "official" | "estimator"; // Track source for confidence scoring
  allowedExpenses: {
    movingCosts: number; // Truck rental, equipment, supplies
    fuelReceipts: number; // Gas/diesel costs
    laborCosts: number; // Hired help, packing materials
    tollsAndFees: number; // Toll roads, parking, weigh tickets
  };
  destinationState: string; // Two-letter code (NC, CA, TX, etc.)

  // Optional: User can override default rates
  customFederalRate?: number; // Default: 22%
  customStateRate?: number; // Default: from database
  yearToDateFICA?: number; // For FICA cap calculation
}

export interface PPMWithholdingResult {
  gccAmount: number;
  incentivePercentage: number;
  source: string; // "MilMove (user-entered)" or "Estimator"
  confidence: number; // 100 for official, 50 for estimator

  grossPayout: number;
  totalAllowedExpenses: number;
  taxableAmount: number;

  estimatedWithholding: {
    federal: {
      amount: number;
      rate: number;
      basis: string;
      isCustom: boolean;
    };
    state: {
      amount: number;
      rate: number;
      stateName: string;
      basis: string;
      isCustom: boolean;
    };
    fica: {
      amount: number;
      rate: number;
      basis: string;
      cappedAtYTD: boolean;
    };
    medicare: {
      amount: number;
      rate: number;
      basis: string;
    };
  };

  totalWithholding: number;
  estimatedNetPayout: number;
  effectiveWithholdingRate: number; // % of gross withheld

  // Legal protection
  disclaimer: string;
  isEstimate: true;
  notTaxAdvice: true;
}

/**
 * Calculate estimated DFAS withholding on PPM payment
 * Uses IRS supplemental wage rates (flat 22% federal)
 */
export async function calculatePPMWithholding(
  input: PPMWithholdingInput
): Promise<PPMWithholdingResult> {
  // 1. Calculate gross PPM payout
  const grossPayout = input.gccAmount * (input.incentivePercentage / 100);

  // 2. Sum allowed operating expenses (reduce taxable amount)
  const totalExpenses =
    input.allowedExpenses.movingCosts +
    input.allowedExpenses.fuelReceipts +
    input.allowedExpenses.laborCosts +
    input.allowedExpenses.tollsAndFees;

  // 3. Calculate taxable amount (gross - allowed deductions)
  const taxableAmount = Math.max(0, grossPayout - totalExpenses);

  // 4. Federal withholding (IRS supplemental rate - flat 22%)
  const federalRate = input.customFederalRate ?? 22;
  const federalWithholding = taxableAmount * (federalRate / 100);

  // 5. State withholding (query from state_tax_rates table)
  const { stateRate, stateName } = await getStateWithholdingRate(input.destinationState);
  const actualStateRate = input.customStateRate ?? stateRate;
  const stateWithholding = taxableAmount * (actualStateRate / 100);

  // 6. FICA withholding (6.2% up to annual cap)
  const FICA_CAP_2025 = 168600; // IRS 2025 Social Security wage base
  const yearToDateFICA = input.yearToDateFICA || 0;
  const remainingFICABase = Math.max(0, FICA_CAP_2025 - yearToDateFICA);
  const ficaBase = Math.min(taxableAmount, remainingFICABase);
  const ficaWithholding = ficaBase * 0.062;
  const ficaCapped = taxableAmount > remainingFICABase;

  // 7. Medicare withholding (1.45% no cap)
  const medicareWithholding = taxableAmount * 0.0145;

  // 8. Calculate totals
  const totalWithholding =
    federalWithholding + stateWithholding + ficaWithholding + medicareWithholding;

  const estimatedNetPayout = grossPayout - totalWithholding;
  const effectiveRate = (totalWithholding / grossPayout) * 100;

  return {
    gccAmount: input.gccAmount,
    incentivePercentage: input.incentivePercentage,
    source: input.mode === "estimator" ? "Estimator (planning only)" : "MilMove (user-entered)",
    confidence: input.mode === "estimator" ? 50 : 100,
    grossPayout,
    totalAllowedExpenses: totalExpenses,
    taxableAmount,
    estimatedWithholding: {
      federal: {
        amount: federalWithholding,
        rate: federalRate,
        basis: "IRS Pub 15: Supplemental wage withholding (22% flat for payments under $1M)",
        isCustom: !!input.customFederalRate,
      },
      state: {
        amount: stateWithholding,
        rate: actualStateRate,
        stateName,
        basis: `${stateName} average rate (2025) - Verify with state tax authority`,
        isCustom: !!input.customStateRate,
      },
      fica: {
        amount: ficaWithholding,
        rate: 6.2,
        basis: "Social Security (FICA) - 6.2% of taxable wages",
        cappedAtYTD: ficaCapped,
      },
      medicare: {
        amount: medicareWithholding,
        rate: 1.45,
        basis: "Medicare - 1.45% of taxable wages",
      },
    },
    totalWithholding,
    estimatedNetPayout,
    effectiveWithholdingRate: effectiveRate,
    disclaimer:
      "WITHHOLDING ESTIMATE ONLY - This shows typical DFAS withholding using IRS standard supplemental wage rates (22% federal flat per IRS Publication 15). This is NOT your actual tax liability and NOT tax advice. Actual withholding varies based on W-4 elections. Actual tax liability depends on total annual income, filing status, and deductions. Adjust rates above if you know your specific withholding percentages. Consult a tax professional or use IRS.gov tools for personalized tax planning.",
    isEstimate: true,
    notTaxAdvice: true,
  };
}

/**
 * Get state withholding rate from database
 * Falls back to 5% if state not found
 */
async function getStateWithholdingRate(stateCode: string): Promise<{
  stateRate: number;
  stateName: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("state_tax_rates")
      .select("state_name, flat_rate, avg_rate_mid")
      .eq("state_code", stateCode.toUpperCase())
      .eq("effective_year", 2025)
      .maybeSingle();

    if (error || !data) {
      logger.warn("State tax rate not found, using 5% default", { stateCode });
      return {
        stateRate: 5.0,
        stateName: stateCode,
      };
    }

    // Use flat_rate if available (some states have flat tax)
    // Otherwise use avg_rate_mid (midpoint for progressive states)
    const rate = parseFloat(data.flat_rate || data.avg_rate_mid || "5.0");

    return {
      stateRate: rate,
      stateName: data.state_name,
    };
  } catch (error) {
    logger.error("Failed to get state tax rate:", error);
    return {
      stateRate: 5.0,
      stateName: stateCode,
    };
  }
}

/**
 * Calculate PPM from user-entered GCC (OFFICIAL PATH)
 * Most accurate method - GCC from MilMove is authoritative
 */
export interface PPMFromGCCInput {
  gccAmount: number;
  incentivePercentage: number;
  moveDate: string;
}

export interface PPMFromGCCResult {
  gccAmount: number;
  incentivePercentage: number;
  incentivePeriod: {
    startDate: string;
    endDate: string;
    description: string;
  };
  grossPayout: number;
  source: "MilMove (user-entered)";
  confidence: 100;
  citation: "JTR 054703";
}

export function calculatePPMFromGCC(input: PPMFromGCCInput): PPMFromGCCResult {
  const grossPayout = input.gccAmount * (input.incentivePercentage / 100);

  // Determine which incentive period applies
  const moveDate = new Date(input.moveDate);
  const peakStart = new Date("2025-05-15");
  const peakEnd = new Date("2025-09-30");

  let incentivePeriod;
  if (moveDate >= peakStart && moveDate <= peakEnd) {
    incentivePeriod = {
      startDate: "2025-05-15",
      endDate: "2025-09-30",
      description: "Peak Season Rate (EXPIRED - use 100% unless admin override)",
    };
  } else {
    incentivePeriod = {
      startDate: "2025-10-01",
      endDate: "2099-12-31",
      description: "Standard PPM Incentive Rate",
    };
  }

  return {
    gccAmount: input.gccAmount,
    incentivePercentage: input.incentivePercentage,
    incentivePeriod,
    grossPayout,
    source: "MilMove (user-entered)",
    confidence: 100,
    citation: "JTR 054703",
  };
}

/**
 * Estimate PPM using weight/distance (PLANNING PATH)
 * ⚠️  NOT OFFICIAL - For planning when GCC not available
 */
export interface PPMEstimatorInput {
  weight: number;
  distance: number;
  costPerPoundMile?: number; // Default: $0.50 industry average
  incentivePercentage?: number;
}

export interface PPMEstimatorResult {
  weight: number;
  distance: number;
  costPerPoundMile: number;
  estimatedGCC: number;
  incentivePercentage: number;
  estimatedPayout: number;
  varianceRange: {
    min: number; // -30%
    max: number; // +30%
  };
  confidence: 50; // Low - not official
  disclaimer: string;
  recommendedAction: string;
}

export function estimatePPMPayout(input: PPMEstimatorInput): PPMEstimatorResult {
  const costPerLbMi = input.costPerPoundMile || 0.5;
  const incentivePercent = input.incentivePercentage || 100;

  // Formula: weight (lbs) × distance (mi) × cost per lb-mi
  const estimatedGCC = input.weight * input.distance * costPerLbMi;
  const estimatedPayout = estimatedGCC * (incentivePercent / 100);

  // Show ±30% variance (real GCC varies significantly)
  const variance = estimatedPayout * 0.3;

  return {
    weight: input.weight,
    distance: input.distance,
    costPerPoundMile: costPerLbMi,
    estimatedGCC,
    incentivePercentage: incentivePercent,
    estimatedPayout,
    varianceRange: {
      min: estimatedPayout - variance,
      max: estimatedPayout + variance,
    },
    confidence: 50,
    disclaimer:
      "PLANNING ESTIMATE ONLY. Actual GCC may vary by ±30% based on route complexity, seasonal demand, and contract pricing. This is NOT your official reimbursement. Get official GCC from move.mil.",
    recommendedAction: "Visit move.mil PPM calculator for official GCC estimate",
  };
}
