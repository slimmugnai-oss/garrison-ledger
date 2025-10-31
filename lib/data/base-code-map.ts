/**
 * BASE NAME TO CODE MAPPING
 * 
 * Maps full base names (from BaseAutocomplete) to base codes for navigation
 * Generated from military-bases.json
 */

import militaryBasesData from "./military-bases.json";
import baseMHAMap from "./base-mha-map.json";

interface MilitaryBase {
  id: string;
  name: string;
  branch: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  zip: string;
  aliases?: string[];
}

const militaryBases = militaryBasesData.bases as MilitaryBase[];

export interface BaseInfo {
  code: string;
  mha: string | null;
  name: string;
  state: string;
  city: string;
  branch: string;
  lat: number;
  lng: number;
}

/**
 * Get base code from full name (e.g., "Fort Liberty, NC" → "ftlb")
 * Used by BaseSearch component to navigate after autocomplete selection
 */
export function getBaseCodeFromName(fullName: string): BaseInfo | null {
  // Format from BaseAutocomplete: "Fort Liberty, NC" or "Shaw AFB, SC"
  const parts = fullName.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;

  const [baseName, state] = parts;

  // Find matching base in military-bases.json
  const base = militaryBases.find((b) => {
    // Exact name match
    if (b.name.toLowerCase() === baseName.toLowerCase()) return true;

    // Check if base name contains the search term (handles partial matches)
    if (b.name.toLowerCase().includes(baseName.toLowerCase()) && b.state === state) return true;

    // Check aliases (e.g., "Fort Bragg" → "Fort Liberty")
    if (b.aliases && b.aliases.some((a) => a.toLowerCase() === baseName.toLowerCase())) return true;

    return false;
  });

  if (!base) return null;

  // Generate code from ID (already in slug format: "fort-liberty-nc" → "ftlb")
  // Or use a smarter abbreviation
  const code = generateBaseCode(base.id, base.name);

  // Get MHA code from base-mha-map
  const mha = getMHAFromBaseName(base.name);

  return {
    code,
    mha,
    name: base.name,
    state: base.state,
    city: base.city,
    branch: base.branch,
    lat: base.lat,
    lng: base.lng,
  };
}

/**
 * Generate short base code from ID or name
 * Examples:
 * - "fort-liberty-nc" → "ftlb"
 * - "shaw-afb-sc" → "shaw"
 * - "camp-pendleton-ca" → "pendleton"
 */
function generateBaseCode(id: string, name: string): string {
  // Use ID as base (already in slug format)
  const parts = id.split("-");

  // Special handling for common patterns
  if (name.includes("AFB") || name.includes("Air Force Base")) {
    // For Air Force bases, use the city/base name
    // "shaw-afb-sc" → "shaw"
    return parts[0];
  }

  if (name.includes("Naval Station") || name.includes("NS ")) {
    // "naval-station-norfolk-va" → "nsnor"
    const cityIndex = parts.findIndex((p) => p !== "naval" && p !== "station");
    return cityIndex >= 0 ? `ns${parts[cityIndex].substring(0, 3)}` : parts[0];
  }

  if (name.includes("Marine Corps Base") || name.includes("MCB ")) {
    // "marine-corps-base-camp-pendleton-ca" → "mcbcp"
    const campIndex = parts.findIndex((p) => p === "camp");
    if (campIndex >= 0 && parts[campIndex + 1]) {
      return `mcb${parts[campIndex + 1].substring(0, 2)}`;
    }
  }

  if (name.includes("Joint Base") || name.includes("JB ")) {
    // "joint-base-lewis-mcchord-wa" → "jblm"
    const baseNames = parts.filter((p) => p !== "joint" && p !== "base" && p.length <= 2).join("");
    if (baseNames) return `jb${baseNames}`;
    
    // Fallback: use first letters of major words
    const majorWords = parts.filter((p) => p !== "joint" && p !== "base" && p !== "wa" && p !== "ca");
    return `jb${majorWords.slice(0, 2).map((w) => w[0]).join("")}`;
  }

  if (name.startsWith("Fort ") || name.startsWith("FORT ")) {
    // "fort-liberty-nc" → "ftlb"
    const fortName = parts[1];
    if (fortName) return `ft${fortName.substring(0, 2)}`;
  }

  // Default: use first 4-6 characters of ID
  return id.replace(/-/g, "").substring(0, 6);
}

/**
 * Get MHA code from base name using base-mha-map.json
 */
function getMHAFromBaseName(baseName: string): string | null {
  const baseToMHA = baseMHAMap.baseToMHA as Record<string, string>;

  // Try exact match (uppercase)
  const upperName = baseName.toUpperCase();
  if (baseToMHA[upperName]) return baseToMHA[upperName];

  // Try without state suffix
  const withoutState = upperName.replace(/, [A-Z]{2}$/, "");
  if (baseToMHA[withoutState]) return baseToMHA[withoutState];

  // Try partial match
  for (const [key, value] of Object.entries(baseToMHA)) {
    if (key.includes(upperName) || upperName.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Get all available bases with codes
 * Used for generating bases-all.json or displaying base list
 */
export function getAllBasesWithCodes(): BaseInfo[] {
  return militaryBases.map((base) => {
    const code = generateBaseCode(base.id, base.name);
    const mha = getMHAFromBaseName(base.name);

    return {
      code,
      mha,
      name: base.name,
      state: base.state,
      city: base.city,
      branch: base.branch,
      lat: base.lat,
      lng: base.lng,
    };
  });
}

