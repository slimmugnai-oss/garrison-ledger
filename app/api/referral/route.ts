import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * REFERRAL SYSTEM
 * Generate referral codes, track referrals, reward both parties
 */

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user's referral code (create if doesn't exist)
  const referralCode = userId.slice(0, 8).toUpperCase();

  // Get referral stats
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId);

    const totalReferrals = referrals?.length || 0;
    const activeReferrals = referrals?.filter(r => r.status === 'active').length || 0;

    logger.info('[Referral] Referral data fetched', { userId, totalReferrals, activeReferrals });
    return NextResponse.json({
      referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_SITE_URL}/?ref=${referralCode}`,
      totalReferrals,
      activeReferrals,
      referrals: referrals || []
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    let body: { referredUserId: string };
    try {
      body = await req.json();
    } catch {
      logger.warn('[Referral] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    if (!body.referredUserId) {
      throw Errors.invalidInput('referredUserId is required');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Record referral
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: userId,
        referred_id: body.referredUserId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('[Referral] Failed to create referral', error, { userId, referredUserId: body.referredUserId });
      throw Errors.databaseError('Failed to create referral');
    }

    logger.info('[Referral] Referral created', { userId, referredUserId: body.referredUserId });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

