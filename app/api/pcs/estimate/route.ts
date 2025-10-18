import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

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

// Current JTR rates (2025)
const DLA_RATES = {
  'E1-E4_without': 1234,
  'E1-E4_with': 2468,
  'E5-E6_without': 1543,
  'E5-E6_with': 3086,
  'E7-E9_without': 1852,
  'E7-E9_with': 3704,
  'O1-O3_without': 2160,
  'O1-O3_with': 4320,
  'O4-O6_without': 2469,
  'O4-O6_with': 4938,
} as const;

const MALT_RATE_PER_MILE = 0.18;
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
    const isPremium = (tier === 'premium' || tier === 'pro') && entitlement?.status === 'active';

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

    // Calculate DLA
    const dlaKey = getRankCategory(rank, hasDependents);
    const dlaAmount = DLA_RATES[dlaKey] || DLA_RATES['E5-E6_with'];

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
    const distance = calculateDistance(claim.origin_base, claim.destination_base);
    const maltMiles = distance;
    const maltAmount = maltMiles * MALT_RATE_PER_MILE;

    // Calculate Per Diem
    const travelDays = calculateTravelDays(claim.departure_date, claim.arrival_date);
    const perDiemRate = 60; // Average CONUS rate - should be locality-specific
    const perDiemAmount = travelDays * perDiemRate * PER_DIEM_TRAVEL_RATE * (1 + dependentsCount);

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
      const estimatedGCC = (ppmWeight / 1000) * distance * 0.85; // Rough estimate
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
          distance,
          travel_days: travelDays
        },
        rates_used: {
          dla_key: dlaKey,
          malt_rate: MALT_RATE_PER_MILE,
          per_diem_rate: perDiemRate,
          ppm_percentage: PPM_PAYMENT_PERCENTAGE
        }
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
 * Get DLA rate key based on rank and dependents
 */
function getRankCategory(rank: string, hasDependents: boolean): keyof typeof DLA_RATES {
  const suffix = hasDependents ? '_with' : '_without';
  
  if (['E1', 'E2', 'E3', 'E4'].includes(rank)) return `E1-E4${suffix}` as keyof typeof DLA_RATES;
  if (['E5', 'E6'].includes(rank)) return `E5-E6${suffix}` as keyof typeof DLA_RATES;
  if (['E7', 'E8', 'E9'].includes(rank)) return `E7-E9${suffix}` as keyof typeof DLA_RATES;
  if (['O1', 'O2', 'O3', 'W1', 'W2'].includes(rank)) return `O1-O3${suffix}` as keyof typeof DLA_RATES;
  if (['O4', 'O5', 'O6', 'W3', 'W4', 'W5'].includes(rank)) return `O4-O6${suffix}` as keyof typeof DLA_RATES;
  
  return `E5-E6${suffix}` as keyof typeof DLA_RATES; // Default
}

/**
 * Calculate distance between bases (simplified - should use actual distance API)
 */
function calculateDistance(origin: string | null, destination: string | null): number {
  // Simplified - in production, use actual distance API or base distance table
  // For MVP, return a reasonable default
  return 1000; // miles
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

