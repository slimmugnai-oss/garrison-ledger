import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: ent } = await sb.from("entitlements").select("stripe_customer_id, tier, status").eq("user_id", userId).maybeSingle();
  
  
  let customerId = ent?.stripe_customer_id;
  
  // Fallback: If no customer ID in DB, try to find by email in Stripe
  if (!customerId && ent?.tier === 'premium') {
    try {
      const email = req.headers.get("x-user-email"); // We'll need to pass this
      if (email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          // Update DB with found customer ID
          await sb.from("entitlements").update({ stripe_customer_id: customerId }).eq("user_id", userId);
        }
      }
    } catch (err) {
      logger.warn('[BillingPortal] Failed to find Stripe customer by email', { userId, error: err });
    }
  }
  
  if (!customerId) {
    logger.warn('[BillingPortal] No Stripe customer found', { userId, tier: ent?.tier });
    throw Errors.invalidInput("No Stripe customer found. Please contact support to link your account");
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://garrison-ledger.vercel.app";
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard`
  });

  logger.info('[BillingPortal] Portal session created', { userId, customerId });
  return NextResponse.json({ url: session.url });
  } catch (error) {
    return errorResponse(error);
  }
}

