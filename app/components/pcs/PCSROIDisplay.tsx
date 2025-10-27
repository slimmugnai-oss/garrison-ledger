"use client";

import { useEffect, useState } from "react";

import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface PCSROIDisplayProps {
  estimatedTotal: number;
  confidence: number;
  rank?: string;
  hasDependents?: boolean;
  isCalculating?: boolean;
}

/**
 * Real-time ROI display showing estimated PCS entitlements
 * Updates as user enters data in the wizard
 *
 * Conservative messaging - no "savings" claims, only "entitlements"
 */
export default function PCSROIDisplay({
  estimatedTotal,
  confidence,
  rank,
  hasDependents,
  isCalculating = false,
}: PCSROIDisplayProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-600";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-600";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-600";
    return "text-gray-600 bg-gray-50 border-gray-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Review";
  };

  return (
    <div
      className={`sticky top-0 z-30 border-b border-blue-800 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transition-all duration-300 ${
        isVisible ? "py-6" : "py-3"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left: Estimated Total */}
          <div className="text-center sm:text-left">
            {isCalculating ? (
              <div className="flex items-center gap-3">
                <Icon name="Loader" className="h-8 w-8 animate-spin text-white" />
                <div className="text-2xl font-bold text-white">Calculating...</div>
              </div>
            ) : (
              <>
                <div className="text-5xl font-black text-white sm:text-6xl">
                  {estimatedTotal > 0 ? `$${estimatedTotal.toLocaleString()}` : "---"}
                </div>
                <div className="mt-1 text-lg font-medium text-blue-100">
                  Estimated PCS Entitlement
                </div>
              </>
            )}
          </div>

          {/* Right: Metadata */}
          <div className="flex flex-col items-center gap-2 sm:items-end">
            {/* Confidence Badge */}
            {confidence > 0 && (
              <div
                className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-semibold ${getConfidenceColor(
                  confidence
                )}`}
              >
                <Icon name="Shield" className="h-4 w-4" />
                <span className="text-sm">
                  {getConfidenceLabel(confidence)} ({confidence}%)
                </span>
              </div>
            )}

            {/* Data Source */}
            <div className="text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4" />
                <span>Based on official 2025 DFAS rates</span>
              </div>
              {rank && (
                <div className="mt-1 text-xs opacity-90">
                  {rank}
                  {hasDependents !== undefined &&
                    (hasDependents ? " with dependents" : " without dependents")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator when calculating */}
        {isCalculating && (
          <div className="mt-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-blue-800">
              <div
                className="h-full animate-pulse bg-gradient-to-r from-blue-400 to-blue-200"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
