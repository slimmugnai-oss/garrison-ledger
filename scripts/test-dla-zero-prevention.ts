#!/usr/bin/env npx tsx

/**
 * Comprehensive test to ensure DLA never returns $0
 * Tests all possible failure scenarios and fallback mechanisms
 */

import { getDLARate } from '../lib/pcs/jtr-api';

async function testDLAZeroPrevention() {
  console.log('🛡️  Testing DLA Zero Prevention Safeguards\n');

  const testCases = [
    { rank: 'E-5', hasDependents: true, expected: 3062 },
    { rank: 'E-5', hasDependents: false, expected: 2243 },
    { rank: 'O-3', hasDependents: true, expected: 3939 },
    { rank: 'E-1', hasDependents: true, expected: 2584 },
    { rank: 'W-2', hasDependents: false, expected: 2721 },
    { rank: 'E9', hasDependents: true, expected: 4488 }, // Test without dash
    { rank: 'O10', hasDependents: false, expected: 5039 }, // Test without dash
    { rank: 'INVALID_RANK', hasDependents: true, expected: 3062 }, // Test invalid rank fallback
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.rank} ${testCase.hasDependents ? 'with' : 'without'} dependents`);
    
    try {
      const result = await getDLARate(testCase.rank, testCase.hasDependents, '2025-01-01');
      
      console.log(`   Result: $${result}`);
      console.log(`   Expected: $${testCase.expected}`);
      
      if (result === testCase.expected) {
        console.log(`   Status: ✅ PASS\n`);
      } else {
        console.log(`   Status: ❌ FAIL\n`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`   Error: ${error}`);
      console.log(`   Status: ❌ FAIL\n`);
      allPassed = false;
    }
  }

  // Test edge cases that could cause $0
  console.log('🚨 Testing Edge Cases That Could Cause $0:\n');

  const edgeCases = [
    { description: 'Empty rank string', rank: '', hasDependents: true },
    { description: 'Null rank', rank: null as any, hasDependents: true },
    { description: 'Undefined rank', rank: undefined as any, hasDependents: true },
    { description: 'Very old effective date', rank: 'E-5', hasDependents: true, effectiveDate: '1990-01-01' },
    { description: 'Future effective date', rank: 'E-5', hasDependents: true, effectiveDate: '2030-01-01' },
  ];

  for (const edgeCase of edgeCases) {
    console.log(`🔍 Testing: ${edgeCase.description}`);
    
    try {
      const result = await getDLARate(edgeCase.rank, edgeCase.hasDependents, edgeCase.effectiveDate || '2025-01-01');
      
      console.log(`   Result: $${result}`);
      
      if (result > 0) {
        console.log(`   Status: ✅ PASS (Got fallback amount)\n`);
      } else {
        console.log(`   Status: ❌ FAIL (Got $0!)\n`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`   Error: ${error}`);
      console.log(`   Status: ❌ FAIL\n`);
      allPassed = false;
    }
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   All tests passed: ${allPassed ? '✅ YES' : '❌ NO'}`);
  
  if (allPassed) {
    console.log('\n🎉 DLA Zero Prevention is working perfectly!');
    console.log('   - Database lookup works correctly');
    console.log('   - Fallback rates prevent $0 calculations');
    console.log('   - Edge cases are handled gracefully');
    console.log('   - DLA will NEVER show as $0 again!');
  } else {
    console.log('\n❌ Some tests failed. DLA could still show as $0.');
    console.log('   Check the logs above for specific failures.');
  }
}

// Run the test
testDLAZeroPrevention().catch(console.error);
