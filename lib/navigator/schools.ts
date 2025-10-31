/**
 * SCHOOLS PROVIDER (SchoolDigger)
 *
 * Fetches school ratings by ZIP and computes child-weighted scores
 * Server-only, cached 24h
 */

import type { School, KidsGrade } from "@/app/types/navigator";
import { getCache, setCache } from "@/lib/cache";
import { getSchoolsByZip, type SchoolDiggerSchool } from "@/lib/vendors/schooldigger";

/**
 * Fetch schools by ZIP from SchoolDigger API
 * SchoolDigger can search by ZIP directly (no geocoding needed)
 */
export async function fetchSchoolsByZip(zip: string): Promise<School[]> {
  // Cache key versioned for SchoolDigger
  const cacheKey = `sd:zip:v7:${zip}`; // v7: Rich school data (enrollment, rankings, program types)

  const cached = await getCache<School[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Fetch schools using SchoolDigger API (proximity search)
    const response = await getSchoolsByZip(zip, 50, 1); // Get more schools to ensure we have full district

    if (!response.schoolList || response.schoolList.length === 0) {
      console.log(`[SCHOOLS] No schools found for ZIP ${zip}`);
      return [];
    }

    // STEP 1: Identify primary district for this ZIP
    // Count schools by district to find which district serves this area
    const districtCounts: Record<string, number> = {};
    response.schoolList.forEach((s) => {
      const districtID = s.district?.districtID;
      if (districtID) {
        districtCounts[districtID] = (districtCounts[districtID] || 0) + 1;
      }
    });

    // Primary district = most common district in results
    const primaryDistrictID = Object.entries(districtCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const primaryDistrictName = response.schoolList.find(
      (s) => s.district?.districtID === primaryDistrictID
    )?.district?.districtName || "Local School District";

    console.log(`[SCHOOLS] Primary district for ZIP ${zip}: ${primaryDistrictName} (${primaryDistrictID})`);

    // STEP 2: Filter to PRIMARY DISTRICT schools only
    // This ensures we show schools kids can ACTUALLY attend
    const districtSchools = response.schoolList.filter(
      (s) => s.district?.districtID === primaryDistrictID
    );

    console.log(`[SCHOOLS] Filtered ${response.schoolList.length} → ${districtSchools.length} schools (primary district only)`);

    // STEP 3: Parse to our School format with RICH DATA
    const schools: School[] = districtSchools.map((s) => {
      const rating = convertSchoolDiggerRating(s);
      const grades = formatGradeRange(s.lowGrade, s.highGrade);
      
      // Extract latest yearly details (enrollment, demographics)
      const latestYear = s.schoolYearlyDetails?.[0];
      
      // Calculate state rank percentile from rankHistory
      const latestRank = s.rankHistory?.[0];
      const stateRankPercentile = latestRank?.rankStatewidePercentage 
        ? Math.round(latestRank.rankStatewidePercentage)
        : undefined;

      return {
        name: s.schoolName || "Unknown School",
        rating, // 0-10 scale
        grades,
        address: s.address.html || formatAddress(s.address),
        type: s.isPrivate ? "private" : "public",
        distance_mi: s.distance || 0,
        
        // ENHANCED DATA - Now available for rich UI!
        school_id: s.schoolid,
        enrollment: latestYear?.numberOfStudents,
        phone: s.phone,
        website_url: s.url,
        is_charter: s.isCharterSchool === "Yes",
        is_magnet: s.isMagnetSchool === "Yes",
        is_title_i: s.isTitleISchool === "Yes",
        state_rank: stateRankPercentile,
        district_name: s.district?.districtName,
      };
    });

    console.log(`[SCHOOLS] Returning ${schools.length} schools from ${primaryDistrictName} for ZIP ${zip}`);

    // Cache for 24 hours
    await setCache(cacheKey, schools, 24 * 3600);
    return schools;
  } catch (error) {
    // Log detailed error for debugging
    console.error(`[SCHOOLS] SchoolDigger API error for ZIP ${zip}:`, error);
    
    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes("401")) {
      console.error("[SCHOOLS] CRITICAL: SchoolDigger API authentication failed. Check SCHOOLDIGGER_APP_ID and SCHOOLDIGGER_APP_KEY environment variables.");
    } else if (error instanceof Error && error.message.includes("timeout")) {
      console.error("[SCHOOLS] SchoolDigger API timeout - service may be slow or unavailable");
    }
    
    return [];
  }
}

/**
 * Convert SchoolDigger rating (1-5 stars) to our 0-10 scale
 * SchoolDigger uses rankStars from rankHistory (most recent year)
 */
function convertSchoolDiggerRating(school: SchoolDiggerSchool): number {
  // Get most recent ranking
  const latestRank = school.rankHistory?.[0];

  if (!latestRank || !latestRank.rankStars) {
    // No rating available - return neutral score
    return 7;
  }

  // Convert 1-5 stars to 0-10 scale
  // 5 stars = 10/10, 4 stars = 8/10, 3 stars = 6/10, etc.
  const rating = latestRank.rankStars * 2;

  // Ensure it's within 0-10 range
  return Math.max(0, Math.min(10, rating));
}

/**
 * Format grade range for display
 */
function formatGradeRange(lowGrade?: string, highGrade?: string): string {
  if (!lowGrade && !highGrade) {
    return "K-12";
  }

  if (!lowGrade) {
    return highGrade || "K-12";
  }

  if (!highGrade) {
    return lowGrade;
  }

  return `${lowGrade}-${highGrade}`;
}

/**
 * Format school address for display
 */
function formatAddress(address: SchoolDiggerSchool["address"]): string {
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean);

  return parts.join(", ").trim() || "Address not available";
}

/**
 * Compute child-weighted school score
 * Weights schools by relevance to kids' grade levels
 */
export function computeChildWeightedSchoolScore(
  schools: School[],
  kidsGrades: KidsGrade[]
): { score10: number; top: School[] } {
  if (schools.length === 0) {
    return { score10: 0, top: [] };
  }

  // Define bucket weights
  const buckets: Record<KidsGrade, number> = { elem: 0, middle: 0, high: 0 };

  // If no grades specified, weight all equally
  const activeGrades: KidsGrade[] = kidsGrades.length > 0 ? kidsGrades : ["elem", "middle", "high"];

  activeGrades.forEach((grade) => {
    buckets[grade] = 1 / activeGrades.length;
  });

  // Map school grades to buckets
  const gradesToBuckets = (gradeString: string): KidsGrade[] => {
    const s = gradeString.toLowerCase();
    const bucketList: KidsGrade[] = [];

    if (/(k|pre|1|2|3|4|5)/.test(s) || /elementary/.test(s) || /elem/.test(s)) {
      bucketList.push("elem");
    }
    if (/(6|7|8)/.test(s) || /middle/.test(s)) {
      bucketList.push("middle");
    }
    if (/(9|10|11|12)/.test(s) || /high/.test(s)) {
      bucketList.push("high");
    }

    // Default to all if can't determine
    return bucketList.length > 0 ? bucketList : ["elem", "middle", "high"];
  };

  // Compute weighted score
  let weightedSum = 0;
  let denominator = 0;

  for (const school of schools) {
    const schoolBuckets = gradesToBuckets(school.grades);

    // Weight for this school = average of its bucket weights
    const weight =
      schoolBuckets.reduce((sum, bucket) => sum + (buckets[bucket] ?? 0), 0) / schoolBuckets.length;

    const rating = school.rating ?? 0;
    weightedSum += rating * weight;
    denominator += weight;
  }

  const score10 = denominator > 0 ? Math.max(0, Math.min(10, weightedSum / denominator)) : 0;

  // Get top schools by rating, filtered to only relevant grade levels
  const relevantSchools = schools.filter((school) => {
    const schoolBuckets = gradesToBuckets(school.grades);
    // Only include schools that match at least one active grade level
    return schoolBuckets.some((bucket) => buckets[bucket] > 0);
  });

  const top = [...relevantSchools].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);

  return { score10, top };
}
