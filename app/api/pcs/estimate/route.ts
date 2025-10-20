import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateDistance } from '@/lib/pcs/distance';
import { getPerDiemRate } from '@/lib/pcs/per-diem';
import { 
  getDLARate, 
  checkDLAEligibility, 
  getMALTRate,
  getWeightAllowance,
  validatePPMWeight,
  calculateConfidenceScore
} from '@/lib/pcs/jtr-rules';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * PCS ENTITLEMENT CALCULATOR
 * 
 * Calculates DLA, TLE, MALT, Per Diem, PPM based on:
 * - User's rank and branch
 * - PCS dates and locations
 * - Dependent count
 * - Uploaded documents
 */

interface EstimateRequest {
  claimId: string;
}

const PER_DIEM_TRAVEL_RATE = 0.75;
const PPM_PAYMENT_PERCENTAGE = 0.95;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      return NextResponse.json({
        error: 'Premium feature',
        details: 'PCS Money Copilot is available for Premium and Pro members only.',
        upgradeRequired: true
      }, { status: 403 });
    }

    const body: EstimateRequest = await req.json();
    const { claimId } = body;

    // Get claim details
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('pcs_claims')
      .select('*')
      .eq('id', claimId)
      .eq('user_id', userId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Get user profile for rank info
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('rank, branch')
      .eq('user_id', userId)
      .maybeSingle();

    const rank = claim.rank_at_pcs || profile?.rank || 'E5';
    const branch = claim.branch || profile?.branch || 'Army';
    const dependentsCount = claim.dependents_count || 0;
    const hasDependents = dependentsCount > 0;

    // Get documents for confidence scoring
    const { data: documents } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('document_type')
      .eq('claim_id', claimId);

    const hasOrders = documents?.some(d => d.document_type === 'orders') || false;

    // Calculate DLA using JTR rules
    const dlaResult = getDLARate(rank, hasDependents);
    const dlaAmount = dlaResult.amount;

    // Calculate TLE (requires lodging receipts)
    const { data: lodgingDocs } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('normalized_data')
      .eq('claim_id', claimId)
      .eq('document_type', 'lodging_receipt')
      .eq('ocr_status', 'completed');

    let tleDays = 0;
    let tleAmount = 0;
    if (lodgingDocs) {
      lodgingDocs.forEach((doc) => {
        const data = doc.normalized_data as { nights?: number; total_amount?: number };
        if (data.nights && data.total_amount) {
          tleDays += data.nights;
          tleAmount += data.total_amount;
        }
      });
      // Cap at 10 days per location (20 total)
      tleDays = Math.min(tleDays, 20);
    }

    // Calculate MALT (requires distance calculation)
    const distanceResult = await calculateDistance(
      claim.origin_base || 'Unknown',
      claim.destination_base || 'Unknown',
      true // Use Google Maps for accuracy
    );
    const maltMiles = distanceResult.miles;
    const maltRateInfo = getMALTRate();
    const maltAmount = maltMiles * maltRateInfo.rate;

    // Calculate Per Diem with real locality rates
    const travelDays = calculateTravelDays(claim.departure_date, claim.arrival_date);
    
    // Get per diem rates for origin and destination
    // Use higher of the two rates (common practice)
    const originPerDiem = claim.origin_city && claim.origin_state
      ? getPerDiemRate(claim.origin_city, claim.origin_state)
      : 166; // Standard CONUS
    const destPerDiem = claim.destination_city && claim.destination_state
      ? getPerDiemRate(claim.destination_city, claim.destination_state)
      : 166; // Standard CONUS
    
    const perDiemRate = Math.max(originPerDiem, destPerDiem);
    
    // Calculate per diem: member gets 75% rate, each dependent gets 75% of member's rate
    const memberPerDiem = travelDays * perDiemRate * PER_DIEM_TRAVEL_RATE;
    const dependentPerDiem = memberPerDiem * 0.75 * dependentsCount;
    const perDiemAmount = memberPerDiem + dependentPerDiem;

    // Calculate PPM (requires weigh tickets)
    const { data: weighTickets } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('normalized_data')
      .eq('claim_id', claimId)
      .eq('document_type', 'weigh_ticket')
      .eq('ocr_status', 'completed');

    let ppmWeight = 0;
    let ppmEstimate = 0;
    if (weighTickets && weighTickets.length > 0) {
      // Get net weight from tickets
      weighTickets.forEach((ticket) => {
        const data = ticket.normalized_data as { net_weight?: number };
        if (data.net_weight) {
          ppmWeight += data.net_weight;
        }
      });
      
      // Estimate government cost (simplified - actual uses DoD rate tables)
      const estimatedGCC = (ppmWeight / 1000) * maltMiles * 0.85; // Rough estimate
      ppmEstimate = estimatedGCC * PPM_PAYMENT_PERCENTAGE;
    }

    // Calculate total
    const totalEstimated = dlaAmount + tleAmount + maltAmount + perDiemAmount + ppmEstimate;

    // Get total from actual receipts
    const { data: allReceipts } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('normalized_data')
      .eq('claim_id', claimId)
      .eq('ocr_status', 'completed');

    let totalClaimed = 0;
    if (allReceipts) {
      allReceipts.forEach((receipt) => {
        const data = receipt.normalized_data as { total_amount?: number };
        if (data.total_amount) {
          totalClaimed += data.total_amount;
        }
      });
    }

    const potentialLeftOnTable = Math.max(0, totalEstimated - totalClaimed);

    // Calculate confidence score
    const confidenceResult = calculateConfidenceScore({
      hasOrders,
      hasWeighTickets: (weighTickets && weighTickets.length > 0) || false,
      hasReceipts: (allReceipts && allReceipts.length > 0) || false,
      originCity: claim.origin_city,
      destinationCity: claim.destination_city,
      distance: maltMiles,
      rank
    });

    // Create snapshot
    const { data: snapshot, error: snapshotError } = await supabaseAdmin
      .from('pcs_entitlement_snapshots')
      .insert({
        claim_id: claimId,
        dla_amount: dlaAmount,
        tle_days: tleDays,
        tle_amount: tleAmount,
        malt_miles: maltMiles,
        malt_amount: maltAmount,
        per_diem_days: travelDays,
        per_diem_amount: perDiemAmount,
        ppm_weight: ppmWeight,
        ppm_estimate: ppmEstimate,
        total_estimated: totalEstimated,
        total_claimed: totalClaimed,
        potential_left_on_table: potentialLeftOnTable,
        calculation_details: {
          rank,
          branch,
          dependents: dependentsCount,
          distance: maltMiles,
          distance_method: distanceResult.method,
          travel_days: travelDays
        },
        rates_used: {
          dla_rate: dlaResult.amount,
          dla_citation: dlaResult.citation,
          malt_rate: maltRateInfo.rate,
          malt_citation: maltRateInfo.citation,
          per_diem_rate: perDiemRate,
          ppm_percentage: PPM_PAYMENT_PERCENTAGE
        },
        confidence_score: confidenceResult.score,
        confidence_level: confidenceResult.level,
        confidence_factors: confidenceResult.factors
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('[PCS Estimate] Snapshot error:', snapshotError);
    }

    // Update claim with entitlements
    await supabaseAdmin
      .from('pcs_claims')
      .update({
        entitlements: {
          dla: dlaAmount,
          tle: tleAmount,
          malt: maltAmount,
          per_diem: perDiemAmount,
          ppm: ppmEstimate,
          total: totalEstimated
        },
        last_checked_at: new Date().toISOString()
      })
      .eq('id', claimId);

    // Track analytics
    const { data: claimData } = await supabaseAdmin
      .from('pcs_claims')
      .select('user_id')
      .eq('id', claimId)
      .single();

    if (claimData) {
      await supabaseAdmin
        .from('pcs_analytics')
        .insert({
          user_id: claimData.user_id,
          claim_id: claimId,
          event_type: 'entitlement_calculated',
          event_data: {
            total_estimated: totalEstimated,
            total_claimed: totalClaimed,
            potential_left: potentialLeftOnTable
          }
        });
    }

    return NextResponse.json({
      success: true,
      snapshot
    });

  } catch (error) {
    console.error('[PCS Estimate] Error:', error);
    return NextResponse.json({ 
      error: 'Calculation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * Calculate travel days
 */
function calculateTravelDays(departureDate: string | null, arrivalDate: string | null): number {
  if (!departureDate || !arrivalDate) return 5; // Default estimate
  
  const departure = new Date(departureDate);
  const arrival = new Date(arrivalDate);
  const diffTime = Math.abs(arrival.getTime() - departure.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays);
}

