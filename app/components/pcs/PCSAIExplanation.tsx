"use client";

import { useState } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface RetrievedChunk {
  id: string;
  content_id: string;
  content_type: string;
  content_text: string;
  metadata: Record<string, unknown>;
  similarity: number;
  retrieval_method: "vector" | "keyword" | "hybrid";
}

interface AIExplanation {
  explanation: string;
  sources: RetrievedChunk[];
  confidence: number;
  suggestions: string[];
  jtr_citations: string[];
}

interface PCSAIExplanationProps {
  ruleCode: string;
  ruleTitle: string;
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  userContext?: {
    rank?: string;
    branch?: string;
    hasDependents?: boolean;
    pcsType?: string;
  };
  onExplanationGenerated?: (explanation: AIExplanation) => void;
}

export default function PCSAIExplanation({
  ruleCode,
  ruleTitle,
  category,
  severity,
  message,
  userContext,
  onExplanationGenerated,
}: PCSAIExplanationProps) {
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pcs/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "validation",
          data: {
            rule_code: ruleCode,
            rule_title: ruleTitle,
            category,
            severity,
            message,
            user_context: userContext,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate explanation");
      }

      const data = await response.json();
      setExplanation(data.explanation);

      if (onExplanationGenerated) {
        onExplanationGenerated(data.explanation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate explanation");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return "XCircle";
      case "warning":
        return "AlertTriangle";
      case "info":
        return "Info";
      default:
        return "CheckCircle";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${getSeverityColor(severity)}`}>
            <Icon name={getSeverityIcon(severity)} className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Explanation</h3>
            <p className="text-sm text-slate-600">
              {ruleTitle} ({ruleCode})
            </p>
          </div>
        </div>

        {!explanation && (
          <button
            onClick={generateExplanation}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Icon name={isLoading ? "Loader" : "Brain"} className="h-4 w-4" />
            {isLoading ? "Generating..." : "Explain"}
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <Icon name="XCircle" className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={generateExplanation}
            className="mt-2 text-sm text-red-600 underline hover:text-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Explanation Content */}
      {explanation && (
        <div className="space-y-4">
          {/* Main Explanation */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="Brain" className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">AI Explanation</span>
              <Badge
                variant={
                  getConfidenceLabel(explanation.confidence) === "High" ? "success" : "warning"
                }
              >
                {getConfidenceLabel(explanation.confidence)} Confidence
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: explanation.explanation.replace(/\n/g, "<br>") }}
              />
            </div>
          </div>

          {/* Suggestions */}
          {explanation.suggestions.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="Lightbulb" className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Suggestions</span>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                {explanation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* JTR Citations */}
          {explanation.jtr_citations.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="File" className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">JTR Citations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {explanation.jtr_citations.map((citation, index) => (
                  <Badge key={index} variant="info" size="sm">
                    {citation}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {explanation.sources.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="BookOpen" className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Sources</span>
                <Badge variant="neutral" size="sm">
                  {explanation.sources.length} found
                </Badge>
              </div>
              <div className="space-y-2">
                {explanation.sources.map((source, index) => (
                  <div key={index} className="rounded border border-slate-200 bg-white p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">
                        {source.content_type}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {Math.round(source.similarity * 100)}% match
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-600">
                      {source.content_text.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate Button */}
          <div className="flex justify-end">
            <button
              onClick={generateExplanation}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="RefreshCw" className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
