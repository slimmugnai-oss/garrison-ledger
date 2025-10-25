import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all claims for the user
    const { data: claims, error } = await supabaseAdmin
      .from("pcs_claims")
      .select(
        `
        id,
        claim_name,
        origin_base,
        destination_base,
        departure_date,
        arrival_date,
        status,
        submitted_date,
        approved_date,
        paid_date,
        total_entitlements,
        total_reimbursed,
        net_savings,
        created_at,
        updated_at
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching claims:", error);
      return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
    }

    return NextResponse.json({ claims: claims || [] });
  } catch (error) {
    console.error("Claims library API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
