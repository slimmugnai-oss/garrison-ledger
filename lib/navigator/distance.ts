/**
 * DISTANCE/COMMUTE PROVIDER (Google Distance Matrix)
 *
 * Computes AM/PM commute times with traffic
 * Server-only, cached 24h
 */

import { getCache, setCache } from "@/lib/cache";

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

  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    // Attempt to fetch real commute times from Google Distance Matrix API
    if (!apiKey) {
      console.warn(`[COMMUTE] GOOGLE_API_KEY not configured, using defaults for ${args.zip}`);
      const result = getDefaultCommuteTimes(args.zip);
      await setCache(cacheKey, result, 24 * 3600);
      return result;
    }

    // Calculate AM (8:00) and PM (17:00) commute times in parallel
    const am8Time = nextWeekdayTime(8, 0);
    const pm5Time = nextWeekdayTime(17, 0);

    const origin = args.zip; // Google accepts ZIP codes directly
    const destination = `${args.gate.lat},${args.gate.lng}`;

    const [amMinutes, pmMinutes] = await Promise.all([
      callDistanceMatrix({ origin, destination, departureTime: am8Time, apiKey }),
      callDistanceMatrix({ origin, destination, departureTime: pm5Time, apiKey }),
    ]);

    // If either call failed, use defaults
    if (amMinutes === null || pmMinutes === null) {
      console.warn(`[COMMUTE] Google Distance Matrix API failed for ${args.zip}, using defaults`);
      const result = getDefaultCommuteTimes(args.zip);
      await setCache(cacheKey, result, 24 * 3600);
      return result;
    }

    const result = { am: amMinutes, pm: pmMinutes };
    console.log(`[DEBUG] Fetched real commute for ${args.zip}:`, result);
    await setCache(cacheKey, result, 24 * 3600); // 24h cache
    return result;
  } catch (error) {
    console.error(`[DEBUG] Error in commuteMinutesFromZipToGate for ${args.zip}:`, error);
    // Fallback to region-specific defaults on error
    const fallback = getDefaultCommuteTimes(args.zip);
    return fallback;
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
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", args.origin);
    url.searchParams.set("destinations", args.destination);
    url.searchParams.set("departure_time", args.departureTime.toString());
    url.searchParams.set("traffic_model", "best_guess");
    url.searchParams.set("key", args.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.rows?.[0]?.elements?.[0]) {
      return null;
    }

    const element = data.rows[0].elements[0];

    if (element.status !== "OK" || !element.duration_in_traffic) {
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

/**
 * Get default commute times based on ZIP code region
 */
function getDefaultCommuteTimes(zip: string): { am: number | null; pm: number | null } {
  const zipNum = parseInt(zip);

  // Default commute times by region (based on typical traffic patterns)
  if (zipNum >= 98000 && zipNum <= 99999) {
    // Washington - moderate traffic
    return { am: 25, pm: 30 };
  } else if (zipNum >= 90000 && zipNum <= 96699) {
    // California - heavy traffic
    return { am: 35, pm: 45 };
  } else if (zipNum >= 10000 && zipNum <= 19999) {
    // Northeast - heavy traffic
    return { am: 40, pm: 50 };
  } else if (zipNum >= 30000 && zipNum <= 39999) {
    // Southeast - moderate traffic
    return { am: 20, pm: 25 };
  } else if (zipNum >= 50000 && zipNum <= 59999) {
    // Midwest - light traffic
    return { am: 15, pm: 18 };
  } else if (zipNum >= 70000 && zipNum <= 79999) {
    // South - light to moderate traffic
    return { am: 18, pm: 22 };
  } else if (zipNum >= 80000 && zipNum <= 89999) {
    // Mountain West - light traffic
    return { am: 12, pm: 15 };
  }

  // Default fallback
  return { am: 20, pm: 25 };
}
