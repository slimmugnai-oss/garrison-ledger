/**
 * IMPORT BASES FROM CSV - DIRECT APPROACH
 * 
 * Creates bases-all.json directly from CSV
 * Uses military-bases.json ONLY for coordinates (best effort)
 * Falls back to geocoding or state centroid if needed
 * 
 * Usage: npx tsx scripts/import-bases-csv-direct.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import militaryBasesData from "../lib/data/military-bases.json";
import baseMHAMap from "../lib/data/base-mha-map.json";

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

interface CSVRow {
  Base: string;
  Branch: string;
  Location: string;
  Zip1: string;
  Zip2: string;
  Zip3: string;
}

interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  center: { lat: number; lng: number };
  gate: { lat: number; lng: number };
  candidateZips: string[];
  mha: string;
}

const militaryBases = militaryBasesData.bases as MilitaryBase[];
const baseToMHA = baseMHAMap.baseToMHA as Record<string, string>;

// State centroid coordinates (fallback if base not found)
const STATE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.806671, lng: -86.791130 },
  AK: { lat: 61.370716, lng: -152.404419 },
  AZ: { lat: 33.729759, lng: -111.431221 },
  CA: { lat: 36.116203, lng: -119.681564 },
  CO: { lat: 39.059811, lng: -105.311104 },
  DE: { lat: 39.318523, lng: -75.507141 },
  FL: { lat: 27.766279, lng: -81.686783 },
  GA: { lat: 33.040619, lng: -83.643074 },
  HI: { lat: 21.094318, lng: -157.498337 },
  IL: { lat: 40.349457, lng: -88.986137 },
  IN: { lat: 39.849426, lng: -86.258278 },
  KS: { lat: 38.5266, lng: -96.726486 },
  KY: { lat: 37.66814, lng: -84.670067 },
  LA: { lat: 31.169546, lng: -91.867805 },
  MD: { lat: 39.063946, lng: -76.802101 },
  MN: { lat: 45.694454, lng: -93.900192 },
  MO: { lat: 38.456085, lng: -92.288368 },
  MS: { lat: 32.741646, lng: -89.678696 },
  NC: { lat: 35.630066, lng: -79.806419 },
  ND: { lat: 47.528912, lng: -99.784012 },
  NM: { lat: 34.840515, lng: -106.248482 },
  NV: { lat: 38.313515, lng: -117.055374 },
  NY: { lat: 42.165726, lng: -74.948051 },
  OK: { lat: 35.565342, lng: -96.928917 },
  PA: { lat: 40.590752, lng: -77.209755 },
  PR: { lat: 18.220833, lng: -66.590149 },
  SC: { lat: 33.856892, lng: -80.945007 },
  SD: { lat: 44.299782, lng: -99.438828 },
  TN: { lat: 35.747845, lng: -86.692345 },
  TX: { lat: 31.054487, lng: -97.563461 },
  UT: { lat: 40.150032, lng: -111.862434 },
  VA: { lat: 37.769337, lng: -78.169968 },
  WA: { lat: 47.400902, lng: -121.490494 },
  WI: { lat: 44.268543, lng: -89.616508 },
};

/**
 * Parse CSV file
 */
function parseCSV(csvPath: string): CSVRow[] {
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith(','));
  
  // Skip header
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const [Base, Branch, Location, Zip1, Zip2, Zip3] = line.split(',').map(s => s.trim());
    return { Base, Branch, Location, Zip1, Zip2, Zip3 };
  });
}

/**
 * Extract primary state from location
 */
function extractPrimaryState(location: string): string {
  const states = location.match(/\b([A-Z]{2})\b/g) || [];
  return states[0] || '';
}

// Manual overrides for bases that don't match fuzzy logic
const MANUAL_MHA_OVERRIDES: Record<string, string> = {
  'FORT LIBERTY': 'NC182',
  'FORT BRAGG': 'NC182',
  'FORT BLISS': 'TX282',
  'FORT CARSON': 'CO050',
  'FORT SILL': 'OK237',
  'FORT DRUM': 'NY225',
  'FORT IRWIN': 'CA028',
  'FORT WAINWRIGHT': 'AK407',
  'FORT GREELY': 'AK408',
  'JBLM': 'WA311',
  'FORT EUSTIS': 'VA297',
  'FORT MYER': 'VA290',
  'FORT MEADE': 'MD133',
  'FORT BELVOIR': 'VA291',
  'REDSTONE ARSENAL': 'AL005',
  'ABERDEEN PROVING GROUND': 'MD127',
  'FORT SHAFTER': 'HI096',
  'SCHOFIELD BARRACKS': 'HI097',
  'TRIPLER': 'HI096',
  'ROCK ISLAND ARSENAL': 'IL090',
  'ANNISTON': 'AL003',
  'BLUE GRASS': 'KY109',
  'TOOELE': 'UT292',
  'CAMP ATTERBURY': 'IN098',
  'CAMP SHELBY': 'MS171',
  'CAMP RIPLEY': 'MN161',
  'FORT INDIANTOWN GAP': 'PA250',
  'FORT WALKER': 'VA368',
  'FORT BARFOOT': 'VA294',
  'HUNTER ARMY AIRFIELD': 'GA080',
  'FORT HAMILTON': 'NY218',
  'FORT BUCHANAN': 'PR321',
  'NAVAL STATION NORFOLK': 'VA298',
  'NORFOLK': 'VA298',
  'NAVAL BASE SAN DIEGO': 'CA020',
  'NAVAL BASE KITSAP': 'WA310',
};

/**
 * Get MHA code - aggressive fuzzy matching with manual overrides
 */
function getMHACode(baseName: string, state: string): string | null {
  const upperName = baseName.toUpperCase();
  
  // Check manual overrides first
  for (const [key, mha] of Object.entries(MANUAL_MHA_OVERRIDES)) {
    if (upperName.includes(key)) {
      return mha;
    }
  }
  
  // Try exact match (both cases)
  if (baseToMHA[upperName]) return baseToMHA[upperName];
  if (baseToMHA[baseName]) return baseToMHA[baseName];
  
  // Try with state
  const withState = `${upperName}, ${state}`;
  if (baseToMHA[withState]) return baseToMHA[withState];
  
  // Extract key words from base name (skip common words)
  const keywords = upperName
    .split(/[\s,\/\(\)]+/)
    .filter(w => !['THE', 'OF', 'AND', 'BASE', 'STATION', 'NAVAL', 'MARINE', 'CORPS', 'AIR', 'FORCE', 'ARMY', 'AFB', 'NTC', 'JBLE', 'JBM', 'HH'].includes(w))
    .filter(w => w.length > 2);
  
  // Try fuzzy match - find best matching key
  let bestMatch: string | null = null;
  let bestScore = 0;
  
  for (const [key, value] of Object.entries(baseToMHA)) {
    const keyUpper = key.toUpperCase();
    
    // Check if key matches (case-insensitive, partial OK)
    let score = 0;
    
    // Exact base name match (ignoring additions like /POPE)
    if (keyUpper.includes(upperName)) {
      score = 100; // Perfect match
    } else {
      // Count keyword matches
      score = keywords.filter(kw => keyUpper.includes(kw)).length * 10;
    }
    
    // Bonus for state match
    if (keyUpper.includes(`, ${state}`) || keyUpper.endsWith(state)) {
      score += 5;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  }
  
  // Accept match if score is decent
  if (bestMatch && bestScore >= 10) {
    return bestMatch;
  }
  
  return null;
}

/**
 * Try to find coordinates from military-bases.json
 */
function findCoordinates(baseName: string, state: string): { lat: number; lng: number } | null {
  const upperName = baseName.toUpperCase();
  
  // Try to find in military-bases.json
  const match = militaryBases.find(b => {
    const bName = b.name.toUpperCase();
    
    // Check if names match and state matches
    if (bName.includes(upperName) && b.state.toUpperCase() === state.toUpperCase()) {
      return true;
    }
    
    // Check keywords
    const keywords = upperName.split(/\s+/).filter(w => w.length > 3);
    if (keywords.length > 0 && keywords.every(kw => bName.includes(kw)) && b.state.toUpperCase() === state.toUpperCase()) {
      return true;
    }
    
    return false;
  });
  
  if (match) {
    return { lat: match.lat, lng: match.lng };
  }
  
  return null;
}

/**
 * Generate base code from name
 */
function generateBaseCode(baseName: string): string {
  const clean = baseName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = clean.split(/\s+/);
  
  // Special cases
  if (baseName.includes('JBLM')) return 'jblm';
  
  // Fort X → ftx (first 2 letters of fort name)
  if (words[0] === 'fort' && words[1]) {
    return `ft${words[1].substring(0, 2)}`;
  }
  
  // Naval Station X → nsx
  if (words.includes('naval') && words.includes('station')) {
    const city = words.find(w => w !== 'naval' && w !== 'station' && w !== 'base');
    return city ? `ns${city.substring(0, 3)}` : 'naval';
  }
  
  // Marine Corps Base / Camp X → mcbx
  if (words.includes('marine') || words.includes('camp') || baseName.includes('MCAS')) {
    if (baseName.includes('Pendleton')) return 'pendleton';
    if (baseName.includes('Lejeune')) return 'lejeune';
    if (baseName.includes('MCAS')) return words[words.length - 2] || words[0];
    const loc = words.find(w => !['marine', 'corps', 'base', 'camp'].includes(w));
    return loc ? `mcb${loc.substring(0, 2)}` : 'mcb';
  }
  
  // Default: first significant word
  return words[0].substring(0, 6);
}

async function main() {
  console.log('🔄 Importing 150 bases from CSV...\n');
  
  const csvPath = '/Users/slim/Desktop/Top_US_military_bases_and_best_nearby_zip_codes.csv';
  const rows = parseCSV(csvPath);
  
  console.log(`Found ${rows.length} bases in CSV\n`);
  
  const baseSeeds: BaseSeed[] = [];
  const warnings: string[] = [];
  
  for (const row of rows) {
    if (!row.Base || !row.Zip1) {
      console.log(`⚠️  Skipping incomplete row`);
      continue;
    }
    
    const state = extractPrimaryState(row.Location);
    if (!state) {
      console.log(`⚠️  No state for: ${row.Base}`);
      warnings.push(`${row.Base} - no state`);
      continue;
    }
    
    // Get MHA code (CRITICAL for BAH)
    const mha = getMHACode(row.Base, state);
    if (!mha) {
      console.log(`⚠️  No MHA for: ${row.Base}, ${state}`);
      warnings.push(`${row.Base} - no MHA`);
      continue;
    }
    
    // Try to find coordinates
    const coords = findCoordinates(row.Base, state);
    const { lat, lng } = coords || STATE_CENTROIDS[state] || { lat: 0, lng: 0 };
    
    // Generate code
    const code = generateBaseCode(row.Base);
    
    // Build candidate ZIPs
    const candidateZips = [row.Zip1, row.Zip2, row.Zip3].filter(z => z && z.length === 5);
    
    // Use CSV name as-is (cleaner than military-bases.json)
    const name = `${row.Base}, ${state}`;
    
    baseSeeds.push({
      code,
      name,
      branch: row.Branch,
      state,
      center: { lat, lng },
      gate: { lat, lng },
      candidateZips,
      mha,
    });
    
    const coordSource = coords ? 'exact' : 'state';
    console.log(`✅ ${row.Base.padEnd(35)} → ${code.padEnd(12)} (${mha}) [${candidateZips.length} ZIPs, ${coordSource}]`);
  }
  
  // Write output
  const output = {
    _meta: {
      generated: new Date().toISOString(),
      source: 'User CSV (150 bases + top 3 ZIPs) + military-bases.json (coords) + base-mha-map.json (MHA)',
      total: baseSeeds.length,
      note: 'Comprehensive list of US military installations with curated top 3 ZIP codes for each.',
    },
    bases: baseSeeds,
  };
  
  const outputPath = join(process.cwd(), 'lib', 'data', 'bases-all.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Generated ${baseSeeds.length} bases → lib/data/bases-all.json`);
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warnings:`);
    warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more`);
    }
  }
  
  // Show summary
  const byBranch: Record<string, number> = {};
  baseSeeds.forEach(b => {
    byBranch[b.branch] = (byBranch[b.branch] || 0) + 1;
  });
  
  console.log('\n📊 Bases by Branch:');
  Object.entries(byBranch)
    .sort(([, a], [, b]) => b - a)
    .forEach(([branch, count]) => {
      console.log(`   ${branch}: ${count}`);
    });
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

