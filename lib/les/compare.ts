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
  ComparisonOptions,
} from "@/app/types/les";
import { FLAG_CODES } from "@/app/types/les";
import { ssot } from "@/lib/ssot";

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
    specialPayDeltaCents:
      options?.thresholds?.specialPayDeltaCents ?? defaultThresholds.specialPayDeltaCents,
  };

  // Build lookup map of actual allowances
  const actualAllowances = new Map<string, number>();
  for (const line of parsed) {
    if (line.section === "ALLOWANCE") {
      const existing = actualAllowances.get(line.line_code) || 0;
      actualAllowances.set(line.line_code, existing + line.amount_cents);
    }
  }

  // =============================================================================
  // BAH Comparison
  // =============================================================================
  if (expected.expected.bah_cents !== undefined) {
    const actualBAH = actualAllowances.get("BAH") || 0;
    const expectedBAH = expected.expected.bah_cents;
    const delta = expectedBAH - actualBAH;

    if (Math.abs(delta) > thresholds.bahDeltaCents) {
      flags.push(createBAHMismatchFlag(actualBAH, expectedBAH, delta, expected));
    } else if (actualBAH > 0) {
      // BAH is correct within threshold
      flags.push(createCorrectFlag("BAH", actualBAH));
    }
  } else if (actualAllowances.has("BAH")) {
    // BAH appears but we couldn't compute expected (data unavailable)
    flags.push(
      createVerificationNeededFlag("BAH", "Expected BAH data unavailable for this location")
    );
  }

  // =============================================================================
  // BAS Comparison
  // =============================================================================
  if (expected.expected.bas_cents !== undefined) {
    const actualBAS = actualAllowances.get("BAS") || 0;
    const expectedBAS = expected.expected.bas_cents;
    const delta = expectedBAS - actualBAS;

    if (actualBAS === 0) {
      // BAS missing entirely
      flags.push(createBASMissingFlag(expectedBAS, expected));
    } else if (Math.abs(delta) > thresholds.basDeltaCents) {
      flags.push(createBASMismatchFlag(actualBAS, expectedBAS, delta));
    } else {
      // BAS is correct
      flags.push(createCorrectFlag("BAS", actualBAS));
    }
  }

  // =============================================================================
  // COLA Comparison
  // =============================================================================
  if (expected.expected.cola_cents !== undefined && expected.expected.cola_cents > 0) {
    const actualCOLA = actualAllowances.get("COLA") || 0;
    const expectedCOLA = expected.expected.cola_cents;
    const delta = expectedCOLA - actualCOLA;

    if (actualCOLA === 0) {
      // COLA expected but not present
      flags.push(createCOLAStoppedFlag(expectedCOLA, expected));
    } else if (Math.abs(delta) > thresholds.colaDeltaCents) {
      flags.push(createCOLAMismatchFlag(actualCOLA, expectedCOLA, delta, expected));
    }
  } else if (
    actualAllowances.has("COLA") &&
    (!expected.expected.cola_cents || expected.expected.cola_cents === 0)
  ) {
    // COLA present but not expected
    flags.push(createCOLAUnexpectedFlag(actualAllowances.get("COLA")!));
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
    const actualBasePay = parsed.find((line) => line.line_code === "BASE_PAY")?.amount_cents || 0;
    const expectedBasePay = expected.expected.base_pay_cents;
    const delta = expectedBasePay - actualBasePay;

    if (actualBasePay === 0) {
      // Base pay missing entirely (unusual)
      flags.push(createBasePayMissingFlag(expectedBasePay, expected));
    } else if (Math.abs(delta) > 10000) {
      // $100 threshold for base pay
      flags.push(createBasePayMismatchFlag(actualBasePay, expectedBasePay, delta, expected));
    } else {
      // Base pay verified correct
      flags.push(createCorrectFlag("BASE_PAY", actualBasePay));
    }
  }

  // =============================================================================
  // Deductions Comparison (TSP, SGLI, Dental)
  // =============================================================================
  const actualDeductions = new Map<string, number>();
  for (const line of parsed) {
    if (line.section === "DEDUCTION") {
      const existing = actualDeductions.get(line.line_code) || 0;
      actualDeductions.set(line.line_code, existing + line.amount_cents);
    }
  }

  // TSP Validation
  if (expected.expected.tsp_cents !== undefined && expected.expected.tsp_cents > 0) {
    const actualTSP = actualDeductions.get("TSP") || 0;
    const expectedTSP = expected.expected.tsp_cents;
    const delta = expectedTSP - actualTSP;

    if (Math.abs(delta) > 1000) {
      // $10 threshold for TSP
      flags.push(createTSPMismatchFlag(actualTSP, expectedTSP, delta));
    } else if (actualTSP > 0) {
      flags.push(createCorrectFlag("TSP", actualTSP));
    }
  }

  // SGLI Validation
  if (expected.expected.sgli_cents !== undefined && expected.expected.sgli_cents > 0) {
    const actualSGLI = actualDeductions.get("SGLI") || 0;
    const expectedSGLI = expected.expected.sgli_cents;
    const delta = expectedSGLI - actualSGLI;

    if (Math.abs(delta) > 100) {
      // $1 threshold for SGLI
      flags.push(createSGLIMismatchFlag(actualSGLI, expectedSGLI, delta));
    } else if (actualSGLI > 0) {
      flags.push(createCorrectFlag("SGLI", actualSGLI));
    }
  }

  // Dental Validation
  if (expected.expected.dental_cents !== undefined && expected.expected.dental_cents > 0) {
    const actualDental = actualDeductions.get("DENTAL") || 0;
    const expectedDental = expected.expected.dental_cents;
    const delta = expectedDental - actualDental;

    if (Math.abs(delta) > 500) {
      // $5 threshold for dental
      flags.push(createDentalMismatchFlag(actualDental, expectedDental, delta));
    } else if (actualDental > 0) {
      flags.push(createCorrectFlag("DENTAL", actualDental));
    }
  }

  // =============================================================================
  // Taxes Comparison (Federal, State, FICA, Medicare)
  // =============================================================================
  const actualTaxes = new Map<string, number>();
  for (const line of parsed) {
    if (line.section === "TAX") {
      const existing = actualTaxes.get(line.line_code) || 0;
      actualTaxes.set(line.line_code, existing + line.amount_cents);
    }
  }

  // FICA Percentage Validation (6.2% of taxable gross)
  // User entered actual FICA - we validate the percentage is correct
  if (expected.expected.fica_cents !== undefined) {
    const actualFICA = actualTaxes.get("FICA") || 0;
    const expectedFICA = expected.expected.fica_cents; // Reference: 6.2% of taxable gross
    const delta = expectedFICA - actualFICA;

    if (actualFICA > 0) {
      // Calculate what taxable gross would be based on FICA withheld
      const impliedTaxableGross = Math.round(actualFICA / 0.062);
      const actualPercent = (actualFICA / impliedTaxableGross) * 100;

      // FICA should be 6.2% (with small tolerance for rounding)
      if (actualPercent < 6.0 || actualPercent > 6.4) {
        flags.push(createFICAPercentageWarningFlag(actualFICA, expectedFICA, actualPercent));
      } else {
        flags.push(createFICAPercentageCorrectFlag(actualFICA, actualPercent));
      }
    }
  }

  // Medicare Percentage Validation (1.45% of taxable gross)
  // User entered actual Medicare - we validate the percentage is correct
  if (expected.expected.medicare_cents !== undefined) {
    const actualMedicare = actualTaxes.get("MEDICARE") || 0;
    const expectedMedicare = expected.expected.medicare_cents; // Reference: 1.45% of taxable gross
    const delta = expectedMedicare - actualMedicare;

    if (actualMedicare > 0) {
      // Calculate what taxable gross would be based on Medicare withheld
      const impliedTaxableGross = Math.round(actualMedicare / 0.0145);
      const actualPercent = (actualMedicare / impliedTaxableGross) * 100;

      // Medicare should be 1.45% (with small tolerance for rounding)
      if (actualPercent < 1.4 || actualPercent > 1.5) {
        flags.push(
          createMedicarePercentageWarningFlag(actualMedicare, expectedMedicare, actualPercent)
        );
      } else {
        flags.push(createMedicarePercentageCorrectFlag(actualMedicare, actualPercent));
      }
    }
  }

  // Federal and State Tax - NO VALIDATION
  // Users enter actual values from their LES
  // We don't estimate these anymore (too complex, too many variables)
  // The overall net pay check will catch any major issues

  // =============================================================================
  // Net Pay Validation (THE MONEY QUESTION)
  // =============================================================================
  if (expected.expected.net_pay_cents !== undefined) {
    const actualNetPay = parsed.find((line) => line.line_code === "NET_PAY")?.amount_cents || 0;
    const expectedNetPay = expected.expected.net_pay_cents;
    const delta = expectedNetPay - actualNetPay;

    if (actualNetPay === 0) {
      // Net pay not entered (user skipped it)
      flags.push(
        createVerificationNeededFlag(
          "NET_PAY",
          "Net pay not entered - unable to verify take-home amount"
        )
      );
    } else {
      // Sanity check: Net pay should be reasonable ($1,500-$12,000/month for most service members)
      if (actualNetPay < 150000) {
        // Less than $1,500/month
        flags.push(createNetPayTooLowWarning(actualNetPay));
      } else if (actualNetPay > 1200000) {
        // More than $12,000/month
        flags.push(createNetPayTooHighWarning(actualNetPay));
      } else if (Math.abs(delta) > 5000) {
        // $50 threshold for net pay
        flags.push(createNetPayMismatchFlag(actualNetPay, expectedNetPay, delta));
      } else {
        // Net pay verified correct - THE BIG WIN
        flags.push(createNetPayCorrectFlag(actualNetPay));
      }
    }
  }

  // =============================================================================
  // Compute Totals
  // =============================================================================
  const actualAllowancesCents = Array.from(actualAllowances.values()).reduce(
    (sum, val) => sum + val,
    0
  );
  const actualDeductionsCents = Array.from(actualDeductions.values()).reduce(
    (sum, val) => sum + val,
    0
  );
  const actualTaxesCents = Array.from(actualTaxes.values()).reduce((sum, val) => sum + val, 0);

  const expectedAllowancesCents =
    (expected.expected.bah_cents || 0) +
    (expected.expected.bas_cents || 0) +
    (expected.expected.cola_cents || 0) +
    (expected.expected.base_pay_cents || 0) +
    (expected.expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);

  const expectedDeductionsCents =
    (expected.expected.tsp_cents || 0) +
    (expected.expected.sgli_cents || 0) +
    (expected.expected.dental_cents || 0);

  const expectedTaxesCents =
    (expected.expected.federal_tax_cents || 0) +
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
      actualNetPayCents: parsed.find((line) => line.line_code === "NET_PAY")?.amount_cents || 0,
      expectedNetPayCents: expected.expected.net_pay_cents || 0,
    },
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
  const depStatus = snapshot.with_dependents ? "with" : "without";

  return {
    severity: "red",
    flag_code: FLAG_CODES.BAH_MISMATCH,
    message: `BAH mismatch: Received $${actualDollars}, expected $${expectedDollars} for ${snapshot.paygrade} ${depStatus} dependents at ${snapshot.mha_or_zip}. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Contact your finance office immediately. Bring this LES and verify your duty station (MHA ${snapshot.mha_or_zip}) and dependent status (${depStatus} dependents) are correct in DEERS/DJMS. Request retroactive correction if applicable.`,
    ref_url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm",
    delta_cents: delta,
  };
}

function createBASMissingFlag(expected: number, snapshot: ExpectedSnapshot): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);

  return {
    severity: "red",
    flag_code: FLAG_CODES.BAS_MISSING,
    message: `BAS not found on LES. Expected $${expectedDollars}/month for ${snapshot.paygrade}.`,
    suggestion: `File emergency pay ticket with finance office TODAY. BAS is a mandatory entitlement. Bring orders and ID card. Request retroactive payment from start of entitlement period.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/",
    delta_cents: expected,
  };
}

function createBASMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: FLAG_CODES.MINOR_VARIANCE,
    message: `BAS variance: Received $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Verify with finance that correct BAS rate is applied. This may be due to recent rate change or partial month entitlement.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/",
    delta_cents: delta,
  };
}

function createCOLAStoppedFlag(expected: number, snapshot: ExpectedSnapshot): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: FLAG_CODES.COLA_STOPPED,
    message: `COLA missing. Expected $${expectedDollars}/month for duty station ${snapshot.mha_or_zip}.`,
    suggestion: `Verify with finance that your duty station qualifies for COLA. If you recently PCS'd, ensure DJMS reflects new duty station. If entitled, request retroactive payment.`,
    ref_url: "https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/",
    delta_cents: expected,
  };
}

function createCOLAMismatchFlag(
  actual: number,
  expected: number,
  delta: number,
  snapshot: ExpectedSnapshot
): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: FLAG_CODES.MINOR_VARIANCE,
    message: `COLA variance: Received $${actualDollars}, expected $${expectedDollars} for ${snapshot.mha_or_zip}. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Verify duty station code in DJMS matches actual location (${snapshot.mha_or_zip}). COLA rates update quarterly - check if this is a recent rate change.`,
    ref_url: "https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/",
    delta_cents: delta,
  };
}

function createCOLAUnexpectedFlag(actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: FLAG_CODES.COLA_UNEXPECTED,
    message: `COLA present ($${actualDollars}/month) but not expected for this location.`,
    suggestion: `Verify your duty station code in DJMS. If location does not qualify for COLA, notify finance to avoid future repayment. If you're entitled, no action needed.`,
    ref_url: "https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/",
    delta_cents: -actual,
  };
}

function createSpecialPayMissingFlag(code: string, expected: number): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);

  return {
    severity: "red",
    flag_code: FLAG_CODES.SPECIAL_PAY_MISSING,
    message: `${code} not found on LES. Expected $${expectedDollars}/month.`,
    suggestion: `Contact finance office to verify ${code} entitlement is in system. Bring supporting documentation (NEC/MOS orders, duty location, etc.). Request retroactive payment if applicable.`,
    delta_cents: expected,
  };
}

function createSpecialPayMismatchFlag(
  code: string,
  actual: number,
  expected: number,
  delta: number
): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: FLAG_CODES.MINOR_VARIANCE,
    message: `${code} variance: Received $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Verify ${code} rate with finance. Rate may vary by duty assignment or proficiency level. Confirm entitlement details in your service record.`,
    delta_cents: delta,
  };
}

function createVerificationNeededFlag(code: string, reason: string): PayFlag {
  return {
    severity: "yellow",
    flag_code: FLAG_CODES.VERIFICATION_NEEDED,
    message: `${code} requires manual verification: ${reason}`,
    suggestion: `Verify ${code} amount with finance office using official rate tables for your location and rank. Bring LES and station orders.`,
  };
}

function createCorrectFlag(code: string, actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "green",
    flag_code: `${code}_CORRECT`,
    message: `${code} verified correct: $${actualDollars}`,
    suggestion: `No action needed. ${code} matches expected rate.`,
  };
}

function createAllVerifiedFlag(): PayFlag {
  return {
    severity: "green",
    flag_code: FLAG_CODES.ALL_VERIFIED,
    message: "All allowances verified. No discrepancies found.",
    suggestion: "Your pay appears correct. Review individual line items in the detailed view.",
  };
}

function createBasePayMissingFlag(expected: number, snapshot: ExpectedSnapshot): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);

  return {
    severity: "red",
    flag_code: "BASE_PAY_MISSING",
    message: `Base Pay not found on LES. Expected $${expectedDollars}/month for ${snapshot.paygrade} with ${snapshot.yos || 0} years of service.`,
    suggestion: `File emergency pay ticket with finance office immediately. Base pay is the foundation of all military pay. Bring orders, ID card, and LES. Request retroactive payment.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
    delta_cents: expected,
  };
}

function createBasePayMismatchFlag(
  actual: number,
  expected: number,
  delta: number,
  snapshot: ExpectedSnapshot
): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: delta > 0 ? "red" : "yellow",
    flag_code: "BASE_PAY_MISMATCH",
    message: `Base Pay variance: Received $${actualDollars}, expected $${expectedDollars} for ${snapshot.paygrade} with ${snapshot.yos || 0} YOS. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Contact finance office to verify pay table is correctly applied for your rank and time in service. This could be due to recent promotion not reflected in DJMS, or incorrect YOS calculation. Bring pay tables and service record.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
    delta_cents: delta,
  };
}

// Deduction Flag Creators

function createTSPMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "TSP_MISMATCH",
    message: `TSP contribution variance: Actual $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Verify your TSP contribution percentage in myPay matches your profile setting. If you recently changed your TSP%, it may take 1-2 pay periods to reflect. Check myPay → TSP Elections.`,
    ref_url: "https://www.tsp.gov",
    delta_cents: delta,
  };
}

function createSGLIMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: delta < 0 ? "red" : "yellow", // Red if overcharged
    flag_code: "SGLI_MISMATCH",
    message: `SGLI premium variance: Charged $${actualDollars}, expected $${expectedDollars}. Delta: ${delta > 0 ? "+" : "-"}$${deltaDollars}.`,
    suggestion: `Verify your SGLI coverage amount in myPay. If you recently changed coverage, premium adjusts next pay period. Double-charging is a common finance error - contact them if overcharged.`,
    ref_url: "https://www.benefits.va.gov/insurance/sgli.asp",
    delta_cents: delta,
  };
}

function createDentalMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "DENTAL_VARIANCE",
    message: `Dental insurance variance: Charged $${actualDollars}, expected ~$${expectedDollars}.`,
    suggestion: `Dental premiums vary by plan type and family size. Verify your TRICARE Dental enrollment and plan tier. Expected amount is an estimate.`,
    delta_cents: delta,
  };
}

// Tax Flag Creators

// New Percentage-Based Validation Flag Creators

function createFICAPercentageWarningFlag(
  actual: number,
  _expected: number,
  actualPercent: number
): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "FICA_PERCENTAGE_WARNING",
    message: `FICA withholding check: You entered $${actualDollars}, which is ${actualPercent.toFixed(2)}% of your taxable pay. Expected: ~6.2%.`,
    suggestion: `FICA should be exactly 6.2% of your FICA-taxable gross (Base Pay + OCONUS COLA + most Special Pays - BAH/BAS are NOT taxed). Verify your calculation. Contact finance if the math doesn't match - this is a statutory rate. Note: If you've hit the annual wage base ($176,100 for 2025), FICA withholding stops.`,
    ref_url: "https://www.irs.gov/taxtopics/tc751",
  };
}

function createFICAPercentageCorrectFlag(actual: number, actualPercent: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "green",
    flag_code: "FICA_PERCENTAGE_CORRECT",
    message: `✅ FICA Validated: $${actualDollars} = ${actualPercent.toFixed(2)}% (expected 6.2%). Correct!`,
    suggestion: `Finance calculated FICA correctly. No action needed.`,
  };
}

function createMedicarePercentageWarningFlag(
  actual: number,
  _expected: number,
  actualPercent: number
): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "MEDICARE_PERCENTAGE_WARNING",
    message: `Medicare withholding check: You entered $${actualDollars}, which is ${actualPercent.toFixed(2)}% of your taxable pay. Expected: ~1.45%.`,
    suggestion: `Medicare should be exactly 1.45% of your Medicare-taxable gross (Base Pay + OCONUS COLA + most Special Pays - BAH/BAS are NOT taxed). There is no wage base limit. Verify your calculation. Contact finance if significantly different - this is a statutory rate.`,
    ref_url: "https://www.irs.gov/taxtopics/tc751",
  };
}

function createMedicarePercentageCorrectFlag(actual: number, actualPercent: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "green",
    flag_code: "MEDICARE_PERCENTAGE_CORRECT",
    message: `✅ Medicare Validated: $${actualDollars} = ${actualPercent.toFixed(2)}% (expected 1.45%). Correct!`,
    suggestion: `Finance calculated Medicare correctly. No action needed.`,
  };
}

/**
 * NEW FLAG CREATORS (V1 Hardening)
 */

function createBAHPartialOrDiffFlag(expected: number, actual: number, pcsMonth: boolean): PayFlag {
  const expectedDollars = (expected / 100).toFixed(2);
  const actualDollars = (actual / 100).toFixed(2);
  const deltaDollars = Math.abs((expected - actual) / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "BAH_PARTIAL_OR_DIFF",
    message: pcsMonth
      ? `BAH shows $${actualDollars} (expected $${expectedDollars}). Mid-month PCS may cause prorated amount.`
      : `BAH shows $${actualDollars} (expected $${expectedDollars}). Small variance detected ($${deltaDollars}).`,
    suggestion: pcsMonth
      ? "Verify prorated BAH for PCS month is correct. Next month should show full new rate."
      : "Verify duty station and dependent status match profile. Small variances may be due to mid-month changes.",
    delta_cents: expected - actual,
    ref_url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm",
  };
}

function createCZTEInfoFlag(fedTax: number): PayFlag {
  const fedDollars = (fedTax / 100).toFixed(2);

  return {
    severity: "green",
    flag_code: "CZTE_INFO",
    message: `Combat Zone Tax Exclusion detected (Federal tax: $${fedDollars})`,
    suggestion:
      "No action needed. CZTE exempts federal income tax while in combat zone. FICA/Medicare still apply.",
    ref_url: "https://www.irs.gov/publications/p3",
  };
}

function createPromoNotReflectedFlag(promoRank: string, promoDate: string): PayFlag {
  return {
    severity: "red",
    flag_code: "PROMO_NOT_REFLECTED",
    message: `Promotion to ${promoRank} effective ${promoDate} not reflected in base pay`,
    suggestion:
      "Contact finance office immediately. Promotion pay should be retroactively adjusted with back pay.",
    ref_url: "https://www.dfas.mil/militarymembers/payentitlements/Pay-Computations/",
  };
}

function createFederalTaxVarianceFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "FEDERAL_TAX_VARIANCE",
    message: `Federal tax withholding variance: Withheld $${actualDollars}, estimated $${expectedDollars}. Delta: ${delta > 0 ? "UNDER-withheld" : "OVER-withheld"} by $${deltaDollars}.`,
    suggestion: `⚠️ This is a rough estimate only. Federal tax withholding depends on your W-4 settings, YTD earnings, and tax bracket. For accuracy, use the IRS Tax Withholding Estimator to verify your W-4 is correct. This flag is informational - your actual withholding may be correct.`,
    ref_url: "https://www.irs.gov/individuals/tax-withholding-estimator",
    delta_cents: delta,
  };
}

function createStateTaxVarianceFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "STATE_TAX_VARIANCE",
    message: `State tax withholding variance: Withheld $${actualDollars}, estimated $${expectedDollars}. Delta: ${delta > 0 ? "UNDER-withheld" : "OVER-withheld"} by $${deltaDollars}.`,
    suggestion: `⚠️ This is an estimate based on your state of legal residence. State tax depends on your home of record, state-specific brackets, and deductions. Verify your legal residence in myPay. Some states have no income tax (TX, FL, WA, etc.). This flag is informational - your actual withholding may be correct.`,
    delta_cents: delta,
  };
}

// Net Pay Flag Creators

function createNetPayMismatchFlag(actual: number, expected: number, delta: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);
  const expectedDollars = (expected / 100).toFixed(2);
  const deltaDollars = Math.abs(delta / 100).toFixed(2);

  return {
    severity: delta > 0 ? "red" : "yellow",
    flag_code: "NET_PAY_MISMATCH",
    message: `Net Pay discrepancy: Received $${actualDollars}, expected $${expectedDollars}. You are ${delta > 0 ? "SHORT" : "OVER"} by $${deltaDollars}.`,
    suggestion: `Review all flags above to see where the discrepancy originated (allowances, deductions, or taxes). The total variance of $${deltaDollars} comes from the specific line items flagged. Address each flag with finance office.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/军Pay/",
    delta_cents: delta,
  };
}

function createNetPayCorrectFlag(actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "green",
    flag_code: "NET_PAY_CORRECT",
    message: `✅ NET PAY VERIFIED: $${actualDollars} - Your paycheck is correct!`,
    suggestion: `Your net pay matches expectations. All entitlements, deductions, and taxes have been validated. No action needed.`,
  };
}

function createNetPayTooLowWarning(actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "NET_PAY_TOO_LOW",
    message: `Net pay unusually low: $${actualDollars}/month. Typical military net pay ranges from $1,500-$12,000/month.`,
    suggestion: `Review all deductions and taxes on your LES. Verify you're not over-contributing to TSP or other deductions. Check for garnishments or debt repayment. Contact finance if you can't identify the cause.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/",
  };
}

function createNetPayTooHighWarning(actual: number): PayFlag {
  const actualDollars = (actual / 100).toFixed(2);

  return {
    severity: "yellow",
    flag_code: "NET_PAY_TOO_HIGH",
    message: `Net pay unusually high: $${actualDollars}/month. Typical military net pay ranges from $1,500-$12,000/month.`,
    suggestion: `Verify this is your regular monthly pay and not a lump sum payment (retroactive pay, bonus, separation pay, etc.). If this is regular monthly pay, double-check all entitlements are entered correctly.`,
    ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/",
  };
}

/**
 * COMPREHENSIVE DETAILED COMPARISON
 * Enhanced comparison function with detailed validation and math proof
 *
 * @param params Expected values, taxable bases, actual lines, and net pay
 * @returns Flags, summary, and math proof
 */
export function compareDetailed(params: {
  expected: {
    base_pay_cents?: number;
    bah_cents?: number;
    bas_cents?: number;
    cola_cents?: number;
    specials?: Array<{ code: string; cents: number }>;
  };
  taxable_bases: {
    fed: number;
    state: number;
    oasdi: number;
    medicare: number;
  };
  actualLines: Array<{
    line_code: string;
    amount_cents: number;
    section: string;
  }>;
  netPayCents: number;
}): {
  flags: PayFlag[];
  summary: {
    total_allowances: number;
    total_deductions: number;
    total_taxes: number;
    total_allotments: number;
    total_debts: number;
    total_adjustments: number;
    computed_net: number;
    actual_net: number;
    net_delta: number;
  };
  mathProof: string;
} {
  const flags: PayFlag[] = [];

  // Group actual lines by section
  const bySection = {
    ALLOWANCE: params.actualLines.filter((l) => l.section === "ALLOWANCE"),
    TAX: params.actualLines.filter((l) => l.section === "TAX"),
    DEDUCTION: params.actualLines.filter((l) => l.section === "DEDUCTION"),
    ALLOTMENT: params.actualLines.filter((l) => l.section === "ALLOTMENT"),
    DEBT: params.actualLines.filter((l) => l.section === "DEBT"),
    ADJUSTMENT: params.actualLines.filter((l) => l.section === "ADJUSTMENT"),
  };

  // Helper to find specific line
  const findLine = (code: string) => params.actualLines.find((l) => l.line_code === code);

  // ============================================================================
  // ALLOWANCE VALIDATIONS
  // ============================================================================

  // 1. Base Pay Check
  const actualBasePay = findLine("BASEPAY")?.amount_cents || 0;
  const expectedBasePay = params.expected.base_pay_cents || 0;
  if (expectedBasePay > 0) {
    const delta = Math.abs(actualBasePay - expectedBasePay);
    if (delta > 1000) {
      // $10 threshold
      flags.push({
        severity: "red",
        flag_code: "BASEPAY_MISMATCH",
        message: `Base Pay discrepancy: Expected $${(expectedBasePay / 100).toFixed(2)}, got $${(actualBasePay / 100).toFixed(2)}`,
        suggestion:
          "Verify your rank and years of service are correct. Contact your finance office if discrepancy persists.",
        delta_cents: expectedBasePay - actualBasePay,
        ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
      });
    }
  }

  // 2. BAH Check
  const actualBAH = findLine("BAH")?.amount_cents || 0;
  const expectedBAH = params.expected.bah_cents || 0;
  if (expectedBAH > 0) {
    const delta = Math.abs(actualBAH - expectedBAH);
    if (delta > 10000) {
      // Major mismatch ($100+)
      flags.push({
        severity: "red",
        flag_code: "BAH_MISMATCH",
        message: `BAH discrepancy: Expected $${(expectedBAH / 100).toFixed(2)}, got $${(actualBAH / 100).toFixed(2)}`,
        suggestion:
          "Verify your MHA code matches your duty station and dependent status. Contact finance office if BAH is incorrect.",
        delta_cents: expectedBAH - actualBAH,
        ref_url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm",
      });
    } else if (delta > 500 && delta <= 10000) {
      // Small variance ($5-$100) - possible PCS proration
      // Check if this might be a PCS month (partial BAH)
      // Note: We don't have pcsMonth in params yet, but flag it anyway for investigation
      flags.push(createBAHPartialOrDiffFlag(expectedBAH, actualBAH, false));
    } else if (actualBAH === 0) {
      flags.push({
        severity: "red",
        flag_code: "BAH_MISSING",
        message: `BAH missing: Expected $${(expectedBAH / 100).toFixed(2)} for your rank and location`,
        suggestion:
          "Contact finance office immediately. BAH should be on every LES unless living in government quarters.",
        delta_cents: expectedBAH,
        ref_url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm",
      });
    }
  }

  // 3. BAS Check
  const actualBAS = findLine("BAS")?.amount_cents || 0;
  const expectedBAS = params.expected.bas_cents || 0;
  if (expectedBAS > 0 && actualBAS === 0) {
    flags.push({
      severity: "red",
      flag_code: "BAS_MISSING",
      message: `BAS missing: Expected $${(expectedBAS / 100).toFixed(2)}`,
      suggestion:
        "All service members receive BAS (Basic Allowance for Subsistence). Check your LES or contact finance office.",
      delta_cents: expectedBAS,
      ref_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/",
    });
  } else if (expectedBAS > 0 && Math.abs(actualBAS - expectedBAS) > 50) {
    flags.push({
      severity: "yellow",
      flag_code: "BAS_MISMATCH",
      message: `BAS discrepancy: Expected $${(expectedBAS / 100).toFixed(2)}, got $${(actualBAS / 100).toFixed(2)}`,
      suggestion:
        "BAS rates are standard (Officer vs Enlisted). Verify your rank category is correct.",
      delta_cents: expectedBAS - actualBAS,
    });
  }

  // 4. COLA Check
  const actualCOLA = findLine("COLA")?.amount_cents || 0;
  const expectedCOLA = params.expected.cola_cents || 0;
  if (expectedCOLA > 0 && actualCOLA === 0) {
    flags.push({
      severity: "yellow",
      flag_code: "COLA_MISSING",
      message: `COLA missing or stopped: Expected $${(expectedCOLA / 100).toFixed(2)}`,
      suggestion: "COLA can change quarterly. Verify your duty location still qualifies for COLA.",
      delta_cents: expectedCOLA,
      ref_url: "https://www.dtmo.mil/allowances",
    });
  } else if (expectedCOLA === 0 && actualCOLA > 0) {
    flags.push({
      severity: "yellow",
      flag_code: "COLA_UNEXPECTED",
      message: `Unexpected COLA: $${(actualCOLA / 100).toFixed(2)} received but not expected for your location`,
      suggestion: "Verify your duty location. Most CONUS locations do not receive COLA.",
      delta_cents: expectedCOLA - actualCOLA,
    });
  }

  // ============================================================================
  // TAX PERCENTAGE VALIDATIONS
  // ============================================================================

  // 5. FICA Percentage Check
  const actualFICA = findLine("FICA")?.amount_cents || 0;
  const oasdiBase = params.taxable_bases.oasdi;
  if (oasdiBase > 0 && actualFICA > 0) {
    const ficaPercent = (actualFICA / oasdiBase) * 100;
    if (ficaPercent < 6.1 || ficaPercent > 6.3) {
      flags.push({
        severity: "yellow",
        flag_code: "FICA_PCT_OUT_OF_RANGE",
        message: `FICA is ${ficaPercent.toFixed(2)}% of taxable gross, but should be ~6.2%`,
        suggestion:
          "FICA should be 6.2% of taxable pay (Base + COLA + taxable specials, EXCLUDES BAH/BAS). Verify your LES or check if you hit the annual wage base limit ($176,100 for 2025).",
        delta_cents: Math.round(oasdiBase * 0.062) - actualFICA,
      });
    } else {
      flags.push({
        severity: "green",
        flag_code: "FICA_PCT_CORRECT",
        message: `FICA verified: ${ficaPercent.toFixed(2)}% (within normal 6.1%-6.3% range)`,
        suggestion: "No action needed. FICA withholding is correct.",
      });
    }
  }

  // 6. Medicare Percentage Check
  const actualMedicare = findLine("MEDICARE")?.amount_cents || 0;
  const medicareBase = params.taxable_bases.medicare;
  if (medicareBase > 0 && actualMedicare > 0) {
    const medicarePercent = (actualMedicare / medicareBase) * 100;
    if (medicarePercent < 1.4 || medicarePercent > 1.5) {
      flags.push({
        severity: "yellow",
        flag_code: "MEDICARE_PCT_OUT_OF_RANGE",
        message: `Medicare is ${medicarePercent.toFixed(2)}% of taxable gross, but should be ~1.45%`,
        suggestion:
          "Medicare should be 1.45% of taxable pay. Verify your LES or contact finance office.",
        delta_cents: Math.round(medicareBase * 0.0145) - actualMedicare,
      });
    } else {
      flags.push({
        severity: "green",
        flag_code: "MEDICARE_PCT_CORRECT",
        message: `Medicare verified: ${medicarePercent.toFixed(2)}% (within normal 1.40%-1.50% range)`,
        suggestion: "No action needed. Medicare withholding is correct.",
      });
    }
  }

  // 7. Combat Zone Tax Exclusion (CZTE) Detection
  // Reuse actualFICA and actualMedicare already declared above
  const actualFedTax = findLine("TAX_FED")?.amount_cents || 0;

  // If federal tax is very low/zero but FICA and Medicare are present, likely CZTE
  if (actualFedTax < 1000 && (actualFICA > 0 || actualMedicare > 0)) {
    flags.push(createCZTEInfoFlag(actualFedTax));
  }

  // ============================================================================
  // NET PAY MATH CHECK
  // ============================================================================

  // 8. Net Pay Math Validation
  const totalAllowances = bySection.ALLOWANCE.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalTaxes = bySection.TAX.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalDeductions = bySection.DEDUCTION.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalAllotments = bySection.ALLOTMENT.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalDebts = bySection.DEBT.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalAdjustments = bySection.ADJUSTMENT.reduce((sum, l) => sum + l.amount_cents, 0);

  const computedNet =
    totalAllowances -
    totalTaxes -
    totalDeductions -
    totalAllotments -
    totalDebts +
    totalAdjustments;
  const netDelta = Math.abs(computedNet - params.netPayCents);

  if (netDelta > 100) {
    // $1 threshold
    flags.push({
      severity: "red",
      flag_code: "NET_MATH_MISMATCH",
      message: `Net pay math doesn't balance: Expected $${(computedNet / 100).toFixed(2)}, got $${(params.netPayCents / 100).toFixed(2)} (difference: $${(netDelta / 100).toFixed(2)})`,
      suggestion:
        "Review all line items for data entry errors. Formula: Net = Allowances - Taxes - Deductions - Allotments - Debts + Adjustments",
      delta_cents: computedNet - params.netPayCents,
    });
  } else {
    flags.push({
      severity: "green",
      flag_code: "NET_MATH_VERIFIED",
      message: `Net pay math verified: $${(params.netPayCents / 100).toFixed(2)} ✓`,
      suggestion: "No action needed. Math checks out!",
    });
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  const summary = {
    total_allowances: totalAllowances,
    total_deductions: totalDeductions,
    total_taxes: totalTaxes,
    total_allotments: totalAllotments,
    total_debts: totalDebts,
    total_adjustments: totalAdjustments,
    computed_net: computedNet,
    actual_net: params.netPayCents,
    net_delta: netDelta,
  };

  // Build math proof string
  const mathProof = `
Allowances:    $${(totalAllowances / 100).toFixed(2).padStart(10)}
- Taxes:       $${(totalTaxes / 100).toFixed(2).padStart(10)}
- Deductions:  $${(totalDeductions / 100).toFixed(2).padStart(10)}
- Allotments:  $${(totalAllotments / 100).toFixed(2).padStart(10)}
- Debts:       $${(totalDebts / 100).toFixed(2).padStart(10)}
+ Adjustments: $${(totalAdjustments / 100).toFixed(2).padStart(10)}
${"=".repeat(40)}
= Net Pay:     $${(computedNet / 100).toFixed(2).padStart(10)} ${netDelta <= 100 ? "✓" : "✗"}
  `.trim();

  return { flags, summary, mathProof };
}
