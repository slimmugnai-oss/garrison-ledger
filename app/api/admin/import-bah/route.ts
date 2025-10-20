/**
 * BAH CSV IMPORT API
 * 
 * Endpoint to bulk import BAH rates from CSV
 * POST /api/admin/import-bah
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for bulk import

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

interface BAHRate {
  paygrade: string;
  mha: string;
  with_dependents: boolean;
  effective_date: string;
  rate_cents: number;
  zip_code: string | null;
  location_name: string;
}

function parseDataRow(
  row: string[],
  withDependents: boolean,
  effectiveDate: string
): BAHRate[] {
  const mha = row[0]?.trim();
  const locationName = row[1]?.trim().replace(/"/g, '');

  if (!mha || !locationName || mha.includes('MHA') || mha.includes('Page')) {
    return [];
  }

  const rates: BAHRate[] = [];
  const zipCode = null;

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

export async function POST() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Read CSV file
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
    const allRates: BAHRate[] = [];

    // Parse WITH DEPENDENTS (rows 2-362)
    for (let i = 2; i < 363; i++) {
      if (i >= rows.length) break;
      const rates = parseDataRow(rows[i], true, effectiveDate);
      allRates.push(...rates);
    }

    // Parse WITHOUT DEPENDENTS (rows 364-725)
    for (let i = 364; i < rows.length; i++) {
      const rates = parseDataRow(rows[i], false, effectiveDate);
      allRates.push(...rates);
    }


    // Delete existing 2025 rates
    const { error: deleteError } = await supabaseAdmin
      .from('bah_rates')
      .delete()
      .eq('effective_date', effectiveDate);

    if (deleteError) {
    }

    // Insert in batches
    const BATCH_SIZE = 500;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < allRates.length; i += BATCH_SIZE) {
      const batch = allRates.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabaseAdmin
        .from('bah_rates')
        .insert(batch);

      if (error) {
        errors++;
      } else {
        inserted += batch.length;
      }
    }


    return NextResponse.json({
      success: true,
      inserted,
      errors,
      totalParsed: allRates.length,
      mhaCodes: new Set(allRates.map(r => r.mha)).size,
      paygrades: new Set(allRates.map(r => r.paygrade)).size,
      effectiveDate,
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Import failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

