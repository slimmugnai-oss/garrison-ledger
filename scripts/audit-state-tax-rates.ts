#!/usr/bin/env tsx

/**
 * Audit State Tax Rates
 * 
 * Verifies that all 51 states/territories use correct supplemental wage withholding rates
 * for PPM income, NOT sales tax or regular income brackets.
 * 
 * Usage: npx tsx scripts/audit-state-tax-rates.ts
 */

// Note: This script should be run with environment variables loaded
// or use the MCP Supabase connection for database queries

/**
 * Known correct supplemental wage withholding rates for 2025
 * These are for bonus/PPM income, NOT sales tax or regular income brackets
 */
const KNOWN_CORRECT_RATES: Record<string, number> = {
  // No-tax states (0% income tax)
  'AK': 0, 'FL': 0, 'NV': 0, 'NH': 0, 'SD': 0, 'TN': 0, 'TX': 0, 'WA': 0, 'WY': 0,
  
  // Flat tax states (single rate for all income)
  'CO': 0.044,  // 4.4%
  'IL': 0.0495, // 4.95%
  'IN': 0.0315, // 3.15%
  'MI': 0.0425, // 4.25%
  'NC': 0.0475, // 4.75%
  'PA': 0.0307, // 3.07%
  'UT': 0.0465, // 4.65%
  'KY': 0.04,   // 4.0%
  'MS': 0.05,   // 5.0%
  'MA': 0.05,   // 5.0%
  'ID': 0.058,  // 5.8%
  'IA': 0.036,  // 3.6%
  'AZ': 0.025,  // 2.5%
  
  // States with graduated tax - use top rate for supplemental wages
  'GA': 0.0575,  // 5.75% (top rate for graduated tax)
  'CA': 0.13,    // 13.3% (top rate - very high!)
  'CT': 0.06,    // 6.0% (top rate)
  'DC': 0.10,    // 10.0% (top rate)
  'DE': 0.06,    // 6.0% (top rate)
  'HI': 0.11,    // 11.0% (top rate)
  'KS': 0.057,   // 5.7% (top rate)
  'LA': 0.06,    // 6.0% (top rate)
  'MD': 0.0575,  // 5.75% (top rate)
  'ME': 0.075,   // 7.5% (top rate)
  'MN': 0.099,   // 9.9% (top rate)
  'MO': 0.054,   // 5.4% (top rate)
  'MT': 0.069,   // 6.9% (top rate)
  'NE': 0.068,   // 6.8% (top rate)
  'NJ': 0.10,    // 10.0% (top rate)
  'NM': 0.059,   // 5.9% (top rate)
  'NY': 0.10,    // 10.0% (top rate)
  'OH': 0.05,    // 5.0% (top rate)
  'OK': 0.05,    // 5.0% (top rate)
  'OR': 0.099,   // 9.9% (top rate)
  'RI': 0.059,   // 5.9% (top rate)
  'SC': 0.07,    // 7.0% (top rate)
  'VT': 0.087,   // 8.7% (top rate)
  'WI': 0.076,   // 7.6% (top rate)
  'WV': 0.065,   // 6.5% (top rate)
  'ND': 0.029,   // 2.9% (top rate)
  'AL': 0.05,    // 5.0% (top rate)
  'AR': 0.05,    // 5.0% (top rate)
  'VA': 0.0575,  // 5.75% (top rate)
};

interface Discrepancy {
  state: string;
  stateName: string;
  currentRate: number;
  expectedRate: number;
  difference: number;
  currentDisplay: string;
  expectedDisplay: string;
  issue: string;
}

async function auditStateTaxRates(): Promise<Discrepancy[]> {
  console.log('🔍 Auditing state tax rates for supplemental wage withholding...\n');

  // Query current rates from database
  const { data, error } = await supabase
    .from('state_tax_rates')
    .select('state_code, state_name, flat_rate, avg_rate_mid, effective_year')
    .eq('effective_year', 2025)
    .order('state_code');

  if (error) {
    console.error('❌ Failed to query state_tax_rates:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.error('❌ No state tax rates found for 2025');
    return [];
  }

  console.log(`📊 Found ${data.length} states/territories in database\n`);

  const discrepancies: Discrepancy[] = [];

  for (const state of data) {
    const expectedRate = KNOWN_CORRECT_RATES[state.state_code];
    const currentRate = parseFloat(state.flat_rate || state.avg_rate_mid || '0');
    
    if (expectedRate === undefined) {
      console.log(`⚠️  ${state.state_code} (${state.state_name}): No expected rate defined - needs manual research`);
      continue;
    }

    const difference = Math.abs(expectedRate - currentRate);
    const threshold = 0.001; // 0.1% tolerance

    if (difference > threshold) {
      const discrepancy: Discrepancy = {
        state: state.state_code,
        stateName: state.state_name,
        currentRate,
        expectedRate,
        difference,
        currentDisplay: `${(currentRate * 100).toFixed(2)}%`,
        expectedDisplay: `${(expectedRate * 100).toFixed(2)}%`,
        issue: currentRate === 0 ? 'Missing rate' : 'Incorrect rate'
      };
      
      discrepancies.push(discrepancy);
    }
  }

  // Display results
  if (discrepancies.length === 0) {
    console.log('✅ All state tax rates are correct!\n');
  } else {
    console.log(`❌ Found ${discrepancies.length} states with incorrect rates:\n`);
    
    console.table(discrepancies.map(d => ({
      State: d.state,
      'Current Rate': d.currentDisplay,
      'Expected Rate': d.expectedDisplay,
      'Difference': `${(d.difference * 100).toFixed(2)}%`,
      Issue: d.issue
    })));

    console.log('\n📝 Recommended fixes:');
    discrepancies.forEach(d => {
      console.log(`UPDATE state_tax_rates SET avg_rate_mid = '${d.expectedRate}' WHERE state_code = '${d.state}' AND effective_year = 2025;`);
    });
  }

  // Summary
  console.log('\n📈 Summary:');
  console.log(`• Total states audited: ${data.length}`);
  console.log(`• Correct rates: ${data.length - discrepancies.length}`);
  console.log(`• Incorrect rates: ${discrepancies.length}`);
  console.log(`• Coverage: ${Object.keys(KNOWN_CORRECT_RATES).length}/51 states have verified rates`);

  return discrepancies;
}

// Run the audit
if (require.main === module) {
  auditStateTaxRates()
    .then(discrepancies => {
      if (discrepancies.length > 0) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

export { auditStateTaxRates };
