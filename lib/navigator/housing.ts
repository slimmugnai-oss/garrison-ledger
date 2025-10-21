/**
 * HOUSING PROVIDER (Zillow via RapidAPI)
 * 
 * Fetches median rent and sample listings
 * Server-only, cached 24h
 */

import type { Listing } from '@/app/types/navigator';
import { getCache, setCache } from '@/lib/cache';

/**
 * Zillow API Response Types
 */
interface ZillowProperty {
  price?: number;
  unformattedPrice?: number;
  address?: {
    streetAddress?: string;
    zipcode?: string;
  };
  streetAddress?: string;
  detailUrl?: string;
  zpid?: string;
  imgSrc?: string;
  photos?: string[];
  bedrooms?: number;
  bathrooms?: number;
  latitude?: number;
  longitude?: number;
  rentZestimate?: number;
}

interface ZillowSearchResponse {
  props?: ZillowProperty[];
}

interface ZillowPropertyResponse extends ZillowProperty {}

/**
 * Fetch median rent for ZIP and bedroom count
 */
export async function fetchMedianRent(zip: string, bedrooms: number): Promise<number | null> {
  const cacheKey = `zillow:median:${zip}:b${bedrooms}`;
  const cached = await getCache<number>(cacheKey);
  if (cached !== null) return cached;

  const host = process.env.ZILLOW_RAPIDAPI_HOST;
  const apiKey = process.env.ZILLOW_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;

  if (!host || !apiKey) {
    return null;
  }

  try {
    // Zillow rental search via RapidAPI
    const response = await fetch(
      `https://${host}/propertyExtendedSearch?location=${zip}&status_type=ForRent&bedsMin=${bedrooms}&bedsMax=${bedrooms}`,
      {
        headers: {
          'X-RapidAPI-Host': host,
          'X-RapidAPI-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as ZillowSearchResponse;
    
    // Extract prices and compute median
    const prices: number[] = (data.props || [])
      .map((p) => p.price || p.unformattedPrice)
      .filter((p): p is number => typeof p === 'number' && p > 0);

    if (prices.length === 0) {
      return null;
    }

    prices.sort((a, b) => a - b);
    const medianDollars = prices[Math.floor(prices.length / 2)];
    const medianCents = Math.round(medianDollars * 100);

    await setCache(cacheKey, medianCents, 24 * 3600); // 24h cache
    return medianCents;

  } catch {
    return null;
  }
}

/**
 * Fetch sample listings (top 3)
 */
export async function fetchSampleListings(zip: string, bedrooms: number): Promise<Listing[]> {
  const cacheKey = `zillow:listings:${zip}:b${bedrooms}`;
  const cached = await getCache<Listing[]>(cacheKey);
  if (cached) return cached;

  const host = process.env.ZILLOW_RAPIDAPI_HOST;
  const apiKey = process.env.ZILLOW_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;

  if (!host || !apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `https://${host}/propertyExtendedSearch?location=${zip}&status_type=ForRent&bedsMin=${bedrooms}&bedsMax=${bedrooms}&home_type=Houses`,
      {
        headers: {
          'X-RapidAPI-Host': host,
          'X-RapidAPI-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as ZillowSearchResponse;
    
    // Parse listings (adjust to actual API structure)
    const listings: Listing[] = (data.props || [])
      .slice(0, 3)
      .map((p) => ({
        title: p.address?.streetAddress || p.streetAddress || 'Listing',
        price_cents: (p.price || p.unformattedPrice || 0) * 100,
        url: p.detailUrl || p.zpid ? `https://www.zillow.com/homedetails/${p.zpid}_zpid/` : '',
        photo: p.imgSrc || p.photos?.[0],
        zip: p.address?.zipcode || zip,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms
      }));

    await setCache(cacheKey, listings, 24 * 3600); // 24h cache
    return listings;

  } catch (error) {
    return [];
  }
}

/**
 * Analyze a specific listing URL
 */
export async function analyzeListingUrl(url: string): Promise<Listing & { lat?: number; lng?: number } | null> {
  const cacheKey = `zillow:analyze:${encodeURIComponent(url)}`;
  const cached = await getCache<Listing & { lat?: number; lng?: number }>(cacheKey);
  if (cached) return cached;

  const host = process.env.ZILLOW_RAPIDAPI_HOST;
  const apiKey = process.env.ZILLOW_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;

  if (!host || !apiKey) {
    return null;
  }

  try {
    // Extract ZPID from URL if possible
    const zpidMatch = url.match(/\/(\d+)_zpid/);
    if (!zpidMatch) {
      return null;
    }

    const zpid = zpidMatch[1];

    // Fetch listing details
    const response = await fetch(
      `https://${host}/property?zpid=${zpid}`,
      {
        headers: {
          'X-RapidAPI-Host': host,
          'X-RapidAPI-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as ZillowPropertyResponse;
    
    const listing = {
      title: data.address?.streetAddress || 'Listing',
      price_cents: (data.price || data.rentZestimate || 0) * 100,
      url,
      photo: data.imgSrc || data.photos?.[0],
      zip: data.address?.zipcode,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      lat: data.latitude,
      lng: data.longitude
    };

    await setCache(cacheKey, listing, 24 * 3600);
    return listing;

  } catch {
    return null;
  }
}

