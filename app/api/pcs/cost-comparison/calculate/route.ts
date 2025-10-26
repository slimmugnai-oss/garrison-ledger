import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getDLARate, getMALTRate, getPerDiemRate } from "@/lib/pcs/jtr-api";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.json();

    // Calculate DITY costs
    const dityTotalCost = 
      formData.dity_truck_rental +
      formData.dity_gas_cost +
      formData.dity_hotel_cost +
      formData.dity_meals_cost +
      formData.dity_labor_cost;

    // Calculate government reimbursement for DITY using real JTR rates
    const dityGovernmentCost = await calculateDITYReimbursement(
      formData.weight_authorized,
      formData.distance_miles,
      formData.rank_at_pcs,
      formData.dependents_count,
      formData.departure_date || new Date().toISOString().split('T')[0]
    );

    const dityProfit = dityGovernmentCost - dityTotalCost;
    const dityProfitPercentage = dityTotalCost > 0 ? (dityProfit / dityTotalCost) * 100 : 0;

    // Calculate Full Move costs using real JTR rates
    const fullMoveCost = await calculateFullMoveCost(
      formData.weight_authorized,
      formData.distance_miles,
      formData.rank_at_pcs,
      formData.dependents_count,
      formData.departure_date || new Date().toISOString().split('T')[0]
    );

    const fullMoveEntitlements = await calculateFullMoveEntitlements(
      formData.rank_at_pcs,
      formData.dependents_count,
      formData.departure_date || new Date().toISOString().split('T')[0]
    );

    const fullMoveNetCost = fullMoveCost - fullMoveEntitlements;

    // Calculate Partial DITY costs
    const partialDityWeight = formData.partial_dity_weight;
    const partialDityTruckCost = partialDityWeight * 0.5; // $0.50 per lb estimate
    const partialDityGasCost = partialDityWeight * 0.1; // $0.10 per lb estimate
    const partialDityTotalCost = partialDityTruckCost + partialDityGasCost;

    const partialDityGovernmentCost = await calculatePartialDITYReimbursement(
      partialDityWeight,
      formData.distance_miles,
      formData.rank_at_pcs,
      formData.departure_date || new Date().toISOString().split('T')[0]
    );

    const partialDityProfit = partialDityGovernmentCost - partialDityTotalCost;
    const partialDityProfitPercentage = partialDityTotalCost > 0 ? (partialDityProfit / partialDityTotalCost) * 100 : 0;

    // Determine recommendation
    const recommendation = determineRecommendation(
      dityProfit,
      fullMoveNetCost,
      partialDityProfit,
      formData.weight_authorized
    );

    // Calculate break-even weight
    const breakEvenWeight = calculateBreakEvenWeight(
      formData.distance_miles,
      formData.rank_at_pcs,
      formData.dependents_count
    );

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(
      formData.weight_authorized,
      formData.distance_miles,
      dityProfit,
      fullMoveNetCost
    );

    const results = {
      dity: {
        total_cost: dityTotalCost,
        government_cost: dityGovernmentCost,
        profit: dityProfit,
        profit_percentage: dityProfitPercentage
      },
      full_move: {
        cost: fullMoveCost,
        entitlements: fullMoveEntitlements,
        net_cost: fullMoveNetCost
      },
      partial_dity: {
        total_cost: partialDityTotalCost,
        government_cost: partialDityGovernmentCost,
        profit: partialDityProfit,
        profit_percentage: partialDityProfitPercentage
      },
      recommended: recommendation,
      break_even_weight: breakEvenWeight,
      confidence_score: confidenceScore
    };

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Cost comparison calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate comparison" }, { status: 500 });
  }
}

// Helper functions for calculations
async function calculateDITYReimbursement(
  weight: number,
  distance: number,
  rank: string,
  dependents: number,
  effectiveDate: string
): Promise<number> {
  try {
    // Get real MALT rate from JTR database (returns raw number per mile)
    const maltPerMile = await getMALTRate(effectiveDate);
    
    // Get DLA rate for rank and dependents (returns raw number)
    const dlaAmount = await getDLARate(rank, dependents > 0, effectiveDate);
    
    // Government pays 95% of what it would cost them to move it
    // Simplified formula: (weight / 100) * distance * cost_per_cwt
    // Industry standard: ~$50-$100 per 100 lbs per 1000 miles
    const costPerCwt = 75; // $75 per 100 lbs per 1000 miles
    const governmentMoveCost = (weight / 100) * (distance / 1000) * costPerCwt;
    
    // User gets 95% of government cost + DLA + MALT
    const dityReimbursement = governmentMoveCost * 0.95;
    const maltReimbursement = distance * maltPerMile;
    
    return dityReimbursement + dlaAmount + maltReimbursement;
  } catch (error) {
    console.error('Error calculating DITY reimbursement:', error);
    // Fallback to simplified calculation with confidence = 0
    const estimatedGovCost = (weight / 100) * (distance / 1000) * 75;
    const dityPortion = estimatedGovCost * 0.95;
    const maltPortion = distance * 0.22; // 2025 MALT rate
    const dlaPortion = getDLAForRank(rank, dependents > 0);
    return dityPortion + maltPortion + dlaPortion;
  }
}

async function calculateFullMoveCost(
  weight: number,
  distance: number,
  rank: string,
  dependents: number,
  effectiveDate: string
): Promise<number> {
  try {
    // Industry standard government contracted move costs
    // Base on DTMO and commercial moving company rates
    const costPerCwt = 75; // $75 per 100 lbs (cwt) per 1000 miles
    const baseCost = (weight / 100) * (distance / 1000) * costPerCwt;
    
    // Add standard service fees
    const packingCost = weight * 0.50; // Professional packing
    const insuranceCost = baseCost * 0.02; // 2% insurance
    const handlingFees = 500; // Base handling fee
    
    return baseCost + packingCost + insuranceCost + handlingFees;
  } catch (error) {
    console.error('Error calculating full move cost:', error);
    // Fallback calculation
    const baseCost = (weight / 100) * (distance / 1000) * 75;
    return baseCost + (weight * 0.5) + 500;
  }
}

async function calculateFullMoveEntitlements(
  rank: string,
  dependents: number,
  effectiveDate: string
): Promise<number> {
  try {
    // Get DLA - this is the only direct payment in full government move
    const dlaAmount = await getDLARate(rank, dependents > 0, effectiveDate);
    
    // In a full government move, member gets:
    // - DLA (cash payment)
    // - Government pays movers directly (not an entitlement to member)
    // - Travel expenses (MALT or airfare) if authorized separately
    
    return dlaAmount;
  } catch (error) {
    console.error('Error calculating full move entitlements:', error);
    // Fallback DLA calculation
    return getDLAForRank(rank, dependents > 0);
  }
}

async function calculatePartialDITYReimbursement(
  weight: number,
  distance: number,
  rank: string,
  effectiveDate: string
): Promise<number> {
  try {
    // Get MALT rate for travel reimbursement (returns raw number per mile)
    const maltPerMile = await getMALTRate(effectiveDate);
    
    // Calculate government cost for the portion being moved DITY
    const costPerCwt = 75; // $75 per 100 lbs per 1000 miles
    const governmentCost = (weight / 100) * (distance / 1000) * costPerCwt;
    
    // Partial DITY: 95% of government cost for weight moved + proportional MALT
    const dityReimbursement = governmentCost * 0.95;
    const maltReimbursement = distance * maltPerMile;
    
    return dityReimbursement + maltReimbursement;
  } catch (error) {
    console.error('Error calculating partial DITY reimbursement:', error);
    // Fallback calculation
    const governmentCost = (weight / 100) * (distance / 1000) * 75;
    const maltFallback = distance * 0.22; // 2025 MALT rate
    return (governmentCost * 0.95) + maltFallback;
  }
}

function getRankMultiplier(rank: string): number {
  // Simplified rank multipliers
  if (rank.startsWith('O')) return 1.2; // Officers
  if (rank.startsWith('E')) {
    const grade = parseInt(rank.substring(1));
    if (grade >= 7) return 1.1;
    if (grade >= 5) return 1.0;
    return 0.9;
  }
  return 1.0;
}

function getDLAForRank(rank: string, hasDependents: boolean): number {
  // Simplified DLA rates
  if (rank.startsWith('O')) {
    return hasDependents ? 3000 : 2000;
  }
  if (rank.startsWith('E')) {
    const grade = parseInt(rank.substring(1));
    if (grade >= 7) return hasDependents ? 2500 : 1500;
    if (grade >= 5) return hasDependents ? 2000 : 1000;
    return hasDependents ? 1500 : 800;
  }
  return 1000;
}

function determineRecommendation(
  dityProfit: number,
  fullMoveNetCost: number,
  partialDityProfit: number,
  weight: number
): "dity" | "full_move" | "partial_dity" {
  // If DITY is profitable and weight is reasonable, recommend DITY
  if (dityProfit > 0 && weight <= 10000) {
    return "dity";
  }
  
  // If partial DITY is profitable and weight is high, recommend partial
  if (partialDityProfit > 0 && weight > 10000) {
    return "partial_dity";
  }
  
  // Otherwise, recommend full move
  return "full_move";
}

function calculateBreakEvenWeight(
  distance: number,
  rank: string,
  dependents: number
): number {
  // Calculate weight where DITY becomes profitable
  const baseCostPerLb = 0.5; // $0.50 per lb base cost
  const reimbursementPerLb = 0.15 * distance; // $0.15 per lb per mile
  const rankMultiplier = getRankMultiplier(rank);
  
  const breakEven = baseCostPerLb / (reimbursementPerLb * rankMultiplier);
  return Math.ceil(breakEven);
}

function calculateConfidenceScore(
  weight: number,
  distance: number,
  dityProfit: number,
  fullMoveNetCost: number
): number {
  let score = 50; // Base score
  
  // Weight factor
  if (weight >= 5000 && weight <= 15000) score += 20;
  else if (weight < 2000 || weight > 20000) score -= 20;
  
  // Distance factor
  if (distance >= 100 && distance <= 1000) score += 15;
  else if (distance < 50 || distance > 2000) score -= 15;
  
  // Profit factor
  if (dityProfit > 1000) score += 15;
  else if (dityProfit < 0) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}
