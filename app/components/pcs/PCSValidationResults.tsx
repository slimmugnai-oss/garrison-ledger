"use client";

import { useState } from "react";

import PCSAIExplanation from "@/app/components/pcs/PCSAIExplanation";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface ValidationResult {
  rule_code: string;
  rule_title: string;
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  citation: string;
  passed: boolean;
  details?: any;
}

interface ValidationSummary {
  total_rules: number;
  passed: number;
  warnings: number;
  errors: number;
  overall_score: number;
  results: ValidationResult[];
}

interface PCSValidationResultsProps {
  validation: ValidationSummary;
  onFixSuggestion?: (ruleCode: string, suggestion: string) => void;
}

export default function PCSValidationResults({
  validation,
  onFixSuggestion,
}: PCSValidationResultsProps) {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<"all" | "error" | "warning" | "info">("all");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return "XCircle";
      case "warning":
        return "AlertTriangle";
      case "info":
        return "Info";
      default:
        return "CheckCircle";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "error":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "success";
    }
  };

  const toggleRuleExpansion = (ruleCode: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleCode)) {
      newExpanded.delete(ruleCode);
    } else {
      newExpanded.add(ruleCode);
    }
    setExpandedRules(newExpanded);
  };

  const filteredResults = validation.results.filter(
    (result) => filterSeverity === "all" || result.severity === filterSeverity
  );

  const getOverallStatus = () => {
    if (validation.errors > 0) return "error";
    if (validation.warnings > 0) return "warning";
    return "success";
  };

  const getOverallMessage = () => {
    if (validation.errors > 0) {
      return `${validation.errors} error${validation.errors > 1 ? "s" : ""} found. Please fix before submitting.`;
    }
    if (validation.warnings > 0) {
      return `${validation.warnings} warning${validation.warnings > 1 ? "s" : ""} found. Review recommended.`;
    }
    return "All validations passed! Your claim looks good.";
  };

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${getSeverityColor(getOverallStatus())}`}>
              <Icon name={getSeverityIcon(getOverallStatus())} className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">JTR Validation Results</h3>
              <p className="text-sm text-slate-600">{getOverallMessage()}</p>
            </div>
          </div>
          <Badge variant={getSeverityVariant(getOverallStatus())}>
            {validation.overall_score}% Score
          </Badge>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{validation.total_rules}</div>
            <div className="text-xs text-slate-600">Total Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{validation.passed}</div>
            <div className="text-xs text-slate-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{validation.warnings}</div>
            <div className="text-xs text-slate-600">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{validation.errors}</div>
            <div className="text-xs text-slate-600">Errors</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterSeverity("all")}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            filterSeverity === "all"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({validation.total_rules})
        </button>
        <button
          onClick={() => setFilterSeverity("error")}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            filterSeverity === "error"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Errors ({validation.errors})
        </button>
        <button
          onClick={() => setFilterSeverity("warning")}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            filterSeverity === "warning"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Warnings ({validation.warnings})
        </button>
        <button
          onClick={() => setFilterSeverity("info")}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            filterSeverity === "info"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Info ({validation.results.filter((r) => r.severity === "info").length})
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.map((result, index) => (
          <div
            key={`${result.rule_code}-${index}`}
            className={`rounded-lg border p-4 ${getSeverityColor(result.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-1 items-start gap-3">
                <Icon
                  name={getSeverityIcon(result.severity)}
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium">{result.rule_title}</span>
                    <Badge variant={getSeverityVariant(result.severity)} size="sm">
                      {result.severity}
                    </Badge>
                    <span className="text-xs text-slate-500">({result.rule_code})</span>
                  </div>
                  <p className="mb-2 text-sm">{result.message}</p>

                  {result.suggestion && (
                    <div className="mt-2 rounded border-l-2 border-current bg-white/50 p-2">
                      <p className="mb-1 text-xs font-medium">💡 Suggestion:</p>
                      <p className="text-xs">{result.suggestion}</p>
                      {onFixSuggestion && (
                        <button
                          onClick={() => onFixSuggestion(result.rule_code, result.suggestion!)}
                          className="mt-1 text-xs text-blue-600 underline hover:text-blue-700"
                        >
                          Apply Fix
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-medium">Citation:</span> {result.citation}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleRuleExpansion(result.rule_code)}
                className="ml-2 rounded p-1 hover:bg-white/20"
              >
                <Icon
                  name={expandedRules.has(result.rule_code) ? "ChevronUp" : "ChevronDown"}
                  className="h-4 w-4"
                />
              </button>
            </div>

            {/* Expanded Details */}
            {expandedRules.has(result.rule_code) && (
              <div className="border-current/20 mt-3 border-t pt-3">
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="font-medium">Category:</span> {result.category}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {result.passed ? "Passed" : "Failed"}
                  </div>
                  {result.details && (
                    <div>
                      <span className="font-medium">Details:</span> {JSON.stringify(result.details)}
                    </div>
                  )}
                </div>

                {/* AI Explanation */}
                <div className="mt-4">
                  <PCSAIExplanation
                    ruleCode={result.rule_code}
                    ruleTitle={result.rule_title}
                    category={result.category}
                    severity={result.severity}
                    message={result.message}
                    userContext={{
                      rank: "E-5", // This would come from user profile
                      branch: "Army", // This would come from user profile
                      hasDependents: true, // This would come from user profile
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredResults.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          <Icon name="CheckCircle" className="mx-auto mb-3 h-12 w-12 text-green-500" />
          <p>No {filterSeverity === "all" ? "" : filterSeverity} validation results found.</p>
        </div>
      )}
    </AnimatedCard>
  );
}
