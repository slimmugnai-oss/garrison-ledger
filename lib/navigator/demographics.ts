/**
 * DEMOGRAPHICS PROVIDER (RapidAPI Demographics)
 * 
 * Fetches demographic data for ZIP codes
 * Server-only, cached 30 days
 * 
 * Uses RapidAPI demographics endpoint (easier than Census)
 */

import { getCache, setCache } from '@/lib/cache';

export interface DemographicsData {
  demographics_score: number; // 0-10 (10 = most family-friendly)
  population: number;
  median_age: number;
  median_income: number;
  diversity_index: number; // 0-1 (1 = most diverse)
  family_households: number; // Percentage
  note: string;
}

/**
 * Fetch demographics data for a ZIP code
 */
export async function fetchDemographicsData(zip: string): Promise<DemographicsData> {
  const cacheKey = `demographics:${zip}`;
  const cached = await getCache<DemographicsData>(cacheKey);
  if (cached) {
    console.log(`[Demographics] Cache hit for ZIP ${zip}`);
    return cached;
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.warn('[Demographics] ⚠️ RapidAPI key not configured - set RAPIDAPI_KEY in Vercel');
    return getDefaultDemographicsData();
  }

  try {
    console.log(`[Demographics] Fetching demographics for ZIP ${zip}...`);
    
    // RapidAPI Demographics endpoint (much easier than Census)
    const response = await fetch(
      `https://demographics-api.p.rapidapi.com/demographics?zip=${zip}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'demographics-api.p.rapidapi.com',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`[Demographics] RapidAPI error for ZIP ${zip}:`, response.status);
      return getDefaultDemographicsData();
    }

    const data = await response.json();
    const demographicsData = parseDemographicsData(data, zip);
    
    await setCache(cacheKey, demographicsData, 30 * 24 * 3600); // 30 days
    console.log(`[Demographics] ✅ Demographics data fetched for ZIP ${zip}: Score ${demographicsData.demographics_score}/10`);
    
    return demographicsData;

  } catch (error) {
    console.error('[Demographics] Fetch error:', error);
    return getDefaultDemographicsData();
  }
}

/**
 * Parse RapidAPI Demographics response
 */
function parseDemographicsData(data: any, zip: string): DemographicsData {
  try {
    // RapidAPI Demographics response structure (adjust based on actual API)
    if (!data || !data.demographics) {
      console.warn(`[Demographics] No demographics data returned for ZIP ${zip}`);
      return getDefaultDemographicsData();
    }

    const demo = data.demographics;
    
    // Extract data from RapidAPI response
    const population = parseInt(demo.population) || 0;
    const medianAge = parseFloat(demo.median_age) || 0;
    const medianIncome = parseInt(demo.median_income) || 0;
    const familyHouseholdPercent = parseFloat(demo.family_households_percent) || 0;
    
    // Calculate diversity index (simplified)
    const diversityIndex = calculateDiversityIndex(population, medianAge);
    
    // Calculate demographics score
    const demographicsScore = computeDemographicsScore(population, medianAge, medianIncome, familyHouseholdPercent);
    
    const note = generateDemographicsNote(population, medianAge, medianIncome, familyHouseholdPercent);
    
    return {
      demographics_score: demographicsScore,
      population: population,
      median_age: medianAge,
      median_income: medianIncome,
      diversity_index: diversityIndex,
      family_households: familyHouseholdPercent,
      note
    };

  } catch (error) {
    console.error('[Demographics] Parse error:', error);
    return getDefaultDemographicsData();
  }
}

/**
 * Calculate diversity index (simplified)
 */
function calculateDiversityIndex(population: number, medianAge: number): number {
  // Simplified diversity calculation
  // In reality, would need detailed race/ethnicity breakdown
  if (population === 0) return 0;
  
  // Age diversity factor
  const ageDiversity = medianAge > 0 && medianAge < 65 ? 0.7 : 0.5;
  
  // Population size factor (larger areas tend to be more diverse)
  const sizeFactor = Math.min(1, population / 50000);
  
  return Math.min(1, ageDiversity * sizeFactor);
}

/**
 * Compute demographics score for family-friendliness
 */
function computeDemographicsScore(population: number, medianAge: number, medianIncome: number, familyPercent: number): number {
  let score = 5; // Base score
  
  // Population size (not too small, not too large)
  if (population >= 10000 && population <= 100000) score += 2;
  else if (population >= 5000 && population <= 200000) score += 1;
  else if (population < 1000 || population > 500000) score -= 1;
  
  // Median age (family-friendly range)
  if (medianAge >= 30 && medianAge <= 45) score += 2;
  else if (medianAge >= 25 && medianAge <= 50) score += 1;
  else if (medianAge < 20 || medianAge > 60) score -= 1;
  
  // Median income (affordability)
  if (medianIncome >= 50000 && medianIncome <= 150000) score += 2;
  else if (medianIncome >= 40000 && medianIncome <= 200000) score += 1;
  else if (medianIncome < 30000) score -= 1;
  
  // Family household percentage
  if (familyPercent >= 70) score += 1;
  else if (familyPercent < 50) score -= 1;
  
  return Math.max(0, Math.min(10, score));
}

/**
 * Generate demographics note
 */
function generateDemographicsNote(population: number, medianAge: number, medianIncome: number, familyPercent: number): string {
  const parts = [];
  
  if (population > 0) {
    parts.push(`Pop: ${population.toLocaleString()}`);
  }
  
  if (medianAge > 0) {
    parts.push(`Age: ${medianAge.toFixed(0)}`);
  }
  
  if (medianIncome > 0) {
    parts.push(`Income: $${medianIncome.toLocaleString()}`);
  }
  
  if (familyPercent > 0) {
    parts.push(`${familyPercent.toFixed(0)}% families`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'Demographics data unavailable';
}

/**
 * Default demographics data when API is unavailable
 */
function getDefaultDemographicsData(): DemographicsData {
  return {
    demographics_score: 6, // Neutral-positive default
    population: 25000,
    median_age: 35,
    median_income: 75000,
    diversity_index: 0.6,
    family_households: 65,
    note: 'Demographics data unavailable - check local sources'
  };
}
