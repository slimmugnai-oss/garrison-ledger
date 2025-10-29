/**
 * MILITARY PAY TABLES COMPREHENSIVE AUDIT
 * 
 * Compares our database against official 2025 DFAS pay rates
 * 
 * Official Sources:
 * - DFAS 2025 Military Pay Charts
 * - NavyCS.com (reliable, comprehensive)
 * - Military.com 2025 Pay Charts
 * 
 * Usage: npx tsx scripts/audit-military-pay-tables.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OFFICIAL 2025 DFAS PAY RATES (verified from multiple sources)
// Format: paygrade -> years_of_service -> monthly_rate_dollars

const OFFICIAL_2025_PAY_RATES: Record<string, Record<number, number>> = {
  // E-7 (CRITICAL - User reported these exact values)
  'E07': {
    0: 3812.26,
    2: 4179.91,
    3: 4179.91,
    4: 4342.33,
    6: 4699.50,
    8: 4946.20,
    10: 5116.79,
    12: 5394.01,
    14: 5528.91,
    16: 5715.79,
    18: 5951.10,  // USER CONFIRMED: Should be $5,951.10
    19: 5951.10,  // Same as over 18
    20: 6017.10,  // USER CONFIRMED: Should be $6,017.10
    21: 6017.10,  // Same as over 20
    22: 6238.20,  // USER CONFIRMED: Should be $6,238.20
    23: 6238.20,  // Same as over 22
    24: 6356.70,  // USER CONFIRMED: Should be $6,356.70
    25: 6356.70,  // Same as over 24
    26: 6808.80,  // USER CONFIRMED: Should be $6,808.80
    27: 6808.80,  // Same as over 26
    28: 6808.80,
    29: 6808.80,
    30: 7146.00,  // Over 30
  },
  
  // E-1 through E-4 (APRIL 2025 - after 14.5% total raise)
  'E01': {
    0: 2017.20,   // < 4 months, April 2025
    1: 2017.20,
    2: 2017.20,
  },
  'E02': {
    0: 2260.80,
    1: 2260.80,
    2: 2260.80,
  },
  'E03': {
    0: 2377.80,
    2: 2511.00,
    3: 2646.30,
    4: 2646.30,
  },
  'E04': {
    0: 2633.40,
    2: 2767.20,
    3: 2917.50,
    4: 3050.10,
    6: 3185.10,
  },
  
  // E-5 through E-9 (January 2025 - 4.5% raise only)
  'E05': {
    0: 3304.20,
    2: 3517.80,
    3: 3690.30,
    4: 3838.80,
    6: 4168.20,
    8: 4456.50,
    10: 4621.20,
    12: 4858.20,
    14: 5028.90,
    16: 5194.80,
    18: 5399.10,
    20: 5399.10,
  },
  'E06': {
    0: 3608.40,
    2: 3988.80,
    3: 4121.40,
    4: 4254.60,
    6: 4386.90,
    8: 4822.20,
    10: 4978.20,
    12: 5291.70,
    14: 5424.30,
    16: 5489.40,
    18: 5599.80,
    20: 5599.80,
    22: 5599.80,
  },
  'E08': {
    0: 5449.50,
    2: 5669.10,
    3: 5802.60,
    4: 5977.80,
    6: 6172.20,
    8: 6332.10,
    10: 6498.60,
    12: 6753.90,
    14: 6942.90,
    16: 7139.70,
    18: 7348.80,
    20: 7772.10,
    22: 7772.10,
    26: 7772.10,
  },
  'E09': {
    0: 6657.30,
    2: 6830.10,
    3: 7008.00,
    4: 7253.10,
    6: 7499.70,
    8: 7716.00,
    10: 7938.00,
    12: 8201.10,
    14: 8498.70,
    16: 8826.60,
    18: 9161.10,
    20: 9737.40,
    22: 9932.70,
    26: 10336.50,
  },
};

interface PayTableRow {
  paygrade: string;
  years_of_service: number;
  monthly_rate_cents: number;
  effective_date: string;
}

interface Discrepancy {
  paygrade: string;
  years_of_service: number;
  our_rate: number;
  official_rate: number;
  difference: number;
  percent_error: number;
}

async function auditPayTables() {
  console.log('🔍 MILITARY PAY TABLES COMPREHENSIVE AUDIT\n');
  console.log('Generated:', new Date().toISOString());
  console.log('Official Source: DFAS 2025 Military Pay Charts\n');
  console.log('═'.repeat(80));
  console.log('\n');
  
  // Fetch all data from database
  const { data: dbData, error } = await supabase
    .from('military_pay_tables')
    .select('*')
    .order('paygrade')
    .order('years_of_service');
  
  if (error) {
    console.error('❌ Failed to fetch pay tables:', error);
    process.exit(1);
  }
  
  console.log(`📊 Database Summary:`);
  console.log(`   Total rows: ${dbData.length}`);
  console.log(`   Unique paygrades: ${[...new Set(dbData.map(r => r.paygrade))].length}`);
  console.log(`   Years range: ${Math.min(...dbData.map(r => r.years_of_service))} - ${Math.max(...dbData.map(r => r.years_of_service))}`);
  console.log('\n');
  
  // Audit each paygrade we have official data for
  const discrepancies: Discrepancy[] = [];
  const missing: { paygrade: string; year: number }[] = [];
  let totalChecked = 0;
  let totalCorrect = 0;
  
  for (const [paygrade, officialRates] of Object.entries(OFFICIAL_2025_PAY_RATES)) {
    console.log(`\n🔎 Auditing ${paygrade}...`);
    
    for (const [yearStr, officialRate] of Object.entries(officialRates)) {
      const year = parseInt(yearStr);
      totalChecked++;
      
      // Find matching row in our database
      const dbRow = dbData.find(r => r.paygrade === paygrade && r.years_of_service === year);
      
      if (!dbRow) {
        missing.push({ paygrade, year });
        console.log(`   ⚠️  MISSING: ${paygrade} @ ${year} years (should be $${officialRate.toFixed(2)})`);
        continue;
      }
      
      const ourRate = dbRow.monthly_rate_cents / 100;
      const difference = ourRate - officialRate;
      const percentError = (difference / officialRate) * 100;
      
      if (Math.abs(difference) > 0.50) { // Allow $0.50 rounding tolerance
        discrepancies.push({
          paygrade,
          years_of_service: year,
          our_rate: ourRate,
          official_rate: officialRate,
          difference,
          percent_error: percentError,
        });
        
        console.log(`   ❌ ERROR: ${paygrade} @ ${year} years`);
        console.log(`      Ours:     $${ourRate.toFixed(2)}`);
        console.log(`      Official: $${officialRate.toFixed(2)}`);
        console.log(`      Diff:     ${difference > 0 ? '+' : ''}$${difference.toFixed(2)} (${percentError > 0 ? '+' : ''}${percentError.toFixed(2)}%)`);
      } else {
        totalCorrect++;
      }
    }
  }
  
  // Summary Report
  console.log('\n\n');
  console.log('═'.repeat(80));
  console.log('\n📋 AUDIT SUMMARY\n');
  console.log('═'.repeat(80));
  console.log('\n');
  
  console.log(`✅ Correct rates: ${totalCorrect}/${totalChecked} (${((totalCorrect/totalChecked)*100).toFixed(1)}%)`);
  console.log(`❌ Incorrect rates: ${discrepancies.length}`);
  console.log(`⚠️  Missing data: ${missing.length} rows\n`);
  
  if (discrepancies.length > 0) {
    console.log(`\n🚨 CRITICAL DISCREPANCIES (Top 10 by dollar amount):\n`);
    discrepancies
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
      .slice(0, 10)
      .forEach((d, i) => {
        console.log(`${i + 1}. ${d.paygrade} @ ${d.years_of_service} years:`);
        console.log(`   Ours: $${d.our_rate.toFixed(2)} | Official: $${d.official_rate.toFixed(2)} | Diff: ${d.difference > 0 ? '+' : ''}$${d.difference.toFixed(2)}`);
      });
  }
  
  if (missing.length > 0) {
    console.log(`\n⚠️  MISSING YEARS OF SERVICE DATA:\n`);
    const missingByPaygrade: Record<string, number[]> = {};
    missing.forEach(m => {
      if (!missingByPaygrade[m.paygrade]) missingByPaygrade[m.paygrade] = [];
      missingByPaygrade[m.paygrade].push(m.year);
    });
    
    Object.entries(missingByPaygrade).forEach(([pg, years]) => {
      console.log(`   ${pg}: Missing years ${years.join(', ')}`);
    });
  }
  
  // Financial Impact
  if (discrepancies.length > 0) {
    const avgError = discrepancies.reduce((sum, d) => sum + Math.abs(d.difference), 0) / discrepancies.length;
    const maxError = Math.max(...discrepancies.map(d => Math.abs(d.difference)));
    
    console.log(`\n💰 FINANCIAL IMPACT:`);
    console.log(`   Average error: $${avgError.toFixed(2)}/month`);
    console.log(`   Maximum error: $${maxError.toFixed(2)}/month`);
    console.log(`   Annual impact (max): $${(maxError * 12).toFixed(2)}/year`);
  }
  
  // Write report to file
  const report = {
    generated: new Date().toISOString(),
    summary: {
      total_checked: totalChecked,
      correct: totalCorrect,
      incorrect: discrepancies.length,
      missing: missing.length,
      accuracy_percent: ((totalCorrect/totalChecked)*100).toFixed(2),
    },
    discrepancies,
    missing,
  };
  
  fs.writeFileSync('pay-tables-audit-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: pay-tables-audit-report.json\n`);
  
  // Exit code based on results
  if (discrepancies.length > 0 || missing.length > 0) {
    console.log('❌ AUDIT FAILED - Immediate action required\n');
    process.exit(1);
  } else {
    console.log('✅ AUDIT PASSED - All rates match official DFAS\n');
    process.exit(0);
  }
}

auditPayTables().catch(console.error);

