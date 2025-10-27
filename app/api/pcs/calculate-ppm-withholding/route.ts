/**
 * API ROUTE: Calculate PPM Withholding
 *
 * Server-side endpoint for PPM tax withholding calculations
 * (Cannot be called directly from client due to Supabase admin usage)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  calculatePPMWithholding,
  type PPMWithholdingInput,
} from "@/lib/pcs/ppm-withholding-calculator";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: PPMWithholdingInput = await req.json();

    // Validate required fields
    if (!body.gccAmount || !body.incentivePercentage || !body.mode || !body.destinationState) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate withholding (uses supabaseAdmin internally)
    const result = await calculatePPMWithholding(body);

    logger.info("[PPM Withholding] Calculation completed", {
      userId,
      mode: body.mode,
      gccAmount: body.gccAmount,
      netPayout: result.estimatedNetPayout,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("[PPM Withholding] Calculation failed", error);
    return NextResponse.json({ error: "Failed to calculate PPM withholding" }, { status: 500 });
  }
}
