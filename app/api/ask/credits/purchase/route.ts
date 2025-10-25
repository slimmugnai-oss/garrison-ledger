/**
 * ASK ASSISTANT - Credit Pack Purchase
 *
 * Creates Stripe checkout sessions for credit pack purchases
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { ssot } from "@/lib/ssot";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

interface PurchaseRequest {
  packSize: number; // 25, 100, or 250
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PurchaseRequest = await request.json();
    const { packSize } = body;

    // Validate pack size
    const validPacks = ssot.features.askAssistant.creditPacks;
    const packConfig = validPacks.find((p) => p.credits === packSize);

    if (!packConfig) {
      return NextResponse.json(
        {
          error: "Invalid pack size",
          validSizes: validPacks.map((p) => p.credits),
        },
        { status: 400 }
      );
    }

    // Get user's email for Stripe
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", userId)
      .single();

    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Map pack size to Stripe price ID
    const priceIdMap: Record<number, string> = {
      25: "price_1SLShbQnBqVFfU8hmlMX4OAw",
      100: "price_1SLSjiQnBqVFfU8hQM482yKn",
      250: "price_1SLSkfQnBqVFfU8hYGhP4kXE",
    };

    const priceId = priceIdMap[packSize];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid pack size" }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/ask?success=true&credits=${packSize}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/ask?cancelled=true`,
      customer_email: user.email,
      metadata: {
        user_id: userId,
        pack_size: packSize.toString(),
        feature: "ask_assistant_credits",
      },
    });

    // Store purchase record
    const { error: insertError } = await supabase.from("ask_credit_purchases").insert({
      user_id: userId,
      pack_size: packSize,
      price_cents: packConfig.priceCents,
      stripe_payment_intent_id: session.payment_intent as string,
      status: "pending",
    });

    if (insertError) {
      console.error("Failed to store purchase record:", insertError);
    }

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error("Credit purchase error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
