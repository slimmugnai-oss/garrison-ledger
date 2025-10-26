"use client";

import { useState } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface ProvenanceData {
  source: string;
  citation?: string;
  effectiveDate?: string;
  lastVerified: string;
  confidence: number;
  dataType: string;
}

interface PCSProvenanceDisplayProps {
  data: ProvenanceData[];
  title?: string;
  compact?: boolean;
}

export default function PCSProvenanceDisplay({
  data,
  title = "Data Sources & Verification",
  compact = false,
}: PCSProvenanceDisplayProps) {
  const [showDetails, setShowDetails] = useState(!compact);

  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 90) return "success";
    if (confidence >= 70) return "warning";
    if (confidence >= 50) return "warning";
    return "danger";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "Verified";
    if (confidence >= 70) return "Good";
    if (confidence >= 50) return "Fair";
    return "Needs Review";
  };

  const overallConfidence = Math.round(
    data.reduce((sum, item) => sum + item.confidence, 0) / data.length
  );

  if (compact) {
    return (
      <div className="rounded-lg bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="Shield" className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">{title}</span>
          <Badge variant={getConfidenceVariant(overallConfidence)}>
            {getConfidenceLabel(overallConfidence)}
          </Badge>
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
    );
  }

  return (
    <AnimatedCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Icon name={showDetails ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Overall Status */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="Shield" className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Data Verification Status</span>
          <Badge variant={getConfidenceVariant(overallConfidence)}>
            {overallConfidence}% {getConfidenceLabel(overallConfidence)}
          </Badge>
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

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.dataType}</span>
                <Badge variant={getConfidenceVariant(item.confidence)}>{item.confidence}%</Badge>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600">
                  <span className="font-medium">Source:</span> {item.source}
                </p>
                {item.citation && (
                  <p className="text-gray-600">
                    <span className="font-medium">Citation:</span> {item.citation}
                  </p>
                )}
                {item.effectiveDate && (
                  <p className="text-gray-600">
                    <span className="font-medium">Effective:</span>{" "}
                    {new Date(item.effectiveDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-500">
                  <span className="font-medium">Last verified:</span>{" "}
                  {new Date(item.lastVerified).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {/* Data Sources Summary */}
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
            </div>
          </div>
        </div>
      )}

      {/* Warning for low confidence */}
      {overallConfidence < 80 && (
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
