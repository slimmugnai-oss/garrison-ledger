import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * LISTENING POST API
 * Serves RSS feed items (news articles) from feed_items table
 * Separate from Intelligence Library (content_blocks)
 */

export async function GET(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const tag = searchParams.get("tag") || "";
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
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
      console.error("[Listening Post API] Error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      items: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Listening Post API] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

