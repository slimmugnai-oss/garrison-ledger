"use client";

/**
 * CONVERSATION HISTORY WRAPPER
 * 
 * Fetches and displays user's conversation history from database
 */

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ConversationHistory from "./ConversationHistory";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ConversationHistoryWrapper() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/ask/history");
        const data = await response.json();

        if (data.success && data.conversations) {
          // Flatten all messages from all conversations
          const allMessages: Message[] = [];
          
          for (const conv of data.conversations) {
            if (conv.messages && Array.isArray(conv.messages)) {
              allMessages.push(...conv.messages.map((msg: any) => ({
                id: msg.id || String(Math.random()),
                role: msg.message_type === "question" ? "user" : "assistant",
                content: msg.content || "",
                timestamp: new Date(msg.created_at || Date.now()),
              })));
            }
          }

          // Sort by most recent first
          allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          setMessages(allMessages);
        }
      } catch (error) {
        console.error("Failed to fetch conversation history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-2">No conversation history yet</p>
        <p className="text-sm text-slate-500">
          Start asking questions to build your history
        </p>
      </div>
    );
  }

  return <ConversationHistory messages={messages} />;
}

