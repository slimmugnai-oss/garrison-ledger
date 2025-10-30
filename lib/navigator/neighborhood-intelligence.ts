/**
 * NEIGHBORHOOD INTELLIGENCE GENERATOR
 *
 * Creates comprehensive, guide-style reports for top neighborhoods
 * Military audience: BLUF style, factual, actionable
 */

import type { School, KidsGrade } from "@/app/types/navigator";
import type { EnhancedAmenityData } from "./amenities-enhanced";

export interface NeighborhoodIntelligence {
  // Executive Summary (BLUF - Bottom Line Up Front)
  quick_verdict: string;
  confidence_score: number; // 0-100
  
  // Lifestyle Profile
  lifestyle: {
    character: "suburban" | "urban" | "rural" | "mixed";
    walkability_score: number;
    family_friendliness: number;
    dining_scene: "limited" | "moderate" | "excellent";
    shopping_convenience: "low" | "moderate" | "high";
  };
  
  // Detailed sections
  amenities_summary: string; // 2-3 sentence overview
  schools_summary: string; // School availability and quality
  commute_summary: string; // Traffic and accessibility
  quality_of_life_summary: string; // Weather, activities, community
  
  // Bottom line
  bottom_line: string; // Final recommendation
  key_strengths: string[]; // Top 3-5 selling points
  considerations: string[]; // Things to be aware of
}

/**
 * Generate comprehensive neighborhood intelligence report
 */
export function generateNeighborhoodIntelligence(args: {
  zip: string;
  rank: number; // 1, 2, 3 (for top 3)
  familyFitScore: number;
  schools: School[];
  schoolScore: number;
  kidsGrades: KidsGrade[];
  medianRentCents: number | null;
  bahMonthlyCents: number;
  commuteAm: number | null;
  commutePm: number | null;
  weatherIndex: number;
  weatherNote: string;
  enhancedAmenities: EnhancedAmenityData;
}): NeighborhoodIntelligence {
  const {
    zip,
    rank,
    familyFitScore,
    schools,
    schoolScore,
    kidsGrades,
    medianRentCents,
    bahMonthlyCents,
    commuteAm,
    commutePm,
    weatherIndex,
    weatherNote,
    enhancedAmenities,
  } = args;

  // Generate quick verdict (BLUF style)
  const quickVerdict = generateQuickVerdict(
    rank,
    familyFitScore,
    schoolScore,
    medianRentCents,
    bahMonthlyCents,
    commuteAm,
    enhancedAmenities.lifestyle.character,
    kidsGrades
  );

  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(
    schools.length,
    medianRentCents !== null,
    commuteAm !== null,
    enhancedAmenities.total_amenities
  );

  // Generate summaries
  const amenitiesSummary = generateAmenitiesSummary(enhancedAmenities);
  const schoolsSummary = generateSchoolsSummary(schools, schoolScore, kidsGrades);
  const commuteSummary = generateCommuteSummary(commuteAm, commutePm);
  const qualityOfLifeSummary = generateQualityOfLifeSummary(
    weatherNote,
    enhancedAmenities.family_activities.count,
    enhancedAmenities.spouse_employment.count
  );

  // Identify key strengths
  const keyStrengths = identifyKeyStrengths(args);

  // Identify considerations
  const considerations = identifyConsiderations(args);

  // Generate bottom line
  const bottomLine = generateBottomLine(
    familyFitScore,
    medianRentCents,
    bahMonthlyCents,
    schoolScore,
    commuteAm,
    kidsGrades
  );

  return {
    quick_verdict: quickVerdict,
    confidence_score: confidenceScore,
    lifestyle: {
      character: enhancedAmenities.lifestyle.character,
      walkability_score: enhancedAmenities.walkability_score,
      family_friendliness: enhancedAmenities.family_friendliness_score,
      dining_scene: enhancedAmenities.lifestyle.dining_scene,
      shopping_convenience: enhancedAmenities.lifestyle.shopping_convenience,
    },
    amenities_summary: amenitiesSummary,
    schools_summary: schoolsSummary,
    commute_summary: commuteSummary,
    quality_of_life_summary: qualityOfLifeSummary,
    bottom_line: bottomLine,
    key_strengths: keyStrengths,
    considerations: considerations,
  };
}

/**
 * Generate BLUF-style quick verdict
 */
function generateQuickVerdict(
  rank: number,
  score: number,
  schoolScore: number,
  rentCents: number | null,
  bahCents: number,
  commuteMin: number | null,
  character: string,
  kidsGrades: KidsGrade[]
): string {
  const hasKids = kidsGrades.length > 0;
  const underBudget = rentCents && rentCents < bahCents;
  const shortCommute = commuteMin && commuteMin < 25;
  const goodSchools = schoolScore >= 7;

  // BLUF: Bottom line up front
  let verdict = "";

  if (score >= 85) {
    verdict = "Outstanding fit. ";
    if (hasKids && goodSchools) {
      verdict += `Top-rated schools (${schoolScore.toFixed(1)}/10), `;
    }
    if (shortCommute) {
      verdict += `${commuteMin}min commute, `;
    }
    if (underBudget) {
      const savings = Math.round((bahCents - rentCents!) / 100);
      verdict += `saves $${savings.toLocaleString()}/month. `;
    }
    verdict += `${character.charAt(0).toUpperCase() + character.slice(1)} neighborhood with excellent amenities.`;
  } else if (score >= 70) {
    verdict = "Strong option. ";
    if (hasKids && schoolScore >= 6) {
      verdict += `Good schools (${schoolScore.toFixed(1)}/10), `;
    }
    if (commuteMin) {
      verdict += `${commuteMin}min commute, `;
    }
    verdict += `solid amenities in ${character} setting. `;
    if (underBudget) {
      verdict += "Under budget.";
    }
  } else if (score >= 55) {
    verdict = "Viable option. ";
    verdict += `${character.charAt(0).toUpperCase() + character.slice(1)} neighborhood. `;
    if (schoolScore >= 6) {
      verdict += "Adequate schools. ";
    }
    if (rentCents && bahCents) {
      const delta = Math.round((rentCents - bahCents) / 100);
      if (delta > 0) {
        verdict += `$${delta.toLocaleString()}/month over BAH. `;
      }
    }
    verdict += "Consider trade-offs carefully.";
  } else {
    verdict = "Weaker match. ";
    if (schoolScore < 6 && hasKids) {
      verdict += "School ratings below average. ";
    }
    if (commuteMin && commuteMin > 35) {
      verdict += `${commuteMin}min commute may impact quality of life. `;
    }
    verdict += "Better options available.";
  }

  return verdict;
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidenceScore(
  schoolCount: number,
  hasRentData: boolean,
  hasCommuteData: boolean,
  amenitiesCount: number
): number {
  let confidence = 0;

  // School data
  if (schoolCount >= 5) confidence += 25;
  else if (schoolCount >= 2) confidence += 15;
  else if (schoolCount >= 1) confidence += 5;

  // Rent data
  if (hasRentData) confidence += 25;

  // Commute data
  if (hasCommuteData) confidence += 25;

  // Amenities data
  if (amenitiesCount >= 30) confidence += 25;
  else if (amenitiesCount >= 15) confidence += 15;
  else if (amenitiesCount >= 5) confidence += 10;

  return Math.min(100, confidence);
}

/**
 * Generate amenities summary
 */
function generateAmenitiesSummary(amenities: EnhancedAmenityData): string {
  const { lifestyle, essentials, family_activities, dining, walkability_score } = amenities;

  let summary = `${lifestyle.character.charAt(0).toUpperCase() + lifestyle.character.slice(1)} neighborhood `;

  if (walkability_score >= 70) {
    summary += "with excellent walkability. ";
  } else if (walkability_score >= 50) {
    summary += "with good accessibility. ";
  } else {
    summary += "requiring a vehicle for most errands. ";
  }

  summary += `${essentials.count} essential services (groceries, pharmacy, banks), `;
  summary += `${family_activities.count} family-friendly venues (parks, libraries, entertainment), `;

  if (lifestyle.dining_scene === "excellent") {
    summary += `and ${dining.count}+ dining options create a vibrant community.`;
  } else if (lifestyle.dining_scene === "moderate") {
    summary += `and ${dining.count} dining options provide decent variety.`;
  } else {
    summary += `with limited dining (${dining.count} options).`;
  }

  return summary;
}

/**
 * Generate schools summary
 */
function generateSchoolsSummary(
  schools: School[],
  avgScore: number,
  kidsGrades: KidsGrade[]
): string {
  if (schools.length === 0) {
    return "School data unavailable for this area. Recommend researching district options directly.";
  }

  const hasKids = kidsGrades.length > 0;
  const elementary = schools.filter((s) => s.grades.toLowerCase().includes("k") || s.grades.includes("1-5"));
  const middle = schools.filter((s) => s.grades.includes("6") || s.grades.includes("7") || s.grades.includes("8"));
  const high = schools.filter((s) => s.grades.includes("9") || s.grades.includes("10") || s.grades.includes("11"));

  let summary = `${schools.length} schools nearby with average rating of ${avgScore.toFixed(1)}/10. `;

  if (hasKids) {
    if (kidsGrades.includes("elem") && elementary.length > 0) {
      summary += `${elementary.length} elementary schools available. `;
    }
    if (kidsGrades.includes("middle") && middle.length > 0) {
      summary += `${middle.length} middle schools. `;
    }
    if (kidsGrades.includes("high") && high.length > 0) {
      summary += `${high.length} high schools. `;
    }
  }

  const topRated = schools.filter((s) => s.rating >= 8);
  if (topRated.length > 0) {
    summary += `${topRated.length} highly-rated schools (8+/10) provide excellent options for military families facing frequent relocations.`;
  } else if (avgScore >= 7) {
    summary += "School quality is above average, suitable for military families.";
  } else {
    summary += "School ratings are below average. Consider private or charter options.";
  }

  return summary;
}

/**
 * Generate commute summary
 */
function generateCommuteSummary(amMin: number | null, pmMin: number | null): string {
  if (!amMin || !pmMin) {
    return "Commute data unavailable. Recommend testing the route during typical duty hours.";
  }

  const avgCommute = Math.round((amMin + pmMin) / 2);
  let traffic = "light";
  if (pmMin - amMin > 10) traffic = "heavy";
  else if (pmMin - amMin > 5) traffic = "moderate";

  let summary = `${amMin}min morning commute, ${pmMin}min evening commute to base gate. `;

  if (avgCommute < 20) {
    summary += `Short commute provides excellent work-life balance. `;
  } else if (avgCommute < 30) {
    summary += `Reasonable commute time for the area. `;
  } else {
    summary += `Longer commute may impact family time and fuel costs. `;
  }

  if (traffic === "heavy") {
    summary += `Significant PM traffic (${pmMin - amMin}min longer) typical for this route.`;
  } else if (traffic === "moderate") {
    summary += "Moderate traffic variance between AM and PM.";
  } else {
    summary += "Consistent traffic patterns make commute predictable.";
  }

  return summary;
}

/**
 * Generate quality of life summary
 */
function generateQualityOfLifeSummary(
  weatherNote: string,
  parksCount: number,
  remoteWorkSpots: number
): string {
  let summary = `${weatherNote}. `;

  if (parksCount >= 5) {
    summary += `${parksCount} parks and recreational areas support active outdoor lifestyle. `;
  } else if (parksCount >= 2) {
    summary += `${parksCount} parks provide outdoor recreation options. `;
  } else {
    summary += "Limited park access may require traveling to recreational areas. ";
  }

  if (remoteWorkSpots >= 5) {
    summary += `${remoteWorkSpots} remote-work-friendly locations (cafes, coworking) support military spouse employment.`;
  } else if (remoteWorkSpots >= 2) {
    summary += `${remoteWorkSpots} locations suitable for remote work available.`;
  } else {
    summary += "Limited remote work spaces may require home office setup.";
  }

  return summary;
}

/**
 * Identify key strengths of neighborhood
 */
function identifyKeyStrengths(args: {
  familyFitScore: number;
  schoolScore: number;
  medianRentCents: number | null;
  bahMonthlyCents: number;
  commuteAm: number | null;
  enhancedAmenities: EnhancedAmenityData;
  schools: School[];
}): string[] {
  const strengths: string[] = [];
  const {
    familyFitScore,
    schoolScore,
    medianRentCents,
    bahMonthlyCents,
    commuteAm,
    enhancedAmenities,
    schools,
  } = args;

  // Top overall score
  if (familyFitScore >= 85) {
    strengths.push("Top-tier family fit score (85+/100)");
  }

  // Schools
  if (schoolScore >= 8) {
    strengths.push(`Excellent schools (${schoolScore.toFixed(1)}/10 average rating)`);
  } else if (schoolScore >= 7 && schools.length >= 5) {
    strengths.push(`Multiple good school options (${schools.length} schools)`);
  }

  // Housing affordability
  if (medianRentCents && medianRentCents < bahMonthlyCents * 0.8) {
    const savings = Math.round((bahMonthlyCents - medianRentCents) / 100);
    strengths.push(`Significant BAH surplus ($${savings.toLocaleString()}/month pocket money)`);
  } else if (medianRentCents && medianRentCents <= bahMonthlyCents) {
    strengths.push("Rent within BAH allowance");
  }

  // Commute
  if (commuteAm && commuteAm < 20) {
    strengths.push(`Short commute (${commuteAm}min) supports work-life balance`);
  }

  // Walkability
  if (enhancedAmenities.walkability_score >= 70) {
    strengths.push("Highly walkable neighborhood reduces daily driving");
  }

  // Family amenities
  if (enhancedAmenities.family_activities.count >= 5) {
    strengths.push(
      `${enhancedAmenities.family_activities.count} parks and family activities nearby`
    );
  }

  // Dining scene
  if (enhancedAmenities.lifestyle.dining_scene === "excellent") {
    strengths.push(`Vibrant dining scene (${enhancedAmenities.dining.count}+ options)`);
  }

  // Essentials
  if (enhancedAmenities.lifestyle.shopping_convenience === "high") {
    strengths.push("Excellent shopping convenience for daily needs");
  }

  return strengths.slice(0, 5); // Top 5 strengths
}

/**
 * Identify considerations/trade-offs
 */
function identifyConsiderations(args: {
  medianRentCents: number | null;
  bahMonthlyCents: number;
  commuteAm: number | null;
  commutePm: number | null;
  schoolScore: number;
  schools: School[];
  enhancedAmenities: EnhancedAmenityData;
  kidsGrades: KidsGrade[];
}): string[] {
  const considerations: string[] = [];
  const {
    medianRentCents,
    bahMonthlyCents,
    commuteAm,
    commutePm,
    schoolScore,
    schools,
    enhancedAmenities,
    kidsGrades,
  } = args;

  // Over budget
  if (medianRentCents && medianRentCents > bahMonthlyCents) {
    const overage = Math.round((medianRentCents - bahMonthlyCents) / 100);
    considerations.push(
      `Median rent exceeds BAH by $${overage.toLocaleString()}/month (requires out-of-pocket)`
    );
  }

  // Long commute
  if (commuteAm && commuteAm > 30) {
    considerations.push(`${commuteAm}min morning commute may impact early duty days`);
  }

  // Traffic variance
  if (commuteAm && commutePm && commutePm - commuteAm > 15) {
    considerations.push(`Heavy PM traffic (${commutePm}min) vs AM (${commuteAm}min)`);
  }

  // Schools
  if (kidsGrades.length > 0 && schoolScore < 7) {
    considerations.push(`School ratings below average (${schoolScore.toFixed(1)}/10)`);
  }

  if (kidsGrades.length > 0 && schools.length < 3) {
    considerations.push("Limited school options may restrict flexibility for future PCS moves");
  }

  // Low walkability
  if (enhancedAmenities.walkability_score < 40) {
    considerations.push("Low walkability requires vehicle for most errands");
  }

  // Limited amenities
  if (enhancedAmenities.essentials.count < 3) {
    considerations.push("Limited grocery and pharmacy options may require longer shopping trips");
  }

  // Family activities
  if (kidsGrades.length > 0 && enhancedAmenities.family_activities.count < 3) {
    considerations.push("Few nearby parks and family activities");
  }

  return considerations.slice(0, 4); // Top 4 considerations
}

/**
 * Generate bottom line recommendation
 */
function generateBottomLine(
  score: number,
  rentCents: number | null,
  bahCents: number,
  schoolScore: number,
  commuteMin: number | null,
  kidsGrades: KidsGrade[]
): string {
  const hasKids = kidsGrades.length > 0;
  const underBudget = rentCents && rentCents < bahCents;
  const shortCommute = commuteMin && commuteMin < 25;
  const goodSchools = schoolScore >= 7;

  if (score >= 85 && underBudget && shortCommute && (!hasKids || goodSchools)) {
    return "RECOMMEND: Exceptional value with strong scores across all factors. Prioritize this neighborhood.";
  } else if (score >= 70 && (!hasKids || schoolScore >= 6)) {
    return "RECOMMEND: Solid option that meets core needs. Good choice for most military families.";
  } else if (score >= 60) {
    return "CONSIDER: Viable option with some trade-offs. Compare carefully with higher-ranked neighborhoods.";
  } else if (score >= 50) {
    return "MARGINAL: Acceptable but not ideal. Consider if higher-ranked options are unavailable.";
  } else {
    return "NOT RECOMMENDED: Significant compromises required. Explore higher-ranked neighborhoods first.";
  }
}

