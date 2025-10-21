/**
 * SCHOOLS PROVIDER (GreatSchools)
 * 
 * Fetches school ratings by ZIP and computes child-weighted scores
 * Server-only, cached 24h
 */

import type { School, KidsGrade } from '@/app/types/navigator';
import { getCache, setCache } from '@/lib/cache';

/**
 * GreatSchools API Response Types
 */
interface GreatSchoolsSchool {
  name: string;
  'rating_band'?: string; // Note: underscore, not hyphen
  level?: string;
  street?: string;
  city?: string;
  state?: string;
  type?: string;
  distance?: number;
}

interface GreatSchoolsResponse {
  schools?: GreatSchoolsSchool[];
  cur_page?: number;
  total_count?: number;
}

interface NominatimGeocodingResponse {
  lat: string;
  lon: string;
}

/**
 * Fetch schools by ZIP from GreatSchools API v2
 * V2 requires lat/lon, so we need to geocode ZIP first
 */
export async function fetchSchoolsByZip(zip: string): Promise<School[]> {
  // CRITICAL: v2 cache key to bust corrupted v1 data
  const cacheKey = `gs:zip:v2:${zip}`;
  
  const cached = await getCache<School[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.GREAT_SCHOOLS_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    // Step 1: Convert ZIP to lat/lon using geocoding
    const { lat, lon } = await geocodeZip(zip);
    
    if (!lat || !lon) {
      return [];
    }

    // Step 2: Fetch schools using GreatSchools v2 API
    const response = await fetch(
      `https://gs-api.greatschools.org/v2/nearby-schools?lat=${lat}&lon=${lon}&limit=20&distance=5`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
          'Content': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 410) {
      } else if (response.status === 401) {
      } else if (response.status === 403) {
      }
      
      return [];
    }

    const data = await response.json() as GreatSchoolsResponse;
    
    // Parse v2 API response structure
    // Response: { schools: [...], cur_page, total_count, etc. }
    const schools: School[] = (data.schools || []).map((s) => {
      const ratingBand = s['rating_band']; // CRITICAL: Must be underscore, not hyphen
      const rating = parseRatingBand(ratingBand);
      
      // VALIDATION: Ensure rating is always a valid number, never undefined/null/NaN
      const validatedRating = typeof rating === 'number' && !isNaN(rating) ? rating : 7;
      
      return {
        name: s.name || 'Unknown School',
        rating: validatedRating, // MUST be valid number
        grades: s.level || 'K-12',
        address: `${s.street || ''}, ${s.city || ''}, ${s.state || ''}`.trim(),
        type: s.type || 'public',
        distance_mi: s.distance || 0
      };
    });

    if (schools.length > 0) {
      const topSchool = schools[0];
      const ratingText = topSchool.rating > 0 ? `${topSchool.rating}/10` : 'No rating';
      
      const withRatings = schools.filter(s => s.rating > 0).length;
      if (withRatings === 0) {
      }
    }

    await setCache(cacheKey, schools, 24 * 3600); // 24h cache
    return schools;

  } catch {
    return [];
  }
}

/**
 * Convert ZIP code to lat/lon coordinates
 * Uses simple US ZIP database or geocoding service
 */
async function geocodeZip(zip: string): Promise<{ lat: number; lon: number }> {
  const cacheKey = `geocode:${zip}`;
  const cached = await getCache<{ lat: number; lon: number }>(cacheKey);
  if (cached) return cached;

  try {
    // Use OpenStreetMap Nominatim (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'GarrisonLedger/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      return { lat: 0, lon: 0 };
    }

    const data = await response.json() as NominatimGeocodingResponse[];
    
    if (data.length === 0) {
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };

    // Cache for 30 days (ZIP coords don't change)
    await setCache(cacheKey, result, 30 * 24 * 3600);
    
    return result;

  } catch {
    return { lat: 0, lon: 0 };
  }
}

/**
 * Parse GreatSchools rating-band to 0-10 numeric score
 * V2 API returns rating-band as string, not numeric rating
 * Note: rating-band is only available on certain subscription tiers
 */
function parseRatingBand(ratingBand: string | undefined | null): number {
  if (!ratingBand) {
    // If no rating-band, use neutral score
    // This allows schools to still appear and contribute to search
    return 7; // Neutral-positive (doesn't penalize in scoring)
  }
  
  // GreatSchools rating bands (approximate conversions)
  // Docs don't specify exact values, so these are estimated
  const bandMap: Record<string, number> = {
    'above-average': 8,
    'above average': 8,
    'average': 6,
    'below-average': 4,
    'below average': 4,
    'well-above-average': 9,
    'well above average': 9,
    'well-below-average': 3,
    'well below average': 3,
    'excellent': 10,
    'good': 7,
    'fair': 5,
    'poor': 3
  };

  const normalized = ratingBand.toLowerCase().trim();
  const score = bandMap[normalized];
  
  if (score === undefined) {
    return 7;
  }
  
  return score;
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

  // Get top schools by rating, filtered to only relevant grade levels
  const relevantSchools = schools.filter(school => {
    const schoolBuckets = gradesToBuckets(school.grades);
    // Only include schools that match at least one active grade level
    return schoolBuckets.some(bucket => buckets[bucket] > 0);
  });

  const top = [...relevantSchools]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);


  return { score10, top };
}

