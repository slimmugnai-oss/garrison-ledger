import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { generatePCSClaimPDF, generateClaimSummaryPDF } from "@/lib/pcs/pdf-generator";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId, type = "full" } = await request.json();

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

    // Get documents
    const { data: documents, error: docsError } = await supabaseAdmin
      .from("pcs_claim_documents")
      .select("*")
      .eq("claim_id", claimId)
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: true });

    if (docsError) {
      logger.error("Failed to fetch documents:", docsError);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    // Get calculations (from entitlement snapshots or calculate fresh)
    const { data: snapshots, error: snapshotsError } = await supabaseAdmin
      .from("pcs_entitlement_snapshots")
      .select("*")
      .eq("claim_id", claimId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    let calculations;
    if (snapshotsError || !snapshots || snapshots.length === 0) {
      // No snapshots, calculate fresh or use claim entitlements
      logger.warn("No snapshots found, using claim entitlements or defaults", { claimId });

      calculations = {
        dla: {
          amount: claim.entitlements?.dla || 0,
          confidence: 0.8,
          source: "Claim Data",
          lastVerified: new Date().toISOString(),
        },
        tle: {
          amount: claim.entitlements?.tle || 0,
          confidence: 0.8,
          source: "Claim Data",
          lastVerified: new Date().toISOString(),
        },
        malt: {
          amount: claim.entitlements?.malt || 0,
          confidence: 0.8,
          source: "Claim Data",
          lastVerified: new Date().toISOString(),
        },
        per_diem: {
          amount: claim.entitlements?.per_diem || 0,
          confidence: 0.8,
          source: "Claim Data",
          lastVerified: new Date().toISOString(),
        },
        ppm: {
          amount: claim.entitlements?.ppm || 0,
          confidence: 0.8,
          source: "Claim Data",
          lastVerified: new Date().toISOString(),
        },
        total_entitlements: claim.entitlements?.total || 0,
        confidence: { overall: 0.8, dataSources: {} },
      };
    } else {
      // Build calculations from snapshot data
      const snapshot = snapshots[0];

      // Extract confidence from snapshot if available
      const confidences = snapshot.confidence_scores || {};

      calculations = {
        dla: {
          amount: Number(snapshot.dla_amount) || 0,
          confidence: Number(confidences.dla) || 0.8,
          source: "Calculation Snapshot",
          lastVerified: snapshot.created_at || new Date().toISOString(),
        },
        tle: {
          amount: Number(snapshot.tle_amount) || 0,
          confidence: Number(confidences.tle) || 0.8,
          source: "Calculation Snapshot",
          lastVerified: snapshot.created_at || new Date().toISOString(),
        },
        malt: {
          amount: Number(snapshot.malt_amount) || 0,
          confidence: Number(confidences.malt) || 0.8,
          source: "Calculation Snapshot",
          lastVerified: snapshot.created_at || new Date().toISOString(),
        },
        per_diem: {
          amount: Number(snapshot.per_diem_amount) || 0,
          confidence: Number(confidences.perDiem) || 0.8,
          source: "Calculation Snapshot",
          lastVerified: snapshot.created_at || new Date().toISOString(),
        },
        ppm: {
          amount: Number(snapshot.ppm_estimate) || 0,
          confidence: Number(confidences.ppm) || 0.8,
          source: "Calculation Snapshot",
          lastVerified: snapshot.created_at || new Date().toISOString(),
        },
        total_entitlements: Number(snapshot.total_estimated) || 0,
        confidence: {
          overall: Number(confidences.overall) || snapshot.confidence_score || 0.8,
          dataSources: {},
        },
      };

      logger.info("Using snapshot calculations for PDF", {
        claimId,
        total: calculations.total_entitlements,
        dla: calculations.dla.amount,
      });
    }

    // Get validation results
    const { data: validationResults, error: validationError } = await supabaseAdmin
      .from("pcs_claim_checks")
      .select("*")
      .eq("claim_id", claimId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (validationError) {
      logger.error("Failed to fetch validation results:", validationError);
    }

    // Map claim data to PDF format
    const claimDataForPDF = {
      id: claim.id,
      claim_name: claim.claim_name || "PCS Claim",
      member_name: claim.member_name || claim.claim_name?.replace("PCS - ", "") || "Service Member",
      rank: claim.rank_at_pcs || "Not provided",
      branch: claim.branch || "Not provided",
      origin_base: claim.origin_base || "Not provided",
      destination_base: claim.destination_base || "Not provided",
      pcs_orders_date: claim.pcs_orders_date || "Not provided",
      departure_date: claim.departure_date || "Not provided",
      dependents_authorized: (claim.dependents_count || 0) > 0,
      dependents_count: claim.dependents_count || 0,
      estimated_weight: claim.estimated_weight || claim.actual_weight || 0,
      travel_method: (claim.travel_method || "ppm") as "dity" | "full" | "partial",
      distance: claim.distance_miles || claim.malt_distance || 0,
      created_at: claim.created_at || new Date().toISOString(),
      updated_at: claim.updated_at || new Date().toISOString(),
    };

    // Generate PDF based on type
    let pdfBuffer: Buffer;

    if (type === "summary") {
      pdfBuffer = await generateClaimSummaryPDF(claimDataForPDF, calculations);
    } else {
      // Full claim package
      pdfBuffer = await generatePCSClaimPDF(
        claimDataForPDF,
        calculations,
        documents || [],
        validationResults || []
      );
    }

    // Log the export
    await supabaseAdmin.from("pcs_analytics").insert({
      user_id: userId,
      claim_id: claimId,
      action: "pdf_export",
      metadata: {
        type,
        document_count: documents?.length || 0,
        file_size: pdfBuffer.length,
      },
    });

    logger.info("PCS claim PDF exported", {
      userId,
      claimId,
      type,
      size: pdfBuffer.length,
    });

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pcs-claim-${claimId}-${type}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    logger.error("PDF export error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
