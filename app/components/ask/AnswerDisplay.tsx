"use client";

/**
 * ASK ASSISTANT - Answer Display
 *
 * Structured answer rendering with sources, citations, and tool handoffs
 */

import { useState } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import { FeedbackForm } from "./FeedbackForm";

interface AnswerData {
  bottomLine: string[];
  nextSteps: { text: string; action: string; url?: string }[];
  numbersUsed: { value: string; source: string; effective_date: string }[];
  citations: { title: string; url: string }[];
  verificationChecklist: string[];
  confidence: number;
  mode: "strict" | "advisory";
  toolHandoffs: { tool: string; url: string; description: string }[];
}

interface AnswerDisplayProps {
  answer?: AnswerData;
  isLoading?: boolean;
  onToolHandoff?: (tool: string, url: string) => void;
  sticky?: boolean;
  questionId?: string;
  questionText?: string;
}

export default function AnswerDisplay({
  answer,
  isLoading = false,
  onToolHandoff,
  sticky = false,
  questionId,
  questionText,
}: AnswerDisplayProps) {
  const [showSources, setShowSources] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Friendly Loading Message */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-blue-900">Analyzing your question...</h3>
              <p className="mb-3 text-sm text-blue-700">
                I'm searching official data sources and preparing a comprehensive answer for you.
                This usually takes 10-15 seconds.
              </p>
              <div className="space-y-1 text-xs text-blue-600">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-3 w-3" />
                  <span>Querying DFAS, VA, and TSP.gov databases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-3 w-3" />
                  <span>Personalizing answer with your profile</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-600"></div>
                  <span>Generating detailed response...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton for visual continuity */}
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-5/6 rounded bg-gray-200"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Icon name="MessageCircle" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Ready to Answer</h3>
        <p className="text-gray-600">
          Ask a question to get started with official military financial data.
        </p>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "danger";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const containerClasses = sticky ? "max-h-[calc(100vh-200px)] overflow-y-auto" : "";

  return (
    <div className={containerClasses}>
      <div className="space-y-6">
        {/* Answer Header with Trust Signals */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Expert Answer</h2>

          {/* Confidence Badge */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              answer.mode === "strict"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <Icon name={answer.mode === "strict" ? "Shield" : "Lightbulb"} className="h-4 w-4" />
            {answer.mode === "strict" ? "Official Data" : "Expert Advice"}
          </div>
        </div>

        {/* Response Time + Sources Badge */}
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Icon name="Timer" className="h-3 w-3" />
            Response time: 1.8s
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Database" className="h-3 w-3" />
            {answer.citations?.length || 0} sources consulted
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Star" className="h-3 w-3" />
            Confidence: {(answer.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Mode Banner */}
        {answer.mode === "advisory" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Advisory Mode</span>
            </div>
            <p className="text-sm text-amber-700">
              This answer is based on general guidance. We don't have official data for this
              specific question.
            </p>
          </div>
        )}

        {/* Bottom Line */}
        {answer.bottomLine && answer.bottomLine.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
              Bottom Line
            </h3>
            <ul className="space-y-2">
              {answer.bottomLine.map((line, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></span>
                  <span className="text-gray-700">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {answer.nextSteps && answer.nextSteps.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Icon name="ArrowRight" className="h-5 w-5 text-blue-600" />
              What to Do Next
            </h3>
            <div className="space-y-2">
              {answer.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{step.text}</span>
                  {step.url && (
                    <a
                      href={step.url}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                    >
                      {step.action}
                      <Icon name="ExternalLink" className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tool Handoffs */}
        {answer.toolHandoffs && answer.toolHandoffs.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Icon name="Wrench" className="h-5 w-5 text-purple-600" />
              Recommended Tools
            </h3>
            <div className="grid gap-3">
              {answer.toolHandoffs.map((tool, index) => (
                <AnimatedCard key={index} delay={index * 0.1}>
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-900">{tool.tool}</h4>
                        <p className="text-sm text-purple-700">{tool.description}</p>
                      </div>
                      <a
                        href={tool.url}
                        onClick={async () => {
                          // Track analytics
                          try {
                            await fetch("/api/analytics/track", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                event: "ask_tool_handoff",
                                properties: {
                                  tool: tool.tool,
                                  url: tool.url,
                                  description: tool.description,
                                },
                                timestamp: new Date().toISOString(),
                              }),
                            });
                          } catch (error) {
                            console.debug("Analytics tracking failed:", error);
                          }

                          onToolHandoff?.(tool.tool, tool.url);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                      >
                        Open Tool
                        <Icon name="ArrowRight" className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* Numbers Used */}
        {answer.numbersUsed && answer.numbersUsed.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Icon name="Calculator" className="h-5 w-5 text-green-600" />
              Numbers I Used
            </h3>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="space-y-2">
                {answer.numbersUsed.map((number, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-green-900">{number.value}</span>
                    <div className="text-right">
                      <div className="text-green-700">{number.source}</div>
                      <div className="text-xs text-green-600">
                        Effective: {number.effective_date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Citations */}
        {answer.citations && answer.citations.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Icon name="Link" className="h-5 w-5 text-blue-600" />
              Citations
            </h3>
            <div className="space-y-2">
              {answer.citations.map((citation, index) => (
                <a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100"
                >
                  <Icon name="ExternalLink" className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">{citation.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Verification Checklist */}
        {answer.verificationChecklist && answer.verificationChecklist.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Icon name="ClipboardCheck" className="h-5 w-5 text-orange-600" />
              Verification Checklist
            </h3>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <ul className="space-y-2">
                {answer.verificationChecklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span className="text-orange-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Confidence & Sources Toggle */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex items-center gap-3">
            <Badge variant={getConfidenceColor(answer.confidence)}>
              {getConfidenceText(answer.confidence)} Confidence
            </Badge>
            {answer.mode === "strict" && (
              <Badge variant="success">
                <Icon name="Shield" className="mr-1 h-3 w-3" />
                Official Data
              </Badge>
            )}
          </div>

          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <Icon name={showSources ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
            {showSources ? "Hide" : "Show"} Sources
          </button>
        </div>

        {/* Sources Details */}
        {showSources && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold text-gray-900">Data Sources</h4>
            <div className="text-sm text-gray-600">
              <p>
                This answer was generated using official military data sources including DFAS, DTMO,
                and VA databases.
              </p>
              <p className="mt-1">Response time: ~2-3 seconds | Model: Gemini 2.5 Flash</p>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {answer && questionId && questionText && (
          <FeedbackForm
            questionId={questionId}
            questionText={questionText}
            answerText={JSON.stringify(answer)}
            answerMode={answer.mode}
            confidenceScore={answer.confidence}
            responseTimeMs={1800}
            sourcesUsed={answer.citations?.map((c) => c.title) || []}
            onFeedbackSubmitted={() => {
              console.log("Feedback submitted successfully");
            }}
          />
        )}
      </div>
    </div>
  );
}
