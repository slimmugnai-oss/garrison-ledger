"use client";

import { useState } from "react";

import Icon from "../ui/Icon";
import { logger } from "@/lib/logger";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [helpfulness, setHelpfulness] = useState(0);
  const [actionability, setActionability] = useState(0);
  const [relevance, setRelevance] = useState(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (helpfulness === 0 || actionability === 0 || relevance === 0) {
      alert("Please rate all three categories");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/plan/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helpfulness,
          actionability,
          relevance,
          comments: comments.trim() || undefined,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        if (onSubmit) onSubmit();

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      logger.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-all hover:scale-110"
          >
            <Icon
              name="Star"
              className={`h-8 w-8 ${
                star <= value ? "fill-amber-400 text-amber-400" : "fill-none text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-slate-900">Thank You!</h3>
          <p className="text-slate-600">
            Your feedback helps us improve plans for all military families.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">How was your plan?</h3>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <StarRating
            value={helpfulness}
            onChange={setHelpfulness}
            label="How helpful was the content?"
          />

          <StarRating
            value={actionability}
            onChange={setActionability}
            label="How actionable are the recommendations?"
          />

          <StarRating
            value={relevance}
            onChange={setRelevance}
            label="How relevant is this to your situation?"
          />

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Additional comments (optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What could we improve?"
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={submitting || helpfulness === 0 || actionability === 0 || relevance === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Icon name="Loader" className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon name="Send" className="h-5 w-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
