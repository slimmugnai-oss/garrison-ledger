import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { generatePCSClaimPDF } from "@/lib/pcs/pdf-generator";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * PCS CLAIM PACKAGE GENERATOR
 *
 * Generates a professional PDF package with:
 * - Claim summary and status
 * - Entitlement calculations breakdown
 * - Document checklist
 * - All uploaded documents
 *
 * Premium-only feature
 */

interface PackageRequest {
  claimId: string;
  includeDocuments?: boolean;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from("entitlements")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle();

    const tier = entitlement?.tier || "free";
    const isPremium = tier === "premium" && entitlement?.status === "active";

    if (!isPremium) {
      throw Errors.premiumRequired(
        "PCS Money Copilot package generation is available for Premium members only"
      );
    }

    const body: PackageRequest = await req.json();
    const { claimId, includeDocuments = true } = body;

    if (!claimId) {
      throw Errors.invalidInput("claimId is required");
    }

    // Get claim details
    const { data: claim, error: claimError } = await supabaseAdmin
      .from("pcs_claims")
      .select("*")
      .eq("id", claimId)
      .eq("user_id", userId)
      .single();

    if (claimError || !claim) {
      logger.warn("[PCSPackage] Claim not found", { userId, claimId });
      throw Errors.notFound("PCS claim");
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Get latest entitlement snapshot
    const { data: snapshot } = await supabaseAdmin
      .from("pcs_entitlement_snapshots")
      .select("*")
      .eq("claim_id", claimId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get uploaded documents
    const { data: documents } = await supabaseAdmin
      .from("pcs_claim_documents")
      .select("*")
      .eq("claim_id", claimId)
      .order("created_at", { ascending: false });

    // Convert snapshot data to calculations format for PDF generator
    const calculations = {
      dla: {
        amount: snapshot?.dla_amount || 0,
        confidence: 0.8,
        source: "JTR",
        lastVerified: new Date().toISOString(),
      },
      tle: {
        amount: snapshot?.tle_amount || 0,
        confidence: 0.8,
        source: "JTR",
        lastVerified: new Date().toISOString(),
      },
      malt: {
        amount: snapshot?.malt_amount || 0,
        confidence: 0.8,
        source: "JTR",
        lastVerified: new Date().toISOString(),
      },
      per_diem: {
        amount: snapshot?.per_diem_amount || 0,
        confidence: 0.8,
        source: "JTR",
        lastVerified: new Date().toISOString(),
      },
      ppm: {
        amount: snapshot?.ppm_amount || 0,
        confidence: 0.8,
        source: "JTR",
        lastVerified: new Date().toISOString(),
      },
      total_entitlements: snapshot?.total_estimated || 0,
      confidence: { overall: 0.8, dataSources: {} },
    };

    // Generate PDF package using working jsPDF generator
    const pdfBuffer = await generatePCSClaimPDF(
      claim,
      calculations,
      documents || [],
      [] // validation results - empty for now
    );

    // Track analytics (fire and forget)
    supabaseAdmin
      .from("pcs_analytics")
      .insert({
        user_id: userId,
        claim_id: claimId,
        event_type: "package_generated",
        event_data: {
          include_documents: includeDocuments,
          document_count: documents?.length || 0,
          total_estimated: snapshot?.total_estimated || 0,
        },
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn("[PCSPackage] Failed to track analytics", {
            userId,
            claimId,
            error: analyticsError.message,
          });
        }
      });

    const duration = Date.now() - startTime;
    const fileName = `PCS_Claim_${claim.claim_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    logger.info("[PCSPackage] Package generated", {
      userId,
      claimId,
      pdfSize: pdfBuffer.length,
      includeDocuments,
      docCount: documents?.length || 0,
      duration,
    });

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
