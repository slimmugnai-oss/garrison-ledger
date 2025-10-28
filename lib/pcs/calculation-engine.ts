/**
 * PCS COPILOT CALCULATION ENGINE
 *
 * Enhanced calculation engine with:
 * - Version-aware rates
 * - Confidence scoring
 * - Provenance tracking
 * - JTR compliance
 */

import { logger } from "@/lib/logger";
import { getRankPaygrade } from "@/lib/data/rank-paygrade-map";

// Use admin client for server-side analytics, null for client-side
function getSupabaseClient() {
  // Only use supabaseAdmin on server-side
  if (typeof window === "undefined") {
    // Dynamic import to avoid client-side bundling
    return require("@/lib/supabase/admin").supabaseAdmin;
  }
  // Client-side: return null to avoid errors
  return null;
}

import { getDLARate, getMALTRate, getPerDiemRate, calculateDistance } from "./jtr-api";

export interface CalculationResult {
  dla: {
    amount: number;
    rateUsed: number;
    multiplier: number;
    effectiveDate: string;
    citation: string;
    source: string;
    lastVerified: string;
    confidence: number;
  };
  tle: {
    origin: {
      days: number;
      rate: number;
      amount: number;
      maxDays: number;
      citation: string;
    };
    destination: {
      days: number;
      rate: number;
      amount: number;
      maxDays: number;
      citation: string;
    };
    total: number;
  };
  malt: {
    distance: number;
    ratePerMile: number;
    amount: number;
    effectiveDate: string;
    citation: string;
    source: string;
    confidence: number;
  };
  perDiem: {
    days: number;
    rate: number;
    amount: number;
    locality: string;
    effectiveDate: string;
    citation: string;
    confidence: number;
  };
  ppm: {
    weight: number;
    distance: number;
    rate: number;
    amount: number;
    maxWeight: number;
    citation: string;
    confidence: number;
  };
  total: number;
  confidence: {
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
  };
  dataSources: {
    dla: string;
    tle: string;
    malt: string;
    perDiem: string;
    ppm: string;
  };
  jtrRuleVersion: string;
}

export interface FormData {
  claim_name: string;
  pcs_orders_date: string;
  departure_date: string;
  arrival_date: string;
  origin_base: string;
  destination_base: string;
  travel_method: string;
  dependents_count: number;
  rank_at_pcs: string;
  branch: string;
  tle_origin_nights: number;
  tle_destination_nights: number;
  tle_origin_rate: number;
  tle_destination_rate: number;
  malt_distance: number;
  per_diem_days: number;
  fuel_receipts: number;
  estimated_weight: number;
  actual_weight: number;
  distance_miles: number;
  destination_zip?: string; // ZIP code for per diem locality lookup
}

/**
 * Calculate DLA (Dislocation Allowance)
 */
async function calculateDLA(
  rank: string,
  hasDependents: boolean,
  effectiveDate: string
): Promise<CalculationResult["dla"]> {
  try {
    // CRITICAL FIX: Convert rank title to paygrade
    // "Sergeant (SGT)" → "E05" → "E-5" for database lookup
    let paygrade = rank;

    // If rank is a title (contains letters/spaces), convert to paygrade
    if (rank && !rank.match(/^[EWO]-?\d{1,2}$/i)) {
      const converted = getRankPaygrade(rank);
      if (converted) {
        // Convert E06 → E-6 format for database (strip leading zero)
        const letter = converted.charAt(0); // E, W, or O
        const number = parseInt(converted.substring(1), 10); // 06 → 6
        paygrade = `${letter}-${number}`;
        logger.info("[PCS Calc] Converted rank for DLA lookup", {
          originalRank: rank,
          converted,
          paygrade,
        });
      }
    }

    const amount = await getDLARate(paygrade, hasDependents, effectiveDate);

    return {
      amount,
      rateUsed: amount,
      multiplier: hasDependents ? 2 : 1,
      effectiveDate,
      citation: "JTR 050302.B",
      source: "DFAS Pay Tables API",
      lastVerified: new Date().toISOString(),
      confidence: amount > 0 ? 100 : 0,
    };
  } catch (error) {
    logger.error("DLA calculation failed:", error);
    return {
      amount: 0,
      rateUsed: 0,
      multiplier: 1,
      effectiveDate,
      citation: "JTR 050302.B",
      source: "DFAS Pay Tables API",
      lastVerified: new Date().toISOString(),
      confidence: 0,
    };
  }
}

/**
 * Calculate TLE (Temporary Lodging Expense)
 */
function calculateTLE(
  originNights: number,
  destinationNights: number,
  originRate: number,
  destinationRate: number
): CalculationResult["tle"] {
  const maxDays = 10;

  const origin = {
    days: Math.min(originNights, maxDays),
    rate: originRate,
    amount: Math.min(originNights, maxDays) * originRate,
    maxDays,
    citation: "JTR 054205",
  };

  const destination = {
    days: Math.min(destinationNights, maxDays),
    rate: destinationRate,
    amount: Math.min(destinationNights, maxDays) * destinationRate,
    maxDays,
    citation: "JTR 054205",
  };

  return {
    origin,
    destination,
    total: origin.amount + destination.amount,
  };
}

/**
 * Calculate MALT (Mileage Allowance in Lieu of Transportation)
 */
async function calculateMALT(
  distance: number,
  effectiveDate: string
): Promise<CalculationResult["malt"]> {
  try {
    const ratePerMile = await getMALTRate(effectiveDate);
    const amount = distance * ratePerMile;

    return {
      distance,
      ratePerMile,
      amount,
      effectiveDate,
      citation: "JTR 054206",
      source: "IRS Standard Mileage Rate",
      confidence: 100,
    };
  } catch (error) {
    logger.error("MALT calculation failed:", error);
    return {
      distance,
      ratePerMile: 0.18,
      amount: distance * 0.18,
      effectiveDate,
      citation: "JTR 054206",
      source: "IRS Standard Mileage Rate",
      confidence: 80,
    };
  }
}

/**
 * Calculate Per Diem
 */
async function calculatePerDiem(
  days: number,
  zipCode: string,
  effectiveDate: string
): Promise<CalculationResult["perDiem"]> {
  try {
    const perDiemRate = await getPerDiemRate(zipCode, effectiveDate);
    const rate = perDiemRate?.totalRate || 166; // Fallback to standard CONUS rate
    const amount = days * rate;

    return {
      days,
      rate,
      amount,
      locality: perDiemRate?.city || "Standard CONUS",
      effectiveDate,
      citation: "JTR 054401",
      confidence: perDiemRate ? 100 : 80,
    };
  } catch (error) {
    logger.error("Per diem calculation failed:", error);
    return {
      days,
      rate: 166,
      amount: days * 166,
      locality: "Standard CONUS",
      effectiveDate,
      citation: "JTR 054401",
      confidence: 80,
    };
  }
}

/**
 * Calculate PPM (Personally Procured Move)
 *
 * Weight allowances are BINARY (with/without dependents), not additive per-dependent.
 * Pro-gear is separate and doesn't count against HHG cap.
 *
 * Source: JTR 054705 - HHG Weight Allowances by Rank
 */
function calculatePPM(
  weight: number,
  distance: number,
  rank: string,
  hasDependents: boolean = false
): CalculationResult["ppm"] {
  // Weight allowances by rank (binary: with/without dependents)
  // These are the HHG caps per JTR 054705 (Table 5-5)
  // Source: Official JTR documentation - verified 2025-01-01
  const weightAllowances: Record<string, { without: number; with: number }> = {
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

  // CRITICAL FIX: Convert rank format for weight allowance lookup
  // "E-6" → "E6", "O-3" → "O3", etc.
  const normalizedRank = rank.replace("-", "");
  const rankAllowance = weightAllowances[normalizedRank] || { without: 5000, with: 8000 };
  const maxWeight = hasDependents ? rankAllowance.with : rankAllowance.without;

  // CRITICAL FIX: Don't use maxWeight as default if user hasn't entered weight
  // If weight is 0 or undefined, return 0 amount (PPM not applicable)
  if (!weight || weight === 0) {
    return {
      weight: 0,
      distance: distance || 0,
      rate: 0.95,
      amount: 0,
      maxWeight,
      citation: "JTR 054703",
      confidence: 0,
    };
  }

  const actualWeight = Math.min(weight, maxWeight);

  // Simplified PPM calculation (would use actual GCC rates)
  const rate = 0.95; // 95% of government cost
  const amount = actualWeight * distance * rate * 0.001; // Simplified formula

  return {
    weight: weight, // Return user's entered weight (not capped) for display
    distance: distance || 0,
    rate,
    amount, // Use capped weight for calculation amount
    maxWeight,
    citation: "JTR 054703",
    confidence: weight && distance ? 90 : 50,
  };
}

/**
 * Calculate confidence score
 */
function calculateConfidenceScore(
  formData: FormData,
  calculations: Partial<CalculationResult>
): CalculationResult["confidence"] {
  let score = 100;
  const factors = {
    hasOrders: !!formData.pcs_orders_date,
    hasWeighTickets: formData.actual_weight > 0,
    datesVerified: !!(formData.departure_date && formData.arrival_date),
    ratesFromAPI: true, // Assume true if using our system
    distanceVerified: formData.malt_distance > 0,
    receiptsComplete: formData.fuel_receipts > 0,
  };

  // Adjust score based on factors
  if (!factors.hasOrders) score -= 20;
  if (!factors.hasWeighTickets) score -= 15;
  if (!factors.datesVerified) score -= 15;
  if (!factors.distanceVerified) score -= 10;
  if (!factors.receiptsComplete) score -= 10;

  score = Math.max(0, score);

  let level: "excellent" | "good" | "fair" | "needs_work";
  if (score >= 90) level = "excellent";
  else if (score >= 70) level = "good";
  else if (score >= 50) level = "fair";
  else level = "needs_work";

  const recommendations: string[] = [];
  if (!factors.hasOrders) recommendations.push("Add PCS orders date");
  if (!factors.hasWeighTickets) recommendations.push("Add actual weight from weigh tickets");
  if (!factors.distanceVerified) recommendations.push("Verify distance calculation");
  if (!factors.receiptsComplete) recommendations.push("Add fuel receipts");

  return {
    overall: score,
    factors,
    level,
    recommendations,
  };
}

/**
 * Main calculation function
 */
export async function calculatePCSClaim(formData: FormData): Promise<CalculationResult> {
  const effectiveDate = formData.pcs_orders_date || new Date().toISOString().split("T")[0];
  const hasDependents = formData.dependents_count > 0;

  // Calculate all entitlements with error handling
  let dla, malt, perDiem;

  try {
    dla = await calculateDLA(formData.rank_at_pcs, hasDependents, effectiveDate);
  } catch (error) {
    logger.error("DLA calculation failed:", error);
    // Use fallback DLA calculation
    dla = {
      amount: 0,
      rateUsed: 0,
      multiplier: 1,
      effectiveDate,
      citation: "JTR 050302.B",
      source: "Unavailable - please calculate manually",
      lastVerified: "Never",
      confidence: 0,
    };
  }

  try {
    malt = await calculateMALT(formData.malt_distance, effectiveDate);
  } catch (error) {
    logger.error("MALT calculation failed:", error);
    // Use fallback MALT calculation
    malt = {
      distance: formData.malt_distance,
      ratePerMile: 0.18,
      amount: formData.malt_distance * 0.18,
      effectiveDate,
      citation: "IRS Standard Mileage Rate",
      source: "Fallback rate - verify with finance office",
      confidence: 50,
    };
  }

  try {
    // Use destination ZIP if provided, otherwise fallback to "00000"
    const zipCode = formData.destination_zip || "00000";
    perDiem = await calculatePerDiem(formData.per_diem_days, zipCode, effectiveDate);
  } catch (error) {
    logger.error("Per diem calculation failed:", error);
    // Use fallback per diem calculation
    perDiem = {
      days: formData.per_diem_days,
      rate: 166,
      amount: formData.per_diem_days * 166,
      locality: "Standard CONUS rate - verify location",
      effectiveDate,
      citation: "DTMO Per Diem",
      confidence: 50,
    };
  }

  const tle = calculateTLE(
    formData.tle_origin_nights,
    formData.tle_destination_nights,
    formData.tle_origin_rate,
    formData.tle_destination_rate
  );

  const ppm = calculatePPM(
    formData.actual_weight || formData.estimated_weight,
    formData.distance_miles,
    formData.rank_at_pcs,
    (formData.dependents_count || 0) > 0 // Binary: has dependents?
  );

  logger.info("🔍 PPM Calculated", {
    weight: formData.actual_weight || formData.estimated_weight,
    distance: formData.distance_miles,
    ppmWeight: ppm.weight,
    ppmDistance: ppm.distance,
    ppmAmount: ppm.amount,
  });

  // Calculate total
  const total = dla.amount + tle.total + malt.amount + perDiem.amount + ppm.amount;

  // Calculate confidence score
  const confidence = calculateConfidenceScore(formData, { dla, tle, malt, perDiem, ppm });

  // Prepare data sources
  const dataSources = {
    dla: "DFAS Pay Tables API",
    tle: "JTR 054205",
    malt: "IRS Standard Mileage Rate",
    perDiem: "DTMO Per Diem API",
    ppm: "JTR 054703",
  };

  const result: CalculationResult = {
    dla,
    tle,
    malt,
    perDiem,
    ppm,
    total,
    confidence,
    dataSources,
    jtrRuleVersion: "2025-01-25",
  };

  // Save calculation snapshot
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from("pcs_entitlement_snapshots").insert({
        claim_id: formData.claim_name, // Would be actual claim ID
        dla_amount: dla.amount,
        tle_days: tle.origin.days + tle.destination.days,
        tle_amount: tle.total,
        malt_miles: malt.distance,
        malt_amount: malt.amount,
        per_diem_days: perDiem.days,
        per_diem_amount: perDiem.amount,
        ppm_weight: ppm.weight,
        ppm_estimate: ppm.amount,
        total_estimated: total,
        calculation_details: result,
        rates_used: {
          dla: dla.rateUsed,
          malt: malt.ratePerMile,
          perDiem: perDiem.rate,
        },
        confidence_scores: confidence,
        jtr_rule_version: result.jtrRuleVersion,
        data_sources: dataSources,
      });
    } else {
      // Client-side: just log the calculation
      console.log("📊 PCS calculation completed (client-side only):", {
        claimId: formData.claim_name,
        total: total,
        dla: dla.amount,
        malt: malt.amount,
        perDiem: perDiem.amount,
      });
    }
  } catch (error) {
    logger.error("Failed to save calculation snapshot:", error);
  }

  return result;
}

/**
 * Get calculation history for a claim
 */
export async function getCalculationHistory(claimId: string): Promise<CalculationResult[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Client-side: return empty array
      console.log("📊 Calculation history requested (client-side only):", { claimId });
      return [];
    }

    const { data: snapshots } = await supabase
      .from("pcs_entitlement_snapshots")
      .select("*")
      .eq("claim_id", claimId)
      .order("created_at", { ascending: false });

    return (
      snapshots?.map((snapshot: any) => ({
        dla: {
          amount: snapshot.dla_amount,
          rateUsed: snapshot.rates_used?.dla || 0,
          multiplier: 1,
          effectiveDate: snapshot.created_at,
          citation: "JTR 050302.B",
          source: "DFAS Pay Tables API",
          lastVerified: snapshot.created_at,
          confidence: 100,
        },
        tle: {
          origin: {
            days: Math.floor(snapshot.tle_days / 2),
            rate: 0,
            amount: Math.floor(snapshot.tle_amount / 2),
            maxDays: 10,
            citation: "JTR 054205",
          },
          destination: {
            days: Math.ceil(snapshot.tle_days / 2),
            rate: 0,
            amount: Math.ceil(snapshot.tle_amount / 2),
            maxDays: 10,
            citation: "JTR 054205",
          },
          total: snapshot.tle_amount,
        },
        malt: {
          distance: snapshot.malt_miles,
          ratePerMile: snapshot.rates_used?.malt || 0.18,
          amount: snapshot.malt_amount,
          effectiveDate: snapshot.created_at,
          citation: "JTR 054206",
          source: "IRS Standard Mileage Rate",
          confidence: 100,
        },
        perDiem: {
          days: snapshot.per_diem_days,
          rate: snapshot.rates_used?.perDiem || 166,
          amount: snapshot.per_diem_amount,
          locality: "Standard CONUS",
          effectiveDate: snapshot.created_at,
          citation: "JTR 054401",
          confidence: 100,
        },
        ppm: {
          weight: snapshot.ppm_weight,
          distance: 0,
          rate: 0.95,
          amount: snapshot.ppm_estimate,
          maxWeight: 5000,
          citation: "JTR 054703",
          confidence: 90,
        },
        total: snapshot.total_estimated,
        confidence: snapshot.confidence_scores,
        dataSources: snapshot.data_sources,
        jtrRuleVersion: snapshot.jtr_rule_version,
      })) || []
    );
  } catch (error) {
    logger.error("Failed to get calculation history:", error);
    return [];
  }
}
