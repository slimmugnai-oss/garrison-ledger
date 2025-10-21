/**
 * TDY PER DIEM PROVIDER
 * 
 * Fetches GSA per-diem rates (M&IE + lodging cap)
 * Server-only, cached 30 days
 */

import type { PerDiemSpan } from '@/app/types/tdy';
import { getCache, setCache } from '@/lib/cache';
import { normalizeLocality, getDateRange } from './util';

export interface PerDiemRate {
  mie_cents: number;
  lodging_cap_cents: number;
}

/**
 * Get per-diem rate for a locality and date
 * Returns M&IE and lodging cap in cents
 */
export async function getPerDiemRate(
  locality: string,
  dateISO: string
): Promise<PerDiemRate | null> {
  
  const normalized = normalizeLocality(locality);
  const yearMonth = dateISO.substring(0, 7); // YYYY-MM
  const cacheKey = `gsa:perdiem:${normalized}:${yearMonth}`;

  // Check cache first
  const cached = await getCache<PerDiemRate>(cacheKey);
  if (cached) return cached;

  const gsaApiKey = process.env.GSA_API_KEY;

  if (!gsaApiKey) {
    return getFallbackRate();
  }

  try {
    // Call GSA Per Diem API v2
    // Extract ZIP or City,State from normalized string
    let searchParam = '';
    if (normalized.startsWith('ZIP:')) {
      searchParam = normalized.substring(4);
    } else if (normalized.startsWith('CITY:')) {
      searchParam = normalized.substring(5);
    }

    const year = dateISO.substring(0, 4);
    
    // GSA API endpoint (adjust to actual API structure)
    const response = await fetch(
      `https://api.gsa.gov/travel/perdiem/v2/rates/city/${searchParam}/year/${year}`,
      {
        headers: {
          'X-API-Key': gsaApiKey
        }
      }
    );

    if (!response.ok) {
      return getFallbackRate();
    }

    const data = await response.json();
    
    // Parse GSA response (adjust based on actual API structure)
    const rate: PerDiemRate = {
      mie_cents: (data.meals || 59) * 100, // GSA returns dollars
      lodging_cap_cents: (data.lodging || 94) * 100
    };

    // Cache for 30 days
    await setCache(cacheKey, rate, 30 * 24 * 3600);
    
    return rate;

  } catch {
    return getFallbackRate();
  }
}

/**
 * Compute per-diem spans for entire trip
 * Breaks trip into contiguous spans (same locality)
 */
export async function computePerDiemSpans(args: {
  destination: string;
  startDate: string;
  endDate: string;
}): Promise<PerDiemSpan[]> {
  
  const { destination, startDate, endDate } = args;
  
  // For v1, assume single locality for entire trip
  // v2: Support multi-leg trips
  
  const rate = await getPerDiemRate(destination, startDate);

  if (!rate) {
    // Return with null rates - will generate RATE_LOOKUP_FAILED flag
    return [{
      locality: normalizeLocality(destination),
      start: startDate,
      end: endDate,
      mie_cents: 0,
      lodging_cap_cents: 0
    }];
  }

  return [{
    locality: normalizeLocality(destination),
    start: startDate,
    end: endDate,
    mie_cents: rate.mie_cents,
    lodging_cap_cents: rate.lodging_cap_cents
  }];
}

/**
 * Fallback per-diem rate (standard CONUS default)
 * Used when GSA API unavailable
 */
function getFallbackRate(): PerDiemRate {
  return {
    mie_cents: 5900,  // $59/day (standard CONUS M&IE as of 2025)
    lodging_cap_cents: 9800  // $98/day (standard CONUS lodging)
  };
}

