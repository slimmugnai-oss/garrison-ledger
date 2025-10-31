/**
 * ASK COMPARISON ENGINE
 *
 * Provides side-by-side comparison analysis for:
 * - Military bases (climate, housing costs, schools, amenities)
 * - Benefits (GI Bill options, TSP funds, insurance plans)
 * - Career paths (Enlisted vs Officer, Active vs Reserve, Branch comparison)
 * - Financial options (Roth vs Traditional TSP, On-base vs Off-base housing, etc.)
 */

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ============================================================================
// COMPARISON TYPES
// ============================================================================

export type ComparisonType =
  | "bases"
  | "benefits"
  | "career_paths"
  | "financial_options"
  | "education_programs"
  | "retirement_systems";

export interface ComparisonItem {
  id: string;
  name: string;
  category: string;
  pros: string[];
  cons: string[];
  costs: Array<{ label: string; amount: string | number }>;
  requirements: string[];
  timeline: string;
  bestFor: string[];
  score: number; // 0-100 overall score based on user situation
}

export interface ComparisonResult {
  comparisonType: ComparisonType;
  items: ComparisonItem[];
  recommendation: string;
  reasoning: string[];
  additionalConsiderations: string[];
}

// ============================================================================
// BASE COMPARISON
// ============================================================================

export async function compareBases(
  baseIds: string[],
  userPreferences?: {
    climate_preference?: string;
    max_housing_budget?: number;
    school_priority?: boolean;
    outdoor_activities?: boolean;
  }
): Promise<ComparisonResult> {
  try {
    logger.info(`[ComparisonEngine] Comparing bases: ${baseIds.join(", ")}`);

    // Fetch base data
    const { data: bases, error } = await supabaseAdmin
      .from("military_bases")
      .select(
        `
        id,
        base_name,
        branch,
        state,
        location_display,
        installation_type,
        base_population
      `
      )
      .in("id", baseIds);

    if (error || !bases || bases.length === 0) {
      throw new Error("Failed to fetch base data");
    }

    // Fetch external data (weather, housing, schools) for each base
    const comparisonItems: ComparisonItem[] = [];

    for (const base of bases) {
      // Fetch external data from cache
      const { data: externalData } = await supabaseAdmin
        .from("base_external_data_cache")
        .select("weather_data, housing_data, schools_data")
        .eq("base_id", base.id)
        .order("cached_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Build comparison item
      const weatherData = externalData?.weather_data as any;
      const housingData = externalData?.housing_data as any;
      const schoolsData = externalData?.schools_data as any;

      const avgTemp = weatherData?.summary?.avgTempF || "Unknown";
      const medianRent = housingData?.market_summary?.medianRent || "Unknown";
      const avgSchoolRating = schoolsData?.summary?.avgRating || "Unknown";

      const pros: string[] = [];
      const cons: string[] = [];

      // Climate pros/cons
      if (typeof avgTemp === "number") {
        if (avgTemp > 70 && avgTemp < 85) {
          pros.push(`Mild climate (avg ${avgTemp}°F)`);
        } else if (avgTemp > 90) {
          cons.push(`Hot climate (avg ${avgTemp}°F)`);
        } else if (avgTemp < 50) {
          cons.push(`Cold climate (avg ${avgTemp}°F)`);
        }
      }

      // Housing pros/cons
      if (typeof medianRent === "number") {
        if (medianRent < 1500) {
          pros.push(`Affordable housing (median $${medianRent}/month)`);
        } else if (medianRent > 2500) {
          cons.push(`Expensive housing (median $${medianRent}/month)`);
        }
      }

      // School pros/cons
      if (typeof avgSchoolRating === "number") {
        if (avgSchoolRating >= 8) {
          pros.push(`Excellent schools (avg rating ${avgSchoolRating}/10)`);
        } else if (avgSchoolRating < 6) {
          cons.push(`Below-average schools (avg rating ${avgSchoolRating}/10)`);
        }
      }

      // Calculate overall score
      let score = 70; // Base score
      if (avgSchoolRating >= 8) score += 10;
      if (medianRent < 1500) score += 10;
      if (avgTemp > 60 && avgTemp < 80) score += 10;
      score = Math.min(score, 100);

      comparisonItems.push({
        id: base.id,
        name: base.base_name,
        category: "military_base",
        pros,
        cons,
        costs: [
          { label: "Median Rent", amount: medianRent },
          { label: "Typical BAH", amount: "Varies by rank" },
        ],
        requirements: [`Must receive PCS orders to ${base.base_name}`],
        timeline: "PCS timing varies (30-90 days notice typical)",
        bestFor: generateBestForList(pros, cons),
        score,
      });
    }

    // Generate recommendation
    const topBase = comparisonItems.sort((a, b) => b.score - a.score)[0];
    const recommendation = `Based on overall quality-of-life factors, ${topBase.name} scores highest (${topBase.score}/100).`;

    const reasoning = [
      `Climate, housing costs, school quality, and amenities were considered.`,
      `${topBase.name} offers: ${topBase.pros.slice(0, 3).join(", ")}.`,
    ];

    return {
      comparisonType: "bases",
      items: comparisonItems,
      recommendation,
      reasoning,
      additionalConsiderations: [
        "Your personal preferences matter more than scores - visit bases if possible before PCS.",
        "Use House-Hunting Trip (HHT) to explore top choices.",
        "Join '[Base Name] Newcomers' Facebook groups for insider perspectives.",
      ],
    };
  } catch (error) {
    logger.error("[ComparisonEngine] Base comparison failed:", error);
    throw new Error("Base comparison failed");
  }
}

// ============================================================================
// BENEFIT COMPARISON (TSP, GI Bill, Insurance, etc.)
// ============================================================================

export async function compareBenefits(
  benefitType: "gi_bill" | "tsp_funds" | "life_insurance" | "retirement_systems",
  userSituation?: {
    age?: number;
    years_to_retirement?: number;
    years_of_service?: number;
    plans_20_year_retirement?: boolean;
    risk_tolerance?: "low" | "medium" | "high";
    has_dependents?: boolean;
  }
): Promise<ComparisonResult> {
  logger.info(`[ComparisonEngine] Comparing ${benefitType}`);

  if (benefitType === "tsp_funds") {
    return compareTSPFunds(userSituation);
  } else if (benefitType === "gi_bill") {
    return compareGIBillOptions(userSituation);
  } else if (benefitType === "retirement_systems") {
    return compareRetirementSystems(userSituation as any); // Type cast for flexibility
  }

  // Default fallback
  return {
    comparisonType: "benefits",
    items: [],
    recommendation: "Comparison not yet implemented for this benefit type.",
    reasoning: [],
    additionalConsiderations: [],
  };
}

// ============================================================================
// TSP FUND COMPARISON
// ============================================================================

function compareTSPFunds(
  userSituation?: {
    age?: number;
    years_to_retirement?: number;
    risk_tolerance?: "low" | "medium" | "high";
  }
): ComparisonResult {
  const items: ComparisonItem[] = [
    {
      id: "c-fund",
      name: "C Fund (S&P 500)",
      category: "tsp_fund",
      pros: [
        "Highest long-term returns (10-11% annually)",
        "Tracks America's 500 largest companies",
        "Best for investors under 50",
        "Simple, diversified",
      ],
      cons: [
        "Volatility (can drop 30-40% in crashes)",
        "Not suitable for money needed in <5 years",
        "Requires stomach for market swings",
      ],
      costs: [{ label: "Expense Ratio", amount: "0.065%" }],
      requirements: ["Time horizon 10+ years", "Tolerance for volatility"],
      timeline: "Long-term (10-40 years)",
      bestFor: [
        "Age <50",
        "10+ years to retirement",
        "High risk tolerance",
        "Want maximum growth",
      ],
      score: userSituation?.years_to_retirement && userSituation.years_to_retirement > 10 ? 95 : 70,
    },
    {
      id: "g-fund",
      name: "G Fund (Government Securities)",
      category: "tsp_fund",
      pros: [
        "Zero risk of loss",
        "Guaranteed positive return",
        "Good for emergency fund portion",
      ],
      cons: [
        "Lowest returns (2-3% annually)",
        "Loses to inflation long-term",
        "Opportunity cost: $500K+ vs C Fund over 30 years",
      ],
      costs: [{ label: "Expense Ratio", amount: "0.065%" }],
      requirements: ["None"],
      timeline: "Short-term (<2 years)",
      bestFor: [
        "Money needed in <2 years",
        "Emergency fund",
        "Can't tolerate ANY risk",
      ],
      score: userSituation?.years_to_retirement && userSituation.years_to_retirement < 3 ? 80 : 30,
    },
    {
      id: "l-2060",
      name: "L 2060 Fund (Lifecycle)",
      category: "tsp_fund",
      pros: [
        "Automatic rebalancing",
        "Diversified across all 5 funds",
        "Set-it-and-forget-it simplicity",
        "Gradually becomes conservative as you age",
      ],
      cons: [
        "Slightly lower returns than 100% C Fund",
        "Includes G/F funds (drag on performance)",
        "Less control over exact allocation",
      ],
      costs: [{ label: "Expense Ratio", amount: "0.065%" }],
      requirements: ["Planning to retire around 2060"],
      timeline: "Long-term (30-40 years)",
      bestFor: [
        "Age <40",
        "Want simplicity",
        "Don't want to manage allocations",
      ],
      score: 85,
    },
  ];

  const topFund = items.sort((a, b) => b.score - a.score)[0];

  return {
    comparisonType: "benefits",
    items,
    recommendation: `For your situation, ${topFund.name} is the best choice (score: ${topFund.score}/100).`,
    reasoning: [
      userSituation?.years_to_retirement && userSituation.years_to_retirement > 10
        ? "With 10+ years to retirement, stock market exposure is optimal."
        : "Consider your time horizon and risk tolerance.",
      "C Fund historically outperforms G Fund by $500,000+ over 30-year career.",
    ],
    additionalConsiderations: [
      "You can change TSP allocation anytime (log into TSP.gov)",
      "Rebalance annually to maintain target allocation",
      "Use TSP Modeler tool to project growth under different scenarios",
    ],
  };
}

// ============================================================================
// GI BILL OPTIONS COMPARISON
// ============================================================================

function compareGIBillOptions(userSituation?: { has_dependents?: boolean }): ComparisonResult {
  const items: ComparisonItem[] = [
    {
      id: "post-911",
      name: "Post-9/11 GI Bill",
      category: "education_benefit",
      pros: [
        "100% tuition at public universities",
        "Housing allowance (E-5 BAH rate for school's ZIP)",
        "$1,000/year books stipend",
        "Best for traditional 4-year degree",
      ],
      cons: [
        "Expires 15 years after separation",
        "Housing only paid during school months (not summer)",
        "Private school cap: $28,937/year",
      ],
      costs: [{ label: "Cost to You", amount: "$0" }],
      requirements: ["90 days active duty (post-9/11) or 36 months total"],
      timeline: "36 months of benefits",
      bestFor: [
        "Traditional college (4-year degree)",
        "Schools in expensive cities (high housing allowance)",
        "Full-time student",
      ],
      score: 95,
    },
    {
      id: "montgomery",
      name: "Montgomery GI Bill (MGIB)",
      category: "education_benefit",
      pros: [
        "$2,417/month cash payment",
        "Can use for very cheap schools and pocket difference",
        "Good for vocational/trade schools",
      ],
      cons: [
        "Costs $1,200 upfront (first 12 months of service)",
        "No housing allowance",
        "No books stipend",
        "Post-9/11 is better for 95% of people",
      ],
      costs: [{ label: "Buy-In Cost", amount: "$1,200" }],
      requirements: ["36 months active duty"],
      timeline: "36 months of benefits",
      bestFor: [
        "Very cheap schools (<$5,000/year tuition)",
        "Online-only programs",
        "Vocational/trade certifications",
      ],
      score: 40,
    },
    {
      id: "transfer",
      name: "GI Bill Transfer to Dependents",
      category: "education_benefit",
      pros: [
        "Give education benefit to spouse or kids",
        "Same benefits as Post-9/11 (tuition + housing)",
        "Can split 36 months among multiple dependents",
      ],
      cons: [
        "Requires 4+ year service commitment",
        "Must transfer while still in service (can't transfer after separation)",
        "You give up YOUR education benefit",
      ],
      costs: [{ label: "Service Commitment", amount: "4+ years" }],
      requirements: [
        "6+ years service completed",
        "Commit to 4 more years",
        "Transfer while still serving",
      ],
      timeline: "36 months total (split among dependents)",
      bestFor: [
        "Staying in military 10+ years anyway",
        "Spouse/kids need college funding",
        "You already have degree or don't plan to use GI Bill",
      ],
      score: userSituation?.has_dependents ? 75 : 30,
    },
  ];

  return {
    comparisonType: "benefits",
    items,
    recommendation: "Post-9/11 GI Bill is best for 95% of service members.",
    reasoning: [
      "Covers full tuition + housing + books (worth $100,000-$300,000)",
      "Most flexible and valuable option",
      "Montgomery GI Bill only better for very cheap schools",
      "Transfer only if staying in long-term and dependents need education",
    ],
    additionalConsiderations: [
      "Use Tuition Assistance (TA) while active duty - save GI Bill for after separation",
      "GI Bill expires 15 years after separation - don't let it go to waste",
      "Yellow Ribbon schools cover excess tuition (no out-of-pocket)",
    ],
  };
}

// ============================================================================
// RETIREMENT SYSTEM COMPARISON (BRS vs High-3)
// ============================================================================

function compareRetirementSystems(
  userSituation?: {
    years_of_service?: number;
    plans_20_year_retirement?: boolean;
  }
): ComparisonResult {
  const items: ComparisonItem[] = [
    {
      id: "brs",
      name: "Blended Retirement System (BRS)",
      category: "retirement_system",
      pros: [
        "TSP match (5% = $87,000-$150,000 lifetime value)",
        "Portable (keep TSP if you leave before 20 years)",
        "Continuation Pay at year 12 ($10,000-$91,000)",
        "Better if you might not do 20 years",
      ],
      cons: [
        "Lower pension multiplier (2% vs 2.5% per year)",
        "E-7 at 20 years: $520/month LESS pension than High-3",
        "Requires discipline (must contribute 5%+ to TSP)",
      ],
      costs: [{ label: "TSP Contribution Required", amount: "5% minimum (to get match)" }],
      requirements: ["Joined after 2018 OR opted in before 2018"],
      timeline: "Lifetime retirement benefit",
      bestFor: [
        "Uncertain about 20-year career",
        "Disciplined TSP investor",
        "Value portability and flexibility",
      ],
      score: userSituation?.plans_20_year_retirement ? 75 : 90,
    },
    {
      id: "high-3",
      name: "Legacy High-3 Retirement",
      category: "retirement_system",
      pros: [
        "Higher pension (2.5% per year = $520/month more at 20 years for E-7)",
        "Guaranteed income for life",
        "Simple (no TSP management required)",
        "Better if you're 100% doing 20 years",
      ],
      cons: [
        "No TSP match ($87,000-$150,000 lost opportunity)",
        "All-or-nothing (get $0 if separate before 20 years)",
        "No continuation pay",
        "Less flexible",
      ],
      costs: [{ label: "Cost to You", amount: "$0" }],
      requirements: ["Joined before 2006 OR 2006-2017 and stayed in Legacy"],
      timeline: "Pension starts at 20+ years service",
      bestFor: [
        "100% certain you'll do 20 years",
        "Want guaranteed pension (not TSP growth)",
        "Risk-averse",
      ],
      score: userSituation?.plans_20_year_retirement ? 85 : 50,
    },
  ];

  return {
    comparisonType: "retirement_systems",
    items,
    recommendation:
      "BRS is better if you're uncertain about 20-year career. Legacy High-3 is better if you're 100% doing 20 years.",
    reasoning: [
      "BRS gives you something even if you leave before 20 (TSP match)",
      "High-3 gives higher pension if you stay exactly 20 years",
      "BRS + disciplined TSP investing can outperform High-3 long-term",
    ],
    additionalConsiderations: [
      "If you're under BRS: Contribute AT LEAST 5% to TSP to get full match",
      "Invest TSP in C Fund (stocks) for long-term growth",
      "Use TSP Modeler to project both scenarios",
    ],
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateBestForList(pros: string[], cons: string[]): string[] {
  const bestFor: string[] = [];

  // Simple logic based on pros/cons
  if (pros.some((p) => p.includes("Affordable"))) {
    bestFor.push("Budget-conscious families");
  }
  if (pros.some((p) => p.includes("Excellent schools"))) {
    bestFor.push("Families with school-age children");
  }
  if (pros.some((p) => p.includes("Mild climate"))) {
    bestFor.push("Prefer moderate weather");
  }
  if (cons.length < 2) {
    bestFor.push("Most service members");
  }

  return bestFor.length > 0 ? bestFor : ["Depends on personal priorities"];
}

/**
 * Main comparison orchestrator - routes to specific comparison type
 */
export async function runComparison(
  comparisonType: ComparisonType,
  items: string[],
  userContext?: Record<string, unknown>
): Promise<ComparisonResult> {
  logger.info(`[ComparisonEngine] Running ${comparisonType} comparison`);

  switch (comparisonType) {
    case "bases":
      return compareBases(items, userContext as any);

    case "benefits":
    case "education_programs":
      return compareBenefits("gi_bill", userContext as any);

    case "retirement_systems":
      return compareRetirementSystems(userContext as any);

    case "career_paths":
    case "financial_options":
    default:
      return {
        comparisonType,
        items: [],
        recommendation: "Comparison not yet implemented for this type.",
        reasoning: [],
        additionalConsiderations: [],
      };
  }
}

