"use client";

/**
 * ASK ASSISTANT - Question History
 *
 * Displays user's past questions and answers with search/filter capabilities
 */

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import AnimatedCard from "@/app/components/ui/AnimatedCard";

interface HistoricalQuestion {
  id: string;
  question: string;
  answer: {
    bottomLine: string[];
    nextSteps: { text: string; action: string; url?: string }[];
    numbersUsed: { value: string; source: string; effective_date: string }[];
    citations: { title: string; url: string }[];
    verificationChecklist: string[];
    confidence: number;
    mode: "strict" | "advisory";
    toolHandoffs: { tool: string; url: string; description: string }[];
  };
  mode: string;
  confidence_score: number;
  created_at: string;
  template_id?: string;
}

interface QuestionHistoryProps {
  onViewAnswer?: (answer: unknown) => void;
}

export default function QuestionHistory({ onViewAnswer }: QuestionHistoryProps) {
  const [questions, setQuestions] = useState<HistoricalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<"all" | "strict" | "advisory">("all");

  useEffect(() => {
    if (isExpanded) {
      fetchHistory();
    }
  }, [isExpanded]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/ask/history");
      const result = await response.json();

      if (result.success) {
        setQuestions(result.questions);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions =
    filter === "all" ? questions : questions.filter((q) => q.mode === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: "success" as const, text: "High" };
    if (confidence >= 0.6) return { variant: "warning" as const, text: "Med" };
    return { variant: "danger" as const, text: "Low" };
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="ClipboardList" className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Question History</h2>
          {questions.length > 0 && (
            <Badge variant="info">{questions.length} total</Badge>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? "Hide" : "Show"} History
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1 text-sm ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter("strict")}
              className={`rounded-lg px-3 py-1 text-sm ${
                filter === "strict"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Official Data ({questions.filter((q) => q.mode === "strict").length})
            </button>
            <button
              onClick={() => setFilter("advisory")}
              className={`rounded-lg px-3 py-1 text-sm ${
                filter === "advisory"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Advisory ({questions.filter((q) => q.mode === "advisory").length})
            </button>
          </div>

          {/* History List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100"></div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-12 text-center">
              <Icon name="MessageCircle" className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-600">
                {filter === "all"
                  ? "No questions asked yet. Ask your first question above!"
                  : `No ${filter} mode questions found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, index) => (
                <AnimatedCard key={q.id} delay={index * 0.05}>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{q.question}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(q.created_at)}</span>
                          <span>•</span>
                          <Badge
                            variant={getConfidenceBadge(q.confidence_score).variant}
                            className="text-xs"
                          >
                            {getConfidenceBadge(q.confidence_score).text} Confidence
                          </Badge>
                          {q.mode === "strict" && (
                            <>
                              <span>•</span>
                              <Badge variant="success" className="text-xs">
                                <Icon name="Shield" className="mr-1 inline h-3 w-3" />
                                Official
                              </Badge>
                            </>
                          )}
                          {q.template_id && (
                            <>
                              <span>•</span>
                              <Badge variant="info" className="text-xs">
                                Template
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewAnswer?.(q.answer)}
                        className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        View Answer
                      </button>
                    </div>

                    {/* Quick Preview */}
                    {q.answer?.bottomLine && q.answer.bottomLine.length > 0 && (
                      <div className="mt-2 rounded border border-gray-200 bg-white p-2">
                        <p className="text-xs text-gray-600">
                          {q.answer.bottomLine[0].substring(0, 150)}
                          {q.answer.bottomLine[0].length > 150 ? "..." : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}

          {/* Load More (if needed) */}
          {filteredQuestions.length > 0 && filteredQuestions.length >= 10 && (
            <div className="text-center">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

