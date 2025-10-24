/**
 * Import Official 2025 BAH Rates from DFAS CSV
 * 
 * This script:
 * 1. Parses the official 2025 BAH rates CSV from DFAS
 * 2. Clears existing bah_rates table
 * 3. Imports all correct 2025 BAH data
 * 
 * CSV Format: Multi-page format with "WITH DEPENDENTS" and "WITHOUT DEPENDENTS" sections
 * Each row: MHA, MHA_NAME, E01, E02, ..., O07
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BAHRate {
  mha: string;
  location_name: string;
  paygrade: string;
  with_dependents: boolean;
  rate_cents: number;
  effective_date: string;
}

const PAYGRADES = [
  'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09',
  'W01', 'W02', 'W03', 'W04', 'W05',
  'O01E', 'O02E', 'O03E',
  'O01', 'O02', 'O03', 'O04', 'O05', 'O06', 'O07'
];

function parseBAHCSV(csvPath: string): BAHRate[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  const rates: BAHRate[] = [];
  let currentSection: 'with' | 'without' | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Detect section headers
    if (line.includes('WITH DEPENDENTS')) {
      currentSection = 'with';
      continue;
    }
    if (line.includes('WITHOUT DEPENDENTS')) {
      currentSection = 'without';
      continue;
    }
    
    // Skip header rows with paygrade labels
    if (line.startsWith('MHA,MHA_NAME')) {
      continue;
    }
    
    // Skip page separator rows
    if (line.includes('Page ') || !currentSection) {
      continue;
    }
    
    // Parse data rows
    const columns = line.split(',');
    
    // Must have MHA code in first column
    if (!columns[0] || columns[0].length < 4) continue;
    
    const mha = columns[0].replace(/"/g, '').trim();
    const locationName = columns[1]?.replace(/"/g, '').trim();
    
    // Skip if no location name
    if (!locationName) continue;
    
    // Parse rates for each paygrade (columns 2-26 are the paygrades)
    for (let j = 0; j < PAYGRADES.length; j++) {
      const rateColumn = columns[j + 2]; // +2 because cols 0-1 are MHA and name
      if (!rateColumn) continue;
      
      const rateValue = parseInt(rateColumn.replace(/"/g, '').trim());
      if (isNaN(rateValue) || rateValue === 0) continue;
      
      rates.push({
        mha,
        location_name: locationName,
        paygrade: PAYGRADES[j],
        with_dependents: currentSection === 'with',
        rate_cents: rateValue * 100, // Convert dollars to cents
        effective_date: '2025-01-01'
      });
    }
  }
  
  return rates;
}

async function importBAHRates() {
  console.log('🔄 Starting 2025 BAH Rates Import...\n');
  
  // 1. Parse CSV
  const csvPath = path.join(process.cwd(), 'data', '2025_BAH_Rates.csv');
  console.log(`📂 Reading CSV from: ${csvPath}`);
  
  let rates: BAHRate[];
  try {
    rates = parseBAHCSV(csvPath);
    console.log(`✅ Parsed ${rates.length} BAH rates from CSV\n`);
  } catch (error) {
    console.error('❌ Failed to parse CSV:', error);
    throw error;
  }
  
  // 2. Backup existing data count
  const { count: oldCount } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Current bah_rates table has ${oldCount} rows\n`);
  
  // 3. Clear existing table
  console.log('🗑️  Clearing existing bah_rates table...');
  const { error: deleteError } = await supabase
    .from('bah_rates')
    .delete()
    .neq('mha', ''); // Delete all rows
  
  if (deleteError) {
    console.error('❌ Failed to clear table:', deleteError);
    throw deleteError;
  }
  console.log('✅ Table cleared\n');
  
  // 4. Insert new data in batches (Supabase limit is 1000 per insert)
  console.log('📥 Inserting 2025 BAH rates...');
  const batchSize = 1000;
  let inserted = 0;
  
  for (let i = 0; i < rates.length; i += batchSize) {
    const batch = rates.slice(i, i + batchSize);
    
    const { error: insertError } = await supabase
      .from('bah_rates')
      .insert(batch);
    
    if (insertError) {
      console.error(`❌ Failed to insert batch ${i / batchSize + 1}:`, insertError);
      throw insertError;
    }
    
    inserted += batch.length;
    console.log(`   ✓ Inserted ${inserted}/${rates.length} rates`);
  }
  
  console.log('\n✅ Import complete!\n');
  
  // 5. Verify import
  const { count: newCount } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true });
  
  console.log('📊 Summary:');
  console.log(`   Old count: ${oldCount}`);
  console.log(`   New count: ${newCount}`);
  console.log(`   Difference: ${(newCount || 0) - (oldCount || 0)}`);
  
  // 6. Sample verification - check Fort Bliss
  const { data: ftBliss } = await supabase
    .from('bah_rates')
    .select('*')
    .eq('mha', 'TX279')
    .eq('paygrade', 'E01')
    .eq('with_dependents', true)
    .maybeSingle();
  
  if (ftBliss) {
    console.log('\n✅ Verification - Fort Bliss (TX279) E-1 with dependents:');
    console.log(`   Rate: $${(ftBliss.rate_cents / 100).toFixed(2)}`);
    console.log(`   Expected: $1,647.00 (from CSV)`);
    console.log(`   Match: ${ftBliss.rate_cents === 164700 ? '✅' : '❌'}`);
  }
}

importBAHRates()
  .then(() => {
    console.log('\n🎉 2025 BAH rates successfully imported!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

