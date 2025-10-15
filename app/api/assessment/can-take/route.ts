import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

/**
 * CHECK ASSESSMENT ELIGIBILITY
 * 
 * Rate limits:
 * - Free tier: 1 assessment per week
 * - Premium tier: 3 assessments per day
 */

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    // Check if user can take assessment
    const { data: eligibility, error } = await supabaseAdmin
      .rpc('can_take_assessment', {
        p_user_id: userId,
        p_is_premium: isPremium
      });

    if (error) {
      console.error('[Assessment Eligibility] Error:', error);
      return NextResponse.json({ 
        error: "Failed to check eligibility" 
      }, { status: 500 });
    }

    return NextResponse.json({
      ...eligibility,
      isPremium
    });

  } catch (error) {
    console.error('[Assessment Eligibility] Error:', error);
    return NextResponse.json({ 
      error: "Failed to check eligibility",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

