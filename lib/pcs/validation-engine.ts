/**
 * JTR VALIDATION ENGINE
 *
 * Comprehensive validation system using real JTR rules from database.
 * Validates PCS claims against official Joint Travel Regulations.
 */

import { logger } from "@/lib/logger";

// Use admin client for server-side operations, null for client-side
function getSupabaseClient() {
  // Only use supabaseAdmin on server-side
  if (typeof window === "undefined") {
    // Dynamic import to avoid client-side bundling
    return require("@/lib/supabase/admin").supabaseAdmin;
  }
  // Client-side: return null to avoid errors
  return null;
}

export interface JTRRule {
  id: string;
  rule_code: string;
  rule_title: string;
  category: string;
  description: string;
  eligibility_criteria: any;
  calculation_formula: string;
  rate_table: any;
  branch_specific: any;
  common_mistakes: string[];
  citations: string[];
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  rule_code: string;
  rule_title: string;
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  citation: string;
  passed: boolean;
  details?: any;
}

export interface ValidationSummary {
  total_rules: number;
  passed: number;
  warnings: number;
  errors: number;
  overall_score: number;
  results: ValidationResult[];
}

/**
 * Load all JTR rules from database
 */
export async function loadJTRRules(): Promise<JTRRule[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.info("JTR rules requested on client-side, returning empty array");
      return [];
    }

    const { data, error } = await supabase
      .from("jtr_rules")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      logger.error("Failed to load JTR rules:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error("Failed to load JTR rules:", error);
    return [];
  }
}

/**
 * Validate DLA (Dislocation Allowance) claim
 */
export async function validateDLA(
  rank: string,
  hasDependents: boolean,
  amount: number,
  rules: JTRRule[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const dlaRule = rules.find((r) => r.category === "DLA");

  if (!dlaRule) {
    results.push({
      rule_code: "DLA-001",
      rule_title: "DLA Rule Missing",
      category: "DLA",
      severity: "error",
      message: "DLA validation rule not found in database",
      citation: "JTR 050302.B",
      passed: false,
    });
    return results;
  }

  // Validate rank format
  if (!rank || rank.length < 2) {
    results.push({
      rule_code: dlaRule.rule_code,
      rule_title: dlaRule.rule_title,
      category: "DLA",
      severity: "error",
      message: "Invalid rank format. Must be valid military rank (e.g., E-5, O-3)",
      suggestion: "Enter rank in format: E-1 through E-9, O-1 through O-10, W-1 through W-5",
      citation: dlaRule.citations[0] || "JTR 050302.B",
      passed: false,
    });
  }

  // Validate amount is positive
  if (amount <= 0) {
    results.push({
      rule_code: dlaRule.rule_code,
      rule_title: dlaRule.rule_title,
      category: "DLA",
      severity: "error",
      message: "DLA amount must be greater than zero",
      suggestion: "DLA is a one-time allowance based on rank and dependency status",
      citation: dlaRule.citations[0] || "JTR 050302.B",
      passed: false,
    });
  }

  // Check for common mistakes
  if (dlaRule.common_mistakes) {
    dlaRule.common_mistakes.forEach((mistake, index) => {
      results.push({
        rule_code: dlaRule.rule_code,
        rule_title: dlaRule.rule_title,
        category: "DLA",
        severity: "info",
        message: `Common mistake to avoid: ${mistake}`,
        citation: dlaRule.citations[0] || "JTR 050302.B",
        passed: true,
      });
    });
  }

  // If all validations pass, add success result
  if (results.length === 0 || results.every((r) => r.passed)) {
    results.push({
      rule_code: dlaRule.rule_code,
      rule_title: dlaRule.rule_title,
      category: "DLA",
      severity: "info",
      message: "DLA claim appears to be valid",
      citation: dlaRule.citations[0] || "JTR 050302.B",
      passed: true,
    });
  }

  return results;
}

/**
 * Validate MALT (Mileage Allowance in Lieu of Transportation)
 */
export async function validateMALT(
  distance: number,
  rate: number,
  totalAmount: number,
  rules: JTRRule[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const maltRule = rules.find((r) => r.category === "MALT");

  if (!maltRule) {
    results.push({
      rule_code: "MALT-001",
      rule_title: "MALT Rule Missing",
      category: "MALT",
      severity: "error",
      message: "MALT validation rule not found in database",
      citation: "JTR 054206",
      passed: false,
    });
    return results;
  }

  // Validate distance
  if (distance <= 0) {
    results.push({
      rule_code: maltRule.rule_code,
      rule_title: maltRule.rule_title,
      category: "MALT",
      severity: "error",
      message: "MALT distance must be greater than zero",
      suggestion: "Enter the actual miles driven for your PCS move",
      citation: maltRule.citations[0] || "JTR 054206",
      passed: false,
    });
  }

  // Validate rate is reasonable (current IRS rate is around $0.67/mile)
  if (rate < 0.5 || rate > 1.0) {
    results.push({
      rule_code: maltRule.rule_code,
      rule_title: maltRule.rule_title,
      category: "MALT",
      severity: "warning",
      message: `MALT rate ($${rate.toFixed(2)}/mile) seems unusual`,
      suggestion:
        "Current IRS standard mileage rate is approximately $0.67/mile. Verify with finance office.",
      citation: maltRule.citations[0] || "JTR 054206",
      passed: true,
    });
  }

  // Validate calculation
  const expectedAmount = distance * rate;
  const difference = Math.abs(totalAmount - expectedAmount);
  if (difference > 1.0) {
    // Allow $1 tolerance for rounding
    results.push({
      rule_code: maltRule.rule_code,
      rule_title: maltRule.rule_title,
      category: "MALT",
      severity: "warning",
      message: `MALT calculation may be incorrect. Expected: $${expectedAmount.toFixed(2)}, Entered: $${totalAmount.toFixed(2)}`,
      suggestion: `Recalculate: ${distance} miles × $${rate.toFixed(2)}/mile = $${expectedAmount.toFixed(2)}`,
      citation: maltRule.citations[0] || "JTR 054206",
      passed: true,
    });
  }

  // Check for common mistakes
  if (maltRule.common_mistakes) {
    maltRule.common_mistakes.forEach((mistake, index) => {
      results.push({
        rule_code: maltRule.rule_code,
        rule_title: maltRule.rule_title,
        category: "MALT",
        severity: "info",
        message: `Common mistake to avoid: ${mistake}`,
        citation: maltRule.citations[0] || "JTR 054206",
        passed: true,
      });
    });
  }

  return results;
}

/**
 * Validate TLE (Temporary Lodging Expense)
 */
export async function validateTLE(
  originNights: number,
  destinationNights: number,
  originRate: number,
  destinationRate: number,
  rules: JTRRule[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const tleRule = rules.find((r) => r.category === "TLE");

  if (!tleRule) {
    results.push({
      rule_code: "TLE-001",
      rule_title: "TLE Rule Missing",
      category: "TLE",
      severity: "error",
      message: "TLE validation rule not found in database",
      citation: "JTR 054205",
      passed: false,
    });
    return results;
  }

  // Validate night limits (max 10 per location)
  if (originNights > 10) {
    results.push({
      rule_code: tleRule.rule_code,
      rule_title: tleRule.rule_title,
      category: "TLE",
      severity: "error",
      message: `Origin TLE nights (${originNights}) exceeds 10-day limit`,
      suggestion: "TLE is limited to 10 days per location (origin and destination)",
      citation: tleRule.citations[0] || "JTR 054205",
      passed: false,
    });
  }

  if (destinationNights > 10) {
    results.push({
      rule_code: tleRule.rule_code,
      rule_title: tleRule.rule_title,
      category: "TLE",
      severity: "error",
      message: `Destination TLE nights (${destinationNights}) exceeds 10-day limit`,
      suggestion: "TLE is limited to 10 days per location (origin and destination)",
      citation: tleRule.citations[0] || "JTR 054205",
      passed: false,
    });
  }

  // Validate rates are reasonable
  if (originRate > 200 || destinationRate > 200) {
    results.push({
      rule_code: tleRule.rule_code,
      rule_title: tleRule.rule_title,
      category: "TLE",
      severity: "warning",
      message: `TLE rate ($${Math.max(originRate, destinationRate)}) seems high`,
      suggestion:
        "TLE rates should be based on locality per diem rates. Verify with finance office.",
      citation: tleRule.citations[0] || "JTR 054205",
      passed: true,
    });
  }

  return results;
}

/**
 * Validate Per Diem claims
 */
export async function validatePerDiem(
  days: number,
  rate: number,
  totalAmount: number,
  rules: JTRRule[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const perDiemRule = rules.find((r) => r.category === "per_diem");

  if (!perDiemRule) {
    results.push({
      rule_code: "PERDIEM-001",
      rule_title: "Per Diem Rule Missing",
      category: "per_diem",
      severity: "error",
      message: "Per diem validation rule not found in database",
      citation: "JTR 054401",
      passed: false,
    });
    return results;
  }

  // Validate days
  if (days <= 0) {
    results.push({
      rule_code: perDiemRule.rule_code,
      rule_title: perDiemRule.rule_title,
      category: "per_diem",
      severity: "error",
      message: "Per diem days must be greater than zero",
      suggestion: "Enter the number of travel days for your PCS move",
      citation: perDiemRule.citations[0] || "JTR 054401",
      passed: false,
    });
  }

  // Validate rate is reasonable
  if (rate < 20 || rate > 200) {
    results.push({
      rule_code: perDiemRule.rule_code,
      rule_title: perDiemRule.rule_title,
      category: "per_diem",
      severity: "warning",
      message: `Per diem rate ($${rate.toFixed(2)}) seems unusual`,
      suggestion: "Per diem rates vary by locality. Verify with DTMO calculator.",
      citation: perDiemRule.citations[0] || "JTR 054401",
      passed: true,
    });
  }

  return results;
}

/**
 * Validate PPM (Personally Procured Move)
 */
export async function validatePPM(
  weight: number,
  distance: number,
  estimatedAmount: number,
  rules: JTRRule[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const ppmRule = rules.find((r) => r.category === "PPM");

  if (!ppmRule) {
    results.push({
      rule_code: "PPM-001",
      rule_title: "PPM Rule Missing",
      category: "PPM",
      severity: "error",
      message: "PPM validation rule not found in database",
      citation: "JTR 054703",
      passed: false,
    });
    return results;
  }

  // Validate weight
  if (weight <= 0) {
    results.push({
      rule_code: ppmRule.rule_code,
      rule_title: ppmRule.rule_title,
      category: "PPM",
      severity: "error",
      message: "PPM weight must be greater than zero",
      suggestion: "Enter the actual weight of your household goods",
      citation: ppmRule.citations[0] || "JTR 054703",
      passed: false,
    });
  }

  // Validate distance
  if (distance <= 0) {
    results.push({
      rule_code: ppmRule.rule_code,
      rule_title: ppmRule.rule_title,
      category: "PPM",
      severity: "error",
      message: "PPM distance must be greater than zero",
      suggestion: "Enter the distance of your PCS move",
      citation: ppmRule.citations[0] || "JTR 054703",
      passed: false,
    });
  }

  // Check for common mistakes
  if (ppmRule.common_mistakes) {
    ppmRule.common_mistakes.forEach((mistake, index) => {
      results.push({
        rule_code: ppmRule.rule_code,
        rule_title: ppmRule.rule_title,
        category: "PPM",
        severity: "info",
        message: `Common mistake to avoid: ${mistake}`,
        citation: ppmRule.citations[0] || "JTR 054703",
        passed: true,
      });
    });
  }

  return results;
}

/**
 * Main validation function - validates entire PCS claim
 */
export async function validatePCSClaim(claimData: any): Promise<ValidationSummary> {
  try {
    // Load JTR rules
    const rules = await loadJTRRules();

    if (rules.length === 0) {
      return {
        total_rules: 0,
        passed: 0,
        warnings: 0,
        errors: 1,
        overall_score: 0,
        results: [
          {
            rule_code: "SYSTEM-001",
            rule_title: "System Error",
            category: "system",
            severity: "error",
            message: "Unable to load JTR validation rules",
            citation: "System",
            passed: false,
          },
        ],
      };
    }

    const allResults: ValidationResult[] = [];

    // Validate DLA
    if (claimData.dla) {
      const dlaResults = await validateDLA(
        claimData.rank,
        claimData.hasDependents,
        claimData.dla.amount,
        rules
      );
      allResults.push(...dlaResults);
    }

    // Validate MALT
    if (claimData.malt) {
      const maltResults = await validateMALT(
        claimData.malt.distance,
        claimData.malt.rate,
        claimData.malt.amount,
        rules
      );
      allResults.push(...maltResults);
    }

    // Validate TLE
    if (claimData.tle) {
      const tleResults = await validateTLE(
        claimData.tle.originNights,
        claimData.tle.destinationNights,
        claimData.tle.originRate,
        claimData.tle.destinationRate,
        rules
      );
      allResults.push(...tleResults);
    }

    // Validate Per Diem
    if (claimData.perDiem) {
      const perDiemResults = await validatePerDiem(
        claimData.perDiem.days,
        claimData.perDiem.rate,
        claimData.perDiem.amount,
        rules
      );
      allResults.push(...perDiemResults);
    }

    // Validate PPM
    if (claimData.ppm) {
      const ppmResults = await validatePPM(
        claimData.ppm.weight,
        claimData.ppm.distance,
        claimData.ppm.amount,
        rules
      );
      allResults.push(...ppmResults);
    }

    // Calculate summary
    const passed = allResults.filter((r) => r.passed).length;
    const warnings = allResults.filter((r) => r.severity === "warning").length;
    const errors = allResults.filter((r) => r.severity === "error").length;
    const overall_score = Math.round((passed / allResults.length) * 100);

    return {
      total_rules: allResults.length,
      passed,
      warnings,
      errors,
      overall_score,
      results: allResults,
    };
  } catch (error) {
    logger.error("PCS claim validation failed:", error);
    return {
      total_rules: 0,
      passed: 0,
      warnings: 0,
      errors: 1,
      overall_score: 0,
      results: [
        {
          rule_code: "SYSTEM-002",
          rule_title: "Validation Error",
          category: "system",
          severity: "error",
          message: "An error occurred during validation",
          citation: "System",
          passed: false,
        },
      ],
    };
  }
}
