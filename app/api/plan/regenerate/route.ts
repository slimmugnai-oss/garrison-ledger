import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * REGENERATE PLAN - Force cache clear with 24-hour rate limit
 * Allows users to force-refresh their plan after profile changes
 * Rate limited to 1 regeneration per 24 hours to control AI costs
 */

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check last generation time (24-hour rate limit)
  const { data: existingPlan } = await supabase
    .from('plan_cache')
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

  // Delete cached plan for this user (allows fresh generation)
  await supabase
    .from('plan_cache')
    .delete()
    .eq('user_id', userId);

  return NextResponse.json({ success: true, cleared: true });
}

