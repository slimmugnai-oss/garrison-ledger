import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
// (no-op import removed)
import { buildUserContext, scoreBlock, type V2Block } from "@/lib/plan/personalize";
import { doThisNowFromChecklist, type DoNowItem } from "@/lib/plan/interpolate";
import { runPlanBuckets, type AssessmentFacts, type PlanBuckets } from "@/lib/plan/rules";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "nodejs";

type Block = {
  source_page: string;
  slug: string;
  title: string;
  html: string;
  tags: string[];
  topics?: string[];
  horder: number;
  hlevel?: number;
  block_type?: V2Block['block_type'];
  text_content?: string;
  summary?: string;
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

  // 2) Build personalization context and rule-based buckets (with why)
  const ctx = buildUserContext(answersRaw);
  const bucketsWithWhy = await runPlanBuckets(answersRaw as AssessmentFacts);
  const allSlugs = new Set<string>();
  (Object.values(bucketsWithWhy) as Array<{ slug: string; why?: string }[]>).forEach(list => {
    list.forEach(i => allSlugs.add(i.slug));
  });
  
  let blocks: Block[] = [];
  if (allSlugs.size) {
    const { data } = await supabase
      .from("content_blocks")
      .select("source_page,slug,title,html,tags,topics,horder,hlevel,block_type,text_content,summary")
      .in("slug", Array.from(allSlugs))
      .order("horder", { ascending: true });
    blocks = (data || []) as Block[];
  }

  // Score blocks for priority ranking
  const scoredBlocks = blocks.map(b => ({
    ...b,
    score: scoreBlock({
      source_page: b.source_page,
      slug: b.slug,
      hlevel: b.hlevel || 2,
      title: b.title,
      text_content: b.text_content || '',
      block_type: b.block_type || 'section',
      tags: b.tags,
      topics: b.topics,
      horder: b.horder,
    } as V2Block, ctx),
  }));

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

  // 5) Score and build PlanRenderNode[] per bucket preserving why
  // no score function used in this version

  type PlanRenderNode = {
    id: string;
    title: string;
    html: string;
    blockType: 'section'|'checklist'|'faq'|'table'|'tip';
    source: string;
    slug: string;
    callouts: {
      whyItMatters?: string[];
      doThisNow?: DoNowItem[];
    };
  };

  const toNode = (b: Block, why?: string): PlanRenderNode => {
    const blockType = ((b.block_type) || 'section') as PlanRenderNode['blockType'];
    const callouts = {
      whyItMatters: why ? [why] : undefined,
      doThisNow: blockType === 'checklist' ? doThisNowFromChecklist(b.html) : undefined,
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
  };

  const bBySlug = new Map<string, typeof scoredBlocks[0]>(scoredBlocks.map(b => [b.slug, b]));
  const sections: Record<'pcs'|'career'|'finance'|'deployment', PlanRenderNode[]> = { pcs: [], career: [], finance: [], deployment: [] };

  const pushBucket = (key: keyof PlanBuckets, list: { slug: string; why?: string }[]) => {
    for (const item of list) {
      const b = bBySlug.get(item.slug);
      if (!b) continue;
      sections[key].push(toNode(b, item.why));
    }
  };

  pushBucket('pcs', bucketsWithWhy.pcs);
  pushBucket('career', bucketsWithWhy.career);
  pushBucket('finance', bucketsWithWhy.finance);
  pushBucket('deployment', bucketsWithWhy.deployment);

  // Helper to determine priority level
  const getPriority = (score: number): 'high'|'medium'|'low' => {
    if (score >= 20) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
  };

  return NextResponse.json({
    sections,
    tools: { tspHref, sdpHref, houseHref },
    stageSummary,
    // also return structured lists for TaskCards with priority
    pcs: sections.pcs.map(n => { const b = bBySlug.get(n.slug); return ({ slug: n.slug, title: n.title, summary: (b?.summary) || '', fullContent: n.html, topics: b?.topics || [], priority: b ? getPriority(b.score) : 'low' }); }),
    career: sections.career.map(n => { const b = bBySlug.get(n.slug); return ({ slug: n.slug, title: n.title, summary: (b?.summary) || '', fullContent: n.html, topics: b?.topics || [], priority: b ? getPriority(b.score) : 'low' }); }),
    finance: sections.finance.map(n => { const b = bBySlug.get(n.slug); return ({ slug: n.slug, title: n.title, summary: (b?.summary) || '', fullContent: n.html, topics: b?.topics || [], priority: b ? getPriority(b.score) : 'low' }); }),
    deployment: sections.deployment.map(n => { const b = bBySlug.get(n.slug); return ({ slug: n.slug, title: n.title, summary: (b?.summary) || '', fullContent: n.html, topics: b?.topics || [], priority: b ? getPriority(b.score) : 'low' }); }),
  }, { headers: { "Cache-Control": "no-store" } });
}


