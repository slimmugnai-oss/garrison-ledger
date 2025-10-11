import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { runPlanRules } from "@/lib/plan/rules";
import type { AssessmentFacts } from "@/lib/plan/rules";

export const runtime = "nodejs";

type Block = {
  source_page: string;
  slug: string;
  title: string;
  html: string;
  tags: string[];
  horder: number;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1) Load assessment answers
  const { data: aRow, error: aErr } = await supabase
    .from("assessments")
    .select("answers")
    .eq("user_id", userId)
    .maybeSingle();
  if (aErr) return NextResponse.json({ error: "load assessment" }, { status: 500 });
  const answers = (aRow?.answers || {}) as AssessmentFacts;

  // 2) Compute tags via rules engine
  const tagSet = await runPlanRules(answers);
  const tags = Array.from(tagSet);

  // 3) Select blocks by tag overlap; fallback to top ordered blocks
  const MAX_BLOCKS = 12;
  let blocks: Block[] = [];
  if (tags.length) {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("source_page,slug,title,html,tags,horder")
      .overlaps("tags", tags)
      .order("horder", { ascending: true })
      .limit(MAX_BLOCKS);
    if (!error && data) blocks = data as Block[];
  }
  if (blocks.length < 6) {
    const need = MAX_BLOCKS - blocks.length;
    const { data } = await supabase
      .from("content_blocks")
      .select("source_page,slug,title,html,tags,horder")
      .order("horder", { ascending: true })
      .limit(need);
    const add = (data || []) as Block[];
    // Deduplicate by source_page+slug
    const seen = new Set(blocks.map(b => `${b.source_page}:${b.slug}`));
    for (const b of add) {
      const k = `${b.source_page}:${b.slug}`;
      if (!seen.has(k)) {
        seen.add(k);
        blocks.push(b);
      }
      if (blocks.length >= MAX_BLOCKS) break;
    }
  }

  // 4) Tool deep links based on answers (lightweight defaults)
  const age = Number(answers?.tsp?.age ?? 30);
  const retire = Number(answers?.tsp?.retire ?? 50);
  const tspHref = `/dashboard/tools/tsp-modeler?age=${age}&retire=${retire}&bal=50000&cont=500&mix=C:70,S:30`;
  const sdpAmount = Number(answers?.timeline?.sdpAmount ?? 10000);
  const sdpHref = `/dashboard/tools/sdp-strategist?amount=${sdpAmount}`;
  const houseHref = `/dashboard/tools/house-hacking?price=400000&rate=6.5&tax=4800&ins=1600&bah=2400&rent=2200`;

  const stageBits: string[] = [];
  if (answers?.timeline?.pcsDate) stageBits.push(String(answers.timeline.pcsDate).replaceAll("_", " "));
  if (answers?.personal?.dependents != null) stageBits.push(`${answers.personal.dependents} dependents`);
  if (answers?.financial?.monthlyBudgetStress) stageBits.push(String(answers.financial.monthlyBudgetStress));
  const stageSummary = stageBits.filter(Boolean).join(" • ");

  return NextResponse.json({
    blocks,
    tools: { tspHref, sdpHref, houseHref },
    stageSummary,
  }, { headers: { "Cache-Control": "no-store" } });
}


