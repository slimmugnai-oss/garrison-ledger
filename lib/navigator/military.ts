/**
 * MILITARY AMENITIES PROVIDER (Google Places API)
 * 
 * Fetches military-specific amenities for ZIP codes
 * Server-only, cached 30 days
 * 
 * Requires: GOOGLE_MAPS_API_KEY
 */

import { getCache, setCache } from '@/lib/cache';

export interface MilitaryAmenitiesData {
  military_score: number; // 0-10 (10 = best military amenities)
  commissary_distance_mi: number | null;
  exchange_distance_mi: number | null;
  va_facility_distance_mi: number | null;
  military_housing_distance_mi: number | null;
  note: string;
}

/**
 * Fetch military amenities data for a ZIP code
 */
export async function fetchMilitaryAmenitiesData(zip: string): Promise<MilitaryAmenitiesData> {
  const cacheKey = `military:v3:${zip}`; // v3 to bust cache and test new API
  const cached = await getCache<MilitaryAmenitiesData>(cacheKey);
  if (cached) {
    console.log(`[Military] Cache hit for ZIP ${zip}`);
    return cached;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('[Military] ⚠️ Google Maps API key not configured - set GOOGLE_MAPS_API_KEY in Vercel');
    return getDefaultMilitaryData();
  }

  try {
    // Step 1: Get lat/lon for ZIP code
    console.log(`[Military] Geocoding ZIP ${zip}...`);
    const { lat, lon } = await geocodeZip(zip);
    
    if (!lat || !lon) {
      console.warn(`[Military] Could not geocode ZIP ${zip}`);
      return getDefaultMilitaryData();
    }

    // Step 2: Fetch military facilities using Google Places API
    console.log(`[Military] Fetching military facilities for ${lat}, ${lon} (ZIP ${zip})...`);
    
    const [commissaryDist, exchangeDist, vaDist, housingDist] = await Promise.all([
      findNearestMilitaryFacility(lat, lon, 'commissary', apiKey),
      findNearestMilitaryFacility(lat, lon, 'exchange', apiKey),
      findNearestMilitaryFacility(lat, lon, 'va_facility', apiKey),
      findNearestMilitaryFacility(lat, lon, 'military_housing', apiKey)
    ]);
    
    const militaryScore = computeMilitaryScore(commissaryDist, exchangeDist, vaDist, housingDist);
    
    const result: MilitaryAmenitiesData = {
      military_score: militaryScore,
      commissary_distance_mi: commissaryDist,
      exchange_distance_mi: exchangeDist,
      va_facility_distance_mi: vaDist,
      military_housing_distance_mi: housingDist,
      note: generateMilitaryNote(commissaryDist, exchangeDist, vaDist, housingDist)
    };
    
    await setCache(cacheKey, result, 30 * 24 * 3600); // 30 days
    console.log(`[Military] ✅ Military amenities data fetched for ZIP ${zip}: Score ${militaryScore}/10`);
    
    return result;

  } catch (error) {
    console.error('[Military] Fetch error:', error);
    return getDefaultMilitaryData();
  }
}

/**
 * Geocode ZIP for military facilities lookup
 */
async function geocodeZip(zip: string): Promise<{ lat: number; lon: number }> {
  const cacheKey = `geocode:military:${zip}`;
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
      console.error(`[Military] Geocoding error for ZIP ${zip}:`, response.status);
      return { lat: 0, lon: 0 };
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.warn(`[Military] No geocoding results for ZIP ${zip}`);
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };

    await setCache(cacheKey, result, 30 * 24 * 3600);
    return result;

  } catch (error) {
    console.error('[Military] Geocoding fetch error:', error);
    return { lat: 0, lon: 0 };
  }
}

/**
 * Find nearest military facility using Google Places API
 */
async function findNearestMilitaryFacility(lat: number, lon: number, facilityType: string, apiKey: string): Promise<number | null> {
  try {
    // Map facility types to search terms
    const searchTerms = {
      'commissary': 'commissary military base',
      'exchange': 'military exchange base',
      'va_facility': 'VA medical center veterans',
      'military_housing': 'military housing base'
    };
    
    const searchTerm = searchTerms[facilityType as keyof typeof searchTerms] || facilityType;
    
    console.log(`[Military] Searching for ${facilityType} using Places API (New)...`);
    
    // New Places API uses POST with different format for text search
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify({
        textQuery: searchTerm,
        locationBias: {
          circle: {
            center: {
              latitude: lat,
              longitude: lon
            },
            radius: 50000.0
          }
        },
        maxResultCount: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Military] ❌ Places API (New) HTTP ${response.status} for ${facilityType}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`[Military] Raw API response for ${facilityType}:`, JSON.stringify(data).substring(0, 500));
    
    if (data.error) {
      console.error(`[Military] ❌ API error for ${facilityType}:`, data.error);
      return null;
    }
    
    if (!data.places || data.places.length === 0) {
      console.log(`[Military] No ${facilityType} found nearby`);
      return null;
    }

    // Get the nearest result
    const nearest = data.places[0];
    console.log(`[Military] ✅ Found ${facilityType}: ${nearest.displayName?.text || 'Unknown'}`);
    
    // Calculate distance using Haversine formula
    const distance = calculateDistance(lat, lon, nearest.location.latitude, nearest.location.longitude);
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place

  } catch (error) {
    console.error(`[Military] Places fetch error for ${facilityType}:`, error);
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Compute military amenities score
 */
function computeMilitaryScore(commissary: number | null, exchange: number | null, va: number | null, housing: number | null): number {
  let score = 5; // Base score
  
  // Commissary (very important for military families)
  if (commissary !== null) {
    if (commissary <= 5) score += 3;
    else if (commissary <= 10) score += 2;
    else if (commissary <= 20) score += 1;
    else score -= 1;
  } else {
    score -= 2; // No commissary nearby
  }
  
  // Exchange (important for military families)
  if (exchange !== null) {
    if (exchange <= 5) score += 2;
    else if (exchange <= 10) score += 1;
    else if (exchange <= 20) score += 0.5;
  } else {
    score -= 1; // No exchange nearby
  }
  
  // VA facility (important for veterans)
  if (va !== null) {
    if (va <= 10) score += 1;
    else if (va <= 25) score += 0.5;
  }
  
  // Military housing (convenience)
  if (housing !== null) {
    if (housing <= 10) score += 1;
    else if (housing <= 20) score += 0.5;
  }
  
  return Math.max(0, Math.min(10, score));
}

/**
 * Generate military amenities note
 */
function generateMilitaryNote(commissary: number | null, exchange: number | null, va: number | null, housing: number | null): string {
  const parts = [];
  
  if (commissary !== null) {
    parts.push(`Commissary: ${commissary}mi`);
  }
  
  if (exchange !== null) {
    parts.push(`Exchange: ${exchange}mi`);
  }
  
  if (va !== null) {
    parts.push(`VA: ${va}mi`);
  }
  
  if (housing !== null) {
    parts.push(`Housing: ${housing}mi`);
  }
  
  if (parts.length === 0) {
    return 'No military facilities nearby';
  }
  
  return parts.join(' • ');
}

/**
 * Default military amenities data when API is unavailable
 */
function getDefaultMilitaryData(): MilitaryAmenitiesData {
  return {
    military_score: 6, // Neutral-positive default
    commissary_distance_mi: 15,
    exchange_distance_mi: 15,
    va_facility_distance_mi: 25,
    military_housing_distance_mi: 20,
    note: 'Military facilities data unavailable - check local sources'
  };
}
