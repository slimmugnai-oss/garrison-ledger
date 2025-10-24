/**
 * BASE TO MHA MAPPING HELPERS
 * 
 * Functions to convert base names to BAH MHA codes
 * Used by profile system and BAH lookups
 */

import baseMHAMap from './base-mha-map.json';

/**
 * Get MHA code from base name
 * @param baseName Base name (e.g., "Fort Liberty, NC")
 * @returns MHA code (e.g., "NC090") or null if not found
 */
export function getBaseMHA(baseName: string): string | null {
  if (!baseName) return null;
  
  // Try exact match first
  const exactMatch = (baseMHAMap.baseToMHA as Record<string, string>)[baseName];
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const lowerName = baseName.toLowerCase();
  for (const [base, mha] of Object.entries(baseMHAMap.baseToMHA)) {
    if (base.toLowerCase() === lowerName) {
      return mha;
    }
  }
  
  // NEW: Try fuzzy match (strip state, match base name only)
  // "Fort Bliss" should match "Fort Bliss, TX"
  const cleanInput = baseName.replace(/,.*$/, '').trim().toLowerCase();
  const matches = Object.entries(baseMHAMap.baseToMHA).filter(([base]) => {
    const cleanBase = base.replace(/,.*$/, '').trim().toLowerCase();
    return cleanBase === cleanInput;
  });
  
  // If exactly one match, use it
  if (matches.length === 1) {
    return matches[0][1];
  }
  
  // If multiple matches (e.g., "Fort Campbell" in KY and TN), don't guess
  
  // No match found - return null
  // Note: stateDefaultMHA fallback removed since we have comprehensive base mappings from official BAH data
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

