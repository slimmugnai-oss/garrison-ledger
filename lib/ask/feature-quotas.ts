/**
 * ASK MILITARY EXPERT - FEATURE QUOTAS
 * 
 * Unified quota system for all Ask features
 * Option C: Hybrid teaser limits (try everything, upgrade for unlimited)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AskFeature = "question" | "upload" | "compare" | "timeline";

/**
 * QUOTA LIMITS (Monthly)
 */
export const FEATURE_QUOTAS = {
  free: {
    question: 5,    // 5 questions/month
    upload: 1,      // 1 document upload/month (teaser)
    compare: 2,     // 2 comparisons/month (teaser)
    timeline: 2,    // 2 timelines/month (teaser)
  },
  premium: {
    question: 999,  // Effectively unlimited
    upload: 999,    // Unlimited
    compare: 999,   // Unlimited
    timeline: 999,  // Unlimited
  },
} as const;

/**
 * Check if user has quota remaining for a feature
 */
export async function checkFeatureQuota(
  userId: string,
  feature: AskFeature,
  tier: "free" | "premium"
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const limit = FEATURE_QUOTAS[tier][feature];

  // Premium gets unlimited (always allowed)
  if (tier === "premium") {
    return {
      allowed: true,
      used: 0,
      limit,
      remaining: 999,
    };
  }

  // Get start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count usage this month for this feature
  const { count, error } = await supabase
    .from("ask_feature_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    console.error("[FeatureQuota] Error checking quota:", error);
    // Fail open - allow the request if database error
    return {
      allowed: true,
      used: 0,
      limit,
      remaining: limit,
    };
  }

  const used = count || 0;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    used,
    limit,
    remaining,
  };
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  userId: string,
  feature: AskFeature,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from("ask_feature_usage").insert({
      user_id: userId,
      feature,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("[FeatureQuota] Failed to track usage:", error);
    // Don't throw - tracking failure shouldn't block the request
  }
}

/**
 * Get user's quota status for all features
 */
export async function getAllFeatureQuotas(
  userId: string,
  tier: "free" | "premium"
): Promise<Record<AskFeature, { used: number; limit: number; remaining: number }>> {
  const features: AskFeature[] = ["question", "upload", "compare", "timeline"];
  const quotas: Record<string, { used: number; limit: number; remaining: number }> = {};

  for (const feature of features) {
    const quota = await checkFeatureQuota(userId, feature, tier);
    quotas[feature] = {
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
    };
  }

  return quotas as Record<AskFeature, { used: number; limit: number; remaining: number }>;
}

