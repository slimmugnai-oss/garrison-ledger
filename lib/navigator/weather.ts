/**
 * WEATHER PROVIDER (Google Weather)
 * 
 * Computes weather comfort index (0-10) for a ZIP code
 * Server-only, cached 7 days
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

  const apiKey = process.env.GOOGLE_WEATHER_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.warn('[Weather] Google Weather API key not configured');
    return {
      index10: 5, // Neutral score
      note: 'Weather data unavailable'
    };
  }

  try {
    // Use Official Google Weather API
    // Note: Google doesn't have a dedicated Weather API - using geocoding + other services
    // Simplified: Return neutral score with note for v1
    // Full implementation requires OpenWeatherMap or WeatherAPI integration
    
    // For v1: Return neutral score
    // Full weather integration (OpenWeatherMap or Google) coming in v1.1
    const result = {
      index10: 7, // Neutral-positive score
      note: 'Weather data integration coming in v1.1'
    };
    
    await setCache(cacheKey, result, 7 * 24 * 3600); // 7 day cache
    return result;

  } catch (error) {
    console.error('[Weather] Fetch error:', error);
    return {
      index10: 5,
      note: 'Weather data unavailable'
    };
  }
}

/**
 * Analyze weather data and compute comfort index
 */
function analyzeWeatherData(data: any): { comfortIndex: number; note: string } {
  
  try {
    // Get current conditions
    const current = data.current_condition?.[0];
    const tempF = parseInt(current?.temp_F) || 70;
    const humidity = parseInt(current?.humidity) || 50;
    
    // Get forecast data (if available)
    const forecast = data.weather || [];
    
    // Count extreme days in forecast
    let hotDays = 0;
    let coldDays = 0;
    let precipDays = 0;
    let summerHiF = tempF;
    let winterLoF = tempF;

    for (const day of forecast.slice(0, 7)) {
      const maxTemp = parseInt(day.maxtempF) || tempF;
      const minTemp = parseInt(day.mintempF) || tempF;
      const precipMM = parseFloat(day.precipMM) || 0;

      // Track extremes
      if (maxTemp > summerHiF) summerHiF = maxTemp;
      if (minTemp < winterLoF) winterLoF = minTemp;

      // Count uncomfortable days
      if (maxTemp > 90) hotDays++;
      if (minTemp < 32) coldDays++;
      if (precipMM > 5) precipDays++;
    }

    // Compute comfort index (start at 10, subtract penalties)
    let index = 10;
    
    // Temperature penalties
    index -= Math.min(3, hotDays * 0.5);     // -0.5 per hot day (max -3)
    index -= Math.min(3, coldDays * 0.5);    // -0.5 per cold day (max -3)
    
    // Precipitation penalty
    index -= Math.min(2, precipDays * 0.3);  // -0.3 per rainy day (max -2)
    
    // Humidity penalty (if extreme)
    if (humidity > 80) index -= 1;
    if (humidity < 20) index -= 0.5;

    // Clamp to 0-10
    index = Math.max(0, Math.min(10, index));

    const note = forecast.length > 0
      ? `${Math.round(summerHiF)}°F summer highs, ${Math.round(winterLoF)}°F winter lows; ${precipDays} rainy days (7d forecast)`
      : `Current: ${tempF}°F, ${humidity}% humidity`;

    return {
      comfortIndex: Math.round(index * 10) / 10,
      note
    };

  } catch (error) {
    console.error('[Weather] Analysis error:', error);
    return {
      comfortIndex: 5,
      note: 'Unable to analyze weather data'
    };
  }
}

