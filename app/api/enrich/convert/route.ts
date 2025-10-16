import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * CONVERT FEED ITEM TO CONTENT BLOCK
 * Takes an approved feed item and converts it to a curated content block
 * Adds to Intelligence Library for AI plan generation
 */

export async function POST(req: NextRequest) {
  try {
    // Auth check (admin only)
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.ADMIN_API_SECRET;
    
    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { feedItemId, enrichment } = body;

    if (!feedItemId || !enrichment) {
      return NextResponse.json({ 
        error: "feed_item_id and enrichment data required" 
      }, { status: 400 });
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

    // Check if already converted
    if (feedItem.status === 'converted') {
      return NextResponse.json({ 
        error: "Feed item already converted" 
      }, { status: 400 });
    }

    // Create content block from feed item + enrichment
    const contentBlock = {
      title: enrichment.suggested_title || feedItem.title,
      summary: enrichment.suggested_summary || feedItem.summary,
      html: feedItem.raw_html,
      domain: enrichment.domain || 'general',
      difficulty_level: enrichment.difficulty || 'intermediate',
      target_audience: enrichment.target_audience || ['military-member'],
      tags: enrichment.keywords || feedItem.tags || [],
      seo_keywords: enrichment.keywords || [],
      content_rating: Math.max(3.0, enrichment.score * 0.5), // Convert 1-10 to 0.5-5.0
      content_freshness_score: 5.0, // New content gets max freshness
      est_read_min: Math.ceil((feedItem.raw_html?.length || 0) / 1000), // ~1000 chars/min
      source_type: 'ai_enriched',
      source_url: feedItem.url,
      created_at: new Date().toISOString(),
    };

    // Insert into content_blocks
    const { data: newBlock, error: insertError } = await supabaseAdmin
      .from('content_blocks')
      .insert(contentBlock)
      .select()
      .single();

    if (insertError) {
      console.error("[Convert] Failed to create content block:", insertError);
      return NextResponse.json({ 
        error: "Failed to create content block",
        details: insertError.message 
      }, { status: 500 });
    }

    // Mark feed item as converted
    await supabaseAdmin
      .from('feed_items')
      .update({ 
        status: 'converted',
        // Store reference to created block
      })
      .eq('id', feedItemId);

    return NextResponse.json({
      success: true,
      feedItemId,
      contentBlockId: newBlock.id,
      message: "Feed item successfully converted to content block",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[Convert] Fatal error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

