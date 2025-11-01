"use client";

/**
 * WORKING COMPARISON TOOL FOR ASK MILITARY EXPERT
 * 
 * Simple base comparison using our actual bases.ts data
 */

import { useState, useEffect } from "react";
import { BarChart, Loader2, AlertCircle } from "lucide-react";
import BaseAutocomplete from "@/app/components/ui/BaseAutocomplete";

export default function ComparisonToolFixed() {
  const [base1, setBase1] = useState<string>("");
  const [base2, setBase2] = useState<string>("");
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Fetch quota on mount
  useEffect(() => {
    async function fetchQuota() {
      try {
        const res = await fetch("/api/ask/quota?feature=compare");
        const data = await res.json();
        if (data.success) {
          setQuota({ used: data.used, limit: data.limit });
        }
      } catch (error) {
        console.error("Failed to fetch quota:", error);
      }
    }
    fetchQuota();
  }, []);

  const handleCompare = async () => {
    if (!base1 || !base2) return;

    // Check quota before comparing
    if (quota && quota.used >= quota.limit) {
      setQuotaError(`You've used all ${quota.limit} free comparisons this month. Upgrade to Premium for unlimited comparisons.`);
      return;
    }

    setComparing(true);
    setResult(null);
    setQuotaError(null);

    try {
      // Track comparison usage first
      await fetch("/api/ask/track-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "compare", metadata: { base1, base2 } }),
      });

      // Simple comparison via the Ask API
      const response = await fetch("/api/ask/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Compare ${base1} and ${base2} for a military family. Include housing costs, schools, weather, quality of life, and which is better for different situations.`,
        }),
      });

      const data = await response.json();

      if (data.success && data.answer) {
        setResult(data.answer.bottomLine.join("\n\n"));
        // Update quota count
        if (quota) {
          setQuota({ ...quota, used: quota.used + 1 });
        }
      } else {
        setResult("Comparison failed. Please try again.");
      }
    } catch (error) {
      console.error("Comparison error:", error);
      setResult("Error running comparison. Please try again.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Quota */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChart className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-slate-800">Compare Military Bases</h3>
            <p className="text-sm text-slate-600">
              Get an AI-powered comparison of housing, schools, weather, and quality of life
            </p>
          </div>
        </div>
        {quota && (
          <div className="text-sm">
            <span className={`font-semibold ${quota.used >= quota.limit ? "text-red-600" : "text-slate-700"}`}>
              {quota.limit - quota.used} of {quota.limit} free
            </span>
            <span className="text-slate-500 ml-1">this month</span>
          </div>
        )}
      </div>

      {/* Quota Error / Upgrade Prompt */}
      {quotaError && (
        <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-2">Limit Reached</p>
              <p className="text-sm text-amber-800 mb-3">{quotaError}</p>
              <a
                href="/dashboard/upgrade"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Upgrade to Premium
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Base Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            First Base
          </label>
          <BaseAutocomplete
            value={base1}
            onChange={setBase1}
            placeholder="Search for a base..."
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Second Base
          </label>
          <BaseAutocomplete
            value={base2}
            onChange={setBase2}
            placeholder="Search for a base..."
            className="w-full"
          />
        </div>
      </div>

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={!base1 || !base2 || comparing}
        className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {comparing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Comparing...
          </>
        ) : (
          "Compare Bases"
        )}
      </button>

      {/* Comparison Result */}
      {result && (
        <div className="border border-slate-200 rounded-lg p-6 bg-white">
          <h4 className="font-bold text-slate-800 mb-4">Comparison Results</h4>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

