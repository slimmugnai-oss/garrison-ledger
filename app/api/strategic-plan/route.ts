/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-typed";
import { assemblePlanWithDiversity, type StrategicInput, StrategicInputSchema } from "@/lib/server/rules-engine";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "nodejs";
export const maxDuration = 30; // Allow time for AI scoring

type ScoredBlock = {
  slug: string;
  ruleScore: number;
  aiScore?: number;
  aiReason?: string;
  finalScore: number;
};

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
  
  // Validate input
  const validationResult = StrategicInputSchema.safeParse(aRow?.answers || {});
  
  if (!validationResult.success) {
    console.error('[Strategic Plan] Input validation failed:', validationResult.error);
    return NextResponse.json({ error: "Invalid assessment data" }, { status: 400 });
  }
  
  const answers = validationResult.data;

  // Fetch ALL content blocks for AI scoring
  const { data: allBlocks } = await supabase
    .from("content_blocks")
    .select("slug, title, summary, type, topics, tags, updated_at");
  
  // Filter and map to required metadata format
  const blockMetadata = (allBlocks || [])
    .filter(b => b.slug && b.type) // Ensure required fields exist
    .map(b => ({
      slug: b.slug,
      type: b.type!,
      updated_at: b.updated_at || null
    }));

  // PARALLEL PROCESSING: Rules engine + AI scoring
  const [rulesResult, aiResult] = await Promise.allSettled([
    // Rules engine (fast, reliable baseline)
    Promise.resolve(assemblePlanWithDiversity(answers, blockMetadata)),
    
    // AI scoring (intelligent, personalized) - pass full blocks
    callAIScoring(answers, allBlocks || [])
  ]);

  // Extract results
  const rulesPlan = rulesResult.status === 'fulfilled' ? rulesResult.value : null;
  const aiScores = aiResult.status === 'fulfilled' ? aiResult.value : null;

  console.log('[Strategic Plan] Rules result:', rulesResult.status);
  console.log('[Strategic Plan] AI result:', aiResult.status);
  if (aiResult.status === 'rejected') {
    console.error('[Strategic Plan] AI scoring failed:', aiResult.reason);
  }
  console.log('[Strategic Plan] AI scores received:', aiScores);

  if (!rulesPlan) {
    console.error('[Strategic Plan] Rules engine failed');
    return NextResponse.json({ error: "Plan generation failed" }, { status: 500 });
  }

  // Create AI scores map
  const aiScoreMap = new Map<string, { score: number; reason: string }>();
  if (aiScores && aiScores.scores) {
    aiScores.scores.forEach((s: any) => {
      aiScoreMap.set(s.slug, { score: s.score, reason: s.reason });
    });
  }

  // Ensemble scoring: Combine rules + AI
  const scoredBlocks: ScoredBlock[] = rulesPlan.atomIds.map((slug, index) => {
    const ruleScore = 100 - (index * 10); // Higher priority = higher score
    const aiData = aiScoreMap.get(slug);
    const aiScore = aiData?.score || 0;
    
    // Weighted average: 60% rules (proven) + 40% AI (enhancement)
    const finalScore = aiScore > 0 
      ? (ruleScore * 0.6) + (aiScore * 0.4)
      : ruleScore; // Fall back to rules if no AI score
    
    return {
      slug,
      ruleScore,
      aiScore,
      aiReason: aiData?.reason,
      finalScore
    };
  });

  // Re-sort by final score (in case AI changed priorities)
  scoredBlocks.sort((a, b) => b.finalScore - a.finalScore);

  // Take top 5
  const topSlugs = scoredBlocks.slice(0, 5).map(sb => sb.slug);

  // Fetch full content for top-scored blocks
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("slug, title, summary, html, type, topics, tags, updated_at")
    .in("slug", topSlugs);

  if (!blocks || blocks.length === 0) {
    console.error('[Strategic Plan] No blocks found for topSlugs:', topSlugs);
  }

  // Merge blocks with AI reasoning
  const enrichedBlocks = topSlugs.map(slug => {
    const block = blocks?.find(b => b.slug === slug);
    const scoreData = scoredBlocks.find(sb => sb.slug === slug);
    
    if (!block) return null;
    
    const isRecent = block.updated_at && 
      (new Date().getTime() - new Date(block.updated_at).getTime()) / (1000 * 60 * 60 * 24) <= 30;
    
    return {
      ...block,
      isRecent,
      aiReason: scoreData?.aiReason, // Personalized "why this matters"
      score: scoreData?.finalScore,
    };
  }).filter(Boolean);

  return NextResponse.json({
    primarySituation: rulesPlan.primarySituation,
    priorityAction: rulesPlan.priorityAction,
    blocks: enrichedBlocks,
    aiEnhanced: aiScores ? true : false, // Flag if AI worked
  }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Call AI scoring endpoint
 */
async function callAIScoring(
  answers: StrategicInput,
  blocks: any[]
): Promise<{ scores: any[] } | null> {
  try {
    // Build user context from assessment
    const s = answers?.strategic || {};
    const c = answers?.comprehensive || {};
    const foundation = (c.foundation || {}) as any;
    const move = (c.move || {}) as any;
    const deployment = (c.deployment || {}) as any;
    const career = (c.career || {}) as any;
    const finance = (c.finance || {}) as any;
    const prefs = (c.preferences || {}) as any;

    const userContext = {
      serviceYears: foundation.serviceYears || s.efmpEnrolled ? '5-10' : 'unknown',
      familySnapshot: foundation.familySnapshot || 'none',
      pcsSituation: move.pcsSituation || s.pcsTimeline || 'none',
      deploymentStatus: deployment.status || 'none',
      careerAmbitions: career.ambitions || [],
      financialPriority: finance.priority || s.financialWorry || 'unknown',
      urgencyLevel: prefs.urgencyLevel || 'normal',
      biggestFocus: s.biggestFocus || 'unknown'
    };

    // Prepare blocks metadata for AI
    const blocksSummary = blocks.map(b => ({
      slug: b.slug,
      title: b.title,
      summary: b.summary || '',
      type: b.type,
      topics: b.topics || [],
      tags: b.tags || []
    }));

    // Call AI scoring endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/plan/ai-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userContext,
        blocks: blocksSummary
      }),
      signal: AbortSignal.timeout(25000) // 25s timeout
    });

    if (!response.ok) {
      console.warn('[Strategic Plan] AI scoring failed, using rules only');
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.warn('[Strategic Plan] AI scoring error, falling back to rules:', error);
    return null;
  }
}
