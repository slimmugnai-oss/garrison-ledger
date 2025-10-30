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
 * Google Weather API Response Types (Current Conditions endpoint)
 */
interface GoogleWeatherResponse {
  temperature?: {
    degrees: number;
    unit: "CELSIUS" | "FAHRENHEIT";
  };
  weatherCondition?: {
    description?: {
      text: string;
      languageCode?: string;
    };
    type?: string;
  };
  relativeHumidity?: number;
  feelsLikeTemperature?: {
    degrees: number;
    unit: "CELSIUS" | "FAHRENHEIT";
  };
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
  console.log(`[DEBUG] weatherComfortIndex called for ZIP: ${zip}`);

  // CRITICAL: v4 cache key to bust corrupted old data
  const cacheKey = `gweather:index:v4:${zip}`;

  const cached = await getCache<{ index10: number; note: string }>(cacheKey);
  if (cached) {
    console.log(`[DEBUG] Cache hit for weather: ${zip}`, cached);
    return cached;
  }

  console.log(`[DEBUG] Cache miss for weather: ${zip}, fetching from Google Weather API`);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // Attempt to fetch real weather data from Google Weather API
    if (!apiKey) {
      console.warn(`[WEATHER] GOOGLE_MAPS_API_KEY not configured, using defaults for ${zip}`);
      const result = getDefaultWeatherForZip(zip);
      await setCache(cacheKey, result, 24 * 3600);
      return result;
    }

    // Step 1: Geocode ZIP to lat/lon
    const coords = await geocodeZipForWeather(zip);
    if (coords.lat === 0 && coords.lon === 0) {
      console.warn(`[WEATHER] Failed to geocode ZIP ${zip}, using defaults`);
      const result = getDefaultWeatherForZip(zip);
      await setCache(cacheKey, result, 24 * 3600);
      return result;
    }

    // Step 2: Fetch weather from Google Weather API (Current Conditions endpoint)
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${coords.lat}&location.longitude=${coords.lon}&key=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      console.warn(`[WEATHER] Google Weather API error ${weatherResponse.status} for ${zip}, using defaults`);
      const result = getDefaultWeatherForZip(zip);
      await setCache(cacheKey, result, 24 * 3600);
      return result;
    }

    const weatherData = (await weatherResponse.json()) as GoogleWeatherResponse;
    const result = analyzeWeatherData(weatherData);
    console.log(`[DEBUG] Fetched real weather for ${zip}:`, result);
    await setCache(cacheKey, result, 24 * 3600);
    return result;
  } catch (error) {
    console.error(`[DEBUG] Error in weatherComfortIndex for ${zip}:`, error);
    // Fallback to region-specific defaults on error
    const fallback = getDefaultWeatherForZip(zip);
    console.log(`[DEBUG] Using fallback weather for ${zip}:`, fallback);
    return fallback;
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
 * Analyze OpenWeatherMap data and compute comfort index
 */
function analyzeOpenWeatherData(data: any): { index10: number; note: string } {
  try {
    const tempF = data.main?.temp || 70;
    const humidity = data.main?.humidity || 50;
    const description = data.weather?.[0]?.description || "Moderate";

    // Compute comfort index based on current conditions
    let index = 10;

    // Temperature penalties
    if (tempF > 90) index -= 2;
    else if (tempF > 85) index -= 1;
    else if (tempF < 32) index -= 2;
    else if (tempF < 40) index -= 1;

    // Humidity penalty (if extreme)
    if (humidity > 80) index -= 1;
    if (humidity < 20) index -= 0.5;

    // Weather condition penalties
    if (description && typeof description === "string") {
      const desc = description.toLowerCase();
      if (desc.includes("rain") || desc.includes("drizzle")) index -= 0.5;
      if (desc.includes("storm") || desc.includes("thunder")) index -= 1;
      if (desc.includes("snow")) index -= 1;
    }

    // Clamp to 0-10
    index = Math.max(0, Math.min(10, index));

    const note = `Current: ${Math.round(tempF)}°F, ${Math.round(humidity)}% humidity, ${description}`;

    return {
      index10: Math.round(index * 10) / 10,
      note,
    };
  } catch {
    return {
      index10: 7,
      note: "Unable to analyze weather data",
    };
  }
}

/**
 * Get default weather data based on ZIP code region
 */
function getDefaultWeatherForZip(zip: string): { index10: number; note: string } {
  const zipNum = parseInt(zip);

  // Default weather by region
  if (zipNum >= 98000 && zipNum <= 99999) {
    // Washington - moderate climate
    return { index10: 8, note: "Moderate Pacific Northwest climate" };
  } else if (zipNum >= 90000 && zipNum <= 96699) {
    // California - generally good weather
    return { index10: 9, note: "Mild California climate" };
  } else if (zipNum >= 10000 && zipNum <= 19999) {
    // Northeast - variable weather
    return { index10: 7, note: "Variable Northeast climate" };
  } else if (zipNum >= 30000 && zipNum <= 39999) {
    // Southeast - warm and humid
    return { index10: 8, note: "Warm Southeast climate" };
  } else if (zipNum >= 50000 && zipNum <= 59999) {
    // Midwest - continental climate
    return { index10: 7, note: "Continental Midwest climate" };
  } else if (zipNum >= 70000 && zipNum <= 79999) {
    // South - warm climate
    return { index10: 8, note: "Warm Southern climate" };
  } else if (zipNum >= 80000 && zipNum <= 89999) {
    // Mountain West - dry climate
    return { index10: 8, note: "Dry Mountain West climate" };
  }

  // Default fallback
  return { index10: 7, note: "Moderate climate" };
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

    // Humidity from API response (relativeHumidity field)
    const humidity = data.relativeHumidity ?? 50;

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
