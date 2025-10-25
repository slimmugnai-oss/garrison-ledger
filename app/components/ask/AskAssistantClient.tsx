"use client";

/**
 * ASK OUR MILITARY EXPERT - Client Component Wrapper
 *
 * Compact layout with sticky answer and mobile drawer
 * Manages state between QuestionComposer and AnswerDisplay
 */

import { useState, useCallback, useRef, useEffect } from "react";

import Icon from "@/app/components/ui/Icon";

import AnswerDisplay from "./AnswerDisplay";
import CreditMeter from "./CreditMeter";
import QuestionComposer from "./QuestionComposer";
import QuestionHistory from "./QuestionHistory";
import TemplateQuestions from "./TemplateQuestions";

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

export default function AskAssistantClient() {
  const [answer, setAnswer] = useState<AnswerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(false);

  const creditMeterRef = useRef<{ refresh: () => Promise<void> }>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleQuestionSubmit = useCallback(
    async (question: string, templateId?: string) => {
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

          // Auto-scroll to answer on desktop, activate drawer on mobile
          setTimeout(() => {
            if (isMobile) {
              answerRef.current?.classList.add("active");
            } else {
              answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
        } else {
          setError("Received invalid response from server. Please try again.");
        }
      } catch (err) {
        console.error("Question submit error:", err);
        setError("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isMobile]
  );

  const handleTemplateClick = useCallback((text: string, id: string) => {
    setCurrentQuestion(text);
    setCurrentTemplateId(id);
  }, []);

  const handleToolHandoff = useCallback((tool: string, url: string) => {
    window.location.href = url;
  }, []);

  return (
    <>
      {/* Success Toast */}
      {showSuccess && (
        <div className="animate-in slide-in-from-bottom-2 fade-in fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg duration-200">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-5 w-5" />
            <div>
              <p className="font-medium">Expert answer generated successfully!</p>
              {creditsRemaining !== null && (
                <p className="text-xs text-green-100">{creditsRemaining} questions remaining</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credit Meter - Compact */}
      <div className="mb-4">
        <CreditMeter ref={creditMeterRef} compact />
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

      {/* Single Column Compact Layout */}
      <div className="space-y-6">
        {/* Compact Composer */}
        <div className="rounded-lg border-2 border-blue-600 bg-white p-4 shadow-sm">
          <QuestionComposer
            onQuestionSubmit={handleQuestionSubmit}
            isLoading={isLoading}
            maxLength={500}
            initialQuestion={currentQuestion}
            initialTemplateId={currentTemplateId}
            compact
          />

          {/* Templates Dropdown Below Input */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <TemplateQuestions onTemplateClick={handleTemplateClick} mode="dropdown" />
          </div>
        </div>

        {/* Answer Section - Sticky on desktop, drawer on mobile */}
        {answer || isLoading ? (
          <div
            ref={answerRef}
            className={`rounded-lg border border-gray-200 bg-white p-6 ${isMobile ? "fixed bottom-0 left-0 right-0 z-40 max-h-[80vh] translate-y-full overflow-y-auto transition-transform duration-300 ease-out" : ""} ${!isMobile ? "sticky top-24" : ""} `}
          >
            {/* Mobile: Swipe Handle */}
            {isMobile && answer && (
              <div className="mb-4 flex justify-center">
                <div className="h-1 w-12 rounded-full bg-gray-300"></div>
              </div>
            )}

            <h2 className="mb-4 text-xl font-semibold text-gray-900">Expert Answer</h2>

            <AnswerDisplay
              answer={answer || undefined}
              isLoading={isLoading}
              onToolHandoff={handleToolHandoff}
              sticky={!isMobile}
            />
          </div>
        ) : (
          /* Empty State with Starter Questions */
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Icon name="MessageCircle" className="mx-auto mb-4 h-16 w-16 text-indigo-600" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">What's your first question?</h3>
            <p className="mb-6 text-gray-600">
              Our Military Expert can answer questions about financial topics, PCS moves,
              deployment, career progression, benefits, base life, and more.
            </p>

            {/* Popular starter questions */}
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() =>
                  handleQuestionSubmit("What's my BAH as an E-5 at Fort Hood with dependents?")
                }
                className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                💰 "What's my BAH as an E-5 at Fort Hood with dependents?"
              </button>
              <button
                onClick={() => handleQuestionSubmit("How do I maximize DITY move profit?")}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                🚚 "How do I maximize DITY move profit?"
              </button>
              <button
                onClick={() => handleQuestionSubmit("How does the Savings Deposit Program work?")}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                🎖️ "How does the Savings Deposit Program work?"
              </button>
              <button
                onClick={() => handleQuestionSubmit("Should I take the SRB or invest in TSP?")}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                💼 "Should I take the SRB or invest in TSP?"
              </button>
            </div>
          </div>
        )}

        {/* Question History - Collapsed by Default */}
        <QuestionHistory collapsed />
      </div>
    </>
  );
}
