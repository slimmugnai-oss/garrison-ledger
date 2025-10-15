import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

/**
 * ASSESSMENT COMPLETION ENDPOINT
 * Saves assessment responses and triggers AI plan generation
 */

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { responses } = body;

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ 
        error: "Invalid assessment responses" 
      }, { status: 400 });
    }

    // Save assessment responses (insert new record each time)
    const { error: saveError } = await supabaseAdmin
      .from('user_assessments')
      .insert({
        user_id: userId,
        responses,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('[Assessment Complete] Save error:', saveError);
      return NextResponse.json({ 
        error: "Failed to save assessment" 
      }, { status: 500 });
    }

    // Check premium status for rate limiting
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    // Record assessment taken (for rate limiting)
    await supabaseAdmin.rpc('record_assessment_taken', {
      p_user_id: userId,
      p_is_premium: isPremium
    });

    console.log('[Assessment Complete] ✅ Assessment saved for user:', userId);

    return NextResponse.json({
      success: true,
      message: "Assessment completed successfully"
    });

  } catch (error) {
    console.error('[Assessment Complete] Error:', error);
    return NextResponse.json({ 
      error: "Failed to complete assessment",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

