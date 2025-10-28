/**
 * JTR RULES ENGINE
 *
 * Provides JTR (Joint Travel Regulations) rule lookup and validation
 * for PCS entitlements and reimbursements.
 *
 * All rules sourced from official JTR documentation with citations.
 */

import jtrData from "@/lib/data/jtr-rules.json";

interface JTRRule {
  id: string;
  category: string;
  title: string;
  citation: string;
  description: string;
  conditions?: Record<string, unknown>;
  calculation?: string;
  rates?: Record<string, number>;
  allowances?: Record<string, number>;
  reimbursement?: string;
  notes?: string;
  unit?: string;
  rate_per_mile?: number;
  max_amount?: number;
}

const jtrRules: JTRRule[] = jtrData.rules as JTRRule[];

/**
 * Get all JTR rules by category
 */
export function getRulesByCategory(category: string): JTRRule[] {
  return jtrRules.filter((rule) => rule.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get a specific rule by ID
 */
export function getRule(ruleId: string): JTRRule | undefined {
  return jtrRules.find((rule) => rule.id === ruleId);
}

/**
 * Get DLA rate for rank and dependent status
 */
export function getDLARate(
  rank: string,
  hasDependents: boolean
): {
  amount: number;
  citation: string;
  category: string;
} {
  const dlaRatesRule = getRule("dla-rates-2025");
  if (!dlaRatesRule || !dlaRatesRule.rates) {
    return { amount: 0, citation: "JTR 050301", category: "E5-E6_with" };
  }

  const suffix = hasDependents ? "_with" : "_without";
  let category = "E5-E6";

  if (["E1", "E2", "E3", "E4"].includes(rank)) category = "E1-E4";
  else if (["E5", "E6"].includes(rank)) category = "E5-E6";
  else if (["E7", "E8", "E9"].includes(rank)) category = "E7-E9";
  else if (["O1", "O2", "O3", "W1", "W2"].includes(rank)) category = "O1-O3";
  else if (["O4", "O5", "O6", "W3", "W4", "W5"].includes(rank)) category = "O4-O6";

  const key = `${category}${suffix}`;
  const amount = dlaRatesRule.rates[key] || dlaRatesRule.rates["E5-E6_with"] || 0;

  return {
    amount,
    citation: dlaRatesRule.citation,
    category: key,
  };
}

/**
 * Get HHG weight allowance for rank and dependents
 *
 * Weight allowance is BINARY (with/without dependents), not additive.
 * Pro-gear is separate and doesn't count against HHG cap.
 */
export function getWeightAllowance(
  rank: string,
  hasDependents: boolean
): {
  allowance: number;
  citation: string;
} {
  // Binary weight allowances (with/without dependents)
  // Source: JTR 054705 (Table 5-5) - verified 2025-01-01
  const allowances: Record<string, { without: number; with: number }> = {
    // Enlisted (E1-E9)
    E1: { without: 5000, with: 8000 },
    E2: { without: 5000, with: 8000 },
    E3: { without: 5000, with: 8000 },
    E4: { without: 7000, with: 8000 },
    E5: { without: 7000, with: 9000 },
    E6: { without: 8000, with: 11000 },
    E7: { without: 11000, with: 13000 },
    E8: { without: 12000, with: 14000 },
    E9: { without: 13000, with: 15000 },
    // Warrant Officers (W1-W5)
    W1: { without: 10000, with: 12000 },
    W2: { without: 11000, with: 13000 },
    W3: { without: 12000, with: 14000 },
    W4: { without: 13000, with: 15000 },
    W5: { without: 13000, with: 16000 },
    // Officers (O1-O10)
    O1: { without: 10000, with: 12000 },
    O2: { without: 10000, with: 12000 },
    O3: { without: 11000, with: 13000 },
    O4: { without: 12000, with: 14000 },
    O5: { without: 13000, with: 16000 },
    O6: { without: 14000, with: 18000 },
    O7: { without: 15000, with: 18000 },
    O8: { without: 16000, with: 18000 },
    O9: { without: 17000, with: 18000 },
    O10: { without: 18000, with: 18000 },
  };

  const normalizedRank = rank.replace("-", "");
  const rankAllowance = allowances[normalizedRank] || { without: 7000, with: 8000 };
  const allowance = hasDependents ? rankAllowance.with : rankAllowance.without;

  return {
    allowance,
    citation: "JTR 054705",
  };
}

/**
 * Validate PPM weight against allowance
 */
export function validatePPMWeight(
  rank: string,
  hasDependents: boolean,
  actualWeight: number
): {
  isValid: boolean;
  allowance: number;
  overage: number;
  citation: string;
  message: string;
} {
  const { allowance, citation } = getWeightAllowance(rank, hasDependents);
  const overage = Math.max(0, actualWeight - allowance);
  const isValid = actualWeight <= allowance;

  return {
    isValid,
    allowance,
    overage,
    citation,
    message: isValid
      ? `Weight is within your ${allowance.toLocaleString()} lb allowance`
      : `Weight exceeds allowance by ${overage.toLocaleString()} lbs. Excess weight is not reimbursable.`,
  };
}

/**
 * Check DLA eligibility
 */
export function checkDLAEligibility(
  distance: number,
  hasOrders: boolean
): {
  eligible: boolean;
  reason: string;
  citation: string;
} {
  const dlaRule = getRule("dla-eligibility");
  if (!dlaRule) {
    return {
      eligible: false,
      reason: "DLA rule not found",
      citation: "JTR 050301",
    };
  }

  if (!hasOrders) {
    return {
      eligible: false,
      reason: "PCS orders are required for DLA",
      citation: dlaRule.citation,
    };
  }

  const conditions = dlaRule.conditions as { min_distance_miles: number };
  const minDistance = conditions?.min_distance_miles || 50;

  if (distance < minDistance) {
    return {
      eligible: false,
      reason: `PCS distance must be ${minDistance}+ miles for DLA (current: ${distance} miles)`,
      citation: dlaRule.citation,
    };
  }

  return {
    eligible: true,
    reason: "Eligible for DLA",
    citation: dlaRule.citation,
  };
}

/**
 * Check TLE eligibility and limits
 */
export function validateTLEDays(
  originDays: number,
  destinationDays: number
): {
  isValid: boolean;
  warnings: string[];
  citation: string;
} {
  const tleRule = getRule("tle-eligibility");
  const conditions = tleRule?.conditions as
    | { max_days_origin: number; max_days_destination: number }
    | undefined;
  const maxOrigin = conditions?.max_days_origin || 10;
  const maxDest = conditions?.max_days_destination || 10;

  const warnings: string[] = [];

  if (originDays > maxOrigin) {
    warnings.push(
      `Origin TLE exceeds ${maxOrigin} days (you have ${originDays}). Days beyond ${maxOrigin} require commander approval.`
    );
  }

  if (destinationDays > maxDest) {
    warnings.push(
      `Destination TLE exceeds ${maxDest} days (you have ${destinationDays}). Days beyond ${maxDest} require commander approval.`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    citation: tleRule?.citation || "JTR 054205",
  };
}

/**
 * Get MALT rate
 */
export function getMALTRate(): {
  rate: number;
  citation: string;
  description: string;
} {
  const maltRule = getRule("malt-calculation");
  return {
    rate: maltRule?.rate_per_mile || 0.18,
    citation: maltRule?.citation || "JTR 050502-B",
    description: maltRule?.description || "Mileage allowance in lieu of transportation",
  };
}

/**
 * Get all rules (for reference/display)
 */
export function getAllRules(): JTRRule[] {
  return jtrRules;
}

/**
 * Search rules by keyword
 */
export function searchRules(query: string): JTRRule[] {
  const normalized = query.toLowerCase().trim();

  return jtrRules.filter(
    (rule) =>
      rule.title.toLowerCase().includes(normalized) ||
      rule.description.toLowerCase().includes(normalized) ||
      rule.category.toLowerCase().includes(normalized) ||
      rule.citation.toLowerCase().includes(normalized)
  );
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  const categories = new Set(jtrRules.map((rule) => rule.category));
  return Array.from(categories).sort();
}

/**
 * Calculate confidence score based on available data
 */
export function calculateConfidenceScore(claimData: {
  hasOrders: boolean;
  hasWeighTickets: boolean;
  hasReceipts: boolean;
  originCity?: string;
  destinationCity?: string;
  distance?: number;
  rank?: string;
}): {
  score: number; // 0-100
  level: "high" | "medium" | "low";
  factors: Array<{ factor: string; impact: string; met: boolean }>;
} {
  const factors = [
    {
      factor: "PCS Orders uploaded",
      impact: "+30 points",
      met: claimData.hasOrders,
    },
    {
      factor: "Weight tickets (if PPM)",
      impact: "+20 points",
      met: claimData.hasWeighTickets,
    },
    {
      factor: "Receipts uploaded",
      impact: "+15 points",
      met: claimData.hasReceipts,
    },
    {
      factor: "Origin location specified",
      impact: "+10 points",
      met: !!claimData.originCity,
    },
    {
      factor: "Destination location specified",
      impact: "+10 points",
      met: !!claimData.destinationCity,
    },
    {
      factor: "Distance calculated",
      impact: "+10 points",
      met: !!claimData.distance && claimData.distance > 0,
    },
    {
      factor: "Rank verified",
      impact: "+5 points",
      met: !!claimData.rank,
    },
  ];

  let score = 0;
  if (claimData.hasOrders) score += 30;
  if (claimData.hasWeighTickets) score += 20;
  if (claimData.hasReceipts) score += 15;
  if (claimData.originCity) score += 10;
  if (claimData.destinationCity) score += 10;
  if (claimData.distance && claimData.distance > 0) score += 10;
  if (claimData.rank) score += 5;

  const level = score >= 80 ? "high" : score >= 50 ? "medium" : "low";

  return {
    score,
    level,
    factors,
  };
}
