import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * REFERRAL STATS API
 * Returns referral statistics for ReferralProgress widget
 * Used by: app/components/dashboard/ReferralProgress.tsx
 */

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Get referral code (creates one if doesn't exist)
    const { data: code, error: codeError } = await supabaseAdmin
      .rpc('get_or_create_referral_code', { p_user_id: userId });

    if (codeError) {
      logger.error('[ReferralStats] Failed to get referral code', codeError, { userId });
      throw Errors.databaseError("Failed to fetch referral code");
    }

    // Get stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_referral_stats')
      .select('total_conversions')
      .eq('user_id', userId)
      .maybeSingle();

    if (statsError) {
      logger.error('[ReferralStats] Failed to get stats', statsError, { userId });
      throw Errors.databaseError("Failed to fetch referral stats");
    }

    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/sign-up?ref=${code}`;

    logger.info('[ReferralStats] Stats fetched', { 
      userId, 
      code, 
      count: stats?.total_conversions || 0 
    });

    return NextResponse.json({
      count: stats?.total_conversions || 0,
      referralLink
    });

  } catch (error) {
    return errorResponse(error);
  }
}

