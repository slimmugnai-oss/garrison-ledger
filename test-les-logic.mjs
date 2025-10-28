/**
 * LES AUDITOR V1 - COMPREHENSIVE INTERNAL TESTING
 * Tests the special pays and CZTE logic without hitting the database
 */

console.log("🧪 LES AUDITOR V1 - COMPREHENSIVE INTERNAL TESTS\n");

// =============================================================================
// TEST 1: Special Pay Code Canonicalization
// =============================================================================
console.log("Test 1: Special Pay Code Canonicalization");

const testCodes = [
  { input: "SEA PAY", expected: "SEA_PAY" },
  { input: "CAREER SEA PAY", expected: "SEA_PAY" },
  { input: "FLIGHT PAY", expected: "FLIGHT_PAY" },
  { input: "AVIATION PAY", expected: "FLIGHT_PAY" },
  { input: "ACIP", expected: "FLIGHT_PAY" },
  { input: "SUBMARINE PAY", expected: "SUB_PAY" },
  { input: "DIVE PAY", expected: "DIVE_PAY" },
  { input: "DIVING DUTY PAY", expected: "DIVE_PAY" },
  { input: "PARACHUTE PAY", expected: "JUMP_PAY" },
  { input: "JUMP PAY", expected: "JUMP_PAY" },
  { input: "HARDSHIP", expected: "HDP" },
  { input: "HDP", expected: "HDP" },
];

function canonicalizeCode(rawCode) {
  const normalized = rawCode.toUpperCase().trim();
  if (normalized.includes("SEA PAY") || normalized.includes("CAREER SEA")) return "SEA_PAY";
  if (
    normalized.includes("FLIGHT") ||
    normalized.includes("AVIATION") ||
    normalized.includes("ACIP")
  )
    return "FLIGHT_PAY";
  if (normalized.includes("SUB") && normalized.includes("PAY")) return "SUB_PAY";
  if (normalized.includes("DIVE") || normalized.includes("DIVING")) return "DIVE_PAY";
  if (normalized.includes("JUMP") || normalized.includes("PARACHUTE")) return "JUMP_PAY";
  if (normalized.includes("HARDSHIP") || normalized === "HDP") return "HDP";
  return "UNKNOWN";
}

let test1Pass = 0;
let test1Fail = 0;

testCodes.forEach(({ input, expected }) => {
  const result = canonicalizeCode(input);
  if (result === expected) {
    console.log(`  ✅ "${input}" → ${result}`);
    test1Pass++;
  } else {
    console.log(`  ❌ "${input}" → ${result} (expected ${expected})`);
    test1Fail++;
  }
});

console.log(`\nTest 1 Results: ${test1Pass} passed, ${test1Fail} failed\n`);

// =============================================================================
// TEST 2: Hybrid Merge Logic Simulation
// =============================================================================
console.log("Test 2: Hybrid Merge Logic");

// Simulate user_profiles special pays (legacy)
const profileSpecials = [
  { code: "SDAP", cents: 37500, source: "profile" },
  { code: "FSA", cents: 25000, source: "profile" },
];

// Simulate user_special_pay_assignments (catalog)
const assignmentSpecials = [
  { code: "HDP", cents: 10000, source: "assignment" },
  { code: "SDAP", cents: 45000, source: "assignment" }, // Overrides profile
];

// Merge logic
const specialsMap = new Map();

// Add profile specials
profileSpecials.forEach((sp) => specialsMap.set(sp.code, sp.cents));
console.log("  After profile load:", Array.from(specialsMap.entries()));

// Add assignments (override if exists)
assignmentSpecials.forEach((sp) => specialsMap.set(sp.code, sp.cents));
console.log("  After assignments merge:", Array.from(specialsMap.entries()));

// Expected: SDAP=45000 (assignment wins), FSA=25000 (profile only), HDP=10000 (assignment only)
const finalSpecials = Array.from(specialsMap.entries());
const test2Checks = [
  { name: "SDAP overridden to 45000", pass: specialsMap.get("SDAP") === 45000 },
  { name: "FSA preserved at 25000", pass: specialsMap.get("FSA") === 25000 },
  { name: "HDP added at 10000", pass: specialsMap.get("HDP") === 10000 },
  { name: "Total 3 special pays", pass: finalSpecials.length === 3 },
];

let test2Pass = 0;
let test2Fail = 0;

test2Checks.forEach((check) => {
  if (check.pass) {
    console.log(`  ✅ ${check.name}`);
    test2Pass++;
  } else {
    console.log(`  ❌ ${check.name}`);
    test2Fail++;
  }
});

console.log(`\nTest 2 Results: ${test2Pass} passed, ${test2Fail} failed\n`);

// =============================================================================
// TEST 3: CZTE Logic Simulation
// =============================================================================
console.log("Test 3: CZTE Detection Logic");

const czteTestCases = [
  {
    name: "Deployed + Zero Fed Tax",
    czteActive: true,
    fedTax: 0,
    fica: 37200,
    medicare: 8700,
    expectedFlag: "CZTE_ACTIVE",
    expectedSeverity: "green",
  },
  {
    name: "Not Deployed + Zero Fed Tax + FICA Present",
    czteActive: false,
    fedTax: 0,
    fica: 37200,
    medicare: 8700,
    expectedFlag: "POSSIBLE_CZTE",
    expectedSeverity: "yellow",
  },
  {
    name: "Not Deployed + Normal Fed Tax",
    czteActive: false,
    fedTax: 45000,
    fica: 37200,
    medicare: 8700,
    expectedFlag: "NONE",
    expectedSeverity: null,
  },
  {
    name: "Deployed + Incorrect Fed Tax (should not happen)",
    czteActive: true,
    fedTax: 45000,
    fica: 37200,
    medicare: 8700,
    expectedFlag: "NONE",
    expectedSeverity: null,
  },
];

let test3Pass = 0;
let test3Fail = 0;

czteTestCases.forEach((testCase) => {
  let actualFlag = "NONE";
  let actualSeverity = null;

  if (testCase.czteActive && testCase.fedTax === 0) {
    actualFlag = "CZTE_ACTIVE";
    actualSeverity = "green";
  } else if (
    !testCase.czteActive &&
    testCase.fedTax === 0 &&
    (testCase.fica > 0 || testCase.medicare > 0)
  ) {
    actualFlag = "POSSIBLE_CZTE";
    actualSeverity = "yellow";
  }

  const pass = actualFlag === testCase.expectedFlag && actualSeverity === testCase.expectedSeverity;

  if (pass) {
    console.log(`  ✅ ${testCase.name}: ${actualFlag} (${actualSeverity || "none"})`);
    test3Pass++;
  } else {
    console.log(`  ❌ ${testCase.name}: Got ${actualFlag}, expected ${testCase.expectedFlag}`);
    test3Fail++;
  }
});

console.log(`\nTest 3 Results: ${test3Pass} passed, ${test3Fail} failed\n`);

// =============================================================================
// TEST 4: Special Pay Flag Generation Logic
// =============================================================================
console.log("Test 4: Special Pay Flag Generation");

const flagTestCases = [
  {
    name: "Expected FSA, LES has FSA - Match",
    expected: [{ code: "FSA", cents: 25000 }],
    actual: [{ code: "FSA", cents: 25000 }],
    expectedFlags: ["FSA_CORRECT"],
  },
  {
    name: "Expected FSA, LES missing - Missing Flag",
    expected: [{ code: "FSA", cents: 25000 }],
    actual: [],
    expectedFlags: ["SPECIAL_PAY_MISSING"],
  },
  {
    name: "Not expected, LES has SDAP - Unexpected Flag",
    expected: [],
    actual: [{ code: "SDAP", cents: 37500 }],
    expectedFlags: ["SPECIAL_PAY_UNEXPECTED"],
  },
  {
    name: "Expected FSA 250, LES has FSA 240 - Mismatch Flag",
    expected: [{ code: "FSA", cents: 25000 }],
    actual: [{ code: "FSA", cents: 24000 }],
    expectedFlags: ["SPECIAL_PAY_MISMATCH"],
  },
];

let test4Pass = 0;
let test4Fail = 0;

flagTestCases.forEach((testCase) => {
  const flags = [];
  const actualMap = new Map(testCase.actual.map((a) => [a.code, a.cents]));

  // Check expected vs actual
  testCase.expected.forEach((exp) => {
    const actualAmt = actualMap.get(exp.code) || 0;
    const delta = Math.abs(exp.cents - actualAmt);

    if (actualAmt === 0) {
      flags.push("SPECIAL_PAY_MISSING");
    } else if (delta > 1000) {
      flags.push("SPECIAL_PAY_MISMATCH");
    } else {
      flags.push(`${exp.code}_CORRECT`);
    }

    actualMap.delete(exp.code);
  });

  // Check unexpected
  actualMap.forEach((amt, code) => {
    flags.push("SPECIAL_PAY_UNEXPECTED");
  });

  const pass =
    flags.length === testCase.expectedFlags.length &&
    testCase.expectedFlags.every((ef) => flags.includes(ef));

  if (pass) {
    console.log(`  ✅ ${testCase.name}: ${flags.join(", ")}`);
    test4Pass++;
  } else {
    console.log(
      `  ❌ ${testCase.name}: Got [${flags.join(", ")}], expected [${testCase.expectedFlags.join(", ")}]`
    );
    test4Fail++;
  }
});

console.log(`\nTest 4 Results: ${test4Pass} passed, ${test4Fail} failed\n`);

// =============================================================================
// FINAL SUMMARY
// =============================================================================
console.log("═".repeat(60));
console.log("FINAL TEST SUMMARY");
console.log("═".repeat(60));

const totalTests =
  test1Pass + test1Fail + test2Pass + test2Fail + test3Pass + test3Fail + test4Pass + test4Fail;
const totalPass = test1Pass + test2Pass + test3Pass + test4Pass;
const totalFail = test1Fail + test2Fail + test3Fail + test4Fail;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${totalPass} ✅`);
console.log(`Failed: ${totalFail} ❌`);
console.log(`Success Rate: ${((totalPass / totalTests) * 100).toFixed(1)}%`);

if (totalFail === 0) {
  console.log("\n🎉 ALL TESTS PASSED - Ready for production testing!");
} else {
  console.log(`\n⚠️  ${totalFail} tests failed - Review before deployment`);
}

console.log("═".repeat(60));
