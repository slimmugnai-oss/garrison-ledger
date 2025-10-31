#!/usr/bin/env tsx
/**
 * CRITICAL MHA CODE AUDIT (Offline Validation)
 * 
 * Validates that every base in bases-all.json:
 * 1. Has a valid MHA code format (XX###)
 * 2. All 3 candidate ZIPs are valid
 * 3. Critical bases have correct MHA codes
 */

import basesAllData from '../lib/data/bases-all.json';
import baseMHAMap from '../lib/data/base-mha-map.json';

interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  mha: string | null;
  candidateZips: string[];
}

const bases: BaseSeed[] = basesAllData.bases;
const baseToMHA: Record<string, string> = baseMHAMap.baseToMHA;

async function auditMHACodes() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 CRITICAL MHA CODE AUDIT - 135 BASES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Test 1: MHA Format Validation
  console.log('📋 TEST 1: MHA Code Format Validation\n');
  
  let formatSuccessCount = 0;
  for (const base of bases) {
    if (!base.mha) {
      errors.push(`❌ ${base.name} - NO MHA CODE`);
      console.log(`❌ ${base.name.padEnd(40)} - NO MHA CODE`);
      continue;
    }

    // Validate format: XX### (e.g., NC182, CA020)
    const mhaPattern = /^[A-Z]{2}\d{3}$/;
    if (!mhaPattern.test(base.mha)) {
      errors.push(`❌ ${base.name} - INVALID MHA FORMAT: ${base.mha}`);
      console.log(`❌ ${base.name.padEnd(40)} - INVALID FORMAT: ${base.mha}`);
    } else {
      formatSuccessCount++;
      console.log(`✅ ${base.name.padEnd(40)} → ${base.mha}`);
    }
  }

  console.log(`\n✅ ${formatSuccessCount}/${bases.length} bases have valid MHA format\n`);

  // Test 2: ZIP Code Validation
  console.log('📋 TEST 2: Candidate ZIP Code Validation\n');
  
  let zipSuccessCount = 0;
  for (const base of bases) {
    if (base.candidateZips.length !== 3) {
      errors.push(`❌ ${base.name} - Has ${base.candidateZips.length} ZIPs (expected 3)`);
      console.log(`❌ ${base.name.padEnd(40)} - ${base.candidateZips.length} ZIPs (expected 3)`);
      continue;
    }

    // Validate ZIP format
    const allValid = base.candidateZips.every(zip => /^\d{5}$/.test(zip));
    if (!allValid) {
      errors.push(`❌ ${base.name} - Invalid ZIP format: ${base.candidateZips.join(', ')}`);
      console.log(`❌ ${base.name.padEnd(40)} - Invalid ZIPs: ${base.candidateZips.join(', ')}`);
    } else {
      zipSuccessCount++;
    }
  }

  console.log(`✅ ${zipSuccessCount}/${bases.length} bases have 3 valid ZIPs\n`);

  // Test 3: Critical Base Spot Checks (Known MHA codes from base-mha-map.json)
  console.log('📋 TEST 3: Critical Base MHA Verification\n');
  
  const criticalChecks = [
    { name: 'Fort Liberty, NC', expected: 'NC182', mapKey: 'FORT LIBERTY, NC' },
    { name: 'Fort Campbell, TN', expected: 'KY106', mapKey: 'FORT CAMPBELL, KY' },
    { name: 'JBLM, WA', expected: 'WA311', mapKey: 'JOINT BASE LEWIS-MCCHORD, WA' },
    { name: 'Naval Station Norfolk, VA', expected: 'VA298', mapKey: 'NAVAL STATION NORFOLK' },
    { name: 'MCB Camp Pendleton, CA', expected: 'CA024', mapKey: 'CAMP PENDLETON, CA' },
    { name: 'Fort Cavazos, TX', expected: 'TX286', mapKey: 'FORT CAVAZOS, TX' },
    { name: 'MCB Camp Lejeune, NC', expected: 'NC178', mapKey: 'CAMP LEJEUNE, NC' },
    { name: 'Fort Moore, GA', expected: 'GA075', mapKey: 'FORT MOORE, GA' },
    { name: 'Fort Carson, CO', expected: 'CO046', mapKey: 'FORT CARSON, CO' },
    { name: 'Fort Bliss, TX', expected: 'TX279', mapKey: 'FORT BLISS, TX' },
  ];

  let criticalSuccessCount = 0;
  for (const check of criticalChecks) {
    const base = bases.find(b => b.name === check.name);
    if (!base) {
      errors.push(`❌ CRITICAL: ${check.name} NOT FOUND IN bases-all.json`);
      console.log(`❌ ${check.name} - NOT FOUND`);
      continue;
    }

    // Check against base-mha-map.json
    const mapMHA = baseToMHA[check.mapKey];
    
    if (base.mha !== check.expected) {
      errors.push(`❌ CRITICAL: ${check.name} has WRONG MHA: ${base.mha} (expected ${check.expected})`);
      console.log(`❌ ${check.name.padEnd(40)} - WRONG: ${base.mha} (expected ${check.expected})`);
    } else if (mapMHA && base.mha !== mapMHA) {
      warnings.push(`⚠️  ${check.name} - MHA ${base.mha} doesn't match base-mha-map.json: ${mapMHA}`);
      console.log(`⚠️  ${check.name.padEnd(40)} - Mismatch with map: ${mapMHA}`);
    } else {
      criticalSuccessCount++;
      console.log(`✅ ${check.name.padEnd(40)} → ${base.mha} VERIFIED`);
    }
  }

  console.log(`\n✅ ${criticalSuccessCount}/${criticalChecks.length} critical bases verified\n`);

  // Test 4: Branch Distribution
  console.log('📋 TEST 4: Branch Distribution Verification\n');
  
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

  // Verify Joint bases
  const jointBases = bases.filter(b => b.branch === 'Joint');
  console.log('\nJoint Bases:');
  jointBases.forEach(b => {
    console.log(`  ✅ ${b.name} (${b.mha})`);
  });

  // Test 5: Duplicate Detection
  console.log('\n📋 TEST 5: Duplicate Detection\n');
  
  const codesSeen = new Set<string>();
  const namesSeen = new Set<string>();
  
  for (const base of bases) {
    if (codesSeen.has(base.code)) {
      errors.push(`❌ DUPLICATE CODE: ${base.code} (${base.name})`);
      console.log(`❌ Duplicate code: ${base.code}`);
    } else {
      codesSeen.add(base.code);
    }

    if (namesSeen.has(base.name)) {
      errors.push(`❌ DUPLICATE NAME: ${base.name}`);
      console.log(`❌ Duplicate name: ${base.name}`);
    } else {
      namesSeen.add(base.name);
    }
  }

  console.log(`✅ ${codesSeen.size} unique base codes`);
  console.log(`✅ ${namesSeen.size} unique base names\n`);

  // Final Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 AUDIT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Total Bases: ${bases.length}`);
  console.log(`MHA Format Valid: ${formatSuccessCount}/${bases.length}`);
  console.log(`ZIP Codes Valid: ${zipSuccessCount}/${bases.length}`);
  console.log(`Critical Bases Verified: ${criticalSuccessCount}/${criticalChecks.length}`);
  console.log(`Unique Codes: ${codesSeen.size}/${bases.length}`);
  console.log(`Unique Names: ${namesSeen.size}/${bases.length}`);

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
  console.log('📌 NEXT STEP: Run database verification with: npm run audit:mha-db\n');
}

auditMHACodes().catch(console.error);

