/**
 * LES COMPARISON ENGINE
 * 
 * Compares actual LES line items against expected pay values
 * and generates actionable flags for discrepancies.
 * 
 * BLUF (Bottom Line Up Front) messaging for military audience.
 * Concrete next steps, no vague suggestions.
 */

import type {
  LesLine,
  ExpectedSnapshot,
  PayFlag,
  ComparisonResult,
  ComparisonOptions
} from '@/app/types/les';
import { FLAG_CODES } from '@/app/types/les';
import { ssot } from '@/lib/ssot';

/**
 * Compare actual LES lines against expected snapshot
 * 
 * @param parsed Actual LES lines from parsing
 * @param expected Expected pay snapshot
 * @param options Comparison thresholds and settings
 * @returns Flags and summary totals
 */
export function compareLesToExpected(
  parsed: LesLine[],
  expected: ExpectedSnapshot,
  options?: ComparisonOptions
): ComparisonResult {
  const flags: PayFlag[] = [];
  
  // Get thresholds from options or SSOT (with defaults)
  const defaultThresholds = ssot.militaryPay.comparisonThresholds;
  const thresholds = {
    bahDeltaCents: options?.thresholds?.bahDeltaCents ?? defaultThresholds.bahDeltaCents,
    basDeltaCents: options?.thresholds?.basDeltaCents ?? defaultThresholds.basDeltaCents,
    colaDeltaCents: options?.thresholds?.colaDeltaCents ?? defaultThresholds.colaDeltaCents,
    specialPayDeltaCents: options?.thresholds?.specialPayDeltaCents ?? defaultThresholds.specialPayDeltaCents
  };
  
  // Build lookup map of actual allowances
  const actualAllowances = new Map<string, number>();
  for (const line of parsed) {
    if (line.section === 'ALLOWANCE') {
      const existing = actualAllowances.get(line.line_code) || 0;
      actualAllowances.set(line.line_code, existing + line.amount_cents);
    }
  }
  
  // =============================================================================
  // BAH Comparison
  // =============================================================================
  if (expected.expected.bah_cents !== undefined) {
    const actualBAH = actualAllowances.get('BAH') || 0;
    const expectedBAH = expected.expected.bah_cents;
    const delta = expectedBAH - actualBAH;
    
    if (Math.abs(delta) > thresholds.bahDeltaCents) {
      flags.push(createBAHMismatchFlag(actualBAH, expectedBAH, delta, expected));
    } else if (actualBAH > 0) {
      // BAH is correct within threshold
      flags.push(createCorrectFlag('BAH', actualBAH));
    }
  } else if (actualAllowances.has('BAH')) {
    // BAH appears but we couldn't compute expected (data unavailable)
    flags.push(createVerificationNeededFlag('BAH', 'Expected BAH data unavailable for this location'));
  }
  
  // =============================================================================
  // BAS Comparison
  // =============================================================================
  if (expected.expected.bas_cents !== undefined) {
    const actualBAS = actualAllowances.get('BAS') || 0;
    const expectedBAS = expected.expected.bas_cents;
    const delta = expectedBAS - actualBAS;
    
    if (actualBAS === 0) {
      // BAS missing entirely
      flags.push(createBASMissingFlag(expectedBAS, expected));
    } else if (Math.abs(delta) > thresholds.basDeltaCents) {
      flags.push(createBASMismatchFlag(actualBAS, expectedBAS, delta));
    } else {
      // BAS is correct
      flags.push(createCorrectFlag('BAS', actualBAS));
    }
  }
  
  // =============================================================================
  // COLA Comparison
  // =============================================================================
  if (expected.expected.cola_cents !== undefined && expected.expected.cola_cents > 0) {
    const actualCOLA = actualAllowances.get('COLA') || 0;
    const expectedCOLA = expected.expected.cola_cents;
    const delta = expectedCOLA - actualCOLA;
    
    if (actualCOLA === 0) {
      // COLA expected but not present
      flags.push(createCOLAStoppedFlag(expectedCOLA, expected));
    } else if (Math.abs(delta) > thresholds.colaDeltaCents) {
      flags.push(createCOLAMismatchFlag(actualCOLA, expectedCOLA, delta, expected));
    }
  } else if (actualAllowances.has('COLA') && (!expected.expected.cola_cents || expected.expected.cola_cents === 0)) {
    // COLA present but not expected
    flags.push(createCOLAUnexpectedFlag(actualAllowances.get('COLA')!));
  }
  
  // =============================================================================
  // Special Pays Comparison (if configured)
  // =============================================================================
  if (expected.expected.specials && expected.expected.specials.length > 0) {
    for (const specialPay of expected.expected.specials) {
      const actual = actualAllowances.get(specialPay.code) || 0;
      const delta = specialPay.cents - actual;
      
      if (actual === 0) {
        flags.push(createSpecialPayMissingFlag(specialPay.code, specialPay.cents));
      } else if (Math.abs(delta) > thresholds.specialPayDeltaCents) {
        flags.push(createSpecialPayMismatchFlag(specialPay.code, actual, specialPay.cents, delta));
      } else {
        // Special pay verified correct
        flags.push(createCorrectFlag(specialPay.code, actual));
      }
    }
  }
  
  // =============================================================================
  // Base Pay Comparison
  // =============================================================================
  if (expected.expected.base_pay_cents !== undefined) {
    const actualBasePay = parsed.find(line => line.line_code === 'BASE_PAY')?.amount_cents || 0;
    const expectedBasePay = expected.expected.base_pay_cents;
    const delta = expectedBasePay - actualBasePay;
    
    if (actualBasePay === 0) {
      // Base pay missing entirely (unusual)
      flags.push(createBasePayMissingFlag(expectedBasePay, expected));
    } else if (Math.abs(delta) > 10000) { // $100 threshold for base pay
      flags.push(createBasePayMismatchFlag(actualBasePay, expectedBasePay, delta, expected));
    } else {
      // Base pay verified correct
      flags.push(createCorrectFlag('BASE_PAY', actualBasePay));
    }
  }
  
  // =============================================================================
  // Compute Totals
  // =============================================================================
  const actualAllowancesCents = Array.from(actualAllowances.values()).reduce((sum, val) => sum + val, 0);
  const expectedAllowancesCents = (expected.expected.bah_cents || 0) +
                                   (expected.expected.bas_cents || 0) +
                                   (expected.expected.cola_cents || 0) +
                                   (expected.expected.base_pay_cents || 0) +
                                   (expected.expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);
  const deltaCents = expectedAllowancesCents - actualAllowancesCents;
  
  // If no flags but we have data, add an "all verified" green flag
  if (flags.length === 0 && actualAllowancesCents > 0) {
    flags.push(createAllVerifiedFlag());
  }
  
  return {
    flags,
    totals: {
      actualAllowancesCents,
      expectedAllowancesCents,
      deltaCents
    }
  };
}

// =============================================================================
// FLAG CREATORS (BLUF messaging)
// =============================================================================

function createBAHMismatchFlag(
  actual: number,
  expected: number,
  delta: number,
  snapshot: ExpectedSnapshot
): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  const depStatus = snapshot.with_dependents ? 'with' : 'without';
  
  return {
    severity: 'red',
    flag_code: FLAG_CODES.BAH_MISMATCH,
    message: `BAH mismatch: Received $${actualDollars}, expected $${expectedDollars} for ${snapshot.paygrade} ${depStatus} dependents at ${snapshot.mha_or_zip}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Contact your finance office immediately. Bring this LES and verify your duty station (MHA ${snapshot.mha_or_zip}) and dependent status (${depStatus} dependents) are correct in DEERS/DJMS. Request retroactive correction if applicable.`,
    ref_url: 'https://www.defensetravel.dod.mil/site/bahCalc.cfm',
    delta_cents: delta
  };
}

function createBASMissingFlag(expected: number, snapshot: ExpectedSnapshot): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);
  
  return {
    severity: 'red',
    flag_code: FLAG_CODES.BAS_MISSING,
    message: `BAS not found on LES. Expected $${expectedDollars}/month for ${snapshot.paygrade}.`,
    suggestion: `File emergency pay ticket with finance office TODAY. BAS is a mandatory entitlement. Bring orders and ID card. Request retroactive payment from start of entitlement period.`,
    ref_url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/',
    delta_cents: expected
  };
}

function createBASMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: FLAG_CODES.MINOR_VARIANCE,
    message: `BAS variance: Received $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Verify with finance that correct BAS rate is applied. This may be due to recent rate change or partial month entitlement.`,
    ref_url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/',
    delta_cents: delta
  };
}

function createCOLAStoppedFlag(expected: number, snapshot: ExpectedSnapshot): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: FLAG_CODES.COLA_STOPPED,
    message: `COLA missing. Expected $${expectedDollars}/month for duty station ${snapshot.mha_or_zip}.`,
    suggestion: `Verify with finance that your duty station qualifies for COLA. If you recently PCS'd, ensure DJMS reflects new duty station. If entitled, request retroactive payment.`,
    ref_url: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/',
    delta_cents: expected
  };
}

function createCOLAMismatchFlag(actual: number, expected: number, delta: number, snapshot: ExpectedSnapshot): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: FLAG_CODES.MINOR_VARIANCE,
    message: `COLA variance: Received $${actualDollars}, expected $${expectedDollars} for ${snapshot.mha_or_zip}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Verify duty station code in DJMS matches actual location (${snapshot.mha_or_zip}). COLA rates update quarterly - check if this is a recent rate change.`,
    ref_url: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/',
    delta_cents: delta
  };
}

function createCOLAUnexpectedFlag(actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: FLAG_CODES.COLA_UNEXPECTED,
    message: `COLA present ($${actualDollars}/month) but not expected for this location.`,
    suggestion: `Verify your duty station code in DJMS. If location does not qualify for COLA, notify finance to avoid future repayment. If you're entitled, no action needed.`,
    ref_url: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/',
    delta_cents: -actual
  };
}

function createSpecialPayMissingFlag(code: string, expected: number): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);
  
  return {
    severity: 'red',
    flag_code: FLAG_CODES.SPECIAL_PAY_MISSING,
    message: `${code} not found on LES. Expected $${expectedDollars}/month.`,
    suggestion: `Contact finance office to verify ${code} entitlement is in system. Bring supporting documentation (NEC/MOS orders, duty location, etc.). Request retroactive payment if applicable.`,
    delta_cents: expected
  };
}

function createSpecialPayMismatchFlag(code: string, actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: FLAG_CODES.MINOR_VARIANCE,
    message: `${code} variance: Received $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Verify ${code} rate with finance. Rate may vary by duty assignment or proficiency level. Confirm entitlement details in your service record.`,
    delta_cents: delta
  };
}

function createVerificationNeededFlag(code: string, reason: string): PayFlag {
  return {
    severity: 'yellow',
    flag_code: FLAG_CODES.VERIFICATION_NEEDED,
    message: `${code} requires manual verification: ${reason}`,
    suggestion: `Verify ${code} amount with finance office using official rate tables for your location and rank. Bring LES and station orders.`,
  };
}

function createCorrectFlag(code: string, actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  
  return {
    severity: 'green',
    flag_code: `${code}_CORRECT`,
    message: `${code} verified correct: $${actualDollars}`,
    suggestion: `No action needed. ${code} matches expected rate.`,
  };
}

function createAllVerifiedFlag(): PayFlag {
  return {
    severity: 'green',
    flag_code: FLAG_CODES.ALL_VERIFIED,
    message: 'All allowances verified. No discrepancies found.',
    suggestion: 'Your pay appears correct. Review individual line items in the detailed view.'
  };
}

function createBasePayMissingFlag(expected: number, snapshot: ExpectedSnapshot): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);
  
  return {
    severity: 'red',
    flag_code: 'BASE_PAY_MISSING',
    message: `Base Pay not found on LES. Expected $${expectedDollars}/month for ${snapshot.paygrade} with ${snapshot.yos || 0} years of service.`,
    suggestion: `File emergency pay ticket with finance office immediately. Base pay is the foundation of all military pay. Bring orders, ID card, and LES. Request retroactive payment.`,
    ref_url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/',
    delta_cents: expected
  };
}

function createBasePayMismatchFlag(actual: number, expected: number, delta: number, snapshot: ExpectedSnapshot): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: delta > 0 ? 'red' : 'yellow',
    flag_code: 'BASE_PAY_MISMATCH',
    message: `Base Pay variance: Received $${actualDollars}, expected $${expectedDollars} for ${snapshot.paygrade} with ${snapshot.yos || 0} YOS. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Contact finance office to verify pay table is correctly applied for your rank and time in service. This could be due to recent promotion not reflected in DJMS, or incorrect YOS calculation. Bring pay tables and service record.`,
    ref_url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/',
    delta_cents: delta
  };
}

