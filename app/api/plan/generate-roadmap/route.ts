/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * EXECUTIVE ROADMAP GENERATOR - GPT-4o
 * Generates executive summary + section introductions for personalized plan
 */

type UserContext = {
  rank?: string | null;
  branch?: string | null;
  currentBase?: string | null;
  nextBase?: string | null;
  pcsDate?: string | null;
  childrenCount?: number | null;
  efmpEnrolled?: boolean | null;
  tspRange?: string | null;
  debtRange?: string | null;
  emergencyFundRange?: string | null;
  careerInterests?: string[] | null;
  financialPriorities?: string[] | null;
};

type BlockSummary = {
  slug: string;
  title: string;
  domain: string; // pcs, career, finance, deployment
};

type RoadmapOutput = {
  executiveSummary: string;
  sections: {
    domain: string;
    title: string;
    intro: string;
  }[];
};

const ROADMAP_PROMPT = `You are a senior military life strategist creating a personalized executive roadmap.

Your task: Write an executive summary and section introductions for a service member's personalized plan.

CRITICAL RULES:
- Reference SPECIFIC details from their profile (rank, base, timeline, numbers, ages)
- NO generic corporate speak ("this is important", "we're here to help")
- Write like a knowledgeable friend giving real talk
- Keep executive summary to 200-250 words
- Keep section intros to 100-150 words each
- Use second person ("you", "your") not third person
- Include tactical timelines and consequences when relevant

EXECUTIVE SUMMARY STRUCTURE:
1. Open with their current situation (rank, base, family, upcoming events)
2. Identify their top 2-3 strategic priorities
3. Connect priorities to their specific circumstances
4. Set context for why this plan matters NOW
5. End with encouragement that acknowledges their complexity

SECTION INTRO STRUCTURE:
1. Why this domain matters for THEM specifically
2. Reference their timeline/situation
3. What they'll find in this section
4. Keep it tactical and grounded

EXAMPLES OF GOOD VS BAD:

BAD EXECUTIVE SUMMARY:
"You're at an important stage in your military career. We've created this plan to help you navigate your journey. Financial planning is crucial for service members."

GOOD EXECUTIVE SUMMARY:
"As an E-5 at Fort Liberty with 6 years in and two kids (ages 3 and 6), you're juggling a complex 8-week window: PCS orders to JBLM plus deployment prep starting in 4 months. Your $18K debt and $5K emergency fund make this high-stakes—missing your kids' school enrollment deadline or deployment financial prep could cascade into serious problems. This plan tackles three priorities: (1) PCS execution with school coordination, (2) deployment financial/legal readiness, (3) long-term federal employment prep since you flagged that interest. Your $52K TSP at 6 years is solid—you're ahead of 70% of E-5s—but the next 12 weeks will determine whether you maintain that momentum or lose ground."

BAD SECTION INTRO (PCS):
"This section contains important information about PCS. Moving can be stressful, so we've compiled helpful resources."

GOOD SECTION INTRO (PCS):
"Your 8-week window to JBLM is tight with school-age kids. Your 6-year-old needs kindergarten enrollment by mid-August—miss that deadline and you're homeschooling until January. Your 3-year-old will need childcare (JBLM waitlists run 2-3 months). This section breaks down the critical path: TMO scheduling, school paperwork, BAH adjustment ($2,100 at JBLM vs $2,400 here), and EFMP coordination if applicable."

OUTPUT FORMAT (JSON):
{
  "executiveSummary": "...",
  "sections": [
    {
      "domain": "pcs",
      "title": "Your 8-Week PCS Battle Plan",
      "intro": "..."
    },
    {
      "domain": "career",
      "title": "Federal Employment Transition",
      "intro": "..."
    }
  ]
}`;

export async function POST(req: NextRequest) {
  // Auth check
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
    userContext: UserContext;
    blocks: BlockSummary[];
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
- Rank: ${userContext.rank || 'not specified'}
- Branch: ${userContext.branch || 'not specified'}
- Current Base: ${userContext.currentBase || 'not specified'}
- Next Base: ${userContext.nextBase || 'TBD'}
- PCS Date: ${userContext.pcsDate || 'none'}
- Children: ${userContext.childrenCount ?? 'none'}
- EFMP: ${userContext.efmpEnrolled ? 'Yes' : 'No'}
- TSP Balance: ${userContext.tspRange || 'not specified'}
- Debt: ${userContext.debtRange || 'not specified'}
- Emergency Fund: ${userContext.emergencyFundRange || 'not specified'}
- Career Interests: ${userContext.careerInterests?.join(', ') || 'none specified'}
- Financial Priorities: ${userContext.financialPriorities?.join(', ') || 'none specified'}`;

    // Group blocks by domain
    const domainGroups: Record<string, BlockSummary[]> = {};
    blocks.forEach(b => {
      if (!domainGroups[b.domain]) domainGroups[b.domain] = [];
      domainGroups[b.domain].push(b);
    });

    const blocksSummary = Object.entries(domainGroups)
      .map(([domain, domainBlocks]) => {
        return `${domain.toUpperCase()} (${domainBlocks.length} blocks):
${domainBlocks.map(b => `  - ${b.title}`).join('\n')}`;
      })
      .join('\n\n');

    const userPrompt = `${contextSummary}

PLAN STRUCTURE:

${blocksSummary}

Write an executive summary that sets strategic context for this member's situation, plus an introduction for each domain section that explains why it matters for THEM specifically.`;

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ROADMAP_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Higher for more engaging prose
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Parse response
    let roadmap: RoadmapOutput;
    try {
      roadmap = JSON.parse(responseText);
      
      // Validate structure
      if (!roadmap.executiveSummary || !Array.isArray(roadmap.sections)) {
        throw new Error('Invalid roadmap structure');
      }
    } catch (parseError) {
      console.error('[Generate Roadmap] Failed to parse GPT-4o response:', responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roadmap,
      model: "gpt-4o",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Generate Roadmap] OpenAI error:', error);
    return NextResponse.json(
      {
        error: "Roadmap generation failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

