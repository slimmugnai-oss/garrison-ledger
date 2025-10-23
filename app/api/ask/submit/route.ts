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

    // Query official data sources
    const dataSources = await queryOfficialSources(question);

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
async function queryOfficialSources(question: string): Promise<DataSource[]> {
  const sources: DataSource[] = [];
  const questionLower = question.toLowerCase();

  try {
    // BAH queries
    if (questionLower.includes("bah") || questionLower.includes("housing allowance")) {
      const { data: bahData } = await supabase.from("bah_rates").select("*").limit(5);

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

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!,
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

    const result = await response.json();
    const answerText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return parseStructuredAnswer(answerText, dataSources, mode);
  } catch (error) {
    console.error("Gemini API error:", error);
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
4. Keep answers under ${maxTokens} tokens
5. Use bullet points and clear structure
6. Suggest relevant tools when appropriate

RESPONSE FORMAT (JSON):
{
  "bottomLine": ["Key point 1", "Key point 2"],
  "nextSteps": [{"text": "Action", "action": "button_text", "url": "optional_url"}],
  "numbersUsed": [{"value": "Amount", "source": "Source Name", "effective_date": "Date"}],
  "citations": [{"title": "Source Title", "url": "Source URL"}],
  "verificationChecklist": ["Check item 1", "Check item 2"],
  "toolHandoffs": [{"tool": "Tool Name", "url": "/dashboard/tool", "description": "Why use this tool"}]
}

${mode === "advisory" ? "IMPORTANT: This is ADVISORY mode. No official data available. Mark clearly as advisory and suggest requesting coverage." : ""}`;

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
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        confidence: mode === "strict" ? 0.9 : 0.4,
        mode,
        sources,
        toolHandoffs: parsed.toolHandoffs || [],
      };
    }
  } catch (error) {
    console.error("Failed to parse structured answer:", error);
  }

  // Fallback to simple parsing
  return {
    bottomLine: [text.substring(0, 200) + "..."],
    nextSteps: [],
    numbersUsed: sources.map((s) => ({
      value: "See source",
      source: s.source_name,
      effective_date: s.effective_date,
    })),
    citations: sources.map((s) => ({ title: s.source_name, url: s.url })),
    verificationChecklist: ["Verify with official sources"],
    confidence: mode === "strict" ? 0.7 : 0.3,
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
