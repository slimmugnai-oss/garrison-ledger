/**
 * PCS COPILOT VALIDATION ENGINE
 *
 * Real-time validation with JTR compliance checking
 * Three layers: Field-level, Cross-field, JTR compliance
 */

export interface ValidationFlag {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggested_fix?: string;
  jtr_citation?: string;
  category: string;
}

export interface FormData {
  // Basic Info
  claim_name: string;
  pcs_orders_date: string;
  departure_date: string;
  arrival_date: string;
  origin_base: string;
  destination_base: string;

  // Travel Details
  travel_method: string;
  dependents_count: number;
  rank_at_pcs: string;
  branch: string;

  // Lodging (TLE)
  tle_origin_nights: number;
  tle_destination_nights: number;
  tle_origin_rate: number;
  tle_destination_rate: number;

  // Travel Costs
  malt_distance: number;
  per_diem_days: number;
  fuel_receipts: number;

  // Weight & Distance
  estimated_weight: number;
  actual_weight: number;
  distance_miles: number;
}

/**
 * Layer 1: Field-Level Validation (Instant)
 * Validates individual fields as user types
 */
export function validateFieldLevel(formData: FormData): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  // Required fields
  if (!formData.claim_name.trim()) {
    flags.push({
      field: "claim_name",
      severity: "error",
      message: "Claim name is required",
      category: "required_field",
    });
  }

  if (!formData.pcs_orders_date) {
    flags.push({
      field: "pcs_orders_date",
      severity: "error",
      message: "PCS orders date is required",
      category: "required_field",
    });
  }

  if (!formData.departure_date) {
    flags.push({
      field: "departure_date",
      severity: "error",
      message: "Departure date is required",
      category: "required_field",
    });
  }

  if (!formData.arrival_date) {
    flags.push({
      field: "arrival_date",
      severity: "error",
      message: "Arrival date is required",
      category: "required_field",
    });
  }

  if (!formData.origin_base.trim()) {
    flags.push({
      field: "origin_base",
      severity: "error",
      message: "Origin base is required",
      category: "required_field",
    });
  }

  if (!formData.destination_base.trim()) {
    flags.push({
      field: "destination_base",
      severity: "error",
      message: "Destination base is required",
      category: "required_field",
    });
  }

  if (!formData.rank_at_pcs.trim()) {
    flags.push({
      field: "rank_at_pcs",
      severity: "error",
      message: "Rank at PCS is required",
      category: "required_field",
    });
  }

  if (!formData.branch.trim()) {
    flags.push({
      field: "branch",
      severity: "error",
      message: "Branch is required",
      category: "required_field",
    });
  }

  // Date validation
  if (formData.pcs_orders_date) {
    const ordersDate = new Date(formData.pcs_orders_date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (ordersDate < sixMonthsAgo) {
      flags.push({
        field: "pcs_orders_date",
        severity: "warning",
        message: "PCS orders date is more than 6 months old",
        suggested_fix: "Verify this is the correct orders date",
        category: "date_range",
      });
    }
  }

  // TLE validation
  if (formData.tle_origin_nights > 10) {
    flags.push({
      field: "tle_origin_nights",
      severity: "warning",
      message: "TLE at origin exceeds 10 days (JTR maximum)",
      suggested_fix: "Reduce to 10 days or less",
      jtr_citation: "JTR 054205",
      category: "tle_limit_exceeded",
    });
  }

  if (formData.tle_destination_nights > 10) {
    flags.push({
      field: "tle_destination_nights",
      severity: "warning",
      message: "TLE at destination exceeds 10 days (JTR maximum)",
      suggested_fix: "Reduce to 10 days or less",
      jtr_citation: "JTR 054205",
      category: "tle_limit_exceeded",
    });
  }

  // Weight validation
  if (formData.estimated_weight > 0) {
    const maxWeight = getWeightAllowance(formData.rank_at_pcs);
    if (formData.estimated_weight > maxWeight) {
      flags.push({
        field: "estimated_weight",
        severity: "warning",
        message: `Estimated weight (${formData.estimated_weight} lbs) exceeds authorized allowance (${maxWeight} lbs)`,
        suggested_fix: "Verify weight estimate or check if you qualify for additional weight",
        jtr_citation: "JTR 054703",
        category: "weight_exceeded",
      });
    }
  }

  return flags;
}

/**
 * Layer 2: Cross-Field Validation (On blur)
 * Validates relationships between fields
 */
export function validateCrossField(formData: FormData): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  // Date logic
  if (formData.departure_date && formData.arrival_date) {
    const departure = new Date(formData.departure_date);
    const arrival = new Date(formData.arrival_date);

    if (departure >= arrival) {
      flags.push({
        field: "arrival_date",
        severity: "error",
        message: "Arrival date must be after departure date",
        category: "date_logic",
      });
    }

    // Check for reasonable travel time
    const travelDays = Math.ceil((arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
    if (travelDays > 30) {
      flags.push({
        field: "arrival_date",
        severity: "warning",
        message: "Travel period exceeds 30 days - verify dates are correct",
        suggested_fix: "Check if this includes authorized en route stops",
        category: "travel_duration",
      });
    }
  }

  // PCS orders date vs travel dates
  if (formData.pcs_orders_date && formData.departure_date) {
    const ordersDate = new Date(formData.pcs_orders_date);
    const departureDate = new Date(formData.departure_date);

    if (departureDate < ordersDate) {
      flags.push({
        field: "departure_date",
        severity: "error",
        message: "Departure date cannot be before PCS orders date",
        category: "date_logic",
      });
    }

    // Check for reasonable gap between orders and departure
    const daysBetween = Math.ceil(
      (departureDate.getTime() - ordersDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysBetween > 90) {
      flags.push({
        field: "departure_date",
        severity: "warning",
        message: "More than 90 days between orders and departure",
        suggested_fix: "Verify dates are correct or check for authorized delays",
        category: "orders_to_departure_gap",
      });
    }
  }

  // Travel days vs per diem days
  if (formData.departure_date && formData.arrival_date && formData.per_diem_days > 0) {
    const departure = new Date(formData.departure_date);
    const arrival = new Date(formData.arrival_date);
    const actualTravelDays = Math.ceil(
      (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (Math.abs(formData.per_diem_days - actualTravelDays) > 1) {
      flags.push({
        field: "per_diem_days",
        severity: "warning",
        message: `Per diem days (${formData.per_diem_days}) doesn't match travel period (${actualTravelDays} days)`,
        suggested_fix: "Verify per diem calculation or travel dates",
        category: "per_diem_mismatch",
      });
    }
  }

  // MALT distance vs actual distance
  if (formData.malt_distance > 0 && formData.distance_miles > 0) {
    const distanceDiff = Math.abs(formData.malt_distance - formData.distance_miles);
    const percentDiff = (distanceDiff / formData.distance_miles) * 100;

    if (percentDiff > 10) {
      flags.push({
        field: "malt_distance",
        severity: "warning",
        message: `MALT distance (${formData.malt_distance} miles) differs significantly from actual distance (${formData.distance_miles} miles)`,
        suggested_fix: "Verify MALT distance calculation or actual distance",
        category: "distance_mismatch",
      });
    }
  }

  return flags;
}

/**
 * Layer 3: JTR Compliance Validation (On save)
 * Validates against Joint Travel Regulations
 */
export function validateJTRCompliance(formData: FormData): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  // TLE total days validation
  const totalTLEDays = formData.tle_origin_nights + formData.tle_destination_nights;
  if (totalTLEDays > 20) {
    flags.push({
      field: "tle_origin_nights",
      severity: "error",
      message: `Total TLE days (${totalTLEDays}) exceeds JTR maximum of 20 days`,
      suggested_fix: "Reduce TLE days to 20 or less total",
      jtr_citation: "JTR 054205",
      category: "tle_total_exceeded",
    });
  }

  // Per diem validation
  if (formData.per_diem_days > 0) {
    const departure = new Date(formData.departure_date);
    const arrival = new Date(formData.arrival_date);
    const maxPerDiemDays =
      Math.ceil((arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)) + 2; // +2 for first/last day

    if (formData.per_diem_days > maxPerDiemDays) {
      flags.push({
        field: "per_diem_days",
        severity: "warning",
        message: `Per diem days (${formData.per_diem_days}) exceeds reasonable travel period`,
        suggested_fix: "Verify per diem calculation",
        jtr_citation: "JTR 054401",
        category: "per_diem_excessive",
      });
    }
  }

  // Dependents validation
  if (formData.dependents_count > 0 && !formData.rank_at_pcs.includes("O")) {
    // Enlisted with dependents - check for common issues
    if (formData.dependents_count > 6) {
      flags.push({
        field: "dependents_count",
        severity: "warning",
        message: "More than 6 dependents - verify count is correct",
        suggested_fix: "Double-check dependent count",
        category: "dependent_count_high",
      });
    }
  }

  // Rank validation
  if (formData.rank_at_pcs) {
    const validRanks = [
      "E1",
      "E2",
      "E3",
      "E4",
      "E5",
      "E6",
      "E7",
      "E8",
      "E9",
      "O1",
      "O2",
      "O3",
      "O4",
      "O5",
      "O6",
      "O7",
      "O8",
      "O9",
      "O10",
    ];

    if (!validRanks.includes(formData.rank_at_pcs)) {
      flags.push({
        field: "rank_at_pcs",
        severity: "warning",
        message: "Rank format may be incorrect",
        suggested_fix: "Use format like E-5, O-3, etc.",
        category: "rank_format",
      });
    }
  }

  // Branch validation
  const validBranches = ["Army", "Navy", "Air Force", "Marine Corps", "Coast Guard", "Space Force"];
  if (formData.branch && !validBranches.includes(formData.branch)) {
    flags.push({
      field: "branch",
      severity: "warning",
      message: "Branch may be incorrect",
      suggested_fix: "Select from valid branch options",
      category: "branch_validation",
    });
  }

  return flags;
}

/**
 * Main validation function that runs all three layers
 */
export function validatePCSClaim(formData: FormData): ValidationFlag[] {
  const fieldFlags = validateFieldLevel(formData);
  const crossFieldFlags = validateCrossField(formData);
  const jtrFlags = validateJTRCompliance(formData);

  return [...fieldFlags, ...crossFieldFlags, ...jtrFlags];
}

/**
 * Get weight allowance by rank
 */
function getWeightAllowance(rank: string): number {
  const weightTable: Record<string, number> = {
    E1: 5000,
    E2: 5000,
    E3: 5000,
    E4: 5000,
    E5: 7000,
    E6: 7000,
    E7: 11000,
    E8: 11000,
    E9: 11000,
    O1: 8000,
    O2: 8000,
    O3: 13000,
    O4: 13000,
    O5: 16000,
    O6: 16000,
    O7: 18000,
    O8: 18000,
    O9: 18000,
    O10: 18000,
  };

  return weightTable[rank] || 5000;
}

/**
 * Calculate confidence score based on validation flags
 */
export function calculateConfidenceScore(flags: ValidationFlag[]): {
  overall: number;
  factors: {
    hasOrders: boolean;
    hasWeighTickets: boolean;
    datesVerified: boolean;
    ratesFromAPI: boolean;
    distanceVerified: boolean;
    receiptsComplete: boolean;
  };
  level: "excellent" | "good" | "fair" | "needs_work";
  recommendations: string[];
} {
  const errorCount = flags.filter((f) => f.severity === "error").length;
  const warningCount = flags.filter((f) => f.severity === "warning").length;

  let score = 100;
  score -= errorCount * 20; // Each error reduces by 20 points
  score -= warningCount * 5; // Each warning reduces by 5 points

  score = Math.max(0, score);

  const factors = {
    hasOrders: true, // Assume true if we're validating
    hasWeighTickets: false, // Would need to check for weigh tickets
    datesVerified: flags.filter((f) => f.category === "date_logic").length === 0,
    ratesFromAPI: true, // Assume true if using our system
    distanceVerified: flags.filter((f) => f.category === "distance_mismatch").length === 0,
    receiptsComplete: false, // Would need to check for receipts
  };

  let level: "excellent" | "good" | "fair" | "needs_work";
  if (score >= 90) level = "excellent";
  else if (score >= 70) level = "good";
  else if (score >= 50) level = "fair";
  else level = "needs_work";

  const recommendations: string[] = [];
  if (errorCount > 0) {
    recommendations.push("Fix all errors before submitting");
  }
  if (warningCount > 0) {
    recommendations.push("Review warnings for potential issues");
  }
  if (score < 70) {
    recommendations.push("Add more details to improve accuracy");
  }

  return {
    overall: score,
    factors,
    level,
    recommendations,
  };
}
