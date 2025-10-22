/**
 * MILITARY PAY TABLES IMPORTER
 * 
 * Imports 2025 (or any year) military pay tables into Supabase
 * Supports CSV format from DFAS.mil
 * 
 * CSV Format Expected:
 * paygrade,years_of_service,monthly_rate,effective_date
 * E01,0,2340.00,2025-01-01
 * E01,2,2340.00,2025-01-01
 * 
 * Usage:
 * npm run import-pay-tables ./path/to/2025-military-pay.csv
 * 
 * Or manual SQL insert (see example at bottom)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PayTableRecord {
  paygrade: string;
  years_of_service: number;
  monthly_rate_cents: number;
  effective_date: string;
}

/**
 * Parse CSV file to records
 */
function parseCSV(filePath: string): PayTableRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  const records: PayTableRecord[] = dataLines.map(line => {
    const [paygrade, yos, rate, effectiveDate] = line.split(',').map(s => s.trim());
    
    return {
      paygrade: paygrade,
      years_of_service: parseInt(yos),
      monthly_rate_cents: Math.round(parseFloat(rate) * 100), // Convert dollars to cents
      effective_date: effectiveDate || '2025-01-01'
    };
  });
  
  return records;
}

/**
 * Import pay tables
 */
async function importPayTables(filePath: string) {
  console.log('\n💰 MILITARY PAY TABLES IMPORTER\n');
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('\nUsage: npm run import-pay-tables ./path/to/pay-tables.csv\n');
    process.exit(1);
  }
  
  console.log(`📂 Reading file: ${filePath}`);
  
  // Parse CSV
  const records = parseCSV(filePath);
  console.log(`📊 Parsed ${records.length} pay table records`);
  
  if (records.length === 0) {
    console.error('❌ No records found in CSV');
    process.exit(1);
  }
  
  // Show sample
  console.log('\n📋 Sample records:');
  records.slice(0, 3).forEach(r => {
    console.log(`   ${r.paygrade} @ ${r.years_of_service} YOS: $${(r.monthly_rate_cents/100).toFixed(2)} (effective ${r.effective_date})`);
  });
  
  // Get unique effective dates
  const effectiveDates = [...new Set(records.map(r => r.effective_date))];
  console.log(`\n📅 Effective dates found: ${effectiveDates.join(', ')}`);
  
  // Confirm import
  console.log(`\n⚠️  This will insert ${records.length} pay table records.`);
  console.log('   Duplicate checking: ON (paygrade + years_of_service + effective_date)');
  
  // Check current count for this effective date
  const { count: existingCount } = await supabase
    .from('military_pay_tables')
    .select('*', { count: 'exact', head: true })
    .in('effective_date', effectiveDates);
  
  if (existingCount && existingCount > 0) {
    console.log(`\n⚠️  Found ${existingCount} existing records for these effective dates.`);
    console.log('   These will be REPLACED with new data.');
  }
  
  // Delete existing records for these effective dates
  if (existingCount && existingCount > 0) {
    console.log('\n🗑️  Deleting existing records...');
    const { error: deleteError } = await supabase
      .from('military_pay_tables')
      .delete()
      .in('effective_date', effectiveDates);
    
    if (deleteError) {
      console.error('❌ Failed to delete existing records:', deleteError);
      process.exit(1);
    }
    console.log(`✅ Deleted ${existingCount} old records`);
  }
  
  // Batch insert (Supabase limit: 1000 per batch)
  console.log('\n📥 Importing new records...');
  const batchSize = 1000;
  let imported = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('military_pay_tables')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Failed to import batch ${i}-${i+batch.length}:`, error);
      process.exit(1);
    }
    
    imported += batch.length;
    console.log(`   Imported ${imported}/${records.length} records...`);
  }
  
  console.log(`\n✅ Successfully imported ${imported} pay table records!`);
  
  // Verify import
  const { count: finalCount } = await supabase
    .from('military_pay_tables')
    .select('*', { count: 'exact', head: true })
    .in('effective_date', effectiveDates);
  
  console.log(`✅ Verification: ${finalCount} records now in database for these dates`);
  
  // Summary by paygrade
  const { data: summary } = await supabase
    .from('military_pay_tables')
    .select('paygrade, effective_date')
    .in('effective_date', effectiveDates);
  
  const paygrades = [...new Set(summary?.map(r => r.paygrade) || [])];
  console.log(`\n📊 Summary: ${paygrades.length} paygrades (${paygrades.slice(0, 10).join(', ')}, ...)`);
  
  console.log('\n🎯 Import complete! Data ready for LES Auditor.\n');
}

/**
 * Manual SQL insert example
 */
function showManualExample() {
  console.log('\n💡 MANUAL IMPORT OPTION:\n');
  console.log('If you prefer to use SQL directly, here\'s the format:\n');
  console.log('```sql');
  console.log('-- Delete old 2025 data');
  console.log('DELETE FROM military_pay_tables WHERE effective_date = \'2025-01-01\';');
  console.log('');
  console.log('-- Insert new 2025 data');
  console.log('INSERT INTO military_pay_tables (paygrade, years_of_service, monthly_rate_cents, effective_date) VALUES');
  console.log('(\'E01\', 0, 234000, \'2025-01-01\'),  -- $2,340.00');
  console.log('(\'E01\', 2, 234000, \'2025-01-01\'),');
  console.log('(\'E02\', 0, 262500, \'2025-01-01\'),  -- $2,625.00');
  console.log('-- ... (add all 282 records)');
  console.log('```\n');
  console.log('Run this SQL in Supabase dashboard > SQL Editor\n');
}

// Main
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.log('\n💰 MILITARY PAY TABLES IMPORTER\n');
  console.log('Usage: npm run import-pay-tables <csv-file-path>');
  console.log('Example: npm run import-pay-tables ./downloads/2025-military-pay.csv\n');
  showManualExample();
  process.exit(1);
}

importPayTables(filePath).catch(error => {
  console.error('\n❌ Import failed:', error);
  process.exit(1);
});

