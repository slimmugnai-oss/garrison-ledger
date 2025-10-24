/**
 * ASK ASSISTANT - Submit Question
 *
 * Handles question submission with credit checking, data querying, and AI generation
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ssot } from "@/lib/ssot";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubmitRequest {
  question: string;
  templateId?: string;
}

interface DataSource {
  table: string;
  source_name: string;
  url: string;
  effective_date: string;
  data: Record<string, unknown>;
}

interface AnswerResponse {
  bottomLine: string[];
  nextSteps: { text: string; action: string; url?: string }[];
  numbersUsed: { value: string; source: string; effective_date: string }[];
  citations: { title: string; url: string }[];
  verificationChecklist: string[];
  confidence: number;
  mode: "strict" | "advisory";
  sources: DataSource[];
  toolHandoffs: { tool: string; url: string; description: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SubmitRequest = await request.json();
    const { question, templateId } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Check user's credit balance
    const { data: credits, error: creditsError } = await supabase
      .from("ask_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (creditsError && creditsError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to check credits" }, { status: 500 });
    }

    if (!credits || credits.credits_remaining <= 0) {
      return NextResponse.json(
        {
          error: "No credits remaining",
          credits_remaining: credits?.credits_remaining || 0,
          tier: credits?.tier || "free",
        },
        { status: 402 }
      );
    }

    // Get user's tier for rate limiting
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("tier")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const userTier = entitlement?.tier === "premium" ? "premium" : "free";
    const _rateLimit = ssot.features.askAssistant.rateLimits[userTier];

    const startTime = Date.now();

    // Query official data sources (pass userId for personalization)
    const dataSources = await queryOfficialSources(question, userId);

    // Determine mode (strict vs advisory)
    const mode = dataSources.length > 0 ? "strict" : "advisory";

    // Generate AI answer
    const answer = await generateAnswer(question, dataSources, mode, userTier);

    const responseTime = Date.now() - startTime;

    // Decrement credit
    const { error: updateError } = await supabase
      .from("ask_credits")
      .update({
        credits_remaining: credits.credits_remaining - 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update credits:", updateError);
    }

    // Save question to history
    const { error: saveError } = await supabase.from("ask_questions").insert({
      user_id: userId,
      question: question.trim(),
      answer: JSON.stringify(answer),
      confidence_score: answer.confidence,
      mode,
      sources_used: dataSources,
      tokens_used: estimateTokens(answer),
      response_time_ms: responseTime,
      tool_handoffs: answer.toolHandoffs,
      template_id: templateId,
    });

    if (saveError) {
      console.error("Failed to save question:", saveError);
    }

    return NextResponse.json({
      success: true,
      answer,
      credits_remaining: credits.credits_remaining - 1,
      tier: userTier,
    });
  } catch (error) {
    console.error("Ask submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Query official data sources based on question keywords
 */
async function queryOfficialSources(question: string, userId: string): Promise<DataSource[]> {
  const sources: DataSource[] = [];
  const questionLower = question.toLowerCase();

  try {
    // BAH queries - Use user's location or extract from question
    if (questionLower.includes("bah") || questionLower.includes("housing allowance")) {
      // Try to get user's MHA from profile first
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("mha_or_zip")
        .eq("user_id", userId)
        .maybeSingle();

      let bahQuery = supabase.from("bah_rates").select("*");

      // If user has MHA in profile, use it
      if (profile?.mha_or_zip) {
        bahQuery = bahQuery.or(`mha.eq.${profile.mha_or_zip},zip_code.eq.${profile.mha_or_zip}`);
      }
      
      // Extract location from question (e.g., "Fort Bliss", "San Diego", "CA")
      // Common base names and cities
      const locationMatch = question.match(
        /(Fort|Camp|Naval|Marine|Air Force Base|AFB|Bragg|Bliss|Hood|Campbell|Lewis|Pendleton|San Diego|Norfolk|Pearl Harbor|Okinawa)/i
      );
      
      if (locationMatch) {
        const location = locationMatch[0];
        // Search in MHA names and ZIP codes
        bahQuery = bahQuery.or(`mha.ilike.%${location}%,zip_code.ilike.%${location}%`);
      }

      const { data: bahData } = await bahQuery.limit(10); // Increased from 5 to 10

      if (bahData && bahData.length > 0) {
        sources.push({
          table: "bah_rates",
          source_name: "DFAS BAH Calculator",
          url: "https://www.dfas.mil/militarymembers/payentitlements/bah/",
          effective_date: "2025-01-01",
          data: bahData as unknown as Record<string, unknown>,
        });
      }
    }

    // Base pay queries
    if (questionLower.includes("base pay") || questionLower.includes("salary")) {
      const { data: payData } = await supabase.from("military_pay_tables").select("*").limit(5);

      if (payData && payData.length > 0) {
        sources.push({
          table: "military_pay_tables",
          source_name: "DFAS Pay Tables",
          url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
          effective_date: "2025-01-01",
          data: payData as unknown as Record<string, unknown>,
        });
      }
    }

    // TSP queries
    if (questionLower.includes("tsp") || questionLower.includes("thrift savings")) {
      sources.push({
        table: "tsp_constants",
        source_name: "TSP.gov",
        url: "https://www.tsp.gov/",
        effective_date: "2025-01-01",
        data: { max_contribution: 23000, matching: "BRS only" },
      });
    }

    // SGLI queries
    if (questionLower.includes("sgli") || questionLower.includes("life insurance")) {
      const { data: sgliData } = await supabase.from("sgli_rates").select("*").limit(3);

      if (sgliData && sgliData.length > 0) {
        sources.push({
          table: "sgli_rates",
          source_name: "VA SGLI",
          url: "https://www.va.gov/life-insurance/options-eligibility/sgli/",
          effective_date: "2025-01-01",
          data: sgliData as unknown as Record<string, unknown>,
        });
      }
    }
  } catch (error) {
    console.error("Error querying data sources:", error);
  }

  return sources;
}

/**
 * Generate AI answer using Gemini 2.5 Flash
 */
async function generateAnswer(
  question: string,
  dataSources: DataSource[],
  mode: "strict" | "advisory",
  userTier: string
): Promise<AnswerResponse> {
  const rateLimit =
    ssot.features.askAssistant.rateLimits[
      userTier as keyof typeof ssot.features.askAssistant.rateLimits
    ];
  const maxTokens = rateLimit.maxTokens;

  // Build context from data sources
  const contextData = dataSources.map((source) => ({
    table: source.table,
    source_name: source.source_name,
    url: source.url,
    effective_date: source.effective_date,
    data: source.data,
  }));

  const prompt = buildPrompt(question, contextData, mode, maxTokens);

  // Use GEMINI_API_KEY (consistent with explainer and other AI features)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("[Ask Assistant] No API key found (checked GEMINI_API_KEY and GOOGLE_API_KEY)");
    return {
      bottomLine: ["API configuration error. Please contact support."],
      nextSteps: [],
      numbersUsed: [],
      citations: [],
      verificationChecklist: [],
      confidence: 0,
      mode: "advisory",
      sources: dataSources,
      toolHandoffs: [],
    };
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Gemini API] HTTP error:", response.status, errorText);
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    // Enhanced logging
    console.log("[Gemini API] Response status:", response.status);
    console.log("[Gemini API] Candidates count:", result.candidates?.length || 0);
    console.log(
      "[Gemini API] First candidate:",
      JSON.stringify(result.candidates?.[0], null, 2).substring(0, 500)
    );

    const answerText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!answerText) {
      console.error("[Gemini API] No answer text in response:", JSON.stringify(result));
      throw new Error("Gemini returned empty response");
    }

    console.log("[Gemini API] Answer text length:", answerText.length, "chars");
    console.log("[Gemini API] Answer preview:", answerText.substring(0, 200));

    return parseStructuredAnswer(answerText, dataSources, mode);
  } catch (error) {
    console.error("[Gemini API] Error:", error);
    return {
      bottomLine: ["Unable to generate answer at this time. Please try again."],
      nextSteps: [],
      numbersUsed: [],
      citations: [],
      verificationChecklist: [],
      confidence: 0.1,
      mode: "advisory",
      sources: dataSources,
      toolHandoffs: [],
    };
  }
}

/**
 * Build prompt for Gemini with strict sourcing requirements
 */
function buildPrompt(
  question: string,
  contextData: DataSource[],
  mode: string,
  maxTokens: number
): string {
  const basePrompt = `You are a military financial expert assistant. Answer the user's question using ONLY the provided official data sources. 

QUESTION: ${question}

${mode === "strict" ? "OFFICIAL DATA AVAILABLE:" : "ADVISORY MODE - NO OFFICIAL DATA:"}
${contextData
  .map(
    (source) => `
Source: ${source.source_name}
URL: ${source.url}
Effective: ${source.effective_date}
Data: ${JSON.stringify(source.data, null, 2)}
`
  )
  .join("\n")}

STRICT REQUIREMENTS:
1. Use ONLY the provided data sources
2. Cite every number with source + effective date
3. If no official data, clearly mark as "ADVISORY" 
4. You have ${maxTokens} tokens to generate a comprehensive answer
5. Use bullet points and clear structure
6. Suggest relevant tools when appropriate
7. CRITICAL: Return ONLY valid JSON, no markdown formatting, no explanatory text

RESPONSE FORMAT - Return this EXACT JSON structure (no markdown, no code blocks):
{
  "bottomLine": ["Key point 1", "Key point 2", "Key point 3"],
  "nextSteps": [{"text": "Action to take", "action": "Button text", "url": "optional_url"}],
  "numbersUsed": [{"value": "Specific amount or rate", "source": "Source Name", "effective_date": "YYYY-MM-DD"}],
  "citations": [{"title": "Source Title", "url": "Source URL"}],
  "verificationChecklist": ["Verification step 1", "Verification step 2"],
  "toolHandoffs": [{"tool": "Tool Name", "url": "/dashboard/tool", "description": "Why use this tool"}]
}

${mode === "advisory" ? "IMPORTANT: This is ADVISORY mode. No official data available. Mark clearly as advisory and suggest requesting coverage." : ""}

REMINDER: Return ONLY the JSON object above. Do not wrap it in markdown code blocks or add any explanatory text.`;

  return basePrompt;
}

/**
 * Parse structured answer from AI response
 */
function parseStructuredAnswer(
  text: string,
  sources: DataSource[],
  mode: "strict" | "advisory"
): AnswerResponse {
  try {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();

    // Remove ```json or ``` wrapping
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    // Try to extract JSON from response - find first { to last }
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonString = cleanedText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonString);

      // Validate required fields
      if (!parsed.bottomLine || !Array.isArray(parsed.bottomLine)) {
        throw new Error("Invalid bottomLine field");
      }

      return {
        bottomLine: parsed.bottomLine,
        nextSteps: parsed.nextSteps || [],
        numbersUsed: parsed.numbersUsed || [],
        citations: parsed.citations || [],
        verificationChecklist: parsed.verificationChecklist || [],
        confidence: mode === "strict" ? 0.9 : 0.4,
        mode,
        sources,
        toolHandoffs: parsed.toolHandoffs || [],
      };
    }
  } catch (error) {
    console.error("[ParseAnswer] Failed to parse structured answer:", error);
    console.error("[ParseAnswer] Raw AI response length:", text.length);
    console.error("[ParseAnswer] Raw AI response preview:", text.substring(0, 500));
    console.error(
      "[ParseAnswer] Raw AI response end:",
      text.substring(Math.max(0, text.length - 200))
    );
  }

  // Fallback - try to extract useful info from text
  const lines = text.split("\n").filter((line) => line.trim());
  const bottomLine = lines.slice(0, 3).map((line) => line.replace(/^[-*•]\s*/, "").trim());

  return {
    bottomLine:
      bottomLine.length > 0
        ? bottomLine
        : ["Unable to generate complete answer. Please try rephrasing your question."],
    nextSteps: [],
    numbersUsed: sources.map((s) => ({
      value: "See source",
      source: s.source_name,
      effective_date: s.effective_date,
    })),
    citations: sources.map((s) => ({ title: s.source_name, url: s.url })),
    verificationChecklist: ["Verify with official sources"],
    confidence: mode === "strict" ? 0.5 : 0.2,
    mode,
    sources,
    toolHandoffs: [],
  };
}

/**
 * Estimate token count for answer
 */
function estimateTokens(answer: AnswerResponse): number {
  const text = JSON.stringify(answer);
  return Math.ceil(text.length / 4); // Rough estimate: 4 chars per token
}
