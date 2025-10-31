/**
 * ASK CONVERSATION PDF EXPORT ENDPOINT
 *
 * GET /api/ask/export-pdf?conversationId=xxx
 * Exports conversation as downloadable PDF with citations and recommendations
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { generateConversationPDF } from "@/lib/ask/pdf-generator";
import type { ConversationExportData } from "@/lib/ask/pdf-generator";
import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return errorResponse(Errors.unauthorized());
    }

    // Get conversation ID from query params
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return errorResponse(Errors.invalidInput("conversationId required"));
    }

    logger.info(`[PDF Export] Fetching conversation ${conversationId} for user ${userId.substring(0, 8)}...`);

    // Fetch conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("ask_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (convError || !conversation) {
      return errorResponse(Errors.notFound("Conversation not found"));
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from("ask_conversation_messages")
      .select("question, answer, sources_used, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError || !messages || messages.length === 0) {
      return errorResponse(Errors.notFound("No messages found in conversation"));
    }

    // Fetch user profile (for PDF header)
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("paygrade, branch, time_in_service_months")
      .eq("user_id", userId)
      .single();

    // Build export data
    const exportData: ConversationExportData = {
      conversationId: conversation.id,
      sessionId: conversation.session_id,
      startedAt: conversation.started_at,
      topic: conversation.conversation_topic,
      messages: messages.map((msg) => ({
        question: msg.question,
        answer: msg.answer,
        timestamp: msg.created_at,
        sources: msg.sources_used,
      })),
      userProfile: profile
        ? {
            rank: profile.paygrade,
            branch: profile.branch,
            years_of_service: profile.time_in_service_months
              ? Math.floor(profile.time_in_service_months / 12)
              : undefined,
          }
        : undefined,
    };

    // Generate PDF
    const result = await generateConversationPDF(exportData);

    logger.info(`[PDF Export] PDF generated successfully`, {
      fileName: result.fileName,
      pageCount: result.pageCount,
    });

    // Return PDF as downloadable file
    // Convert Buffer to Uint8Array for Response body
    const uint8Array = new Uint8Array(result.pdfBuffer);
    
    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Length": result.pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    logger.error("[PDF Export] Export failed:", error);
    return NextResponse.json(
      { error: "PDF export failed" },
      { status: 500 }
    );
  }
}

