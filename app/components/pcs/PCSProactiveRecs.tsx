"use client";

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import AnimatedCard from "@/app/components/ui/AnimatedCard";

interface ProactiveRecommendation {
  id: string;
  severity: "tip" | "warning" | "critical";
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible: boolean;
}

interface PCSProactiveRecsProps {
  claimContext: {
    rank?: string;
    hasDependents?: boolean;
    distance?: number;
    tleDaysOrigin?: number;
    tleDaysDestination?: number;
    completionPercentage?: number;
    readinessScore?: number;
    estimatedTotal?: number;
    validationIssuesCount?: number;
    hasWeighTickets?: boolean;
    hasPCSOrders?: boolean;
    pcsType?: string;
    travelMethod?: string;
  };
  onDismiss: (id: string) => void;
  onNavigate: (section: string) => void;
}

export default function PCSProactiveRecs({
  claimContext,
  onDismiss,
  onNavigate,
}: PCSProactiveRecsProps) {
  const [recommendations, setRecommendations] = useState<ProactiveRecommendation[]>([]);

  useEffect(() => {
    const recs = generateRecommendations(claimContext, onNavigate);
    setRecommendations(recs);
  }, [claimContext, onNavigate]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "AlertCircle";
      case "warning":
        return "AlertTriangle";
      case "tip":
        return "Lightbulb";
      default:
        return "Info";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-200 bg-red-50 text-red-900";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900";
      case "tip":
        return "border-blue-200 bg-blue-50 text-blue-900";
      default:
        return "border-gray-200 bg-gray-50 text-gray-900";
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <AnimatedCard key={rec.id} className={`border-l-4 p-4 ${getSeverityColor(rec.severity)}`}>
          <div className="flex items-start gap-3">
            <Icon
              name={getSeverityIcon(rec.severity) as any}
              className="mt-0.5 h-5 w-5 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 font-semibold">{rec.title}</h4>
              <p className="text-sm leading-relaxed">{rec.message}</p>
              {rec.action && (
                <button
                  onClick={rec.action.handler}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-current bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-opacity-10"
                >
                  {rec.action.label}
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </button>
              )}
            </div>
            {rec.dismissible && (
              <button
                onClick={() => onDismiss(rec.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" className="h-4 w-4" />
              </button>
            )}
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
}

function generateRecommendations(
  context: PCSProactiveRecsProps["claimContext"],
  onNavigate: (section: string) => void
): ProactiveRecommendation[] {
  const recs: ProactiveRecommendation[] = [];

  // Critical: Missing PCS Orders
  if (!context.hasPCSOrders) {
    recs.push({
      id: "missing-pcs-orders",
      severity: "critical",
      title: "❌ Missing PCS Orders",
      message:
        "Your claim cannot be processed without PCS orders. Upload them now to avoid delays.",
      action: {
        label: "Upload PCS Orders",
        handler: () => onNavigate("documents"),
      },
      dismissible: false,
    });
  }

  // Critical: Low readiness score
  if (context.readinessScore !== undefined && context.readinessScore < 50) {
    recs.push({
      id: "low-readiness-score",
      severity: "critical",
      title: "⚠️ Claim Needs Attention",
      message: `Your readiness score is only ${context.readinessScore}%. Fix validation issues to improve your score and avoid rejection.`,
      action: {
        label: "View Issues",
        handler: () => onNavigate("validation"),
      },
      dismissible: false,
    });
  }

  // Warning: TLE days = 0
  if (context.tleDaysOrigin === 0 && context.tleDaysDestination === 0) {
    recs.push({
      id: "no-tle-claimed",
      severity: "warning",
      title: "💡 Don't Forget TLE!",
      message:
        "Most service members need temporary lodging during PCS. Did you use a hotel? You could be leaving $500-$1,500 on the table.",
      action: {
        label: "Add TLE",
        handler: () => onNavigate("lodging"),
      },
      dismissible: true,
    });
  }

  // Tip: Long distance = en route per diem
  if (context.distance && context.distance > 1000) {
    recs.push({
      id: "en-route-per-diem-tip",
      severity: "tip",
      title: "💡 Long Distance = Extra Money",
      message: `That's a ${context.distance} mile drive! Consider claiming en route per diem for the days you're traveling. This could add $200-$500 to your claim.`,
      action: {
        label: "Calculate Per Diem",
        handler: () => onNavigate("costs"),
      },
      dismissible: true,
    });
  }

  // Tip: PPM without weigh tickets
  if (context.travelMethod === "ppm" && !context.hasWeighTickets) {
    recs.push({
      id: "ppm-weigh-tickets",
      severity: "warning",
      title: "⚠️ PPM Requires Weigh Tickets",
      message:
        "You're doing a PPM move but haven't added weigh tickets yet. These are REQUIRED for payment - get them before you move!",
      action: {
        label: "Learn More",
        handler: () => window.open("/docs/ppm-weigh-tickets", "_blank"),
      },
      dismissible: false,
    });
  }

  // Tip: First-time DLA claim
  if (context.completionPercentage === 0) {
    recs.push({
      id: "dla-reminder",
      severity: "tip",
      title: "💰 Don't Forget Your DLA!",
      message: context.hasDependents
        ? `As a ${context.rank || "service member"} with family, you're entitled to $${getDLAEstimate(context.rank, true)} in Dislocation Allowance. This is automatic - just enter your orders date!`
        : `As a ${context.rank || "service member"}, you're entitled to $${getDLAEstimate(context.rank, false)} in Dislocation Allowance. This is automatic - just enter your orders date!`,
      action: {
        label: "Claim DLA Now",
        handler: () => onNavigate("basic"),
      },
      dismissible: true,
    });
  }

  // Tip: Readiness score improvement
  if (
    context.readinessScore !== undefined &&
    context.readinessScore >= 50 &&
    context.readinessScore < 90
  ) {
    const fixes = getRemainingFixes(context);
    if (fixes.length > 0) {
      recs.push({
        id: "improve-readiness",
        severity: "tip",
        title: `🎯 ${fixes.length} Quick Fixes to Boost Your Score`,
        message: `Your claim is ${context.readinessScore}% ready. ${fixes.slice(0, 3).join(", ")}. These small fixes will boost your score to 90%+!`,
        action: {
          label: "Start Fixing",
          handler: () => onNavigate("validation"),
        },
        dismissible: true,
      });
    }
  }

  // Tip: Completion milestone
  if (context.completionPercentage && context.completionPercentage === 50) {
    recs.push({
      id: "halfway-milestone",
      severity: "tip",
      title: "🎉 Halfway There!",
      message: `You're 50% done with your claim! Keep going - you're on track to recover an estimated $${context.estimatedTotal?.toLocaleString() || "8,000"}. Finish strong!`,
      dismissible: true,
    });
  }

  // Warning: Validation issues
  if (context.validationIssuesCount && context.validationIssuesCount > 0) {
    recs.push({
      id: "validation-issues",
      severity: "warning",
      title: `⚠️ ${context.validationIssuesCount} Validation ${context.validationIssuesCount === 1 ? "Issue" : "Issues"} Found`,
      message:
        "Your claim has validation issues that could cause rejection or delays. Fix them now before submitting.",
      action: {
        label: "View & Fix",
        handler: () => onNavigate("validation"),
      },
      dismissible: false,
    });
  }

  // Tip: OCONUS considerations
  if (context.pcsType?.includes("OCONUS")) {
    recs.push({
      id: "oconus-considerations",
      severity: "tip",
      title: "🌍 OCONUS Special Considerations",
      message:
        "OCONUS moves have special entitlements like OHA, COLA, and NTS. Make sure you're claiming everything you're entitled to!",
      action: {
        label: "See OCONUS Guide",
        handler: () => window.open("/docs/oconus-pcs-guide", "_blank"),
      },
      dismissible: true,
    });
  }

  return recs;
}

function getDLAEstimate(rank: string | undefined, hasDependents: boolean): number {
  const rates: Record<string, { without: number; with: number }> = {
    "E-1": { without: 1234, with: 2468 },
    "E-2": { without: 1234, with: 2468 },
    "E-3": { without: 1234, with: 2468 },
    "E-4": { without: 1234, with: 2468 },
    "E-5": { without: 1543, with: 3086 },
    "E-6": { without: 1543, with: 3086 },
    "E-7": { without: 1852, with: 3704 },
    "E-8": { without: 1852, with: 3704 },
    "E-9": { without: 1852, with: 3704 },
    "O-1": { without: 2160, with: 4320 },
    "O-2": { without: 2160, with: 4320 },
    "O-3": { without: 2160, with: 4320 },
    "O-4": { without: 2469, with: 4938 },
    "O-5": { without: 2469, with: 4938 },
    "O-6": { without: 2469, with: 4938 },
  };

  const rate = rates[rank || "E-5"];
  if (!rate) return hasDependents ? 3086 : 1543;
  return hasDependents ? rate.with : rate.without;
}

function getRemainingFixes(context: PCSProactiveRecsProps["claimContext"]): string[] {
  const fixes: string[] = [];

  if (!context.hasPCSOrders) fixes.push("Add PCS orders date");
  if (!context.hasWeighTickets && context.travelMethod === "ppm")
    fixes.push("Upload weigh tickets");
  if (context.tleDaysOrigin === 0 && context.tleDaysDestination === 0) fixes.push("Add TLE days");
  if (context.estimatedTotal === 0) fixes.push("Enter expense amounts");
  if (context.validationIssuesCount && context.validationIssuesCount > 0)
    fixes.push("Fix validation issues");

  return fixes;
}
