/**
 * DISTANCE/COMMUTE PROVIDER (Google Distance Matrix)
 * 
 * Computes AM/PM commute times with traffic
 * Server-only, cached 24h
 */

import { getCache, setCache } from '@/lib/cache';

/**
 * Compute commute minutes from ZIP to base gate
 * Returns AM (8:00) and PM (17:00) estimates with traffic
 */
export async function commuteMinutesFromZipToGate(args: {
  zip: string;
  gate: { lat: number; lng: number };
}): Promise<{ am: number | null; pm: number | null }> {
  
  const cacheKey = `gdm:commute:${args.zip}:${args.gate.lat.toFixed(3)},${args.gate.lng.toFixed(3)}`;
  const cached = await getCache<{ am: number | null; pm: number | null }>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return { am: null, pm: null };
  }

  try {
    // Compute next weekday 8AM and 5PM timestamps
    const am8Time = nextWeekdayTime(8, 0);
    const pm5Time = nextWeekdayTime(17, 0);

    // Call Distance Matrix API twice (AM and PM)
    const amMinutes = await callDistanceMatrix({
      origin: args.zip,
      destination: `${args.gate.lat},${args.gate.lng}`,
      departureTime: am8Time,
      apiKey
    });

    const pmMinutes = await callDistanceMatrix({
      origin: args.zip,
      destination: `${args.gate.lat},${args.gate.lng}`,
      departureTime: pm5Time,
      apiKey
    });

    const result = { am: amMinutes, pm: pmMinutes };
    
    await setCache(cacheKey, result, 24 * 3600); // 24h cache
    return result;

  } catch {
    return { am: null, pm: null };
  }
}

/**
 * Call Google Distance Matrix API
 */
async function callDistanceMatrix(args: {
  origin: string;
  destination: string;
  departureTime: number;
  apiKey: string;
}): Promise<number | null> {
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins', args.origin);
    url.searchParams.set('destinations', args.destination);
    url.searchParams.set('departure_time', args.departureTime.toString());
    url.searchParams.set('traffic_model', 'best_guess');
    url.searchParams.set('key', args.apiKey);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      return null;
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK' || !element.duration_in_traffic) {
      return null;
    }

    // Duration in seconds → convert to minutes
    const seconds = element.duration_in_traffic.value;
    const minutes = Math.round(seconds / 60);

    return minutes;

  } catch {
    return null;
  }
}

/**
 * Get next weekday timestamp at specific hour/minute
 * Skips weekends to get realistic traffic estimates
 */
function nextWeekdayTime(hour: number, minute: number): number {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  let daysToAdd = 1;
  
  if (currentDay === 5) {
    // Friday → Monday
    daysToAdd = 3;
  } else if (currentDay === 6) {
    // Saturday → Monday
    daysToAdd = 2;
  } else {
    // Weekday → next day (or same day if time hasn't passed)
    daysToAdd = 1;
  }

  const targetDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysToAdd,
    hour,
    minute,
    0
  );

  // Return Unix timestamp in seconds
  return Math.floor(targetDate.getTime() / 1000);
}

