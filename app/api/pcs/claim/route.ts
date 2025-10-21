import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';

/**
 * PCS CLAIM MANAGEMENT
 * 
 * GET: Fetch user's claims
 * POST: Create new claim
 * PATCH: Update claim details
 */

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      throw Errors.premiumRequired('PCS Money Copilot is available for Premium members only');
    }

    // Get all claims for user
    const { data: claims, error } = await supabaseAdmin
      .from('pcs_claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[PCSClaim] Failed to fetch claims', error, { userId });
      throw Errors.databaseError('Failed to fetch claims');
    }

    logger.info('[PCSClaim] Claims fetched', { userId, count: claims?.length || 0 });
    return NextResponse.json({ claims });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      throw Errors.premiumRequired('PCS Money Copilot is available for Premium members only');
    }

    const body = await req.json();

    // Get user profile for defaults
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('rank, branch, current_base, pcs_date')
      .eq('user_id', userId)
      .maybeSingle();

    // Create new claim
    const { data: claim, error } = await supabaseAdmin
      .from('pcs_claims')
      .insert({
        user_id: userId,
        claim_name: body.claim_name || 'My PCS Claim',
        pcs_orders_date: body.pcs_orders_date,
        departure_date: body.departure_date,
        arrival_date: body.arrival_date || body.pcs_date,
        origin_base: body.origin_base || profile?.current_base,
        destination_base: body.destination_base,
        travel_method: body.travel_method || 'ppm',
        dependents_count: body.dependents_count || 0,
        rank_at_pcs: body.rank_at_pcs || profile?.rank,
        branch: body.branch || profile?.branch,
        status: 'draft',
        readiness_score: 0,
        completion_percentage: 0
      })
      .select()
      .single();

    if (error) {
      logger.error('[PCSClaim] Failed to create claim', error, { userId });
      throw Errors.databaseError('Failed to create claim');
    }

    // Track analytics (fire and forget)
    supabaseAdmin
      .from('pcs_analytics')
      .insert({
        user_id: userId,
        claim_id: claim.id,
        event_type: 'claim_created',
        event_data: {
          travel_method: claim.travel_method,
          dependents: claim.dependents_count
        }
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[PCSClaim] Failed to track analytics', { userId, claimId: claim.id, error: analyticsError.message });
        }
      });

    logger.info('[PCSClaim] Claim created', { userId, claimId: claim.id, travelMethod: claim.travel_method });
    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      throw Errors.premiumRequired('PCS Money Copilot is available for Premium members only');
    }

    const body = await req.json();
    const { claimId, ...updates } = body;

    if (!claimId) {
      throw Errors.invalidInput('claimId is required');
    }

    // Update claim
    const { data: claim, error } = await supabaseAdmin
      .from('pcs_claims')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('[PCSClaim] Failed to update claim', error, { userId, claimId });
      throw Errors.databaseError('Failed to update claim');
    }

    logger.info('[PCSClaim] Claim updated', { userId, claimId, updatedFields: Object.keys(updates) });
    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error) {
    return errorResponse(error);
  }
}

