import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all claims for user
    const { data: claims, error } = await supabaseAdmin
      .from('pcs_claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ claims });

  } catch (error) {
    console.error('[PCS Claim GET] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch claims' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track analytics
    await supabaseAdmin
      .from('pcs_analytics')
      .insert({
        user_id: userId,
        claim_id: claim.id,
        event_type: 'claim_created',
        event_data: {
          travel_method: claim.travel_method,
          dependents: claim.dependents_count
        }
      });

    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error) {
    console.error('[PCS Claim POST] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to create claim' 
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, ...updates } = body;

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error) {
    console.error('[PCS Claim PATCH] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update claim' 
    }, { status: 500 });
  }
}

