/**
 * GENERATE BAH SQL INSERT STATEMENTS
 * 
 * Converts 2025_BAH_Rates.csv to SQL INSERT statements
 * Output can be executed via Supabase or saved as migration file
 * 
 * Usage: npm run generate-bah-sql > /tmp/bah-import.sql
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Paygrade column mapping
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

function parseDataRow(
  row: string[],
  withDependents: boolean,
  effectiveDate: string
): string[] {
  const mha = row[0]?.trim();
  const locationName = row[1]?.trim().replace(/"/g, '').replace(/'/g, "''"); // Escape single quotes

  if (!mha || !locationName || mha.includes('MHA') || mha.includes('Page')) {
    return [];
  }

  const inserts: string[] = [];

  for (const { index, code } of PAYGRADE_COLUMNS) {
    const rateStr = row[index]?.trim();
    
    if (!rateStr || rateStr === '') {
      continue;
    }

    const dollars = parseInt(rateStr, 10);
    
    if (isNaN(dollars)) {
      continue;
    }

    const rateCents = dollars * 100;

    // Generate INSERT statement
    inserts.push(
      `('${code}', '${mha}', ${withDependents}, '${effectiveDate}', ${rateCents}, NULL, '${locationName}')`
    );
  }

  return inserts;
}

function generateSQL() {
  console.error('🎖️  Generating BAH SQL INSERT statements...\n');

  // Read CSV
  const csvPath = join(process.cwd(), 'lib', 'data', '2025_BAH_Rates.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');

  // Parse CSV
  const rows = lines.map(line => {
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
    cols.push(current);
    return cols;
  });

  const effectiveDate = '2025-01-01';
  const allInserts: string[] = [];

  // Parse WITH DEPENDENTS
  for (let i = 2; i < 363; i++) {
    if (i >= rows.length) break;
    const inserts = parseDataRow(rows[i], true, effectiveDate);
    allInserts.push(...inserts);
  }

  // Parse WITHOUT DEPENDENTS
  for (let i = 364; i < rows.length; i++) {
    const inserts = parseDataRow(rows[i], false, effectiveDate);
    allInserts.push(...inserts);
  }

  console.error(`📊 Generated ${allInserts.length} INSERT statements\n`);

  // Output SQL
  console.log('-- BAH 2025 Rates Import');
  console.log('-- Generated from 2025_BAH_Rates.csv');
  console.log(`-- Total records: ${allInserts.length}`);
  console.log('-- Effective date: 2025-01-01\n');
  
  console.log('-- Delete existing 2025 rates');
  console.log("DELETE FROM bah_rates WHERE effective_date = '2025-01-01';\n");
  
  console.log('-- Insert new rates');
  console.log('INSERT INTO bah_rates (paygrade, mha, with_dependents, effective_date, rate_cents, zip_code, location_name) VALUES');
  
  // Output in chunks of 100 for readability
  for (let i = 0; i < allInserts.length; i += 100) {
    const chunk = allInserts.slice(i, i + 100);
    const isLast = i + 100 >= allInserts.length;
    
    console.log(chunk.join(',\n') + (isLast ? ';' : ','));
    
    if (!isLast) {
      console.log(''); // Blank line between chunks
    }
  }

  console.error(`\n✅ SQL generation complete!`);
  console.error(`   Save output to file: npm run generate-bah-sql > import-bah.sql`);
  console.error(`   Or execute via MCP Supabase migration tool\n`);
}

generateSQL();

