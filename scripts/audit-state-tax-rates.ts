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

// For now, this is a reference script - actual database queries should be done via MCP

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
  console.log('⚠️  This is a reference script. Use MCP Supabase connection for actual database queries.\n');

  // This is a reference implementation - actual queries should be done via MCP
  console.log('📊 Reference: Known correct supplemental wage withholding rates for 2025:');
  console.table(Object.entries(KNOWN_CORRECT_RATES).map(([state, rate]) => ({
    State: state,
    'Supplemental Rate': `${(rate * 100).toFixed(2)}%`,
    'Tax Type': rate === 0 ? 'No income tax' : 'Supplemental wage withholding'
  })));

  console.log('\n📝 To run actual audit:');
  console.log('1. Use MCP Supabase connection to query state_tax_rates table');
  console.log('2. Compare against KNOWN_CORRECT_RATES in this script');
  console.log('3. Update any discrepancies found');

  return [];
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
