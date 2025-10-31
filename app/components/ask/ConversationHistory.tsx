"use client";

/**
 * CONVERSATION HISTORY & MULTI-TURN INDICATORS FOR ASK MILITARY EXPERT
 *
 * Displays:
 * - Previous questions and answers in the conversation
 * - Suggested follow-up questions chips
 * - Proactive insight cards
 */

import { MessageCircle, Lightbulb, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ProactiveInsight {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
}

interface ConversationHistoryProps {
  messages: Message[];
  suggestedFollowups?: string[];
  proactiveInsights?: ProactiveInsight[];
  onFollowupClick?: (question: string) => void;
}

export default function ConversationHistory({
  messages,
  suggestedFollowups = [],
  proactiveInsights = [],
  onFollowupClick,
}: ConversationHistoryProps) {
  const [expanded, setExpanded] = useState(true);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Conversation History Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
      >
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 text-slate-600 mr-2" />
          <span className="font-semibold text-slate-800">
            Conversation History ({messages.length} messages)
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-slate-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-600" />
        )}
      </button>

      {/* Messages */}
      {expanded && (
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${
                message.role === "user"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {message.role === "user" ? "You asked" : "AI Expert answered"}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Follow-ups */}
      {suggestedFollowups.length > 0 && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center mb-3">
            <ArrowRight className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-semibold text-slate-800">Suggested Follow-ups</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedFollowups.map((question, index) => (
              <button
                key={index}
                onClick={() => onFollowupClick?.(question)}
                className="px-4 py-2 bg-white hover:bg-blue-100 border border-blue-300 rounded-full text-sm text-slate-700 hover:text-blue-700 transition-colors font-medium"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Proactive Insights */}
      {proactiveInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-amber-600 mr-2" />
            <span className="font-semibold text-slate-800">Proactive Insights</span>
          </div>
          {proactiveInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                insight.priority === "high"
                  ? "bg-amber-50 border-amber-300"
                  : insight.priority === "medium"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {insight.category}
                </span>
                {insight.priority === "high" && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold">
                    High Priority
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{insight.title}</h4>
              <p className="text-sm text-slate-600">{insight.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

