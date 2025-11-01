/**
 * ASK ASSISTANT - Question History
 *
 * Returns user's past questions and answers
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's recent conversations with messages
    const { data: conversations, error: convError } = await supabase
      .from("ask_conversations")
      .select("id, session_id, started_at, conversation_topic")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("last_activity_at", { ascending: false })
      .limit(10);

    if (convError) {
      console.error("Failed to fetch conversations:", convError);
    }

    // Fetch messages for these conversations
    const conversationsWithMessages = [];
    
    if (conversations && conversations.length > 0) {
      for (const conv of conversations) {
        const { data: messages } = await supabase
          .from("ask_conversation_messages")
          .select("id, message_type, content, created_at")
          .eq("conversation_id", conv.id)
          .order("message_order", { ascending: true })
          .limit(20);

        conversationsWithMessages.push({
          ...conv,
          messages: messages || [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      conversations: conversationsWithMessages,
      total: conversationsWithMessages.length,
    });
  } catch (error) {
    console.error("Question history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

