/**
 * ASK USAGE TRACKING ENDPOINT
 * 
 * POST /api/ask/track-usage
 * Records feature usage for quota enforcement
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { trackFeatureUsage, type AskFeature } from "@/lib/ask/feature-quotas";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { feature, metadata } = body as {
      feature: AskFeature;
      metadata?: Record<string, unknown>;
    };

    if (!feature || !["question", "upload", "compare", "timeline"].includes(feature)) {
      return NextResponse.json(
        { error: "Invalid feature" },
        { status: 400 }
      );
    }

    await trackFeatureUsage(userId, feature, metadata);

    return NextResponse.json({
      success: true,
      feature,
      tracked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[TrackUsage] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

