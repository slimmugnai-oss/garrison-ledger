import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * CONTENT ENRICHMENT TRIAGE API
 * Uses Gemini 2.0 Flash to score RSS feed items for evergreen value
 * Scores 1-10: ≥8 = excellent (auto-convert), 6-7 = review, <6 = news only
 */

const TRIAGE_PROMPT = `You are a military financial content expert evaluating articles for evergreen value.

Score this article 1-10 based on these criteria:

1. **Evergreen Value** (40% weight)
   - 10 = Timeless advice that's relevant for years
   - 5 = Some timeless elements but tied to specific events
   - 1 = Pure breaking news with no lasting value

2. **Actionable Guidance** (30% weight)
   - 10 = Step-by-step instructions, concrete actions
   - 5 = General advice, some actionable elements
   - 1 = Informational only, no clear actions

3. **Military-Specific** (20% weight)
   - 10 = TSP, BAH, PCS, deployment, military benefits
   - 5 = General finance with some military mentions
   - 1 = Generic finance, not military-focused

4. **Expert Depth** (10% weight)
   - 10 = Comprehensive, nuanced, expert-level
   - 5 = Decent coverage, some depth
   - 1 = Superficial, surface-level only

Return ONLY valid JSON (no markdown, no extra text):
{
  "score": 8.5,
  "reasoning": "Excellent TSP contribution guide with specific fund allocation strategies. Timeless advice, very actionable, military-specific.",
  "domain": "finance",
  "difficulty": "intermediate",
  "target_audience": ["military-member", "officer"],
  "keywords": ["tsp", "retirement", "brs", "fund-allocation"],
  "suggested_title": "Complete Guide to Maximizing Your TSP in 2025",
  "suggested_summary": "Expert strategies for TSP fund allocation, contribution optimization, and retirement planning for military members under BRS."
}

ARTICLE TO SCORE:
Title: {title}
Summary: {summary}
Content Preview: {content}

Return JSON only:`;

export async function POST(req: NextRequest) {
  try {
    // Auth check (admin only or cron)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { feedItemId } = body;

    if (!feedItemId) {
      return NextResponse.json({ error: "feed_item_id required" }, { status: 400 });
    }

    // Get feed item
    const { data: feedItem, error: fetchError } = await supabaseAdmin
      .from('feed_items')
      .select('*')
      .eq('id', feedItemId)
      .single();

    if (fetchError || !feedItem) {
      return NextResponse.json({ error: "Feed item not found" }, { status: 404 });
    }

    // Prepare content for Gemini (limit to 2000 chars to save tokens)
    const contentPreview = feedItem.raw_html
      ?.replace(/<[^>]*>/g, ' ') // Strip HTML
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 2000) || '';

    const prompt = TRIAGE_PROMPT
      .replace('{title}', feedItem.title || '')
      .replace('{summary}', feedItem.summary || '')
      .replace('{content}', contentPreview);

    // Call Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let triageData;
    try {
      // Remove markdown code blocks if present
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      triageData = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ 
        error: "Failed to parse AI response",
        raw: responseText 
      }, { status: 500 });
    }

    // Validate score
    if (typeof triageData.score !== 'number' || triageData.score < 1 || triageData.score > 10) {
      return NextResponse.json({ error: "Invalid score from AI" }, { status: 500 });
    }

    // Store triage result
    const { error: updateError } = await supabaseAdmin
      .from('feed_items')
      .update({
        status: triageData.score >= 8 ? 'approved_for_conversion' : 
                triageData.score >= 6 ? 'needs_review' : 
                'news_only',
        // Store enrichment data in a metadata field (you may need to add this column)
      })
      .eq('id', feedItemId);

    if (updateError) {
    }

    return NextResponse.json({
      success: true,
      feedItemId,
      score: triageData.score,
      recommendation: triageData.score >= 8 ? 'Convert to content block' :
                     triageData.score >= 6 ? 'Review manually' :
                     'Keep as news only',
      enrichment: triageData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

