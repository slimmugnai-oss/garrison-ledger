import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { calculatePCSClaim, type FormData } from '@/lib/pcs/calculation-engine';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
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
      throw Errors.premiumRequired('PCS Money Copilot is available for Premium members only.');
    }

    const body: EstimateRequest = await req.json();
    const { claimId } = body;

    if (!claimId) {
      throw Errors.invalidInput('claimId is required');
    }

    // Get claim details
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('pcs_claims')
      .select('*')
      .eq('id', claimId)
      .eq('user_id', userId)
      .single();

    if (claimError || !claim) {
      logger.warn('PCS claim not found', { claimId, userId: userId.substring(0, 8) + '...' });
      throw Errors.notFound('PCS Claim');
    }

    // Get user profile for rank info
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('rank, branch')
      .eq('user_id', userId)
      .maybeSingle();

    const rank = claim.rank_at_pcs || profile?.rank || 'E-5';
    const branch = claim.branch || profile?.branch || 'Army';
    const dependentsCount = claim.dependents_count || 0;

    // CRITICAL FIX: Use NEW calculation engine instead of outdated logic
    const formData: FormData = {
      rank_at_pcs: rank,
      branch,
      origin_base: claim.origin_base || '',
      destination_base: claim.destination_base || '',
      dependents_count: dependentsCount,
      departure_date: claim.departure_date || '',
      arrival_date: claim.arrival_date || '',
      pcs_orders_date: claim.pcs_orders_date || new Date().toISOString().split('T')[0],
      travel_method: claim.travel_method || 'ppm',
      tle_origin_nights: claim.tle_origin_nights || 0,
      tle_destination_nights: claim.tle_destination_nights || 0,
      tle_origin_rate: claim.tle_origin_rate || 0,
      tle_destination_rate: claim.tle_destination_rate || 0,
      malt_distance: claim.malt_distance || claim.distance_miles || 0,
      distance_miles: claim.distance_miles || claim.malt_distance || 0,
      per_diem_days: claim.per_diem_days || 0,
      actual_weight: claim.actual_weight || 0,
      estimated_weight: claim.estimated_weight || 0,
      destination_zip: claim.destination_zip || '00000',
    };

    logger.info('[PCS Estimate] Calculating with new engine', {
      claimId,
      rank,
      dependents: dependentsCount,
      origin: claim.origin_base,
      destination: claim.destination_base,
    });

    const calculations = await calculatePCSClaim(formData);

    // Extract values from new calculation engine
    const dlaAmount = calculations.dla.amount;
    const tleAmount = calculations.tle.total;
    const maltMiles = calculations.malt.distance;
    const maltAmount = calculations.malt.amount;
    const travelDays = calculations.perDiem.days;
    const perDiemAmount = calculations.perDiem.amount;
    const ppmWeight = calculations.ppm.weight;
    const ppmEstimate = calculations.ppm.amount;
    const totalEstimated = calculations.total;

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

    // Get confidence from calculation engine
    const avgConfidence = Math.round(
      (calculations.dla.confidence +
        calculations.malt.confidence +
        calculations.perDiem.confidence +
        calculations.ppm.confidence) /
        4
    );
    const confidenceLevel =
      avgConfidence >= 90
        ? 'high'
        : avgConfidence >= 70
        ? 'medium'
        : 'low';

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
          travel_days: travelDays,
          full_calculations: calculations
        },
        rates_used: {
          dla_rate: calculations.dla.rateUsed,
          dla_citation: calculations.dla.citation,
          malt_rate: calculations.malt.ratePerMile,
          malt_citation: calculations.malt.citation,
          per_diem_rate: calculations.perDiem.rate,
          ppm_rate: calculations.ppm.rate
        },
        confidence_score: avgConfidence,
        confidence_level: confidenceLevel,
        confidence_factors: {
          dla: calculations.dla.confidence,
          malt: calculations.malt.confidence,
          perDiem: calculations.perDiem.confidence,
          ppm: calculations.ppm.confidence
        }
      })
      .select()
      .single();

    if (snapshotError) {
      logger.error('Failed to create PCS entitlement snapshot', snapshotError, {
        claimId,
        userId: userId.substring(0, 8) + '...'
      });
      // Continue - snapshot is for history, not critical
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

    // Track analytics (non-blocking)
    try {
      await supabaseAdmin
        .from('pcs_analytics')
        .insert({
          user_id: userId,
          claim_id: claimId,
          event_type: 'entitlement_calculated',
          event_data: {
            total_estimated: totalEstimated,
            total_claimed: totalClaimed,
            potential_left: potentialLeftOnTable
          }
        });
    } catch (analyticsError) {
      logger.warn('Failed to record PCS analytics', {
        error: analyticsError instanceof Error ? analyticsError.message : 'Unknown'
      });
    }

    const duration = Date.now() - startTime;
    
    logger.info('[PCS Estimate] Calculation completed', {
      userId: userId.substring(0, 8) + '...',
      claimId,
      totalEstimated,
      dla: dlaAmount,
      malt: maltAmount,
      perDiem: perDiemAmount,
      ppm: ppmEstimate,
      potentialLeft: potentialLeftOnTable,
      confidence: confidenceLevel,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      snapshot
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[PCS Estimate] Calculation failed', error, { duration_ms: duration });
    return errorResponse(error);
  }
}

