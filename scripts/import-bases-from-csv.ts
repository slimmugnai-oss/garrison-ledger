/**
 * IMPORT BASES FROM CSV
 * 
 * Reads user-provided CSV with top 150 US bases + top 3 ZIPs for each
 * Generates comprehensive bases-all.json
 * 
 * Usage: npx tsx scripts/import-bases-from-csv.ts
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

/**
 * Parse CSV file
 */
function parseCSV(csvPath: string): CSVRow[] {
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const [Base, Branch, Location, Zip1, Zip2, Zip3] = line.split(',').map(s => s.trim());
    return { Base, Branch, Location, Zip1, Zip2, Zip3 };
  });
}

/**
 * Find matching base in military-bases.json
 * Uses fuzzy matching to handle name variations
 */
function findMatchingBase(baseName: string, location: string): MilitaryBase | null {
  const baseNameUpper = baseName.toUpperCase();
  const locationUpper = location.toUpperCase();
  
  // Extract all states from location (handles "TN / KY" format)
  const states = location.match(/\b([A-Z]{2})\b/g) || [];
  
  // Try exact name + state match
  for (const state of states) {
    let match = militaryBases.find(b => 
      b.name.toUpperCase() === `${baseNameUpper}, ${state}`
    );
    if (match) return match;
  }
  
  // Try just base name match (any state in location)
  let match = militaryBases.find(b => {
    const bNameUpper = b.name.toUpperCase();
    
    // Exact match on base name part
    if (bNameUpper.includes(baseNameUpper)) {
      // Check if any state from location matches
      return states.some(s => bNameUpper.includes(s));
    }
    
    return false;
  });
  
  if (match) return match;
  
  // Try fuzzy match on key words
  const keywords = baseNameUpper.split(/\s+/).filter(w => w.length > 3);
  match = militaryBases.find(b => {
    const bNameUpper = b.name.toUpperCase();
    return keywords.every(kw => bNameUpper.includes(kw)) && 
           states.some(s => bNameUpper.includes(s));
  });
  
  if (match) return match;
  
  // Try alias match
  match = militaryBases.find(b => 
    b.aliases && b.aliases.some(a => a.toUpperCase().includes(baseNameUpper))
  );
  
  return match;
}

/**
 * Get MHA code from base name
 */
function getMHACode(baseName: string): string | null {
  const upperName = baseName.toUpperCase();
  
  // Try exact match
  if (baseToMHA[upperName]) return baseToMHA[upperName];
  
  // Try without state suffix
  const withoutState = upperName.replace(/, [A-Z]{2}$/, '');
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
 * Generate base code from name
 */
function generateBaseCode(baseName: string, id: string): string {
  // Use ID if available
  if (id) {
    const parts = id.split('-');
    
    // AFB: use city name
    if (baseName.includes('AFB')) return parts[0];
    
    // Fort: use fort name abbreviation
    if (baseName.startsWith('FORT ') || baseName.startsWith('Fort ')) {
      return `ft${parts[1]?.substring(0, 2) || parts[0].substring(0, 4)}`;
    }
    
    // Naval: use ns + city
    if (baseName.includes('Naval')) {
      const cityPart = parts.find(p => p !== 'naval' && p !== 'station' && p !== 'base');
      return cityPart ? `ns${cityPart.substring(0, 3)}` : parts[0];
    }
    
    // Marine Corps: use mcb + location
    if (baseName.includes('Marine Corps') || baseName.includes('MCAS')) {
      if (baseName.includes('MCAS')) return parts[0]; // mcas already
      const locPart = parts.find(p => p !== 'marine' && p !== 'corps' && p !== 'base' && p !== 'camp');
      return locPart ? `mcb${locPart.substring(0, 2)}` : parts[0];
    }
    
    // JBLM special case
    if (baseName.includes('JBLM') || (baseName.includes('Lewis') && baseName.includes('McChord'))) {
      return 'jblm';
    }
    
    // Default: use first part
    return parts[0];
  }
  
  // Fallback: use base name slug
  return baseName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
}

/**
 * Extract state from location string
 */
function extractState(location: string): string {
  // Location format: "Fayetteville NC" or "Clarksville TN / Oak Grove KY"
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  return stateMatch ? stateMatch[1] : '';
}

async function main() {
  console.log('🔄 Importing bases from CSV...\n');
  
  const csvPath = '/Users/slim/Desktop/Top_US_military_bases_and_best_nearby_zip_codes.csv';
  const rows = parseCSV(csvPath);
  
  console.log(`Found ${rows.length} bases in CSV\n`);
  
  const baseSeeds: BaseSeed[] = [];
  const skipped: string[] = [];
  
  for (const row of rows) {
    if (!row.Base || !row.Zip1) {
      console.log(`⚠️  Skipping incomplete row: ${row.Base}`);
      continue;
    }
    
    // Find matching base in military-bases.json (pass full location for multi-state matching)
    const baseData = findMatchingBase(row.Base, row.Location);
    
    if (!baseData) {
      console.log(`⚠️  Could not find match for: ${row.Base} (${row.Location})`);
      skipped.push(row.Base);
      continue;
    }
    
    // Get MHA code
    const mha = getMHACode(baseData.name);
    if (!mha) {
      console.log(`⚠️  No MHA code for: ${baseData.name}`);
      skipped.push(row.Base);
      continue;
    }
    
    // Generate base code
    const code = generateBaseCode(baseData.name, baseData.id);
    
    // Build candidate ZIPs array (filter out empty)
    const candidateZips = [row.Zip1, row.Zip2, row.Zip3].filter(z => z && z.length === 5);
    
    baseSeeds.push({
      code,
      name: baseData.name,
      branch: row.Branch, // Use CSV branch (more accurate)
      state: baseData.state,
      center: { lat: baseData.lat, lng: baseData.lng },
      gate: { lat: baseData.lat, lng: baseData.lng },
      candidateZips,
      mha,
    });
    
    console.log(`✅ ${row.Base.padEnd(30)} → ${code.padEnd(10)} (${mha}) [${candidateZips.length} ZIPs]`);
  }
  
  // Write output
  const output = {
    _meta: {
      generated: new Date().toISOString(),
      source: 'User-provided CSV + military-bases.json + base-mha-map.json',
      total: baseSeeds.length,
      note: 'Auto-generated from CSV. Contains top 150 US military bases with curated ZIP codes.',
    },
    bases: baseSeeds,
  };
  
  const outputPath = join(process.cwd(), 'lib', 'data', 'bases-all.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Generated ${baseSeeds.length} bases → lib/data/bases-all.json`);
  
  if (skipped.length > 0) {
    console.log(`\n⚠️  Skipped ${skipped.length} bases (no match or MHA):`);
    skipped.forEach(b => console.log(`   - ${b}`));
  }
  
  // Show summary
  const byBranch: Record<string, number> = {};
  baseSeeds.forEach(b => {
    byBranch[b.branch] = (byBranch[b.branch] || 0) + 1;
  });
  
  console.log('\n📊 Bases by Branch:');
  Object.entries(byBranch).forEach(([branch, count]) => {
    console.log(`   ${branch}: ${count}`);
  });
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

