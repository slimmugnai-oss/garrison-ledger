/**
 * REGENERATE MILITARY-BASES.JSON FROM OFFICIAL BAH DATABASE
 * 
 * This script:
 * 1. Queries all unique MHA codes and location names from bah_rates table (338 locations)
 * 2. Geocodes each location using Google Maps Geocoding API
 * 3. Classifies branch by cross-referencing with app/data/bases.ts
 * 4. Generates complete military-bases.json with all 338 bases
 * 
 * Usage: npx tsx scripts/regenerate-military-bases.ts
 * 
 * Requirements:
 * - GOOGLE_MAPS_API_KEY environment variable
 * - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import existing bases for branch classification
import { basesData } from '../app/data/bases.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  console.error('   Make sure .env.local file exists with these variables');
  process.exit(1);
}

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️  GOOGLE_MAPS_API_KEY not found - will use fallback coordinates');
  console.warn('   For accurate geocoding, add GOOGLE_MAPS_API_KEY to .env.local\n');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface MilitaryBase {
  id: string;
  name: string;
  branch: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  zip: string;
  aliases?: string[]; // Former names (e.g., ["Fort Bragg"] for Fort Liberty)
}

// Known base renames - map current name to former names
// Keys must match exactly as they appear in bah_rates.location_name
const BASE_ALIASES: Record<string, string[]> = {
  'FORT LIBERTY/POPE, NC': ['Fort Bragg', 'Fort Bragg, NC', 'FORT BRAGG'],
  'FORT CAVAZOS, TX': ['Fort Hood', 'Fort Hood, TX', 'FORT HOOD'],
  'FORT MOORE, GA': ['Fort Benning', 'Fort Benning, GA', 'FORT BENNING'],
  'FORT EISENHOWER, GA': ['Fort Gordon', 'Fort Gordon, GA', 'FORT GORDON'],
  'DAHLGREN/FORT WALKER, VA': ['Fort A.P. Hill', 'Fort A.P. Hill, VA', 'FORT A.P. HILL'],
  'RICHMOND/FORT GREGG-ADAMS, VA': ['Fort Lee', 'Fort Lee, VA', 'FORT LEE'],
  'FORT NOVOSEL, AL': ['Fort Rucker', 'Fort Rucker, AL', 'FORT RUCKER'],
  'FORT JOHNSON, LA': ['Fort Polk', 'Fort Polk, LA', 'FORT POLK'],
};

interface BAHLocation {
  mha: string;
  location_name: string;
}

// Cache file for geocoding results to avoid re-geocoding on re-runs
const GEOCODE_CACHE_PATH = path.join(__dirname, '.geocode-cache.json');
let geocodeCache: Record<string, { lat: number; lng: number; city: string; zip: string }> = {};

// Load existing cache
if (fs.existsSync(GEOCODE_CACHE_PATH)) {
  geocodeCache = JSON.parse(fs.readFileSync(GEOCODE_CACHE_PATH, 'utf-8'));
  console.log(`📦 Loaded ${Object.keys(geocodeCache).length} cached geocoding results\n`);
}

/**
 * Sleep for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract state code from MHA (e.g., "GA081" → "GA")
 */
function extractStateFromMHA(mha: string): string {
  return mha.substring(0, 2);
}

/**
 * Geocode a location using Google Maps Geocoding API
 */
async function geocodeLocation(locationName: string, state: string): Promise<{
  lat: number;
  lng: number;
  city: string;
  zip: string;
} | null> {
  const cacheKey = `${locationName}, ${state}`;
  
  // Check cache first
  if (geocodeCache[cacheKey]) {
    return geocodeCache[cacheKey];
  }
  
  // Skip geocoding if API key not available
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }
  
  try {
    // Rate limit: 1 request per second
    await sleep(1000);
    
    const query = encodeURIComponent(`${locationName}, ${state}, USA`);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;
      
      // Extract city from address components
      let city = '';
      let zip = '00000';
      
      for (const component of result.address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          zip = component.long_name;
        }
      }
      
      // Fallback: extract city from location name or use state
      if (!city) {
        // Try to extract from location_name (e.g., "FORT LIBERTY/POPE" → "Fayetteville")
        city = locationName.split('/')[0].trim();
      }
      
      const geocodeResult = { lat, lng, city, zip };
      
      // Cache the result
      geocodeCache[cacheKey] = geocodeResult;
      
      return geocodeResult;
    } else {
      console.warn(`  ⚠️  Geocoding failed for ${locationName}, ${state}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ Geocoding error for ${locationName}, ${state}:`, error);
    return null;
  }
}

/**
 * Get state center coordinates as fallback
 */
function getStateCenterCoordinates(state: string): { lat: number; lng: number } {
  const stateCenters: Record<string, { lat: number; lng: number }> = {
    'AL': { lat: 32.806671, lng: -86.791130 },
    'AK': { lat: 61.370716, lng: -152.404419 },
    'AZ': { lat: 33.729759, lng: -111.431221 },
    'AR': { lat: 34.969704, lng: -92.373123 },
    'CA': { lat: 36.116203, lng: -119.681564 },
    'CO': { lat: 39.059811, lng: -105.311104 },
    'CT': { lat: 41.597782, lng: -72.755371 },
    'DE': { lat: 39.318523, lng: -75.507141 },
    'FL': { lat: 27.766279, lng: -81.686783 },
    'GA': { lat: 33.040619, lng: -83.643074 },
    'HI': { lat: 21.094318, lng: -157.498337 },
    'ID': { lat: 44.240459, lng: -114.478828 },
    'IL': { lat: 40.349457, lng: -88.986137 },
    'IN': { lat: 39.849426, lng: -86.258278 },
    'IA': { lat: 42.011539, lng: -93.210526 },
    'KS': { lat: 38.526600, lng: -96.726486 },
    'KY': { lat: 37.668140, lng: -84.670067 },
    'LA': { lat: 31.169546, lng: -91.867805 },
    'ME': { lat: 44.693947, lng: -69.381927 },
    'MD': { lat: 39.063946, lng: -76.802101 },
    'MA': { lat: 42.230171, lng: -71.530106 },
    'MI': { lat: 43.326618, lng: -84.536095 },
    'MN': { lat: 45.694454, lng: -93.900192 },
    'MS': { lat: 32.741646, lng: -89.678696 },
    'MO': { lat: 38.456085, lng: -92.288368 },
    'MT': { lat: 46.921925, lng: -110.454353 },
    'NE': { lat: 41.125370, lng: -98.268082 },
    'NV': { lat: 38.313515, lng: -117.055374 },
    'NH': { lat: 43.452492, lng: -71.563896 },
    'NJ': { lat: 40.298904, lng: -74.521011 },
    'NM': { lat: 34.840515, lng: -106.248482 },
    'NY': { lat: 42.165726, lng: -74.948051 },
    'NC': { lat: 35.630066, lng: -79.806419 },
    'ND': { lat: 47.528912, lng: -99.784012 },
    'OH': { lat: 40.388783, lng: -82.764915 },
    'OK': { lat: 35.565342, lng: -96.928917 },
    'OR': { lat: 44.572021, lng: -122.070938 },
    'PA': { lat: 40.590752, lng: -77.209755 },
    'RI': { lat: 41.680893, lng: -71.511780 },
    'SC': { lat: 33.856892, lng: -80.945007 },
    'SD': { lat: 44.299782, lng: -99.438828 },
    'TN': { lat: 35.747845, lng: -86.692345 },
    'TX': { lat: 31.054487, lng: -97.563461 },
    'UT': { lat: 40.150032, lng: -111.862434 },
    'VT': { lat: 44.045876, lng: -72.710686 },
    'VA': { lat: 37.769337, lng: -78.169968 },
    'WA': { lat: 47.400902, lng: -121.490494 },
    'WV': { lat: 38.491226, lng: -80.954453 },
    'WI': { lat: 44.268543, lng: -89.616508 },
    'WY': { lat: 42.755966, lng: -107.302490 },
    'DC': { lat: 38.907192, lng: -77.036871 },
  };
  
  return stateCenters[state] || { lat: 39.8283, lng: -98.5795 }; // Center of USA as ultimate fallback
}

/**
 * Classify branch by cross-referencing with app/data/bases.ts
 */
function classifyBranch(locationName: string, state: string): string {
  const upperName = locationName.toUpperCase();
  
  // Step 1: Try to match with existing bases.ts data
  for (const base of basesData) {
    const baseNameUpper = base.title.toUpperCase();
    
    // Direct match
    if (baseNameUpper === upperName) {
      return base.branch;
    }
    
    // Partial match (e.g., "FORT LIBERTY" matches "Fort Liberty")
    if (baseNameUpper.includes(upperName) || upperName.includes(baseNameUpper)) {
      return base.branch;
    }
    
    // Match by key terms (e.g., "FORT LIBERTY/POPE" matches "Fort Liberty")
    const baseKey = baseNameUpper.replace(/[^A-Z]/g, '');
    const locationKey = upperName.replace(/[^A-Z]/g, '');
    if (baseKey.includes(locationKey) || locationKey.includes(baseKey)) {
      return base.branch;
    }
  }
  
  // Step 2: Heuristic fallback
  if (upperName.includes('AFB') || upperName.includes('AIR FORCE') || upperName.includes('SFB') || upperName.includes('SPACE FORCE')) {
    return 'Air Force';
  }
  
  if (upperName.startsWith('FORT ')) {
    return 'Army';
  }
  
  if (upperName.includes('NAS ') || upperName.includes('NAVAL') || upperName.includes('NAVY') || upperName.includes('NSB') || upperName.includes('NAVSTA')) {
    return 'Navy';
  }
  
  if (upperName.includes('CAMP ') || upperName.includes('MCB') || upperName.includes('MCAS') || upperName.includes('MARINE') || upperName.includes('PARRIS ISLAND')) {
    return 'Marine Corps';
  }
  
  if (upperName.includes('JOINT BASE') || upperName.includes('JB ') || upperName.startsWith('JB ')) {
    return 'Joint';
  }
  
  // Default to Joint for unclassified bases
  return 'Joint';
}

/**
 * Generate kebab-case ID from location name
 */
function generateBaseId(locationName: string): string {
  return locationName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract city name from location_name
 * Examples:
 * - "MOODY AFB" → "Moody AFB"
 * - "FORT LIBERTY/POPE" → "Fort Liberty"
 * - "HAMPTON/NEWPORT NEWS" → "Hampton"
 */
function extractCityFromLocationName(locationName: string): string {
  // Split on "/" and take first part
  const parts = locationName.split('/');
  const firstPart = parts[0].trim();
  
  // Convert to title case
  return firstPart
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Main function
 */
async function regenerateMilitaryBases() {
  console.log('🔄 Regenerating military-bases.json from BAH database...\n');
  
  // Step 1: Query BAH locations
  console.log('📊 Querying bah_rates table...');
  const { data: bahData, error } = await supabase
    .from('bah_rates')
    .select('mha, location_name')
    .eq('effective_date', '2025-01-01')
    .eq('paygrade', 'E05')
    .eq('with_dependents', true);
  
  if (error) {
    console.error('❌ Failed to query bah_rates:', error.message);
    process.exit(1);
  }
  
  if (!bahData || bahData.length === 0) {
    console.error('❌ No data found in bah_rates table');
    process.exit(1);
  }
  
  // Deduplicate by MHA code
  const uniqueLocations = new Map<string, BAHLocation>();
  for (const row of bahData) {
    if (!uniqueLocations.has(row.mha)) {
      uniqueLocations.set(row.mha, {
        mha: row.mha,
        location_name: row.location_name,
      });
    }
  }
  
  const locations = Array.from(uniqueLocations.values());
  console.log(`✅ Found ${locations.length} unique BAH locations\n`);
  
  // Step 2: Geocode and classify
  console.log('🗺️  Geocoding locations (1/sec rate limit)...\n');
  const bases: MilitaryBase[] = [];
  let geocodedCount = 0;
  let fallbackCount = 0;
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const state = extractStateFromMHA(location.mha);
    const locationName = location.location_name;
    
    // Geocode
    const geocode = await geocodeLocation(locationName, state);
    
    let lat: number;
    let lng: number;
    let city: string;
    let zip: string;
    
    if (geocode) {
      lat = geocode.lat;
      lng = geocode.lng;
      city = geocode.city || extractCityFromLocationName(locationName);
      zip = geocode.zip || '00000';
      geocodedCount++;
      console.log(`  ✅ [${i + 1}/${locations.length}] ${locationName} (${city}, ${state}): ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
    } else {
      // Fallback to state center
      const stateCenter = getStateCenterCoordinates(state);
      lat = stateCenter.lat;
      lng = stateCenter.lng;
      city = extractCityFromLocationName(locationName);
      zip = '00000';
      fallbackCount++;
      console.log(`  ⚠️  [${i + 1}/${locations.length}] ${locationName} (${city}, ${state}): Using state center fallback`);
    }
    
    // Classify branch
    const branch = classifyBranch(locationName, state);
    
    // Generate ID
    const id = generateBaseId(locationName);
    
    // Check if this base has aliases (former names)
    const aliases = BASE_ALIASES[locationName.toUpperCase()] || BASE_ALIASES[locationName];
    
    const baseEntry: MilitaryBase = {
      id,
      name: locationName,
      branch,
      state,
      city,
      lat,
      lng,
      zip,
    };
    
    // Add aliases if they exist
    if (aliases && aliases.length > 0) {
      baseEntry.aliases = aliases;
    }
    
    bases.push(baseEntry);
  }
  
  console.log(`\n✅ Geocoded ${geocodedCount} locations, ${fallbackCount} used state center fallback\n`);
  
  // Save geocode cache
  fs.writeFileSync(GEOCODE_CACHE_PATH, JSON.stringify(geocodeCache, null, 2));
  console.log(`💾 Saved geocode cache to ${GEOCODE_CACHE_PATH}\n`);
  
  // Step 3: Branch classification summary
  console.log('🏢 Branch classification summary:');
  const branchCounts: Record<string, number> = {};
  for (const base of bases) {
    branchCounts[base.branch] = (branchCounts[base.branch] || 0) + 1;
  }
  for (const [branch, count] of Object.entries(branchCounts)) {
    console.log(`  - ${branch}: ${count}`);
  }
  console.log('');
  
  // Step 4: Write to file
  const outputPath = path.join(__dirname, '..', 'lib', 'data', 'military-bases.json');
  
  // Create file content with metadata comment
  const fileContent = `{
  "_meta": {
    "description": "Auto-generated complete list of military installations from official BAH database",
    "source": "DFAS 2025 BAH Rates (bah_rates table) + Google Maps Geocoding API",
    "generated": "${new Date().toISOString()}",
    "total_bases": ${bases.length},
    "geocoded": ${geocodedCount},
    "state_fallback": ${fallbackCount},
    "note": "DO NOT manually edit this file. Regenerate using: npm run regenerate-bases"
  },
  "bases": ${JSON.stringify(bases.sort((a, b) => a.name.localeCompare(b.name)), null, 4).replace(/^/gm, '  ').trim()}
}
`;
  
  fs.writeFileSync(outputPath, fileContent);
  
  console.log('✅ Generated military-bases.json!');
  console.log(`📄 Location: ${outputPath}`);
  console.log(`📊 Total bases: ${bases.length}`);
  console.log('');
  
  // Verify Moody AFB
  const moodyBase = bases.find(b => b.name.toUpperCase().includes('MOODY'));
  if (moodyBase) {
    console.log('✅ VERIFIED: Moody AFB is in the list:');
    console.log(`   Name: ${moodyBase.name}`);
    console.log(`   City: ${moodyBase.city}, ${moodyBase.state}`);
    console.log(`   Branch: ${moodyBase.branch}`);
    console.log(`   Coordinates: ${moodyBase.lat}, ${moodyBase.lng}`);
  } else {
    console.log('⚠️  WARNING: Moody AFB not found in generated list');
  }
  
  console.log('\n✅ Complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Verify the file: cat lib/data/military-bases.json | grep -i moody');
  console.log('   2. Test in profile: npm run dev → /dashboard/profile/setup');
  console.log('   3. Search for "Moody" in Current Base field');
}

// Run
regenerateMilitaryBases().catch(console.error);

