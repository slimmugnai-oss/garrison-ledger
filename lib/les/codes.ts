/**
 * LES LINE ITEM CODES
 * Canonical registry of known LES line codes with metadata
 *
 * Each code defines:
 * - section: Category for grouping (ALLOWANCE, TAX, DEDUCTION, etc.)
 * - description: Human-readable label
 * - taxability: Which tax bases this income counts toward
 */

export interface LineCodeDefinition {
  section: "ALLOWANCE" | "DEDUCTION" | "ALLOTMENT" | "TAX" | "DEBT" | "ADJUSTMENT";
  description: string;
  taxability: {
    fed: boolean; // Federal income tax base
    state: boolean; // State income tax base
    oasdi: boolean; // FICA/Social Security (6.2%) base
    medicare: boolean; // Medicare (1.45%) base
  };
}

export const LINE_CODES: Record<string, LineCodeDefinition> = {
  // =============================================================================
  // ALLOWANCES (Income)
  // =============================================================================

  BASEPAY: {
    section: "ALLOWANCE",
    description: "Base Pay",
    taxability: { fed: true, state: true, oasdi: true, medicare: true },
  },

  BAH: {
    section: "ALLOWANCE",
    description: "Basic Allowance for Housing",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  BAS: {
    section: "ALLOWANCE",
    description: "Basic Allowance for Subsistence",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  COLA: {
    section: "ALLOWANCE",
    description: "Cost of Living Allowance (OCONUS)",
    taxability: {
      fed: false, // OCONUS COLA NOT taxable for federal income tax
      state: false, // OCONUS COLA NOT taxable for state income tax
      oasdi: true, // OCONUS COLA IS subject to FICA (6.2%)
      medicare: true, // OCONUS COLA IS subject to Medicare (1.45%)
    },
  },

  SDAP: {
    section: "ALLOWANCE",
    description: "Special Duty Assignment Pay",
    taxability: { fed: true, state: true, oasdi: true, medicare: true },
  },

  HFP: {
    section: "ALLOWANCE",
    description: "Hostile Fire Pay / Imminent Danger Pay",
    taxability: { fed: false, state: false, oasdi: true, medicare: true },
  },

  FSA: {
    section: "ALLOWANCE",
    description: "Family Separation Allowance",
    taxability: { fed: true, state: true, oasdi: true, medicare: true },
  },

  FLPP: {
    section: "ALLOWANCE",
    description: "Foreign Language Proficiency Pay",
    taxability: { fed: true, state: true, oasdi: true, medicare: true },
  },

  // =============================================================================
  // TAXES
  // =============================================================================

  TAX_FED: {
    section: "TAX",
    description: "Federal Income Tax Withheld",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  TAX_STATE: {
    section: "TAX",
    description: "State Income Tax Withheld",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  FICA: {
    section: "TAX",
    description: "FICA (Social Security Tax)",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  MEDICARE: {
    section: "TAX",
    description: "Medicare Tax",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  // =============================================================================
  // DEDUCTIONS
  // =============================================================================

  SGLI: {
    section: "DEDUCTION",
    description: "SGLI Life Insurance Premium",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  DENTAL: {
    section: "DEDUCTION",
    description: "Dental Insurance Premium",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  TSP: {
    section: "DEDUCTION",
    description: "Thrift Savings Plan Contribution",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  // =============================================================================
  // ALLOTMENTS
  // =============================================================================

  ALLOTMENT: {
    section: "ALLOTMENT",
    description: "Discretionary Allotment",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  // =============================================================================
  // DEBTS
  // =============================================================================

  DEBT: {
    section: "DEBT",
    description: "Debt Repayment",
    taxability: { fed: false, state: false, oasdi: false, medicare: false },
  },

  // =============================================================================
  // ADJUSTMENTS
  // =============================================================================

  ADJUSTMENT: {
    section: "ADJUSTMENT",
    description: "Pay Adjustment",
    taxability: { fed: true, state: true, oasdi: true, medicare: true }, // Usually taxable
  },
};

/**
 * Get line code definition
 * @param code - Line code (e.g., BASEPAY, BAH, FICA)
 * @returns Line code definition with section and taxability
 */
export function getLineCodeDefinition(code: string): LineCodeDefinition {
  return LINE_CODES[code] || LINE_CODES.ADJUSTMENT; // Default to adjustment if unknown
}

/**
 * Compute taxable income bases from line items
 * Only ALLOWANCE section items contribute to taxable income
 *
 * @param lines - Array of line items with code and amount
 * @returns Taxable bases for each tax type in cents
 */
export function computeTaxableBases(
  lines: Array<{
    code: string;
    amount_cents: number;
  }>
): {
  fed: number; // Federal income tax base
  state: number; // State income tax base
  oasdi: number; // FICA/Social Security base
  medicare: number; // Medicare base
} {
  const bases = { fed: 0, state: 0, oasdi: 0, medicare: 0 };

  for (const line of lines) {
    const def = getLineCodeDefinition(line.code);

    // Only allowances (income) count toward taxable bases
    if (def.section !== "ALLOWANCE") continue;

    if (def.taxability.fed) bases.fed += line.amount_cents;
    if (def.taxability.state) bases.state += line.amount_cents;
    if (def.taxability.oasdi) bases.oasdi += line.amount_cents;
    if (def.taxability.medicare) bases.medicare += line.amount_cents;
  }

  return bases;
}

/**
 * Get all codes by section
 * @param section - Section to filter by
 * @returns Array of codes in that section
 */
export function getCodesBySection(section: LineCodeDefinition["section"]): string[] {
  return Object.keys(LINE_CODES).filter((code) => LINE_CODES[code].section === section);
}

/**
 * Validate a line code exists
 * @param code - Line code to validate
 * @returns True if code is recognized
 */
export function isValidLineCode(code: string): boolean {
  return code in LINE_CODES;
}

/**
 * Canonicalize a raw LES code to our standard format
 * Used by PDF parser to normalize different LES formats
 *
 * @param rawCode - Raw code from LES (e.g., "BAS", "BAH W/DEP", "FED TAX")
 * @returns Canonical code (e.g., "BAS", "BAH", "TAX_FED")
 */
export function canonicalizeCode(rawCode: string): string {
  const normalized = rawCode.toUpperCase().trim();

  // Direct matches
  if (normalized === "BASEPAY" || normalized === "BASE PAY" || normalized === "BASIC PAY")
    return "BASEPAY";
  if (normalized === "BAH" || normalized.includes("BAH")) return "BAH";
  if (normalized === "BAS") return "BAS";
  if (normalized === "COLA" || normalized.includes("COLA")) return "COLA";
  if (normalized === "SDAP") return "SDAP";
  if (
    normalized === "HFP" ||
    normalized === "IDP" ||
    normalized.includes("HOSTILE") ||
    normalized.includes("IMMINENT")
  )
    return "HFP";
  if (normalized === "FSA" || normalized.includes("FAMILY SEP")) return "FSA";
  if (normalized === "FLPP" || normalized.includes("LANGUAGE")) return "FLPP";

  // Taxes
  if (normalized.includes("FED") && normalized.includes("TAX")) return "TAX_FED";
  if (normalized.includes("STATE") && normalized.includes("TAX")) return "TAX_STATE";
  if (
    normalized === "FICA" ||
    normalized.includes("SOC SEC") ||
    normalized.includes("SOCIAL SECURITY")
  )
    return "FICA";
  if (normalized === "MEDICARE" || normalized.includes("MEDICARE")) return "MEDICARE";

  // Deductions
  if (normalized === "SGLI" || normalized.includes("SGLI")) return "SGLI";
  if (normalized.includes("DENTAL")) return "DENTAL";
  if (normalized === "TSP" || normalized.includes("THRIFT")) return "TSP";

  // Allotments
  if (normalized.includes("ALLOTMENT")) return "ALLOTMENT";

  // Debts
  if (normalized.includes("DEBT")) return "DEBT";

  // Default
  return "ADJUSTMENT";
}

/**
 * Get section for a line code
 * @param code - Line code
 * @returns Section name
 */
export function getSection(code: string): LineCodeDefinition["section"] {
  return getLineCodeDefinition(code).section;
}

/**
 * Common user-entered code variations to canonical codes
 */
const CODE_ALIASES: Record<string, string> = {
  // Medicare variations
  "MEDICARE HI": "MEDICARE",
  MED: "MEDICARE",
  MCARE: "MEDICARE",

  // Federal tax variations
  "FED TAX": "TAX_FED",
  FITW: "TAX_FED",
  FEDERAL: "TAX_FED",
  "FED INCOME TAX": "TAX_FED",

  // State tax variations
  "STATE TAX": "TAX_STATE",
  SITW: "TAX_STATE",
  STATE: "TAX_STATE",
  "STATE INCOME TAX": "TAX_STATE",

  // FICA variations
  "SOC SEC": "FICA",
  OASDI: "FICA",
  "SOCIAL SECURITY": "FICA",
  SS: "FICA",

  // Base pay variations
  "BASIC PAY": "BASEPAY",
  "BASE PAY": "BASEPAY",
  BASE: "BASEPAY",

  // BAH variations
  "BAH W/DEP": "BAH",
  "BAH W/O DEP": "BAH",
  "BAH WITH DEP": "BAH",
  "BAH WITHOUT DEP": "BAH",

  // BAS variations
  SUBSISTENCE: "BAS",

  // TSP variations
  THRIFT: "TSP",
  "THRIFT SAVINGS": "TSP",
  "TSP CONTRIBUTION": "TSP",

  // SGLI variations
  "LIFE INSURANCE": "SGLI",
  "SGLI PREMIUM": "SGLI",

  // Dental variations
  "TRICARE DENTAL": "DENTAL",
  "DENTAL PREMIUM": "DENTAL",
};

/**
 * Normalize user-entered code to canonical form
 *
 * @param code - User-entered code (may include spaces, mixed case, abbreviations)
 * @returns Canonical code or original if no mapping exists
 */
export function normalizeLineCode(code: string): string {
  const upper = code.toUpperCase().trim();
  return CODE_ALIASES[upper] || code;
}

/**
 * Validate and normalize a line code
 * Returns the code if valid, or 'OTHER' with a warning flag if invalid
 *
 * @param code - Line code to validate
 * @returns Validated code and optional warning flag
 */
export function validateAndNormalizeCode(code: string): {
  code: string;
  warning?: {
    severity: "yellow";
    flag_code: "UNKNOWN_CODE";
    message: string;
    suggestion: string;
  };
} {
  // First try to normalize common variations
  const normalized = normalizeLineCode(code);

  if (isValidLineCode(normalized)) {
    return { code: normalized };
  }

  // Unknown code → default to OTHER with warning
  return {
    code: "OTHER",
    warning: {
      severity: "yellow",
      flag_code: "UNKNOWN_CODE",
      message: `Unrecognized line code: ${code}`,
      suggestion: "Review this entry for typos. Code has been categorized as OTHER.",
    },
  };
}
