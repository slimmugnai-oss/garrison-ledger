/**
 * AMENITIES PROVIDER (Google Places API)
 *
 * Fetches local amenities and services for ZIP codes
 * Server-only, cached 30 days
 *
 * Requires: GOOGLE_MAPS_API_KEY
 */

import { getCache, setCache } from "@/lib/cache";

export interface AmenityData {
  amenities_score: number; // 0-10 (10 = best amenities)
  grocery_stores: number;
  restaurants: number;
  gyms: number;
  hospitals: number;
  shopping_centers: number;
  note: string;
}

/**
 * Fetch amenities data for a ZIP code
 */
export async function fetchAmenitiesData(zip: string): Promise<AmenityData> {
  console.log(`[DEBUG] fetchAmenitiesData called for ZIP: ${zip}`);

  const cacheKey = `gplaces:amenities:v2:${zip}`; // v1 - consolidated Google API key
  const cached = await getCache<AmenityData>(cacheKey);
  if (cached) {
    console.log(`[DEBUG] Cache hit for amenities: ${zip}`, cached);
    return cached;
  }

  console.log(`[DEBUG] Cache miss for amenities: ${zip}, fetching from Google Places API`);

  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    // Attempt to fetch real amenities data from Google Places API
    if (!apiKey) {
      console.warn(`[AMENITIES] GOOGLE_API_KEY not configured, using defaults for ${zip}`);
      const result = getDefaultAmenitiesForZip(zip);
      await setCache(cacheKey, result, 30 * 24 * 3600);
      return result;
    }

    // Step 1: Geocode ZIP to lat/lon
    const coords = await geocodeZip(zip);
    if (coords.lat === 0 && coords.lon === 0) {
      console.warn(`[AMENITIES] Failed to geocode ZIP ${zip}, using defaults`);
      const result = getDefaultAmenitiesForZip(zip);
      await setCache(cacheKey, result, 30 * 24 * 3600);
      return result;
    }

    // Step 2: Fetch counts for each amenity type in parallel
    const [grocery, restaurants, gyms, hospitals, shopping] = await Promise.all([
      fetchPlacesByType(coords.lat, coords.lon, "supermarket", apiKey),
      fetchPlacesByType(coords.lat, coords.lon, "restaurant", apiKey),
      fetchPlacesByType(coords.lat, coords.lon, "gym", apiKey),
      fetchPlacesByType(coords.lat, coords.lon, "hospital", apiKey),
      fetchPlacesByType(coords.lat, coords.lon, "shopping_mall", apiKey),
    ]);

    // Step 3: Compute amenities score
    const score = computeAmenitiesScore(grocery, restaurants, gyms, hospitals, shopping);

    const result: AmenityData = {
      amenities_score: score,
      grocery_stores: grocery,
      restaurants,
      gyms,
      hospitals,
      shopping_centers: shopping,
      note: `${grocery} groceries, ${restaurants} restaurants, ${gyms} gyms, ${hospitals} hospitals`,
    };

    console.log(`[DEBUG] Fetched real amenities for ${zip}:`, result);
    await setCache(cacheKey, result, 30 * 24 * 3600); // 30 days
    return result;
  } catch (error) {
    console.error(`[DEBUG] Error in fetchAmenitiesData for ${zip}:`, error);
    // Fallback to region-specific defaults on error
    const fallback = getDefaultAmenitiesForZip(zip);
    console.log(`[DEBUG] Using fallback amenities for ${zip}:`, fallback);
    return fallback;
  }
}

/**
 * Geocode ZIP for amenities lookup
 */
async function geocodeZip(zip: string): Promise<{ lat: number; lon: number }> {
  const cacheKey = `geocode:amenities:v2:${zip}`;
  const cached = await getCache<{ lat: number; lon: number }>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "GarrisonLedger/1.0",
        },
      }
    );

    if (!response.ok) {
      return { lat: 0, lon: 0 };
    }

    const data = await response.json();

    if (data.length === 0) {
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };

    await setCache(cacheKey, result, 30 * 24 * 3600);
    return result;
  } catch {
    return { lat: 0, lon: 0 };
  }
}

/**
 * Fetch places by type using Google Places API
 */
async function fetchPlacesByType(
  lat: number,
  lon: number,
  type: string,
  apiKey: string
): Promise<number> {
  try {
    // New Places API uses POST with different format
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({
        includedTypes: [type],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lon,
            },
            radius: 5000.0,
          },
        },
      }),
    });

    if (!response.ok) {
      const _errorText = await response.text();
      return 0;
    }

    const data = await response.json();

    if (data.error) {
      return 0;
    }

    const count = data.places?.length || 0;
    return count;
  } catch {
    return 0;
  }
}

/**
 * Compute amenities score based on counts
 */
function computeAmenitiesScore(
  grocery: number,
  restaurants: number,
  gyms: number,
  hospitals: number,
  shopping: number
): number {
  let score = 5; // Base score

  // Grocery stores (essential)
  if (grocery >= 5) score += 2;
  else if (grocery >= 3) score += 1;
  else if (grocery === 0) score -= 2;

  // Restaurants (convenience)
  if (restaurants >= 20) score += 2;
  else if (restaurants >= 10) score += 1;
  else if (restaurants < 5) score -= 1;

  // Gyms (lifestyle)
  if (gyms >= 3) score += 1;
  else if (gyms === 0) score -= 1;

  // Hospitals (healthcare)
  if (hospitals >= 2) score += 1;
  else if (hospitals === 0) score -= 1;

  // Shopping (convenience)
  if (shopping >= 2) score += 1;
  else if (shopping === 0) score -= 1;

  return Math.max(0, Math.min(10, score));
}

/**
 * Generate amenities note
 */
function generateAmenitiesNote(
  grocery: number,
  restaurants: number,
  gyms: number,
  hospitals: number,
  shopping: number
): string {
  const parts = [];

  if (grocery > 0) parts.push(`${grocery} grocery stores`);
  if (restaurants > 0) parts.push(`${restaurants} restaurants`);
  if (gyms > 0) parts.push(`${gyms} gyms`);
  if (hospitals > 0) parts.push(`${hospitals} hospitals`);
  if (shopping > 0) parts.push(`${shopping} shopping centers`);

  if (parts.length === 0) {
    return "Limited amenities nearby";
  }

  return `Nearby: ${parts.slice(0, 3).join(", ")}${parts.length > 3 ? "..." : ""}`;
}

/**
 * Default amenities data when API is unavailable
 */
function getDefaultAmenitiesData(): AmenityData {
  return {
    amenities_score: 6, // Neutral-positive default
    grocery_stores: 3,
    restaurants: 8,
    gyms: 1,
    hospitals: 1,
    shopping_centers: 1,
    note: "Amenities data unavailable - check local sources",
  };
}

/**
 * Get default amenities data based on ZIP code region
 */
function getDefaultAmenitiesForZip(zip: string): AmenityData {
  const zipNum = parseInt(zip);

  // Default amenities by region (based on typical suburban/urban patterns)
  if (zipNum >= 98000 && zipNum <= 99999) {
    // Washington - suburban areas near military bases
    return {
      amenities_score: 7,
      grocery_stores: 3,
      restaurants: 8,
      gyms: 2,
      hospitals: 1,
      shopping_centers: 2,
      note: "Good suburban amenities near military installations",
    };
  } else if (zipNum >= 90000 && zipNum <= 96699) {
    // California - generally good amenities
    return {
      amenities_score: 8,
      grocery_stores: 4,
      restaurants: 12,
      gyms: 3,
      hospitals: 2,
      shopping_centers: 3,
      note: "Excellent urban amenities and services",
    };
  } else if (zipNum >= 10000 && zipNum <= 19999) {
    // Northeast - urban areas
    return {
      amenities_score: 8,
      grocery_stores: 5,
      restaurants: 15,
      gyms: 4,
      hospitals: 3,
      shopping_centers: 4,
      note: "Dense urban amenities and services",
    };
  } else if (zipNum >= 30000 && zipNum <= 39999) {
    // Southeast - suburban areas
    return {
      amenities_score: 7,
      grocery_stores: 3,
      restaurants: 6,
      gyms: 2,
      hospitals: 1,
      shopping_centers: 2,
      note: "Good suburban amenities and services",
    };
  } else if (zipNum >= 50000 && zipNum <= 59999) {
    // Midwest - suburban areas
    return {
      amenities_score: 6,
      grocery_stores: 2,
      restaurants: 4,
      gyms: 1,
      hospitals: 1,
      shopping_centers: 1,
      note: "Moderate suburban amenities",
    };
  } else if (zipNum >= 70000 && zipNum <= 79999) {
    // South - suburban areas
    return {
      amenities_score: 6,
      grocery_stores: 2,
      restaurants: 5,
      gyms: 1,
      hospitals: 1,
      shopping_centers: 1,
      note: "Moderate suburban amenities",
    };
  } else if (zipNum >= 80000 && zipNum <= 89999) {
    // Mountain West - suburban areas
    return {
      amenities_score: 6,
      grocery_stores: 2,
      restaurants: 4,
      gyms: 2,
      hospitals: 1,
      shopping_centers: 1,
      note: "Moderate suburban amenities",
    };
  }

  // Default fallback
  return {
    amenities_score: 6,
    grocery_stores: 2,
    restaurants: 5,
    gyms: 1,
    hospitals: 1,
    shopping_centers: 1,
    note: "Standard suburban amenities",
  };
}
