/**
 * GCC PLANNING ESTIMATOR
 *
 * IMPORTANT: These are PLANNING PLACEHOLDERS only, not official DP3/GHC rates!
 *
 * Rates are per CWT (hundred-weight) for linehaul ONLY.
 * Does NOT include OLF/DLF, fuel, SIT, packing, shuttle, or peak adjustments.
 * Results can be ±50% vs actual GCC from my.move.mil.
 *
 * Data confidence: 70% (per domain expert)
 * Last updated: October 28, 2025
 *
 * DO NOT use for financial decisions - get official GCC from my.move.mil
 */

export interface GCCEstimate {
  linehaulLow: number;
  linehaulHigh: number;
  adjustedLow: number;
  adjustedHigh: number;
  midpoint: number;
  breakdown: {
    cwt: number;
    distanceBand: string;
    ratePerCWTLow: number;
    ratePerCWTHigh: number;
    fuelMultiplier: number;
    peakMultiplier: number;
    shortHaulMultiplier: number;
  };
  disclaimers: string[];
  confidence: number;
}

/**
 * Distance-based linehaul rates (per CWT, not per mile!)
 * Source: Industry estimates for planning only
 */
const DISTANCE_BANDS = [
  {
    minMiles: 0,
    maxMiles: 500,
    bandName: "0-500 miles",
    ratePerCWTLow: 180, // $180/cwt
    ratePerCWTHigh: 260, // $260/cwt
  },
  {
    minMiles: 501,
    maxMiles: 800,
    bandName: "501-800 miles (short-haul threshold)",
    ratePerCWTLow: 140,
    ratePerCWTHigh: 200,
  },
  {
    minMiles: 801,
    maxMiles: 1500,
    bandName: "801-1,500 miles",
    ratePerCWTLow: 110,
    ratePerCWTHigh: 160,
  },
  {
    minMiles: 1501,
    maxMiles: 2500,
    bandName: "1,501-2,500 miles",
    ratePerCWTLow: 90,
    ratePerCWTHigh: 130,
  },
  {
    minMiles: 2501,
    maxMiles: 3500,
    bandName: "2,501-3,500 miles",
    ratePerCWTLow: 80,
    ratePerCWTHigh: 120,
  },
  {
    minMiles: 3501,
    maxMiles: 999999,
    bandName: "3,501+ miles",
    ratePerCWTLow: 70,
    ratePerCWTHigh: 110,
  },
] as const;

/**
 * Adjustment factors (multiply linehaul, don't add)
 */
const ADJUSTMENTS = {
  fuel: {
    low: 1.12, // +12%
    mid: 1.18, // +18% (default)
    high: 1.22, // +22%
  },
  peakSeason: {
    low: 1.1, // +10%
    mid: 1.15, // +15% (default)
    high: 1.2, // +20%
  },
  shortHaul: {
    low: 1.1, // +10%
    mid: 1.15, // +15% (default)
    high: 1.25, // +25%
  },
} as const;

/**
 * Check if move date falls in peak season (May-August)
 */
function isPeakSeason(moveDate: string): boolean {
  try {
    const date = new Date(moveDate);
    const month = date.getMonth(); // 0-11
    return month >= 4 && month <= 7; // May(4) through August(7)
  } catch {
    return false;
  }
}

/**
 * Find distance band for given miles
 */
function findDistanceBand(miles: number) {
  return (
    DISTANCE_BANDS.find((band) => miles >= band.minMiles && miles <= band.maxMiles) ||
    DISTANCE_BANDS[DISTANCE_BANDS.length - 1]
  ); // Default to longest band
}

/**
 * Estimate GCC using banded rates (NOT per-mile linear!)
 *
 * @param weight - Household goods weight in pounds
 * @param distance - Distance in miles
 * @param moveDate - Move date (YYYY-MM-DD) for peak season detection
 * @returns GCC estimate with low/high range and midpoint
 */
export function estimateGCC(weight: number, distance: number, moveDate?: string): GCCEstimate {
  // 1. Convert to CWT (hundred-weight)
  const cwt = weight / 100;

  // 2. Find distance band
  const band = findDistanceBand(distance);

  // 3. Calculate BASE linehaul (rate per CWT, NOT per mile!)
  const linehaulLow = cwt * band.ratePerCWTLow;
  const linehaulHigh = cwt * band.ratePerCWTHigh;

  // 4. Apply adjustment factors (multiply)
  const fuelMultiplier = ADJUSTMENTS.fuel.mid;
  const peakMultiplier = moveDate && isPeakSeason(moveDate) ? ADJUSTMENTS.peakSeason.mid : 1.0;
  const shortHaulMultiplier = distance <= 800 ? ADJUSTMENTS.shortHaul.mid : 1.0;

  const totalMultiplier = fuelMultiplier * peakMultiplier * shortHaulMultiplier;

  const adjustedLow = linehaulLow * totalMultiplier;
  const adjustedHigh = linehaulHigh * totalMultiplier;
  const midpoint = (adjustedLow + adjustedHigh) / 2;

  // 5. Build disclaimers
  const disclaimers = [
    "Planning estimate only - NOT official GCC",
    "Excludes OLF/DLF, SIT, packing, shuttle, and route-specific accessorials",
    "Actual GCC from my.move.mil could be ±50% different",
    `Based on ${band.bandName} band rate: $${band.ratePerCWTLow}-$${band.ratePerCWTHigh}/cwt`,
  ];

  if (peakMultiplier > 1.0) {
    disclaimers.push("Peak season adjustment applied (May-August)");
  }
  if (shortHaulMultiplier > 1.0) {
    disclaimers.push("Short-haul premium applied (≤800 miles)");
  }

  return {
    linehaulLow,
    linehaulHigh,
    adjustedLow,
    adjustedHigh,
    midpoint,
    breakdown: {
      cwt,
      distanceBand: band.bandName,
      ratePerCWTLow: band.ratePerCWTLow,
      ratePerCWTHigh: band.ratePerCWTHigh,
      fuelMultiplier,
      peakMultiplier,
      shortHaulMultiplier,
    },
    disclaimers,
    confidence: 70, // Per domain expert
  };
}

/**
 * Get human-readable breakdown for UI display
 */
export function formatGCCBreakdown(estimate: GCCEstimate): string {
  const { breakdown } = estimate;

  let text = `${breakdown.cwt.toFixed(1)} CWT × $${breakdown.ratePerCWTLow}-${breakdown.ratePerCWTHigh}/cwt\n`;
  text += `Distance band: ${breakdown.distanceBand}\n`;
  text += `Base linehaul: $${estimate.linehaulLow.toLocaleString()}-$${estimate.linehaulHigh.toLocaleString()}\n`;

  if (breakdown.fuelMultiplier > 1.0) {
    text += `+ Fuel (${((breakdown.fuelMultiplier - 1) * 100).toFixed(0)}%)\n`;
  }
  if (breakdown.peakMultiplier > 1.0) {
    text += `+ Peak season (${((breakdown.peakMultiplier - 1) * 100).toFixed(0)}%)\n`;
  }
  if (breakdown.shortHaulMultiplier > 1.0) {
    text += `+ Short-haul (${((breakdown.shortHaulMultiplier - 1) * 100).toFixed(0)}%)\n`;
  }

  return text;
}
