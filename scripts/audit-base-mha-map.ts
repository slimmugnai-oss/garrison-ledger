/**
 * AUDIT: base-mha-map.json vs actual bah_rates table
 * 
 * Verifies that all MHA codes in the map actually exist in the database
 */

import { createClient } from '@supabase/supabase-js';
import baseToMHAMap from '../lib/data/base-mha-map.json' assert { type: 'json' };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function auditBaseMHAMap() {
  console.log('🔍 Auditing base-mha-map.json against bah_rates table...\n');
  
  const baseMap = baseToMHAMap.baseToMHA as Record<string, string>;
  const entries = Object.entries(baseMap);
  
  let validCount = 0;
  let invalidCount = 0;
  const invalidMappings: Array<{ base: string; mha: string; actual?: string }> = [];
  
  for (const [baseName, mhaCode] of entries) {
    // Query if this MHA code exists in bah_rates
    const { data, error } = await supabase
      .from('bah_rates')
      .select('mha, location_name')
      .eq('mha', mhaCode)
      .limit(1)
      .maybeSingle();
    
    if (error || !data) {
      invalidCount++;
      invalidMappings.push({ base: baseName, mha: mhaCode });
      console.log(`❌ ${baseName} → ${mhaCode} (DOES NOT EXIST)`);
    } else {
      validCount++;
      console.log(`✅ ${baseName} → ${mhaCode} (${data.location_name})`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Valid: ${validCount}/${entries.length}`);
  console.log(`   Invalid: ${invalidCount}/${entries.length}`);
  
  if (invalidMappings.length > 0) {
    console.log(`\n🔧 Invalid mappings that need fixing:\n`);
    for (const { base, mha } of invalidMappings) {
      // Try to find the correct MHA by searching location_name
      const searchTerms = base
        .replace(/,.*$/, '') // Remove state suffix
        .replace(/\s+(AFB|NAS|MCB|Naval|Marine Corps|Joint Base|Air Force|Space Force)/gi, '')
        .trim();
      
      const { data: suggestions } = await supabase
        .from('bah_rates')
        .select('mha, location_name')
        .ilike('location_name', `%${searchTerms}%`)
        .limit(1);
      
      if (suggestions && suggestions.length > 0) {
        console.log(`   "${base}": "${mha}" → SUGGESTED: "${suggestions[0].mha}" (${suggestions[0].location_name})`);
      } else {
        console.log(`   "${base}": "${mha}" → NO SUGGESTION FOUND`);
      }
    }
  }
}

auditBaseMHAMap().catch(console.error);

