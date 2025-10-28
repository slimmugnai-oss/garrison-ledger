import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { generatePCSClaimHTML } from "@/lib/pcs/html-generator";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = await request.json();

    if (!claimId) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 });
    }

    // Get claim data
    const { data: claim, error: claimError } = await supabaseAdmin
      .from("pcs_claims")
      .select("*")
      .eq("id", claimId)
      .eq("user_id", userId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get calculations from snapshot
    const { data: snapshots } = await supabaseAdmin
      .from("pcs_entitlement_snapshots")
      .select("*")
      .eq("claim_id", claimId)
      .order("created_at", { ascending: false })
      .limit(1);

    const snapshot = snapshots && snapshots.length > 0 ? snapshots[0] : null;

    // Build calculations object from snapshot
    let calculations;
    if (snapshot && snapshot.calculation_details) {
      const details = snapshot.calculation_details;
      calculations = {
        dla: {
          amount: Number(snapshot.dla_amount) || Number(details.dla?.amount) || 0,
          confidence: Number(details.dla?.confidence) || 0.8,
          source: details.dla?.source || "JTR",
          lastVerified: details.dla?.lastVerified || new Date().toISOString(),
        },
        tle: {
          amount: Number(snapshot.tle_amount) || Number(details.tle?.total) || 0,
          confidence: Number(details.tle?.confidence) || 0.8,
          source: "JTR",
          lastVerified: new Date().toISOString(),
        },
        malt: {
          amount: Number(snapshot.malt_amount) || Number(details.malt?.amount) || 0,
          confidence: Number(details.malt?.confidence) || 0.8,
          source: details.malt?.source || "JTR",
          lastVerified: details.malt?.effectiveDate || new Date().toISOString(),
        },
        per_diem: {
          amount: Number(snapshot.per_diem_amount) || Number(details.perDiem?.amount) || 0,
          confidence: Number(details.perDiem?.confidence) || 0.8,
          source: "JTR",
          lastVerified: details.perDiem?.effectiveDate || new Date().toISOString(),
        },
        ppm: {
          amount: Number(snapshot.ppm_estimate) || Number(details.ppm?.amount) || 0,
          confidence: Number(details.ppm?.confidence) || 0.8,
          source: "JTR",
          lastVerified: new Date().toISOString(),
        },
        total_entitlements: Number(snapshot.total_estimated) || Number(details.total) || 0,
        confidence: {
          overall: Number(snapshot.confidence_scores?.overall) || Number(details.confidence?.overall) || 0.8,
          dataSources: snapshot.data_sources || details.dataSources || {},
        },
      };
    } else {
      // Fallback if no snapshot
      calculations = {
        dla: { amount: 0, confidence: 0.5, source: "Manual", lastVerified: new Date().toISOString() },
        tle: { amount: 0, confidence: 0.5, source: "Manual", lastVerified: new Date().toISOString() },
        malt: { amount: 0, confidence: 0.5, source: "Manual", lastVerified: new Date().toISOString() },
        per_diem: { amount: 0, confidence: 0.5, source: "Manual", lastVerified: new Date().toISOString() },
        ppm: { amount: 0, confidence: 0.5, source: "Manual", lastVerified: new Date().toISOString() },
        total_entitlements: 0,
        confidence: { overall: 0.5, dataSources: {} },
      };
    }

    // Prepare claim data for HTML
    const claimData = {
      id: claim.id,
      claim_name: claim.claim_name || "My PCS Claim",
      origin_base: claim.origin_base || "Not provided",
      destination_base: claim.destination_base || "Not provided",
      pcs_orders_date: claim.pcs_orders_date || "",
      departure_date: claim.departure_date || "",
      dependents_authorized: (claim.dependents_count || 0) > 0,
      dependents_count: claim.dependents_count || 0,
      estimated_weight:
        claim.form_data?.actual_weight ||
        claim.form_data?.estimated_weight ||
        claim.estimated_weight ||
        0,
      travel_method: (claim.travel_method || "ppm") as "dity" | "full" | "partial",
      distance:
        snapshot?.malt_miles ||
        claim.form_data?.malt_distance ||
        claim.form_data?.distance_miles ||
        claim.distance_miles ||
        0,
      created_at: claim.created_at || new Date().toISOString(),
      updated_at: claim.updated_at || new Date().toISOString(),
    };

    // Generate HTML
    const html = generatePCSClaimHTML(claimData, calculations);

    logger.info("PCS claim HTML exported", {
      userId,
      claimId,
      size: html.length,
    });

    // Return HTML as response
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="pcs-claim-${claimId}.html"`,
      },
    });
  } catch (error) {
    logger.error("HTML export error:", error);
    return NextResponse.json({ error: "HTML generation failed" }, { status: 500 });
  }
}

