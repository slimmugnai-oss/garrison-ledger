"use client";

import { useState, useEffect } from "react";

import Icon from "@/app/components/ui/Icon";

interface SmartQuestionTemplate {
  id: string;
  template: string;
  category: string;
  icon: string;
  variables: string[];
  targetSection?: string;
}

interface PCSSmartTemplatesProps {
  claimContext: {
    rank?: string;
    branch?: string;
    hasDependents?: boolean;
    pcsType?: string;
    distance?: number;
    originBase?: string;
    destinationBase?: string;
    travelMethod?: string;
    dependentsCount?: number;
    currentSection?: string;
    completionPercentage?: number;
    readinessScore?: number;
  };
  onAskQuestion: (question: string) => void;
}

const smartTemplates: SmartQuestionTemplate[] = [
  // DLA Templates
  {
    id: "dla-amount",
    template: "What's my exact DLA amount as a {rank} {withDependents}?",
    category: "DLA",
    icon: "DollarSign",
    variables: ["rank", "withDependents"],
  },
  {
    id: "dla-payment-timing",
    template: "When will I receive my DLA payment for this PCS?",
    category: "DLA",
    icon: "Calendar",
    variables: [],
  },

  // TLE Templates
  {
    id: "tle-max-days",
    template: "How many TLE days can I claim at {originBase} and {destinationBase}?",
    category: "TLE",
    icon: "Home",
    variables: ["originBase", "destinationBase"],
  },
  {
    id: "tle-rate-limit",
    template: "What's the maximum TLE daily rate at {destinationBase}?",
    category: "TLE",
    icon: "Home",
    variables: ["destinationBase"],
  },
  {
    id: "tle-receipts",
    template: "What receipts do I need for TLE at {destinationBase}?",
    category: "TLE",
    icon: "Receipt",
    variables: ["destinationBase"],
  },

  // MALT Templates
  {
    id: "malt-calculation",
    template:
      "How is MALT calculated for my {distance} mile PCS from {originBase} to {destinationBase}?",
    category: "MALT",
    icon: "Truck",
    variables: ["distance", "originBase", "destinationBase"],
  },
  {
    id: "malt-multiple-vehicles",
    template: "Can I claim MALT for two vehicles on this PCS?",
    category: "MALT",
    icon: "Truck",
    variables: [],
  },

  // Per Diem Templates
  {
    id: "per-diem-rate",
    template: "What's the per diem rate for travel from {originBase} to {destinationBase}?",
    category: "Per Diem",
    icon: "Utensils",
    variables: ["originBase", "destinationBase"],
  },
  {
    id: "per-diem-dependents",
    template: "Do my {dependentsCount} dependents get per diem during PCS travel?",
    category: "Per Diem",
    icon: "Users",
    variables: ["dependentsCount"],
  },
  {
    id: "per-diem-receipts",
    template: "Do I need receipts for per diem claims?",
    category: "Per Diem",
    icon: "Receipt",
    variables: [],
  },

  // PPM Templates
  {
    id: "ppm-weight-allowance",
    template: "What's my weight allowance as a {rank} {withDependents} for a {travelMethod} move?",
    category: "PPM",
    icon: "Package",
    variables: ["rank", "withDependents", "travelMethod"],
  },
  {
    id: "ppm-profit-estimate",
    template: "How much profit can I make on a {travelMethod} move for {distance} miles?",
    category: "PPM",
    icon: "TrendingUp",
    variables: ["travelMethod", "distance"],
  },
  {
    id: "ppm-weigh-tickets",
    template: "Where do I get weigh tickets for my {travelMethod} move?",
    category: "PPM",
    icon: "Scale",
    variables: ["travelMethod"],
  },

  // General Templates
  {
    id: "maximize-reimbursement",
    template: "How can I maximize my reimbursement for this {pcsType} PCS?",
    category: "General",
    icon: "TrendingUp",
    variables: ["pcsType"],
  },
  {
    id: "common-mistakes",
    template: "What are common mistakes for {rank} service members doing {pcsType} PCS?",
    category: "General",
    icon: "AlertTriangle",
    variables: ["rank", "pcsType"],
  },
  {
    id: "readiness-improvement",
    template: "How can I improve my {readinessScore}% readiness score?",
    category: "General",
    icon: "Target",
    variables: ["readinessScore"],
    targetSection: "review",
  },

  // Advanced Templates
  {
    id: "advance-pay",
    template: "Can I get advance pay for this PCS and how much?",
    category: "Advanced",
    icon: "CreditCard",
    variables: [],
  },
  {
    id: "house-hunting-trip",
    template: "Am I eligible for a house hunting trip to {destinationBase}?",
    category: "Advanced",
    icon: "Home",
    variables: ["destinationBase"],
  },
  {
    id: "storage-in-transit",
    template: "How long can I use storage in transit for this {pcsType} PCS?",
    category: "Advanced",
    icon: "Archive",
    variables: ["pcsType"],
  },
];

export default function PCSSmartTemplates({ claimContext, onAskQuestion }: PCSSmartTemplatesProps) {
  const [processedTemplates, setProcessedTemplates] = useState<
    Array<{
      id: string;
      question: string;
      category: string;
      icon: string;
      isRelevant: boolean;
    }>
  >([]);

  useEffect(() => {
    // Process templates with actual values
    const processed = smartTemplates.map((template) => {
      let question = template.template;
      let isRelevant = true;

      // Replace variables with actual values
      template.variables.forEach((variable) => {
        const value = getVariableValue(variable, claimContext);
        if (value) {
          question = question.replace(`{${variable}}`, value);
        } else {
          isRelevant = false; // Can't fill this template yet
        }
      });

      // Check if template is relevant to current section
      if (template.targetSection && template.targetSection !== claimContext.currentSection) {
        isRelevant = isRelevant && false;
      }

      return {
        id: template.id,
        question,
        category: template.category,
        icon: template.icon,
        isRelevant,
      };
    });

    setProcessedTemplates(processed);
  }, [claimContext]);

  const getVariableValue = (variable: string, context: any): string | null => {
    switch (variable) {
      case "rank":
        return context.rank || null;
      case "withDependents":
        return context.hasDependents ? "with family" : "without dependents";
      case "branch":
        return context.branch || null;
      case "originBase":
        return context.originBase || null;
      case "destinationBase":
        return context.destinationBase || null;
      case "pcsType":
        return context.pcsType || "CONUS";
      case "distance":
        return context.distance ? `${context.distance}` : null;
      case "travelMethod":
        return context.travelMethod === "ppm" ? "PPM" : "government";
      case "dependentsCount":
        return context.dependentsCount ? `${context.dependentsCount}` : null;
      case "completionPercentage":
        return context.completionPercentage ? `${context.completionPercentage}` : null;
      case "readinessScore":
        return context.readinessScore ? `${context.readinessScore}` : null;
      default:
        return null;
    }
  };

  const getContextualTemplates = () => {
    // Filter relevant templates based on context
    const relevant = processedTemplates.filter((t) => t.isRelevant);

    // Prioritize by current section
    if (claimContext.currentSection) {
      const sectionMap: Record<string, string[]> = {
        basic: ["DLA", "General"],
        travel: ["MALT", "Per Diem", "General"],
        lodging: ["TLE"],
        costs: ["MALT", "Per Diem"],
        weight: ["PPM", "General"],
        review: ["General", "Advanced"],
      };

      const relevantCategories = sectionMap[claimContext.currentSection] || [];
      return relevant.filter((t) => relevantCategories.includes(t.category));
    }

    return relevant;
  };

  const contextualTemplates = getContextualTemplates();

  if (contextualTemplates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Lightbulb" className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Quick Questions for You</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {contextualTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onAskQuestion(template.question)}
            className="group rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-100"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
                <Icon name={template.icon as any} className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs font-medium text-blue-600">{template.category}</div>
                <div className="text-sm font-medium leading-snug text-slate-900">
                  {template.question}
                </div>
              </div>
              <Icon
                name="ChevronRight"
                className="h-5 w-5 flex-shrink-0 text-blue-400 transition-colors group-hover:text-blue-600"
              />
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
        <span>💡 Questions personalized based on your claim details</span>
        <button
          onClick={() => window.open("/dashboard/ask", "_blank")}
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Ask anything else →
        </button>
      </div>
    </div>
  );
}
