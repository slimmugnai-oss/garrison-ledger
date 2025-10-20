/**
 * WEATHER PROVIDER (Google Weather via RapidAPI)
 * 
 * Computes weather comfort index (0-10) for a ZIP code
 * Server-only, cached 24h
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

  const apiKey = process.env.RAPIDAPI_KEY;
  const host = 'google-weather.p.rapidapi.com';

  if (!apiKey) {
    console.warn('[Weather] Google Weather API key not configured');
    return {
      index10: 7, // Neutral-positive score
      note: 'Weather data unavailable'
    };
  }

  try {
    // Google Weather API via RapidAPI
    const response = await fetch(
      `https://${host}/weather?q=${zip}&units=imperial`,
      { 
        headers: { 
          'X-RapidAPI-Host': host,
          'X-RapidAPI-Key': apiKey,
          'Accept': 'application/json'
        },
        next: { revalidate: 86400 } // 24h cache
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Weather] Google Weather API error:', response.status, errorText);
      return {
        index10: 7,
        note: 'Weather data temporarily unavailable'
      };
    }

    const data = await response.json();
    const result = analyzeWeatherData(data);
    
    await setCache(cacheKey, result, 24 * 3600); // 24h cache
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
 * Analyze weather data from Google Weather and compute comfort index
 */
function analyzeWeatherData(data: any): { index10: number; note: string } {
  
  try {
    // Google Weather API structure:
    // { current_condition: [...], weather: [...] }
    
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

