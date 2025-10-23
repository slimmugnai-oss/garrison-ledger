"use client";

/**
 * ASK ASSISTANT - Credit Meter
 *
 * Visual progress bar showing remaining credits with purchase options
 */

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import { ssot } from "@/lib/ssot";

interface CreditData {
  credits_remaining: number;
  credits_total: number;
  tier: string;
  expires_at?: string;
}

interface CreditMeterProps {
  _onPurchaseClick?: () => void;
}

export interface CreditMeterRef {
  refresh: () => Promise<void>;
}

const CreditMeter = forwardRef<CreditMeterRef, CreditMeterProps>(({ _onPurchaseClick }, ref) => {
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/ask/credits");
      const result = await response.json();

      if (result.success) {
        setCredits(result);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh method to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchCredits,
  }));

  useEffect(() => {
    fetchCredits();
  }, []);

  const handlePurchase = async (packSize: number) => {
    try {
      const response = await fetch("/api/ask/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packSize }),
      });

      const result = await response.json();

      if (result.success && result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
          <div className="mb-2 h-8 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="AlertCircle" className="h-5 w-5 text-red-600" />
          <span className="font-semibold text-red-800">Credits Not Available</span>
        </div>
        <p className="text-sm text-red-700">
          Unable to load your credit balance. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const isFree = credits.tier === "free";
  const isLow = credits.credits_remaining <= 1;
  const progressPercentage = (credits.credits_remaining / credits.credits_total) * 100;

  const getProgressColor = () => {
    if (isLow) return "bg-red-500";
    if (credits.credits_remaining <= credits.credits_total * 0.3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = () => {
    if (isLow) return "text-red-600";
    if (credits.credits_remaining <= credits.credits_total * 0.3) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Zap" className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Ask Assistant Credits</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isFree ? "warning" : "success"}>{isFree ? "Free" : "Premium"}</Badge>
          {isLow && (
            <Badge variant="danger">
              <Icon name="AlertTriangle" className="mr-1 h-3 w-3" />
              Low
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {credits.credits_remaining} / {credits.credits_total} questions
          </span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {isLow ? "Almost out!" : `${credits.credits_remaining} remaining`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.max(progressPercentage, 5)}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isFree ? (
            <span>
              Free tier: {ssot.features.askAssistant.rateLimits.free.questionsPerMonth}{" "}
              questions/month
            </span>
          ) : (
            <span>
              Premium tier: {ssot.features.askAssistant.rateLimits.premium.questionsPerMonth}{" "}
              questions/month
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {isFree && (
            <a
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              <Icon name="Star" className="h-3 w-3" />
              Upgrade
            </a>
          )}

          {credits.credits_remaining <= 2 && (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
            >
              <Icon name="Plus" className="h-3 w-3" />
              Buy More
            </button>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Buy More Questions</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {ssot.features.askAssistant.creditPacks.map((pack) => (
                <button
                  key={pack.credits}
                  onClick={() => handlePurchase(pack.credits)}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{pack.credits} Questions</div>
                      <div className="text-sm text-gray-600">
                        ${(pack.priceCents / 100).toFixed(2)}
                      </div>
                    </div>
                    <Icon name="ArrowRight" className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-600">
                Credits never expire and can be used anytime. Questions are deducted only when you
                submit a question.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CreditMeter.displayName = "CreditMeter";

export default CreditMeter;
