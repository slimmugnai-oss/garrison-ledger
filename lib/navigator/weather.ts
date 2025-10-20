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

  // Weather API temporarily disabled - requires OpenWeatherMap subscription via RapidAPI
  // TODO: Either subscribe to OpenWeatherMap or use alternative weather service
  console.log('[Weather] Using neutral fallback (API subscription needed)');
  
  const fallbackResult = {
    index10: 7, // Neutral score (doesn't penalize or boost)
    note: 'Weather data pending API configuration'
  };
  
  await setCache(cacheKey, fallbackResult, 24 * 3600);
  return fallbackResult;

  /* Disabled until OpenWeatherMap subscription is active
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn('[Weather] ⚠️ RAPIDAPI_KEY not configured');
    return { index10: 7, note: 'Weather data unavailable' };
  }

  try {
    // OpenWeatherMap API via RapidAPI (requires subscription)
    const response = await fetch(
      `https://community-open-weather-map.p.rapidapi.com/weather?zip=${zip},us&units=imperial`,
      { headers: { 
          'X-RapidAPI-Host': 'community-open-weather-map.p.rapidapi.com',
          'X-RapidAPI-Key': apiKey,
          'Accept': 'application/json'
        },
        next: { revalidate: 86400 }
      }
    );

    if (!response.ok) {
      console.error('[Weather] API error:', response.status);
      return { index10: 7, note: 'Weather data temporarily unavailable' };
    }

    const data = await response.json();
    const result = analyzeWeatherData(data);
    await setCache(cacheKey, result, 24 * 3600);
    return result;
  } catch (error) {
    console.error('[Weather] Fetch error:', error);
    return { index10: 7, note: 'Weather data unavailable' };
  }
  */
}

/**
 * Analyze weather data from OpenWeatherMap and compute comfort index
 */
function analyzeWeatherData(data: any): { index10: number; note: string } {
  
  try {
    // OpenWeatherMap API structure:
    // { main: { temp, humidity }, weather: [...] }
    
    const tempF = data.main?.temp || 70;
    const humidity = data.main?.humidity || 50;
    const description = data.weather?.[0]?.description || 'unknown';
    
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
    if (description.includes('rain') || description.includes('drizzle')) index -= 0.5;
    if (description.includes('storm') || description.includes('thunder')) index -= 1;
    if (description.includes('snow')) index -= 1;

    // Clamp to 0-10
    index = Math.max(0, Math.min(10, index));

    const note = `Current: ${Math.round(tempF)}°F, ${humidity}% humidity, ${description}`;

    return {
      index10: Math.round(index * 10) / 10,
      note
    };

  } catch (error) {
    console.error('[Weather] Analysis error:', error);
    return {
      index10: 7,
      note: 'Unable to analyze weather data'
    };
  }
}

