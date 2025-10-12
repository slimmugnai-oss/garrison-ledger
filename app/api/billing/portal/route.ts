import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: ent, error: entError } = await sb.from("entitlements").select("stripe_customer_id, tier, status").eq("user_id", userId).maybeSingle();
  
  console.log('[Billing Portal] User:', userId, 'Entitlement:', ent, 'Error:', entError);
  
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
          console.log('[Billing Portal] Found and saved customer ID:', customerId);
        }
      }
    } catch (err) {
      console.error('[Billing Portal] Stripe lookup failed:', err);
    }
  }
  
  if (!customerId) {
    console.error('[Billing Portal] No customer ID found for user:', userId);
    return NextResponse.json({ 
      error: "No Stripe customer found",
      message: "Your subscription exists but Stripe customer ID is missing. Please contact support to link your account.",
      debug: { hasEntitlement: !!ent, tier: ent?.tier, status: ent?.status }
    }, { status: 400 });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://garrison-ledger.vercel.app";
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard`
  });

  return NextResponse.json({ url: session.url });
}

