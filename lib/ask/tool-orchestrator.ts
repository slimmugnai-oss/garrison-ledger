/**
 * TOOL ORCHESTRATOR - Auto-Triggering of Garrison Ledger Tools
 *
 * Analyzes questions and proactively launches relevant tools:
 * - BAH questions → open BAH calculator with prefilled data
 * - PCS questions → open PCS Copilot with detected origin/destination
 * - TSP questions → open TSP calculator
 * - LES questions → redirect to LES Auditor
 * - Base questions → open Base Navigator to detected base
 *
 * Makes Ask Military Expert a command center, not just Q&A
 */

import type { DataSource } from "./data-query-engine";

// ============================================================================
// TYPES
// ============================================================================

export interface ToolTrigger {
  tool: string; // Tool name (PCS Copilot, Base Navigator, etc.)
  url: string; // Tool URL with prefilled parameters
  reason: string; // Why triggering this tool
  confidence: number; // 0-1, how confident this is the right tool
  autoLaunch: boolean; // Should auto-open in new tab vs suggest
  prefillData?: Record<string, unknown>; // Data to prefill in tool
}

export interface OrchestrationResult {
  primaryTool?: ToolTrigger; // Main tool to launch
  additionalTools: ToolTrigger[]; // Related tools user might want
  explainerText: string; // Explain what the tools will do
}

// ============================================================================
// TOOL DETECTION
// ============================================================================

/**
 * Detect which Garrison Ledger tools are relevant to question
 */
export function detectRelevantTools(
  question: string,
  userProfile: Record<string, unknown>,
  _dataSources: DataSource[]
): OrchestrationResult {
  const triggers: ToolTrigger[] = [];

  // ============================================================================
  // LES AUDITOR
  // ============================================================================

  if (
    /paycheck|les|underpaid|pay (is )?wrong|bah (is )?missing|tax withhold/i.test(question)
  ) {
    triggers.push({
      tool: "LES Auditor",
      url: "/dashboard/paycheck-audit",
      reason: "Upload your LES and I'll audit it line-by-line for errors and missing entitlements",
      confidence: 0.9,
      autoLaunch: false, // Suggest, don't auto-launch (requires file upload)
      prefillData: {
        paygrade: userProfile.paygrade,
        mha_code: userProfile.mha_code,
        years_of_service: userProfile.years_of_service,
      },
    });
  }

  // ============================================================================
  // PCS COPILOT
  // ============================================================================

  if (/pcs|mov(e|ing)|dity|ppm|dla|weight allowance|relocation/i.test(question)) {
    // Try to detect origin and destination from question
    const originBase = extractBase(question, "from");
    const destBase = extractBase(question, "to");

    const pcsUrl = buildPCSUrl(originBase, destBase, userProfile);

    triggers.push({
      tool: "PCS Copilot",
      url: pcsUrl,
      reason: "Calculate your exact PCS entitlements (DLA, weight allowance, DITY profit, timeline)",
      confidence: 0.85,
      autoLaunch: /calculate|how much|profit|entitlement/i.test(question), // Auto-launch if asking for calculation
      prefillData: {
        originBase,
        destinationBase: destBase,
        rank: userProfile.paygrade,
        dependents: userProfile.has_dependents,
      },
    });
  }

  // ============================================================================
  // BASE NAVIGATOR
  // ============================================================================

  if (/base|station|fort|camp|installation|raf |mcas /i.test(question)) {
    const baseName = extractBase(question);

    const baseUrl = baseName
      ? `/dashboard/navigator?base=${encodeURIComponent(baseName)}`
      : "/dashboard/navigator";

    triggers.push({
      tool: "Base Navigator",
      url: baseUrl,
      reason: "Research bases with real data: weather, housing costs, schools, commute times",
      confidence: 0.8,
      autoLaunch: false,
      prefillData: {
        baseName,
        searchQuery: baseName,
      },
    });
  }

  // ============================================================================
  // TDY COPILOT
  // ============================================================================

  if (/tdy|temporary duty|per diem|travel voucher|dts/i.test(question)) {
    triggers.push({
      tool: "TDY Copilot",
      url: "/dashboard/tdy-voucher",
      reason: "Track TDY expenses, calculate per diem, and build your travel voucher",
      confidence: 0.85,
      autoLaunch: false,
      prefillData: {},
    });
  }

  // ============================================================================
  // TSP MODELER (if exists)
  // ============================================================================

  if (/tsp|thrift savings|retirement savings|c fund|s fund|allocation/i.test(question)) {
    triggers.push({
      tool: "TSP Calculator",
      url: "/calculators/tsp", // Adjust URL if different
      reason: "Model your TSP growth and compare allocation strategies",
      confidence: 0.75,
      autoLaunch: /calculate|projection|how much will/i.test(question),
      prefillData: {
        currentAge: userProfile.age || calculateAge(userProfile.years_of_service as number),
        yearsOfService: userProfile.years_of_service,
      },
    });
  }

  // ============================================================================
  // PROFILE UPDATER
  // ============================================================================

  if (!userProfile.paygrade || !userProfile.mha_code) {
    // Profile incomplete - suggest completing it
    triggers.push({
      tool: "Profile Setup",
      url: "/dashboard/profile",
      reason: "Complete your profile so I can give you personalized answers specific to YOUR situation",
      confidence: 1.0,
      autoLaunch: false,
      prefillData: {},
    });
  }

  // ============================================================================
  // PRIORITIZE AND RETURN
  // ============================================================================

  if (triggers.length === 0) {
    return {
      additionalTools: [],
      explainerText: "",
    };
  }

  // Sort by confidence
  triggers.sort((a, b) => b.confidence - a.confidence);

  const primary = triggers[0];
  const additional = triggers.slice(1);

  const explainerText = buildExplainerText(primary, additional);

  return {
    primaryTool: primary,
    additionalTools: additional,
    explainerText,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract base name from question
 */
function extractBase(question: string, direction?: "from" | "to"): string | undefined {
  // Common base patterns
  const basePatterns = [
    /fort\s+\w+/i,
    /camp\s+\w+/i,
    /mcas\s+\w+/i,
    /nas\s+\w+/i,
    /raf\s+\w+/i,
    /ramstein/i,
    /hood/i,
    /bragg/i,
    /lewis/i,
    /campbell/i,
    /drum/i,
    /bliss/i,
    /carson/i,
    /benning/i,
    /jackson/i,
    /pendleton/i,
    /lejeune/i,
  ];

  if (direction === "from") {
    const fromMatch = question.match(/from\s+(fort|camp|mcas|nas|raf)?\s*(\w+)/i);
    if (fromMatch) return fromMatch[0].replace(/^from\s+/i, "").trim();
  }

  if (direction === "to") {
    const toMatch = question.match(/to\s+(fort|camp|mcas|nas|raf)?\s*(\w+)/i);
    if (toMatch) return toMatch[0].replace(/^to\s+/i, "").trim();
  }

  // General base extraction
  for (const pattern of basePatterns) {
    const match = question.match(pattern);
    if (match) return match[0];
  }

  return undefined;
}

/**
 * Build PCS Copilot URL with prefilled data
 */
function buildPCSUrl(
  origin?: string,
  destination?: string,
  userProfile?: Record<string, unknown>
): string {
  const params = new URLSearchParams();

  if (origin) params.set("origin", origin);
  if (destination) params.set("destination", destination);
  if (userProfile?.paygrade) params.set("rank", userProfile.paygrade as string);
  if (userProfile?.has_dependents) params.set("dependents", "true");

  return `/dashboard/pcs-copilot${params.toString() ? `?${params.toString()}` : ""}`;
}

/**
 * Calculate approximate age from years of service
 */
function calculateAge(yearsOfService: number): number {
  // Assume average enlistment age of 19
  return 19 + yearsOfService;
}

/**
 * Build explainer text for tool triggers
 */
function buildExplainerText(primary: ToolTrigger, additional: ToolTrigger[]): string {
  let text = `**🛠️ I recommend using ${primary.tool}:** ${primary.reason}`;

  if (additional.length > 0) {
    text += `\n\n**You might also want:**\n`;
    additional.forEach((tool) => {
      text += `- **${tool.tool}:** ${tool.reason}\n`;
    });
  }

  return text;
}

// ============================================================================
// SMART TOOL SUGGESTIONS BASED ON CONVERSATION
// ============================================================================

/**
 * Suggest tools based on conversation history
 * If user asked about BAH, then PCS, then housing → suggest Base Navigator
 */
export function suggestToolsFromConversation(
  conversationHistory: Array<{ question: string; answer: string }>
): ToolTrigger[] {
  const suggestions: ToolTrigger[] = [];

  if (conversationHistory.length < 2) return suggestions;

  const questions = conversationHistory.map((h) => h.question.toLowerCase()).join(" ");

  // Pattern: Multiple housing/base questions → Base Navigator
  const housingCount = (questions.match(/bah|housing|on-base|off-base|rent/g) || []).length;
  if (housingCount >= 2) {
    suggestions.push({
      tool: "Base Navigator",
      url: "/dashboard/navigator",
      reason: "Since you're researching housing, the Base Navigator shows you real housing costs, schools, and neighborhood data",
      confidence: 0.8,
      autoLaunch: false,
    });
  }

  // Pattern: Multiple PCS questions → PCS Copilot
  const pcsCount = (questions.match(/pcs|move|moving|dity|ppm|dla/g) || []).length;
  if (pcsCount >= 2) {
    suggestions.push({
      tool: "PCS Copilot",
      url: "/dashboard/pcs-copilot",
      reason: "You're asking multiple PCS questions - the PCS Copilot gives you a complete move plan with exact entitlements",
      confidence: 0.85,
      autoLaunch: false,
    });
  }

  // Pattern: Pay + underpaid → LES Auditor
  if (/pay|paycheck/i.test(questions) && /wrong|missing|underpaid|less than/i.test(questions)) {
    suggestions.push({
      tool: "LES Auditor",
      url: "/dashboard/paycheck-audit",
      reason: "Sounds like you have paycheck concerns - upload your LES and I'll audit it for errors",
      confidence: 0.9,
      autoLaunch: false,
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================================
// INTELLIGENT PREFILL
// ============================================================================

/**
 * Extract data from question to prefill calculator
 */
export function extractPrefillData(
  question: string,
  userProfile: Record<string, unknown>
): Record<string, unknown> {
  const prefillData: Record<string, unknown> = {};

  // Extract paygrade/rank
  const paygrades = question.match(/[EOW]-?\d{1,2}/gi);
  if (paygrades) {
    prefillData.paygrade = paygrades[0].toUpperCase().replace("-", "");
  } else if (userProfile.paygrade) {
    prefillData.paygrade = userProfile.paygrade;
  }

  // Extract dependents
  if (/with dependent|married|spouse|kids|children|family/i.test(question)) {
    prefillData.has_dependents = true;
  } else if (userProfile.has_dependents !== undefined) {
    prefillData.has_dependents = userProfile.has_dependents;
  }

  // Extract location
  const base = extractBase(question);
  if (base) {
    prefillData.base = base;
  } else if (userProfile.current_base) {
    prefillData.base = userProfile.current_base;
  }

  // Extract dollar amounts (for calculations)
  const amounts = question.match(/\$[\d,]+/g);
  if (amounts) {
    prefillData.amounts = amounts.map((a) => parseInt(a.replace(/[$,]/g, "")));
  }

  // Extract distances (for PCS calculations)
  const distance = question.match(/(\d+)\s*(miles|km)/i);
  if (distance) {
    prefillData.distance = parseInt(distance[1]);
  }

  // Extract years/months (for TSP projections)
  const years = question.match(/(\d+)\s*years?/i);
  if (years) {
    prefillData.years = parseInt(years[1]);
  }

  return prefillData;
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Main orchestration function - called from Ask API
 */
export function orchestrateTools(
  question: string,
  userProfile: Record<string, unknown>,
  dataSources: DataSource[],
  conversationHistory: Array<{ question: string; answer: string }>
): OrchestrationResult {
  // Detect tools from current question
  const currentTools = detectRelevantTools(question, userProfile, dataSources);

  // Suggest tools from conversation pattern
  const conversationTools = suggestToolsFromConversation(conversationHistory);

  // Merge and deduplicate
  const allTools = [
    ...(currentTools.primaryTool ? [currentTools.primaryTool] : []),
    ...currentTools.additionalTools,
    ...conversationTools,
  ];

  // Remove duplicates by tool name
  const uniqueTools = allTools.reduce((acc, tool) => {
    if (!acc.find((t) => t.tool === tool.tool)) {
      acc.push(tool);
    }
    return acc;
  }, [] as ToolTrigger[]);

  // Sort by confidence
  const sortedTools = uniqueTools.sort((a, b) => b.confidence - a.confidence);

  return {
    primaryTool: sortedTools[0],
    additionalTools: sortedTools.slice(1, 4), // Top 3 additional tools
    explainerText: currentTools.explainerText || buildDefaultExplainer(sortedTools[0]),
  };
}

function buildDefaultExplainer(tool?: ToolTrigger): string {
  if (!tool) return "";
  return `I recommend using **${tool.tool}** for this. ${tool.reason}`;
}

// ============================================================================
// QUICK ACTIONS (One-Click Workflows)
// ============================================================================

/**
 * Generate quick action buttons for common workflows
 */
export function generateQuickActions(
  question: string,
  _answer: unknown
): Array<{ label: string; url: string; icon: string }> {
  const actions: Array<{ label: string; url: string; icon: string }> = [];

  if (/bah|housing/i.test(question)) {
    actions.push({
      label: "Compare On-Base vs Off-Base",
      url: "/dashboard/navigator",
      icon: "Home",
    });
  }

  if (/pcs|move/i.test(question)) {
    actions.push({
      label: "Calculate DITY Profit",
      url: "/dashboard/pcs-copilot",
      icon: "Calculator",
    });
    actions.push({
      label: "Download PCS Checklist",
      url: "/downloads/pcs-checklist.pdf",
      icon: "FileText",
    });
  }

  if (/tsp|retire/i.test(question)) {
    actions.push({
      label: "Project TSP Growth",
      url: "/calculators/tsp",
      icon: "TrendingUp",
    });
  }

  if (/deploy/i.test(question)) {
    actions.push({
      label: "Download Deployment Checklist",
      url: "/downloads/deployment-checklist.pdf",
      icon: "CheckSquare",
    });
  }

  return actions;
}

// ============================================================================
// TOOL ANALYTICS
// ============================================================================

/**
 * Track which tools are recommended most often
 * (For analytics - helps prioritize tool development)
 */
export function trackToolRecommendation(
  _tool: string,
  _question: string,
  _clicked: boolean
): void {
  // Placeholder for analytics tracking
  // In production: log to analytics_events table
}

// All functions already exported above with 'export' keyword
// No need for redundant export statement at end

