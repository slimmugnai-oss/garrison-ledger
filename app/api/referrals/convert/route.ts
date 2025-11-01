import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { errorResponse, Errors } from "@/lib/api-errors";
import { 
  renderReferralEarned, 
  renderReferralReceived, 
  getEmailSubject 
} from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      // Get referral details and user info for emails
      const { data: referralData } = await supabaseAdmin
        .from('referral_conversions')
        .select('referrer_user_id, referred_user_id')
        .eq('referred_user_id', targetUserId)
        .eq('status', 'rewarded')
        .single();
      
      if (referralData && process.env.RESEND_API_KEY) {
        // Get both users' profile info from Clerk
        const referrerUserId = referralData.referrer_user_id;
        const referredUserId = referralData.referred_user_id;

        // Get total credits for referrer
        const { data: totalCredits } = await supabaseAdmin
          .rpc('get_user_credit_balance', { p_user_id: referrerUserId });

        // Get user profiles for names and emails
        const { data: referrerProfile } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('id', referrerUserId)
          .single();

        const { data: referredProfile } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('id', referredUserId)
          .single();

        // Send email to referrer (you earned $10!)
        if (referrerProfile?.email) {
          const referrerHtml = await renderReferralEarned(
            "there", // Default greeting (we don't have firstName in profiles)
            "a friend", // Don't expose referred user's identity
            10, // $10
            (totalCredits || 0) / 100 // Total credits in dollars
          );

          await resend.emails.send({
            from: "Garrison Ledger <noreply@garrisonledger.com>",
            to: referrerProfile.email,
            subject: getEmailSubject('referral_earned', "there"),
            html: referrerHtml,
          });

          logger.info('[ReferralConvert] Email sent to referrer', { 
            userId: referrerUserId.substring(0, 8) + '...' 
          });
        }

        // Send email to referee (you got $10 credit!)
        if (referredProfile?.email) {
          const referredHtml = await renderReferralReceived(
            "there", // Default greeting
            10, // $10
            "a friend" // Don't expose referrer's identity
          );

          await resend.emails.send({
            from: "Garrison Ledger <noreply@garrisonledger.com>",
            to: referredProfile.email,
            subject: getEmailSubject('referral_received'),
            html: referredHtml,
          });

          logger.info('[ReferralConvert] Email sent to referee', { 
            userId: referredUserId.substring(0, 8) + '...' 
          });
        }
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

