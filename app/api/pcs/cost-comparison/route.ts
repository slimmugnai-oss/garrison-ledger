import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all cost comparisons for the user
    const { data: comparisons, error } = await supabaseAdmin
      .from("pcs_cost_comparison")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cost comparisons:", error);
      return NextResponse.json({ error: "Failed to fetch comparisons" }, { status: 500 });
    }

    return NextResponse.json({ comparisons: comparisons || [] });
  } catch (error) {
    console.error("Cost comparison API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { formData, results } = body;

    // Create new cost comparison record
    const { data: comparison, error } = await supabaseAdmin
      .from("pcs_cost_comparison")
      .insert({
        user_id: user.id,
        comparison_name: `${formData.origin_base} → ${formData.destination_base}`,
        origin_base: formData.origin_base,
        destination_base: formData.destination_base,
        distance_miles: formData.distance_miles,
        weight_authorized: formData.weight_authorized,
        dependents_count: formData.dependents_count,
        rank_at_pcs: formData.rank_at_pcs,
        
        // DITY costs
        dity_truck_rental: formData.dity_truck_rental,
        dity_gas_cost: formData.dity_gas_cost,
        dity_hotel_cost: formData.dity_hotel_cost,
        dity_meals_cost: formData.dity_meals_cost,
        dity_labor_cost: formData.dity_labor_cost,
        dity_total_cost: results.dity.total_cost,
        dity_government_cost: results.dity.government_cost,
        dity_profit: results.dity.profit,
        
        // Full Move costs
        full_move_cost: results.full_move.cost,
        full_move_entitlements: results.full_move.entitlements,
        
        // Partial DITY costs
        partial_dity_weight: formData.partial_dity_weight,
        partial_dity_truck_cost: formData.partial_dity_weight * 0.5, // Estimate
        partial_dity_gas_cost: formData.partial_dity_weight * 0.1, // Estimate
        partial_dity_total_cost: results.partial_dity.total_cost,
        partial_dity_government_cost: results.partial_dity.government_cost,
        partial_dity_profit: results.partial_dity.profit,
        
        // Analysis results
        recommended_option: results.recommended,
        break_even_weight: results.break_even_weight,
        confidence_score: results.confidence_score,
        notes: `Generated on ${new Date().toLocaleDateString()}`
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating cost comparison:", error);
      return NextResponse.json({ error: "Failed to save comparison" }, { status: 500 });
    }

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Cost comparison creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
