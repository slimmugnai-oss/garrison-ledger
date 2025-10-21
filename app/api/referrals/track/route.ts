import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "nodejs";

/**
 * TRACK REFERRAL API
 * Records when a new user signs up with a referral code
 * Called after account creation
 */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await req.json();
    const { referralCode } = body;

    if (!referralCode) {
      throw Errors.invalidInput("Referral code is required");
    }

    // Record the referral using database function
    const { data, error } = await supabaseAdmin.rpc('record_referral_usage', {
      p_code: referralCode.toUpperCase(),
      p_referred_user_id: userId
    });

    if (error) {
      logger.error('[ReferralTrack] Failed to record referral', error, { userId, referralCode });
      throw Errors.databaseError("Failed to record referral");
    }

    if (!data) {
      // Invalid code or user already referred
      logger.warn('[ReferralTrack] Invalid or already used code', { userId, referralCode });
      return NextResponse.json({ 
        success: false, 
        message: "Invalid referral code or already used" 
      }, { status: 400 });
    }

    logger.info('[ReferralTrack] Referral recorded', { userId, referralCode });
    return NextResponse.json({
      success: true,
      message: "Referral recorded! You'll get $10 credit when you upgrade to premium."
    });

  } catch (error) {
    return errorResponse(error);
  }
}

