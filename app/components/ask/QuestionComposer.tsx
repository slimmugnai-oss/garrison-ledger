"use client";

/**
 * ASK ASSISTANT - Question Composer
 *
 * Textarea for question input with character limit and submit functionality
 */

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";

interface QuestionComposerProps {
  onQuestionSubmit?: (question: string, templateId?: string) => void;
  isLoading?: boolean;
  maxLength?: number;
  initialQuestion?: string;
  initialTemplateId?: string;
  compact?: boolean;
}

export default function QuestionComposer({
  onQuestionSubmit,
  isLoading = false,
  maxLength = 500,
  initialQuestion = "",
  initialTemplateId,
  compact = false,
}: QuestionComposerProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);

  // Update question when initialQuestion changes (from template click)
  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  // Update templateId when initialTemplateId changes
  useEffect(() => {
    if (initialTemplateId) {
      setTemplateId(initialTemplateId);
    }
  }, [initialTemplateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    // Delegate to parent for full API handling
    await onQuestionSubmit?.(question.trim(), templateId);

    // Clear form on successful submit
    setQuestion("");
    setTemplateId(undefined);
  };

  // Compact mode for new layout
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a military financial question..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          maxLength={maxLength}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoading ? (
            <Icon name="Loader" className="h-5 w-5 animate-spin" />
          ) : (
            "Ask"
          )}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {/* Question Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="mb-2 block text-sm font-medium text-gray-700">
            Your Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about BAH, TSP, PCS, deployment pay, retirement planning..."
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            rows={4}
            maxLength={maxLength}
            disabled={isLoading}
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {question.length}/{maxLength} characters
            </span>
            {templateId && (
              <Badge variant="info" className="text-xs">
                Template Question
              </Badge>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <Icon name="Loader" className="h-4 w-4 animate-spin" />
              Generating Answer...
            </>
          ) : (
            <>
              <Icon name="Send" className="h-4 w-4" />
              Ask Question
            </>
          )}
        </button>
      </form>

      {/* Quick Tips */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Quick Tips</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Be specific: "BAH for E-5 with dependents" vs "housing allowance"</li>
          <li>• Include your rank and location when relevant</li>
          <li>• Ask about specific scenarios: PCS, deployment, retirement</li>
        </ul>
      </div>
    </div>
  );
}
