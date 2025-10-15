import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * ENHANCED INTEL LIBRARY API
 * Provides personalized, trending, and intelligent content discovery
 */

interface PersonalizedContent {
  content_id: string;
  relevance_score: number;
}

interface TrendingContent {
  content_id: string;
  trend_score: number;
  total_views: number;
}

interface SearchContent {
  content_id: string;
  relevance_score: number;
}

interface ContentBlock {
  id: string;
  relevance_score?: number;
  trend_score?: number;
  total_views?: number;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check premium status
  const { data: entitlementData } = await supabaseAdmin
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  
  const isPremium = entitlementData?.tier === "premium" && entitlementData?.status === "active";
  
  if (!isPremium) {
    return NextResponse.json(
      { error: "Premium subscription required" },
      { status: 403 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const section = searchParams.get("section") || "all"; // all, personalized, trending
  const search = searchParams.get("search") || "";
  const domain = searchParams.get("domain") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const audience = searchParams.get("audience") || "";
  const minRating = parseFloat(searchParams.get("minRating") || "0");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 20;

  try {
    let data: ContentBlock[] = [];
    let count = 0;

    // Get personalized recommendations
    if (section === "personalized") {
      const { data: personalizedData, error } = await supabaseAdmin
        .rpc('get_personalized_content', {
          p_user_id: userId,
          p_limit: pageSize
        });

      if (error) throw error;
      
      // Fetch full content details
      if (personalizedData && personalizedData.length > 0) {
        const typedData = personalizedData as PersonalizedContent[];
        const ids = typedData.map((item) => item.content_id);
        const { data: fullData } = await supabaseAdmin
          .from('content_blocks')
          .select('id, title, summary, html, domain, difficulty_level, target_audience, content_rating, content_freshness_score, est_read_min, tags, seo_keywords')
          .in('id', ids);
        
        // Merge relevance scores with full data
        data = fullData?.map((block) => {
          const match = typedData.find((p) => p.content_id === block.id);
          return {
            ...block,
            relevance_score: match?.relevance_score || 0
          };
        }) || [];
        
        // Sort by relevance score
        data.sort((a: ContentBlock, b: ContentBlock) => (b.relevance_score || 0) - (a.relevance_score || 0));
        count = data.length;
      }
    }
    // Get trending content
    else if (section === "trending") {
      const { data: trendingData, error } = await supabaseAdmin
        .rpc('get_trending_content', {
          p_days: 7,
          p_limit: pageSize
        });

      if (error) throw error;
      
      // Fetch full content details
      if (trendingData && trendingData.length > 0) {
        const typedData = trendingData as TrendingContent[];
        const ids = typedData.map((item) => item.content_id);
        const { data: fullData } = await supabaseAdmin
          .from('content_blocks')
          .select('id, title, summary, html, domain, difficulty_level, target_audience, content_rating, content_freshness_score, est_read_min, tags, seo_keywords')
          .in('id', ids);
        
        // Merge trend scores with full data
        data = fullData?.map((block) => {
          const match = typedData.find((t) => t.content_id === block.id);
          return {
            ...block,
            trend_score: match?.trend_score || 0,
            total_views: match?.total_views || 0
          };
        }) || [];
        
        // Sort by trend score
        data.sort((a: ContentBlock, b: ContentBlock) => (b.trend_score || 0) - (a.trend_score || 0));
        count = data.length;
      }
    }
    // Use advanced search for keyword searches
    else if (search) {
      const { data: searchData, error } = await supabaseAdmin
        .rpc('search_content', {
          p_search_query: search,
          p_domain: domain || null,
          p_difficulty_level: difficulty || null,
          p_target_audience: audience || null,
          p_min_rating: minRating,
          p_limit: pageSize * 3 // Get more results for pagination
        });

      if (error) throw error;
      
      // Fetch full content details
      if (searchData && searchData.length > 0) {
        const typedData = searchData as SearchContent[];
        const ids = typedData.map((item) => item.content_id);
        const { data: fullData } = await supabaseAdmin
          .from('content_blocks')
          .select('id, title, summary, html, domain, difficulty_level, target_audience, content_rating, content_freshness_score, est_read_min, tags, seo_keywords')
          .in('id', ids);
        
        // Merge relevance scores with full data
        data = fullData?.map((block) => {
          const match = typedData.find((s) => s.content_id === block.id);
          return {
            ...block,
            relevance_score: match?.relevance_score || 0
          };
        }) || [];
        
        // Sort by relevance score
        data.sort((a: ContentBlock, b: ContentBlock) => (b.relevance_score || 0) - (a.relevance_score || 0));
        count = data.length;
        
        // Apply pagination
        const offset = (page - 1) * pageSize;
        data = data.slice(offset, offset + pageSize);
      }
    }
    // Standard filtered browsing
    else {
      let query = supabaseAdmin
        .from("content_blocks")
        .select("id, title, summary, html, domain, difficulty_level, target_audience, content_rating, content_freshness_score, est_read_min, tags, seo_keywords", { count: "exact" });

      // Apply filters
      if (domain) {
        query = query.eq("domain", domain);
      }
      if (difficulty) {
        query = query.eq("difficulty_level", difficulty);
      }
      if (audience) {
        query = query.contains("target_audience", [audience]);
      }
      if (minRating > 0) {
        query = query.gte("content_rating", minRating);
      }

      // Apply pagination and ordering
      const offset = (page - 1) * pageSize;
      query = query
        .order("content_rating", { ascending: false })
        .order("title", { ascending: true })
        .range(offset, offset + pageSize - 1);

      const { data: queryData, error, count: queryCount } = await query;

      if (error) throw error;
      
      data = queryData || [];
      count = queryCount || 0;
    }

    return NextResponse.json({
      success: true,
      data: data,
      pagination: {
        page,
        pageSize,
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
      },
      section,
    });
  } catch (error) {
    console.error("[Enhanced Library API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

