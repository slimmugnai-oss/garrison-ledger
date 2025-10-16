import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * REFERRAL LEADERBOARD API
 * Returns top referrers (public leaderboard)
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get leaderboard
    const { data, error } = await supabaseAdmin.rpc('get_referral_leaderboard', {
      p_limit: Math.min(limit, 50) // Max 50
    });

    if (error) {
      console.error("[Referral Leaderboard] Error:", error);
      throw error;
    }

    // Anonymize user IDs (show only first 8 chars)
    const anonymizedData = (data || []).map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id?.slice(0, 8) + "...",
      conversions: entry.total_conversions,
      earnings: entry.total_earnings_cents,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: anonymizedData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[Referral Leaderboard] Fatal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

