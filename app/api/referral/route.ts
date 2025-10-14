import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * REFERRAL SYSTEM
 * Generate referral codes, track referrals, reward both parties
 */

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({
    referralCode,
    referralLink: `${process.env.NEXT_PUBLIC_SITE_URL}/?ref=${referralCode}`,
    totalReferrals,
    activeReferrals,
    referrals: referrals || []
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { referredUserId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

