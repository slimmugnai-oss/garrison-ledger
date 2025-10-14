/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * AI PLAN SCORING ENGINE - GPT-4o
 * Intelligently scores all content blocks based on user situation
 * Returns top-scored blocks with personalized reasoning
 */

type BlockMetadata = {
  slug: string;
  title: string;
  summary: string;
  type: string;
  topics: string[];
  tags: string[];
};

type ScoredBlock = {
  slug: string;
  score: number;
  reason: string;
};

const SCORING_PROMPT = `You are the strategic planning AI for Garrison Ledger, a military life planning platform.

Your task: Analyze a service member's situation and score each available content block (0-100) based on relevance and urgency.

SCORING CRITERIA:
- 90-100: Critical, immediate need 
- 70-89: High priority, should act soon
- 50-69: Relevant, good to know
- 30-49: Somewhat relevant, lower priority  
- 1-29: Not applicable to current situation
- 0: Completely irrelevant

REASONING RULES:
- Reference at least 2 SPECIFIC details from their profile
- Include NUMBERS, TIMELINES, or AGES when present
- Explain the TACTICAL consequence or benefit
- 1-2 sentences max, be concise
- If you can't reference their specific data, score 0-30

OUTPUT FORMAT (JSON):
{
  "scores": [
    {"slug": "block-slug", "score": 95, "reason": "Specific reason with their data"},
    {"slug": "another-slug", "score": 60, "reason": "Why this matters for them"},
    ... (continue for ALL blocks - give score 0 if not relevant)
  ]
}

CRITICAL: 
- Score ALL blocks provided (even if score is 0)
- Keep reasoning under 150 characters for efficiency
- Focus on top 30-40 blocks with detailed reasoning
- For low-scoring blocks (under 40), use brief reasoning or "Not applicable"`;


export async function POST(req: NextRequest) {
  // Auth check - allow internal calls or authenticated users
  const internalSecret = req.headers.get('x-internal-secret');
  const isInternalCall = internalSecret === process.env.INTERNAL_API_SECRET;
  
  if (!isInternalCall) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse request
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userContext, blocks } = body as {
    userContext: Record<string, any>;
    blocks: BlockMetadata[];
  };

  if (!userContext || !blocks || !Array.isArray(blocks)) {
    return NextResponse.json(
      { error: "Missing userContext or blocks array" },
      { status: 400 }
    );
  }

  // Initialize OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    // Build user context summary with profile enrichment
    const contextSummary = `SERVICE MEMBER PROFILE:
- Rank: ${userContext.rank || 'unknown'}
- Branch: ${userContext.branch || 'unknown'}
- Service Years: ${userContext.yearsOfService || userContext.serviceYears || 'unknown'}
- Current Base: ${userContext.currentBase || 'unknown'}
- Next Base: ${userContext.nextBase || 'TBD'}
- PCS Date: ${userContext.pcsDate || 'none'}
- PCS Status: ${userContext.pcsSituation || 'none'}
- Deployment: ${userContext.deploymentStatus || 'none'}
- Family: ${userContext.familyStatus || userContext.familySnapshot || 'none'}
- Children: ${userContext.childrenCount ?? 'none'}
- EFMP: ${userContext.efmpEnrolled ? 'Yes' : 'No'}
- TSP Balance: ${userContext.tspRange || 'unknown'}
- Debt: ${userContext.debtRange || 'unknown'}
- Emergency Fund: ${userContext.emergencyFundRange || 'unknown'}
- Biggest Concern: ${userContext.biggestConcern || 'not specified'}
- Career Goals: ${Array.isArray(userContext.careerGoals) ? userContext.careerGoals.join(', ') : (userContext.careerGoals || 'none')}
- Financial Priorities: ${Array.isArray(userContext.financialPriorities) ? userContext.financialPriorities.join(', ') : (userContext.financialPriorities || 'none')}
- Urgency Level: ${userContext.urgencyLevel || 'normal'}`;

    // Build blocks summary
    const blocksSummary = blocks
      .map((b, i) => `${i + 1}. ${b.slug}
   Title: ${b.title}
   Summary: ${b.summary}
   Type: ${b.type}
   Topics: ${b.topics.join(', ')}`)
      .join('\n\n');

    const userPrompt = `${contextSummary}

AVAILABLE CONTENT BLOCKS:

${blocksSummary}

Score each block and provide personalized reasoning for this specific service member.`;

    // Call GPT-4o-mini (cost-effective for large-scale scoring)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SCORING_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower for consistent scoring
      max_tokens: 16000, // Sufficient for 400+ blocks with concise reasoning
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Parse response
    let scoredBlocks: ScoredBlock[];
    try {
      const parsed = JSON.parse(responseText);
      // Handle both array and object with array property
      scoredBlocks = Array.isArray(parsed) ? parsed : (parsed.blocks || parsed.scores || []);
    } catch {
      console.error('[AI Score] Failed to parse GPT-4o response:', responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: responseText },
        { status: 500 }
      );
    }

    // Validate scores
    const validScores = scoredBlocks.filter(
      block => block.slug && typeof block.score === 'number' && block.reason
    );

    if (validScores.length === 0) {
      console.error('[AI Score] No valid scores in response');
      return NextResponse.json(
        { error: "No valid scores returned", raw: responseText },
        { status: 500 }
      );
    }

    console.log('[AI Score] Successfully scored', validScores.length, 'blocks');
    
    return NextResponse.json({
      success: true,
      scores: validScores,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI Score] OpenAI error:', error);
    return NextResponse.json(
      {
        error: "AI scoring failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

