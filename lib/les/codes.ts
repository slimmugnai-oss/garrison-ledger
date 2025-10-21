/**
 * LES CODE MAPPINGS
 * 
 * Canonical mapping of LES line codes to sections and aliases.
 * Used by parser to normalize various LES formats into standard codes.
 * 
 * Source: DFAS LES documentation and common military pay systems
 */

import type { LesSection } from '@/app/types/les';

export interface LesCodeMeta {
  section: LesSection;
  aliases?: string[];
  description?: string;
}

/**
 * Canonical LES code mapping
 * Key = standard code (e.g., "BAH")
 * Value = section + known aliases
 */
export const LES_CODE_MAP: Record<string, LesCodeMeta> = {
  // =============================================================================
  // ALLOWANCES
  // =============================================================================
  
  BASE_PAY: {
    section: 'ALLOWANCE',
    aliases: [
      'BASE PAY',
      'BASIC PAY',
      'BASE COMPENSATION',
      'MONTHLY BASE PAY'
    ],
    description: 'Base Pay'
  },
  
  BAH: {
    section: 'ALLOWANCE',
    aliases: [
      'BASIC ALLOW HOUS',
      'BASIC ALLOWANCE FOR HOUSING',
      'BAH W/DEP',
      'BAH W/O DEP',
      'BAH WITHOUT DEPENDENTS',
      'BAH WITH DEPENDENTS',
      'BASIC ALLOW FOR HOUSING'
    ],
    description: 'Basic Allowance for Housing'
  },
  
  BAS: {
    section: 'ALLOWANCE',
    aliases: [
      'BASIC ALLOW SUBSISTENCE',
      'BASIC ALLOWANCE FOR SUBSISTENCE',
      'BASIC ALLOW FOR SUBSISTENCE'
    ],
    description: 'Basic Allowance for Subsistence'
  },
  
  COLA: {
    section: 'ALLOWANCE',
    aliases: [
      'COST OF LIVING',
      'COST OF LIVING ALLOWANCE',
      'COST LIVING ALLOW',
      'COL ALLOWANCE'
    ],
    description: 'Cost of Living Allowance'
  },
  
  SDAP: {
    section: 'ALLOWANCE',
    aliases: [
      'SPECIAL DUTY ASSIGNMENT PAY',
      'SPECIAL DUTY ASSGN PAY',
      'SPEC DUTY PAY'
    ],
    description: 'Special Duty Assignment Pay'
  },
  
  HFP_IDP: {
    section: 'ALLOWANCE',
    aliases: [
      'HOSTILE FIRE PAY',
      'HOSTILE FIRE/IMMINENT DANGER PAY',
      'HFP/IDP',
      'HFP',
      'IDP',
      'IMMINENT DANGER PAY',
      'IDP/HFP'
    ],
    description: 'Hostile Fire Pay / Imminent Danger Pay'
  },
  
  FSA: {
    section: 'ALLOWANCE',
    aliases: [
      'FAMILY SEPARATION ALLOWANCE',
      'FAMILY SEP ALLOW',
      'FAM SEP ALLOWANCE'
    ],
    description: 'Family Separation Allowance'
  },
  
  FLPP: {
    section: 'ALLOWANCE',
    aliases: [
      'FOREIGN LANGUAGE PROFICIENCY PAY',
      'FOREIGN LANG PROF PAY',
      'FOREIGN LANGUAGE PAY'
    ],
    description: 'Foreign Language Proficiency Pay'
  },
  
  // =============================================================================
  // DEDUCTIONS
  // =============================================================================
  
  SGLI: {
    section: 'DEDUCTION',
    aliases: [
      'SERVICEMEMBERS GROUP LIFE INSURANCE',
      'SGLI PREMIUM',
      'SGLI INS'
    ],
    description: 'Servicemembers Group Life Insurance'
  },
  
  TSP: {
    section: 'DEDUCTION',
    aliases: [
      'THRIFT SAVINGS PLAN',
      'TSP CONTRIBUTION',
      'TSP CONTR'
    ],
    description: 'Thrift Savings Plan Contribution'
  },
  
  DENTAL: {
    section: 'DEDUCTION',
    aliases: [
      'TRICARE DENTAL',
      'DENTAL INSURANCE',
      'DENTAL PREM'
    ],
    description: 'Dental Insurance Premium'
  },
  
  SBP: {
    section: 'DEDUCTION',
    aliases: [
      'SURVIVOR BENEFIT PLAN',
      'SBP PREMIUM',
      'SBP COST'
    ],
    description: 'Survivor Benefit Plan'
  },
  
  // =============================================================================
  // TAXES
  // =============================================================================
  
  FITW: {
    section: 'TAX',
    aliases: [
      'FEDERAL INCOME TAX WITHHELD',
      'FED TAX WITHHELD',
      'FEDERAL TAX',
      'FED INC TAX'
    ],
    description: 'Federal Income Tax Withheld'
  },
  
  FICA: {
    section: 'TAX',
    aliases: [
      'FICA TAX',
      'SOCIAL SECURITY',
      'SOC SEC TAX'
    ],
    description: 'Federal Insurance Contributions Act (Social Security)'
  },
  
  MEDICARE: {
    section: 'TAX',
    aliases: [
      'MEDICARE TAX',
      'MED TAX',
      'MEDICARE'
    ],
    description: 'Medicare Tax'
  },
  
  SITW: {
    section: 'TAX',
    aliases: [
      'STATE INCOME TAX WITHHELD',
      'STATE TAX',
      'ST INC TAX'
    ],
    description: 'State Income Tax Withheld'
  },
  
  // =============================================================================
  // ALLOTMENTS
  // =============================================================================
  
  ALLOT: {
    section: 'ALLOTMENT',
    aliases: [
      'ALLOTMENT',
      'DISCRETIONARY ALLOTMENT',
      'VOLUNTARY ALLOTMENT'
    ],
    description: 'Voluntary Allotment'
  }
};

/**
 * Canonicalize a raw LES code string to standard code
 * @param raw Raw code from LES (e.g., "BASIC ALLOW HOUS W/DEP")
 * @returns Standard code (e.g., "BAH") or null if not recognized
 */
export function canonicalizeCode(raw: string): string | null {
  const normalized = raw.trim().toUpperCase();
  
  // Check exact match first
  if (LES_CODE_MAP[normalized]) {
    return normalized;
  }
  
  // Check aliases
  for (const [code, meta] of Object.entries(LES_CODE_MAP)) {
    if (meta.aliases?.some(alias => alias.toUpperCase() === normalized)) {
      return code;
    }
    
    // Partial match for common variations
    if (meta.aliases?.some(alias => normalized.includes(alias.toUpperCase()))) {
      return code;
    }
  }
  
  return null;
}

/**
 * Get section for a given code
 * @param code Standard code (e.g., "BAH")
 * @returns Section or 'OTHER' if not found
 */
export function getSection(code: string): LesSection {
  const meta = LES_CODE_MAP[code.toUpperCase()];
  return meta?.section || 'OTHER';
}

/**
 * Get all codes for a given section
 * @param section Section to filter by
 * @returns Array of standard codes
 */
export function getCodesForSection(section: LesSection): string[] {
  return Object.entries(LES_CODE_MAP)
    .filter(([_, meta]) => meta.section === section)
    .map(([code, _]) => code);
}

/**
 * Check if a code is an allowance
 */
export function isAllowance(code: string): boolean {
  return getSection(code) === 'ALLOWANCE';
}

/**
 * Check if a code is a deduction
 */
export function isDeduction(code: string): boolean {
  return getSection(code) === 'DEDUCTION';
}

/**
 * Check if a code is a tax
 */
export function isTax(code: string): boolean {
  return getSection(code) === 'TAX';
}

/**
 * Get human-readable description
 */
export function getDescription(code: string): string {
  const meta = LES_CODE_MAP[code.toUpperCase()];
  return meta?.description || code;
}

