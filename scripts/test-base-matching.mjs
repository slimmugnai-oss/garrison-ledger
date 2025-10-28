/**
 * TEST BASE NAME MATCHING
 * 
 * Verifies that our findBase() logic can handle ALL OCR variations
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const militaryBasesData = JSON.parse(
  readFileSync(join(__dirname, '../lib/data/military-bases.json'), 'utf-8')
);
const militaryBases = militaryBasesData.bases;

/**
 * Replicate the findBase logic from lib/pcs/distance.ts
 */
function findBase(identifier) {
  const normalizedId = identifier.toLowerCase().trim();

  const cleanedId = normalizedId
    .replace(
      /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)/i,
      ""
    )
    .trim();

  return militaryBases.find((base) => {
    const baseName = base.name.toLowerCase();
    const baseCity = base.city.toLowerCase();
    const baseId = base.id.toLowerCase();
    
    if (baseId === normalizedId || baseId === cleanedId) return true;

    const baseNameCore = baseName.split("(")[0].trim();
    const cleanedIdCore = cleanedId.split("(")[0].trim();

    if (baseNameCore.includes(cleanedIdCore) || cleanedIdCore.includes(baseNameCore)) return true;

    const legacyMatch = baseName.match(/\((.*?)\)/);
    if (legacyMatch) {
      const legacyName = legacyMatch[1].toLowerCase();
      if (cleanedId.includes(legacyName) || cleanedId.includes(`fort ${legacyName}`)) return true;
    }

    if (baseCity === cleanedId || baseCity === normalizedId) return true;

    if (normalizedId.includes(baseCity) && normalizedId.includes(base.state.toLowerCase())) return true;

    const abbreviations = {
      "jblm": ["joint base lewis-mcchord", "joint base lewis mcchord"],
      "jble": ["joint base langley-eustis"],
      "jbsa": ["joint base san antonio"],
      "jbphh": ["joint base pearl harbor-hickam"],
    };
    
    for (const [abbr, fullNames] of Object.entries(abbreviations)) {
      if (cleanedId === abbr && fullNames.some(fn => baseName.includes(fn))) return true;
    }

    return false;
  });
}

// Test cases covering different patterns
const testCases = [
  // Renamed Army bases (with parentheses)
  { input: "Fort Liberty, NC", expected: "Fort Liberty (Bragg)", category: "Renamed base with state" },
  { input: "Fort Bragg", expected: "Fort Liberty (Bragg)", category: "Legacy name" },
  { input: "Fort Cavazos, TX", expected: "Fort Cavazos (Hood)", category: "Renamed base" },
  { input: "Fort Hood", expected: "Fort Cavazos (Hood)", category: "Legacy Fort Hood" },
  
  // Joint bases
  { input: "Joint Base Lewis-McChord, WA", expected: "Joint Base Lewis-McChord", category: "Joint base with state" },
  { input: "JBLM", expected: "Joint Base Lewis-McChord", category: "JBLM abbreviation" },
  { input: "Joint Base Langley-Eustis, VA", expected: "Joint Base Langley-Eustis", category: "Joint base" },
  { input: "JBLE", expected: "Joint Base Langley-Eustis", category: "JBLE abbreviation" },
  
  // Air Force bases
  { input: "Eglin Air Force Base, FL", expected: "Eglin Air Force Base", category: "AFB full name" },
  { input: "Eglin AFB, FL", expected: "Eglin Air Force Base", category: "AFB abbreviation" },
  { input: "Nellis Air Force Base, NV", expected: "Nellis Air Force Base", category: "AFB" },
  
  // Naval facilities
  { input: "Naval Station Norfolk, VA", expected: "Naval Station Norfolk", category: "Naval station" },
  { input: "Norfolk, VA", expected: "Naval Station Norfolk", category: "City + state" },
  { input: "Naval Air Station Pensacola, FL", expected: "Naval Air Station Pensacola", category: "NAS" },
  
  // Marine Corps
  { input: "Camp Pendleton, CA", expected: "Camp Pendleton", category: "Camp" },
  { input: "Camp Lejeune, NC", expected: "Camp Lejeune", category: "Camp" },
  { input: "Marine Corps Base Quantico, VA", expected: "Marine Corps Base Quantico", category: "MCB" },
  
  // Regular Army forts
  { input: "Fort Campbell, KY", expected: "Fort Campbell", category: "Fort" },
  { input: "Fort Bliss, TX", expected: "Fort Bliss", category: "Fort" },
];

console.log("🧪 TESTING BASE NAME MATCHING LOGIC\n");
console.log(`Testing ${testCases.length} patterns across ${militaryBases.length} bases...\n`);

let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const result = findBase(test.input);
  const success = result?.name === test.expected;
  
  if (success) {
    console.log(`✅ ${test.category.padEnd(30)} | "${test.input}" → "${result.name}"`);
    passed++;
  } else {
    console.log(`❌ ${test.category.padEnd(30)} | "${test.input}" → ${result ? `"${result.name}" (WRONG!)` : 'NOT FOUND'}`);
    console.log(`   Expected: "${test.expected}"`);
    failed++;
  }
});

console.log(`\n📊 RESULTS: ${passed}/${testCases.length} passed, ${failed} failed`);

if (failed === 0) {
  console.log("\n🎉 ALL TESTS PASSED! Base matching is robust across all patterns.");
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Review matching logic.`);
  process.exit(1);
}

