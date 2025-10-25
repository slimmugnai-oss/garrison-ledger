import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * LISTENING POST API
 * Serves RSS feed items (news articles) from feed_items table
 * Separate from Intelligence Library (content_blocks)
 */

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const searchParams = req.nextUrl.searchParams;
    const tag = searchParams.get("tag") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (limit < 1 || limit > 100) {
      throw Errors.invalidInput('Limit must be between 1 and 100');
    }

    // Query feed_items (not content_blocks)
    let query = supabaseAdmin
      .from("feed_items")
      .select("id, source_id, url, title, summary, tags, published_at, status")
      .eq("status", "new") // Only show processed items
      .order("published_at", { ascending: false })
      .limit(limit);

    // Filter by tag if provided
    if (tag && tag !== "all") {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('[ListeningPost] Failed to fetch feed items', error, { userId, tag, limit });
      throw Errors.databaseError('Failed to fetch news items');
    }

    logger.info('[ListeningPost] Feed items fetched', { userId, count: data?.length || 0, tag, limit });
    return NextResponse.json({
      success: true,
      items: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

