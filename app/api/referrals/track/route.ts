import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * TRACK REFERRAL API
 * Records when a new user signs up with a referral code
 * Called after account creation
 */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 });
    }

    // Record the referral using database function
    const { data, error } = await supabaseAdmin.rpc('record_referral_usage', {
      p_code: referralCode.toUpperCase(),
      p_referred_user_id: userId
    });

    if (error) {
      return NextResponse.json({ error: "Failed to record referral" }, { status: 500 });
    }

    if (!data) {
      // Invalid code or user already referred
      return NextResponse.json({ 
        success: false, 
        message: "Invalid referral code or already used" 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Referral recorded! You'll get $10 credit when you upgrade to premium."
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

