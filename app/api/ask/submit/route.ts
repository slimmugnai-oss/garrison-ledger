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
import { getCachedResponse } from "@/lib/ask/response-cache";
import { orchestrateTools } from "@/lib/ask/tool-orchestrator";
import { checkAndIncrement } from "@/lib/limits";
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
    
    // RATE LIMITING: Prevent abuse even with credits
    // Free: 50 questions/day, Premium: 500 questions/day
    const rateLimitResult = await checkAndIncrement(
      userId,
      '/api/ask/submit',
      userTier === 'premium' ? 500 : 50
    );

    if (!rateLimitResult.allowed) {
      logger.warn('[AskSubmit] Rate limit exceeded', {
        userId: userId.substring(0, 8) + '...',
        tier: userTier,
        count: rateLimitResult.count
      });
      
      return NextResponse.json(
        {
          error: `Daily question limit reached (${rateLimitResult.count}). Please try again tomorrow.`,
          credits_remaining: credits.credits_remaining,
          tier: userTier
        },
        { status: 429 }
      );
    }

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
  _conversationContext?: ConversationContext
): string {
  // Check if user profile is in context
  const userProfile = contextData.find((source) => source.table === "user_profile");
  const hasUserProfile = !!userProfile;

  const basePrompt = `You are an experienced military mentor and financial advisor. You've been through multiple PCS moves, deployments, and understand the real challenges of military life. You're talking to someone you know - be warm, knowledgeable, and direct.

${
  hasUserProfile
    ? `
**SILENT CONTEXT (use this data but DON'T restate it):**
Paygrade: ${userProfile?.data.paygrade || "Not set"}
Rank: ${userProfile?.data.rank || "Not set"}
Location: ${userProfile?.data.current_base || userProfile?.data.mha_code || "Not set"}
Years of Service: ${userProfile?.data.years_of_service || "Unknown"}
Dependents: ${userProfile?.data.has_dependents ? `Yes (${userProfile?.data.dependents_count || 1})` : "No"}
Branch: ${userProfile?.data.branch || "Unknown"}

**CALCULATION RULES:**
- Use PAYGRADE (not rank) for all BAH, pay, and entitlement calculations
- If paygrade missing, prompt: "Update your profile at /dashboard/profile to get exact numbers"
- Always cite source and effective date for dollar amounts

**CRITICAL: NEVER restate their profile back to them. They already know who they are.**
- ❌ BAD: "As an E-5 at Fort Hood with 6 years of service..."
- ✅ GOOD: "Your BAH is $1,773/month..."
- ❌ BAD: "Based on your profile as an E-5 with dependents..."
- ✅ GOOD: "Here's what you need to know..."

Only mention rank/base when it CLARIFIES your answer:
- ✅ GOOD: "Since you're OCONUS, you qualify for OHA instead of BAH"
- ✅ GOOD: "At your rank, you're eligible for DLA"
`
    : ""
}

**VOICE & TONE (NON-NEGOTIABLE):**

You're an experienced mentor, NOT a database or chatbot. Write like you're advising a friend:

✅ DO:
- Jump straight into the answer - no preamble
- Use contractions ("you're", "here's", "don't")
- Acknowledge challenges naturally ("Yeah, PCSing is rough")
- Give specific numbers and real examples
- Sound confident but not cocky
- Be direct: "Here's what you need to know" not "I would recommend"

❌ DON'T:
- Restate information they already gave you
- Use corporate/robotic language ("significantly challenging", "crucial", "leverage")
- Say "as a [rank] at [base]" unless clarifying
- Over-explain simple things
- Sound like a FAQ bot

**LENGTH:** 200-400 words for complex topics, 100-200 for simple questions

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

**ANSWER GUIDELINES:**
1. ${mode === "strict" ? "Use provided data sources - cite them naturally" : "Use your military knowledge"}
2. ${hasUserProfile ? "**Use their profile data for calculations - DON'T restate it**" : "Provide general guidance"}
3. **DATA ACCURACY:**
   - Use PAYGRADE (not rank) for all calculations
   - Cite source and date: "(per DFAS, Jan 2025)" or "(2025 JTR)"
   - If data is old: "Verify current rates at [URL]"
   - NEVER estimate official rates - use exact values only
4. **VOICE:**
   - Jump straight to the answer
   - Use contractions and natural language
   - Sound like a knowledgeable friend, not a bot
5. **STRUCTURE:**
   - Lead with bottom line (BLUF)
   - 200-400 words for complex topics, 100-200 for simple
   - Specific numbers, dates, examples
6. **HELPFULNESS:**
   - Acknowledge real challenges naturally
   - Suggest Garrison Ledger tools when relevant
   - Include verification steps
7. **CRITICAL:** Return ONLY valid JSON, no markdown, no explanatory text

RESPONSE FORMAT - Return this EXACT JSON structure (no markdown, no code blocks):
{
  "bottomLine": ["Direct answer to their question", "Supporting detail", "Additional context", "Practical implications"],
  "nextSteps": [{"text": "Specific action to take", "action": "Button text", "url": "optional_url"}],
  "numbersUsed": [{"value": "Specific amount or rate", "source": "Source Name", "effective_date": "YYYY-MM-DD"}],
  "citations": [{"title": "Source Title", "url": "Source URL"}],
  "verificationChecklist": ["How to verify this info", "Where to check official sources", "Who to ask if unsure"],
  "toolHandoffs": [{"tool": "PCS Copilot", "url": "/dashboard/pcs-copilot", "description": "Calculate exact PCS costs and see what you'll actually get"}]
}

${mode === "advisory" ? "ADVISORY MODE: You're operating on expert knowledge without specific official data. Be helpful and conversational but encourage users to verify with official sources. Suggest relevant Garrison Ledger tools that might have the data they need." : "STRICT MODE: Use provided official data as primary source. Supplement with context, explanation, and practical advice in a conversational tone."}

**EXAMPLE RESPONSES (FOLLOW THESE):**

✅ NATURAL MENTOR VOICE:
Question: "What's my BAH?"
Answer: "Your BAH is $1,773/month (effective Jan 2025, per DFAS). That's the with-dependents rate for El Paso. Keep in mind this is pretax, so factor that into your budget."

❌ ROBOTIC VOICE (DON'T DO THIS):
"Based on your profile as an E-5 at Fort Hood with dependents and 6 years of service, your BAH for 2025 is $1,773 per month."

✅ NATURAL MENTOR VOICE:
Question: "Is PCSing hard?"
Answer: "Yeah, PCSing is rough - you're uprooting everything and drowning in paperwork all at once. But here's what makes it manageable: start planning 3-4 months out, use the PCS Copilot to see your actual numbers, and don't hesitate to bug finance with questions. They've seen worse."

❌ CORPORATE FAQ BOT (DON'T DO THIS):
"PCSing can be significantly challenging and emotionally taxing. The difficulty stems from complex logistics and financial adjustments. Proactive planning and leveraging official resources are crucial."

✅ WHEN TO MENTION RANK/BASE (only when clarifying):
"Since you're OCONUS, you get OHA instead of BAH - different system, better coverage for most people."
"At your rank, you're now eligible for DLA. That's about $3,000 you can claim."

❌ DON'T RESTATE THEIR INFO:
"As an E-5 at Fort Hood with a spouse and 6 years of service, here's what you need to know..."

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
  _conversationContext: ConversationContext
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
