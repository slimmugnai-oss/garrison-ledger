import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getPerDiemRate } from "@/lib/pcs/jtr-api";

/**
 * PER DIEM RATE LOOKUP API
 *
 * Returns per diem rates for a specific ZIP code and date.
 * Used for TLE rate suggestions and per diem calculations.
 */
export async function POST(request: NextRequest) {
  try {
    const { zip, effectiveDate } = await request.json();

    if (!zip) {
      return NextResponse.json({ error: "ZIP code is required" }, { status: 400 });
    }

    const date = effectiveDate || new Date().toISOString().split("T")[0];

    // Fetch per diem rate from jtr_rates_cache
    const perDiemRate = await getPerDiemRate(zip, date);

    if (!perDiemRate) {
      // Return standard CONUS rate as fallback
      logger.warn("Per diem rate not found for ZIP, using standard CONUS", { zip });
      return NextResponse.json({
        zip,
        city: "Standard CONUS",
        state: "",
        effectiveDate: date,
        lodgingRate: 107, // Standard CONUS lodging 2025
        mealRate: 59, // Standard CONUS M&IE 2025
        totalRate: 166, // Total per diem
        source: "Fallback - Standard CONUS Rate",
        confidence: 80,
      });
    }

    return NextResponse.json({
      zip: perDiemRate.zipCode,
      city: perDiemRate.city,
      state: perDiemRate.state,
      effectiveDate: perDiemRate.effectiveDate,
      lodgingRate: perDiemRate.lodgingRate,
      mealRate: perDiemRate.mealRate,
      totalRate: perDiemRate.totalRate,
      source: "DTMO Per Diem Database",
      confidence: 100,
    });
  } catch (error) {
    logger.error("Per diem lookup error:", error);
    return NextResponse.json({ error: "Failed to fetch per diem rate" }, { status: 500 });
  }
}
