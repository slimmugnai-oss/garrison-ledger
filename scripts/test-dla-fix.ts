#!/usr/bin/env npx tsx

/**
 * Test script to verify DLA calculation fix
 * Tests that DLA calculation now returns correct amounts instead of $0
 */

import { getDLARate } from '../lib/pcs/jtr-api';

async function testDLAFix() {
  console.log('🧪 Testing DLA Calculation Fix\n');

  try {
    // Test E-5 with dependents (should be $3,062)
    console.log('🔍 Testing E-5 with dependents...');
    const e5WithDeps = await getDLARate('E-5', true, '2025-01-01');
    console.log(`   Result: $${e5WithDeps}`);
    console.log(`   Expected: $3,062`);
    console.log(`   Status: ${e5WithDeps === 3062 ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test E-5 without dependents (should be $2,243)
    console.log('🔍 Testing E-5 without dependents...');
    const e5WithoutDeps = await getDLARate('E-5', false, '2025-01-01');
    console.log(`   Result: $${e5WithoutDeps}`);
    console.log(`   Expected: $2,243`);
    console.log(`   Status: ${e5WithoutDeps === 2243 ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test O-3 with dependents (should be $3,939)
    console.log('🔍 Testing O-3 with dependents...');
    const o3WithDeps = await getDLARate('O-3', true, '2025-01-01');
    console.log(`   Result: $${o3WithDeps}`);
    console.log(`   Expected: $3,939`);
    console.log(`   Status: ${o3WithDeps === 3939 ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test E-1 with dependents (should be $2,584)
    console.log('🔍 Testing E-1 with dependents...');
    const e1WithDeps = await getDLARate('E-1', true, '2025-01-01');
    console.log(`   Result: $${e1WithDeps}`);
    console.log(`   Expected: $2,584`);
    console.log(`   Status: ${e1WithDeps === 2584 ? '✅ PASS' : '❌ FAIL'}\n`);

    // Summary
    const allPassed = e5WithDeps === 3062 && e5WithoutDeps === 2243 && o3WithDeps === 3939 && e1WithDeps === 2584;
    
    console.log('📊 Test Results:');
    console.log(`   E-5 with dependents: ${e5WithDeps === 3062 ? '✅' : '❌'}`);
    console.log(`   E-5 without dependents: ${e5WithoutDeps === 2243 ? '✅' : '❌'}`);
    console.log(`   O-3 with dependents: ${o3WithDeps === 3939 ? '✅' : '❌'}`);
    console.log(`   E-1 with dependents: ${e1WithDeps === 2584 ? '✅' : '❌'}`);
    
    if (allPassed) {
      console.log('\n🎉 All DLA tests passed! DLA calculation is now working correctly.');
    } else {
      console.log('\n❌ Some DLA tests failed. Check the cache and database data.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDLAFix();
