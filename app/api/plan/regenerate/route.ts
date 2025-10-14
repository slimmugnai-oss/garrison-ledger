import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * REGENERATE PLAN - Force cache clear and redirect
 * Allows users to force-refresh their plan after profile changes
 */

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete cached plan for this user
  await supabase
    .from('plan_cache')
    .delete()
    .eq('user_id', userId);

  return NextResponse.json({ success: true, cleared: true });
}

