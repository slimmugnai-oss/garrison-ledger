import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * INTEL LIBRARY API ENDPOINT
 * Protected endpoint for premium users to search and filter atomic content blocks
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check premium status
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  
  const { data: entitlementData } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  
  type EntitlementRow = {
    tier: string | null;
    status: string | null;
  };
  
  const entitlement = entitlementData as EntitlementRow | null;
  const isPremium = entitlement?.tier === "premium" && entitlement?.status === "active";
  
  // Intelligence Library is now available to free users (5/day limit) and premium users (unlimited)
  // Rate limiting is handled by the frontend and /api/library/can-view endpoint

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const source = searchParams.get("source") || ""; // Using source_page field
  const type = searchParams.get("type") || "";
  const topic = searchParams.get("topic") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  try {
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
      console.error("[Library API] Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch content blocks" },
        { status: 500 }
      );
    }

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
    console.error("[Library API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

