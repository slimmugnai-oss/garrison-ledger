import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { Database } from "@/lib/database.types";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * ENTITLEMENTS DATA API
 * Fetches DoD weight allowances and DLA rates based on rank and dependency status
 * Single source of truth for PCS entitlement calculations
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const rankGroup = searchParams.get("rank_group");
    const dependencyStatus = searchParams.get("dependency_status");
    const year = parseInt(searchParams.get("year") || "2025", 10);

    // Validation
    if (!rankGroup) {
      throw Errors.invalidInput("rank_group parameter is required");
    }

    if (!dependencyStatus || !["with", "without"].includes(dependencyStatus)) {
      throw Errors.invalidInput("dependency_status must be 'with' or 'without'");
    }

    // Query entitlements data
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("entitlements_data")
      .select("rank_group, dependency_status, weight_allowance, dla_rate, effective_year")
      .eq("rank_group", rankGroup)
      .eq("dependency_status", dependencyStatus)
      .eq("effective_year", year)
      .maybeSingle();

    if (error) {
      logger.error("[Entitlements] Failed to fetch data", error, {
        rankGroup,
        dependencyStatus,
        year,
      });
      throw Errors.databaseError("Failed to fetch entitlement data");
    }

    if (!data) {
      logger.warn("[Entitlements] No data found", { rankGroup, dependencyStatus, year });
      throw Errors.notFound(
        "Entitlement data not found for specified parameters. Please check rank_group format (e.g., 'E-5', 'O-3', 'W-2')"
      );
    }

    logger.info("[Entitlements] Data fetched", { rankGroup, dependencyStatus, year });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
