import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
// (no-op import removed)
import { buildUserContext, scoreBlock, type V2Block, type UserContext } from "@/lib/plan/personalize";
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
  horder: number;
  hlevel?: number;
  block_type?: V2Block['block_type'];
  text_content?: string;
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
      .select("source_page,slug,title,html,tags,horder,hlevel,block_type,text_content")
      .in("slug", Array.from(allSlugs))
      .order("horder", { ascending: true });
    blocks = (data || []) as Block[];
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

  // 5) Score and build PlanRenderNode[] per bucket preserving why
  const scoreInput = (b: Block) => ({
    source_page: b.source_page,
    slug: b.slug,
    hlevel: (b as any).hlevel || 2,
    title: b.title,
    text_content: (b as any).text_content || '',
    block_type: ((b as any).block_type || 'section') as V2Block['block_type'],
    tags: b.tags || [],
    horder: b.horder,
  });

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
    const blockType = (((b as any).block_type) || 'section') as PlanRenderNode['blockType'];
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

  const bBySlug = new Map<string, Block>(blocks.map(b => [b.slug, b]));
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

  return NextResponse.json({
    sections,
    tools: { tspHref, sdpHref, houseHref },
    stageSummary,
  }, { headers: { "Cache-Control": "no-store" } });
}


