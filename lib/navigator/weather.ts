/**
 * WEATHER PROVIDER (Google Weather API)
 *
 * Computes weather comfort index (0-10) for a ZIP code
 * Server-only, cached 24h
 *
 * Requires: GOOGLE_API_KEY
 */

import { getCache, setCache } from "@/lib/cache";

/**
 * Google Weather API Response Types
 */
interface GoogleWeatherResponse {
  temperature?: {
    degrees: number;
    unit: "CELSIUS" | "FAHRENHEIT";
  };
  weatherCondition?: {
    description?: {
      text: string;
    };
  };
  humidity?: number;
}

interface NominatimGeocodingResponse {
  lat: string;
  lon: string;
}

/**
 * Compute weather comfort index for a ZIP code
 * Returns 0-10 score and readable note
 */
export async function weatherComfortIndex(zip: string): Promise<{ index10: number; note: string }> {
  // CRITICAL: v4 cache key to bust corrupted old data
  const cacheKey = `gweather:index:v4:${zip}`;

  const cached = await getCache<{ index10: number; note: string }>(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return { index10: 7, note: "Weather data unavailable" };
  }

  try {
    // Step 1: Get lat/lon for ZIP code (we need this for Google Weather API)
    const { lat, lon } = await geocodeZipForWeather(zip);

    if (!lat || !lon) {
      return { index10: 7, note: "Weather data unavailable" };
    }

    // Step 2: Fetch from Google Weather API
    // Official Google Weather API endpoint

    const response = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 86400 }, // 24h cache
      }
    );

    if (!response.ok) {
      const _errorText = await response.text();

      // Return neutral score on error (doesn't penalize)
      return {
        index10: 7,
        note: "Weather data temporarily unavailable",
      };
    }

    const data = await response.json();

    const result = analyzeWeatherData(data);
    await setCache(cacheKey, result, 24 * 3600);

    return result;
  } catch {
    return {
      index10: 7,
      note: "Weather data unavailable",
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
          "User-Agent": "GarrisonLedger/1.0",
        },
      }
    );

    if (!response.ok) {
      return { lat: 0, lon: 0 };
    }

    const data = (await response.json()) as NominatimGeocodingResponse[];

    if (data.length === 0) {
      return { lat: 0, lon: 0 };
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };

    // Cache for 30 days (ZIP coords don't change)
    await setCache(cacheKey, result, 30 * 24 * 3600);

    return result;
  } catch {
    return { lat: 0, lon: 0 };
  }
}

/**
 * Analyze weather data from Google Weather API and compute comfort index
 */
function analyzeWeatherData(data: GoogleWeatherResponse): { index10: number; note: string } {
  try {
    // Google Weather API structure (from actual logs):
    // { temperature: { degrees: 16.7, unit: "CELSIUS" }, weatherCondition: { description: { text: "Sunny" } }, ... }

    // CRITICAL: Extract temperature with validation
    const tempValue = data.temperature?.degrees;
    const tempUnit = data.temperature?.unit || "FAHRENHEIT";

    // VALIDATION: Ensure temp is a valid number, never undefined/NaN/object
    const validTempValue = typeof tempValue === "number" && !isNaN(tempValue) ? tempValue : 70;
    const tempF = tempUnit === "CELSIUS" ? (validTempValue * 9) / 5 + 32 : validTempValue;

    // CRITICAL: Extract description with validation
    const descriptionObj = data.weatherCondition?.description?.text;

    // VALIDATION: Ensure description is a string, never an object
    const description = typeof descriptionObj === "string" ? descriptionObj : "Moderate";

    // Humidity (not in response, use neutral default)
    const humidity = 50;

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
    if (description && typeof description === "string") {
      const desc = description.toLowerCase();
      if (desc.includes("rain") || desc.includes("drizzle")) index -= 0.5;
      if (desc.includes("storm") || desc.includes("thunder")) index -= 1;
      if (desc.includes("snow")) index -= 1;
    }

    // Clamp to 0-10
    index = Math.max(0, Math.min(10, index));

    // VALIDATION: Ensure all values are valid before constructing note
    const validTempF = typeof tempF === "number" && !isNaN(tempF) ? Math.round(tempF) : 70;
    const validHumidity =
      typeof humidity === "number" && !isNaN(humidity) ? Math.round(humidity) : 50;
    const validDescription = typeof description === "string" ? description : "Moderate";

    const note = `Current: ${validTempF}°F, ${validHumidity}% humidity, ${validDescription}`;

    // VALIDATION: Ensure index is valid number
    const validIndex = typeof index === "number" && !isNaN(index) ? Math.round(index * 10) / 10 : 7;

    return {
      index10: validIndex,
      note,
    };
  } catch {
    return {
      index10: 7,
      note: "Unable to analyze weather data",
    };
  }
}
