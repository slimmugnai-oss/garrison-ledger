import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

function parseSQLToRecords(sql: string): BAHRecord[] {
  const valuesMatch = sql.match(/VALUES\s+([\s\S]+)/i);
  if (!valuesMatch) return [];
  
  const valuesStr = valuesMatch[1].trim();
  const recordStrings = valuesStr.split(/\),\s*\(/);
  
  const records: BAHRecord[] = recordStrings.map((recordStr) => {
    let clean = recordStr.replace(/^\(/, '').replace(/\);?\s*$/, '').trim();
    
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
    if (current) values.push(current.trim());
    
    return {
      paygrade: values[0]?.replace(/^'|'$/g, '') || '',
      mha: values[1]?.replace(/^'|'$/g, '') || '',
      with_dependents: values[2]?.toLowerCase() === 'true',
      effective_date: values[3]?.replace(/^'|'$/g, '') || '2025-01-01',
      rate_cents: parseInt(values[4] || '0'),
      zip_code: values[5]?.toUpperCase() === 'NULL' ? null : values[5]?.replace(/^'|'$/g, '') || null,
      location_name: values[6]?.replace(/^'|'$/g, '') || ''
    };
  });
  
  return records;
}

async function importBatchFileWithUpsert(batchNum: number): Promise<number> {
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
  
  console.log(`📦 Batch ${paddedNum}: Upserting ${records.length} records...`);
  
  // Use upsert to automatically handle duplicates
  const { data, error } = await supabase
    .from('bah_rates')
    .upsert(records, { 
      onConflict: 'paygrade,mha,with_dependents,effective_date',
      ignoreDuplicates: true 
    });
    
  if (error) {
    console.error(`❌ Error upserting batch ${paddedNum}:`, error.message);
    return 0;
  }
  
  console.log(`✅ Batch ${paddedNum}: Complete`);
  return records.length;
}

async function main() {
  console.log('🚀 Importing ALL batches 1-17 with upsert (auto-skip duplicates)...\n');
  
  const { count: initialCount } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_date', '2025-01-01');
  
  console.log(`📊 Initial count: ${initialCount}/16,224\n`);
  
  let totalProcessed = 0;
  
  // Process all batches 1-17
  for (let i = 1; i <= 17; i++) {
    const count = await importBatchFileWithUpsert(i);
    totalProcessed += count;
    
    // Show progress every 5 batches
    if (i % 5 === 0) {
      const { count: currentCount } = await supabase
        .from('bah_rates')
        .select('*', { count: 'exact', head: true })
        .eq('effective_date', '2025-01-01');
      
      console.log(`\n📈 Progress: ${currentCount}/16,224 (${Math.round((currentCount || 0)/16224*100)}%)\n`);
    }
  }
  
  const { count: finalCount } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_date', '2025-01-01');
  
  console.log(`\n✅ Import complete!`);
  console.log(`📊 Final count: ${finalCount}/16,224 (${Math.round((finalCount || 0)/16224*100)}%)`);
  console.log(`📦 Processed ${totalProcessed} total records (including duplicates skipped)`);
  
  if (finalCount === 16224) {
    console.log(`\n🎉 🎉 🎉 SUCCESS! All 16,224 BAH rates imported! 🎉 🎉 🎉`);
  } else {
    console.log(`\n⚠️  ${16224 - (finalCount || 0)} records remaining`);
  }
}

main().catch(console.error);

