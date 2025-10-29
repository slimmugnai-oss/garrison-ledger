/**
 * BASE TO MHA MAPPING HELPERS
 * 
 * Functions to convert base names to BAH MHA codes
 * Used by profile system and BAH lookups
 */

import baseMHAMap from './base-mha-map.json';
import militaryBasesData from './military-bases.json';

// Base alias mappings for renamed bases
const BASE_ALIAS_TO_OFFICIAL: Record<string, string> = {
  // Fort Bragg → Fort Liberty
  'FORT BRAGG': 'FORT LIBERTY/POPE',
  'FORT BRAGG, NC': 'FORT LIBERTY/POPE',
  'Fort Bragg': 'FORT LIBERTY/POPE',
  'Fort Bragg, NC': 'FORT LIBERTY/POPE',
  
  // Fort Hood → Fort Cavazos
  'FORT HOOD': 'FORT CAVAZOS',
  'FORT HOOD, TX': 'FORT CAVAZOS',
  'Fort Hood': 'FORT CAVAZOS',
  'Fort Hood, TX': 'FORT CAVAZOS',
  
  // Fort Benning → Fort Moore
  'FORT BENNING': 'FORT MOORE',
  'FORT BENNING, GA': 'FORT MOORE',
  'Fort Benning': 'FORT MOORE',
  'Fort Benning, GA': 'FORT MOORE',
  
  // Fort Gordon → Fort Eisenhower
  'FORT GORDON': 'FORT EISENHOWER',
  'FORT GORDON, GA': 'FORT EISENHOWER',
  'Fort Gordon': 'FORT EISENHOWER',
  'Fort Gordon, GA': 'FORT EISENHOWER',
  
  // Fort A.P. Hill → Fort Walker
  'FORT A.P. HILL': 'DAHLGREN/FORT WALKER',
  'FORT A.P. HILL, VA': 'DAHLGREN/FORT WALKER',
  'Fort A.P. Hill': 'DAHLGREN/FORT WALKER',
  'Fort A.P. Hill, VA': 'DAHLGREN/FORT WALKER',
  
  // Fort Lee → Fort Gregg-Adams
  'FORT LEE': 'RICHMOND/FORT GREGG-ADAMS',
  'FORT LEE, VA': 'RICHMOND/FORT GREGG-ADAMS',
  'Fort Lee': 'RICHMOND/FORT GREGG-ADAMS',
  'Fort Lee, VA': 'RICHMOND/FORT GREGG-ADAMS',
  
  // Fort Rucker → Fort Novosel
  'FORT RUCKER': 'FORT NOVOSEL',
  'FORT RUCKER, AL': 'FORT NOVOSEL',
  'Fort Rucker': 'FORT NOVOSEL',
  'Fort Rucker, AL': 'FORT NOVOSEL',
  
  // Fort Polk → Fort Johnson
  'FORT POLK': 'FORT JOHNSON',
  'FORT POLK, LA': 'FORT JOHNSON',
  'Fort Polk': 'FORT JOHNSON',
  'Fort Polk, LA': 'FORT JOHNSON',
};

/**
 * Get MHA code from base name
 * @param baseName Base name (e.g., "Fort Liberty, NC" or "Fort Bragg, NC")
 * @returns MHA code (e.g., "NC182") or null if not found
 */
export function getBaseMHA(baseName: string): string | null {
  if (!baseName) return null;
  
  // Step 1: Check if it's an alias (former name) and resolve to official name
  let searchName = baseName;
  const cleanInput = baseName.replace(/,.*$/, '').trim();
  
  if (BASE_ALIAS_TO_OFFICIAL[baseName]) {
    searchName = BASE_ALIAS_TO_OFFICIAL[baseName];
  } else if (BASE_ALIAS_TO_OFFICIAL[cleanInput]) {
    searchName = BASE_ALIAS_TO_OFFICIAL[cleanInput];
  }
  
  // Step 2: Try exact match
  const exactMatch = (baseMHAMap.baseToMHA as Record<string, string>)[searchName];
  if (exactMatch) return exactMatch;
  
  // Step 3: Try case-insensitive match
  const lowerName = searchName.toLowerCase();
  for (const [base, mha] of Object.entries(baseMHAMap.baseToMHA)) {
    if (base.toLowerCase() === lowerName) {
      return mha;
    }
  }
  
  // Step 4: Try fuzzy match (strip state, match base name only)
  // "Fort Bliss" should match "Fort Bliss, TX"
  const cleanSearch = searchName.replace(/,.*$/, '').trim().toLowerCase();
  const matches = Object.entries(baseMHAMap.baseToMHA).filter(([base]) => {
    const cleanBase = base.replace(/,.*$/, '').trim().toLowerCase();
    return cleanBase === cleanSearch;
  });
  
  // If exactly one match, use it
  if (matches.length === 1) {
    return matches[0][1];
  }
  
  // If multiple matches (e.g., "Fort Campbell" in KY and TN), don't guess
  
  // No match found - return null
  return null;
}

/**
 * Get location type from MHA code
 * @param mhaCode MHA code (e.g., "NC090", "ZZ510")
 * @returns "CONUS", "OCONUS", or "OVERSEAS"
 */
export function getMHALocationType(mhaCode: string | null): 'CONUS' | 'OCONUS' | 'OVERSEAS' | null {
  if (!mhaCode) return null;
  
  // ZZ codes are overseas locations
  if (mhaCode.startsWith('ZZ')) return 'OVERSEAS';
  
  // AK and HI are OCONUS but still US states
  if (mhaCode.startsWith('AK') || mhaCode.startsWith('HI')) return 'OCONUS';
  
  // All other US state codes are CONUS
  return 'CONUS';
}

/**
 * Validate if MHA code exists in our database
 * @param mhaCode MHA code to validate
 * @returns true if code is valid format
 */
export function isValidMHACode(mhaCode: string): boolean {
  if (!mhaCode || mhaCode.length < 3) return false;
  
  // Format: 2 letters + digits (e.g., "NC090", "ZZ510")
  const pattern = /^[A-Z]{2}\d{3}$/;
  return pattern.test(mhaCode);
}

/**
 * Get all curated base names
 * @returns Array of all base names with MHA mappings
 */
export function getAllMappedBases(): string[] {
  return Object.keys(baseMHAMap.baseToMHA);
}

