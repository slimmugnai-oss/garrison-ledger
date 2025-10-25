import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { errorResponse, Errors } from "@/lib/api-errors";

/**
 * PCS CONTEXT API
 *
 * Provides sanitized PCS claim data for Ask Assistant context
 * Allows Ask Assistant to give personalized PCS advice
 */

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Get user's active PCS claim
    const { data: claim } = await supabaseAdmin
      .from("pcs_claims")
      .select(
        `
        id,
        claim_name,
        pcs_orders_date,
        departure_date,
        arrival_date,
        origin_base,
        destination_base,
        travel_method,
        dependents_count,
        rank_at_pcs,
        branch,
        status,
        readiness_score,
        completion_percentage,
        entitlements
      `
      )
      .eq("user_id", userId)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!claim) {
      return NextResponse.json({
        hasActiveClaim: false,
        message: "No active PCS claim found",
      });
    }

    // Get latest calculation snapshot
    const { data: snapshot } = await supabaseAdmin
      .from("pcs_entitlement_snapshots")
      .select("*")
      .eq("claim_id", claim.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get validation flags
    const { data: flags } = await supabaseAdmin
      .from("pcs_claim_checks")
      .select("*")
      .eq("claim_id", claim.id)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false });

    // Sanitize and return context (NO PII)
    const context = {
      hasActiveClaim: true,
      claimId: claim.id,
      pcsType: claim.travel_method,
      rank: claim.rank_at_pcs,
      dependents: claim.dependents_count,
      distance: claim.entitlements?.distance || 0,
      currentStatus: claim.status,
      completionPercentage: claim.completion_percentage,
      readinessScore: claim.readiness_score,
      estimatedTotal: snapshot?.total_estimated || 0,
      validationIssues: flags?.length || 0,
      entitlements: {
        dla: snapshot?.dla_amount || 0,
        tle: snapshot?.tle_amount || 0,
        malt: snapshot?.malt_amount || 0,
        perDiem: snapshot?.per_diem_amount || 0,
        ppm: snapshot?.ppm_estimate || 0,
      },
      // NO PII: names, addresses, SSN, etc.
    };

    return NextResponse.json(context);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await req.json();
    const { question, claimId } = body;

    if (!question) {
      throw Errors.invalidInput("Question is required");
    }

    // Get claim context if claimId provided
    let claimContext = null;
    if (claimId) {
      const { data: claim } = await supabaseAdmin
        .from("pcs_claims")
        .select(
          `
          id,
          claim_name,
          travel_method,
          dependents_count,
          rank_at_pcs,
          branch,
          status,
          readiness_score,
          completion_percentage
        `
        )
        .eq("id", claimId)
        .eq("user_id", userId)
        .maybeSingle();

      if (claim) {
        claimContext = {
          claimId: claim.id,
          pcsType: claim.travel_method,
          rank: claim.rank_at_pcs,
          dependents: claim.dependents_count,
          status: claim.status,
          readinessScore: claim.readiness_score,
          completionPercentage: claim.completion_percentage,
        };
      }
    }

    // Forward to Ask Assistant with PCS context
    const askResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`, // Pass user context
      },
      body: JSON.stringify({
        question,
        context: {
          type: "pcs_claim",
          data: claimContext,
        },
      }),
    });

    if (!askResponse.ok) {
      throw new Error("Failed to get response from Ask Assistant");
    }

    const askResult = await askResponse.json();

    // Log the interaction
    await supabaseAdmin.from("pcs_analytics").insert({
      user_id: userId,
      claim_id: claimId,
      event_type: "ask_assistant_question",
      event_data: {
        question: question.substring(0, 100), // Truncate for privacy
        hasContext: !!claimContext,
        responseLength: askResult.response?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      response: askResult.response,
      context: claimContext,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
