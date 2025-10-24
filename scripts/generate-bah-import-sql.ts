/**
 * Import Official 2025 BAH Rates - MCP Version
 * 
 * Uses Supabase MCP tools to import official 2025 BAH rates
 */

import fs from 'fs';
import path from 'path';

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

export function parseBAHCSV(csvPath: string): BAHRate[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  const rates: BAHRate[] = [];
  let currentSection: 'with' | 'without' | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    if (line.includes('WITH DEPENDENTS')) {
      currentSection = 'with';
      continue;
    }
    if (line.includes('WITHOUT DEPENDENTS')) {
      currentSection = 'without';
      continue;
    }
    
    if (line.startsWith('MHA,MHA_NAME') || line.includes('Page ') || !currentSection) {
      continue;
    }
    
    // Handle CSV with quoted location names that contain commas
    // Example: CA024,"CAMP PENDLETON, CA",3594,3594,...
    // We need to properly parse the quoted field
    const match = line.match(/^([^,]+),"([^"]+)",(.+)$/);
    if (!match) continue;
    
    const mha = match[1].trim();
    const locationName = match[2].trim();
    const rateColumns = match[3].split(',');
    
    if (!locationName) continue;
    
    for (let j = 0; j < PAYGRADES.length; j++) {
      const rateColumn = rateColumns[j];  // Now using properly parsed rateColumns
      if (!rateColumn) continue;
      
      const rateValue = parseInt(rateColumn.replace(/"/g, '').trim());
      if (isNaN(rateValue) || rateValue === 0) continue;
      
      rates.push({
        mha,
        location_name: locationName,
        paygrade: PAYGRADES[j],
        with_dependents: currentSection === 'with',
        rate_cents: rateValue * 100,
        effective_date: '2025-01-01'
      });
    }
  }
  
  return rates;
}

// Parse and generate SQL
const csvPath = path.join(process.cwd(), 'data', '2025_BAH_Rates.csv');
console.log('📂 Parsing CSV...');
const rates = parseBAHCSV(csvPath);
console.log(`✅ Parsed ${rates.length} BAH rates\n`);

// Generate SQL file
const sqlStatements: string[] = [
  '-- Official 2025 BAH Rates Import',
  '-- Generated from DFAS CSV',
  `-- Total rates: ${rates.length}`,
  '',
  '-- Step 1: Clear existing data',
  'DELETE FROM bah_rates;',
  '',
  '-- Step 2: Insert 2025 BAH rates',
];

// Insert in batches of 100 for readability
for (let i = 0; i < rates.length; i += 100) {
  const batch = rates.slice(i, i + 100);
  
  sqlStatements.push(`-- Batch ${Math.floor(i / 100) + 1} (rows ${i + 1}-${i + batch.length})`);
  sqlStatements.push('INSERT INTO bah_rates (mha, location_name, paygrade, with_dependents, rate_cents, effective_date) VALUES');
  
  const values = batch.map(r => 
    `  ('${r.mha}', '${r.location_name.replace(/'/g, "''")}', '${r.paygrade}', ${r.with_dependents}, ${r.rate_cents}, '${r.effective_date}')`
  );
  
  sqlStatements.push(values.join(',\n') + ';');
  sqlStatements.push('');
}

const sqlContent = sqlStatements.join('\n');
const outputPath = path.join(process.cwd(), 'scripts', 'import-bah-2025.sql');
fs.writeFileSync(outputPath, sqlContent);

console.log(`✅ Generated SQL file: ${outputPath}`);
console.log(`📊 Total statements: ${sqlStatements.length}`);
console.log(`📦 Total rates to import: ${rates.length}`);
console.log('\n✅ Ready for import!');

