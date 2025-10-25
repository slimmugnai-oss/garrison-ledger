import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { supabaseAdmin } from "@/lib/supabase";

/**
 * PCS ASSIGNMENT PLANNER - Base Comparison API
 * 
 * Compare potential duty stations before receiving orders
 */

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's saved comparisons
    const { data: comparisons, error } = await supabaseAdmin
      .from("pcs_assignment_comparisons")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[PlannerCompare] Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load comparisons" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comparisons: comparisons || [],
    });
  } catch (error) {
    console.error("[PlannerCompare] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bases } = body;

    if (!name || !bases || !Array.isArray(bases) || bases.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: name and bases array required" },
        { status: 400 }
      );
    }

    // Calculate analysis data for each base
    const analysisData = {
      baseCount: bases.length,
      comparedAt: new Date().toISOString(),
      summary: {
        highestBah: bases.reduce((max, base) => 
          base.bah > max.bah ? base : max, bases[0]
        ),
        lowestCol: bases.reduce((min, base) => 
          base.colIndex < min.colIndex ? base : min, bases[0]
        ),
        bestSchools: bases.reduce((max, base) => 
          base.schoolRating > max.schoolRating ? base : max, bases[0]
        ),
      },
    };

    // Save comparison
    const { data: comparison, error } = await supabaseAdmin
      .from("pcs_assignment_comparisons")
      .insert({
        user_id: user.id,
        comparison_name: name,
        bases: bases,
        analysis_data: analysisData,
      })
      .select()
      .single();

    if (error) {
      console.error("[PlannerCompare] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to save comparison" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error("[PlannerCompare] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const comparisonId = searchParams.get("id");

    if (!comparisonId) {
      return NextResponse.json(
        { error: "Comparison ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("pcs_assignment_comparisons")
      .delete()
      .eq("id", comparisonId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[PlannerCompare] Delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete comparison" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comparison deleted",
    });
  } catch (error) {
    console.error("[PlannerCompare] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
