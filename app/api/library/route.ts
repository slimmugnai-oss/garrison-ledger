import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * INTEL LIBRARY API ENDPOINT
 * Protected endpoint for premium users to search and filter atomic content blocks
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Intelligence Library is now available to free users (5/day limit) and premium users (unlimited)
    // Rate limiting is handled by the frontend and /api/library/can-view endpoint
  
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const source = searchParams.get("source") || ""; // Using source_page field
    const type = searchParams.get("type") || "";
    const topic = searchParams.get("topic") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from("content_blocks")
      .select("id, title, summary, html, source_page, type, topics, tags, est_read_min, block_type", { count: "exact" });

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,text_content.ilike.%${search}%`);
    }

    // Apply source filter (source_page field)
    if (source) {
      query = query.eq("source_page", source);
    }

    // Apply type filter
    if (type) {
      query = query.eq("type", type);
    }

    // Apply topic filter (array contains)
    if (topic) {
      query = query.contains("topics", [topic]);
    }

    // Apply pagination and ordering
    query = query
      .order("title", { ascending: true })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('[Library] Failed to fetch content blocks', error, { userId, search, source, type, topic });
      throw Errors.databaseError("Failed to fetch content blocks");
    }

    logger.info('[Library] Content fetched', { userId, resultCount: data?.length || 0, page, filters: { search, source, type, topic } });
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

