import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

/**
 * REGENERATE AI PLAN - Force new plan generation
 * 
 * Allows users to regenerate their AI-curated plan after profile/assessment changes.
 * Rate limited to 1 regeneration per 24 hours to control AI costs (~$0.25/plan).
 * 
 * Process:
 * 1. Check if user has existing plan
 * 2. Enforce 24-hour cooldown
 * 3. Delete existing plan
 * 4. Trigger new plan generation via /api/plan/generate
 */

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user has existing plan
    const { data: existingPlan } = await supabaseAdmin
      .from('user_plans')
      .select('generated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingPlan?.generated_at) {
      const lastGenerated = new Date(existingPlan.generated_at);
      const now = new Date();
      const hoursSinceGeneration = (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);
      
      // Enforce 24-hour cooldown
      if (hoursSinceGeneration < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceGeneration);
        return NextResponse.json({ 
          error: "Rate limit exceeded",
          message: `Plan can be regenerated in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`,
          hoursRemaining,
          nextAvailable: new Date(lastGenerated.getTime() + 24 * 60 * 60 * 1000).toISOString()
        }, { status: 429 });
      }
    }

    // Delete existing plan (will trigger new generation)
    const { error: deleteError } = await supabaseAdmin
      .from('user_plans')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[Plan Regenerate] Delete error:', deleteError);
      return NextResponse.json({ 
        error: "Failed to clear existing plan" 
      }, { status: 500 });
    }

    // Trigger new plan generation
    const generateRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/plan/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (!generateRes.ok) {
      return NextResponse.json({ 
        error: "Failed to generate new plan" 
      }, { status: 500 });
    }

    console.log('[Plan Regenerate] ✅ Plan regenerated for user:', userId);

    return NextResponse.json({ 
      success: true, 
      message: "Plan regenerated successfully" 
    });

  } catch (error: any) {
    console.error('[Plan Regenerate] Error:', error);
    return NextResponse.json({ 
      error: "Failed to regenerate plan",
      details: error.message 
    }, { status: 500 });
  }
}

