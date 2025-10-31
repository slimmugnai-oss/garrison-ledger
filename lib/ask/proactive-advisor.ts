/**
 * PROACTIVE ADVISOR ENGINE
 *
 * Analyzes user questions and profile to detect:
 * - Financial opportunities (missing benefits, tax savings)
 * - Red flags (underpayment, missing entitlements, risks)
 * - Related topics to explore
 * - Tool recommendations
 * - Action items with deadlines
 *
 * Makes Ask Military Expert truly proactive vs reactive
 */

import type { DataSource } from "./data-query-engine";

// ============================================================================
// TYPES
// ============================================================================

export interface ProactiveInsight {
  type: "opportunity" | "red_flag" | "suggestion" | "deadline" | "tool_recommendation";
  severity: "critical" | "high" | "medium" | "low";
  category: string; // financial, career, legal, relationship, health
  title: string;
  description: string;
  action: string; // What user should do
  actionUrl?: string; // Link to tool or resource
  deadline?: string; // If time-sensitive
  potentialImpact: string; // "$5,000/year savings" or "Avoid $10K mistake"
  priority: number; // 0-100, higher = more urgent
}

export interface ProactiveAnalysis {
  insights: ProactiveInsight[];
  suggestedQuestions: string[];
  toolsToUse: Array<{ tool: string; url: string; reason: string }>;
  resourcestoCheck: Array<{ title: string; url: string }>;
}

// ============================================================================
// OPPORTUNITY DETECTION
// ============================================================================

/**
 * Detect financial opportunities user might be missing
 */
export function detectFinancialOpportunities(
  question: string,
  userProfile: Record<string, unknown>,
  dataSources: DataSource[]
): ProactiveInsight[] {
  const opportunities: ProactiveInsight[] = [];

  // Check if user is missing BRS TSP match
  if (userProfile.years_of_service && Number(userProfile.years_of_service) >= 2) {
    if (!question.includes("tsp") && !question.includes("match")) {
      opportunities.push({
        type: "opportunity",
        severity: "critical",
        category: "financial",
        title: "Are you maxing your BRS TSP match?",
        description: "If you're in the Blended Retirement System, the government matches up to 5% of your TSP contributions. Not contributing = leaving free money on the table.",
        action: "Set TSP contribution to at least 5% in myPay to get full $3,000-5,000/year match",
        actionUrl: "/dashboard/calculators/tsp",
        potentialImpact: "$200,000+ in free money over a 20-year career",
        priority: 95,
      });
    }
  }

  // Check if user deployed and might qualify for SDP
  if (question.toLowerCase().includes("deploy") || question.toLowerCase().includes("combat zone")) {
    if (!question.includes("sdp") && !question.includes("savings deposit")) {
      opportunities.push({
        type: "opportunity",
        severity: "high",
        category: "financial",
        title: "SDP: 10% Guaranteed Return During Deployment",
        description: "If deploying to combat zone, you qualify for Savings Deposit Program - deposit up to $10,000 and earn 10% guaranteed interest. This is $1,000+ in free money during a 12-month deployment.",
        action: "Ask me: 'How does SDP work during deployment?' to get complete strategy",
        potentialImpact: "$1,000-1,291 guaranteed earnings on $10K deposit",
        priority: 90,
      });
    }
  }

  // Check if asking about BAH and might benefit from off-base living
  if (question.toLowerCase().includes("bah") || question.toLowerCase().includes("housing")) {
    const bahSource = dataSources.find((s) => s.table === "bah_rates");
    if (bahSource && bahSource.data.rates && Array.isArray(bahSource.data.rates)) {
      opportunities.push({
        type: "suggestion",
        severity: "medium",
        category: "financial",
        title: "Living off-base could save you money",
        description: "If rent is less than BAH, you pocket the difference. Many service members save $200-500/month by renting below their BAH rate.",
        action: "Compare on-base vs off-base costs at your location",
        actionUrl: "/dashboard/navigator",
        potentialImpact: "$2,400-6,000/year in saved BAH",
        priority: 70,
      });
    }
  }

  // Check if PCSing and might want DITY move profit
  if (question.toLowerCase().includes("pcs") || question.toLowerCase().includes("move")) {
    if (!question.includes("dity") && !question.includes("ppm")) {
      opportunities.push({
        type: "opportunity",
        severity: "high",
        category: "financial",
        title: "DITY Move Can Profit You $5,000-10,000",
        description: "Instead of letting the government move you, do a DITY/PPM move and keep the difference. Most families profit $5,000-10,000 per PCS.",
        action: "Calculate your DITY move profit potential",
        actionUrl: "/dashboard/pcs-copilot",
        potentialImpact: "$5,000-10,000 profit per PCS",
        priority: 85,
      });
    }
  }

  return opportunities;
}

// ============================================================================
// RED FLAG DETECTION
// ============================================================================

/**
 * Detect financial red flags that need immediate attention
 */
export function detectRedFlags(
  question: string,
  userProfile: Record<string, unknown>,
  dataSources: DataSource[]
): ProactiveInsight[] {
  const redFlags: ProactiveInsight[] = [];

  // Check if user doesn't have emergency fund
  if (
    question.toLowerCase().includes("emergency") ||
    question.toLowerCase().includes("unexpected expense") ||
    question.toLowerCase().includes("broke")
  ) {
    redFlags.push({
      type: "red_flag",
      severity: "critical",
      category: "financial",
      title: "Build Emergency Fund ASAP",
      description: "No emergency fund = one car repair away from credit card debt. Military families need $5,000 minimum, $10,000-15,000 better due to PCS and deployment unpredictability.",
      action: "Build $5,000 emergency fund in next 6-12 months",
      potentialImpact: "Avoid $5,000-10,000 in high-interest debt",
      priority: 95,
    });
  }

  // Check if user has high-interest debt
  if (
    question.toLowerCase().includes("debt") ||
    question.toLowerCase().includes("credit card") ||
    question.toLowerCase().includes("loan")
  ) {
    redFlags.push({
      type: "red_flag",
      severity: "high",
      category: "financial",
      title: "High-Interest Debt is Wealth Killer",
      description: "Credit card debt at 18-25% interest costs you $150-250/month per $10,000 owed. This compounds and prevents wealth building.",
      action: "Deploy debt avalanche: pay off highest interest debt first, invoke SCRA for 6% cap if deploying",
      potentialImpact: "$1,000-3,000/year in interest savings",
      priority: 90,
    });
  }

  // Check if user not maximizing SCRA during deployment
  if (question.toLowerCase().includes("deploy") && question.toLowerCase().includes("debt")) {
    redFlags.push({
      type: "opportunity",
      severity: "critical",
      category: "legal",
      title: "SCRA 6% Interest Cap - REQUEST IT",
      description: "Servicemembers Civil Relief Act caps your interest rate at 6% on debt incurred BEFORE active duty. This is NOT automatic - you must send orders + written request to creditor.",
      action: "Send military orders + SCRA request letter to all creditors with >6% interest",
      potentialImpact: "$500-2,000/year in interest savings",
      priority: 95,
    });
  }

  // Check if retiring without TSP
  if (
    question.toLowerCase().includes("retire") ||
    question.toLowerCase().includes("20 years")
  ) {
    if (!question.includes("tsp")) {
      redFlags.push({
        type: "red_flag",
        severity: "critical",
        category: "financial",
        title: "Retiring Without TSP = Living on Pension Only",
        description: "E-7 pension at 20 years = $2,500/month. That's $30K/year - hard to live on. TSP adds $20-40K/year in retirement income. Don't retire broke.",
        action: "Start TSP contributions NOW, aim for $300,000-500,000 by retirement",
        potentialImpact: "$20,000-40,000/year additional retirement income",
        priority: 90,
      });
    }
  }

  return redFlags;
}

// ============================================================================
// TOOL RECOMMENDATIONS
// ============================================================================

/**
 * Recommend Garrison Ledger tools based on question topic
 */
export function recommendTools(
  question: string,
  userProfile: Record<string, unknown>
): Array<{ tool: string; url: string; reason: string }> {
  const tools: Array<{ tool: string; url: string; reason: string }> = [];

  // LES Auditor for paycheck questions
  if (
    question.toLowerCase().includes("paycheck") ||
    question.toLowerCase().includes("les") ||
    question.toLowerCase().includes("underpaid") ||
    question.toLowerCase().includes("bah") && question.toLowerCase().includes("wrong")
  ) {
    tools.push({
      tool: "LES Auditor",
      url: "/dashboard/paycheck-audit",
      reason: "Upload your LES and I'll audit it for errors - most servicemembers are underpaid and don't know it",
    });
  }

  // PCS Copilot for move questions
  if (
    question.toLowerCase().includes("pcs") ||
    question.toLowerCase().includes("move") ||
    question.toLowerCase().includes("dity") ||
    question.toLowerCase().includes("ppm")
  ) {
    tools.push({
      tool: "PCS Copilot",
      url: "/dashboard/pcs-copilot",
      reason: "Calculate your exact PCS entitlements (DLA, weight allowance, DITY profit)",
    });
  }

  // Base Navigator for base/location questions
  if (
    question.toLowerCase().includes("base") ||
    question.toLowerCase().includes("station") ||
    question.toLowerCase().includes("housing") ||
    question.toLowerCase().includes("school")
  ) {
    tools.push({
      tool: "Base Navigator",
      url: "/dashboard/navigator",
      reason: "Research bases with real data: weather, schools, housing costs, commute times",
    });
  }

  // TDY Copilot for TDY/travel questions
  if (
    question.toLowerCase().includes("tdy") ||
    question.toLowerCase().includes("temporary duty") ||
    question.toLowerCase().includes("per diem") ||
    question.toLowerCase().includes("travel voucher")
  ) {
    tools.push({
      tool: "TDY Copilot",
      url: "/dashboard/tdy-voucher",
      reason: "Track TDY expenses and calculate per diem reimbursements accurately",
    });
  }

  return tools;
}

// ============================================================================
// DEADLINE DETECTION
// ============================================================================

/**
 * Detect time-sensitive actions with deadlines
 */
export function detectDeadlines(
  question: string,
  userProfile: Record<string, unknown>
): ProactiveInsight[] {
  const deadlines: ProactiveInsight[] = [];

  // PCS timeline deadlines
  if (question.toLowerCase().includes("pcs")) {
    if (userProfile.pcs_date) {
      const pcsDate = new Date(userProfile.pcs_date as string);
      const daysUntilPCS = Math.floor(
        (pcsDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilPCS > 0 && daysUntilPCS < 180) {
        deadlines.push({
          type: "deadline",
          severity: daysUntilPCS < 30 ? "critical" : "high",
          category: "pcs",
          title: `PCS in ${daysUntilPCS} Days - Critical Tasks`,
          description: "You have time-sensitive PCS tasks to complete based on your timeline.",
          action: `Complete PCS checklist for ${daysUntilPCS}-day timeline`,
          actionUrl: "/dashboard/pcs-copilot",
          deadline: pcsDate.toISOString().split("T")[0],
          potentialImpact: "Avoid missing entitlements or last-minute stress",
          priority: 90,
        });
      }
    }
  }

  // Deployment prep timeline
  if (question.toLowerCase().includes("deploy")) {
    deadlines.push({
      type: "deadline",
      severity: "high",
      category: "deployment",
      title: "Pre-Deployment Financial Checklist",
      description: "Complete financial preparation 30-60 days before deployment: POA, allotments, SGLI beneficiaries, emergency fund, spouse access to accounts.",
      action: "Complete deployment financial prep checklist",
      potentialImpact: "Avoid financial emergencies during deployment",
      priority: 85,
    });
  }

  // TSP contribution limit deadline (end of year)
  const currentMonth = new Date().getMonth() + 1; // 1-12
  if (currentMonth >= 10 && question.toLowerCase().includes("tsp")) {
    // October-December
    deadlines.push({
      type: "deadline",
      severity: "medium",
      category: "financial",
      title: "Max TSP Contributions Before Year End",
      description: `You have ${13 - currentMonth} months left in 2025 to max TSP contributions ($23,500 limit). If you're behind, increase contribution % now.`,
      action: "Review TSP contributions YTD and increase % if not on track to max",
      deadline: "2025-12-31",
      potentialImpact: "Don't leave tax-advantaged space unused",
      priority: 70,
    });
  }

  return deadlines;
}

// ============================================================================
// RELATED TOPIC SUGGESTIONS
// ============================================================================

/**
 * Suggest related topics user should explore
 */
export function suggestRelatedTopics(
  question: string,
  conversationHistory: Array<{ question: string; answer: string }>
): string[] {
  const suggestions: string[] = [];

  // If asked about BAH, suggest on-base vs off-base analysis
  if (question.toLowerCase().includes("bah")) {
    suggestions.push("Should I live on-base or off-base to maximize my BAH?");
    suggestions.push("What are the hidden costs of off-base living (utilities, commute, time)?");
  }

  // If asked about TSP, suggest allocation strategy
  if (question.toLowerCase().includes("tsp")) {
    suggestions.push("How should I allocate my TSP based on my age?");
    suggestions.push("Should I contribute to Roth TSP or Traditional TSP?");
    suggestions.push("What happens to my TSP when I retire or separate?");
  }

  // If asked about deployment, suggest full financial prep
  if (question.toLowerCase().includes("deploy")) {
    suggestions.push("What's the complete pre-deployment financial checklist?");
    suggestions.push("How do I maximize SDP and CZTE during deployment?");
    suggestions.push("How do I set up my spouse financially during deployment?");
  }

  // If asked about PCS, suggest full timeline
  if (question.toLowerCase().includes("pcs")) {
    suggestions.push("What's the complete 180-day PCS financial timeline?");
    suggestions.push("Should I do a DITY move or let the government move me?");
    suggestions.push("Should I sell my house or rent it when I PCS?");
  }

  // If asked about divorce, suggest full financial picture
  if (question.toLowerCase().includes("divorce")) {
    suggestions.push("How does divorce affect my BAH and military benefits?");
    suggestions.push("What's the 10/10/10 rule for military pension division?");
    suggestions.push("How do I protect my TSP and assets during divorce?");
  }

  // If asked about retirement, suggest comprehensive planning
  if (question.toLowerCase().includes("retire")) {
    suggestions.push("What's my total retirement income (pension + TSP + VA)?");
    suggestions.push("Should I retire at 20 years or stay to 30?");
    suggestions.push("Which states have no state tax on military retirement?");
  }

  // Remove duplicates and limit to top 5
  return [...new Set(suggestions)].slice(0, 5);
}

// ============================================================================
// PROFILE-BASED PROACTIVE SUGGESTIONS
// ============================================================================

/**
 * Generate insights based on user profile data
 */
export function generateProfileBasedInsights(
  userProfile: Record<string, unknown>
): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];

  // Years of service milestones
  const years = Number(userProfile.years_of_service) || 0;

  if (years >= 10 && years < 12) {
    insights.push({
      type: "opportunity",
      severity: "high",
      category: "career",
      title: "Approaching 12-Year Mark (Continuation Pay)",
      description: "At 12 years of service in BRS, you're eligible for continuation pay (2.5x-13x monthly pay). This is typically $10,000-50,000 bonus to commit to 20 years.",
      action: "Research continuation pay eligibility and timing for your branch",
      potentialImpact: "$10,000-50,000 bonus payment",
      priority: 80,
    });
  }

  if (years >= 18 && years < 20) {
    insights.push({
      type: "deadline",
      severity: "critical",
      category: "career",
      title: "Approaching 20-Year Retirement Eligibility",
      description: "You're close to retirement eligibility! Start planning: TSP withdrawal strategy, VA disability filing (180 days before separation), retirement location (tax-free state?), post-military career.",
      action: "Create comprehensive retirement plan",
      deadline: `~${20 - years} years until retirement eligibility`,
      potentialImpact: "Maximize retirement income and benefits",
      priority: 90,
    });
  }

  // Missing profile data
  if (!userProfile.paygrade) {
    insights.push({
      type: "red_flag",
      severity: "high",
      category: "admin",
      title: "Complete Your Profile for Personalized Answers",
      description: "Your profile is missing paygrade information. I can give you MUCH better answers if I know your rank, location, and family status.",
      action: "Complete your profile",
      actionUrl: "/dashboard/profile",
      potentialImpact: "Get answers specific to YOUR situation, not generic examples",
      priority: 75,
    });
  }

  // Check if spouse might benefit from MyCAA
  const paygrade = userProfile.paygrade as string;
  if (paygrade && /E0[1-5]|W0[1-2]|O0[1-2]/.test(paygrade)) {
    if (userProfile.marital_status === "married" || userProfile.has_dependents) {
      insights.push({
        type: "opportunity",
        severity: "medium",
        category: "education",
        title: "Your Spouse Qualifies for MyCAA ($4,000 Education Benefit)",
        description: "Military spouses of E-1 to E-5, W-1 to W-2, O-1 to O-2 qualify for $4,000 in education/certification funding through MyCAA. This is FREE money for career training.",
        action: "Have your spouse apply for MyCAA benefits",
        actionUrl: "https://mycaa.militaryonesource.mil/",
        potentialImpact: "$4,000 in free education/certification training",
        priority: 70,
      });
    }
  }

  return insights;
}

// ============================================================================
// MAIN PROACTIVE ANALYSIS FUNCTION
// ============================================================================

/**
 * Main function to generate comprehensive proactive analysis
 */
export function analyzeAndProvideProactiveGuidance(
  question: string,
  userProfile: Record<string, unknown>,
  dataSources: DataSource[],
  conversationHistory: Array<{ question: string; answer: string }>
): ProactiveAnalysis {
  const opportunities = detectFinancialOpportunities(question, userProfile, dataSources);
  const redFlags = detectRedFlags(question, userProfile, dataSources);
  const profileInsights = generateProfileBasedInsights(userProfile);
  const deadlines = detectDeadlines(question, userProfile);

  // Combine all insights
  const allInsights = [...opportunities, ...redFlags, ...profileInsights, ...deadlines];

  // Sort by priority
  const sortedInsights = allInsights.sort((a, b) => b.priority - a.priority);

  // Limit to top 5 insights
  const topInsights = sortedInsights.slice(0, 5);

  // Generate suggested follow-up questions
  const suggestedQuestions = suggestRelatedTopics(question, conversationHistory);

  // Recommend tools
  const toolsToUse = recommendTools(question, userProfile);

  // Suggest resources to check
  const resources: Array<{ title: string; url: string }> = [];

  if (question.toLowerCase().includes("deploy")) {
    resources.push({
      title: "DFAS SDP Information",
      url: "https://www.dfas.mil/sdp",
    });
    resources.push({
      title: "IRS Combat Zone Tax Exclusion",
      url: "https://www.irs.gov/individuals/military/combat-zones",
    });
  }

  if (question.toLowerCase().includes("bah")) {
    resources.push({
      title: "DFAS BAH Calculator",
      url: "https://www.dfas.mil/militarymembers/payentitlements/bah/",
    });
  }

  if (question.toLowerCase().includes("tsp")) {
    resources.push({
      title: "TSP.gov Fund Performance",
      url: "https://www.tsp.gov/fund-performance/",
    });
  }

  return {
    insights: topInsights,
    suggestedQuestions: suggestedQuestions.slice(0, 5),
    toolsToUse: toolsToUse.slice(0, 3),
    resourcestoCheck: resources.slice(0, 3),
  };
}

// ============================================================================
// ISSUE DETECTION FROM QUESTION PATTERNS
// ============================================================================

/**
 * Detect potential issues from question phrasing
 */
export function detectIssuesFromQuestionPattern(question: string): ProactiveInsight[] {
  const issues: ProactiveInsight[] = [];

  // Financial distress signals
  const distressKeywords = [
    "can't afford",
    "broke",
    "running out of money",
    "paycheck to paycheck",
    "overdraft",
    "collections",
    "can't pay",
  ];

  if (distressKeywords.some((keyword) => question.toLowerCase().includes(keyword))) {
    issues.push({
      type: "red_flag",
      severity: "critical",
      category: "financial",
      title: "Financial Distress Detected - Get Help Now",
      description: "It sounds like you're in financial distress. Military OneSource offers FREE financial counseling (confidential). Also check Army Emergency Relief, Air Force Aid Society, or Navy-Marine Corps Relief Society for emergency assistance.",
      action: "Call Military OneSource (800-342-9647) for immediate financial counseling",
      actionUrl: "https://www.militaryonesource.mil/",
      potentialImpact: "Get professional help before situation worsens",
      priority: 100,
    });
  }

  // Mental health concerns
  const mentalHealthKeywords = ["depressed", "anxious", "can't sleep", "stressed", "overwhelmed"];

  if (mentalHealthKeywords.some((keyword) => question.toLowerCase().includes(keyword))) {
    issues.push({
      type: "red_flag",
      severity: "critical",
      category: "health",
      title: "Mental Health Support Available",
      description: "Financial stress often connects to mental health. Military OneSource offers 12 FREE counseling sessions (confidential, not reported to command). TRICARE also covers mental health.",
      action: "Call Military OneSource (800-342-9647) for confidential counseling",
      actionUrl: "https://www.militaryonesource.mil/",
      potentialImpact: "Get support before crisis point",
      priority: 95,
    });
  }

  // Deployment family separation concerns
  if (question.toLowerCase().includes("deploy") && question.toLowerCase().includes("spouse")) {
    issues.push({
      type: "suggestion",
      severity: "high",
      category: "relationship",
      title: "Deployment Preparation for Couples",
      description: "Deployment tests relationships - financial planning, communication expectations, POA, and support systems matter. Don't skip pre-deployment relationship prep.",
      action: "Ask: 'How do I prepare my spouse financially for deployment?'",
      potentialImpact: "Strengthen relationship, avoid deployment divorce",
      priority: 80,
    });
  }

  return issues;
}

// ============================================================================
// WRAPPER FUNCTION FOR ASK API
// ============================================================================

/**
 * Generate all proactive guidance for a question
 * Called from Ask API after generating main answer
 */
export function generateProactiveGuidance(
  question: string,
  userProfile: Record<string, unknown>,
  dataSources: DataSource[],
  conversationHistory: Array<{ question: string; answer: string }> = []
): ProactiveAnalysis {
  const baseAnalysis = analyzeAndProvideProactiveGuidance(
    question,
    userProfile,
    dataSources,
    conversationHistory
  );

  const issueDetection = detectIssuesFromQuestionPattern(question);

  // Merge insights from both analyses
  const allInsights = [...baseAnalysis.insights, ...issueDetection];

  return {
    ...baseAnalysis,
    insights: allInsights.sort((a, b) => b.priority - a.priority).slice(0, 5),
  };
}

