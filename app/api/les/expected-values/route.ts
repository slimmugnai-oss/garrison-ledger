/**
 * GET EXPECTED PAY VALUES
 *
 * POST /api/les/expected-values
 * Returns expected BAH, BAS, COLA for a given month/year/rank/location
 * Used to auto-populate manual entry form
 *
 * Security: Clerk authentication required
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { buildExpectedSnapshot } from "@/lib/les/expected";
import { logger } from "@/lib/logger";
import { ssot } from "@/lib/ssot";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ExpectedValuesRequest {
  month: number;
  year: number;
  rank?: string;
  location?: string;
  hasDependents?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Parse request
    const body: ExpectedValuesRequest = await req.json();
    const { month, year, rank, location, hasDependents } = body;

    // DEBUG: Log what we received
    console.log("[ExpectedValues] Request received:", {
      userId,
      month,
      year,
      rank,
      location,
      hasDependents,
    });

    // Validate inputs
    if (!month || !year) {
      throw Errors.invalidInput("month and year are required");
    }

    if (!rank || !location || hasDependents === undefined || hasDependents === null) {
      throw Errors.invalidInput(
        "Profile incomplete: rank, location, and dependent status required"
      );
    }

    // Fetch full profile to get years of service for base pay calculation
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("time_in_service_months")
      .eq("user_id", userId)
      .maybeSingle();

    const yos = profile?.time_in_service_months
      ? Math.floor(profile.time_in_service_months / 12)
      : undefined;

    // Try to build expected snapshot using the same logic as audit
    let snapshot;
    try {
      console.log("[ExpectedValues] Calling buildExpectedSnapshot with:", {
        userId,
        month,
        year,
        paygrade: rank,
        mha_or_zip: location,
        with_dependents: Boolean(hasDependents),
        yos,
      });

      snapshot = await buildExpectedSnapshot({
        userId,
        month,
        year,
        paygrade: rank,
        mha_or_zip: location,
        with_dependents: Boolean(hasDependents),
        yos,
      });

      console.log(
        "[ExpectedValues] buildExpectedSnapshot SUCCESS, BAH:",
        snapshot.expected.bah_cents,
        "BAH type:",
        typeof snapshot.expected.bah_cents,
        "Full snapshot:",
        JSON.stringify(snapshot.expected, null, 2)
      );
    } catch (error) {
      // If exact match fails (e.g., location not in BAH table), use smart fallbacks
      console.error("[ExpectedValues] buildExpectedSnapshot FAILED:", error);
      logger.warn("[ExpectedValues] buildExpectedSnapshot failed, using fallbacks", {
        rank,
        location,
        error,
      });

      // Return reasonable defaults for testing/demo (from SSOT)
      const isOfficerRank =
        rank?.toLowerCase().includes("officer") ||
        rank?.toLowerCase().includes("lieutenant") ||
        rank?.toLowerCase().includes("captain") ||
        rank?.toLowerCase().includes("major") ||
        rank?.toLowerCase().includes("colonel") ||
        rank?.startsWith("O");

      return NextResponse.json({
        bah: Boolean(hasDependents) ? 180000 : 140000, // $1,800 with deps, $1,400 without (average CONUS)
        bas: isOfficerRank
          ? ssot.militaryPay.basMonthlyCents.officer
          : ssot.militaryPay.basMonthlyCents.enlisted,
        cola: 0, // Most CONUS locations have no COLA
        fallback: true,
        message: `Using typical ${isOfficerRank ? "officer" : "enlisted"} rates for ${location}. Exact BAH rate not found - this is for testing only.`,
      });
    }

    // Return expected values in cents (will be converted to dollars in UI)
    // SIMPLIFIED: Only auto-fill allowances (BAH, BAS, etc.)
    // Taxes are manual entry - we just provide FICA/Medicare for percentage validation
    const isOfficerRank = rank?.toLowerCase().includes("officer") || rank?.startsWith("O");

    const response = NextResponse.json({
      // ALLOWANCES (100% accurate from official tables)
      bah: snapshot.expected.bah_cents ?? 0, // Use nullish coalescing - 0 is valid, only null/undefined becomes 0
      bas:
        snapshot.expected.bas_cents ??
        (isOfficerRank
          ? ssot.militaryPay.basMonthlyCents.officer
          : ssot.militaryPay.basMonthlyCents.enlisted),
      cola: snapshot.expected.cola_cents ?? 0,
      base_pay: snapshot.expected.base_pay_cents ?? 0,

      // SPECIAL PAYS (from profile)
      sdap: snapshot.expected.specials?.find((sp) => sp.code === "SDAP")?.cents || 0,
      hfp_idp: snapshot.expected.specials?.find((sp) => sp.code === "HFP_IDP")?.cents || 0,
      fsa: snapshot.expected.specials?.find((sp) => sp.code === "FSA")?.cents || 0,
      flpp: snapshot.expected.specials?.find((sp) => sp.code === "FLPP")?.cents || 0,

      // DEDUCTIONS (from profile or official tables)
      tsp: snapshot.expected.tsp_cents || 0,
      sgli: snapshot.expected.sgli_cents || 0,
      // NO dental auto-fill - users enter actual premium

      // TAXES (for percentage validation only - NOT auto-filled)
      // These are reference values for checking 6.2% and 1.45% are correct
      fica_expected_percent: snapshot.expected.fica_cents || 0, // For validation only
      medicare_expected_percent: snapshot.expected.medicare_cents || 0, // For validation only
      // NO federal_tax, state_tax, or net_pay auto-fill

      snapshot: {
        paygrade: snapshot.paygrade,
        location: snapshot.mha_or_zip,
        with_dependents: snapshot.with_dependents,
        month: snapshot.month,
        year: snapshot.year,
      },
    });
    
    // Add aggressive no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    logger.error("[ExpectedValues] Failed to fetch expected values", error);
    return errorResponse(error);
  }
}
