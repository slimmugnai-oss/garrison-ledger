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
  section: 'ALLOWANCE' | 'DEDUCTION' | 'ALLOTMENT' | 'TAX' | 'DEBT' | 'ADJUSTMENT';
  description: string;
  taxability: {
    fed: boolean;      // Federal income tax base
    state: boolean;    // State income tax base
    oasdi: boolean;    // FICA/Social Security (6.2%) base
    medicare: boolean; // Medicare (1.45%) base
  };
}

export const LINE_CODES: Record<string, LineCodeDefinition> = {
  // =============================================================================
  // ALLOWANCES (Income)
  // =============================================================================
  
  BASEPAY: {
    section: 'ALLOWANCE',
    description: 'Base Pay',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },
  
  BAH: {
    section: 'ALLOWANCE',
    description: 'Basic Allowance for Housing',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  BAS: {
    section: 'ALLOWANCE',
    description: 'Basic Allowance for Subsistence',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  COLA: {
    section: 'ALLOWANCE',
    description: 'Cost of Living Allowance',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  SDAP: {
    section: 'ALLOWANCE',
    description: 'Special Duty Assignment Pay',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },
  
  HFP: {
    section: 'ALLOWANCE',
    description: 'Hostile Fire Pay / Imminent Danger Pay',
    taxability: { fed: false, state: false, oasdi: true, medicare: true }
  },
  
  FSA: {
    section: 'ALLOWANCE',
    description: 'Family Separation Allowance',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },
  
  FLPP: {
    section: 'ALLOWANCE',
    description: 'Foreign Language Proficiency Pay',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },

  // =============================================================================
  // TAXES
  // =============================================================================
  
  TAX_FED: {
    section: 'TAX',
    description: 'Federal Income Tax Withheld',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  TAX_STATE: {
    section: 'TAX',
    description: 'State Income Tax Withheld',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  FICA: {
    section: 'TAX',
    description: 'FICA (Social Security Tax)',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  MEDICARE: {
    section: 'TAX',
    description: 'Medicare Tax',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // =============================================================================
  // DEDUCTIONS
  // =============================================================================
  
  SGLI: {
    section: 'DEDUCTION',
    description: 'SGLI Life Insurance Premium',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  DENTAL: {
    section: 'DEDUCTION',
    description: 'Dental Insurance Premium',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  
  TSP: {
    section: 'DEDUCTION',
    description: 'Thrift Savings Plan Contribution',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // =============================================================================
  // ALLOTMENTS
  // =============================================================================
  
  ALLOTMENT: {
    section: 'ALLOTMENT',
    description: 'Discretionary Allotment',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // =============================================================================
  // DEBTS
  // =============================================================================
  
  DEBT: {
    section: 'DEBT',
    description: 'Debt Repayment',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // =============================================================================
  // ADJUSTMENTS
  // =============================================================================
  
  ADJUSTMENT: {
    section: 'ADJUSTMENT',
    description: 'Pay Adjustment',
    taxability: { fed: true, state: true, oasdi: true, medicare: true } // Usually taxable
  }
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
export function computeTaxableBases(lines: Array<{
  code: string; 
  amount_cents: number;
}>): {
  fed: number;      // Federal income tax base
  state: number;    // State income tax base
  oasdi: number;    // FICA/Social Security base
  medicare: number; // Medicare base
} {
  const bases = { fed: 0, state: 0, oasdi: 0, medicare: 0 };
  
  for (const line of lines) {
    const def = getLineCodeDefinition(line.code);
    
    // Only allowances (income) count toward taxable bases
    if (def.section !== 'ALLOWANCE') continue;
    
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
export function getCodesBySection(
  section: LineCodeDefinition['section']
): string[] {
  return Object.keys(LINE_CODES).filter(
    code => LINE_CODES[code].section === section
  );
}

/**
 * Validate a line code exists
 * @param code - Line code to validate
 * @returns True if code is recognized
 */
export function isValidLineCode(code: string): boolean {
  return code in LINE_CODES;
}
