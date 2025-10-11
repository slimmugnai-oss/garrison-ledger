import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { generateStrategicPlan, type StrategicAnswers } from "@/lib/plan/strategic-rules";
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
  
  const answers = (aRow?.answers || {}) as StrategicAnswers;

  // Generate strategic plan using intelligent rules
  const strategicPlan = generateStrategicPlan(answers);

  // Fetch the curated blocks from database
  const slugs = strategicPlan.blocks.map(b => b.slug);
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("slug, title, html, topics")
    .in("slug", slugs);

  // Merge why strings with block content
  const blocksWithWhy = (blocks || []).map(b => {
    const ruleBlock = strategicPlan.blocks.find(rb => rb.slug === b.slug);
    return {
      slug: b.slug,
      title: b.title,
      html: b.html,
      why: ruleBlock?.why || '',
      topics: b.topics || [],
    };
  });

  return NextResponse.json({
    primarySituation: strategicPlan.primarySituation,
    priorityAction: strategicPlan.priorityAction,
    blocks: blocksWithWhy,
  }, { headers: { "Cache-Control": "no-store" } });
}

