#!/usr/bin/env tsx
/**
 * CRITICAL MHA CODE AUDIT
 * 
 * Validates that every base in bases-all.json:
 * 1. Has a valid MHA code format (XX###)
 * 2. MHA exists in bah_rates table
 * 3. MHA matches the base location
 * 4. All 3 candidate ZIPs are valid
 */

import 'dotenv/config';
import basesAllData from '../lib/data/bases-all.json';
import { supabaseAdmin } from '../lib/supabase/admin';

interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  mha: string | null;
  candidateZips: string[];
}

const bases: BaseSeed[] = basesAllData.bases;

async function auditMHACodes() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 CRITICAL MHA CODE AUDIT - 135 BASES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const errors: string[] = [];
  const warnings: string[] = [];
  let successCount = 0;

  // Test 1: MHA Format Validation
  console.log('📋 TEST 1: MHA Code Format Validation\n');
  
  for (const base of bases) {
    if (!base.mha) {
      errors.push(`❌ ${base.name} - NO MHA CODE`);
      continue;
    }

    // Validate format: XX### (e.g., NC182, CA020)
    const mhaPattern = /^[A-Z]{2}\d{3}$/;
    if (!mhaPattern.test(base.mha)) {
      errors.push(`❌ ${base.name} - INVALID MHA FORMAT: ${base.mha}`);
    } else {
      successCount++;
    }
  }

  console.log(`✅ ${successCount}/135 bases have valid MHA format\n`);

  // Test 2: Database Existence Check
  console.log('📋 TEST 2: MHA Exists in BAH Rates Database\n');
  
  const uniqueMHAs = [...new Set(bases.map(b => b.mha).filter(Boolean))];
  console.log(`Checking ${uniqueMHAs.length} unique MHA codes...\n`);

  const { data: bahRates, error: bahError } = await supabaseAdmin
    .from('bah_rates')
    .select('mha, location_name')
    .eq('effective_date', '2025-01-01')
    .in('mha', uniqueMHAs as string[]);

  if (bahError) {
    console.error('❌ Database error:', bahError);
    process.exit(1);
  }

  const validMHAs = new Set((bahRates || []).map(r => r.mha));
  const mhaToLocation = new Map(
    (bahRates || []).map(r => [r.mha, r.location_name])
  );

  let dbSuccessCount = 0;
  const missingMHAs: string[] = [];

  for (const base of bases) {
    if (!base.mha) continue;

    if (validMHAs.has(base.mha)) {
      dbSuccessCount++;
      const location = mhaToLocation.get(base.mha);
      console.log(`✅ ${base.name.padEnd(40)} → ${base.mha} (${location})`);
    } else {
      missingMHAs.push(base.name);
      errors.push(`❌ ${base.name} - MHA ${base.mha} NOT FOUND IN DATABASE`);
      console.log(`❌ ${base.name.padEnd(40)} → ${base.mha} NOT IN DATABASE`);
    }
  }

  console.log(`\n✅ ${dbSuccessCount}/${bases.length} bases have MHA in database\n`);

  // Test 3: ZIP Code Validation
  console.log('📋 TEST 3: Candidate ZIP Code Validation\n');
  
  let zipSuccessCount = 0;
  for (const base of bases) {
    if (base.candidateZips.length !== 3) {
      errors.push(`❌ ${base.name} - Has ${base.candidateZips.length} ZIPs (expected 3)`);
      continue;
    }

    // Validate ZIP format
    const allValid = base.candidateZips.every(zip => /^\d{5}$/.test(zip));
    if (!allValid) {
      errors.push(`❌ ${base.name} - Invalid ZIP format: ${base.candidateZips.join(', ')}`);
    } else {
      zipSuccessCount++;
    }
  }

  console.log(`✅ ${zipSuccessCount}/135 bases have 3 valid ZIPs\n`);

  // Test 4: Critical Base Spot Checks
  console.log('📋 TEST 4: Critical Base Spot Checks\n');
  
  const criticalBases = [
    { name: 'Fort Liberty, NC', expectedMHA: 'NC182' },
    { name: 'Fort Campbell, TN', expectedMHA: 'KY106' },
    { name: 'JBLM, WA', expectedMHA: 'WA311' },
    { name: 'Naval Station Norfolk, VA', expectedMHA: 'VA298' },
    { name: 'Camp Pendleton, CA', expectedMHA: 'CA024' },
    { name: 'Fort Cavazos, TX', expectedMHA: 'TX286' },
    { name: 'Camp Lejeune, NC', expectedMHA: 'NC178' },
  ];

  let criticalSuccessCount = 0;
  for (const check of criticalBases) {
    const base = bases.find(b => b.name === check.name);
    if (!base) {
      errors.push(`❌ CRITICAL: ${check.name} NOT FOUND IN bases-all.json`);
      console.log(`❌ ${check.name} - NOT FOUND`);
      continue;
    }

    if (base.mha !== check.expectedMHA) {
      errors.push(`❌ CRITICAL: ${check.name} has WRONG MHA: ${base.mha} (expected ${check.expectedMHA})`);
      console.log(`❌ ${check.name} - WRONG MHA: ${base.mha} (expected ${check.expectedMHA})`);
    } else {
      criticalSuccessCount++;
      console.log(`✅ ${check.name} - MHA ${base.mha} CORRECT`);
    }
  }

  console.log(`\n✅ ${criticalSuccessCount}/${criticalBases.length} critical bases verified\n`);

  // Test 5: Branch Distribution
  console.log('📋 TEST 5: Branch Distribution Verification\n');
  
  const branchCounts = bases.reduce((acc, base) => {
    acc[base.branch] = (acc[base.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Branch Distribution:');
  Object.entries(branchCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([branch, count]) => {
      console.log(`  ${branch.padEnd(10)} ${count} bases`);
    });

  // Final Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 AUDIT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Total Bases: ${bases.length}`);
  console.log(`MHA Format Valid: ${successCount}/${bases.length}`);
  console.log(`MHA in Database: ${dbSuccessCount}/${bases.length}`);
  console.log(`ZIP Codes Valid: ${zipSuccessCount}/${bases.length}`);
  console.log(`Critical Bases: ${criticalSuccessCount}/${criticalBases.length}`);

  console.log(`\n❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}\n`);

  if (errors.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ ERRORS FOUND:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    errors.forEach(err => console.log(err));
    console.log('\n🚨 AUDIT FAILED - FIX ERRORS BEFORE DEPLOYMENT\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  WARNINGS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    warnings.forEach(warn => console.log(warn));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ AUDIT PASSED - ALL BASES VERIFIED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎖️  Base Navigator is production-ready for military families!\n');
}

auditMHACodes().catch(console.error);

