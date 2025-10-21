import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

/**
 * CONVERT REFERRAL API
 * Processes referral conversion when a user upgrades to premium
 * Gives $10 to both referrer and referee
 * Called from Stripe webhook or upgrade flow
 */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // For webhook calls, verify using secret
    const authHeader = req.headers.get("authorization");
    const webhookSecret = process.env.REFERRAL_WEBHOOK_SECRET;
    
    let targetUserId = userId;
    
    // If called from webhook, extract user ID from body
    if (!userId && authHeader === `Bearer ${webhookSecret}`) {
      const body = await req.json();
      targetUserId = body.userId;
    }
    
    if (!targetUserId) {
      throw Errors.unauthorized();
    }

    // Process the conversion
    const { data, error } = await supabaseAdmin.rpc('process_referral_conversion', {
      p_referred_user_id: targetUserId
    });

    if (error) {
      logger.error('Referral conversion RPC failed', error, { userId: targetUserId });
      throw Errors.databaseError('Failed to process conversion');
    }

    if (!data) {
      // No pending referral found (user wasn't referred or already processed)
      return NextResponse.json({ 
        success: false, 
        message: "No pending referral found" 
      }, { status: 200 });
    }

    // Success! Send email notifications
    try {
      // Get referral details for email
      const { data: referralData } = await supabaseAdmin
        .from('referral_conversions')
        .select('referrer_user_id, referred_user_id')
        .eq('referred_user_id', targetUserId)
        .eq('status', 'rewarded')
        .single();
      
      if (referralData) {
        logger.info('Referral conversion successful', {
          referrer: referralData.referrer_user_id.substring(0, 8) + '...',
          referred: referralData.referred_user_id.substring(0, 8) + '...'
        });
        // TODO: Send email to referrer (you earned $10!)
        // TODO: Send email to referee (you got $10 credit!)
      }
    } catch (emailError) {
      logger.warn('Failed to send referral emails', {
        error: emailError instanceof Error ? emailError.message : 'Unknown'
      });
      // Don't fail the conversion if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Referral conversion processed! Both users have been credited $10."
    });

  } catch (error) {
    logger.error('Referral conversion failed', error);
    return errorResponse(error);
  }
}

