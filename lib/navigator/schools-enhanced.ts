/**
 * ENHANCED SCHOOLS INTELLIGENCE
 *
 * Comprehensive school analysis by grade level with PCS flexibility scoring
 * Military audience: Multiple options critical for frequent relocations
 */

import type { School, KidsGrade } from "@/app/types/navigator";

export interface SchoolsByGrade {
  elementary: {
    count: number;
    schools: School[];
    avg_rating: number;
    top_picks: School[]; // Top 3
  };
  middle: {
    count: number;
    schools: School[];
    avg_rating: number;
    top_picks: School[];
  };
  high: {
    count: number;
    schools: School[];
    avg_rating: number;
    top_picks: School[];
  };
  private: {
    count: number;
    schools: School[];
    avg_rating: number;
    note: string;
  };
}

export interface DistrictInfo {
  name: string;
  rating: number; // Estimated from school averages
  total_schools: number;
  special_programs: string[];
}

export interface SchoolsIntelligence {
  // Summary
  total_schools: number;
  overall_avg_rating: number;
  
  // By grade level
  by_grade: SchoolsByGrade;
  
  // District
  district: DistrictInfo;
  
  // PCS Flexibility Analysis
  pcs_flexibility: {
    score: number; // 0-100 (100 = many excellent options)
    elementary_options: number; // Good schools (7+ rating)
    middle_options: number;
    high_options: number;
    flexibility_note: string;
  };
  
  // Key insights
  best_grade_level: "elementary" | "middle" | "high" | "all";
  weakest_grade_level: "elementary" | "middle" | "high" | "none";
  
  // Summary text
  executive_summary: string; // BLUF style
  detailed_analysis: string; // 2-3 sentences per grade level
}

/**
 * Analyze schools comprehensively by grade level
 */
export function analyzeSchoolsComprehensive(
  schools: School[],
  kidsGrades: KidsGrade[]
): SchoolsIntelligence {
  console.log(`[SCHOOLS_ENHANCED] Analyzing ${schools.length} schools comprehensively`);

  // Categorize by grade level
  const elementary = categorizeByGrade(schools, ["K", "1", "2", "3", "4", "5", "PK", "elementary"]);
  const middle = categorizeByGrade(schools, ["6", "7", "8", "middle"]);
  const high = categorizeByGrade(schools, ["9", "10", "11", "12", "high"]);
  const privateSchools = schools.filter((s) => s.type === "private");

  // Calculate averages
  const elemAvg = calculateAverage(elementary);
  const middleAvg = calculateAverage(middle);
  const highAvg = calculateAverage(high);
  const privateAvg = calculateAverage(privateSchools);
  const overallAvg = calculateAverage(schools);

  // Get top picks per level
  const by_grade: SchoolsByGrade = {
    elementary: {
      count: elementary.length,
      schools: elementary,
      avg_rating: elemAvg,
      top_picks: elementary.sort((a, b) => b.rating - a.rating).slice(0, 3),
    },
    middle: {
      count: middle.length,
      schools: middle,
      avg_rating: middleAvg,
      top_picks: middle.sort((a, b) => b.rating - a.rating).slice(0, 3),
    },
    high: {
      count: high.length,
      schools: high,
      avg_rating: highAvg,
      top_picks: high.sort((a, b) => b.rating - a.rating).slice(0, 3),
    },
    private: {
      count: privateSchools.length,
      schools: privateSchools,
      avg_rating: privateAvg,
      note:
        privateSchools.length > 0
          ? `${privateSchools.length} private school options available`
          : "No private schools in immediate area",
    },
  };

  // Estimate district info
  const district = estimateDistrictInfo(schools);

  // Calculate PCS flexibility score
  const pcsFlexibility = calculatePCSFlexibility(by_grade, kidsGrades);

  // Identify best and weakest grade levels
  const bestGrade = identifyBestGradeLevel(by_grade);
  const weakestGrade = identifyWeakestGradeLevel(by_grade);

  // Generate summaries
  const executiveSummary = generateSchoolsExecutiveSummary(
    schools.length,
    overallAvg,
    by_grade,
    kidsGrades,
    pcsFlexibility
  );

  const detailedAnalysis = generateDetailedSchoolsAnalysis(by_grade, kidsGrades);

  return {
    total_schools: schools.length,
    overall_avg_rating: overallAvg,
    by_grade,
    district,
    pcs_flexibility: pcsFlexibility,
    best_grade_level: bestGrade,
    weakest_grade_level: weakestGrade,
    executive_summary: executiveSummary,
    detailed_analysis: detailedAnalysis,
  };
}

/**
 * Categorize schools by grade level keywords
 */
function categorizeByGrade(schools: School[], keywords: string[]): School[] {
  return schools.filter((school) => {
    const grades = school.grades.toLowerCase();
    return keywords.some((kw) => grades.includes(kw.toLowerCase()));
  });
}

/**
 * Calculate average rating for school array
 */
function calculateAverage(schools: School[]): number {
  if (schools.length === 0) return 0;
  const sum = schools.reduce((acc, s) => acc + s.rating, 0);
  return Math.round((sum / schools.length) * 10) / 10;
}

/**
 * Estimate district information from schools
 */
function estimateDistrictInfo(schools: School[]): DistrictInfo {
  if (schools.length === 0) {
    return {
      name: "District information unavailable",
      rating: 0,
      total_schools: 0,
      special_programs: [],
    };
  }

  // Extract most common district name (if available in address/data)
  // For now, estimate from ZIP/location
  const avgRating = calculateAverage(schools);

  const specialPrograms: string[] = [];
  
  // Detect special programs from school names/types
  const hasSTEM = schools.some((s) => s.name.toLowerCase().includes("stem") || s.name.toLowerCase().includes("science"));
  const hasArts = schools.some((s) => s.name.toLowerCase().includes("arts") || s.name.toLowerCase().includes("music"));
  const hasMagnet = schools.some((s) => s.name.toLowerCase().includes("magnet"));
  const hasIB = schools.some((s) => s.name.toLowerCase().includes("ib") || s.name.toLowerCase().includes("international baccalaureate"));

  if (hasSTEM) specialPrograms.push("STEM programs");
  if (hasArts) specialPrograms.push("Arts programs");
  if (hasMagnet) specialPrograms.push("Magnet schools");
  if (hasIB) specialPrograms.push("IB programs");

  return {
    name: "Local school district", // Would need additional API for exact name
    rating: avgRating,
    total_schools: schools.length,
    special_programs: specialPrograms,
  };
}

/**
 * Calculate PCS flexibility score
 * Measures how many good options available per grade level
 * Critical for military families who may need to switch schools mid-year
 */
function calculatePCSFlexibility(
  byGrade: SchoolsByGrade,
  kidsGrades: KidsGrade[]
): SchoolsIntelligence["pcs_flexibility"] {
  const hasKids = kidsGrades.length > 0;

  if (!hasKids) {
    return {
      score: 100,
      elementary_options: countGoodSchools(byGrade.elementary.schools),
      middle_options: countGoodSchools(byGrade.middle.schools),
      high_options: countGoodSchools(byGrade.high.schools),
      flexibility_note: "Not applicable - no children specified",
    };
  }

  const elemOptions = countGoodSchools(byGrade.elementary.schools);
  const middleOptions = countGoodSchools(byGrade.middle.schools);
  const highOptions = countGoodSchools(byGrade.high.schools);

  // Calculate score based on relevant grade levels
  let relevantOptions = 0;
  let maxPossible = 0;

  if (kidsGrades.includes("elem")) {
    relevantOptions += elemOptions;
    maxPossible += 5; // 5 good schools = perfect
  }
  if (kidsGrades.includes("middle")) {
    relevantOptions += middleOptions;
    maxPossible += 3;
  }
  if (kidsGrades.includes("high")) {
    relevantOptions += highOptions;
    maxPossible += 3;
  }

  const score = maxPossible > 0 ? Math.min(100, Math.round((relevantOptions / maxPossible) * 100)) : 0;

  let note = "";
  if (score >= 80) {
    note = "Excellent flexibility - multiple good options for PCS transitions and mid-year enrollments";
  } else if (score >= 60) {
    note = "Good flexibility - adequate backup options available";
  } else if (score >= 40) {
    note = "Moderate flexibility - limited backup options";
  } else {
    note = "Limited flexibility - few quality alternatives if primary school unavailable";
  }

  return {
    score,
    elementary_options: elemOptions,
    middle_options: middleOptions,
    high_options: highOptions,
    flexibility_note: note,
  };
}

/**
 * Count schools with 7+ rating (good options)
 */
function countGoodSchools(schools: School[]): number {
  return schools.filter((s) => s.rating >= 7).length;
}

/**
 * Identify best grade level
 */
function identifyBestGradeLevel(byGrade: SchoolsByGrade): "elementary" | "middle" | "high" | "all" {
  const { elementary, middle, high } = byGrade;

  if (elementary.avg_rating >= 8 && middle.avg_rating >= 8 && high.avg_rating >= 8) {
    return "all";
  }

  const ratings = [
    { level: "elementary" as const, rating: elementary.avg_rating },
    { level: "middle" as const, rating: middle.avg_rating },
    { level: "high" as const, rating: high.avg_rating },
  ];

  ratings.sort((a, b) => b.rating - a.rating);
  return ratings[0].level;
}

/**
 * Identify weakest grade level
 */
function identifyWeakestGradeLevel(byGrade: SchoolsByGrade): "elementary" | "middle" | "high" | "none" {
  const { elementary, middle, high } = byGrade;

  // If all are good, no weak level
  if (elementary.avg_rating >= 7 && middle.avg_rating >= 7 && high.avg_rating >= 7) {
    return "none";
  }

  const ratings = [
    { level: "elementary" as const, rating: elementary.avg_rating },
    { level: "middle" as const, rating: middle.avg_rating },
    { level: "high" as const, rating: high.avg_rating },
  ];

  ratings.sort((a, b) => a.rating - b.rating);
  return ratings[0].level;
}

/**
 * Generate executive summary for schools
 */
function generateSchoolsExecutiveSummary(
  total: number,
  avgRating: number,
  byGrade: SchoolsByGrade,
  kidsGrades: KidsGrade[],
  pcsFlexibility: SchoolsIntelligence["pcs_flexibility"]
): string {
  if (total === 0) {
    return "No school data available. Recommend researching school district directly.";
  }

  const hasKids = kidsGrades.length > 0;
  let summary = `${total} schools nearby with ${avgRating.toFixed(1)}/10 average rating. `;

  if (hasKids) {
    // Mention relevant grade levels
    if (kidsGrades.includes("elem") && byGrade.elementary.count > 0) {
      summary += `${byGrade.elementary.count} elementary schools (avg ${byGrade.elementary.avg_rating.toFixed(1)}/10). `;
    }
    if (kidsGrades.includes("middle") && byGrade.middle.count > 0) {
      summary += `${byGrade.middle.count} middle schools (avg ${byGrade.middle.avg_rating.toFixed(1)}/10). `;
    }
    if (kidsGrades.includes("high") && byGrade.high.count > 0) {
      summary += `${byGrade.high.count} high schools (avg ${byGrade.high.avg_rating.toFixed(1)}/10). `;
    }

    // PCS flexibility
    summary += `PCS flexibility: ${pcsFlexibility.score >= 80 ? "EXCELLENT" : pcsFlexibility.score >= 60 ? "GOOD" : "MODERATE"} - ${pcsFlexibility.flexibility_note}`;
  } else {
    summary += `${byGrade.elementary.count} elementary, ${byGrade.middle.count} middle, ${byGrade.high.count} high schools available.`;
  }

  return summary;
}

/**
 * Generate detailed analysis by grade level
 */
function generateDetailedSchoolsAnalysis(byGrade: SchoolsByGrade, kidsGrades: KidsGrade[]): string {
  const parts: string[] = [];

  // Elementary analysis
  if (kidsGrades.length === 0 || kidsGrades.includes("elem")) {
    if (byGrade.elementary.count > 0) {
      const topSchool = byGrade.elementary.top_picks[0];
      if (topSchool && topSchool.rating >= 8) {
        parts.push(
          `Elementary: ${topSchool.name} leads with ${topSchool.rating.toFixed(1)}/10 rating, ${byGrade.elementary.count - 1} additional options available.`
        );
      } else if (byGrade.elementary.count >= 3) {
        parts.push(
          `Elementary: ${byGrade.elementary.count} schools, average ${byGrade.elementary.avg_rating.toFixed(1)}/10, multiple options for flexibility.`
        );
      } else {
        parts.push(
          `Elementary: Limited options (${byGrade.elementary.count} schools), consider nearby districts.`
        );
      }
    }
  }

  // Middle school analysis
  if (kidsGrades.length === 0 || kidsGrades.includes("middle")) {
    if (byGrade.middle.count > 0) {
      const topSchool = byGrade.middle.top_picks[0];
      if (topSchool && topSchool.rating >= 8) {
        parts.push(
          `Middle: ${topSchool.name} (${topSchool.rating.toFixed(1)}/10) highly rated.`
        );
      } else {
        parts.push(
          `Middle: ${byGrade.middle.count} schools, ${byGrade.middle.avg_rating.toFixed(1)}/10 average.`
        );
      }
    }
  }

  // High school analysis
  if (kidsGrades.length === 0 || kidsGrades.includes("high")) {
    if (byGrade.high.count > 0) {
      const topSchool = byGrade.high.top_picks[0];
      if (topSchool && topSchool.rating >= 8) {
        parts.push(`High: ${topSchool.name} (${topSchool.rating.toFixed(1)}/10) strong option.`);
      } else {
        parts.push(`High: ${byGrade.high.count} schools, ${byGrade.high.avg_rating.toFixed(1)}/10 average.`);
      }
    }
  }

  // Private school note
  if (byGrade.private.count > 0) {
    parts.push(`${byGrade.private.count} private school alternatives available.`);
  }

  return parts.join(" ");
}

