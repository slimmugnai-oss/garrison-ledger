/**
 * SCHOOLS PROVIDER (GreatSchools)
 * 
 * Fetches school ratings by ZIP and computes child-weighted scores
 * Server-only, cached 24h
 */

import type { School, KidsGrade } from '@/app/types/navigator';
import { getCache, setCache } from '@/lib/cache';

/**
 * Fetch schools by ZIP from GreatSchools API
 */
export async function fetchSchoolsByZip(zip: string): Promise<School[]> {
  const cacheKey = `gs:zip:${zip}`;
  const cached = await getCache<School[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GREAT_SCHOOLS_API_KEY;
  
  if (!apiKey) {
    console.warn('[Schools] GreatSchools API key not configured');
    return [];
  }

  try {
    // GreatSchools API call (example endpoint - adjust to actual API)
    const response = await fetch(
      `https://api.greatschools.org/schools?state=&zip=${zip}&limit=20`,
      {
        headers: {
          'X-API-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      console.error('[Schools] API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Parse and normalize (adjust based on actual API response structure)
    const schools: School[] = (data.schools || []).map((s: any) => ({
      name: s.name || 'Unknown School',
      rating: parseFloat(s.rating) || 0, // Normalize to 0-10
      grades: s.gradeLevels || s.grades || 'K-12',
      address: s.address,
      type: s.type,
      distance_mi: s.distance
    }));

    await setCache(cacheKey, schools, 24 * 3600); // 24h cache
    return schools;

  } catch (error) {
    console.error('[Schools] Fetch error:', error);
    return [];
  }
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
  const activeGrades: KidsGrade[] = kidsGrades.length > 0 
    ? kidsGrades 
    : ['elem', 'middle', 'high'];
  
  activeGrades.forEach(grade => {
    buckets[grade] = 1 / activeGrades.length;
  });

  // Map school grades to buckets
  const gradesToBuckets = (gradeString: string): KidsGrade[] => {
    const s = gradeString.toLowerCase();
    const bucketList: KidsGrade[] = [];
    
    if (/(k|pre|1|2|3|4|5)/.test(s) || /elementary/.test(s) || /elem/.test(s)) {
      bucketList.push('elem');
    }
    if (/(6|7|8)/.test(s) || /middle/.test(s)) {
      bucketList.push('middle');
    }
    if (/(9|10|11|12)/.test(s) || /high/.test(s)) {
      bucketList.push('high');
    }
    
    // Default to all if can't determine
    return bucketList.length > 0 ? bucketList : ['elem', 'middle', 'high'];
  };

  // Compute weighted score
  let weightedSum = 0;
  let denominator = 0;

  for (const school of schools) {
    const schoolBuckets = gradesToBuckets(school.grades);
    
    // Weight for this school = average of its bucket weights
    const weight = schoolBuckets.reduce((sum, bucket) => sum + (buckets[bucket] ?? 0), 0) / schoolBuckets.length;
    
    const rating = school.rating ?? 0;
    weightedSum += rating * weight;
    denominator += weight;
  }

  const score10 = denominator > 0 
    ? Math.max(0, Math.min(10, weightedSum / denominator))
    : 0;

  // Get top 3 schools by rating
  const top = [...schools]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  return { score10, top };
}

