import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

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
    // Get real MALT rate from JTR database
    const maltRate = await getMALTRate(effectiveDate);
    const baseRate = maltRate.ratePerMile;
    
    // Calculate weight allowance rate (simplified)
    const weightRate = weight * distance * baseRate;
    
    // Get DLA rate for rank and dependents
    const dlaRate = await getDLARate(rank, dependents > 0, effectiveDate);
    const dlaAmount = dlaRate.amount;
    
    // Calculate total reimbursement
    return weightRate + dlaAmount;
  } catch (error) {
    console.error('Error calculating DITY reimbursement:', error);
    // Fallback to simplified calculation
    const baseRate = 0.15;
    const weightRate = weight * distance * baseRate;
    const dlaAmount = getDLAForRank(rank, dependents > 0);
    return weightRate + dlaAmount;
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
    // Get real MALT rate for government move cost
    const maltRate = await getMALTRate(effectiveDate);
    const baseCost = weight * distance * maltRate.ratePerMile * 1.3; // 30% markup for moving company
    
    // Get DLA rate for dependents
    const dlaRate = await getDLARate(rank, dependents > 0, effectiveDate);
    const dependentCost = dependents * (dlaRate.amount * 0.1); // 10% of DLA per dependent
    
    return baseCost + dependentCost;
  } catch (error) {
    console.error('Error calculating full move cost:', error);
    // Fallback to simplified calculation
    const baseCost = weight * distance * 0.20;
    const rankMultiplier = getRankMultiplier(rank);
    const dependentCost = dependents * 1000;
    return (baseCost * rankMultiplier) + dependentCost;
  }
}

async function calculateFullMoveEntitlements(
  rank: string,
  dependents: number,
  effectiveDate: string
): Promise<number> {
  try {
    // Get real DLA rate
    const dlaRate = await getDLARate(rank, dependents > 0, effectiveDate);
    const dla = dlaRate.amount;
    
    // Get real MALT rate
    const maltRate = await getMALTRate(effectiveDate);
    const malt = maltRate.ratePerMile * 1000; // 1000 miles average
    
    // Get real per diem rate (using default locality)
    const perDiemRate = await getPerDiemRate('default', effectiveDate);
    const perDiem = perDiemRate.rate * 3; // 3 days average
    
    return dla + malt + perDiem;
  } catch (error) {
    console.error('Error calculating full move entitlements:', error);
    // Fallback to simplified calculation
    const dla = getDLAForRank(rank, dependents > 0);
    const malt = 0.22 * 1000;
    const perDiem = 166 * 3;
    return dla + malt + perDiem;
  }
}

async function calculatePartialDITYReimbursement(
  weight: number,
  distance: number,
  rank: string,
  effectiveDate: string
): Promise<number> {
  try {
    // Partial DITY gets proportional reimbursement
    const fullReimbursement = await calculateDITYReimbursement(weight, distance, rank, 0, effectiveDate);
    return fullReimbursement * 0.5; // 50% of full DITY reimbursement
  } catch (error) {
    console.error('Error calculating partial DITY reimbursement:', error);
    // Fallback to simplified calculation
    const baseRate = 0.15;
    const weightRate = weight * distance * baseRate;
    const dlaAmount = getDLAForRank(rank, false);
    return (weightRate + dlaAmount) * 0.5;
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
