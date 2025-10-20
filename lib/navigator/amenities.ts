/**
 * AMENITIES PROVIDER (Google Places API)
 * 
 * Fetches local amenities and services for ZIP codes
 * Server-only, cached 30 days
 * 
 * Requires: GOOGLE_MAPS_API_KEY
 */

import { getCache, setCache } from '@/lib/cache';

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
  const cacheKey = `amenities:v2:${zip}`; // v2 to bust old cache
  const cached = await getCache<AmenityData>(cacheKey);
  if (cached) {
    console.log(`[Amenities] Cache hit for ZIP ${zip}`);
    return cached;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('[Amenities] ⚠️ Google Maps API key not configured - set GOOGLE_MAPS_API_KEY in Vercel');
    return getDefaultAmenitiesData();
  }

  try {
    // Step 1: Get lat/lon for ZIP code
    console.log(`[Amenities] Geocoding ZIP ${zip}...`);
    const { lat, lon } = await geocodeZip(zip);
    
    if (!lat || !lon) {
      console.warn(`[Amenities] Could not geocode ZIP ${zip}`);
      return getDefaultAmenitiesData();
    }

    // Step 2: Fetch amenities using Google Places API
    console.log(`[Amenities] Fetching amenities for ${lat}, ${lon} (ZIP ${zip})...`);
    
    const amenitiesData = await Promise.all([
      fetchPlacesByType(lat, lon, 'supermarket', apiKey), // New API uses 'supermarket' not 'grocery_or_supermarket'
      fetchPlacesByType(lat, lon, 'restaurant', apiKey),
      fetchPlacesByType(lat, lon, 'gym', apiKey),
      fetchPlacesByType(lat, lon, 'hospital', apiKey),
      fetchPlacesByType(lat, lon, 'shopping_mall', apiKey)
    ]);

    const [groceryStores, restaurants, gyms, hospitals, shoppingCenters] = amenitiesData;
    
    const amenitiesScore = computeAmenitiesScore(groceryStores, restaurants, gyms, hospitals, shoppingCenters);
    
    const result: AmenityData = {
      amenities_score: amenitiesScore,
      grocery_stores: groceryStores,
      restaurants: restaurants,
      gyms: gyms,
      hospitals: hospitals,
      shopping_centers: shoppingCenters,
      note: generateAmenitiesNote(groceryStores, restaurants, gyms, hospitals, shoppingCenters)
    };
    
    await setCache(cacheKey, result, 30 * 24 * 3600); // 30 days
    console.log(`[Amenities] ✅ Amenities data fetched for ZIP ${zip}: Score ${amenitiesScore}/10`);
    
    return result;

  } catch (error) {
    console.error('[Amenities] Fetch error:', error);
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
          'User-Agent': 'GarrisonLedger/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error(`[Amenities] Geocoding error for ZIP ${zip}:`, response.status);
      return { lat: 0, lon: 0 };
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.warn(`[Amenities] No geocoding results for ZIP ${zip}`);
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };

    await setCache(cacheKey, result, 30 * 24 * 3600);
    return result;

  } catch (error) {
    console.error('[Amenities] Geocoding fetch error:', error);
    return { lat: 0, lon: 0 };
  }
}

/**
 * Fetch places by type using Google Places API
 */
async function fetchPlacesByType(lat: number, lon: number, type: string, apiKey: string): Promise<number> {
  try {
    console.log(`[Amenities] Fetching ${type} from Places API (New)...`);
    
    // New Places API uses POST with different format
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({
        includedTypes: [type],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lon
            },
            radius: 5000.0
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Amenities] ❌ Places API (New) HTTP ${response.status} for ${type}:`, errorText);
      return 0;
    }

    const data = await response.json();
    console.log(`[Amenities] Raw API response for ${type}:`, JSON.stringify(data).substring(0, 500));
    
    if (data.error) {
      console.error(`[Amenities] ❌ API error for ${type}:`, data.error);
      return 0;
    }
    
    const count = data.places?.length || 0;
    console.log(`[Amenities] ✅ Found ${count} ${type} places`);
    return count;

  } catch (error) {
    console.error(`[Amenities] Places fetch error for ${type}:`, error);
    return 0;
  }
}

/**
 * Compute amenities score based on counts
 */
function computeAmenitiesScore(grocery: number, restaurants: number, gyms: number, hospitals: number, shopping: number): number {
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
function generateAmenitiesNote(grocery: number, restaurants: number, gyms: number, hospitals: number, shopping: number): string {
  const parts = [];
  
  if (grocery > 0) parts.push(`${grocery} grocery stores`);
  if (restaurants > 0) parts.push(`${restaurants} restaurants`);
  if (gyms > 0) parts.push(`${gyms} gyms`);
  if (hospitals > 0) parts.push(`${hospitals} hospitals`);
  if (shopping > 0) parts.push(`${shopping} shopping centers`);
  
  if (parts.length === 0) {
    return 'Limited amenities nearby';
  }
  
  return `Nearby: ${parts.slice(0, 3).join(', ')}${parts.length > 3 ? '...' : ''}`;
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
    note: 'Amenities data unavailable - check local sources'
  };
}
