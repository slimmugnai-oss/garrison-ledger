/**
 * BASE NAME TO CODE MAPPING
 * 
 * Maps full base names (from BaseAutocomplete) to base codes for navigation
 * CRITICAL: Uses bases-all.json as SINGLE SOURCE OF TRUTH for routing
 */

import basesAllData from "./bases-all.json";
import militaryBasesData from "./military-bases.json";

interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  mha: string | null;
  center: { lat: number; lng: number };
  gate: { lat: number; lng: number };
  candidateZips: string[];
}

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

const basesAll = basesAllData.bases as BaseSeed[];
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
 * Get base code from full name (e.g., "Fort Liberty, NC" → "liberty")
 * CRITICAL: Uses bases-all.json as SINGLE SOURCE OF TRUTH
 * Used by BaseSearch component to navigate after autocomplete selection
 */
export function getBaseCodeFromName(fullName: string): BaseInfo | null {
  console.log('[BASE_CODE_MAP] Looking up:', fullName);
  
  // Remove duplicate state if present (e.g., "NAME, TX, TX" → "NAME, TX")
  const cleanedName = fullName.replace(/, ([A-Z]{2}), \1$/, ', $1');
  
  // STEP 1: Find in bases-all.json (PRIMARY - these are the 135 we support for analysis)
  let matchedBase = basesAll.find((b) => {
    // Try exact match first (case-insensitive)
    if (b.name.toLowerCase() === cleanedName.toLowerCase()) {
      console.log('[BASE_CODE_MAP] Exact match in bases-all:', b.name, '→', b.code);
      return true;
    }
    
    // Try partial match (base name part)
    const baseNamePart = cleanedName.split(',')[0].trim();
    if (b.name.toLowerCase().includes(baseNamePart.toLowerCase())) {
      console.log('[BASE_CODE_MAP] Partial match in bases-all:', b.name, '→', b.code);
      return true;
    }

    return false;
  });

  if (matchedBase) {
    // Found in bases-all.json - use its code directly!
    return {
      code: matchedBase.code,
      mha: matchedBase.mha,
      name: matchedBase.name,
      state: matchedBase.state,
      city: '', // Not in bases-all, get from military-bases
      branch: matchedBase.branch,
      lat: matchedBase.center.lat,
      lng: matchedBase.center.lng,
    };
  }

  // STEP 2: Fallback - check military-bases.json for autocomplete purposes
  // (but these won't be routable until added to bases-all.json)
  const base = militaryBases.find((b) => {
    if (b.name.toLowerCase() === cleanedName.toLowerCase()) {
      console.log('[BASE_CODE_MAP] Found in military-bases (not routable):', b.name);
      return true;
    }
    
    const baseNamePart = cleanedName.split(',')[0].trim();
    if (b.name.toLowerCase().includes(baseNamePart.toLowerCase())) {
      console.log('[BASE_CODE_MAP] Partial match in military-bases (not routable):', b.name);
      return true;
    }

    if (b.aliases && b.aliases.some((a) => cleanedName.toLowerCase().includes(a.toLowerCase()))) {
      console.log('[BASE_CODE_MAP] Alias match in military-bases (not routable):', b.name);
      return true;
    }

    return false;
  });

  if (!base) {
    console.log('[BASE_CODE_MAP] No match found for:', cleanedName);
    return null;
  }
  
  // Found in military-bases but NOT in bases-all
  // Generate a temporary code (will 404 until added to bases-all)
  console.warn(`[BASE_CODE_MAP] Base "${base.name}" found but NOT in bases-all.json - will 404`);
  const code = generateBaseCode(base.id, base.name);

  return {
    code,
    mha: null, // Not in bases-all, so no MHA
    name: base.name,
    state: base.state,
    city: base.city,
    branch: base.branch,
    lat: base.lat,
    lng: base.lng,
  };
}

/**
 * Generate short base code from ID or name (FALLBACK ONLY)
 * This is only used when a base is found in military-bases.json but NOT in bases-all.json
 * For the 135 supported bases, we always use the code from bases-all.json directly
 */
function generateBaseCode(id: string, name: string): string {
  const parts = id.split("-");

  // Simple fallback code generation
  if (name.includes("AFB")) return parts[0];
  if (name.startsWith("Fort ")) return parts[1] || parts[0];
  if (name.includes("Naval Station")) return `ns${parts[2]?.substring(0, 3) || parts[0]}`;
  if (name.includes("Camp ")) return parts[1] || parts[0];
  
  // Default: use first significant word
  return parts[0];
}

/**
 * Get all bases from bases-all.json (135 supported bases with candidate ZIPs)
 */
export function getAllBasesWithCodes(): BaseInfo[] {
  return basesAll.map((base) => ({
    code: base.code,
    mha: base.mha,
    name: base.name,
    state: base.state,
    city: '', // Not in bases-all
    branch: base.branch,
    lat: base.center.lat,
    lng: base.center.lng,
  }));
}

