"use client";

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import AnimatedCard from "@/app/components/ui/AnimatedCard";

interface PCSHelpWidgetProps {
  claimContext: {
    rank?: string;
    branch?: string;
    hasDependents?: boolean;
    pcsType?: string;
    distance?: number;
    currentSection?: string;
  };
  onAskQuestion: (question: string) => void;
}

interface QuickQuestion {
  id: string;
  question: string;
  category: string;
  icon: string;
}

const quickQuestions: QuickQuestion[] = [
  {
    id: "dla-amount",
    question: "What's my DLA for {rank} with {dependents}?",
    category: "DLA",
    icon: "DollarSign",
  },
  {
    id: "tle-days",
    question: "How many TLE days can I claim?",
    category: "TLE",
    icon: "Home",
  },
  {
    id: "lodging-reimbursable",
    question: "What's reimbursable for lodging?",
    category: "TLE",
    icon: "Bed",
  },
  {
    id: "per-diem-receipts",
    question: "Do I need receipts for per diem?",
    category: "Per Diem",
    icon: "Receipt",
  },
  {
    id: "malt-calculation",
    question: "How is MALT calculated?",
    category: "MALT",
    icon: "Truck",
  },
  {
    id: "weight-allowance",
    question: "What's my weight allowance?",
    category: "PPM",
    icon: "Package",
  },
  {
    id: "maximize-reimbursement",
    question: "How do I maximize my reimbursement?",
    category: "General",
    icon: "TrendingUp",
  },
  {
    id: "common-mistakes",
    question: "What are common PCS claim mistakes?",
    category: "General",
    icon: "AlertTriangle",
  },
];

export default function PCSHelpWidget({ claimContext, onAskQuestion }: PCSHelpWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);

  // Load recent questions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pcs-recent-questions");
    if (saved) {
      setRecentQuestions(JSON.parse(saved));
    }
  }, []);

  const handleQuickQuestion = async (question: QuickQuestion) => {
    setIsAsking(true);

    // Replace placeholders with actual values
    let processedQuestion = question.question;
    if (claimContext.rank) {
      processedQuestion = processedQuestion.replace("{rank}", claimContext.rank);
    }
    if (claimContext.hasDependents !== undefined) {
      processedQuestion = processedQuestion.replace(
        "{dependents}",
        claimContext.hasDependents ? "family" : "no dependents"
      );
    }

    try {
      await onAskQuestion(processedQuestion);

      // Add to recent questions
      const updated = [
        processedQuestion,
        ...recentQuestions.filter((q) => q !== processedQuestion),
      ].slice(0, 5);
      setRecentQuestions(updated);
      localStorage.setItem("pcs-recent-questions", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to ask question:", error);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    try {
      await onAskQuestion(customQuestion);

      // Add to recent questions
      const updated = [
        customQuestion,
        ...recentQuestions.filter((q) => q !== customQuestion),
      ].slice(0, 5);
      setRecentQuestions(updated);
      localStorage.setItem("pcs-recent-questions", JSON.stringify(updated));

      setCustomQuestion("");
    } catch (error) {
      console.error("Failed to ask question:", error);
    } finally {
      setIsAsking(false);
    }
  };

  const getContextualQuestions = () => {
    if (!claimContext.currentSection) return quickQuestions;

    // Filter questions based on current section
    const sectionMap: Record<string, string[]> = {
      basic: ["DLA", "General"],
      travel: ["MALT", "Per Diem", "General"],
      lodging: ["TLE"],
      costs: ["MALT", "Per Diem"],
      weight: ["PPM", "General"],
    };

    const relevantCategories = sectionMap[claimContext.currentSection] || [];
    return quickQuestions.filter((q) => relevantCategories.includes(q.category));
  };

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
        >
          <Icon name="MessageCircle" className="h-5 w-5" />
          <span className="font-semibold">PCS Questions?</span>
        </button>
      </div>

      {/* Expanded Help Panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Icon name="MessageCircle" className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">PCS Help Center</h3>
                  <p className="text-sm text-slate-600">
                    Get instant answers to your PCS questions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {/* Context Info */}
              {claimContext.rank && (
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon name="User" className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Your Context</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    {claimContext.rank} {claimContext.branch} •{" "}
                    {claimContext.hasDependents ? "With dependents" : "No dependents"}
                    {claimContext.distance && ` • ${claimContext.distance} miles`}
                  </div>
                </div>
              )}

              {/* Recent Questions */}
              {recentQuestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Recent Questions</h4>
                  <div className="space-y-2">
                    {recentQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleQuickQuestion({
                            id: `recent-${index}`,
                            question,
                            category: "Recent",
                            icon: "Clock",
                          })
                        }
                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="flex items-center gap-2">
                          <Icon name="Clock" className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-slate-700">{question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Questions */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Quick Questions</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {getContextualQuestions().map((question) => (
                    <button
                      key={question.id}
                      onClick={() => handleQuickQuestion(question)}
                      disabled={isAsking}
                      className="rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Icon name={question.icon as any} className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">
                          {question.category}
                        </span>
                      </div>
                      <p className="text-left text-sm text-slate-700">{question.question}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Question */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Ask Custom Question</h4>
                <div className="space-y-3">
                  <textarea
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Ask anything about your PCS claim..."
                    className="h-20 w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    disabled={isAsking}
                  />
                  <button
                    onClick={handleCustomQuestion}
                    disabled={!customQuestion.trim() || isAsking}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAsking ? "Asking..." : "Ask Question"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Powered by Ask Assistant</span>
                <button
                  onClick={() => window.open("/dashboard/ask", "_blank")}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Open Full Assistant →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
