/**
 * Profile Recommendations System
 *
 * Analyzes user profile completeness and provides tool-specific recommendations
 * Used by ProfileSummaryWidget to guide users toward completing their profile
 */

export type RecommendationStatus = "ready" | "incomplete" | "optional";

export interface Recommendation {
  tool: string;
  status: RecommendationStatus;
  message: string;
  fields?: string[];
  action?: string;
}

export interface UserProfile {
  // Core fields
  rank?: string | null;
  paygrade?: string | null;
  current_base?: string | null;
  next_base?: string | null;
  mha_code?: string | null;
  has_dependents?: boolean | null;

  // Special pays
  receives_sdap?: boolean | null;
  receives_hfp_idp?: boolean | null;
  receives_fsa?: boolean | null;
  receives_flpp?: boolean | null;

  // Deductions & taxes
  tsp_contribution_percent?: number | null;
  sgli_coverage_amount?: number | null;
  filing_status?: string | null;

  // Other
  age?: number | null;
  retirement_age_target?: number | null;
}

export function getProfileRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // LES Auditor readiness - Core requirement
  if (!profile.paygrade || !profile.mha_code || profile.has_dependents === null) {
    recommendations.push({
      tool: "LES Auditor",
      status: "incomplete",
      message: "Complete rank, base, and dependents for accurate pay verification",
      fields: ["rank", "current_base", "has_dependents"],
    });
  } else {
    recommendations.push({
      tool: "LES Auditor",
      status: "ready",
      message: "Profile complete - ready for paycheck audits",
    });
  }

  // LES Auditor Enhanced - Special pays (optional)
  if (
    profile.paygrade &&
    profile.mha_code &&
    !profile.receives_sdap &&
    !profile.receives_hfp_idp &&
    !profile.receives_fsa &&
    !profile.receives_flpp
  ) {
    recommendations.push({
      tool: "LES Auditor (Enhanced)",
      status: "optional",
      message: "Add special pays for even more accurate audits",
      action: "Go to LES Setup tab",
    });
  }

  // Base Navigator readiness
  if (!profile.current_base) {
    recommendations.push({
      tool: "Base Navigator",
      status: "incomplete",
      message: "Add current base to explore local housing and schools",
      fields: ["current_base"],
    });
  } else {
    recommendations.push({
      tool: "Base Navigator",
      status: "ready",
      message: "Explore neighborhoods at your current base",
    });
  }

  // PCS Copilot readiness (optional)
  if (profile.current_base && !profile.next_base) {
    recommendations.push({
      tool: "PCS Copilot",
      status: "optional",
      message: "Add next PCS base for move planning and DITY calculations",
      fields: ["next_base"],
    });
  } else if (profile.next_base) {
    recommendations.push({
      tool: "PCS Copilot",
      status: "ready",
      message: "Plan your PCS and maximize DITY move profit",
    });
  }

  // TSP Calculator readiness
  if (!profile.age || !profile.retirement_age_target) {
    recommendations.push({
      tool: "TSP Calculator",
      status: "incomplete",
      message: "Add age and retirement goal for accurate projections",
      fields: ["age", "retirement_age_target"],
    });
  }

  return recommendations;
}

/**
 * Get the top priority recommendation to display
 */
export function getTopRecommendation(profile: UserProfile): Recommendation | null {
  const recommendations = getProfileRecommendations(profile);

  // Prioritize incomplete over optional
  const incomplete = recommendations.find((r) => r.status === "incomplete");
  if (incomplete) return incomplete;

  // Then show optional recommendations
  const optional = recommendations.find((r) => r.status === "optional");
  if (optional) return optional;

  // Finally show first ready status
  return recommendations.find((r) => r.status === "ready") || null;
}

/**
 * Calculate overall profile completion percentage
 */
export function calculateProfileCompletion(profile: UserProfile): number {
  // Core fields (most important)
  const coreFields = [
    profile.rank,
    profile.current_base,
    profile.has_dependents !== null && profile.has_dependents !== undefined,
    profile.age,
  ];

  // Important fields
  const importantFields = [profile.paygrade, profile.mha_code, profile.retirement_age_target];

  // Optional fields
  const optionalFields = [
    profile.next_base,
    profile.tsp_contribution_percent,
    profile.sgli_coverage_amount,
    profile.filing_status,
  ];

  // Weight: Core = 50%, Important = 30%, Optional = 20%
  const coreComplete = coreFields.filter(Boolean).length;
  const coreTotal = coreFields.length;
  const corePercentage = (coreComplete / coreTotal) * 50;

  const importantComplete = importantFields.filter(Boolean).length;
  const importantTotal = importantFields.length;
  const importantPercentage = (importantComplete / importantTotal) * 30;

  const optionalComplete = optionalFields.filter(Boolean).length;
  const optionalTotal = optionalFields.length;
  const optionalPercentage = (optionalComplete / optionalTotal) * 20;

  return Math.round(corePercentage + importantPercentage + optionalPercentage);
}

/**
 * Get completion status color
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Get completion status message
 */
export function getCompletionMessage(percentage: number): string {
  if (percentage >= 90) return "Profile complete!";
  if (percentage >= 70) return "Almost there!";
  if (percentage >= 50) return "Good progress";
  if (percentage >= 25) return "Getting started";
  return "Just beginning";
}
