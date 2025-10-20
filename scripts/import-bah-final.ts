import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BAHRecord {
  paygrade: string;
  mha: string;
  with_dependents: boolean;
  effective_date: string;
  rate_cents: number;
  zip_code: string | null;
  location_name: string;
}

async function getCurrentCount(): Promise<number> {
  const { count, error } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_date', '2025-01-01');
    
  if (error) {
    console.error('Error getting count:', error);
    return 0;
  }
  
  return count || 0;
}

function parseSQLToRecords(sql: string): BAHRecord[] {
  // Extract VALUES portion
  const valuesMatch = sql.match(/VALUES\s+([\s\S]+)/i);
  if (!valuesMatch) {
    return [];
  }
  
  const valuesStr = valuesMatch[1].trim();
  
  // Split by "),\n(" to get individual records
  const recordStrings = valuesStr.split(/\),\s*\(/);
  
  const records: BAHRecord[] = recordStrings.map((recordStr, idx) => {
    // Clean up - remove leading/trailing parentheses and semicolon
    let clean = recordStr.replace(/^\(/, '').replace(/\);?\s*$/, '').trim();
    
    // Parse the values - they're in format: 'E09', 'NY225', true, '2025-01-01', 244800, NULL, 'FORT DRUM/WATERTOWN, NY'
    // We need to handle quoted strings with commas inside
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      
      if (char === "'" && (i === 0 || clean[i-1] !== '\\')) {
        inQuote = !inQuote;
        current += char;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) {
      values.push(current.trim());
    }
    
    // Clean and parse each value
    const paygrade = values[0]?.replace(/^'|'$/g, '') || '';
    const mha = values[1]?.replace(/^'|'$/g, '') || '';
    const with_dependents = values[2]?.toLowerCase() === 'true';
    const effective_date = values[3]?.replace(/^'|'$/g, '') || '2025-01-01';
    const rate_cents = parseInt(values[4] || '0');
    const zip_code = values[5]?.toUpperCase() === 'NULL' ? null : values[5]?.replace(/^'|'$/g, '') || null;
    const location_name = values[6]?.replace(/^'|'$/g, '') || '';
    
    return {
      paygrade,
      mha,
      with_dependents,
      effective_date,
      rate_cents,
      zip_code,
      location_name
    };
  });
  
  return records;
}

async function importBatchFile(batchNum: number): Promise<number> {
  const paddedNum = String(batchNum).padStart(2, '0');
  const batchFile = path.join(process.cwd(), `bah-large-batch-${paddedNum}.sql`);
  
  if (!fs.existsSync(batchFile)) {
    console.log(`⏭️  Skipping batch ${paddedNum} - file not found`);
    return 0;
  }

  const sql = fs.readFileSync(batchFile, 'utf-8');
  const records = parseSQLToRecords(sql);
  
  if (records.length === 0) {
    console.log(`❌ Batch ${paddedNum}: No records parsed`);
    return 0;
  }
  
  console.log(`📦 Batch ${paddedNum}: Importing ${records.length} records...`);
  
  // Insert in chunks of 1000 (which is what we have per file)
  const { data, error } = await supabase
    .from('bah_rates')
    .insert(records);
    
  if (error) {
    console.error(`❌ Error importing batch ${paddedNum}:`, error.message);
    console.error('   Details:', error.details || 'No details');
    console.error('   Hint:', error.hint || 'No hint');
    return 0;
  }
  
  console.log(`✅ Batch ${paddedNum}: Successfully imported ${records.length} records`);
  return records.length;
}

async function main() {
  console.log('🚀 Starting BAH import (1,000 records per batch)...\n');
  
  const initialCount = await getCurrentCount();
  console.log(`📊 Current records: ${initialCount}/16,224 (${Math.round(initialCount/16224*100)}%)\n`);
  
  let totalImported = 0;
  const startBatch = 5; // Start from batch 5
  const endBatch = 17;
  
  for (let i = startBatch; i <= endBatch; i++) {
    const count = await importBatchFile(i);
    totalImported += count;
    
    // Check progress every 3 batches
    if (i % 3 === 0 || i === endBatch) {
      const currentTotal = await getCurrentCount();
      const percentage = Math.round(currentTotal/16224*100);
      console.log(`\n📈 Progress: ${currentTotal}/16,224 (${percentage}%)\n`);
    }
  }
  
  const finalCount = await getCurrentCount();
  console.log(`\n✅ Import complete!`);
  console.log(`📊 Final count: ${finalCount}/16,224 (${Math.round(finalCount/16224*100)}%)`);
  console.log(`📦 Imported ${totalImported} new records in this run`);
  
  if (finalCount === 16224) {
    console.log(`\n🎉 SUCCESS! All 16,224 BAH rates imported!`);
  } else {
    console.log(`\n⚠️  ${16224 - finalCount} records remaining`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

