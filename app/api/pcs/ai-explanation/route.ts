import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * AI EXPLANATION API
 *
 * Generates AI-powered explanations for PCS validation flags
 * Uses Gemini 2.5 Flash for cost-effective explanations
 */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await req.json();
    const { validationFlag, claimContext } = body;

    if (!validationFlag) {
      throw Errors.invalidInput("Validation flag is required");
    }

    // Create context-aware prompt
    const prompt = createExplanationPrompt(validationFlag, claimContext);

    // Generate explanation using Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();

    // Log the interaction for analytics
    try {
      const { supabaseAdmin } = await import("@/lib/supabase");
      await supabaseAdmin.from("pcs_analytics").insert({
        user_id: userId,
        event_type: "ai_explanation_generated",
        event_data: {
          validation_category: validationFlag.category,
          severity: validationFlag.severity,
          explanation_length: explanation.length,
          model_used: "gemini-2.5-flash",
        },
      });
    } catch (analyticsError) {
      console.warn("Failed to log AI explanation analytics:", analyticsError);
    }

    return NextResponse.json({
      success: true,
      explanation,
      model: "gemini-2.5-flash",
      cost: "~$0.001", // Estimated cost per explanation
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Create context-aware prompt for AI explanation
 */
function createExplanationPrompt(validationFlag: any, claimContext: any): string {
  const basePrompt = `
You are a military financial expert explaining a PCS claim validation issue to a service member.

CONTEXT:
- Rank: ${claimContext.rank || "Not specified"}
- Branch: ${claimContext.branch || "Not specified"}
- Has Dependents: ${claimContext.hasDependents ? "Yes" : "No"}
- PCS Type: ${claimContext.pcsType || "Not specified"}

VALIDATION ISSUE:
- Field: ${validationFlag.field}
- Severity: ${validationFlag.severity}
- Message: ${validationFlag.message}
- Category: ${validationFlag.category}
- JTR Citation: ${validationFlag.jtr_citation || "Not specified"}
- Suggested Fix: ${validationFlag.suggested_fix || "Not provided"}

INSTRUCTIONS:
Explain this validation issue in 4-6 sentences that are:
1. Helpful and reassuring (not accusatory)
2. Educational about the JTR rule
3. Specific to this service member's situation
4. Actionable with clear next steps
5. Professional but conversational tone

Focus on:
- WHY this is flagged (JTR rule explanation)
- COMMON reasons this happens
- WHETHER it's fixable or just advisory
- SPECIFIC next steps for this service member

End with a clear, actionable next step.

EXPLANATION:`;

  return basePrompt;
}
