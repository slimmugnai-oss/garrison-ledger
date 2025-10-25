"use client";

import { useState } from "react";
import { Icon } from "@/app/components/ui/Icon";
import { Button } from "@/app/components/ui/Button";

interface FeedbackFormProps {
  questionId: string;
  questionText: string;
  answerText: string;
  answerMode: "strict" | "advisory";
  confidenceScore: number;
  responseTimeMs: number;
  sourcesUsed: string[];
  onFeedbackSubmitted: () => void;
}

const feedbackCategories = [
  { id: "inaccurate", name: "Inaccurate Information", color: "text-red-600", icon: "XCircle" },
  { id: "outdated", name: "Outdated Information", color: "text-yellow-600", icon: "Clock" },
  { id: "incomplete", name: "Incomplete Answer", color: "text-blue-600", icon: "AlertCircle" },
  { id: "generic", name: "Too Generic", color: "text-purple-600", icon: "Users" },
  { id: "confusing", name: "Confusing", color: "text-gray-600", icon: "HelpCircle" },
  { id: "excellent", name: "Excellent", color: "text-green-600", icon: "CheckCircle" },
];

export function FeedbackForm({
  questionId,
  questionText,
  answerText,
  answerMode,
  confidenceScore,
  responseTimeMs,
  sourcesUsed,
  onFeedbackSubmitted,
}: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (!rating && !thumbsUp && selectedCategories.length === 0 && !feedbackText.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ask/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          questionText,
          answerText,
          rating,
          thumbsUp,
          thumbsDown: thumbsUp === false,
          feedbackText: feedbackText.trim(),
          feedbackCategories: selectedCategories,
          answerMode,
          confidenceScore,
          responseTimeMs,
          sourcesUsed,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        setRating(null);
        setThumbsUp(null);
        setSelectedCategories([]);
        setFeedbackText("");
        onFeedbackSubmitted();
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="MessageCircle" className="h-4 w-4" />
          <span>Was this answer helpful?</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setThumbsUp(true)}
            className="flex items-center gap-1"
          >
            <Icon name="ThumbsUp" className="h-4 w-4" />
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setThumbsUp(false)}
            className="flex items-center gap-1"
          >
            <Icon name="ThumbsDown" className="h-4 w-4" />
            No
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-gray-500"
          >
            <Icon name="MoreHorizontal" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Help us improve</h3>
        <p className="text-sm text-gray-600">
          Your feedback helps us provide better answers to military life questions.
        </p>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Overall rating (1-5 stars)
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${
                rating && star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Quick thumbs */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Quick feedback</label>
        <div className="flex items-center gap-2">
          <Button
            variant={thumbsUp === true ? "default" : "outline"}
            size="sm"
            onClick={() => setThumbsUp(true)}
            className="flex items-center gap-1"
          >
            <Icon name="ThumbsUp" className="h-4 w-4" />
            Helpful
          </Button>
          <Button
            variant={thumbsUp === false ? "destructive" : "outline"}
            size="sm"
            onClick={() => setThumbsUp(false)}
            className="flex items-center gap-1"
          >
            <Icon name="ThumbsDown" className="h-4 w-4" />
            Not helpful
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          What could be improved? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {feedbackCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors ${
                selectedCategories.includes(category.id)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon name={category.icon} className={`h-4 w-4 ${category.color}`} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text feedback */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Additional comments (optional)
        </label>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Tell us more about your experience..."
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-1">
          {isSubmitting ? (
            <>
              <Icon name="Loader2" className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Icon name="Send" className="h-4 w-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
