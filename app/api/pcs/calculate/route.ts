import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { calculatePCSClaim, type FormData } from "@/lib/pcs/calculation-engine";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData: FormData = await req.json();

    logger.info("[PCS Calculate] Starting calculation", {
      userId,
      origin: formData.origin_base,
      destination: formData.destination_base,
    });

    const calculations = await calculatePCSClaim(formData);

    logger.info("[PCS Calculate] Calculation completed", {
      userId,
      total: calculations.total,
      dla: calculations.dla.amount,
      malt: calculations.malt.amount,
      ppm: calculations.ppm.amount,
    });

    return NextResponse.json(calculations);
  } catch (error) {
    logger.error("[PCS Calculate] Calculation failed:", error);
    return NextResponse.json(
      { error: "Failed to calculate PCS entitlements" },
      { status: 500 }
    );
  }
}

