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

REASONING RULES - THIS IS CRITICAL:
- DO NOT write generic statements that could apply to anyone
- Reference SPECIFIC details from their situation (their service years, their kids' ages, their actual timeline)
- Include NUMBERS when relevant (e.g., "your 12-week PCS window", "at 28 years old", "with 2 school-age kids")
- Explain the SPECIFIC consequence or benefit for THEM (e.g., "missing EFMP deadlines could delay your kids starting school in August")
- Make it tactical and specific (e.g., "since you're interested in federal employment AND PCSing, research USAJobs positions at your gaining base NOW")
- Keep it 2-3 sentences maximum
- Write like you're their experienced military friend giving real talk, not a corporate chatbot

BAD EXAMPLES (NEVER DO THIS):
❌ "Pre-deployment readiness is crucial for stability"
❌ "This guide will help you prepare"
❌ "Important information for your situation"

GOOD EXAMPLES (DO THIS):
✅ "With a deployment in 4 months, young kids (ages 2 and 4), and stated debt concerns, getting POA and wills done NOW prevents legal emergencies if something happens while you're deployed and your spouse needs to handle finances or medical decisions."
✅ "You said you're interested in federal employment - since you're PCSing in 6 months, start browsing USAJobs for your gaining base NOW and tailor your resume during the move, not after you arrive and need income immediately."
✅ "Your 5-10 years of service puts you in prime house-hacking territory - you understand the military lifestyle well enough to pick a rental-worthy property, but young enough that the equity compounds for 15+ years before retirement."

OUTPUT FORMAT:
You MUST score EVERY SINGLE block provided in the input. Return a JSON object with a "scores" array:

{
  "scores": [
    {
      "slug": "pcs-master-checklist",
      "score": 95,
      "reason": "With orders in hand and school-age kids, you need a comprehensive checklist now to coordinate enrollment and EFMP screening before your 12-week deadline."
    },
    {
      "slug": "tsp-brs-essentials",
      "score": 45,
      "reason": "While important long-term, TSP optimization is lower priority than your imminent PCS and deployment prep."
    },
    ... (continue for ALL blocks)
  ]
}

CRITICAL: Score ALL blocks, not just the top ones. Return the full JSON structure above.`;

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
- Service Years: ${userContext.serviceYears || 'unknown'}
- Current Base: ${userContext.currentBase || 'unknown'}
- Next Base: ${userContext.nextBase || 'TBD'}
- PCS Date: ${userContext.pcsDate || 'none'}
- PCS Status: ${userContext.pcsSituation || 'none'}
- Deployment: ${userContext.deploymentStatus || 'none'}
- Family: ${userContext.familySnapshot || 'none'}
- Children: ${userContext.childrenCount ?? 'none'}
- EFMP: ${userContext.efmpEnrolled ? 'Yes' : 'No'}
- TSP Balance: ${userContext.tspRange || 'unknown'}
- Debt: ${userContext.debtRange || 'unknown'}
- Emergency Fund: ${userContext.emergencyFundRange || 'unknown'}
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
      temperature: 0.4, // Slightly higher for more creative reasoning
      max_tokens: 6000, // Need more tokens to score all 26 blocks with detailed reasoning
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

