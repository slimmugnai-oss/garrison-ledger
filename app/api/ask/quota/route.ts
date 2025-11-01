/**
 * ASK QUOTA CHECK ENDPOINT
 * 
 * GET /api/ask/quota?feature=compare
 * Returns user's quota status for a specific Ask feature
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { checkFeatureQuota, type AskFeature } from "@/lib/ask/feature-quotas";
import { getUserTier } from "@/lib/auth/subscription";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get("feature") as AskFeature;

    if (!feature || !["question", "upload", "compare", "timeline"].includes(feature)) {
      return NextResponse.json(
        { error: "Invalid feature. Must be: question, upload, compare, or timeline" },
        { status: 400 }
      );
    }

    const userTier = await getUserTier(userId);
    const tier = (userTier === "premium" || userTier === "staff") ? "premium" : "free";
    const quota = await checkFeatureQuota(userId, feature, tier);

    return NextResponse.json({
      success: true,
      feature,
      tier,
      ...quota,
    });
  } catch (error) {
    console.error("[AskQuota] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

