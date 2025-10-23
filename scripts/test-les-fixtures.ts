/**
 * LES AUDITOR ACCEPTANCE TESTS
 * 
 * Tests audit endpoint with known fixtures and validates responses.
 * Saves actual responses to review/les-auditor/runs/ for manual inspection.
 * 
 * Usage:
 *   npm run test:fixtures
 * 
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - Valid auth token (set CLERK_JWT environment variable)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ANSI colors
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;

interface AuditResponse {
  summary: {
    net_delta: number;
    total_allowances: number;
    total_taxes: number;
    total_deductions: number;
  };
  flags: Array<{
    severity: 'red' | 'yellow' | 'green';
    flag_code: string;
    message: string;
    delta_cents?: number;
  }>;
  auditId: string;
}

async function testFixture(name: string): Promise<AuditResponse> {
  console.log(blue(`\n📋 Testing fixture: ${name}`));
  
  // Read request fixture
  const requestPath = join(process.cwd(), `review/les-auditor/fixtures/${name}.request.json`);
  const request = JSON.parse(readFileSync(requestPath, 'utf-8'));
  
  // Get auth token from environment or use a test token
  const authToken = process.env.CLERK_JWT || 'test-token';
  
  // Call API
  console.log(`   → Calling POST /api/les/audit`);
  const response = await fetch('http://localhost:3000/api/les/audit', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API returned ${response.status}: ${error}`);
  }
  
  const result: AuditResponse = await response.json();
  
  // Save response to runs/
  const outputPath = join(process.cwd(), `review/les-auditor/runs/${name}.response.json`);
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(green(`   ✓ Response saved to ${outputPath}`));
  
  return result;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

async function main() {
  console.log(blue('═══════════════════════════════════════════════'));
  console.log(blue('  LES AUDITOR ACCEPTANCE TESTS'));
  console.log(blue('═══════════════════════════════════════════════\n'));
  
  let passed = 0;
  let failed = 0;
  
  try {
    // =========================================================================
    // TEST 1: Happy Path (E05 @ Fort Hood)
    // =========================================================================
    console.log(yellow('\n🧪 TEST 1: Happy Path - All Correct'));
    const happy = await testFixture('happy_path_e5_fthood');
    
    console.log(`   → Validating response...`);
    
    // All flags should be green
    const allGreen = happy.flags.every(f => f.severity === 'green');
    assert(allGreen, 'All flags should be green');
    console.log(green(`   ✓ All ${happy.flags.length} flags are green`));
    
    // Net delta should be ≤ $1 (100 cents)
    assert(
      Math.abs(happy.summary.net_delta) <= 100, 
      `Net delta should be ≤ $1, got ${happy.summary.net_delta} cents`
    );
    console.log(green(`   ✓ Net delta within tolerance: ${happy.summary.net_delta} cents`));
    
    // Should have FICA and Medicare green flags
    const ficaGreen = happy.flags.some(f => f.flag_code === 'FICA_PCT_CORRECT');
    const medicareGreen = happy.flags.some(f => f.flag_code === 'MEDICARE_PCT_CORRECT');
    assert(ficaGreen, 'Should have FICA_PCT_CORRECT flag');
    assert(medicareGreen, 'Should have MEDICARE_PCT_CORRECT flag');
    console.log(green(`   ✓ FICA and Medicare percentages validated`));
    
    console.log(green('\n   ✅ TEST 1 PASSED'));
    passed++;
    
  } catch (error) {
    console.error(red(`\n   ❌ TEST 1 FAILED: ${error}`));
    failed++;
  }
  
  try {
    // =========================================================================
    // TEST 2: BAH Mismatch (E06 @ Fort Bragg)
    // =========================================================================
    console.log(yellow('\n🧪 TEST 2: BAH Mismatch - Red Flags Expected'));
    const bah = await testFixture('bah_mismatch_e6_pcs');
    
    console.log(`   → Validating response...`);
    
    // Should have BAH_MISMATCH red flag
    const bahFlag = bah.flags.find(f => f.flag_code === 'BAH_MISMATCH');
    assert(bahFlag !== undefined, 'Should have BAH_MISMATCH flag');
    assert(bahFlag?.severity === 'red', 'BAH_MISMATCH should be red');
    assert(bahFlag?.delta_cents === 30000, `BAH delta should be $300 (30000 cents), got ${bahFlag?.delta_cents}`);
    console.log(green(`   ✓ BAH_MISMATCH flag detected with $300 delta`));
    
    // Should have NET_MATH_MISMATCH red flag (because BAH is wrong)
    const netFlag = bah.flags.find(f => f.flag_code === 'NET_MATH_MISMATCH');
    assert(netFlag !== undefined, 'Should have NET_MATH_MISMATCH flag');
    assert(netFlag?.severity === 'red', 'NET_MATH_MISMATCH should be red');
    console.log(green(`   ✓ NET_MATH_MISMATCH flag detected`));
    
    // Should still have FICA and Medicare green flags (taxes are correct)
    const ficaGreen = bah.flags.some(f => f.flag_code === 'FICA_PCT_CORRECT');
    const medicareGreen = bah.flags.some(f => f.flag_code === 'MEDICARE_PCT_CORRECT');
    assert(ficaGreen, 'Should have FICA_PCT_CORRECT flag');
    assert(medicareGreen, 'Should have MEDICARE_PCT_CORRECT flag');
    console.log(green(`   ✓ FICA and Medicare percentages still correct`));
    
    console.log(green('\n   ✅ TEST 2 PASSED'));
    passed++;
    
  } catch (error) {
    console.error(red(`\n   ❌ TEST 2 FAILED: ${error}`));
    failed++;
  }
  
  try {
    // =========================================================================
    // TEST 3: FICA Wage Base (O06 High Earner)
    // =========================================================================
    console.log(yellow('\n🧪 TEST 3: FICA Wage Base - Yellow Flag Expected'));
    const ficaWageBase = await testFixture('fica_wage_base');
    
    console.log(`   → Validating response...`);
    
    // Should have FICA_PCT_OUT_OF_RANGE yellow flag
    const ficaFlag = ficaWageBase.flags.find(f => f.flag_code === 'FICA_PCT_OUT_OF_RANGE');
    assert(ficaFlag !== undefined, 'Should have FICA_PCT_OUT_OF_RANGE flag');
    assert(ficaFlag?.severity === 'yellow', 'FICA_PCT_OUT_OF_RANGE should be yellow');
    console.log(green(`   ✓ FICA wage base flag detected`));
    
    // Medicare should still be correct
    const medicareGreen = ficaWageBase.flags.some(f => f.flag_code === 'MEDICARE_PCT_CORRECT');
    assert(medicareGreen, 'Medicare should still be correct');
    console.log(green(`   ✓ Medicare continues (correct)`));
    
    console.log(green('\n   ✅ TEST 3 PASSED'));
    passed++;
    
  } catch (error) {
    console.error(red(`\n   ❌ TEST 3 FAILED: ${error}`));
    failed++;
  }
  
  try {
    // =========================================================================
    // TEST 4: Code Normalization (E04)
    // =========================================================================
    console.log(yellow('\n🧪 TEST 4: Code Normalization - All Green Expected'));
    const normalized = await testFixture('medicare_hi_only');
    
    console.log(`   → Validating response...`);
    
    // All flags should be green (codes normalized successfully)
    const allGreen = normalized.flags.every(f => f.severity === 'green');
    assert(allGreen, 'All flags should be green after normalization');
    console.log(green(`   ✓ All ${normalized.flags.length} flags are green`));
    
    // Should have FICA and Medicare green flags
    const ficaGreen = normalized.flags.some(f => f.flag_code === 'FICA_PCT_CORRECT');
    const medicareGreen = normalized.flags.some(f => f.flag_code === 'MEDICARE_PCT_CORRECT');
    assert(ficaGreen, 'FICA should be validated');
    assert(medicareGreen, 'MEDICARE HI should normalize to MEDICARE and validate');
    console.log(green(`   ✓ Code normalization successful`));
    
    console.log(green('\n   ✅ TEST 4 PASSED'));
    passed++;
    
  } catch (error) {
    console.error(red(`\n   ❌ TEST 4 FAILED: ${error}`));
    failed++;
  }
  
  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(blue('\n═══════════════════════════════════════════════'));
  console.log(blue('  ACCEPTANCE TEST RESULTS'));
  console.log(blue('═══════════════════════════════════════════════\n'));
  
  console.log(`  Total Tests: ${passed + failed}`);
  console.log(green(`  Passed: ${passed}`));
  if (failed > 0) {
    console.log(red(`  Failed: ${failed}`));
  }
  
  if (failed === 0) {
    console.log(green('\n  ✅ ALL ACCEPTANCE TESTS PASSED!\n'));
    process.exit(0);
  } else {
    console.log(red('\n  ❌ SOME TESTS FAILED\n'));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(red(`\n💥 Fatal error: ${error}`));
  process.exit(1);
});

