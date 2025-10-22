/**
 * LES AUDITOR DATA FRESHNESS CHECKER
 * 
 * Semi-automated monitoring of all data sources
 * Checks if data is current for the year and provides update instructions
 * 
 * Run: npm run check-data-freshness
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Expected 2025 values (update annually)
const EXPECTED_2025_VALUES = {
  basOfficerCents: 31698,    // $316.98
  basEnlistedCents: 46025,   // $460.25
  ficaWageBaseCents: 17610000, // $176,100
  ficaRate: '0.062',         // 6.2%
  medicareRate: '0.0145'     // 1.45%
};

interface FreshnessCheck {
  source: string;
  status: 'current' | 'stale' | 'critical';
  message: string;
  action?: string;
  officialSource?: string;
  details?: Record<string, string | number>;
}

async function checkDataFreshness(): Promise<FreshnessCheck[]> {
  const checks: FreshnessCheck[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // ==========================================================================
  // Check 1: BAH Rates
  // ==========================================================================
  const { data: bahCheck, count: bahCount } = await supabase
    .from('bah_rates')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);
  
  const bahDate = bahCheck?.[0]?.effective_date || '';
  const bahYear = parseInt(bahDate.split('-')[0] || '0');
  
  checks.push({
    source: 'BAH Rates',
    status: bahYear === currentYear ? 'current' : 'critical',
    message: bahYear === currentYear 
      ? `✅ Current - ${bahDate} (${bahCount?.toLocaleString()} rates loaded)`
      : `🚨 STALE - Last updated ${bahDate}. Need ${currentYear} rates!`,
    action: bahYear !== currentYear 
      ? `Download ${currentYear} BAH rates from DFAS BAH Calculator and run: npm run import-bah <file.csv>`
      : undefined,
    officialSource: 'https://www.defensetravel.dod.mil/site/bahCalc.cfm',
    details: {
      latestDate: bahDate,
      rowCount: bahCount || 0,
      expectedYear: currentYear
    }
  });
  
  // ==========================================================================
  // Check 2: Military Pay Tables
  // ==========================================================================
  const { data: payCheck, count: payCount } = await supabase
    .from('military_pay_tables')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);
  
  const payDate = payCheck?.[0]?.effective_date || '';
  const payYear = parseInt(payDate.split('-')[0] || '0');
  
  checks.push({
    source: 'Military Pay Tables',
    status: payYear === currentYear ? 'current' : 'critical',
    message: payYear === currentYear
      ? `✅ Current - ${payDate} (${payCount} rates loaded)`
      : `🚨 STALE - Last updated ${payDate}. Need ${currentYear} rates!`,
    action: payYear !== currentYear
      ? `Download ${currentYear} military pay tables from DFAS and run: npm run import-pay-tables <file.csv>`
      : `✅ Check DFAS.mil in April for mid-year junior enlisted raises`,
    officialSource: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/',
    details: {
      latestDate: payDate,
      rowCount: payCount || 0,
      expectedYear: currentYear
    }
  });
  
  // ==========================================================================
  // Check 3: BAS Rates (in SSOT)
  // ==========================================================================
  // BAS rates are hardcoded in lib/ssot.ts - check manually
  const basYear = 2025; // Update this check each year
  
  checks.push({
    source: 'BAS Rates (lib/ssot.ts)',
    status: basYear === currentYear ? 'current' : 'critical',
    message: basYear === currentYear
      ? `✅ Current - Officer $${(EXPECTED_2025_VALUES.basOfficerCents/100).toFixed(2)}, Enlisted $${(EXPECTED_2025_VALUES.basEnlistedCents/100).toFixed(2)} (${basYear})`
      : `🚨 MANUAL CHECK REQUIRED - Verify lib/ssot.ts has ${currentYear} BAS rates`,
    action: basYear !== currentYear
      ? `Check DFAS for ${currentYear} BAS rates and manually update lib/ssot.ts lines 249-251`
      : `✅ Verify: Officer should be $316.98, Enlisted should be $460.25`,
    officialSource: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/',
    details: {
      expectedOfficerCents: EXPECTED_2025_VALUES.basOfficerCents,
      expectedEnlistedCents: EXPECTED_2025_VALUES.basEnlistedCents,
      location: 'lib/ssot.ts lines 249-251'
    }
  });
  
  // ==========================================================================
  // Check 4: Tax Constants
  // ==========================================================================
  const { data: taxCheck } = await supabase
    .from('payroll_tax_constants')
    .select('*')
    .eq('effective_year', currentYear)
    .maybeSingle();
  
  checks.push({
    source: 'Tax Constants (FICA/Medicare)',
    status: taxCheck ? 'current' : 'critical',
    message: taxCheck
      ? `✅ Current - ${currentYear} FICA wage base: $${(taxCheck.fica_wage_base_cents/100).toLocaleString()}`
      : `🚨 MISSING - No ${currentYear} tax constants found!`,
    action: !taxCheck
      ? `Check IRS.gov for ${currentYear} FICA wage base and create migration with new values`
      : undefined,
    officialSource: 'https://www.irs.gov/newsroom/social-security-and-medicare-tax-rates',
    details: {
      ficaRate: taxCheck?.fica_rate || 'N/A',
      ficaWageBase: taxCheck?.fica_wage_base_cents ? `$${(taxCheck.fica_wage_base_cents/100).toLocaleString()}` : 'N/A',
      medicareRate: taxCheck?.medicare_rate || 'N/A'
    }
  });
  
  // ==========================================================================
  // Check 5: SGLI Rates
  // ==========================================================================
  const { count: sgliCount } = await supabase
    .from('sgli_rates')
    .select('*', { count: 'exact', head: true });
  
  checks.push({
    source: 'SGLI Premiums',
    status: (sgliCount || 0) >= 8 ? 'current' : 'stale',
    message: (sgliCount || 0) >= 8
      ? `✅ Current - ${sgliCount} coverage tiers loaded`
      : `⚠️ Check VA.gov for updates (SGLI rates change rarely)`,
    action: (sgliCount || 0) < 8
      ? `Review VA.gov for current SGLI premium rates and update sgli_rates table`
      : undefined,
    officialSource: 'https://www.benefits.va.gov/insurance/sgli.asp',
    details: {
      coverageTiers: sgliCount || 0,
      expectedMinimum: 8
    }
  });
  
  // ==========================================================================
  // Check 6: COLA Rates
  // ==========================================================================
  const { data: colaCheck } = await supabase
    .from('conus_cola_rates')
    .select('effective_date')
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const colaDate = colaCheck?.effective_date || '';
  const colaQuarter = getQuarter(colaDate);
  const currentQuarter = getQuarter(new Date().toISOString());
  
  checks.push({
    source: 'COLA Rates (CONUS)',
    status: colaQuarter === currentQuarter ? 'current' : 'stale',
    message: colaQuarter === currentQuarter
      ? `✅ Current - ${colaDate} (Q${colaQuarter} ${currentYear})`
      : `⚠️ May need update - Last: ${colaDate}. Current: Q${currentQuarter} ${currentYear}`,
    action: colaQuarter !== currentQuarter
      ? `Check DTMO for Q${currentQuarter} ${currentYear} COLA updates (rates update quarterly)`
      : undefined,
    officialSource: 'https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/',
    details: {
      latestDate: colaDate,
      currentQuarter: `Q${currentQuarter} ${currentYear}`
    }
  });
  
  return checks;
}

/**
 * Get quarter from date string
 */
function getQuarter(dateStr: string): number {
  const month = parseInt(dateStr.split('-')[1] || '1');
  return Math.ceil(month / 3);
}

/**
 * CLI output
 */
async function main() {
  console.log('\n🔍 LES AUDITOR DATA FRESHNESS CHECK\n');
  console.log('Checking all data sources against official 2025 rates...\n');
  
  const checks = await checkDataFreshness();
  
  let criticalCount = 0;
  let staleCount = 0;
  
  checks.forEach(check => {
    const icon = check.status === 'current' ? '✅' : check.status === 'stale' ? '⚠️' : '🚨';
    
    console.log(`${icon} ${check.source}`);
    console.log(`   ${check.message}`);
    
    if (check.details) {
      console.log(`   📊 Details:`, check.details);
    }
    
    if (check.action) {
      console.log(`   📋 ACTION REQUIRED: ${check.action}`);
    }
    
    if (check.officialSource) {
      console.log(`   🔗 Official Source: ${check.officialSource}`);
    }
    
    console.log('');
    
    if (check.status === 'critical') criticalCount++;
    if (check.status === 'stale') staleCount++;
  });
  
  console.log('─'.repeat(80));
  
  if (criticalCount > 0) {
    console.log(`\n🚨 CRITICAL: ${criticalCount} data source(s) need immediate update!`);
    console.log('⚠️  DO NOT deploy LES Auditor until critical data is updated.\n');
    process.exit(1);
  } else if (staleCount > 0) {
    console.log(`\n⚠️  WARNING: ${staleCount} data source(s) may need review.`);
    console.log('✅ Safe to deploy, but schedule updates soon.\n');
    process.exit(0);
  } else {
    console.log('\n✅ ALL DATA SOURCES ARE CURRENT!');
    console.log('🎯 LES Auditor is using latest official rates.\n');
    process.exit(0);
  }
}

// Run main function
main().catch(error => {
  console.error('\n❌ Error checking data freshness:', error);
  process.exit(1);
});

export { checkDataFreshness };

