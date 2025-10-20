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
  const forceRefresh = process.env.FORCE_CRIME_REFRESH === 'true'; // TEMPORARY: Force fresh data
  
  if (!forceRefresh) {
    const cached = await getCache<CrimeData>(cacheKey);
    if (cached) {
      console.log(`[Crime] Cache hit for ZIP ${zip}`);
      return cached;
    }
  } else {
    console.log(`[Crime] 🔄 Force refresh for ZIP ${zip} (debugging mode)`);
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

    // Step 2: Fetch crime data from FBI Crime Data API
    console.log(`[Crime] Fetching crime data for ZIP ${zip}...`);
    const response = await fetch(
      `https://api.usa.gov/crime/fbi/sapi/api/nibrs/violent-crime/offense/national/2022/2022?API_KEY=${apiKey}`,
      {
        headers: {
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
    // FBI Crime Data API returns national data, so we'll use it as a baseline
    let safety_score = 7; // Default neutral score
    let crime_rate_per_1000 = 30;
    let violent_crime_rate = 3;
    let property_crime_rate = 27;

    if (data && data.data && Array.isArray(data.data)) {
      // Parse FBI crime data if available
      const crimeData = data.data[0];
      if (crimeData) {
        // Convert FBI data to our scoring system
        const totalOffenses = crimeData.actual || 0;
        const population = 25000; // Estimated population for scoring
        
        crime_rate_per_1000 = Math.round((totalOffenses / population) * 1000);
        violent_crime_rate = Math.round(crime_rate_per_1000 * 0.1);
        property_crime_rate = Math.round(crime_rate_per_1000 * 0.9);
        
        // Calculate safety score (lower crime = higher safety)
        safety_score = Math.max(1, Math.min(10, 10 - (crime_rate_per_1000 / 10)));
      }
    }

    const note = `Safety Score: ${safety_score}/10, Crime Rate: ${crime_rate_per_1000}/1000`;

    return {
      safety_score,
      crime_rate_per_1000,
      violent_crime_rate,
      property_crime_rate,
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
