import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { assemblePlan, type StrategicInput } from "@/lib/plan/atomic-rules";
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
  
  const answers = (aRow?.answers || {}) as StrategicInput;

  // Assemble plan using intelligent rules
  const assembled = assemblePlan(answers);

  // Fetch atomic blocks from database
  const atomIds = assembled.atoms.map(a => a.atomId);
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("slug, title, html, type, topics")
    .in("slug", atomIds);

  if (!blocks || blocks.length === 0) {
    console.error('[Strategic Plan] No blocks found for atomIds:', atomIds);
  }

  // Merge with why strings and preserve order
  const blocksWithWhy = assembled.atoms.map(atom => {
    const block = blocks?.find(b => b.slug === atom.atomId);
    if (!block) {
      console.warn('[Strategic Plan] Missing block:', atom.atomId);
      return null;
    }
    return {
      slug: block.slug,
      title: block.title,
      html: block.html,
      type: block.type,
      topics: block.topics || [],
      why: atom.why,
    };
  }).filter(Boolean);

  return NextResponse.json({
    primarySituation: assembled.primarySituation,
    priorityAction: assembled.priorityAction,
    blocks: blocksWithWhy,
  }, { headers: { "Cache-Control": "no-store" } });
}
