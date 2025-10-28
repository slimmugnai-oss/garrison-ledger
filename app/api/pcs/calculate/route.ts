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

    // CRITICAL DEBUG: Log EVERYTHING to diagnose DLA=$0 and PPM=5000 bugs
    logger.info("[PCS Calculate] ===== FULL FORM DATA =====", {
      userId,
      rank: formData.rank_at_pcs,
      dependents: formData.dependents_count,
      origin: formData.origin_base,
      destination: formData.destination_base,
      departureDate: formData.departure_date,
      arrivalDate: formData.arrival_date,
      maltDistance: formData.malt_distance,
      distanceMiles: formData.distance_miles,
      actualWeight: formData.actual_weight,
      estimatedWeight: formData.estimated_weight,
      perDiemDays: formData.per_diem_days,
      FULL_FORMDATA: JSON.stringify(formData),
    });

    const calculations = await calculatePCSClaim(formData);

    logger.info("[PCS Calculate] ===== CALCULATION RESULTS =====", {
      userId,
      DLA: {
        amount: calculations.dla.amount,
        rank: formData.rank_at_pcs,
        hasDependents: formData.dependents_count > 0,
        confidence: calculations.dla.confidence,
      },
      PPM: {
        amount: calculations.ppm.amount,
        weight: calculations.ppm.weight,
        distance: calculations.ppm.distance,
        confidence: calculations.ppm.confidence,
      },
      MALT: {
        amount: calculations.malt.amount,
        distance: calculations.malt.distance,
      },
      total: calculations.total,
    });

    return NextResponse.json(calculations);
  } catch (error) {
    logger.error("[PCS Calculate] Calculation failed:", error);
    return NextResponse.json({ error: "Failed to calculate PCS entitlements" }, { status: 500 });
  }
}
