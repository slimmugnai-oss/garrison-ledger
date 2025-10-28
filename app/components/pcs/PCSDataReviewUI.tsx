"use client";

import { useState } from "react";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import Input from "@/app/components/ui/Input";

interface FieldScore {
  value: any;
  confidence: number;
  status: "excellent" | "good" | "needs_review" | "missing";
}

interface PCSDataReviewUIProps {
  extractedData: Record<string, any>;
  fieldScores?: Record<string, FieldScore>;
  overallConfidence: number;
  onConfirm: (reviewedData: Record<string, any>) => void;
  onCancel: () => void;
}

const FIELD_LABELS: Record<string, { label: string; tooltip: string }> = {
  member_name: {
    label: "Member Name",
    tooltip: "Format: Last, First Middle Initial (e.g., SMITH, JOHN A)",
  },
  rank: {
    label: "Rank/Paygrade",
    tooltip: "E.g., E-6, SSG, CPT, PO1",
  },
  branch: {
    label: "Service Branch",
    tooltip: "Army, Navy, Air Force, Marine Corps, Space Force, or Coast Guard",
  },
  orders_date: {
    label: "Orders Issue Date",
    tooltip: "Date the PCS orders were issued",
  },
  report_date: {
    label: "Report Date",
    tooltip: "Date you must report to new duty station (Report NLT)",
  },
  departure_date: {
    label: "Departure Date",
    tooltip: "Authorized departure date from current location (Proceed Date)",
  },
  origin_base: {
    label: "Current Base",
    tooltip: "Your current duty station (e.g., Fort Liberty, NC)",
  },
  destination_base: {
    label: "New Base",
    tooltip: "Your new duty station (e.g., Joint Base Lewis-McChord, WA)",
  },
  dependents_authorized: {
    label: "Number of Dependents",
    tooltip: "Number of authorized dependents (0 if none)",
  },
  ppm_authorized: {
    label: "PPM/DITY Move Authorized",
    tooltip: "Are you authorized to do a Personally Procured Move?",
  },
  hhg_weight_allowance: {
    label: "Weight Allowance (lbs)",
    tooltip: "Household goods weight allowance in pounds",
  },
  order_number: {
    label: "Order Number",
    tooltip: "Official order number if listed on orders",
  },
  issuing_authority: {
    label: "Issuing Authority",
    tooltip: "Command/authority that issued the orders",
  },
};

export default function PCSDataReviewUI({
  extractedData,
  fieldScores = {},
  overallConfidence,
  onConfirm,
  onCancel,
}: PCSDataReviewUIProps) {
  const [editedData, setEditedData] = useState<Record<string, any>>(extractedData);

  const getConfidenceBadge = (status: string, confidence: number) => {
    if (status === "excellent") {
      return (
        <Badge variant="success" className="text-xs">
          ✓ {confidence}%
        </Badge>
      );
    } else if (status === "good") {
      return (
        <Badge variant="warning" className="text-xs">
          ~ {confidence}%
        </Badge>
      );
    } else if (status === "needs_review") {
      return (
        <Badge variant="danger" className="text-xs">
          ! {confidence}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="text-xs">
          Missing
        </Badge>
      );
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCriticalFields = () => {
    return Object.entries(fieldScores).filter(
      ([_, score]) => score.status === "needs_review" || score.status === "missing"
    ).length;
  };

  const criticalCount = getCriticalFields();

  return (
    <div className="space-y-6">
      {/* Header with Overall Confidence */}
      <Card
        className={
          overallConfidence >= 90
            ? "border-green-300 bg-green-50"
            : overallConfidence >= 70
              ? "border-yellow-300 bg-yellow-50"
              : "border-red-300 bg-red-50"
        }
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">OCR Extraction Complete</h3>
              <p className="text-sm text-slate-600">
                Review the extracted information and make any corrections needed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">{overallConfidence}%</div>
              <div className="text-xs text-slate-600">Overall Confidence</div>
              {criticalCount > 0 && (
                <Badge variant="danger" className="mt-2">
                  {criticalCount} field{criticalCount > 1 ? "s" : ""} need review
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field-by-Field Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Edit" className="h-5 w-5" />
            Review Extracted Data
          </CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            Fields marked with{" "}
            <Badge variant="success" className="mx-1 inline-flex text-xs">
              ✓
            </Badge>{" "}
            were extracted with high confidence. Fields marked with{" "}
            <Badge variant="danger" className="mx-1 inline-flex text-xs">
              !
            </Badge>{" "}
            should be verified carefully.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(FIELD_LABELS).map(([fieldKey, fieldConfig]) => {
            const fieldScore = fieldScores[fieldKey];
            const value = editedData[fieldKey];

            return (
              <div
                key={fieldKey}
                className={`rounded-lg border-2 p-4 transition-colors ${
                  fieldScore?.status === "excellent"
                    ? "border-green-200 bg-green-50"
                    : fieldScore?.status === "good"
                      ? "border-yellow-200 bg-yellow-50"
                      : fieldScore?.status === "needs_review"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      {fieldConfig.label}
                      <button
                        title={fieldConfig.tooltip}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <Icon name="HelpCircle" className="h-4 w-4" />
                      </button>
                    </label>
                    <p className="text-xs text-slate-600">{fieldConfig.tooltip}</p>
                  </div>
                  {fieldScore && getConfidenceBadge(fieldScore.status, fieldScore.confidence)}
                </div>

                {/* Input Field */}
                {fieldKey === "ppm_authorized" ? (
                  <select
                    value={value?.toString() || ""}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value === "true")}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not specified</option>
                    <option value="true">Yes - PPM/DITY Authorized</option>
                    <option value="false">No - Government Move</option>
                  </select>
                ) : fieldKey.includes("date") ? (
                  <input
                    type="date"
                    value={value || ""}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                    className={`w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      fieldScore?.status === "needs_review" || fieldScore?.status === "missing"
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder={
                      fieldScore?.status === "missing" ? "Not found - please enter manually" : ""
                    }
                  />
                ) : (
                  <Input
                    type={
                      fieldKey.includes("dependents") || fieldKey.includes("weight")
                        ? "number"
                        : "text"
                    }
                    value={value || ""}
                    onChange={(newValue: string) => handleFieldChange(fieldKey, newValue)}
                    className={
                      fieldScore?.status === "needs_review" || fieldScore?.status === "missing"
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                    placeholder={
                      fieldScore?.status === "missing" ? "Not found - please enter manually" : ""
                    }
                  />
                )}

                {/* Confidence Note */}
                {fieldScore && fieldScore.status !== "excellent" && (
                  <div className="mt-2 text-xs text-slate-600">
                    {fieldScore.status === "missing" &&
                      "⚠️ This field was not found in your orders - please enter it manually"}
                    {fieldScore.status === "needs_review" &&
                      "⚠️ Low confidence extraction - please verify this value carefully"}
                    {fieldScore.status === "good" && "ℹ️ Please confirm this value is correct"}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onCancel} className="px-6">
          Cancel & Enter Manually
        </Button>
        <Button
          onClick={() => onConfirm(editedData)}
          className="bg-green-600 px-8 hover:bg-green-700"
        >
          <Icon name="CheckCircle" className="mr-2 h-5 w-5" />
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
}
