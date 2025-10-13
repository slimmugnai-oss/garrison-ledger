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
- 90-100: Critical, immediate need (e.g., orders in hand = PCS checklist)
- 70-89: High priority, should act soon
- 50-69: Relevant, good to know
- 30-49: Somewhat relevant, lower priority  
- 0-29: Not applicable to current situation

REASONING RULES:
- Be specific to THEIR situation (reference their age, family, timeline)
- Explain WHY this content matters NOW vs. later
- Use military terminology correctly
- Keep reasoning to 1-2 sentences (concise, punchy)
- Focus on actionability and urgency

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects with this structure:
[
  {
    "slug": "pcs-master-checklist",
    "score": 95,
    "reason": "With orders in hand and school-age kids, you need a comprehensive checklist now to coordinate enrollment and EFMP screening before your 12-week deadline."
  },
  ...
]

Score ALL blocks provided. Return valid JSON only, no markdown.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    // Build user context summary
    const contextSummary = `SERVICE MEMBER PROFILE:
- Service Years: ${userContext.serviceYears || 'unknown'}
- Family: ${userContext.familySnapshot || 'none'}
- PCS Status: ${userContext.pcsSituation || 'none'}
- Deployment: ${userContext.deploymentStatus || 'none'}
- Career Goals: ${Array.isArray(userContext.careerAmbitions) ? userContext.careerAmbitions.join(', ') : 'none'}
- Financial Priority: ${userContext.financialPriority || 'unknown'}
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

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SCORING_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temp for consistent scoring
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Parse response
    let scoredBlocks: ScoredBlock[];
    try {
      const parsed = JSON.parse(responseText);
      // Handle both array and object with array property
      scoredBlocks = Array.isArray(parsed) ? parsed : (parsed.blocks || parsed.scores || []);
    } catch (parseError) {
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

    return NextResponse.json({
      success: true,
      scores: validScores,
      model: "gpt-4o",
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

