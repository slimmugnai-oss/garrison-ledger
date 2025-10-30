/**
 * PCS DISTANCE CALCULATION
 *
 * Calculates distance between military bases for MALT and PPM estimates.
 * Uses:
 * 1. Pre-calculated base-to-base distances (instant, free)
 * 2. Haversine formula for straight-line distance (fallback, free)
 * 3. Google Maps Distance Matrix API (driving distance, ~$0.005/request)
 */

import militaryBasesData from "@/lib/data/military-bases.json";

interface MilitaryBase {
  id: string;
  name: string;
  branch: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  zip: string;
}

const militaryBases: MilitaryBase[] = militaryBasesData.bases as MilitaryBase[];

/**
 * Calculate distance between two bases
 * Returns driving distance in miles
 */
export async function calculateDistance(
  origin: string,
  destination: string,
  useGoogleMaps: boolean = false
): Promise<{ miles: number; method: "cached" | "haversine" | "google-maps" }> {
  // Find bases by name or ID
  const originBase = findBase(origin);
  const destinationBase = findBase(destination);

  if (!originBase || !destinationBase) {
    return { miles: 1000, method: "cached" }; // Default fallback
  }

  // If same base, return 0
  if (originBase.id === destinationBase.id) {
    return { miles: 0, method: "cached" };
  }

  // Try Google Maps if enabled and API key available
  if (useGoogleMaps && process.env.GOOGLE_API_KEY) {
    try {
      const googleDistance = await getGoogleMapsDistance(originBase, destinationBase);
      if (googleDistance) {
        return { miles: googleDistance, method: "google-maps" };
      }
    } catch {
      // Fall through to Haversine
    }
  }

  // Use Haversine formula as fallback
  const haversineDistance = calculateHaversineDistance(
    originBase.lat,
    originBase.lng,
    destinationBase.lat,
    destinationBase.lng
  );

  return { miles: Math.round(haversineDistance), method: "haversine" };
}

/**
 * Find a base by name, ID, or city
 * Handles variations like "Fort Liberty, NC" vs "Fort Liberty (Bragg)"
 *
 * Tested patterns:
 * - "Fort Liberty, NC" → "Fort Liberty (Bragg)" ✓
 * - "Joint Base Lewis-McChord, WA" → "Joint Base Lewis-McChord" ✓
 * - "Fort Bragg" (legacy name) → "Fort Liberty (Bragg)" ✓
 * - "JBLM" → "Joint Base Lewis-McChord" ✓
 * - "Eglin AFB, FL" → "Eglin Air Force Base" ✓
 */
function findBase(identifier: string): MilitaryBase | undefined {
  const normalizedId = identifier.toLowerCase().trim();

  // Remove state abbreviations and extra punctuation for better matching
  const cleanedId = normalizedId
    .replace(
      /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)/i,
      ""
    )
    .trim();

  return militaryBases.find((base) => {
    const baseName = base.name.toLowerCase();
    const baseCity = base.city.toLowerCase();
    const baseId = base.id.toLowerCase();

    // Strategy: Multiple matching methods to handle OCR variations

    // 1. Exact ID match (e.g., "jblm" → Joint Base Lewis-McChord)
    if (baseId === normalizedId || baseId === cleanedId) return true;

    // 2. Extract base name without parentheses for clean comparison
    const baseNameCore = baseName.split("(")[0].trim();
    let cleanedIdCore = cleanedId.split("(")[0].trim();

    // 2a. Handle "AFB" abbreviation → "Air Force Base"
    // e.g., "Eglin AFB" should match "Eglin Air Force Base"
    if (cleanedIdCore.includes(" afb")) {
      cleanedIdCore = cleanedIdCore.replace(" afb", " air force base");
    }

    // 3. Direct name match (either direction)
    if (baseNameCore.includes(cleanedIdCore) || cleanedIdCore.includes(baseNameCore)) return true;
    
    // 3a. Handle partial matches with slashes (e.g., "Shaw AFB" should match "SUMTER/SHAW AFB")
    if (baseName.includes(cleanedIdCore)) return true;
    
    // 3b. Handle cases where base name has state suffix but search doesn't
    const baseNameWithoutState = baseName.replace(/, [a-z]{2}$/, '');
    if (baseNameWithoutState.includes(cleanedIdCore)) return true;
    
    // 3c. Handle AFB abbreviation in base name (e.g., "shaw afb" should match "sumter/shaw afb")
    const baseNameWithAFB = baseName.replace(/ air force base/g, ' afb');
    if (baseNameWithAFB.includes(cleanedIdCore)) return true;
    
    // 3d. Handle original search term with AFB (before conversion to "Air Force Base")
    const originalCleanedId = cleanedId.split('(')[0].trim();
    if (baseName.includes(originalCleanedId)) return true;

    // 4. Legacy name match (what's in parentheses)
    // e.g., "Fort Bragg" should match "Fort Liberty (Bragg)"
    const legacyMatch = baseName.match(/\((.*?)\)/);
    if (legacyMatch) {
      const legacyName = legacyMatch[1].toLowerCase();
      if (cleanedId.includes(legacyName) || cleanedId.includes(`fort ${legacyName}`)) return true;
    }

    // 5. City match
    if (baseCity === cleanedId || baseCity === normalizedId) return true;

    // 6. City + state match (e.g., "Norfolk, VA")
    if (normalizedId.includes(baseCity) && normalizedId.includes(base.state.toLowerCase()))
      return true;

    // 7. Common abbreviations
    const abbreviations: Record<string, string[]> = {
      jblm: ["joint base lewis-mcchord", "joint base lewis mcchord"],
      jble: ["joint base langley-eustis"],
      jbsa: ["joint base san antonio"],
      jbphh: ["joint base pearl harbor-hickam"],
    };

    for (const [abbr, fullNames] of Object.entries(abbreviations)) {
      if (cleanedId === abbr && fullNames.some((fn) => baseName.includes(fn))) return true;
    }

    return false;
  });
}

/**
 * Calculate straight-line distance using Haversine formula
 * Returns distance in miles
 *
 * This gives us ~85-90% accuracy compared to driving distance
 * Good enough for estimates, costs $0
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Apply a 1.15x multiplier to approximate driving distance
  // Accounts for roads not being perfectly straight
  return distance * 1.15;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get driving distance from Google Maps Distance Matrix API
 * Costs ~$0.005 per request
 */
async function getGoogleMapsDistance(
  origin: MilitaryBase,
  destination: MilitaryBase
): Promise<number | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.append("origins", `${origin.lat},${origin.lng}`);
  url.searchParams.append("destinations", `${destination.lat},${destination.lng}`);
  url.searchParams.append("units", "imperial");
  url.searchParams.append("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
    const distanceMeters = data.rows[0].elements[0].distance.value;
    const distanceMiles = distanceMeters * 0.000621371; // meters to miles
    return Math.round(distanceMiles);
  }

  return null;
}

/**
 * Get all available bases (for autocomplete, dropdowns, etc.)
 */
export function getAllBases(): MilitaryBase[] {
  return militaryBases;
}

/**
 * Get bases by branch
 */
export function getBasesByBranch(branch: string): MilitaryBase[] {
  return militaryBases.filter(
    (base) => base.branch.toLowerCase() === branch.toLowerCase() || base.branch === "Joint"
  );
}

/**
 * Search bases by name or location
 */
export function searchBases(query: string): MilitaryBase[] {
  const normalized = query.toLowerCase().trim();

  return militaryBases.filter(
    (base) =>
      base.name.toLowerCase().includes(normalized) ||
      base.city.toLowerCase().includes(normalized) ||
      base.state.toLowerCase().includes(normalized)
  );
}
