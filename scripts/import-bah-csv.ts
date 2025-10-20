/**
 * BAH CSV IMPORTER
 * 
 * Parses 2025_BAH_Rates.csv and bulk imports to bah_rates table
 * 
 * Usage: npm run import-bah
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

// Supabase connection (same pattern as lib/supabase.ts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Paygrade column mapping (CSV column index to paygrade code)
const PAYGRADE_COLUMNS = [
  { index: 2, code: 'E01' },
  { index: 3, code: 'E02' },
  { index: 4, code: 'E03' },
  { index: 5, code: 'E04' },
  { index: 6, code: 'E05' },
  { index: 7, code: 'E06' },
  { index: 8, code: 'E07' },
  { index: 9, code: 'E08' },
  { index: 10, code: 'E09' },
  { index: 11, code: 'W01' },
  { index: 12, code: 'W02' },
  { index: 13, code: 'W03' },
  { index: 14, code: 'W04' },
  { index: 15, code: 'W05' },
  { index: 16, code: 'O01E' },
  { index: 17, code: 'O02E' },
  { index: 18, code: 'O03E' },
  { index: 19, code: 'O01' },
  { index: 20, code: 'O02' },
  { index: 21, code: 'O03' },
  { index: 22, code: 'O04' },
  { index: 23, code: 'O05' },
  { index: 24, code: 'O06' },
  { index: 25, code: 'O07' },
];

interface BAHRate {
  paygrade: string;
  mha: string;
  with_dependents: boolean;
  effective_date: string;
  rate_cents: number;
  zip_code: string | null;
  location_name: string;
}

/**
 * Parse a single data row from CSV
 */
function parseDataRow(
  row: string[],
  withDependents: boolean,
  effectiveDate: string
): BAHRate[] {
  const mha = row[0]?.trim();
  const locationName = row[1]?.trim().replace(/"/g, '');

  // Skip if not a valid MHA code (skip headers, page markers, empty rows)
  if (!mha || !locationName || mha.includes('MHA') || mha.includes('Page')) {
    return [];
  }

  const rates: BAHRate[] = [];

  // Extract ZIP from location name if present (e.g., "98433" from location)
  // For now, we'll leave zip_code as null since it's not in the CSV
  const zipCode = null;

  // Parse each paygrade rate
  for (const { index, code } of PAYGRADE_COLUMNS) {
    const rateStr = row[index]?.trim();
    
    if (!rateStr || rateStr === '') {
      continue;
    }

    // Convert dollar amount to cents
    // CSV shows dollars (e.g., "2331" = $2,331.00 = 233,100 cents)
    const dollars = parseInt(rateStr, 10);
    
    if (isNaN(dollars)) {
      console.warn(`⚠️  Invalid rate for ${mha} ${code}: "${rateStr}"`);
      continue;
    }

    const rateCents = dollars * 100;

    rates.push({
      paygrade: code,
      mha,
      with_dependents: withDependents,
      effective_date: effectiveDate,
      rate_cents: rateCents,
      zip_code: zipCode,
      location_name: locationName,
    });
  }

  return rates;
}

/**
 * Main import function
 */
async function importBAH() {
  console.log('🎖️  BAH CSV Importer\n');

  // Read CSV file
  const csvPath = join(process.cwd(), 'lib', 'data', '2025_BAH_Rates.csv');
  console.log(`📂 Reading: ${csvPath}`);
  
  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, 'utf-8');
  } catch (error) {
    console.error('❌ Failed to read CSV file:', error);
    process.exit(1);
  }

  // Split into lines
  const lines = csvContent.split('\n');
  console.log(`📄 Total lines: ${lines.length}\n`);

  // Parse CSV (simple comma split - handles quoted fields)
  const rows = lines.map(line => {
    // Simple CSV parsing (handles quotes)
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current); // Last column

    return cols;
  });

  const effectiveDate = '2025-01-01';
  const allRates: BAHRate[] = [];

  // Parse WITH DEPENDENTS section (rows 2-362)
  console.log('📊 Parsing WITH DEPENDENTS section...');
  let withDepsCount = 0;
  
  for (let i = 2; i < 363; i++) {
    if (i >= rows.length) break;
    
    const rates = parseDataRow(rows[i], true, effectiveDate);
    allRates.push(...rates);
    withDepsCount += rates.length;
  }

  console.log(`   ✅ Parsed ${withDepsCount} rates (WITH dependents)\n`);

  // Parse WITHOUT DEPENDENTS section (rows 364-725)
  console.log('📊 Parsing WITHOUT DEPENDENTS section...');
  let withoutDepsCount = 0;
  
  for (let i = 364; i < rows.length; i++) {
    const rates = parseDataRow(rows[i], false, effectiveDate);
    allRates.push(...rates);
    withoutDepsCount += rates.length;
  }

  console.log(`   ✅ Parsed ${withoutDepsCount} rates (WITHOUT dependents)\n`);

  console.log(`📈 Total rates parsed: ${allRates.length}`);
  console.log(`📍 Total MHA codes: ${new Set(allRates.map(r => r.mha)).size}`);
  console.log(`🎖️  Total paygrades: ${new Set(allRates.map(r => r.paygrade)).size}\n`);

  // Confirm before importing
  console.log('⚠️  This will DELETE all existing BAH rates and import fresh data.');
  console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Delete existing 2025 rates (by effective_date to preserve other years if they exist)
  console.log('🗑️  Deleting existing 2025 BAH rates...');
  const { error: deleteError } = await supabase
    .from('bah_rates')
    .delete()
    .eq('effective_date', effectiveDate);

  if (deleteError) {
    console.error('❌ Delete error:', deleteError);
    console.log('⚠️  Continuing anyway - will insert new rates\n');
  } else {
    console.log('   ✅ Deleted\n');
  }

  // Insert in batches of 1000
  console.log('💾 Inserting rates to database...');
  const BATCH_SIZE = 1000;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < allRates.length; i += BATCH_SIZE) {
    const batch = allRates.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('bah_rates')
      .insert(batch);

    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error);
      errors++;
    } else {
      inserted += batch.length;
      process.stdout.write(`   Inserted ${inserted}/${allRates.length} rates...\r`);
    }
  }

  console.log('\n');

  if (errors > 0) {
    console.log(`⚠️  Completed with ${errors} errors`);
  } else {
    console.log('✅ Import complete!');
  }

  console.log(`\n📊 Final Stats:`);
  console.log(`   • Inserted: ${inserted} rates`);
  console.log(`   • Failed: ${errors} batches`);
  console.log(`   • Effective date: ${effectiveDate}`);
  
  // Verify sample rates
  console.log('\n🔍 Verifying sample rates...');
  
  const samples = [
    { mha: 'WA408', paygrade: 'E06', withDeps: true, expected: 259800 },
    { mha: 'CA917', paygrade: 'E06', withDeps: true, expected: 336600 },
    { mha: 'NC228', paygrade: 'E05', withDeps: true, expected: 178500 },
  ];

  for (const sample of samples) {
    const { data } = await supabase
      .from('bah_rates')
      .select('rate_cents, location_name')
      .eq('mha', sample.mha)
      .eq('paygrade', sample.paygrade)
      .eq('with_dependents', sample.withDeps)
      .eq('effective_date', effectiveDate)
      .maybeSingle();

    if (data) {
      const match = data.rate_cents === sample.expected ? '✅' : '❌';
      console.log(`   ${match} ${sample.mha} ${sample.paygrade} (deps=${sample.withDeps}): $${data.rate_cents / 100} - ${data.location_name}`);
    } else {
      console.log(`   ❌ ${sample.mha} ${sample.paygrade} (deps=${sample.withDeps}): NOT FOUND`);
    }
  }

  console.log('\n🎉 BAH import complete!\n');
  console.log('Next steps:');
  console.log('1. Visit /dashboard/intel/finance/bah-basics');
  console.log('2. Verify rates display correctly');
  console.log('3. Check Base Navigator for updated BAH data\n');
}

// Run import
importBAH().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

