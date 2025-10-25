import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level") || "all";
    const source = searchParams.get("source") || "all";
    const timeRange = searchParams.get("timeRange") || "24h";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate time range
    const now = new Date();
    const timeRanges: Record<string, Date> = {
      "1h": new Date(now.getTime() - 60 * 60 * 1000),
      "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
      "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    const startTime = timeRanges[timeRange] || timeRanges["24h"];

    // Build query
    let query = supabase
      .from("error_logs")
      .select("*", { count: "exact" })
      .gte("created_at", startTime.toISOString());

    if (level !== "all") {
      query = query.eq("level", level);
    }

    if (source !== "all") {
      query = query.eq("source", source);
    }

    const {
      data: logs,
      count,
      error: logsError,
    } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (logsError) throw logsError;

    // Get unique sources for filter dropdown
    const { data: sources } = await supabase
      .from("error_logs")
      .select("source")
      .gte("created_at", startTime.toISOString());

    const uniqueSources = [...new Set(sources?.map((s) => s.source) || [])];

    // Group by message for error counts
    const grouped = logs?.reduce(
      (acc: Record<string, { count: number; level: string; latest: string }>, log) => {
        const key = log.message;
        if (!acc[key]) {
          acc[key] = { count: 0, level: log.level, latest: log.created_at };
        }
        acc[key].count++;
        if (new Date(log.created_at) > new Date(acc[key].latest)) {
          acc[key].latest = log.created_at;
        }
        return acc;
      },
      {}
    );

    const errorGroups = Object.entries(grouped || {})
      .map(([message, data]) => ({
        message,
        count: data.count,
        level: data.level,
        latest: data.latest,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      logs: logs || [],
      errorGroups,
      uniqueSources,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
