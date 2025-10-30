/**
 * TAX ESTIMATOR
 * 
 * Estimates federal and state income tax withholding
 * Based on IRS Publication 15-T (2025) and state tax tables
 */

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TaxEstimateParams {
  taxableIncomeCents: number; // Monthly taxable income
  filingStatus?: string | null; // "single", "married", "head_of_household"
  w4Allowances?: number | null; // 0-10
  stateOfResidence?: string | null; // 2-letter state code
  czteActive?: boolean; // Combat Zone Tax Exclusion
}

interface TaxEstimate {
  federalTaxCents: number;
  stateTaxCents: number;
  method: "estimated" | "zero_czte" | "fallback";
  confidence: "high" | "medium" | "low";
}

/**
 * Estimate federal income tax withholding
 * Uses simplified IRS withholding tables (2025)
 */
function estimateFederalTax(
  monthlyTaxableCents: number,
  filingStatus: string = "single",
  w4Allowances: number = 0,
  czteActive: boolean = false
): { amountCents: number; confidence: "high" | "medium" | "low" } {
  // CZTE: Zero federal tax
  if (czteActive) {
    return { amountCents: 0, confidence: "high" };
  }

  const annualTaxable = monthlyTaxableCents * 12;

  // 2025 IRS Standard Deduction (approximate)
  const standardDeduction: Record<string, number> = {
    single: 1465000, // $14,650
    married: 2930000, // $29,300
    head_of_household: 2190000, // $21,900
  };

  const deduction = standardDeduction[filingStatus] || standardDeduction.single;
  const taxableIncome = Math.max(0, annualTaxable - deduction);

  // 2025 Tax Brackets (simplified - single filer)
  let annualTax = 0;

  if (filingStatus === "single") {
    // 10% up to $11,600
    // 12% from $11,601 to $47,150
    // 22% from $47,151 to $100,525
    // 24% from $100,526 to $191,950
    
    if (taxableIncome <= 1160000) {
      annualTax = taxableIncome * 0.10;
    } else if (taxableIncome <= 4715000) {
      annualTax = 116000 + (taxableIncome - 1160000) * 0.12;
    } else if (taxableIncome <= 10052500) {
      annualTax = 116000 + 426600 + (taxableIncome - 4715000) * 0.22;
    } else if (taxableIncome <= 19195000) {
      annualTax = 116000 + 426600 + 1174250 + (taxableIncome - 10052500) * 0.24;
    } else {
      annualTax = 116000 + 426600 + 1174250 + 2194200 + (taxableIncome - 19195000) * 0.32;
    }
  } else if (filingStatus === "married") {
    // Married filing jointly brackets (2025)
    if (taxableIncome <= 2320000) {
      annualTax = taxableIncome * 0.10;
    } else if (taxableIncome <= 9430000) {
      annualTax = 232000 + (taxableIncome - 2320000) * 0.12;
    } else if (taxableIncome <= 20105000) {
      annualTax = 232000 + 853200 + (taxableIncome - 9430000) * 0.22;
    } else {
      annualTax = 232000 + 853200 + 2348500 + (taxableIncome - 20105000) * 0.24;
    }
  } else {
    // Head of household (similar to single but different brackets)
    if (taxableIncome <= 1660000) {
      annualTax = taxableIncome * 0.10;
    } else if (taxableIncome <= 6370000) {
      annualTax = 166000 + (taxableIncome - 1660000) * 0.12;
    } else {
      annualTax = 166000 + 565200 + (taxableIncome - 6370000) * 0.22;
    }
  }

  // Apply W-4 allowances reduction (each allowance reduces withholding)
  // Rough estimate: Each allowance reduces annual withholding by ~$4,800
  const allowanceReduction = w4Allowances * 480000;
  annualTax = Math.max(0, annualTax - allowanceReduction);

  const monthlyTax = Math.round(annualTax / 12);

  // Confidence based on assumptions
  const confidence = w4Allowances === 0 && (filingStatus === "single" || filingStatus === "married")
    ? "high"
    : w4Allowances <= 2
      ? "medium"
      : "low";

  return { amountCents: monthlyTax, confidence };
}

/**
 * Estimate state income tax withholding
 */
async function estimateStateTax(
  monthlyTaxableCents: number,
  stateCode: string | null
): Promise<{ amountCents: number; confidence: "high" | "medium" | "low" }> {
  if (!stateCode) {
    return { amountCents: 0, confidence: "low" };
  }

  const stateUpper = stateCode.toUpperCase();

  // No-tax states
  const noTaxStates = ["AK", "FL", "NV", "SD", "TN", "TX", "WA", "WY", "NH"];
  if (noTaxStates.includes(stateUpper)) {
    return { amountCents: 0, confidence: "high" };
  }

  // Fetch state tax rate from database
  try {
    const { data: stateRate } = await supabaseAdmin
      .from("state_tax_rates")
      .select("rate_percent, has_brackets")
      .eq("state_code", stateUpper)
      .eq("effective_year", 2025)
      .maybeSingle();

    if (stateRate) {
      const annualTaxable = monthlyTaxableCents * 12;
      
      if (stateRate.has_brackets) {
        // Complex bracket system - use conservative mid-range estimate
        const estimatedRate = stateRate.rate_percent || 5.0; // Use flat rate as fallback
        const annualTax = Math.round(annualTaxable * (estimatedRate / 100));
        const monthlyTax = Math.round(annualTax / 12);
        return { amountCents: monthlyTax, confidence: "medium" };
      } else {
        // Flat rate state
        const annualTax = Math.round(annualTaxable * (stateRate.rate_percent / 100));
        const monthlyTax = Math.round(annualTax / 12);
        return { amountCents: monthlyTax, confidence: "high" };
      }
    }
  } catch (error) {
    console.error("Error fetching state tax rate:", error);
  }

  // Fallback: Use conservative 5% estimate
  const annualTax = Math.round(monthlyTaxableCents * 12 * 0.05);
  const monthlyTax = Math.round(annualTax / 12);
  return { amountCents: monthlyTax, confidence: "low" };
}

/**
 * Main tax estimation function
 */
export async function estimateTaxWithholding(
  params: TaxEstimateParams
): Promise<TaxEstimate> {
  const {
    taxableIncomeCents,
    filingStatus,
    w4Allowances,
    stateOfResidence,
    czteActive = false,
  } = params;

  // Federal tax
  const federal = estimateFederalTax(
    taxableIncomeCents,
    filingStatus || "single",
    w4Allowances || 0,
    czteActive
  );

  // State tax
  const state = await estimateStateTax(taxableIncomeCents, stateOfResidence || null);

  // Overall confidence
  const confidence =
    federal.confidence === "high" && state.confidence === "high"
      ? "high"
      : federal.confidence === "low" || state.confidence === "low"
        ? "low"
        : "medium";

  return {
    federalTaxCents: federal.amountCents,
    stateTaxCents: state.amountCents,
    method: czteActive ? "zero_czte" : "estimated",
    confidence,
  };
}

