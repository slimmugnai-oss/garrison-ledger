import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * PCS CLAIM MANAGEMENT
 *
 * GET: Fetch user's claims
 * POST: Create new claim
 * PATCH: Update claim details
 */

export async function GET() {
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
      throw Errors.premiumRequired("PCS Money Copilot is available for Premium members only");
    }

    // Get all claims for user
    const { data: claims, error } = await supabaseAdmin
      .from("pcs_claims")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[PCSClaim] Failed to fetch claims", error, { userId });
      throw Errors.databaseError("Failed to fetch claims");
    }

    logger.info("[PCSClaim] Claims fetched", { userId, count: claims?.length || 0 });
    return NextResponse.json({ claims });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
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
      throw Errors.premiumRequired("PCS Money Copilot is available for Premium members only");
    }

    const body = await req.json();

    // Get user profile for defaults
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("rank, branch, current_base, pcs_date")
      .eq("user_id", userId)
      .maybeSingle();

    // Create new claim
    const { data: claim, error } = await supabaseAdmin
      .from("pcs_claims")
      .insert({
        user_id: userId,
        claim_name: body.claim_name || "My PCS Claim",
        pcs_orders_date: body.pcs_orders_date,
        departure_date: body.departure_date,
        arrival_date: body.arrival_date || body.pcs_date,
        origin_base: body.origin_base || profile?.current_base,
        destination_base: body.destination_base,
        travel_method: body.travel_method || "ppm",
        dependents_count: body.dependents_count || 0,
        rank_at_pcs: body.rank_at_pcs || profile?.rank,
        branch: body.branch || profile?.branch,
        status: "draft",
        readiness_score: 0,
        completion_percentage: 0,
        // CRITICAL: Save entitlements for PDF export
        entitlements: body.entitlements || null,
        // CRITICAL: Store ALL form data for editing
        form_data: {
          tle_origin_nights: body.tle_origin_nights || 0,
          tle_destination_nights: body.tle_destination_nights || 0,
          tle_origin_rate: body.tle_origin_rate || 0,
          tle_destination_rate: body.tle_destination_rate || 0,
          actual_weight: body.actual_weight || 0,
          estimated_weight: body.estimated_weight || 0,
          malt_distance: body.malt_distance || body.distance_miles || 0,
          distance_miles: body.distance_miles || 0,
          per_diem_days: body.per_diem_days || 0,
          fuel_receipts: body.fuel_receipts || 0,
          origin_zip: body.origin_zip || null,
          destination_zip: body.destination_zip || null,
        },
      })
      .select()
      .single();

    if (error) {
      logger.error("[PCSClaim] Failed to create claim", error, {
        userId,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        bodyData: {
          claim_name: body.claim_name,
          origin_base: body.origin_base,
          destination_base: body.destination_base,
          hasEntitlements: !!body.entitlements,
        },
      });
      throw Errors.databaseError(
        `Failed to create claim: ${error.message || error.code || "Unknown error"}`
      );
    }

    // Save calculations to pcs_entitlement_snapshots if provided
    if (body.calculations) {
      const calculations = body.calculations;

      try {
        const { error: snapshotError } = await supabaseAdmin
          .from("pcs_entitlement_snapshots")
          .insert({
            claim_id: claim.id,
            // Note: user_id is not in schema - removed
            dla_amount: calculations.dla?.amount || 0,
            tle_days:
              (calculations.tle?.origin?.days || 0) + (calculations.tle?.destination?.days || 0),
            tle_amount: calculations.tle?.total || 0,
            malt_miles: calculations.malt?.distance || 0,
            malt_amount: calculations.malt?.amount || 0,
            per_diem_days: calculations.perDiem?.days || 0,
            per_diem_amount: calculations.perDiem?.amount || 0,
            // CRITICAL: Use the weight from formData if available, otherwise from calculations
            // This preserves the user's entered weight (e.g., 8250) instead of using calculation result
            ppm_weight:
              body.actual_weight || body.estimated_weight || calculations.ppm?.weight || 0,
            ppm_estimate: calculations.ppm?.amount || 0,
            total_estimated: calculations.total || 0,
            calculation_details: calculations,
            rates_used: {
              dla: calculations.dla?.rateUsed || 0,
              malt: calculations.malt?.ratePerMile || 0,
              perDiem: calculations.perDiem?.rate || 0,
              ppm: calculations.ppm?.rate || 0,
            },
            confidence_scores: calculations.confidence,
            jtr_rule_version: calculations.jtrRuleVersion || "2025-01-25",
            data_sources: calculations.dataSources,
          });

        if (snapshotError) {
          logger.error("[PCSClaim] Failed to create snapshot", snapshotError, {
            userId,
            claimId: claim.id,
            snapshotErrorCode: snapshotError.code,
            snapshotErrorMessage: snapshotError.message,
          });
        } else {
          logger.info("[PCSClaim] Snapshot created successfully", { userId, claimId: claim.id });
        }

        // Calculate completion percentage based on usability
        // A claim is complete if it has calculations (meaning user reached review screen)
        // and has the minimum essential fields for a usable claim
        const essentialFields = [
          claim.claim_name,
          claim.pcs_orders_date,
          claim.origin_base,
          claim.destination_base,
          claim.rank_at_pcs,
        ];
        const hasEssentialFields = essentialFields.every((field) => field && field !== "");
        const hasCalculations = !!calculations && calculations.total > 0;

        // If user reached review and saved with calculations, it's 100% complete
        // Otherwise, calculate based on essential fields filled
        let completionPercentage = 0;
        if (hasCalculations && hasEssentialFields) {
          completionPercentage = 100; // Reached review screen = complete
        } else if (hasEssentialFields) {
          // Has essential fields but no calculations yet - partial
          const optionalFields = [claim.departure_date, claim.arrival_date, claim.branch];
          const optionalFieldsFilled = optionalFields.filter(
            (field) => field && field !== ""
          ).length;
          completionPercentage =
            50 + Math.round((optionalFieldsFilled / optionalFields.length) * 40); // 50-90%
        } else {
          // Missing essential fields - calculate percentage based on what's filled
          const allFields = [
            ...essentialFields,
            claim.departure_date,
            claim.arrival_date,
            claim.branch,
          ];
          const filledFields = allFields.filter((field) => field && field !== "").length;
          completionPercentage = Math.round((filledFields / allFields.length) * 50); // 0-50%
        }

        // Readiness score: 100% if all calculations successful, otherwise based on confidence
        // Start at 100, deduct points for missing data or low confidence
        let readinessScore = 100;
        if (!calculations.confidence?.overall || calculations.confidence.overall < 0.8) {
          readinessScore = Math.round((calculations.confidence?.overall || 0.8) * 100);
        }
        // Penalize if critical fields are missing
        if (!claim.pcs_orders_date || !claim.origin_base || !claim.destination_base) {
          readinessScore = Math.max(0, readinessScore - 20);
        }

        // Update claim with entitlement total and proper scores
        await supabaseAdmin
          .from("pcs_claims")
          .update({
            entitlements: { total: calculations.total || 0 },
            readiness_score: readinessScore,
            completion_percentage: completionPercentage,
          })
          .eq("id", claim.id);

        logger.info("[PCSClaim] Calculations saved to snapshot", {
          userId,
          claimId: claim.id,
          total: calculations.total,
        });
      } catch (snapshotError) {
        logger.error("[PCSClaim] Failed to save calculation snapshot", snapshotError, {
          userId,
          claimId: claim.id,
        });
        // Don't fail the claim creation if snapshot fails
      }
    }

    // Track analytics (fire and forget)
    supabaseAdmin
      .from("pcs_analytics")
      .insert({
        user_id: userId,
        claim_id: claim.id,
        event_type: "claim_created",
        event_data: {
          travel_method: claim.travel_method,
          dependents: claim.dependents_count,
        },
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn("[PCSClaim] Failed to track analytics", {
            userId,
            claimId: claim.id,
            error: analyticsError.message,
          });
        }
      });

    logger.info("[PCSClaim] Claim created", {
      userId,
      claimId: claim.id,
      travelMethod: claim.travel_method,
    });
    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
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
      throw Errors.premiumRequired("PCS Money Copilot is available for Premium members only");
    }

    const body = await req.json();
    const { claimId, ...updates } = body;

    if (!claimId) {
      throw Errors.invalidInput("claimId is required");
    }

    // Update claim
    const { data: claim, error } = await supabaseAdmin
      .from("pcs_claims")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error("[PCSClaim] Failed to update claim", error, { userId, claimId });
      throw Errors.databaseError("Failed to update claim");
    }

    logger.info("[PCSClaim] Claim updated", {
      userId,
      claimId,
      updatedFields: Object.keys(updates),
    });
    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
