import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET: Fetch a single PCS claim by ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { id } = await params;

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from("entitlements")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle();

    const tier = entitlement?.tier || "free";
    const isPremium = tier === "premium" && entitlement?.status === "active";

    if (!isPremium) {
      throw Errors.premiumRequired("PCS Money Copilot is available for Premium members only");
    }

    // Get the specific claim
    const { data: claim, error } = await supabaseAdmin
      .from("pcs_claims")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !claim) {
      logger.error("[PCSClaim] Failed to fetch claim", error, { userId, claimId: id });
      throw Errors.notFound("Claim not found");
    }

    logger.info("[PCSClaim] Claim fetched", { userId, claimId: id });
    return NextResponse.json({ claim });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { id } = await params;

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from("entitlements")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle();

    const tier = entitlement?.tier || "free";
    const isPremium = tier === "premium" && entitlement?.status === "active";

    if (!isPremium) {
      throw Errors.premiumRequired("PCS Money Copilot is available for Premium members only");
    }

    // Delete the claim (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from("pcs_claims")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      logger.error("[PCSClaim] Failed to delete claim", error, { userId, claimId: id });
      throw Errors.databaseError("Failed to delete claim");
    }

    logger.info("[PCSClaim] Claim deleted", {
      userId,
      claimId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Claim deleted successfully",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
