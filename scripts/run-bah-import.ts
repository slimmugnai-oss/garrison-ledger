/**
 * Import 2025 BAH Rates - Efficient Batch Approach
 */

import { createClient } from '@supabase/supabase-js';
import { parseBAHCSV } from './generate-bah-import-sql';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runImport() {
  console.log('🚀 Starting BAH import via Supabase client...\n');
  
  // Parse CSV
  const csvPath = path.join(process.cwd(), 'data', '2025_BAH_Rates.csv');
  console.log('📂 Parsing CSV...');
  const rates = parseBAHCSV(csvPath);
  console.log(`✅ Parsed ${rates.length} BAH rates\n`);
  
  // Convert to database format
  const records = rates.map(r => ({
    mha: r.mha,
    location_name: r.location_name,
    paygrade: r.paygrade,
    with_dependents: r.with_dependents,
    rate_cents: r.rate_cents,
    effective_date: r.effective_date
  }));
  
  // Insert in batches of 1000
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  
  console.log(`📦 Inserting ${records.length} records in ${totalBatches} batches...\n`);
  
  const startTime = Date.now();
  let successCount = 0;
  
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    process.stdout.write(`\r⏳ Batch ${batchNum}/${totalBatches}...`);
    
    const { error } = await supabase
      .from('bah_rates')
      .insert(batch);
    
    if (error) {
      console.error(`\n❌ Batch ${batchNum} failed:`, error.message);
      console.error('  Sample record:', JSON.stringify(batch[0], null, 2));
      throw error;
    }
    
    successCount += batch.length;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\n✅ Import completed in ${duration}s (${successCount} records inserted)\n`);
  
  // Verify count
  const { count } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total BAH rates in database: ${count}`);
  
  // Test Fort Bliss query
  const { data: fortBlissData } = await supabase
    .from('bah_rates')
    .select('*')
    .eq('mha', 'TX279')
    .eq('paygrade', 'E01')
    .eq('with_dependents', true)
    .maybeSingle();
  
  if (fortBlissData) {
    console.log(`\n✅ Fort Bliss E-1 with dependents: $${(fortBlissData.rate_cents / 100).toFixed(2)}`);
  } else {
    console.log(`\n❌ Fort Bliss E-1 with dependents: NOT FOUND`);
  }
  
  console.log('\n🎉 Import complete!');
}

runImport().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
