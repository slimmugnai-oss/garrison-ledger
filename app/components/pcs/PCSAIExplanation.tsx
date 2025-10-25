"use client";

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import AnimatedCard from "@/app/components/ui/AnimatedCard";

interface ValidationFlag {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggested_fix?: string;
  jtr_citation?: string;
  category: string;
}

interface PCSAIExplanationProps {
  validationFlag: ValidationFlag;
  claimContext: {
    rank?: string;
    branch?: string;
    hasDependents?: boolean;
    pcsType?: string;
  };
}

export default function PCSAIExplanation({ validationFlag, claimContext }: PCSAIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getAIExplanation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pcs/ai-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validationFlag,
          claimContext,
        }),
      });

      const { explanation } = await response.json();
      setExplanation(explanation);
    } catch (error) {
      console.error("Failed to get AI explanation:", error);
      setExplanation("Sorry, I could not generate an explanation at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = () => {
    switch (validationFlag.severity) {
      case "error":
        return "AlertTriangle";
      case "warning":
        return "AlertCircle";
      case "info":
        return "Info";
      default:
        return "AlertCircle";
    }
  };

  const getSeverityColor = () => {
    switch (validationFlag.severity) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${getSeverityColor()}`}>
      <div className="flex items-start gap-3">
        <Icon name={getSeverityIcon()} className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{validationFlag.message}</p>
              {validationFlag.suggested_fix && (
                <p className="mt-1 text-sm text-gray-600">💡 {validationFlag.suggested_fix}</p>
              )}
              {validationFlag.jtr_citation && (
                <p className="mt-1 text-xs text-gray-500">
                  Citation: {validationFlag.jtr_citation}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (!explanation && !isLoading) {
                  getAIExplanation();
                }
              }}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Icon name="MessageCircle" className="h-4 w-4" />
              {isExpanded ? "Hide" : "AI"} Explanation
            </button>
          </div>

          {/* AI Explanation */}
          {isExpanded && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span>Getting AI explanation...</span>
                </div>
              ) : explanation ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Sparkles" className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI Explanation</span>
                  </div>
                  <div className="text-sm leading-relaxed text-gray-700">{explanation}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={getAIExplanation}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => window.open("/dashboard/ask", "_blank")}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Ask Follow-up →
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={getAIExplanation}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Icon name="MessageCircle" className="h-4 w-4" />
                  Get AI Explanation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * AI Explanation Generator Component
 * Shows AI-powered explanations for validation flags
 */
export function PCSValidationExplainer({
  flags,
  claimContext,
}: {
  flags: ValidationFlag[];
  claimContext: any;
}) {
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  const toggleFlag = (flagId: string) => {
    const newExpanded = new Set(expandedFlags);
    if (newExpanded.has(flagId)) {
      newExpanded.delete(flagId);
    } else {
      newExpanded.add(flagId);
    }
    setExpandedFlags(newExpanded);
  };

  if (flags.length === 0) {
    return (
      <AnimatedCard className="border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">No validation issues found</span>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Validation Issues ({flags.length})</h3>
        <button
          onClick={() => setExpandedFlags(new Set(flags.map((_, i) => i.toString())))}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Expand All
        </button>
      </div>

      {flags.map((flag, index) => (
        <PCSAIExplanation key={index} validationFlag={flag} claimContext={claimContext} />
      ))}

      {/* Summary Actions */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="Lightbulb" className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Need Help?</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open("/dashboard/ask", "_blank")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            <Icon name="MessageCircle" className="h-4 w-4" />
            Ask Military Expert
          </button>
          <button
            onClick={() => window.open("/docs/jtr-guide", "_blank")}
            className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Icon name="BookOpen" className="h-4 w-4" />
            JTR Guide
          </button>
        </div>
      </div>
    </div>
  );
}
