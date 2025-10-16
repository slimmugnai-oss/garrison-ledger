import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * BATCH ENRICHMENT API
 * Processes multiple feed items in a batch
 * Intended for weekly cron job
 */

const TRIAGE_PROMPT_TEMPLATE = `You are a military financial content expert. Score this article 1-10 for evergreen value.

Criteria:
- Evergreen value (timeless vs breaking news)
- Actionable guidance (step-by-step vs just info)
- Military-specific (TSP/BAH/PCS vs generic)
- Expert depth (comprehensive vs superficial)

Return ONLY valid JSON:
{
  "score": 8.5,
  "reasoning": "...",
  "domain": "finance|career|pcs|deployment|lifestyle",
  "difficulty": "beginner|intermediate|advanced",
  "target_audience": ["military-member", "military-spouse", "officer", "enlisted"],
  "keywords": ["tsp", "retirement"],
  "suggested_title": "...",
  "suggested_summary": "..."
}`;

export async function GET(req: NextRequest) {
  try {
    // Verify authorization (cron secret)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unprocessed feed items (status = 'new')
    const { data: feedItems, error: fetchError } = await supabaseAdmin
      .from('feed_items')
      .select('id, title, summary, raw_html, url')
      .eq('status', 'new')
      .order('published_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error("[Batch Triage] Fetch error:", fetchError);
      throw fetchError;
    }

    if (!feedItems || feedItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new feed items to process",
        processed: 0,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const results = {
      processed: 0,
      approved: 0, // score ≥ 8
      needsReview: 0, // score 6-7
      newsOnly: 0, // score < 6
      errors: [] as string[],
    };

    // Process each item (with rate limiting)
    for (const item of feedItems) {
      try {
        const contentPreview = item.raw_html
          ?.replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 1500) || '';

        const prompt = `${TRIAGE_PROMPT_TEMPLATE}

ARTICLE:
Title: ${item.title}
Summary: ${item.summary || 'N/A'}
Content: ${contentPreview}

Return JSON:`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse response
        const cleanJson = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const enrichment = JSON.parse(cleanJson);

        // Determine status based on score
        let newStatus = 'news_only';
        if (enrichment.score >= 8) {
          newStatus = 'approved_for_conversion';
          results.approved++;
        } else if (enrichment.score >= 6) {
          newStatus = 'needs_review';
          results.needsReview++;
        } else {
          results.newsOnly++;
        }

        // Update feed item with triage results
        await supabaseAdmin
          .from('feed_items')
          .update({
            status: newStatus,
            // Store enrichment in metadata column (add this column if needed)
          })
          .eq('id', item.id);

        results.processed++;

        // Rate limit: 1 request per 2 seconds (Gemini free tier)
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (itemError) {
        console.error(`[Batch Triage] Error processing ${item.id}:`, itemError);
        results.errors.push(`${item.id}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[Batch Triage] Fatal error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

