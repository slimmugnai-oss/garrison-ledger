import { auth , currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();
    
    const { allowed } = await checkAndIncrement(userId, "/api/support/refund", 10);
    if (!allowed) throw Errors.rateLimitExceeded("Too many refund requests. Please wait before trying again.");

    const body = await req.json().catch(() => ({}));
    const reason = String(body?.reason || "").slice(0, 2000);

    if (!reason || reason.trim().length === 0) {
      throw Errors.invalidInput('Reason for refund is required');
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: ent } = await sb.from("entitlements")
      .select("stripe_subscription_id, status")
      .eq("user_id", userId).maybeSingle();

    const { error: insertError } = await sb.from("refund_requests").insert({
      user_id: userId,
      email,
      reason,
      stripe_subscription_id: ent?.stripe_subscription_id ?? null
    });

    if (insertError) {
      logger.error('[SupportRefund] Failed to create refund request', insertError, { userId, email: email?.split('@')[1] });
      throw Errors.databaseError('Failed to submit refund request');
    }

    // We log the request and process manually; optional: auto-refund if within 7 days.
    // If you want auto-refund later, add a created_at check against entitlements and call Stripe refunds API.

    logger.info('[SupportRefund] Refund request submitted', { userId, email: email?.split('@')[1], hasSubscription: !!ent?.stripe_subscription_id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

