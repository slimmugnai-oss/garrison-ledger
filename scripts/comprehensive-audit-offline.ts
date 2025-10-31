#!/usr/bin/env tsx
/**
 * COMPREHENSIVE BASE NAVIGATOR AUDIT (Offline Tests)
 * 
 * Military-grade validation of all 164 bases
 * Tests 1-10: Offline data validation
 */

import basesAllData from '../lib/data/bases-all.json';
import militaryBasesData from '../lib/data/military-bases.json';

interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  mha: string | null;
  center: { lat: number; lng: number };
  gate: { lat: number; lng: number };
  candidateZips: string[];
}

const bases: BaseSeed[] = basesAllData.bases;
const militaryBases = militaryBasesData.bases;

async function comprehensiveAudit() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎖️  COMPREHENSIVE BASE NAVIGATOR AUDIT - OFFLINE TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const errors: string[] = [];
  const warnings: string[] = [];
  let testsPassed = 0;
  let testsFailed = 0;

  // TEST 1: Data Integrity
  console.log('📋 TEST 1: Data Integrity\n');
  
  let integrityPass = true;
  
  for (const base of bases) {
    if (!base.code || !base.name || !base.branch || !base.state) {
      errors.push(`❌ ${base.name || base.code} - Missing required field`);
      integrityPass = false;
    }
    if (!base.center || typeof base.center.lat !== 'number') {
      errors.push(`❌ ${base.name} - Invalid center coordinates`);
      integrityPass = false;
    }
    if (!base.gate || typeof base.gate.lat !== 'number') {
      errors.push(`❌ ${base.name} - Invalid gate coordinates`);
      integrityPass = false;
    }
  }

  console.log(integrityPass ? '✅ PASS - All bases have required fields' : '❌ FAIL - Missing required fields');
  integrityPass ? testsPassed++ : testsFailed++;

  // TEST 2: MHA Format
  console.log('\n📋 TEST 2: MHA Code Format (XX###)\n');
  
  let mhaPass = true;
  const mhaPattern = /^[A-Z]{2}\d{3}$/;
  
  for (const base of bases) {
    if (!base.mha) {
      errors.push(`❌ ${base.name} - NO MHA CODE`);
      mhaPass = false;
    } else if (!mhaPattern.test(base.mha)) {
      errors.push(`❌ ${base.name} - INVALID MHA: ${base.mha}`);
      mhaPass = false;
    }
  }

  console.log(mhaPass ? `✅ PASS - ${bases.length}/${bases.length} valid MHA codes` : '❌ FAIL - Invalid MHA codes');
  mhaPass ? testsPassed++ : testsFailed++;

  // TEST 3: ZIP Validation
  console.log('\n📋 TEST 3: ZIP Code Validation\n');
  
  let zipPass = true;
  let totalZips = 0;
  
  for (const base of bases) {
    if (base.candidateZips.length !== 3) {
      errors.push(`❌ ${base.name} - ${base.candidateZips.length} ZIPs (expected 3)`);
      zipPass = false;
    }
    totalZips += base.candidateZips.length;
    
    const allValid = base.candidateZips.every(zip => /^\d{5}$/.test(zip));
    if (!allValid) {
      errors.push(`❌ ${base.name} - Invalid ZIP: ${base.candidateZips.join(', ')}`);
      zipPass = false;
    }
    
    const uniqueZips = new Set(base.candidateZips);
    if (uniqueZips.size !== 3) {
      errors.push(`❌ ${base.name} - Duplicate ZIPs`);
      zipPass = false;
    }
  }

  console.log(zipPass ? `✅ PASS - ${bases.length}/${bases.length} bases have 3 valid ZIPs (${totalZips} total)` : '❌ FAIL - Invalid ZIP codes');
  zipPass ? testsPassed++ : testsFailed++;

  // TEST 4: Unique Codes
  console.log('\n📋 TEST 4: Code Uniqueness (Routing)\n');
  
  const codesSeen = new Set<string>();
  const codeConflicts: string[] = [];
  
  for (const base of bases) {
    if (codesSeen.has(base.code)) {
      errors.push(`❌ DUPLICATE CODE: ${base.code} (${base.name})`);
      codeConflicts.push(base.code);
    }
    codesSeen.add(base.code);
  }

  const uniquePass = codeConflicts.length === 0;
  console.log(uniquePass ? `✅ PASS - ${codesSeen.size}/${bases.length} unique codes (no routing conflicts)` : `❌ FAIL - ${codeConflicts.length} duplicate codes`);
  uniquePass ? testsPassed++ : testsFailed++;

  // TEST 5: Unique Names
  console.log('\n📋 TEST 5: Name Uniqueness\n');
  
  const namesSeen = new Set<string>();
  const nameConflicts: string[] = [];
  
  for (const base of bases) {
    if (namesSeen.has(base.name)) {
      errors.push(`❌ DUPLICATE NAME: ${base.name}`);
      nameConflicts.push(base.name);
    }
    namesSeen.add(base.name);
  }

  const namesPass = nameConflicts.length === 0;
  console.log(namesPass ? `✅ PASS - ${namesSeen.size}/${bases.length} unique names` : `❌ FAIL - ${nameConflicts.length} duplicate names`);
  namesPass ? testsPassed++ : testsFailed++;

  // TEST 6: Branch Validation
  console.log('\n📋 TEST 6: Branch Distribution\n');
  
  const branchCounts = bases.reduce((acc, base) => {
    acc[base.branch] = (acc[base.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const requiredBranches = ['Army', 'Navy', 'USMC', 'USAF', 'Joint', 'Space Force'];
  let branchPass = true;
  
  for (const branch of requiredBranches) {
    if (!branchCounts[branch]) {
      errors.push(`❌ Missing branch: ${branch}`);
      branchPass = false;
    } else {
      console.log(`   ${branch.padEnd(15)} ${branchCounts[branch]} bases`);
    }
  }

  // Verify JBLM is Joint
  const jblm = bases.find(b => b.name.includes('JBLM'));
  if (jblm && jblm.branch !== 'Joint') {
    errors.push(`❌ CRITICAL: JBLM is ${jblm.branch} (should be Joint)`);
    branchPass = false;
  } else if (jblm) {
    console.log(`   ✅ JBLM correctly classified as Joint`);
  }

  console.log(branchPass ? '\n✅ PASS - All 6 branches present, JBLM correct' : '\n❌ FAIL - Branch issues');
  branchPass ? testsPassed++ : testsFailed++;

  // TEST 7: Coordinates
  console.log('\n📋 TEST 7: Geographic Coordinates\n');
  
  let coordPass = true;
  
  for (const base of bases) {
    if (base.center.lat < -90 || base.center.lat > 90 || base.center.lng < -180 || base.center.lng > 180) {
      errors.push(`❌ ${base.name} - Invalid coordinates`);
      coordPass = false;
    }
    if (base.center.lat === 0 && base.center.lng === 0) {
      errors.push(`❌ ${base.name} - Coordinates at 0,0 (placeholder)`);
      coordPass = false;
    }
  }

  console.log(coordPass ? '✅ PASS - All coordinates valid' : '❌ FAIL - Invalid coordinates');
  coordPass ? testsPassed++ : testsFailed++;

  // TEST 8: State Codes
  console.log('\n📋 TEST 8: State Code Validation\n');
  
  const validStates = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI',
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ]);

  let statePass = true;
  
  for (const base of bases) {
    if (!validStates.has(base.state)) {
      errors.push(`❌ ${base.name} - Invalid state: ${base.state}`);
      statePass = false;
    }
  }

  console.log(statePass ? '✅ PASS - All state codes valid' : '❌ FAIL - Invalid state codes');
  statePass ? testsPassed++ : testsFailed++;

  // TEST 9: Critical Base Coverage
  console.log('\n📋 TEST 9: Critical Base Coverage\n');
  
  const criticalBases = [
    { search: 'Fort Liberty', must: true },
    { search: 'Fort Campbell', must: true },
    { search: 'JBLM', must: true },
    { search: 'Norfolk', must: true },
    { search: 'Pendleton', must: true },
    { search: 'Lejeune', must: true },
    { search: 'LACKLAND', must: true },
    { search: 'SHAW', must: true },
    { search: 'BUCKLEY', must: true },
    { search: 'PETERSON', must: true },
    { search: 'VANDENBERG', must: true },
    { search: 'MAYPORT', must: true },
  ];

  let coveragePass = true;
  
  for (const { search, must } of criticalBases) {
    const found = bases.find(b => b.name.includes(search));
    if (!found && must) {
      errors.push(`❌ CRITICAL: Missing ${search}`);
      console.log(`❌ Missing: ${search}`);
      coveragePass = false;
    } else if (found) {
      console.log(`✅ ${search.padEnd(20)} → ${found.code.padEnd(15)} (${found.mha})`);
    }
  }

  console.log(coveragePass ? '\n✅ PASS - All critical bases present' : '\n❌ FAIL - Missing critical bases');
  coveragePass ? testsPassed++ : testsFailed++;

  // TEST 10: Branch-Specific Validation
  console.log('\n📋 TEST 10: Branch-Specific Validation\n');
  
  let branchSpecificPass = true;
  
  // All Space Force bases should be Space Force branch
  const spaceForceBases = bases.filter(b => 
    b.name.includes('SFB') || 
    b.name.includes('Space Force') ||
    b.name.includes('Buckley') ||
    b.name.includes('Peterson') ||
    b.name.includes('Vandenberg') ||
    b.name.includes('Patrick') ||
    b.name.includes('Schriever') ||
    b.name.includes('Canaveral')
  );

  for (const base of spaceForceBases) {
    if (base.branch !== 'Space Force') {
      errors.push(`❌ ${base.name} - Should be Space Force, is ${base.branch}`);
      console.log(`❌ ${base.name} - Wrong branch: ${base.branch}`);
      branchSpecificPass = false;
    } else {
      console.log(`✅ ${base.name} - Space Force ✓`);
    }
  }

  console.log(branchSpecificPass ? `\n✅ PASS - ${spaceForceBases.length} Space Force bases correctly classified` : '\n❌ FAIL - Branch classification errors');
  branchSpecificPass ? testsPassed++ : testsFailed++;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FINAL SUMMARY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 OFFLINE AUDIT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Total Bases: ${bases.length}`);
  console.log(`Tests Passed: ${testsPassed}/10`);
  console.log(`Tests Failed: ${testsFailed}/10`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}\n`);

  // Branch breakdown
  const finalBranchCounts = bases.reduce((acc, base) => {
    acc[base.branch] = (acc[base.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Branch Distribution:');
  Object.entries(finalBranchCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([branch, count]) => {
      console.log(`  ${branch.padEnd(15)} ${count} bases`);
    });

  if (errors.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ CRITICAL ERRORS FOUND:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    errors.slice(0, 20).forEach(err => console.log(err));
    if (errors.length > 20) {
      console.log(`\n... and ${errors.length - 20} more errors\n`);
    }
    console.log('\n🚨 AUDIT FAILED - FIX ERRORS BEFORE DEPLOYMENT\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  WARNINGS (Non-Critical):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    warnings.slice(0, 10).forEach(warn => console.log(warn));
    if (warnings.length > 10) {
      console.log(`\n... and ${warnings.length - 10} more warnings\n`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ OFFLINE AUDIT PASSED - ALL TESTS SUCCESSFUL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Summary:');
  console.log(`   Total Bases: ${bases.length}`);
  console.log(`   Total ZIPs: ${totalZips}`);
  console.log(`   Branches: ${Object.keys(branchCounts).length}`);
  console.log(`   Tests: ${testsPassed}/10 passed ✅`);
  console.log(`   Errors: 0 ✅\n`);

  console.log('📌 NEXT: Run database verification\n');
}

comprehensiveAudit().catch(console.error);

