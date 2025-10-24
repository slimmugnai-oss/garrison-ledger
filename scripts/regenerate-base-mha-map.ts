/**
 * REGENERATE base-mha-map.json from official bah_rates table
 * 
 * This script:
 * 1. Queries all unique MHA codes and location names from bah_rates
 * 2. Creates a clean mapping of base names to MHA codes
 * 3. Overwrites the old (incorrect) base-mha-map.json
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function regenerateBaseMHAMap() {
  console.log('🔄 Regenerating base-mha-map.json from official bah_rates table...\n');
  
  // Query all unique MHA + location combinations using raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    query_text: 'SELECT DISTINCT mha, location_name FROM bah_rates ORDER BY mha'
  });
  
  if (error) {
    console.error('❌ Failed to query bah_rates:', error.message);
    process.exit(1);
  }
  
  if (!data || data.length === 0) {
    console.error('❌ No data found in bah_rates table');
    process.exit(1);
  }
  
  console.log(`📊 Found ${data.length} BAH records`);
  
  // Create a Map to deduplicate (MHA + location_name are the unique key)
  const mhaMap = new Map<string, string>();
  
  for (const row of data) {
    const { mha, location_name } = row;
    
    // Store the mapping (location_name → MHA code)
    if (!mhaMap.has(location_name)) {
      mhaMap.set(location_name, mha);
    }
  }
  
  console.log(`✅ Extracted ${mhaMap.size} unique base locations\n`);
  
  // Convert Map to sorted object
  const sortedEntries = Array.from(mhaMap.entries()).sort((a, b) => 
    a[0].localeCompare(b[0])
  );
  
  const baseToMHA: Record<string, string> = {};
  for (const [location, mha] of sortedEntries) {
    baseToMHA[location] = mha;
  }
  
  // Generate the JSON file
  const output = {
    _meta: {
      description: "Auto-generated mapping of military base names to MHA (Military Housing Area) codes",
      source: "Official DFAS 2025 BAH Rates (bah_rates table)",
      generated: new Date().toISOString(),
      total_locations: mhaMap.size,
      note: "DO NOT manually edit this file. Regenerate from bah_rates table using scripts/regenerate-base-mha-map.ts"
    },
    baseToMHA
  };
  
  // Write to file
  const outputPath = path.join(process.cwd(), 'lib', 'data', 'base-mha-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`✅ Successfully regenerated base-mha-map.json`);
  console.log(`📁 File: ${outputPath}`);
  console.log(`📊 Total mappings: ${mhaMap.size}`);
  
  // Show sample mappings
  console.log('\n📝 Sample mappings:');
  const samples = sortedEntries.slice(0, 10);
  for (const [location, mha] of samples) {
    console.log(`   ${mha}: ${location}`);
  }
  
  console.log('\n🎉 Regeneration complete!');
}

regenerateBaseMHAMap().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

