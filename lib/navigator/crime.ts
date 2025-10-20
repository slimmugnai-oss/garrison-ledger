/**
 * CRIME & SAFETY PROVIDER
 * 
 * Fetches crime and safety data for ZIP codes
 * Server-only, cached 30 days
 * 
 * Requires: CRIME_API_KEY (or similar)
 */

import { getCache, setCache } from '@/lib/cache';

export interface CrimeData {
  safety_score: number; // 0-10 (10 = safest)
  crime_rate_per_1000: number;
  violent_crime_rate: number;
  property_crime_rate: number;
  note: string;
}

/**
 * Fetch crime and safety data for a ZIP code
 */
export async function fetchCrimeData(zip: string): Promise<CrimeData> {
  const cacheKey = `crime:${zip}`;
  const cached = await getCache<CrimeData>(cacheKey);
  if (cached) {
    console.log(`[Crime] Cache hit for ZIP ${zip}`);
    return cached;
  }

  const apiKey = process.env.CRIME_API_KEY;
  
  if (!apiKey) {
    console.warn('[Crime] ⚠️ Crime API key not configured - set CRIME_API_KEY in Vercel');
    return getDefaultCrimeData();
  }

  try {
    // Step 1: Get lat/lon for ZIP code
    console.log(`[Crime] Geocoding ZIP ${zip}...`);
    const { lat, lon } = await geocodeZip(zip);
    
    if (!lat || !lon) {
      console.warn(`[Crime] Could not geocode ZIP ${zip}`);
      return getDefaultCrimeData();
    }

    // Step 2: Fetch crime data
    // TODO: Replace with actual crime API endpoint
    console.log(`[Crime] Fetching crime data for ${lat}, ${lon} (ZIP ${zip})...`);
    const response = await fetch(
      `https://api.crime-data.com/v1/crime?lat=${lat}&lon=${lon}&radius=5`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Crime] API error for ZIP ${zip}:`, response.status, errorText);
      return getDefaultCrimeData();
    }

    const data = await response.json();
    const crimeData = parseCrimeData(data);
    
    await setCache(cacheKey, crimeData, 30 * 24 * 3600); // 30 days
    console.log(`[Crime] ✅ Crime data fetched for ZIP ${zip}: Safety score ${crimeData.safety_score}/10`);
    
    return crimeData;

  } catch (error) {
    console.error('[Crime] Fetch error:', error);
    return getDefaultCrimeData();
  }
}

/**
 * Geocode ZIP for crime lookup
 */
async function geocodeZip(zip: string): Promise<{ lat: number; lon: number }> {
  const cacheKey = `geocode:crime:${zip}`;
  const cached = await getCache<{ lat: number; lon: number }>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'GarrisonLedger/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error(`[Crime] Geocoding error for ZIP ${zip}:`, response.status);
      return { lat: 0, lon: 0 };
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.warn(`[Crime] No geocoding results for ZIP ${zip}`);
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };

    await setCache(cacheKey, result, 30 * 24 * 3600);
    return result;

  } catch (error) {
    console.error('[Crime] Geocoding fetch error:', error);
    return { lat: 0, lon: 0 };
  }
}

/**
 * Parse crime API response and compute safety score
 */
function parseCrimeData(data: any): CrimeData {
  try {
    // TODO: Adjust parsing based on actual API response structure
    const crimeRate = data.crime_rate_per_1000 || 0;
    const violentCrime = data.violent_crime_rate || 0;
    const propertyCrime = data.property_crime_rate || 0;
    
    // Compute safety score (0-10, higher = safer)
    let safetyScore = 10;
    
    // Penalize based on crime rates
    if (crimeRate > 50) safetyScore -= 3;
    else if (crimeRate > 30) safetyScore -= 2;
    else if (crimeRate > 20) safetyScore -= 1;
    
    if (violentCrime > 10) safetyScore -= 2;
    else if (violentCrime > 5) safetyScore -= 1;
    
    if (propertyCrime > 40) safetyScore -= 1;
    
    safetyScore = Math.max(0, Math.min(10, safetyScore));
    
    const note = `Crime rate: ${crimeRate.toFixed(1)}/1000 residents. ${safetyScore >= 8 ? 'Very safe' : safetyScore >= 6 ? 'Generally safe' : safetyScore >= 4 ? 'Moderate safety' : 'Higher crime area'}`;
    
    return {
      safety_score: safetyScore,
      crime_rate_per_1000: crimeRate,
      violent_crime_rate: violentCrime,
      property_crime_rate: propertyCrime,
      note
    };

  } catch (error) {
    console.error('[Crime] Parse error:', error);
    return getDefaultCrimeData();
  }
}

/**
 * Default crime data when API is unavailable
 */
function getDefaultCrimeData(): CrimeData {
  return {
    safety_score: 7, // Neutral-positive default
    crime_rate_per_1000: 25,
    violent_crime_rate: 3,
    property_crime_rate: 22,
    note: 'Crime data unavailable - check local sources'
  };
}
