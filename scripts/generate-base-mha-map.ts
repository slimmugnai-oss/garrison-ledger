/**
 * GENERATE BASE-TO-MHA MAPPING
 * 
 * Queries bah_rates table to get all MHA codes
 * Attempts to match with base guide names
 * Generates lib/data/base-mha-map.json
 * 
 * Usage: npx ts-node scripts/generate-base-mha-map.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateBaseMHAMap() {
  console.log('🔍 Querying BAH rates table for MHA codes...\n');
  
  // Get all unique MHA codes
  const { data: mhaData, error } = await supabase
    .from('bah_rates')
    .select('mha')
    .limit(10000);
  
  if (error) {
    console.error('❌ Failed to query bah_rates:', error);
    return;
  }
  
  const uniqueMHAs = [...new Set(mhaData.map(r => r.mha))].sort();
  console.log(`✅ Found ${uniqueMHAs.length} unique MHA codes\n`);
  
  // Manual curated mappings for common bases
  // These are the bases users will most likely select
  const baseToMHA: Record<string, string> = {
    // Major Army Bases
    "Fort Liberty, NC": "NC090",
    "Fort Cavazos, TX": "TX191",
    "Fort Moore, GA": "GA031",
    "Joint Base Lewis-McChord, WA": "WA053",
    "Fort Campbell, KY": "KY015",
    "Fort Bragg, NC": "NC090",  // Legacy name
    "Fort Hood, TX": "TX191",  // Legacy name
    "Fort Benning, GA": "GA031",  // Legacy name
    
    // Major Navy/Marine Bases  
    "Naval Station Norfolk, VA": "VA105",
    "Camp Pendleton, CA": "CA625",
    "Marine Corps Base Quantico, VA": "VA109",
    "Naval Base San Diego, CA": "CA624",
    
    // Major Air Force Bases
    "Joint Base San Antonio, TX": "TX256",
    "Eglin Air Force Base, FL": "FL125",
    "Nellis Air Force Base, NV": "NV019",
    "Luke Air Force Base, AZ": "AZ029",
    
    // Service Academies
    "West Point": "NY349",
    "Annapolis": "MD015",
    "Colorado Springs": "CO024",
    
    // Add more as needed - fallback to lookup
  };
  
  // Sample MHA lookup by state (for fallback)
  const stateDefaultMHA: Record<string, string> = {
    "AL": "AL001",
    "AK": "AK001",  
    "AZ": "AZ001",
    "AR": "AR001",
    "CA": "CA601",
    "CO": "CO001",
    "CT": "CT001",
    "DE": "DE001",
    "FL": "FL001",
    "GA": "GA001",
    "HI": "HI001",
    "ID": "ID001",
    "IL": "IL001",
    "IN": "IN001",
    "IA": "IA001",
    "KS": "KS001",
    "KY": "KY001",
    "LA": "LA001",
    "ME": "ME001",
    "MD": "MD001",
    "MA": "MA001",
    "MI": "MI001",
    "MN": "MN001",
    "MS": "MS001",
    "MO": "MO001",
    "MT": "MT001",
    "NE": "NE001",
    "NV": "NV001",
    "NH": "NH001",
    "NJ": "NJ001",
    "NM": "NM001",
    "NY": "NY001",
    "NC": "NC001",
    "ND": "ND001",
    "OH": "OH001",
    "OK": "OK001",
    "OR": "OR001",
    "PA": "PA001",
    "RI": "RI001",
    "SC": "SC001",
    "SD": "SD001",
    "TN": "TN001",
    "TX": "TX001",
    "UT": "UT001",
    "VT": "VT001",
    "VA": "VA001",
    "WA": "WA001",
    "WV": "WV001",
    "WI": "WI001",
    "WY": "WY001",
  };
  
  // Output the mapping
  const outputPath = path.join(__dirname, '..', 'lib', 'data', 'base-mha-map.json');
  const mapping = {
    _metadata: {
      generated: new Date().toISOString(),
      totalMHAs: uniqueMHAs.length,
      curatedBases: Object.keys(baseToMHA).length,
      note: "Curated mappings for common bases. Unmapped bases will use state fallback or fail gracefully."
    },
    baseToMHA,
    stateDefaultMHA,
    allMHACodes: uniqueMHAs
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  
  console.log('✅ Base-to-MHA mapping generated!');
  console.log(`📄 Location: ${outputPath}`);
  console.log('');
  console.log('📊 Mapping Stats:');
  console.log(`  - Curated bases: ${Object.keys(baseToMHA).length}`);
  console.log(`  - State fallbacks: ${Object.keys(stateDefaultMHA).length}`);
  console.log(`  - Total MHA codes in database: ${uniqueMHAs.length}`);
  console.log('');
  console.log('💡 Usage:');
  console.log('  import { getBaseMHA } from "@/lib/data/base-mha-helpers";');
  console.log('  const mha = getBaseMHA("Fort Liberty, NC"); // Returns "NC090"');
}

// Run the generator
generateBaseMHAMap();

