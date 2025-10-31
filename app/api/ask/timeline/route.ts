/**
 * ASK TIMELINE GENERATION API
 *
 * POST /api/ask/timeline
 * Generates personalized timelines for PCS, deployment, separation
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { generateTimeline } from "@/lib/ask/timeline-planner";
import type { TimelineType } from "@/lib/ask/timeline-planner";
import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse(Errors.unauthorized());
    }

    const body = await req.json();
    const { type, eventDate, options } = body as {
      type: TimelineType;
      eventDate: string;
      options?: {
        isOCONUS?: boolean;
        hasDependents?: boolean;
        deploymentDuration?: number;
      };
    };

    if (!type || !eventDate) {
      return errorResponse(Errors.invalidInput("type and eventDate required"));
    }

    logger.info(`[Timeline] Generating ${type} timeline for ${eventDate}`);

    const timeline = generateTimeline(type, new Date(eventDate), options);

    return NextResponse.json({
      success: true,
      timeline,
    });
  } catch (error) {
    logger.error("[Timeline] Generation failed:", error);
    return NextResponse.json(
      { error: "Timeline generation failed" },
      { status: 500 }
    );
  }
}

