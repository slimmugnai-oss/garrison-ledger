import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get claimId from query params
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
    }

    // Check premium access
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("tier")
      .eq("user_id", userId)
      .single();

    if (!profile || (profile.tier !== "premium" && profile.tier !== "enterprise")) {
      return NextResponse.json({ error: "Premium access required" }, { status: 403 });
    }

    // Get documents for the claim
    const { data: documents, error } = await supabaseAdmin
      .from("pcs_claim_documents")
      .select("*")
      .eq("claim_id", claimId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch documents:", error);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    // Calculate summary statistics
    const totalDocuments = documents?.length || 0;
    const processedDocuments =
      documents?.filter((doc) => doc.processing_status === "completed").length || 0;
    const totalAmount =
      documents?.reduce((sum, doc) => {
        const amount = doc.extracted_data?.amount || 0;
        return sum + amount;
      }, 0) || 0;

    logger.info("PCS documents listed successfully", {
      userId,
      claimId,
      totalDocuments,
      processedDocuments,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      documents: documents || [],
      summary: {
        total: totalDocuments,
        processed: processedDocuments,
        pending: totalDocuments - processedDocuments,
        totalAmount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Document list API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
