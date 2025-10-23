"use client";

/**
 * ASK ASSISTANT - Client Component Wrapper
 *
 * Manages state between QuestionComposer and AnswerDisplay
 * Handles the full question submission lifecycle
 */

import { useState, useCallback, useRef } from "react";
import QuestionComposer from "./QuestionComposer";
import AnswerDisplay from "./AnswerDisplay";
import CreditMeter from "./CreditMeter";
import TemplateQuestions from "./TemplateQuestions";
import Icon from "@/app/components/ui/Icon";

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

interface QuestionComposerRef {
  fillQuestion: (text: string, id: string) => void;
}

export default function AskAssistantClient() {
  const [answer, setAnswer] = useState<AnswerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>();
  const creditMeterRef = useRef<{ refresh: () => Promise<void> }>(null);

  const handleQuestionSubmit = useCallback(async (question: string, templateId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Track analytics
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "ask_submit",
            properties: {
              question_length: question.length,
              template_id: templateId,
              has_template: !!templateId,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (analyticsError) {
        console.debug("Analytics tracking failed:", analyticsError);
      }

      // Submit question
      const response = await fetch("/api/ask/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          templateId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 402) {
          setError(
            `Out of credits! You have ${result.credits_remaining || 0} questions remaining. ${result.tier === "free" ? "Upgrade to Premium for 50 questions/month." : "Purchase more credits to continue."}`
          );
          setCreditsRemaining(result.credits_remaining || 0);
          return;
        }

        if (response.status === 401) {
          setError("Please sign in to ask questions.");
          return;
        }

        setError(result.error || "Failed to submit question. Please try again.");
        return;
      }

        if (result.success && result.answer) {
          setAnswer(result.answer);
          setCreditsRemaining(result.credits_remaining);
          
          // Show success notification
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);

          // Refresh credit meter
          if (creditMeterRef.current?.refresh) {
            await creditMeterRef.current.refresh();
          }
        } else {
          setError("Received invalid response from server. Please try again.");
        }
    } catch (err) {
      console.error("Question submit error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTemplateClick = useCallback((text: string, id: string) => {
    // Fill the question composer with template text
    setCurrentQuestion(text);
    setCurrentTemplateId(id);
  }, []);

  const handleToolHandoff = useCallback((tool: string, url: string) => {
    // Navigate to the tool
    window.location.href = url;
  }, []);

  return (
    <>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg duration-200">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5" />
            <div>
              <p className="font-medium">Answer generated successfully!</p>
              {creditsRemaining !== null && (
                <p className="text-xs text-green-100">{creditsRemaining} questions remaining</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credit Meter */}
      <div className="mb-6">
        <CreditMeter ref={creditMeterRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Column - Question Composer (40%) */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Ask Your Question</h2>

            {/* Template Questions */}
            <div className="mb-6">
              <TemplateQuestions onTemplateClick={handleTemplateClick} />
            </div>

            {/* Question Composer */}
            <QuestionComposer
              onQuestionSubmit={handleQuestionSubmit}
              isLoading={isLoading}
              maxLength={500}
              initialQuestion={currentQuestion}
              initialTemplateId={currentTemplateId}
            />
          </div>
        </div>

        {/* Right Column - Answer Pane (60%) */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Answer</h2>

            {/* Answer Display */}
            <AnswerDisplay
              answer={answer || undefined}
              isLoading={isLoading}
              onToolHandoff={handleToolHandoff}
            />
          </div>
        </div>
      </div>
    </>
  );
}
