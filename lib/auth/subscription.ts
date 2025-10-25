/**
 * SUBSCRIPTION TIER & POLICY MANAGEMENT
 *
 * Server-side tier checking and feature gating for LES Auditor and other premium features.
 *
 * Tiers:
 * - free: Limited access (1 audit/month, top 2 flags, no exact variance, no PDF)
 * - premium: Full access (unlimited audits, all flags, exact variance, PDF export, history)
 * - staff: Internal/QA bypass (all premium features)
 *
 * Security: All tier checks happen server-side. Never trust client-side tier claims.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export type Tier = "free" | "premium" | "staff";

/**
 * Get user's subscription tier from database
 *
 * @param userId - Clerk user ID
 * @returns Tier level (defaults to 'free' if not found)
 */
export async function getUserTier(userId: string): Promise<Tier> {
  try {
    console.log("[getUserTier] Checking tier for user:", userId);

    // Query entitlements table for tier
    const { data: entitlement } = await supabaseAdmin
      .from("entitlements")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle();

    console.log("[getUserTier] Entitlement data:", entitlement);

    // Check for staff bypass via profiles table
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    console.log("[getUserTier] Profile data:", profile);

    // Staff bypass: Check for @garrisonledger.com or @slimmugnai.com OR slimmugnai@gmail.com
    const isStaffEmail =
      profile?.email?.endsWith("@garrisonledger.com") ||
      profile?.email?.endsWith("@slimmugnai.com") ||
      profile?.email === "slimmugnai@gmail.com";

    if (isStaffEmail) {
      console.log("[getUserTier] Staff bypass detected for email:", profile?.email);
      return "staff";
    }

    // If no entitlement found, return free tier
    if (!entitlement) {
      console.log("[getUserTier] No entitlement found, returning free tier");
      return "free";
    }

    // Check subscription status and tier
    if (
      entitlement.status === "active" &&
      (entitlement.tier === "premium" || entitlement.tier === "pro")
    ) {
      console.log("[getUserTier] Active subscription found, returning premium");
      return "premium";
    }

    console.log("[getUserTier] No active subscription, returning free tier");
    return "free";
  } catch (error) {
    console.error("[Subscription] Error fetching tier:", error);
    return "free"; // Fail-safe to free tier
  }
}

/**
 * Get LES Auditor feature policy based on tier
 */
export function getLesAuditPolicy(tier: Tier) {
  if (tier === "premium" || tier === "staff") {
    return {
      monthlyQuota: Infinity,
      maxVisibleFlags: Infinity,
      showExactVariance: true,
      showWaterfall: true,
      allowPdf: true,
      allowHistory: true,
      allowCopyTemplates: true,
      allowComparison: true,
    };
  }

  // Free tier
  return {
    monthlyQuota: 1, // 1 save/PDF per month
    maxVisibleFlags: 2, // Top 2 flags only
    showExactVariance: false, // Show bucket only (">$50 red")
    showWaterfall: false, // Blurred/locked
    allowPdf: false, // No PDF export
    allowHistory: false, // No history panel
    allowCopyTemplates: false, // No copy buttons
    allowComparison: false, // No side-by-side comparison
  };
}

/**
 * Check if user has exceeded their monthly LES audit quota
 *
 * @param userId - User ID
 * @param tier - User's subscription tier
 * @returns Whether user can perform another audit this month
 */
export async function checkLesAuditQuota(
  userId: string,
  tier: Tier
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: string;
}> {
  const policy = getLesAuditPolicy(tier);

  // Premium/staff = unlimited
  if (policy.monthlyQuota === Infinity) {
    return {
      allowed: true,
      used: 0,
      limit: Infinity,
      resetsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    };
  }

  // Free tier - check monthly quota
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  try {
    const { data: quota } = await supabaseAdmin
      .from("api_quota")
      .select("count")
      .eq("user_id", userId)
      .eq("route", "/api/les/audit/save") // Only count actual saves, not compute calls
      .eq("day", monthKey)
      .maybeSingle();

    const used = quota?.count || 0;
    const allowed = used < policy.monthlyQuota;

    // Calculate reset date (first day of next month)
    const resetsAt = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();

    return {
      allowed,
      used,
      limit: policy.monthlyQuota,
      resetsAt,
    };
  } catch (error) {
    console.error("[Quota] Error checking LES audit quota:", error);
    // Fail-safe: allow if we can't check
    return {
      allowed: true,
      used: 0,
      limit: policy.monthlyQuota,
      resetsAt: new Date().toISOString(),
    };
  }
}
