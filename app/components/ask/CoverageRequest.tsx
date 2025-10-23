"use client";

/**
 * ASK ASSISTANT - Coverage Request Modal
 *
 * Modal form for requesting data coverage when official sources are unavailable
 */

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";

interface CoverageRequestProps {
  isOpen: boolean;
  onClose: () => void;
  question?: string;
}

export default function CoverageRequest({ isOpen, onClose, question }: CoverageRequestProps) {
  const [formData, setFormData] = useState({
    question: question || "",
    topicArea: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ask/coverage-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setFormData({ question: "", topicArea: "", priority: "medium" });
        }, 2000);
      } else {
        console.error("Coverage request error:", result.error);
      }
    } catch (error) {
      console.error("Coverage request error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setIsSubmitted(false);
      setFormData({ question: "", topicArea: "", priority: "medium" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
        {isSubmitted ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Request Submitted</h3>
            <p className="mb-4 text-gray-600">
              Thank you! We'll research this topic and add it to our data sources.
            </p>
            <button
              onClick={handleClose}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Request Data Coverage</h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <Icon
                  name="AlertTriangle"
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                />
                <div className="text-sm text-amber-700">
                  <p className="mb-1 font-medium">No Official Data Available</p>
                  <p>
                    We don't have official data for this question yet. Help us improve by requesting
                    coverage.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="question" className="mb-1 block text-sm font-medium text-gray-700">
                  Your Question *
                </label>
                <textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="topicArea" className="mb-1 block text-sm font-medium text-gray-700">
                  Topic Area
                </label>
                <select
                  id="topicArea"
                  value={formData.topicArea}
                  onChange={(e) => setFormData({ ...formData, topicArea: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Select topic area</option>
                  <option value="BAH">BAH (Housing Allowance)</option>
                  <option value="TSP">TSP (Thrift Savings Plan)</option>
                  <option value="PCS">PCS (Permanent Change of Station)</option>
                  <option value="Deployment">Deployment Pay & Benefits</option>
                  <option value="Retirement">Retirement Planning</option>
                  <option value="Insurance">Insurance (SGLI, etc.)</option>
                  <option value="Education">Education Benefits</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="low">Low - Nice to have</option>
                  <option value="medium">Medium - Would be helpful</option>
                  <option value="high">High - Really need this data</option>
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Icon name="Info" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-700">
                  <p className="mb-1 font-medium">What happens next?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• We'll research official sources for this topic</li>
                    <li>• Add the data to our database if available</li>
                    <li>• You'll be notified when coverage is added</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.question.trim() || isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader" className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
