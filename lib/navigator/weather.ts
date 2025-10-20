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

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn('[Weather] ⚠️ RAPIDAPI_KEY not configured');
    return { index10: 7, note: 'Weather data unavailable' };
  }

  try {
    // Google Weather API via RapidAPI
    // Trying multiple possible endpoints since user is subscribed
    console.log(`[Weather] Fetching weather for ZIP ${zip}...`);
    
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/current.json?q=${zip}`,
      { 
        headers: { 
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
          'X-RapidAPI-Key': apiKey,
          'Accept': 'application/json'
        },
        next: { revalidate: 86400 } // 24h cache
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Weather] API error for ZIP ${zip}:`, response.status, errorText);
      
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
 * Analyze weather data from WeatherAPI.com and compute comfort index
 */
function analyzeWeatherData(data: any): { index10: number; note: string } {
  
  try {
    // WeatherAPI.com structure:
    // { current: { temp_f, humidity, condition: { text } }, location: {...} }
    
    const current = data.current;
    const tempF = current?.temp_f || 70;
    const humidity = current?.humidity || 50;
    const description = current?.condition?.text || 'unknown';
    
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
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) index -= 0.5;
    if (desc.includes('storm') || desc.includes('thunder')) index -= 1;
    if (desc.includes('snow')) index -= 1;

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

