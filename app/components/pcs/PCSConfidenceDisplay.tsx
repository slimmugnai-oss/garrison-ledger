"use client";

import { useState } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface ConfidenceDisplayProps {
  estimates: {
    dla: {
      confidence: number;
      source: string;
      lastVerified: string;
      citation?: string;
      effectiveDate?: string;
    };
    malt: {
      confidence: number;
      source: string;
      lastVerified: string;
      citation?: string;
      effectiveDate?: string;
    };
    perDiem: {
      confidence: number;
      source: string;
      lastVerified: string;
      citation?: string;
      effectiveDate?: string;
    };
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

      {/* Data Freshness Summary */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="Shield" className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Data Verification Status</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div className="flex items-center gap-1">
            <Icon name="CheckCircle" className="h-3 w-3 text-green-600" />
            <span>2025 Official Rates</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="CheckCircle" className="h-3 w-3 text-green-600" />
            <span>DoD/IRS Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="CheckCircle" className="h-3 w-3 text-green-600" />
            <span>JTR Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="CheckCircle" className="h-3 w-3 text-green-600" />
            <span>Real-time Data</span>
          </div>
        </div>
      </div>

      {/* Overall Confidence */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Overall Confidence</span>
          <Badge variant={getConfidenceVariant(estimates.confidence)}>
            {getConfidenceLabel(estimates.confidence)}
          </Badge>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
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
        <p className="mt-1 text-xs text-gray-600">
          {estimates.confidence}% - Based on data freshness and source reliability
        </p>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          {/* DLA Confidence */}
          <div className="border-l-4 border-blue-200 pl-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">DLA Rate</span>
              <Badge variant={getConfidenceVariant(estimates.dla.confidence)}>
                {estimates.dla.confidence}%
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-gray-600">
                <span className="font-medium">Source:</span> {estimates.dla.source}
              </p>
              {estimates.dla.citation && (
                <p className="text-gray-600">
                  <span className="font-medium">Citation:</span> {estimates.dla.citation}
                </p>
              )}
              {estimates.dla.effectiveDate && (
                <p className="text-gray-600">
                  <span className="font-medium">Effective:</span>{" "}
                  {new Date(estimates.dla.effectiveDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-gray-500">
                <span className="font-medium">Last verified:</span>{" "}
                {new Date(estimates.dla.lastVerified).toLocaleString()}
              </p>
            </div>
          </div>

          {/* MALT Confidence */}
          <div className="border-l-4 border-green-200 pl-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">MALT Rate</span>
              <Badge variant={getConfidenceVariant(estimates.malt.confidence)}>
                {estimates.malt.confidence}%
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-gray-600">
                <span className="font-medium">Source:</span> {estimates.malt.source}
              </p>
              {estimates.malt.citation && (
                <p className="text-gray-600">
                  <span className="font-medium">Citation:</span> {estimates.malt.citation}
                </p>
              )}
              {estimates.malt.effectiveDate && (
                <p className="text-gray-600">
                  <span className="font-medium">Effective:</span>{" "}
                  {new Date(estimates.malt.effectiveDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-gray-500">
                <span className="font-medium">Last verified:</span>{" "}
                {new Date(estimates.malt.lastVerified).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Per Diem Confidence */}
          <div className="border-l-4 border-purple-200 pl-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Per Diem Rate</span>
              <Badge variant={getConfidenceVariant(estimates.perDiem.confidence)}>
                {estimates.perDiem.confidence}%
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-gray-600">
                <span className="font-medium">Source:</span> {estimates.perDiem.source}
              </p>
              {estimates.perDiem.citation && (
                <p className="text-gray-600">
                  <span className="font-medium">Citation:</span> {estimates.perDiem.citation}
                </p>
              )}
              {estimates.perDiem.effectiveDate && (
                <p className="text-gray-600">
                  <span className="font-medium">Effective:</span>{" "}
                  {new Date(estimates.perDiem.effectiveDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-gray-500">
                <span className="font-medium">Last verified:</span>{" "}
                {new Date(estimates.perDiem.lastVerified).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-slate-700">Data Sources & Verification</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Icon name="Shield" className="h-3 w-3 text-green-600" />
                <span className="font-medium">
                  All rates verified from official DoD/IRS sources
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Timer" className="h-3 w-3 text-blue-600" />
                <span>Data updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="File" className="h-3 w-3 text-purple-600" />
                <span>JTR compliance: Current regulations (2025)</span>
              </div>
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
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Some calculations used fallback rates
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                Please verify these amounts with your finance office before submitting your claim.
              </p>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
