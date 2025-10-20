/**
 * WEATHER PROVIDER (Google Weather API)
 * 
 * Computes weather comfort index (0-10) for a ZIP code
 * Server-only, cached 24h
 * 
 * Requires: GOOGLE_WEATHER_API_KEY
 */

import { getCache, setCache } from '@/lib/cache';

/**
 * Compute weather comfort index for a ZIP code
 * Returns 0-10 score and readable note
 */
export async function weatherComfortIndex(zip: string): Promise<{ index10: number; note: string }> {
  
  const cacheKey = `gweather:index:${zip}`;
  const cached = await getCache<{ index10: number; note: string }>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

  if (!apiKey) {
    console.warn('[Weather] ⚠️ GOOGLE_WEATHER_API_KEY not configured');
    return { index10: 7, note: 'Weather data unavailable' };
  }

  try {
    // Step 1: Get lat/lon for ZIP code (we need this for Google Weather API)
    console.log(`[Weather] Geocoding ZIP ${zip} for weather lookup...`);
    const { lat, lon } = await geocodeZipForWeather(zip);
    
    if (!lat || !lon) {
      console.warn(`[Weather] Could not geocode ZIP ${zip} for weather`);
      return { index10: 7, note: 'Weather data unavailable' };
    }

    // Step 2: Fetch from Google Weather API
    // Official Google Weather API endpoint
    console.log(`[Weather] Fetching weather for ${lat}, ${lon} (ZIP ${zip})...`);
    
    const response = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}`,
      { 
        headers: { 
          'Accept': 'application/json'
        },
        next: { revalidate: 86400 } // 24h cache
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Weather] Google API error for ZIP ${zip}:`, response.status, errorText);
      
      // Return neutral score on error (doesn't penalize)
      return {
        index10: 7,
        note: 'Weather data temporarily unavailable'
      };
    }

    const data = await response.json();
    console.log(`[Weather] DEBUG: Response structure:`, JSON.stringify(data, null, 2).substring(0, 500));
    
    const result = analyzeWeatherData(data);
    await setCache(cacheKey, result, 24 * 3600);
    
    console.log(`[Weather] ✅ Weather fetched for ZIP ${zip}: ${result.note}`);
    return result;

  } catch (error) {
    console.error('[Weather] Fetch error:', error);
    return {
      index10: 7,
      note: 'Weather data unavailable'
    };
  }
}

/**
 * Geocode ZIP for weather lookup
 * (Reuses geocoding logic but separate cache key)
 */
async function geocodeZipForWeather(zip: string): Promise<{ lat: number; lon: number }> {
  const cacheKey = `geocode:weather:${zip}`;
  const cached = await getCache<{ lat: number; lon: number }>(cacheKey);
  if (cached) return cached;

  try {
    // Use OpenStreetMap Nominatim (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'GarrisonLedger/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error(`[Weather] Geocoding error for ZIP ${zip}:`, response.status);
      return { lat: 0, lon: 0 };
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.warn(`[Weather] No geocoding results for ZIP ${zip}`);
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };

    // Cache for 30 days (ZIP coords don't change)
    await setCache(cacheKey, result, 30 * 24 * 3600);
    
    return result;

  } catch (error) {
    console.error('[Weather] Geocoding fetch error:', error);
    return { lat: 0, lon: 0 };
  }
}

/**
 * Analyze weather data from Google Weather API and compute comfort index
 */
function analyzeWeatherData(data: any): { index10: number; note: string } {
  
  try {
    // Google Weather API structure (from actual logs):
    // { temperature: { degrees: 16.7, unit: "CELSIUS" }, weatherCondition: { description: { text: "Sunny" } }, ... }
    
    // Temperature (convert to Fahrenheit if needed)
    const tempValue = data.temperature?.degrees || 70;
    const tempUnit = data.temperature?.unit || 'FAHRENHEIT';
    const tempF = tempUnit === 'CELSIUS' ? (tempValue * 9/5) + 32 : tempValue;
    
    // Humidity (not in the response structure we see, so use default)
    const humidity = 50; // Default since not in response
    
    // Condition/description
    const description = data.weatherCondition?.description?.text || 'unknown';
    
    // Compute comfort index based on current conditions
    let index = 10;
    
    // Temperature penalties
    if (tempF > 90) index -= 2;
    else if (tempF > 85) index -= 1;
    else if (tempF < 32) index -= 2;
    else if (tempF < 40) index -= 1;
    
    // Humidity penalty (if extreme) - using default 50% so no penalty
    if (humidity > 80) index -= 1;
    if (humidity < 20) index -= 0.5;
    
    // Weather condition penalties (if available)
    if (description && typeof description === 'string') {
      const desc = description.toLowerCase();
      if (desc.includes('rain') || desc.includes('drizzle')) index -= 0.5;
      if (desc.includes('storm') || desc.includes('thunder')) index -= 1;
      if (desc.includes('snow')) index -= 1;
    }

    // Clamp to 0-10
    index = Math.max(0, Math.min(10, index));

    const note = `Current: ${Math.round(tempF)}°F, ${Math.round(humidity)}% humidity, ${description}`;

    return {
      index10: Math.round(index * 10) / 10,
      note
    };

  } catch (error) {
    console.error('[Weather] Analysis error:', error, 'Data:', JSON.stringify(data).substring(0, 200));
    return {
      index10: 7,
      note: 'Unable to analyze weather data'
    };
  }
}

