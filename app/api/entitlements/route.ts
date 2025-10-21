import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

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
      return NextResponse.json(
        { error: "rank_group parameter is required" },
        { status: 400 }
      );
    }

    if (!dependencyStatus || !['with', 'without'].includes(dependencyStatus)) {
      return NextResponse.json(
        { error: "dependency_status must be 'with' or 'without'" },
        { status: 400 }
      );
    }

    // Query entitlements data
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("entitlements_data")
      .select("*")
      .eq("rank_group", rankGroup)
      .eq("dependency_status", dependencyStatus)
      .eq("effective_year", year)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch entitlement data" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          error: "No entitlement data found for the specified rank and dependency status",
          hint: "Please check that rank_group format is correct (e.g., 'E-5', 'O-3', 'W-2')"
        },
        { status: 404 }
      );
    }

    // Return entitlement data
    return NextResponse.json({
      success: true,
      data: {
        rank_group: data.rank_group,
        dependency_status: data.dependency_status,
        weight_allowance: data.weight_allowance,
        dla_rate: data.dla_rate,
        effective_year: data.effective_year
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

