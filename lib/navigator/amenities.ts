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
  const cacheKey = `gplaces:amenities:v1:${zip}`; // v1 - consolidated Google API key
  const cached = await getCache<AmenityData>(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return getDefaultAmenitiesData();
  }

  try {
    // Step 1: Get lat/lon for ZIP code
    const { lat, lon } = await geocodeZip(zip);

    if (!lat || !lon) {
      return getDefaultAmenitiesData();
    }

    // Step 2: Fetch amenities using Google Places API

    const amenitiesData = await Promise.all([
      fetchPlacesByType(lat, lon, "supermarket", apiKey), // New API uses 'supermarket' not 'grocery_or_supermarket'
      fetchPlacesByType(lat, lon, "restaurant", apiKey),
      fetchPlacesByType(lat, lon, "gym", apiKey),
      fetchPlacesByType(lat, lon, "hospital", apiKey),
      fetchPlacesByType(lat, lon, "shopping_mall", apiKey),
    ]);

    const [groceryStores, restaurants, gyms, hospitals, shoppingCenters] = amenitiesData;

    const amenitiesScore = computeAmenitiesScore(
      groceryStores,
      restaurants,
      gyms,
      hospitals,
      shoppingCenters
    );

    const result: AmenityData = {
      amenities_score: amenitiesScore,
      grocery_stores: groceryStores,
      restaurants: restaurants,
      gyms: gyms,
      hospitals: hospitals,
      shopping_centers: shoppingCenters,
      note: generateAmenitiesNote(groceryStores, restaurants, gyms, hospitals, shoppingCenters),
    };

    await setCache(cacheKey, result, 30 * 24 * 3600); // 30 days

    return result;
  } catch {
    return getDefaultAmenitiesData();
  }
}

/**
 * Geocode ZIP for amenities lookup
 */
async function geocodeZip(zip: string): Promise<{ lat: number; lon: number }> {
  const cacheKey = `geocode:amenities:${zip}`;
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
