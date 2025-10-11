import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { runPlanRules } from "@/lib/plan/rules";
import type { AssessmentFacts } from "@/lib/plan/rules";
import { buildUserContext, scoreBlock, type V2Block } from "@/lib/plan/personalize";
import { whyItMattersBullets, doThisNowFromChecklist, estImpact } from "@/lib/plan/interpolate";
import { checkAndIncrement } from "@/lib/limits";

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

  const { allowed } = await checkAndIncrement(userId, "/api/plan", 100);
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

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
  const answersRaw = (aRow?.answers || {}) as Record<string, unknown>;

  // 2) Build personalization context and candidate tags
  const ctx = buildUserContext(answersRaw);
  const tagSet = await runPlanRules(answersRaw as unknown as AssessmentFacts);
  const tags = Array.from(new Set([...(ctx.candidateTags || new Set<string>()), ...Array.from(tagSet)]));

  // 3) Select blocks by tag overlap; fallback to top ordered blocks
  const MAX_BLOCKS = 12;
  let blocks: (Block & V2Block)[] = [];
  if (tags.length) {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("source_page,slug,title,html,tags,horder,hlevel,block_type,text_content")
      .overlaps("tags", tags)
      .order("horder", { ascending: true })
      .limit(MAX_BLOCKS);
    if (!error && data) blocks = data as (Block & V2Block)[];
  }
  if (blocks.length < 6) {
    const need = MAX_BLOCKS - blocks.length;
    const { data } = await supabase
      .from("content_blocks")
      .select("source_page,slug,title,html,tags,horder,hlevel,block_type,text_content")
      .order("horder", { ascending: true })
      .limit(need);
    const add = (data || []) as (Block & V2Block)[];
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
  type AnyObj = Record<string, unknown>;
  const answersObj = answersRaw as AnyObj;
  const getNum = (obj: AnyObj, path: string[], fallback: number): number => {
    let cur: unknown = obj;
    for (const key of path) {
      if (typeof cur === "object" && cur !== null && key in (cur as AnyObj)) {
        cur = (cur as AnyObj)[key];
      } else {
        cur = undefined;
        break;
      }
    }
    const num = typeof cur === "number" ? cur : Number(cur);
    return Number.isFinite(num) ? (num as number) : fallback;
  };
  const getStr = (obj: AnyObj, path: string[], fallback = ""): string => {
    let cur: unknown = obj;
    for (const key of path) {
      if (typeof cur === "object" && cur !== null && key in (cur as AnyObj)) {
        cur = (cur as AnyObj)[key];
      } else {
        return fallback;
      }
    }
    return typeof cur === "string" ? cur : fallback;
  };

  const age = getNum(answersObj, ["tsp", "age"], 30);
  const retire = getNum(answersObj, ["tsp", "retire"], 50);
  const tspHref = `/dashboard/tools/tsp-modeler?age=${age}&retire=${retire}&bal=50000&cont=500&mix=C:70,S:30`;
  const sdpAmount = getNum(answersObj, ["timeline", "sdpAmount"], 10000);
  const sdpHref = `/dashboard/tools/sdp-strategist?amount=${sdpAmount}`;
  const houseHref = `/dashboard/tools/house-hacking?price=400000&rate=6.5&tax=4800&ins=1600&bah=2400&rent=2200`;

  const stageBits: string[] = [];
  const pcs = getStr(answersObj, ["timeline", "pcsDate"], "");
  if (pcs) stageBits.push(pcs.replaceAll("_", " "));
  const depsNum = getNum(answersObj, ["personal", "dependents"], NaN);
  if (Number.isFinite(depsNum)) stageBits.push(`${depsNum} dependents`);
  const stress = getStr(answersObj, ["financial", "monthlyBudgetStress"], "");
  if (stress) stageBits.push(stress);
  const stageSummary = stageBits.filter(Boolean).join(" • ");

  // 5) Score, diversify and build PlanRenderNode[]
  const scored = blocks.map(b => ({ b, score: scoreBlock({
    source_page: b.source_page,
    slug: b.slug,
    hlevel: (b as any).hlevel || 2,
    title: b.title,
    text_content: (b as any).text_content || '',
    block_type: ((b as any).block_type || 'section') as V2Block['block_type'],
    tags: b.tags || [],
    horder: b.horder,
  }, ctx) }));

  scored.sort((a, b) => b.score - a.score || a.b.horder - b.b.horder);

  // diversify: max 4 per source
  const perSourceCount = new Map<string, number>();
  const selected: typeof blocks = [];
  for (const s of scored) {
    const src = s.b.source_page;
    const n = perSourceCount.get(src) || 0;
    if (n >= 4) continue;
    perSourceCount.set(src, n + 1);
    selected.push(s.b);
    if (selected.length >= 14) break;
  }

  type PlanRenderNode = {
    id: string;
    title: string;
    html: string;
    blockType: 'section'|'checklist'|'faq'|'table'|'tip';
    source: string;
    slug: string;
    callouts: {
      whyItMatters?: string[];
      doThisNow?: { id:string; text:string }[];
      estImpact?: { label:string; value:string }[];
    };
  };

  const nodes: PlanRenderNode[] = selected.map(b => {
    const blockType = ((b as any).block_type || 'section') as PlanRenderNode['blockType'];
    const callouts = {
      whyItMatters: whyItMattersBullets(ctx as any),
      doThisNow: blockType === 'checklist' ? doThisNowFromChecklist(b.html) : undefined,
      estImpact: estImpact(ctx as any),
    };
    return {
      id: `${b.source_page}:${b.slug}`,
      title: b.title,
      html: b.html,
      blockType,
      source: b.source_page,
      slug: b.slug,
      callouts,
    };
  });

  return NextResponse.json({
    nodes,
    tools: { tspHref, sdpHref, houseHref },
    stageSummary,
  }, { headers: { "Cache-Control": "no-store" } });
}


