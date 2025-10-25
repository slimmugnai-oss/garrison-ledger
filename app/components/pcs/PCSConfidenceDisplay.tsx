"use client";

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import AnimatedCard from "@/app/components/ui/AnimatedCard";

interface ConfidenceDisplayProps {
  estimates: {
    dla: { confidence: number; source: string; lastVerified: string };
    malt: { confidence: number; source: string; lastVerified: string };
    perDiem: { confidence: number; source: string; lastVerified: string };
    total: number;
    confidence: number;
    dataSources: Record<string, string>;
  };
}

export default function PCSConfidenceDisplay({ estimates }: ConfidenceDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 90) return "success";
    if (confidence >= 70) return "warning";
    if (confidence >= 50) return "warning";
    return "danger";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "Excellent";
    if (confidence >= 70) return "Good";
    if (confidence >= 50) return "Fair";
    return "Needs Review";
  };

  return (
    <AnimatedCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Calculation Confidence</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Icon name={showDetails ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Overall Confidence */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Confidence</span>
          <Badge variant={getConfidenceVariant(estimates.confidence)}>
            {getConfidenceLabel(estimates.confidence)}
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              estimates.confidence >= 90
                ? "bg-green-500"
                : estimates.confidence >= 70
                ? "bg-yellow-500"
                : estimates.confidence >= 50
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${estimates.confidence}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {estimates.confidence}% - Based on data freshness and source reliability
        </p>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          {/* DLA Confidence */}
          <div className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">DLA Rate</span>
              <Badge variant={getConfidenceVariant(estimates.dla.confidence)}>
                {estimates.dla.confidence}%
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Source: {estimates.dla.source}
            </p>
            <p className="text-xs text-gray-500">
              Last verified: {estimates.dla.lastVerified}
            </p>
          </div>

          {/* MALT Confidence */}
          <div className="border-l-4 border-green-200 pl-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">MALT Rate</span>
              <Badge variant={getConfidenceVariant(estimates.malt.confidence)}>
                {estimates.malt.confidence}%
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Source: {estimates.malt.source}
            </p>
            <p className="text-xs text-gray-500">
              Last verified: {estimates.malt.lastVerified}
            </p>
          </div>

          {/* Per Diem Confidence */}
          <div className="border-l-4 border-purple-200 pl-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Per Diem Rate</span>
              <Badge variant={getConfidenceVariant(estimates.perDiem.confidence)}>
                {estimates.perDiem.confidence}%
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Source: {estimates.perDiem.source}
            </p>
            <p className="text-xs text-gray-500">
              Last verified: {estimates.perDiem.lastVerified}
            </p>
          </div>

          {/* Data Sources */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Data Sources</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {Object.entries(estimates.dataSources).map(([key, source]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span>{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warning for low confidence */}
      {estimates.confidence < 80 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Some calculations used fallback rates
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Please verify these amounts with your finance office before submitting your claim.
              </p>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
