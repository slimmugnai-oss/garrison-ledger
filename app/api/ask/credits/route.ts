/**
 * ASK ASSISTANT - Credits Management
 *
 * Handles credit balance checking and initialization
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ssot } from "@/lib/ssot";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current credits
    const { data: credits, error } = await supabase
      .from("ask_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
    }

    // If no credits record, initialize
    if (!credits) {
      return await initializeCredits(userId);
    }

    // Check if credits expired (monthly refresh)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const creditsDate = new Date(credits.created_at);

    if (creditsDate < lastMonth) {
      return await refreshMonthlyCredits(userId, credits);
    }

    return NextResponse.json({
      success: true,
      credits_remaining: credits.credits_remaining,
      credits_total: credits.credits_total,
      tier: credits.tier,
      expires_at: credits.expires_at,
    });
  } catch (error) {
    console.error("Credits GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "initialize") {
      return await initializeCredits(userId);
    }

    if (action === "refresh") {
      const { data: credits } = await supabase
        .from("ask_credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!credits) {
        return NextResponse.json({ error: "No credits to refresh" }, { status: 400 });
      }

      return await refreshMonthlyCredits(userId, credits);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Credits POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Initialize credits for new user
 */
async function initializeCredits(userId: string) {
  try {
    // Check user's tier
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("tier")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const tier = entitlement?.tier === "premium" ? "premium" : "free";
    const rateLimit = ssot.features.askAssistant.rateLimits[tier];

    const creditsToAdd = rateLimit.questionsPerMonth;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data: newCredits, error } = await supabase
      .from("ask_credits")
      .insert({
        user_id: userId,
        credits_remaining: creditsToAdd,
        credits_total: creditsToAdd,
        tier,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to initialize credits" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credits_remaining: newCredits.credits_remaining,
      credits_total: newCredits.credits_total,
      tier: newCredits.tier,
      expires_at: newCredits.expires_at,
      initialized: true,
    });
  } catch (error) {
    console.error("Initialize credits error:", error);
    return NextResponse.json({ error: "Failed to initialize credits" }, { status: 500 });
  }
}

/**
 * Refresh monthly credits
 */
async function refreshMonthlyCredits(userId: string, currentCredits: Record<string, unknown>) {
  try {
    // Check user's current tier
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("tier")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const tier = entitlement?.tier === "premium" ? "premium" : "free";
    const rateLimit = ssot.features.askAssistant.rateLimits[tier];

    const creditsToAdd = rateLimit.questionsPerMonth;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Update existing record
    const { data: updatedCredits, error } = await supabase
      .from("ask_credits")
      .update({
        credits_remaining: (currentCredits.credits_remaining as number) + creditsToAdd,
        credits_total: (currentCredits.credits_total as number) + creditsToAdd,
        tier,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to refresh credits" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credits_remaining: updatedCredits.credits_remaining,
      credits_total: updatedCredits.credits_total,
      tier: updatedCredits.tier,
      expires_at: updatedCredits.expires_at,
      refreshed: true,
    });
  } catch (error) {
    console.error("Refresh credits error:", error);
    return NextResponse.json({ error: "Failed to refresh credits" }, { status: 500 });
  }
}
