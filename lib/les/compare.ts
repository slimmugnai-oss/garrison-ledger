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
  // Deductions Comparison (TSP, SGLI, Dental)
  // =============================================================================
  const actualDeductions = new Map<string, number>();
  for (const line of parsed) {
    if (line.section === 'DEDUCTION') {
      const existing = actualDeductions.get(line.line_code) || 0;
      actualDeductions.set(line.line_code, existing + line.amount_cents);
    }
  }
  
  // TSP Validation
  if (expected.expected.tsp_cents !== undefined && expected.expected.tsp_cents > 0) {
    const actualTSP = actualDeductions.get('TSP') || 0;
    const expectedTSP = expected.expected.tsp_cents;
    const delta = expectedTSP - actualTSP;
    
    if (Math.abs(delta) > 1000) { // $10 threshold for TSP
      flags.push(createTSPMismatchFlag(actualTSP, expectedTSP, delta));
    } else if (actualTSP > 0) {
      flags.push(createCorrectFlag('TSP', actualTSP));
    }
  }
  
  // SGLI Validation
  if (expected.expected.sgli_cents !== undefined && expected.expected.sgli_cents > 0) {
    const actualSGLI = actualDeductions.get('SGLI') || 0;
    const expectedSGLI = expected.expected.sgli_cents;
    const delta = expectedSGLI - actualSGLI;
    
    if (Math.abs(delta) > 100) { // $1 threshold for SGLI
      flags.push(createSGLIMismatchFlag(actualSGLI, expectedSGLI, delta));
    } else if (actualSGLI > 0) {
      flags.push(createCorrectFlag('SGLI', actualSGLI));
    }
  }
  
  // Dental Validation
  if (expected.expected.dental_cents !== undefined && expected.expected.dental_cents > 0) {
    const actualDental = actualDeductions.get('DENTAL') || 0;
    const expectedDental = expected.expected.dental_cents;
    const delta = expectedDental - actualDental;
    
    if (Math.abs(delta) > 500) { // $5 threshold for dental
      flags.push(createDentalMismatchFlag(actualDental, expectedDental, delta));
    } else if (actualDental > 0) {
      flags.push(createCorrectFlag('DENTAL', actualDental));
    }
  }
  
  // =============================================================================
  // Taxes Comparison (Federal, State, FICA, Medicare)
  // =============================================================================
  const actualTaxes = new Map<string, number>();
  for (const line of parsed) {
    if (line.section === 'TAX') {
      const existing = actualTaxes.get(line.line_code) || 0;
      actualTaxes.set(line.line_code, existing + line.amount_cents);
    }
  }
  
  // FICA Validation (exact - 6.2%)
  if (expected.expected.fica_cents !== undefined) {
    const actualFICA = actualTaxes.get('FICA') || 0;
    const expectedFICA = expected.expected.fica_cents;
    const delta = expectedFICA - actualFICA;
    
    if (Math.abs(delta) > 500) { // $5 threshold
      flags.push(createFICAMismatchFlag(actualFICA, expectedFICA, delta));
    } else if (actualFICA > 0) {
      flags.push(createCorrectFlag('FICA', actualFICA));
    }
  }
  
  // Medicare Validation (exact - 1.45%)
  if (expected.expected.medicare_cents !== undefined) {
    const actualMedicare = actualTaxes.get('MEDICARE') || 0;
    const expectedMedicare = expected.expected.medicare_cents;
    const delta = expectedMedicare - actualMedicare;
    
    if (Math.abs(delta) > 200) { // $2 threshold
      flags.push(createMedicareMismatchFlag(actualMedicare, expectedMedicare, delta));
    } else if (actualMedicare > 0) {
      flags.push(createCorrectFlag('MEDICARE', actualMedicare));
    }
  }
  
  // Federal Tax Validation (estimate - user should override)
  if (expected.expected.federal_tax_cents !== undefined && expected.expected.federal_tax_cents > 0) {
    const actualFederal = actualTaxes.get('FITW') || 0;
    const expectedFederal = expected.expected.federal_tax_cents;
    const delta = expectedFederal - actualFederal;
    
    // Higher threshold for federal tax (it's an estimate)
    if (Math.abs(delta) > 5000) { // $50 threshold
      flags.push(createFederalTaxVarianceFlag(actualFederal, expectedFederal, delta));
    }
  }
  
  // State Tax Validation
  if (expected.expected.state_tax_cents !== undefined) {
    const actualState = actualTaxes.get('SITW') || 0;
    const expectedState = expected.expected.state_tax_cents;
    const delta = expectedState - actualState;
    
    if (Math.abs(delta) > 2000) { // $20 threshold
      flags.push(createStateTaxVarianceFlag(actualState, expectedState, delta));
    } else if (expectedState === 0 && actualState === 0) {
      // No state tax expected and none withheld (correct for no-tax states)
      flags.push(createCorrectFlag('STATE_TAX', 0));
    }
  }
  
  // =============================================================================
  // Net Pay Validation (THE MONEY QUESTION)
  // =============================================================================
  if (expected.expected.net_pay_cents !== undefined) {
    const actualNetPay = parsed.find(line => line.line_code === 'NET_PAY')?.amount_cents || 0;
    const expectedNetPay = expected.expected.net_pay_cents;
    const delta = expectedNetPay - actualNetPay;
    
    if (actualNetPay === 0) {
      // Net pay not entered (user skipped it)
      flags.push(createVerificationNeededFlag('NET_PAY', 'Net pay not entered - unable to verify take-home amount'));
    } else if (Math.abs(delta) > 5000) { // $50 threshold for net pay
      flags.push(createNetPayMismatchFlag(actualNetPay, expectedNetPay, delta));
    } else {
      // Net pay verified correct - THE BIG WIN
      flags.push(createNetPayCorrectFlag(actualNetPay));
    }
  }
  
  // =============================================================================
  // Compute Totals
  // =============================================================================
  const actualAllowancesCents = Array.from(actualAllowances.values()).reduce((sum, val) => sum + val, 0);
  const actualDeductionsCents = Array.from(actualDeductions.values()).reduce((sum, val) => sum + val, 0);
  const actualTaxesCents = Array.from(actualTaxes.values()).reduce((sum, val) => sum + val, 0);
  
  const expectedAllowancesCents = (expected.expected.bah_cents || 0) +
                                   (expected.expected.bas_cents || 0) +
                                   (expected.expected.cola_cents || 0) +
                                   (expected.expected.base_pay_cents || 0) +
                                   (expected.expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);
  
  const expectedDeductionsCents = (expected.expected.tsp_cents || 0) +
                                   (expected.expected.sgli_cents || 0) +
                                   (expected.expected.dental_cents || 0);
  
  const expectedTaxesCents = (expected.expected.federal_tax_cents || 0) +
                              (expected.expected.state_tax_cents || 0) +
                              (expected.expected.fica_cents || 0) +
                              (expected.expected.medicare_cents || 0);
  
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
      deltaCents,
      actualDeductionsCents,
      expectedDeductionsCents,
      actualTaxesCents,
      expectedTaxesCents,
      actualNetPayCents: parsed.find(line => line.line_code === 'NET_PAY')?.amount_cents || 0,
      expectedNetPayCents: expected.expected.net_pay_cents || 0
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

// Deduction Flag Creators

function createTSPMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: 'TSP_MISMATCH',
    message: `TSP contribution variance: Actual $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Verify your TSP contribution percentage in myPay matches your profile setting. If you recently changed your TSP%, it may take 1-2 pay periods to reflect. Check myPay → TSP Elections.`,
    ref_url: 'https://www.tsp.gov',
    delta_cents: delta
  };
}

function createSGLIMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: delta < 0 ? 'red' : 'yellow', // Red if overcharged
    flag_code: 'SGLI_MISMATCH',
    message: `SGLI premium variance: Charged $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Verify your SGLI coverage amount in myPay. If you recently changed coverage, premium adjusts next pay period. Double-charging is a common finance error - contact them if overcharged.`,
    ref_url: 'https://www.benefits.va.gov/insurance/sgli.asp',
    delta_cents: delta
  };
}

function createDentalMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: 'DENTAL_VARIANCE',
    message: `Dental insurance variance: Charged $${actualDollars}, expected ~$${expectedDollars}.`,
    suggestion: `Dental premiums vary by plan type and family size. Verify your TRICARE Dental enrollment and plan tier. Expected amount is an estimate.`,
    delta_cents: delta
  };
}

// Tax Flag Creators

function createFICAMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: delta < 0 ? 'red' : 'yellow',
    flag_code: 'FICA_MISMATCH',
    message: `FICA (Social Security) tax variance: Withheld $${actualDollars}, expected $${expectedDollars} (6.2% of gross). Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `FICA should be exactly 6.2% of your gross pay (up to the annual wage base). Contact finance if significantly different - this is a statutory rate with no variation.`,
    ref_url: 'https://www.irs.gov/taxtopics/tc751',
    delta_cents: delta
  };
}

function createMedicareMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: delta < 0 ? 'red' : 'yellow',
    flag_code: 'MEDICARE_MISMATCH',
    message: `Medicare tax variance: Withheld $${actualDollars}, expected $${expectedDollars} (1.45% of gross). Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Medicare should be exactly 1.45% of your gross pay with no exceptions. Contact finance if different - this is a statutory rate.`,
    ref_url: 'https://www.irs.gov/taxtopics/tc751',
    delta_cents: delta
  };
}

function createFederalTaxVarianceFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: 'FEDERAL_TAX_VARIANCE',
    message: `Federal tax withholding variance: Withheld $${actualDollars}, estimated $${expectedDollars}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `Federal tax withholding depends on your W-4 settings and year-to-date earnings. This is an estimate - verify your W-4 elections in myPay match your intentions. Adjust if needed.`,
    ref_url: 'https://www.irs.gov/individuals/tax-withholding-estimator',
    delta_cents: delta
  };
}

function createStateTaxVarianceFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: 'yellow',
    flag_code: 'STATE_TAX_VARIANCE',
    message: `State tax withholding variance: Withheld $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? '+' : '-'}$${deltaDollars}.`,
    suggestion: `State tax depends on your state of legal residence (home of record) and state-specific rules. Verify your residence in myPay matches your actual home of record.`,
    delta_cents: delta
  };
}

// Net Pay Flag Creators

function createNetPayMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);
  
  return {
    severity: delta > 0 ? 'red' : 'yellow',
    flag_code: 'NET_PAY_MISMATCH',
    message: `Net Pay discrepancy: Received $${actualDollars}, expected $${expectedDollars}. You are ${delta > 0 ? 'SHORT' : 'OVER'} by $${deltaDollars}.`,
    suggestion: `Review all flags above to see where the discrepancy originated (allowances, deductions, or taxes). The total variance of $${deltaDollars} comes from the specific line items flagged. Address each flag with finance office.`,
    ref_url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/军Pay/',
    delta_cents: delta
  };
}

function createNetPayCorrectFlag(actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  
  return {
    severity: 'green',
    flag_code: 'NET_PAY_CORRECT',
    message: `✅ NET PAY VERIFIED: $${actualDollars} - Your paycheck is correct!`,
    suggestion: `Your net pay matches expectations. All entitlements, deductions, and taxes have been validated. No action needed.`
  };
}

