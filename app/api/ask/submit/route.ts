/**
 * ASK ASSISTANT - Submit Question
 *
 * Handles question submission with credit checking, data querying, and AI generation
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { queryOfficialSources } from "@/lib/ask/data-query-engine";
import type { DataSource } from "@/lib/ask/data-query-engine";
import { generateProactiveGuidance } from "@/lib/ask/proactive-advisor";
import type { ProactiveAnalysis } from "@/lib/ask/proactive-advisor";
import { getCachedResponse } from "@/lib/ask/response-cache";
import { orchestrateTools } from "@/lib/ask/tool-orchestrator";
import { logger } from "@/lib/logger";
import { hybridSearch, type RetrievedChunk } from "@/lib/rag/retrieval-engine";
import { ssot } from "@/lib/ssot";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubmitRequest {
  question: string;
  templateId?: string;
  sessionId?: string; // Multi-turn conversation support
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
    const { question, templateId, sessionId } = body;

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

    // 🚀 PERFORMANCE: Check cache for common questions (skip for personal context)
    const isPersonalQuestion = /\b(my|i|me|mine)\s/i.test(question);
    if (!isPersonalQuestion) {
      const cachedResponse = await getCachedResponse(question);
      if (cachedResponse) {
        logger.info("[Performance] Returning cached response (200ms vs 2000ms)");
        
        // Still decrement credit and save to history
        await supabase
          .from("ask_credits")
          .update({
            credits_remaining: credits.credits_remaining - 1,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        return NextResponse.json({
          success: true,
          answer: cachedResponse.answer,
          credits_remaining: credits.credits_remaining - 1,
          tier: userTier,
          cached: true,
          cacheAge: Math.floor(
            (Date.now() - new Date(cachedResponse.cachedAt).getTime()) / (1000 * 60 * 60)
          ),
        });
      }
    }

    // 🆕 MULTI-TURN: Get or create conversation session
    const conversation = await getOrCreateConversation(userId, sessionId);
    const conversationContext = await getConversationContext(conversation.id);

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
      logger.info(`[Ask RAG] Retrieved ${ragChunks.length} knowledge chunks`);
    } catch (error) {
      logger.error("[Ask RAG] Failed to retrieve chunks:", error);
      // Continue without RAG if it fails - don't block the request
    }

    // Determine mode (strict vs advisory)
    const mode = dataSources.length > 0 ? "strict" : "advisory";

    // Generate AI answer with RAG context + conversation context
    const answer = await generateAnswer(
      question,
      dataSources,
      ragChunks,
      mode,
      userTier,
      conversationContext
    );

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
      logger.error("Failed to update credits:", updateError);
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
      logger.error("Failed to save question:", saveError);
    }

    // 🆕 MULTI-TURN: Save message to conversation
    await saveConversationMessage(
      conversation.id,
      userId,
      question,
      answer,
      responseTime,
      conversation.total_questions + 1
    );

    // 🆕 MULTI-TURN: Update conversation metadata
    await updateConversationMetadata(conversation.id, answer, dataSources);

    // 🆕 PROACTIVE: Generate comprehensive proactive guidance
    const suggestedFollowups = generateFollowupSuggestions(question, answer, conversationContext);
    
    const userProfileData = dataSources.find((s) => s.table === "user_profile")?.data || {};
    const proactiveGuidance = generateProactiveGuidance(
      question,
      userProfileData,
      dataSources,
      conversationContext.previousQuestions
    );

    // 🔧 TOOL ORCHESTRATION: Recommend relevant Garrison Ledger tools
    const toolOrchestration = orchestrateTools(
      question,
      userProfileData,
      dataSources,
      conversationContext.previousQuestions
    );

    return NextResponse.json({
      success: true,
      answer,
      credits_remaining: credits.credits_remaining - 1,
      tier: userTier,
      sessionId: conversation.session_id, // Return session ID for client
      conversationId: conversation.id,
      suggestedFollowups, // Quick follow-ups
      proactiveInsights: proactiveGuidance.insights, // Deep proactive analysis
      suggestedQuestions: proactiveGuidance.suggestedQuestions, // Related topics
      recommendedTools: proactiveGuidance.toolsToUse, // Tool handoffs
      toolOrchestration: toolOrchestration, // Smart tool triggering
    });
  } catch (error) {
    logger.error("Ask submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Generate AI answer using Gemini 2.5 Flash with RAG context
 */
interface ConversationContext {
  previousQuestions: Array<{ question: string; answer: string; timestamp: string }>;
  conversationTopic?: string;
  totalTurns: number;
}

async function generateAnswer(
  question: string,
  dataSources: DataSource[],
  ragChunks: RetrievedChunk[],
  mode: "strict" | "advisory",
  userTier: string,
  conversationContext?: ConversationContext
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

  const prompt = buildPrompt(question, contextData, ragChunks, mode, maxTokens, conversationContext);

  // Use GEMINI_API_KEY (consistent with explainer and other AI features)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    logger.error("[Ask Assistant] No API key found (checked GEMINI_API_KEY and GOOGLE_API_KEY)");
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
      logger.error("[Gemini API] HTTP error:", { status: response.status, error: errorText });
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    // Enhanced logging
    logger.info("[Gemini API] Response status:", response.status);
    logger.info("[Gemini API] Candidates count:", result.candidates?.length || 0);
    logger.info(
      "[Gemini API] First candidate:",
      JSON.stringify(result.candidates?.[0], null, 2).substring(0, 500)
    );

    const answerText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!answerText) {
      logger.error("[Gemini API] No answer text in response:", JSON.stringify(result));
      throw new Error("Gemini returned empty response");
    }

    logger.info("[Gemini API] Answer text length:", { length: answerText.length, unit: "chars" });
    logger.info("[Gemini API] Answer preview:", { preview: answerText.substring(0, 200) });

    return parseStructuredAnswer(answerText, dataSources, mode);
  } catch (error) {
    logger.error("[Gemini API] Error:", {
      error: error instanceof Error ? error.message : String(error),
    });
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
  maxTokens: number,
  conversationContext?: ConversationContext
): string {
  // Check if user profile is in context
  const userProfile = contextData.find((source) => source.table === "user_profile");
  const hasUserProfile = !!userProfile;

  // Build conversation context section
  const conversationContextSection =
    conversationContext && conversationContext.previousQuestions.length > 0
      ? `
🔄 CONVERSATION CONTEXT (Multi-Turn Mode):
You are currently in an ongoing conversation with this user. Here are the previous ${conversationContext.previousQuestions.length} question(s) and answer(s):

${conversationContext.previousQuestions
  .map(
    (qa, idx) => `
[Q${idx + 1}]: ${qa.question}
[A${idx + 1}]: ${qa.answer.substring(0, 300)}...
`
  )
  .join("\n")}

**CRITICAL: Use this conversation context to:**
1. Reference previous answers (e.g., "As I mentioned about your BAH earlier...")
2. Build on previous topics (if they asked about TSP, now asking about retirement = related)
3. Avoid repeating information you already provided
4. Maintain conversation coherence and continuity
5. Suggest logical next questions based on conversation flow

Topic being discussed: ${conversationContext.conversationTopic || "General military life"}
Total questions in this session: ${conversationContext.totalTurns}
`
      : "";

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
- Paygrade: ${userProfile?.data.paygrade || "Not set"} (AUTHORITATIVE - use for all calculations)
- Rank Title: ${userProfile?.data.rank || "Not set"} (display only)
- Location: ${userProfile?.data.current_base || userProfile?.data.mha_code || "Not set"}
- Years of Service: ${userProfile?.data.years_of_service || "Unknown"}
- Dependents: ${userProfile?.data.has_dependents ? `Yes (${userProfile?.data.dependents_count || 1})` : "No"}
- Branch: ${userProfile?.data.branch || "Unknown"}

**PAYGRADE RULES (CRITICAL):**
1. Paygrade (E01-E09, W01-W05, O01-O10) is the ONLY field used for BAH, base pay, and entitlement calculations
2. Rank title is for display/context only - NEVER use rank title to determine pay rates
3. If paygrade is missing but rank is present, prompt user to update profile at /dashboard/profile
4. Always cite the data source and effective date when providing dollar amounts
5. If data sources are older than 6 months, mention they should verify with current rates

When answering:
1. Use their ACTUAL paygrade, location, and dependent status - not hypothetical examples
2. Say "Based on your profile" or "For you as an ${userProfile?.data.paygrade || "Unknown"} with dependents"
3. If they ask about "my BAH" or "my pay", use THEIR specific data from the sources below
4. If their profile is incomplete (missing paygrade), tell them to update it at /dashboard/profile
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
3. **DATA ACCURACY REQUIREMENTS:**
   - Always use PAYGRADE (not rank title) for BAH, base pay, DLA, and entitlement calculations
   - Cite data source name and effective date for all dollar amounts
   - If multiple rates exist for same paygrade, use dependent status to determine correct rate
   - If data is older than current year (2025), add disclaimer: "Verify current rates at [source URL]"
   - NEVER estimate or approximate official pay rates - use exact values from data sources only
4. Write conversationally - imagine explaining this to a friend over coffee
5. Be comprehensive (200-400 words) but start with the most important info (BLUF)
6. Include specific numbers, dates, regulations, and real-world examples
7. Acknowledge challenges ("Yes, this is confusing" or "You're not alone in this")
8. Suggest relevant Garrison Ledger tools (PCS Copilot, Base Navigator, LES Auditor, TSP Modeler)
9. Provide verification steps for users to confirm information
10. You have ${maxTokens} tokens - use them to be thorough and helpful
11. CRITICAL: Return ONLY valid JSON, no markdown formatting, no explanatory text

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
"Based on your profile (paygrade E05 with dependents in El Paso, TX), your BAH for 2025 is $1,773 per month. This rate is effective January 1, 2025, according to the DFAS BAH Calculator. Your specific rate accounts for your paygrade (E05) and dependent status."

NOT THIS (generic example or wrong field):
"If you were an E-5 with dependents in El Paso, your BAH would be $1,773/month."
"Based on your rank as a Sergeant, your BAH is..." (WRONG - must use paygrade, not rank title)

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
    logger.error("[ParseAnswer] Failed to parse structured answer:", error);
    logger.error("[ParseAnswer] Raw AI response length:", text.length);
    logger.error("[ParseAnswer] Raw AI response preview:", text.substring(0, 500));
    logger.error(
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

/**
 * Get or create conversation session
 */
async function getOrCreateConversation(
  userId: string,
  sessionId?: string
): Promise<{ id: string; session_id: string; total_questions: number }> {
  // If sessionId provided, try to find existing active conversation
  if (sessionId) {
    const { data: existing } = await supabase
      .from("ask_conversations")
      .select("id, session_id, total_questions")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (existing) {
      logger.info(`[Multi-Turn] Found existing conversation: ${existing.id}`);
      return existing;
    }
  }

  // Create new conversation
  const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { data: newConversation, error } = await supabase
    .from("ask_conversations")
    .insert({
      user_id: userId,
      session_id: newSessionId,
      total_questions: 0,
      is_active: true,
    })
    .select("id, session_id, total_questions")
    .single();

  if (error || !newConversation) {
    logger.error("[Multi-Turn] Failed to create conversation:", error);
    // Fallback to minimal conversation object
    return {
      id: "fallback",
      session_id: newSessionId,
      total_questions: 0,
    };
  }

  logger.info(`[Multi-Turn] Created new conversation: ${newConversation.id}`);
  return newConversation;
}

/**
 * Get recent conversation context (last 5 Q&As)
 */
async function getConversationContext(conversationId: string): Promise<ConversationContext> {
  if (conversationId === "fallback") {
    return { previousQuestions: [], totalTurns: 0 };
  }

  // Get last 5 messages from this conversation
  const { data: messages } = await supabase
    .from("ask_conversation_messages")
    .select("content, answer_data, message_type, message_order, created_at")
    .eq("conversation_id", conversationId)
    .order("message_order", { ascending: false })
    .limit(10); // Get last 10 messages (5 Q&A pairs)

  if (!messages || messages.length === 0) {
    return { previousQuestions: [], totalTurns: 0 };
  }

  // Group into Q&A pairs
  const qaPairs: Array<{ question: string; answer: string; timestamp: string }> = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.message_type === "question") {
      // Find corresponding answer
      const answerMsg = messages.find(
        (m) =>
          m.message_type === "answer" && m.message_order === msg.message_order + 1
      );

      if (answerMsg && answerMsg.answer_data) {
        const answerData = typeof answerMsg.answer_data === "string" 
          ? JSON.parse(answerMsg.answer_data) 
          : answerMsg.answer_data;
        
        qaPairs.push({
          question: msg.content,
          answer: answerData.bottomLine?.join(" ") || "Answer not available",
          timestamp: msg.created_at,
        });
      }
    }
  }

  // Get conversation metadata
  const { data: conversation } = await supabase
    .from("ask_conversations")
    .select("conversation_topic, total_questions")
    .eq("id", conversationId)
    .single();

  return {
    previousQuestions: qaPairs.slice(0, 5), // Last 5 Q&A pairs
    conversationTopic: conversation?.conversation_topic,
    totalTurns: conversation?.total_questions || 0,
  };
}

/**
 * Save message to conversation
 */
async function saveConversationMessage(
  conversationId: string,
  userId: string,
  question: string,
  answer: AnswerResponse,
  responseTime: number,
  messageOrder: number
): Promise<void> {
  if (conversationId === "fallback") return;

  try {
    // Save question message
    await supabase.from("ask_conversation_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      message_type: "question",
      content: question,
      message_order: messageOrder * 2 - 1, // Odd numbers for questions (1, 3, 5...)
    });

    // Save answer message
    await supabase.from("ask_conversation_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      message_type: "answer",
      content: answer.bottomLine.join("\n"),
      answer_data: answer,
      confidence_score: answer.confidence,
      mode: answer.mode,
      sources_used: answer.sources,
      response_time_ms: responseTime,
      message_order: messageOrder * 2, // Even numbers for answers (2, 4, 6...)
    });

    logger.info(`[Multi-Turn] Saved Q&A to conversation ${conversationId}`);
  } catch (error) {
    logger.error("[Multi-Turn] Failed to save message:", error);
    // Don't throw - let the request complete even if conversation save fails
  }
}

/**
 * Update conversation metadata
 */
async function updateConversationMetadata(
  conversationId: string,
  answer: AnswerResponse,
  dataSources: DataSource[]
): Promise<void> {
  if (conversationId === "fallback") return;

  try {
    // Detect conversation topic from sources and answer
    const topics = new Set<string>();
    if (dataSources.some((s) => s.table === "bah_rates")) topics.add("housing");
    if (dataSources.some((s) => s.table === "military_pay_tables")) topics.add("pay");
    if (answer.bottomLine.some((line) => /tsp|retirement/i.test(line))) topics.add("retirement");
    if (answer.bottomLine.some((line) => /pcs|move|relocation/i.test(line))) topics.add("pcs");
    if (answer.bottomLine.some((line) => /deploy/i.test(line))) topics.add("deployment");

    const conversationTopic = Array.from(topics)[0] || "general";

    await supabase
      .from("ask_conversations")
      .update({
        total_questions: supabase.rpc("increment", { row_id: conversationId }), // Increment counter
        conversation_topic: conversationTopic,
        last_activity_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Extend 24 hours
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    logger.info(`[Multi-Turn] Updated conversation ${conversationId} metadata`);
  } catch (error) {
    logger.error("[Multi-Turn] Failed to update conversation metadata:", error);
  }
}

/**
 * Generate suggested follow-up questions
 */
function generateFollowupSuggestions(
  question: string,
  answer: AnswerResponse,
  conversationContext: ConversationContext
): Array<{ text: string; category: string; priority: number }> {
  const suggestions: Array<{ text: string; category: string; priority: number }> = [];

  // Suggest deeper dive on current topic
  if (answer.bottomLine.length > 2) {
    suggestions.push({
      text: "Can you explain that in more detail with specific examples?",
      category: "deeper",
      priority: 80,
    });
  }

  // Suggest tool handoffs if available
  if (answer.toolHandoffs && answer.toolHandoffs.length > 0) {
    suggestions.push({
      text: `Want me to walk you through using ${answer.toolHandoffs[0].tool}?`,
      category: "tool_handoff",
      priority: 90,
    });
  }

  // Suggest related topics based on conversation
  if (/bah|housing/i.test(question)) {
    suggestions.push({
      text: "Should I live on-base or off-base to maximize savings?",
      category: "related",
      priority: 70,
    });
  }

  if (/tsp|retirement/i.test(question)) {
    suggestions.push({
      text: "How should I allocate my TSP based on my age?",
      category: "related",
      priority: 75,
    });
  }

  if (/pcs|move/i.test(question)) {
    suggestions.push({
      text: "What's my total PCS budget and timeline?",
      category: "related",
      priority: 75,
    });
  }

  // Limit to top 3 suggestions
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
