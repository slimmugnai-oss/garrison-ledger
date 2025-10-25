/**
 * ASK ASSISTANT - Submit Question
 *
 * Handles question submission with credit checking, data querying, and AI generation
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ssot } from "@/lib/ssot";
import { queryOfficialSources } from "@/lib/ask/data-query-engine";
import type { DataSource } from "@/lib/ask/data-query-engine";
import { hybridSearch, type RetrievedChunk } from "@/lib/rag/retrieval-engine";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubmitRequest {
  question: string;
  templateId?: string;
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

    // 🆕 RAG RETRIEVAL: Search knowledge base for relevant guidance
    let ragChunks: RetrievedChunk[] = [];
    try {
      ragChunks = await hybridSearch(
        question,
        {
          content_types: ["premium_guide", "jtr_rule", "sgli_rate"],
        },
        { limit: 5 } // Retrieve top 5 most relevant chunks
      );
      console.log(`[Ask RAG] Retrieved ${ragChunks.length} knowledge chunks`);
    } catch (error) {
      console.error("[Ask RAG] Failed to retrieve chunks:", error);
      // Continue without RAG if it fails - don't block the request
    }

    // Determine mode (strict vs advisory)
    const mode = dataSources.length > 0 ? "strict" : "advisory";

    // Generate AI answer with RAG context
    const answer = await generateAnswer(question, dataSources, ragChunks, mode, userTier);

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
 * Generate AI answer using Gemini 2.5 Flash with RAG context
 */
async function generateAnswer(
  question: string,
  dataSources: DataSource[],
  ragChunks: RetrievedChunk[],
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

  const prompt = buildPrompt(question, contextData, ragChunks, mode, maxTokens);

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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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
 * Build prompt for Gemini with strict sourcing requirements + RAG context
 */
function buildPrompt(
  question: string,
  contextData: DataSource[],
  ragChunks: RetrievedChunk[],
  mode: string,
  maxTokens: number
): string {
  // Check if user profile is in context
  const userProfile = contextData.find((source) => source.table === "user_profile");
  const hasUserProfile = !!userProfile;

  const basePrompt = `You are an expert military financial and lifestyle advisor with comprehensive knowledge of:
- Military pay, allowances, and benefits (BAH, BAS, TSP, SGLI, etc.)
- PCS moves, deployments, and TDY
- VA benefits, GI Bill, and military spouse resources
- Military bases, installations, and OCONUS assignments
- Career progression, retirement systems (BRS vs High-3)
- Military culture, regulations, and lifestyle

${
  hasUserProfile
    ? `
**CRITICAL: You have access to the user's actual profile data. Use it to personalize your answer.**

User Profile:
- Rank/Paygrade: ${userProfile?.data.rank || userProfile?.data.paygrade || "Unknown"}
- Location: ${userProfile?.data.current_base || userProfile?.data.mha_code || "Not set"}
- Years of Service: ${userProfile?.data.years_of_service || "Unknown"}
- Dependents: ${userProfile?.data.has_dependents ? `Yes (${userProfile?.data.dependents_count || 1})` : "No"}
- Branch: ${userProfile?.data.branch || "Unknown"}

When answering:
1. Use their ACTUAL rank, location, and dependent status - not hypothetical examples
2. Say "Based on your profile" or "For you as an ${userProfile?.data.paygrade || userProfile?.data.rank} with dependents"
3. If they ask about "my BAH" or "my pay", use THEIR specific data from the sources below
4. If their profile is incomplete, tell them to update it at /dashboard/profile
5. DO NOT say "if you were an E-5" - they ARE what their profile says they are
`
    : ""
}

Answer the user's question comprehensively and conversationally. Write like you're talking to a fellow service member or military spouse - use "you" and "your", be relatable but professional, and acknowledge the real challenges they face.

TONE GUIDELINES:
- Be conversational and personal (use "you", "your", not "service members")
- Acknowledge the emotional/practical challenges ("PCSing is tough, but here's how to make it easier")
- Be specific with numbers, dates, and real examples
- Share insights like a knowledgeable friend, not a corporate FAQ
- Length: Aim for 200-400 words for comprehensive topics, 100-200 for straightforward questions
- Use military terminology naturally but explain acronyms for spouses

QUESTION: ${question}

${mode === "strict" ? "OFFICIAL DATA AVAILABLE:" : "ADVISORY MODE - Using expert knowledge:"}
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

${
  ragChunks.length > 0
    ? `
📚 KNOWLEDGE BASE CONTEXT (${ragChunks.length} relevant excerpts from premium guides):
${ragChunks
  .map(
    (chunk, idx) => `
[${idx + 1}] ${chunk.content_type} (similarity: ${chunk.similarity.toFixed(2)}):
${chunk.content_text.substring(0, 600)}...
Guide: ${chunk.metadata?.guide_title || "Unknown"}
Section: ${chunk.metadata?.section || "N/A"}
`
  )
  .join("\n")}

**CRITICAL: These knowledge base excerpts contain detailed strategies, examples, and step-by-step guidance. Use them to enhance your answer with practical, actionable advice.**
`
    : ""
}

ANSWER GUIDELINES:
1. ${mode === "strict" ? "Prioritize provided data sources and cite them" : "Use your comprehensive military knowledge"}
2. ${hasUserProfile ? "**PERSONALIZE using their actual profile data - not hypothetical examples**" : "Provide general guidance"}
3. Write conversationally - imagine explaining this to a friend over coffee
4. Be comprehensive (200-400 words) but start with the most important info (BLUF)
5. Include specific numbers, dates, regulations, and real-world examples
6. Acknowledge challenges ("Yes, this is confusing" or "You're not alone in this")
7. Suggest relevant Garrison Ledger tools (PCS Copilot, Base Navigator, LES Auditor, TSP Modeler)
8. Provide verification steps for users to confirm information
9. You have ${maxTokens} tokens - use them to be thorough and helpful
10. CRITICAL: Return ONLY valid JSON, no markdown formatting, no explanatory text

RESPONSE FORMAT - Return this EXACT JSON structure (no markdown, no code blocks):
{
  "bottomLine": ["Most important point first (use their ACTUAL profile data)", "Second key point", "Third key point", "Additional detail or context"],
  "nextSteps": [{"text": "Specific action to take", "action": "Button text", "url": "optional_url"}],
  "numbersUsed": [{"value": "Specific amount or rate", "source": "Source Name", "effective_date": "YYYY-MM-DD"}],
  "citations": [{"title": "Source Title", "url": "Source URL"}],
  "verificationChecklist": ["How to verify this info", "Where to check official sources", "Who to ask if unsure"],
  "toolHandoffs": [{"tool": "PCS Copilot", "url": "/dashboard/pcs-copilot", "description": "Calculate exact PCS costs and see what you'll actually get"}]
}

${mode === "advisory" ? "ADVISORY MODE: You're operating on expert knowledge without specific official data. Be helpful and conversational but encourage users to verify with official sources. Suggest relevant Garrison Ledger tools that might have the data they need." : "STRICT MODE: Use provided official data as primary source. Supplement with context, explanation, and practical advice in a conversational tone."}

EXAMPLE GOOD RESPONSE (with profile):
"Based on your profile (E-5 with dependents in El Paso, TX), your BAH for 2025 is $1,773 per month. This rate is effective January 1, 2025, and is designed to cover your housing costs in the El Paso area. Your specific rate accounts for your rank (E-5) and the fact that you have dependents."

NOT THIS (generic example):
"If you were an E-5 with dependents in El Paso, your BAH would be $1,773/month."

EXAMPLE GOOD RESPONSE TONE:
"Yes, PCSing is absolutely challenging - you're basically uprooting your entire life and dealing with a mountain of paperwork at the same time. The average PCS involves coordinating movers, selling or renting your house, changing schools for kids, and managing the financial side of everything. Here's what makes it manageable: start planning 3-4 months out if possible, use the PCS Copilot tool to see exactly what you'll get for DLA and weight allowances, and don't be afraid to ask your unit's finance office questions - they've seen it all before."

NOT THIS (too corporate):
"PCSing can be significantly challenging and emotionally taxing. The difficulty stems from complex logistics and financial adjustments. Proactive planning and leveraging official resources are crucial."

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
