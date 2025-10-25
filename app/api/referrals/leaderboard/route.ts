import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * REFERRAL LEADERBOARD API
 * Returns top referrers (public leaderboard)
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (limit < 1 || limit > 50) {
      throw Errors.invalidInput('Limit must be between 1 and 50');
    }

    // Get leaderboard
    const { data, error } = await supabaseAdmin.rpc('get_referral_leaderboard', {
      p_limit: limit
    });

    if (error) {
      logger.error('[ReferralLeaderboard] Failed to fetch leaderboard', error, { limit });
      throw Errors.databaseError('Failed to fetch referral leaderboard');
    }

    // Anonymize user IDs (show only first 8 chars)
    const anonymizedData = (data || []).map((entry: { user_id: string; total_conversions: number; total_earnings_cents: number }, index: number) => ({
      rank: index + 1,
      userId: entry.user_id?.slice(0, 8) + "...",
      conversions: entry.total_conversions,
      earnings: entry.total_earnings_cents,
    }));

    logger.info('[ReferralLeaderboard] Leaderboard fetched', { count: anonymizedData.length, limit });
    return NextResponse.json({
      success: true,
      leaderboard: anonymizedData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return errorResponse(error);
  }
}

