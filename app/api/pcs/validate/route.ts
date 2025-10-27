import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { validatePCSClaim } from "@/lib/pcs/validation-engine";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const claimData = await request.json();

    if (!claimData) {
      return NextResponse.json({ error: "Invalid claim data" }, { status: 400 });
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

    // Validate the claim
    const validation = await validatePCSClaim(claimData);

    // Log validation request
    logger.info("PCS claim validation completed", {
      userId,
      claimId: claimData.claimId,
      totalRules: validation.total_rules,
      errors: validation.errors,
      warnings: validation.warnings,
      score: validation.overall_score,
    });

    // Save validation results to database
    try {
      await supabaseAdmin.from("pcs_claim_checks").insert({
        claim_id: claimData.claimId || `validation_${Date.now()}`,
        user_id: userId,
        validation_results: validation,
        overall_score: validation.overall_score,
        errors_count: validation.errors,
        warnings_count: validation.warnings,
        created_at: new Date().toISOString(),
      });
    } catch (dbError) {
      logger.error("Failed to save validation results:", dbError);
      // Don't fail the request if we can't save to DB
    }

    return NextResponse.json({
      success: true,
      validation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("PCS validation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
