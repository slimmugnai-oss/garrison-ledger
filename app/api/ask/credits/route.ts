/**
 * ASK ASSISTANT - Credits Management
 *
 * Handles credit balance checking and initialization
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

    // Get user's current credits with retry logic
    let credits = null;
    let error = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !credits) {
      const result = await supabase.from("ask_credits").select("*").eq("user_id", userId).single();

      credits = result.data;
      error = result.error;

      if (error && error.code === "PGRST116") {
        // No credits record found - try to initialize
        break;
      } else if (error) {
        // Other database error - retry with exponential backoff
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, retryCount)));
          continue;
        }
        console.error("[Credits API] Database error after retries:", error);
        return NextResponse.json(
          { error: "Database error", errorCode: "DB_ERROR", details: error.message },
          { status: 500 }
        );
      }
      break;
    }

    // If no credits record, initialize with retry
    if (!credits) {
      return await initializeCreditsWithRetry(userId);
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
    console.error("[Credits API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", errorCode: "UNKNOWN_ERROR" },
      { status: 500 }
    );
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
 * Initialize credits for new user with retry logic
 */
async function initializeCreditsWithRetry(userId: string, retryCount = 0): Promise<Response> {
  const maxRetries = 3;

  try {
    // Check user's tier
    const { data: entitlement, error: entitlementError } = await supabase
      .from("entitlements")
      .select("tier")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (entitlementError) {
      console.error("[Credits Init] No entitlement found for user:", userId);
      return NextResponse.json(
        {
          error: "User entitlement not found",
          errorCode: "NO_ENTITLEMENT",
          message: "Please complete your profile setup first.",
        },
        { status: 404 }
      );
    }

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
      console.error(`[Credits Init] Attempt ${retryCount + 1}/${maxRetries} failed:`, error);

      // Retry with exponential backoff
      if (retryCount < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, retryCount)));
        return initializeCreditsWithRetry(userId, retryCount + 1);
      }

      // Log to admin error logs
      await logAdminError(userId, error);

      return NextResponse.json(
        {
          error: "Failed to initialize credits",
          errorCode: "INIT_FAILED",
          message:
            "Unable to set up your question credits. Please try refreshing the page or contact support.",
        },
        { status: 500 }
      );
    }

    console.log(
      `[Credits Init] Successfully initialized ${creditsToAdd} credits for user ${userId} (${tier})`
    );

    return NextResponse.json({
      success: true,
      credits_remaining: newCredits.credits_remaining,
      credits_total: newCredits.credits_total,
      tier: newCredits.tier,
      expires_at: newCredits.expires_at,
      initialized: true,
    });
  } catch (error) {
    console.error("[Credits Init] Unexpected error:", error);

    // Retry on unexpected errors
    if (retryCount < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, retryCount)));
      return initializeCreditsWithRetry(userId, retryCount + 1);
    }

    return NextResponse.json(
      {
        error: "Failed to initialize credits",
        errorCode: "UNKNOWN_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * Legacy function - kept for backwards compatibility
 */
async function initializeCredits(userId: string) {
  return initializeCreditsWithRetry(userId, 0);
}

/**
 * Log error to admin error logs
 */
async function logAdminError(userId: string, error: unknown) {
  try {
    await supabase.from("error_logs").insert({
      level: "error",
      source: "ask_credits_initialization",
      message: "Failed to initialize Ask Assistant credits",
      details: {
        userId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (logError) {
    console.error("[Credits Init] Failed to log error:", logError);
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
