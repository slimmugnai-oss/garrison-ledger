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

  // Calculate UNIQUE schools per level (a K-12 school counts as 1, not 3)
  const uniqueElementary = [...new Map(elementary.map(s => [s.name, s])).values()];
  const uniqueMiddle = [...new Map(middle.map(s => [s.name, s])).values()];
  const uniqueHigh = [...new Map(high.map(s => [s.name, s])).values()];
  const uniquePrivate = [...new Map(privateSchools.map(s => [s.name, s])).values()];

  // Calculate averages
  const elemAvg = calculateAverage(uniqueElementary);
  const middleAvg = calculateAverage(uniqueMiddle);
  const highAvg = calculateAverage(uniqueHigh);
  const privateAvg = calculateAverage(uniquePrivate);
  const overallAvg = calculateAverage(schools);

  // Get top picks per level (from unique schools)
  const by_grade: SchoolsByGrade = {
    elementary: {
      count: uniqueElementary.length,
      schools: uniqueElementary,
      avg_rating: elemAvg,
      top_picks: [...uniqueElementary].sort((a, b) => b.rating - a.rating).slice(0, 50), // Show all, let UI handle display
    },
    middle: {
      count: uniqueMiddle.length,
      schools: uniqueMiddle,
      avg_rating: middleAvg,
      top_picks: [...uniqueMiddle].sort((a, b) => b.rating - a.rating).slice(0, 50),
    },
    high: {
      count: uniqueHigh.length,
      schools: uniqueHigh,
      avg_rating: highAvg,
      top_picks: [...uniqueHigh].sort((a, b) => b.rating - a.rating).slice(0, 50),
    },
    private: {
      count: uniquePrivate.length,
      schools: uniquePrivate,
      avg_rating: privateAvg,
      note:
        uniquePrivate.length > 0
          ? `${uniquePrivate.length} private school${uniquePrivate.length !== 1 ? 's' : ''} available`
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
 * Parse grade range from string like "9-12" or "K-5" or "PK-5"
 * Returns the lowest and highest numeric grade (0 = K/PK, -1 = PK)
 */
function parseGradeRange(gradeStr: string): { min: number; max: number } {
  const cleaned = gradeStr.trim().toUpperCase();
  
  // Handle PK (Pre-K)
  if (cleaned.includes("PK")) {
    const match = cleaned.match(/PK-?(\d+)/);
    if (match) {
      return { min: -1, max: parseInt(match[1]) };
    }
    return { min: -1, max: -1 }; // PK only
  }
  
  // Handle K (Kindergarten)
  if (cleaned.includes("K")) {
    const match = cleaned.match(/K-?(\d+)/);
    if (match) {
      return { min: 0, max: parseInt(match[1]) };
    }
    return { min: 0, max: 0 }; // K only
  }
  
  // Handle numeric ranges like "9-12" or "6-8"
  const numericMatch = cleaned.match(/(\d+)-(\d+)/);
  if (numericMatch) {
    return {
      min: parseInt(numericMatch[1]),
      max: parseInt(numericMatch[2]),
    };
  }
  
  // Single grade number
  const singleMatch = cleaned.match(/(\d+)/);
  if (singleMatch) {
    const num = parseInt(singleMatch[1]);
    return { min: num, max: num };
  }
  
  // Fallback
  return { min: -999, max: -999 };
}

/**
 * Categorize schools by grade level with STRICT grade-range checking
 * Prevents high schools (9-12) from appearing in elementary (K-5)
 */
function categorizeByGrade(schools: School[], keywords: string[]): School[] {
  return schools.filter((school) => {
    const grades = school.grades;
    const name = school.name.toLowerCase();
    
    // Parse actual grade range
    const range = parseGradeRange(grades);
    
    // Check if this is for ELEMENTARY (K-5)
    if (keywords.includes("K") || keywords.includes("elementary")) {
      // Elementary should ONLY include schools that serve K-5
      // If school starts at grade 6 or higher, EXCLUDE IT
      if (range.min >= 6) {
        return false; // Too old for elementary
      }
      // If school ONLY serves high school (9-12), EXCLUDE IT
      if (range.min >= 9) {
        return false; // Definitely not elementary
      }
      // If school name says "high school" or "high", exclude unless it's K-12
      if ((name.includes("high school") || name.includes(" high ")) && range.min >= 9) {
        return false;
      }
      // Must serve at least some elementary grades (K-5)
      if (range.max >= 5 && range.min <= 5) {
        return true;
      }
      if (range.min <= 5) {
        return true;
      }
      return false;
    }
    
    // Check if this is for MIDDLE (6-8)
    if (keywords.includes("6") || keywords.includes("middle")) {
      // If school ONLY serves high school (9-12), EXCLUDE IT
      if (range.min >= 9) {
        return false; // Too old for middle
      }
      // If school name says "high school" or "high", exclude unless it serves 6-8
      if ((name.includes("high school") || name.includes(" high ")) && range.min >= 9) {
        return false;
      }
      // Must serve at least some middle grades (6-8)
      if (range.min <= 8 && range.max >= 6) {
        return true;
      }
      return false;
    }
    
    // Check if this is for HIGH SCHOOL (9-12)
    if (keywords.includes("9") || keywords.includes("high")) {
      // If school ONLY serves elementary/middle (K-8), EXCLUDE IT
      if (range.max < 9) {
        return false; // Too young for high school
      }
      // Must serve at least some high school grades (9-12)
      if (range.min <= 12 && range.max >= 9) {
        return true;
      }
      return false;
    }
    
    // Default: check if grades match keywords (fallback)
    const gradesLower = grades.toLowerCase();
    const gradesMatch = keywords.some((kw) => gradesLower.includes(kw.toLowerCase()));
    return gradesMatch;
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
 * Extract district information from schools
 * Uses actual district data from SchoolDigger API
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

  // District name is now filtered by primary district in fetchSchoolsByZip
  // All schools should be from same district
  const avgRating = calculateAverage(schools);

  const specialPrograms: string[] = [];
  
  // Detect special programs from school names/types
  const hasSTEM = schools.some((s) => s.name.toLowerCase().includes("stem") || s.name.toLowerCase().includes("science"));
  const hasArts = schools.some((s) => s.name.toLowerCase().includes("arts") || s.name.toLowerCase().includes("music"));
  const hasMagnet = schools.some((s) => s.name.toLowerCase().includes("magnet"));
  const hasIB = schools.some((s) => s.name.toLowerCase().includes("ib") || s.name.toLowerCase().includes("international baccalaureate"));
  const hasCareer = schools.some((s) => s.name.toLowerCase().includes("career") || s.name.toLowerCase().includes("technical"));

  if (hasSTEM) specialPrograms.push("STEM programs");
  if (hasArts) specialPrograms.push("Arts programs");
  if (hasMagnet) specialPrograms.push("Magnet schools");
  if (hasIB) specialPrograms.push("IB programs");
  if (hasCareer) specialPrograms.push("Career & Technical Education");

  return {
    name: "School district for this area", // Actual name passed from API in future enhancement
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
    return "No school data available for this district. Recommend contacting the local school board for enrollment information.";
  }

  const hasKids = kidsGrades.length > 0;
  let summary = `This district serves ${total} school${total !== 1 ? 's' : ''} with ${avgRating.toFixed(1)}/10 average rating. `;

  if (hasKids) {
    // Mention relevant grade levels
    if (kidsGrades.includes("elem") && byGrade.elementary.count > 0) {
      summary += `${byGrade.elementary.count} elementary school${byGrade.elementary.count !== 1 ? 's' : ''} (avg ${byGrade.elementary.avg_rating.toFixed(1)}/10). `;
    }
    if (kidsGrades.includes("middle") && byGrade.middle.count > 0) {
      summary += `${byGrade.middle.count} middle school${byGrade.middle.count !== 1 ? 's' : ''} (avg ${byGrade.middle.avg_rating.toFixed(1)}/10). `;
    }
    if (kidsGrades.includes("high") && byGrade.high.count > 0) {
      summary += `${byGrade.high.count} high school${byGrade.high.count !== 1 ? 's' : ''} (avg ${byGrade.high.avg_rating.toFixed(1)}/10). `;
    }

    // PCS flexibility
    summary += `PCS flexibility: ${pcsFlexibility.score >= 80 ? "EXCELLENT" : pcsFlexibility.score >= 60 ? "GOOD" : "MODERATE"} - ${pcsFlexibility.flexibility_note}`;
  } else {
    summary += `Includes ${byGrade.elementary.count} elementary, ${byGrade.middle.count} middle, ${byGrade.high.count} high school${byGrade.high.count !== 1 ? 's' : ''}.`;
  }

  return summary;
}

/**
 * Generate detailed analysis by grade level
 * SMART: Avoids mentioning the same school multiple times
 */
function generateDetailedSchoolsAnalysis(byGrade: SchoolsByGrade, kidsGrades: KidsGrade[]): string {
  const parts: string[] = [];
  const mentionedSchools = new Set<string>(); // Track schools we've already mentioned

  // Elementary analysis
  if (kidsGrades.length === 0 || kidsGrades.includes("elem")) {
    if (byGrade.elementary.count > 0) {
      const topSchool = byGrade.elementary.top_picks[0];
      if (topSchool && topSchool.rating >= 8 && !mentionedSchools.has(topSchool.name)) {
        mentionedSchools.add(topSchool.name);
        const additionalCount = byGrade.elementary.count - 1;
        parts.push(
          `Elementary: ${topSchool.name} leads with ${topSchool.rating.toFixed(1)}/10 rating${additionalCount > 0 ? `, ${additionalCount} additional option${additionalCount !== 1 ? 's' : ''} available` : ''}.`
        );
      } else if (byGrade.elementary.count >= 3) {
        parts.push(
          `Elementary: ${byGrade.elementary.count} schools in district, average ${byGrade.elementary.avg_rating.toFixed(1)}/10.`
        );
      } else if (byGrade.elementary.count > 0) {
        parts.push(
          `Elementary: ${byGrade.elementary.count} school${byGrade.elementary.count !== 1 ? 's' : ''} available (avg ${byGrade.elementary.avg_rating.toFixed(1)}/10).`
        );
      }
    }
  }

  // Middle school analysis
  if (kidsGrades.length === 0 || kidsGrades.includes("middle")) {
    if (byGrade.middle.count > 0) {
      const topSchool = byGrade.middle.top_picks[0];
      // Only mention if we haven't already mentioned this school in elementary section
      if (topSchool && topSchool.rating >= 8 && !mentionedSchools.has(topSchool.name)) {
        mentionedSchools.add(topSchool.name);
        parts.push(
          `Middle: ${topSchool.name} (${topSchool.rating.toFixed(1)}/10) highly rated.`
        );
      } else if (byGrade.middle.count > 0 && !mentionedSchools.has(topSchool?.name || '')) {
        parts.push(
          `Middle: ${byGrade.middle.count} school${byGrade.middle.count !== 1 ? 's' : ''} available, ${byGrade.middle.avg_rating.toFixed(1)}/10 average.`
        );
      } else if (mentionedSchools.has(topSchool?.name || '')) {
        // School already mentioned, just note the grade coverage
        parts.push(
          `Middle: ${byGrade.middle.count} school${byGrade.middle.count !== 1 ? 's' : ''} (avg ${byGrade.middle.avg_rating.toFixed(1)}/10).`
        );
      }
    }
  }

  // High school analysis
  if (kidsGrades.length === 0 || kidsGrades.includes("high")) {
    if (byGrade.high.count > 0) {
      const topSchool = byGrade.high.top_picks[0];
      // Only mention if we haven't already mentioned this school
      if (topSchool && topSchool.rating >= 8 && !mentionedSchools.has(topSchool.name)) {
        mentionedSchools.add(topSchool.name);
        parts.push(`High: ${topSchool.name} (${topSchool.rating.toFixed(1)}/10) strong option.`);
      } else if (byGrade.high.count > 0 && !mentionedSchools.has(topSchool?.name || '')) {
        parts.push(`High: ${byGrade.high.count} school${byGrade.high.count !== 1 ? 's' : ''} available, ${byGrade.high.avg_rating.toFixed(1)}/10 average.`);
      } else if (mentionedSchools.has(topSchool?.name || '')) {
        // School already mentioned, just note the grade coverage
        parts.push(
          `High: ${byGrade.high.count} school${byGrade.high.count !== 1 ? 's' : ''} (avg ${byGrade.high.avg_rating.toFixed(1)}/10).`
        );
      }
    }
  }

  // Private school note
  if (byGrade.private.count > 0) {
    parts.push(`${byGrade.private.count} private school alternative${byGrade.private.count !== 1 ? 's' : ''} available.`);
  }

  return parts.join(" ");
}

