import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { generatePCSClaimPDF, generateClaimSummaryPDF } from "@/lib/pcs/pdf-generator";

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
      // No snapshots, use basic calculations
      calculations = {
        dla: {
          amount: 0,
          confidence: 0.5,
          source: "Manual Entry",
          lastVerified: new Date().toISOString(),
        },
        tle: {
          amount: 0,
          confidence: 0.5,
          source: "Manual Entry",
          lastVerified: new Date().toISOString(),
        },
        malt: {
          amount: 0,
          confidence: 0.5,
          source: "Manual Entry",
          lastVerified: new Date().toISOString(),
        },
        per_diem: {
          amount: 0,
          confidence: 0.5,
          source: "Manual Entry",
          lastVerified: new Date().toISOString(),
        },
        ppm: {
          amount: 0,
          confidence: 0.5,
          source: "Manual Entry",
          lastVerified: new Date().toISOString(),
        },
        total_entitlements: 0,
        confidence: { overall: 0.5, dataSources: {} },
      };
    } else {
      calculations = snapshots[0].calculation_results;
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

    // Generate PDF based on type
    let pdfBuffer: Buffer;

    if (type === "summary") {
      pdfBuffer = await generateClaimSummaryPDF(claim, calculations);
    } else {
      // Full claim package
      pdfBuffer = await generatePCSClaimPDF(
        claim,
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
    return new NextResponse(Uint8Array.from(pdfBuffer), {
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
