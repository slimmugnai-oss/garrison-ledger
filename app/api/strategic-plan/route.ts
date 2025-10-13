import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { assemblePlan, type StrategicInput, StrategicInputSchema } from "@/lib/server/rules-engine";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await checkAndIncrement(userId, "/api/strategic-plan", 100);
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Load assessment
  const { data: aRow } = await supabase
    .from("assessments")
    .select("answers")
    .eq("user_id", userId)
    .maybeSingle();
  
  // Validate input with Zod schema
  const validationResult = StrategicInputSchema.safeParse(aRow?.answers || {});
  
  if (!validationResult.success) {
    console.error('[Strategic Plan] Input validation failed:', validationResult.error);
    return NextResponse.json({ error: "Invalid assessment data" }, { status: 400 });
  }
  
  const answers = validationResult.data;

  // Assemble plan using intelligent rules (SERVER-ONLY, SECURE)
  const assembled = assemblePlan(answers);

  // Fetch atomic blocks from database
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("slug, title, html, type, topics, tags")
    .in("slug", assembled.atomIds);

  if (!blocks || blocks.length === 0) {
    console.error('[Strategic Plan] No blocks found for atomIds:', assembled.atomIds);
  }

  // Preserve order from rules engine
  const orderedBlocks = assembled.atomIds.map(id => blocks?.find(b => b.slug === id)).filter(Boolean);

  return NextResponse.json({
    primarySituation: assembled.primarySituation,
    priorityAction: assembled.priorityAction,
    blocks: orderedBlocks,
  }, { headers: { "Cache-Control": "no-store" } });
}
