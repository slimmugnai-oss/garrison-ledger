/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { assemblePlanWithDiversity, StrategicInputSchema } from "@/lib/server/rules-engine";
import { normalizeAssessment } from "@/lib/server/assessment-normalizer";
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

  // Create hash of assessment answers for cache key
  const assessmentHash = Buffer.from(JSON.stringify(answers)).toString('base64').slice(0, 32);

  // Check cache first
  const { data: cachedPlan } = await supabase
    .from('plan_cache')
    .select('plan_data, ai_enhanced, generated_at')
    .eq('user_id', userId)
    .eq('assessment_hash', assessmentHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (cachedPlan) {
    console.log('[Strategic Plan] Cache hit! Using cached plan from:', cachedPlan.generated_at);
    return NextResponse.json(cachedPlan.plan_data, { 
      headers: { "Cache-Control": "no-store" } 
    });
  }

  console.log('[Strategic Plan] Cache miss, generating new plan with AI');

  // Fetch ALL content blocks for AI scoring
  const { data: allBlocks } = await supabase
    .from("content_blocks")
    .select("slug, title, summary, type, domain, topics, tags, updated_at");
  
  // Filter and map to required metadata format
  const blockMetadata = (allBlocks || [])
    .filter(b => b.slug && b.type) // Ensure required fields exist
    .map(b => ({
      slug: b.slug,
      type: b.type!,
      updated_at: b.updated_at || null
    }));

  // Load user profile to enrich AI context
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Normalize assessment data for consistent AI context
  const normalized = normalizeAssessment(answers as any, profile);

  // PARALLEL PROCESSING: Rules engine + AI scoring + Roadmap generation
  const [rulesResult, aiResult, roadmapResult] = await Promise.allSettled([
    // Rules engine (fast, reliable baseline)
    Promise.resolve(assemblePlanWithDiversity(answers, blockMetadata)),
    
    // AI scoring (intelligent, personalized) - use normalized context
    callAIScoring(normalized, allBlocks || [], profile || null),
    
    // Executive roadmap generation - use normalized context
    generateRoadmap(normalized, allBlocks || [], profile || null)
  ]);

  // Extract results
  const rulesPlan = rulesResult.status === 'fulfilled' ? rulesResult.value : null;
  const aiScores = aiResult.status === 'fulfilled' ? aiResult.value : null;
  const roadmap = roadmapResult.status === 'fulfilled' ? roadmapResult.value : null;

  console.log('[Strategic Plan] Rules result:', rulesResult.status);
  console.log('[Strategic Plan] AI result:', aiResult.status);
  console.log('[Strategic Plan] Roadmap result:', roadmapResult.status);
  if (aiResult.status === 'rejected') {
    console.error('[Strategic Plan] AI scoring failed:', aiResult.reason);
  }
  if (roadmapResult.status === 'rejected') {
    console.error('[Strategic Plan] Roadmap generation failed:', roadmapResult.reason);
  }
  console.log('[Strategic Plan] AI scores received:', aiScores);
  console.log('[Strategic Plan] Roadmap received:', roadmap);

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
    .select("slug, title, summary, html, type, domain, topics, tags, updated_at")
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

  const planResponse = {
    primarySituation: rulesPlan.primarySituation,
    priorityAction: rulesPlan.priorityAction,
    blocks: enrichedBlocks,
    aiEnhanced: aiScores ? true : false, // Flag if AI worked
    executiveSummary: roadmap?.roadmap?.executiveSummary || null,
    sections: roadmap?.roadmap?.sections || [],
  };

  // Cache the generated plan
  await supabase
    .from('plan_cache')
    .upsert({
      user_id: userId,
      plan_data: planResponse,
      assessment_hash: assessmentHash,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      ai_enhanced: aiScores ? true : false,
      ai_model: 'gpt-4o'
    } as any, {
      onConflict: 'user_id'
    });

  console.log('[Strategic Plan] Plan cached for user:', userId);

  return NextResponse.json(planResponse, { 
    headers: { "Cache-Control": "no-store" } 
  });
}

/**
 * Call AI scoring endpoint
 */
async function callAIScoring(
  normalized: any,
  blocks: any[],
  profile: any | null
): Promise<{ scores: any[] } | null> {
  try {
    // Build clean user context from normalized assessment
    const userContext = {
      age: normalized.age,
      gender: normalized.gender,
      yearsOfService: normalized.yearsOfService,
      rank: normalized.rank,
      branch: normalized.branch,
      currentBase: profile?.current_base,
      nextBase: profile?.next_base,
      pcsDate: profile?.pcs_date,
      pcsSituation: normalized.pcsSituation,
      deploymentStatus: normalized.deploymentStatus,
      familyStatus: normalized.familyStatus,
      childrenCount: normalized.numChildren,
      efmpEnrolled: normalized.efmpEnrolled,
      tspRange: normalized.tspRange,
      debtRange: normalized.debtRange,
      emergencyFundRange: normalized.emergencyFundRange,
      biggestConcern: normalized.biggestConcern,
      careerGoals: normalized.careerGoals,
      financialPriorities: normalized.financialPriorities,
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
    
    console.log('[AI Score] Calling endpoint:', `${baseUrl}/api/plan/ai-score`);
    console.log('[AI Score] User context:', userContext);
    console.log('[AI Score] Blocks to score:', blocksSummary.length);
    
    const response = await fetch(`${baseUrl}/api/plan/ai-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET || 'dev-secret'
      },
      body: JSON.stringify({
        userContext,
        blocks: blocksSummary
      }),
      signal: AbortSignal.timeout(25000) // 25s timeout
    });

    console.log('[AI Score] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Score] Failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[AI Score] Success! Scores received:', data.scores?.length);
    return data;

  } catch (error) {
    console.error('[AI Score] Exception:', error);
    return null;
  }
}

/**
 * Generate executive roadmap (summary + section intros)
 */
async function generateRoadmap(
  normalized: any,
  blocks: any[],
  profile: any | null
): Promise<{ roadmap: any } | null> {
  try {
    // Build clean user context from normalized data
    const userContext = {
      age: normalized.age,
      gender: normalized.gender,
      yearsOfService: normalized.yearsOfService,
      rank: normalized.rank,
      branch: normalized.branch,
      currentBase: profile?.current_base,
      nextBase: profile?.next_base,
      pcsDate: profile?.pcs_date,
      pcsSituation: normalized.pcsSituation,
      deploymentStatus: normalized.deploymentStatus,
      familyStatus: normalized.familyStatus,
      childrenCount: normalized.numChildren,
      efmpEnrolled: normalized.efmpEnrolled,
      tspRange: normalized.tspRange,
      debtRange: normalized.debtRange,
      emergencyFundRange: normalized.emergencyFundRange,
      biggestConcern: normalized.biggestConcern,
      careerGoals: normalized.careerGoals,
      financialPriorities: normalized.financialPriorities,
      educationLevel: profile?.education_level,
      spouseAge: profile?.spouse_age,
    };

    // Use explicit domain field from database (fallback to slug-based detection)
    const getDomain = (block: any): string => {
      if (block.domain) return block.domain;
      // Fallback for blocks without domain field
      const slug = block.slug;
      if (slug.includes('pcs') || slug.includes('move') || slug.includes('station')) return 'pcs';
      if (slug.includes('career') || slug.includes('tsp') || slug.includes('education') || slug.includes('mycaa')) return 'career';
      if (slug.includes('deploy') || slug.includes('sdp')) return 'deployment';
      return 'finance';
    };

    const blocksSummary = blocks.slice(0, 10).map(b => ({
      slug: b.slug,
      title: b.title,
      domain: getDomain(b),
    }));

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    console.log('[Generate Roadmap] Calling endpoint');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add internal secret if available
    if (process.env.INTERNAL_API_SECRET) {
      headers['x-internal-secret'] = process.env.INTERNAL_API_SECRET;
    }

    const response = await fetch(`${baseUrl}/api/plan/generate-roadmap`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userContext,
        blocks: blocksSummary
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Generate Roadmap] Failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Generate Roadmap] Success!');
    return data;

  } catch (error) {
    console.error('[Generate Roadmap] Exception:', error);
    return null;
  }
}
