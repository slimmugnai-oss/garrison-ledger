/**
 * ASK COMPARISON API
 *
 * POST /api/ask/compare
 * Provides side-by-side comparison analysis
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { runComparison } from "@/lib/ask/comparison-engine";
import type { ComparisonType } from "@/lib/ask/comparison-engine";
import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse(Errors.unauthorized());
    }

    const body = await req.json();
    const { comparisonType, items, userContext } = body as {
      comparisonType: ComparisonType;
      items: string[];
      userContext?: Record<string, unknown>;
    };

    if (!comparisonType || !items || items.length < 2) {
      return errorResponse(
        Errors.invalidInput("Must provide comparisonType and at least 2 items to compare")
      );
    }

    logger.info(`[AskCompare] Running comparison: ${comparisonType}`, {
      userId: userId.substring(0, 8) + "...",
      itemCount: items.length,
    });

    const result = await runComparison(comparisonType, items, userContext);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error("[AskCompare] Comparison failed:", error);
    return NextResponse.json(
      { error: "Comparison failed" },
      { status: 500 }
    );
  }
}

