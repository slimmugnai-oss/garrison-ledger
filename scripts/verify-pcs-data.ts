/**
 * PCS COPILOT DATA VERIFICATION SCRIPT
 * 
 * Comprehensive database verification for all PCS entitlement data sources
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

interface VerificationResult {
  table: string;
  status: "✅ PASS" | "⚠️ WARN" | "❌ FAIL";
  rowCount: number;
  coverage: string;
  issues: string[];
  recommendations: string[];
}

const results: VerificationResult[] = [];

async function verifyEntitlementsData() {
  console.log("\n🔍 Verifying entitlements_data (DLA rates)...");
  
  try {
    // Check total rows
    const { count, error: countError } = await supabaseAdmin
      .from("entitlements_data")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Check rank coverage
    const { data: ranks, error: ranksError } = await supabaseAdmin
      .from("entitlements_data")
      .select("pay_grade")
      .eq("entitlement_type", "DLA")
      .not("pay_grade", "is", null);

    if (ranksError) throw ranksError;

    const uniqueRanks = new Set(ranks?.map(r => r.pay_grade) || []);
    
    // Check for required ranks
    const requiredRanks = [
      "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9",
      "W1", "W2", "W3", "W4", "W5",
      "O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8", "O9", "O10"
    ];
    
    const missingRanks = requiredRanks.filter(r => !uniqueRanks.has(r));

    results.push({
      table: "entitlements_data",
      status: missingRanks.length === 0 ? "✅ PASS" : "⚠️ WARN",
      rowCount: count || 0,
      coverage: `${uniqueRanks.size}/${requiredRanks.length} ranks`,
      issues: missingRanks.length > 0 ? [`Missing ranks: ${missingRanks.join(", ")}`] : [],
      recommendations: missingRanks.length > 0 ? ["Add missing DLA rates from DFAS tables"] : [],
    });

    console.log(`✅ Found ${count} entitlement records`);
    console.log(`✅ Covers ${uniqueRanks.size}/${requiredRanks.length} ranks`);
    if (missingRanks.length > 0) {
      console.log(`⚠️  Missing ranks: ${missingRanks.join(", ")}`);
    }

  } catch (error) {
    console.error("❌ Error verifying entitlements_data:", error);
    results.push({
      table: "entitlements_data",
      status: "❌ FAIL",
      rowCount: 0,
      coverage: "ERROR",
      issues: [String(error)],
      recommendations: ["Check database connection and table schema"],
    });
  }
}

async function verifyJTRRatesCache() {
  console.log("\n🔍 Verifying jtr_rates_cache (MALT rates)...");
  
  try {
    // Check total rows
    const { count, error: countError } = await supabaseAdmin
      .from("jtr_rates_cache")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Check for 2025 MALT rate
    const { data: malt2025, error: maltError } = await supabaseAdmin
      .from("jtr_rates_cache")
      .select("rate_cents, effective_year")
      .eq("rate_type", "MALT")
      .eq("effective_year", 2025)
      .maybeSingle();

    if (maltError) throw maltError;

    const has2025Rate = !!malt2025;

    results.push({
      table: "jtr_rates_cache",
      status: has2025Rate ? "✅ PASS" : "⚠️ WARN",
      rowCount: count || 0,
      coverage: has2025Rate ? "2025 MALT rate found" : "No 2025 MALT rate",
      issues: !has2025Rate ? ["Missing 2025 MALT rate"] : [],
      recommendations: !has2025Rate ? ["Add 2025 MALT rate from JTR Table 2-5"] : [],
    });

    console.log(`✅ Found ${count} cached JTR rates`);
    if (has2025Rate) {
      console.log(`✅ 2025 MALT rate: $${(malt2025.rate_cents / 100).toFixed(2)}/mile`);
    } else {
      console.log(`⚠️  No 2025 MALT rate found`);
    }

  } catch (error) {
    console.error("❌ Error verifying jtr_rates_cache:", error);
    results.push({
      table: "jtr_rates_cache",
      status: "❌ FAIL",
      rowCount: 0,
      coverage: "ERROR",
      issues: [String(error)],
      recommendations: ["Check database connection and table schema"],
    });
  }
}

async function verifyStateTaxRates() {
  console.log("\n🔍 Verifying state_tax_rates (PPM withholding)...");
  
  try {
    // Check total rows
    const { count, error: countError } = await supabaseAdmin
      .from("state_tax_rates")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Check state coverage
    const { data: states, error: statesError } = await supabaseAdmin
      .from("state_tax_rates")
      .select("state_code, state_name")
      .eq("effective_year", 2025);

    if (statesError) throw statesError;

    const uniqueStates = new Set(states?.map(s => s.state_code) || []);
    const expectedCount = 51; // 50 states + DC

    results.push({
      table: "state_tax_rates",
      status: uniqueStates.size === expectedCount ? "✅ PASS" : "⚠️ WARN",
      rowCount: count || 0,
      coverage: `${uniqueStates.size}/${expectedCount} states/territories`,
      issues: uniqueStates.size < expectedCount ? [`Only ${uniqueStates.size}/51 states covered`] : [],
      recommendations: uniqueStates.size < expectedCount 
        ? ["Add missing state tax rates for complete coverage"] 
        : [],
    });

    console.log(`✅ Found ${count} state tax rate records`);
    console.log(`✅ Covers ${uniqueStates.size}/${expectedCount} states/territories`);

  } catch (error) {
    console.error("❌ Error verifying state_tax_rates:", error);
    results.push({
      table: "state_tax_rates",
      status: "❌ FAIL",
      rowCount: 0,
      coverage: "ERROR",
      issues: [String(error)],
      recommendations: ["Check database connection and table schema"],
    });
  }
}

async function verifyMilitaryBases() {
  console.log("\n🔍 Verifying military bases data...");
  
  try {
    const militaryBases = require("../lib/data/military-bases.json");
    const bases = militaryBases.bases || [];

    // Check for ZIP codes
    const basesWithZip = bases.filter((b: any) => b.zip && b.zip !== "00000");
    const zipCoverage = (basesWithZip.length / bases.length) * 100;

    results.push({
      table: "military-bases.json",
      status: zipCoverage > 90 ? "✅ PASS" : zipCoverage > 75 ? "⚠️ WARN" : "❌ FAIL",
      rowCount: bases.length,
      coverage: `${basesWithZip.length}/${bases.length} have ZIP codes (${zipCoverage.toFixed(1)}%)`,
      issues: zipCoverage < 90 ? [`${bases.length - basesWithZip.length} bases missing ZIP codes`] : [],
      recommendations: zipCoverage < 90 
        ? ["Add ZIP codes for accurate per diem lookups"] 
        : [],
    });

    console.log(`✅ Found ${bases.length} military bases`);
    console.log(`✅ ${basesWithZip.length} have ZIP codes (${zipCoverage.toFixed(1)}%)`);

  } catch (error) {
    console.error("❌ Error verifying military-bases.json:", error);
    results.push({
      table: "military-bases.json",
      status: "❌ FAIL",
      rowCount: 0,
      coverage: "ERROR",
      issues: [String(error)],
      recommendations: ["Check if military-bases.json exists and is valid JSON"],
    });
  }
}

async function verifyPCSClaims() {
  console.log("\n🔍 Verifying pcs_claims table...");
  
  try {
    const { count, error: countError } = await supabaseAdmin
      .from("pcs_claims")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Check for recent claims (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClaims, error: recentError } = await supabaseAdmin
      .from("pcs_claims")
      .select("id, created_at, status")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    results.push({
      table: "pcs_claims",
      status: "✅ PASS",
      rowCount: count || 0,
      coverage: `${recentClaims?.length || 0} claims in last 30 days`,
      issues: [],
      recommendations: count === 0 ? ["Table is empty - normal for new deployment"] : [],
    });

    console.log(`✅ Found ${count} total PCS claims`);
    console.log(`✅ ${recentClaims?.length || 0} claims in last 30 days`);

  } catch (error) {
    console.error("❌ Error verifying pcs_claims:", error);
    results.push({
      table: "pcs_claims",
      status: "❌ FAIL",
      rowCount: 0,
      coverage: "ERROR",
      issues: [String(error)],
      recommendations: ["Check database connection and RLS policies"],
    });
  }
}

async function verifyEntitlementSnapshots() {
  console.log("\n🔍 Verifying pcs_entitlement_snapshots table...");
  
  try {
    const { count, error: countError } = await supabaseAdmin
      .from("pcs_entitlement_snapshots")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Check for snapshots with complete data
    const { data: completeSnapshots, error: completeError } = await supabaseAdmin
      .from("pcs_entitlement_snapshots")
      .select("id, dla_amount, tle_amount, ppm_estimate")
      .not("dla_amount", "is", null)
      .not("tle_amount", "is", null)
      .not("ppm_estimate", "is", null)
      .limit(5);

    if (completeError) throw completeError;

    results.push({
      table: "pcs_entitlement_snapshots",
      status: "✅ PASS",
      rowCount: count || 0,
      coverage: `${completeSnapshots?.length || 0}/5 recent snapshots complete`,
      issues: [],
      recommendations: count === 0 ? ["Table is empty - normal for new deployment"] : [],
    });

    console.log(`✅ Found ${count} entitlement snapshots`);
    console.log(`✅ ${completeSnapshots?.length || 0} recent snapshots have complete data`);

  } catch (error) {
    console.error("❌ Error verifying pcs_entitlement_snapshots:", error);
    results.push({
      table: "pcs_entitlement_snapshots",
      status: "❌ FAIL",
      rowCount: 0,
      coverage: "ERROR",
      issues: [String(error)],
      recommendations: ["Check database connection and table schema"],
    });
  }
}

function printSummary() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 PCS COPILOT DATA VERIFICATION SUMMARY");
  console.log("=".repeat(80) + "\n");

  results.forEach(result => {
    console.log(`${result.status} ${result.table}`);
    console.log(`   Rows: ${result.rowCount.toLocaleString()}`);
    console.log(`   Coverage: ${result.coverage}`);
    
    if (result.issues.length > 0) {
      console.log(`   Issues:`);
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    if (result.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      result.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    console.log("");
  });

  const passCount = results.filter(r => r.status === "✅ PASS").length;
  const warnCount = results.filter(r => r.status === "⚠️ WARN").length;
  const failCount = results.filter(r => r.status === "❌ FAIL").length;

  console.log("=".repeat(80));
  console.log(`FINAL SCORE: ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL (Total: ${results.length})`);
  console.log("=".repeat(80));

  if (failCount === 0 && warnCount === 0) {
    console.log("\n✅ ALL CHECKS PASSED! PCS Copilot data is production-ready.\n");
  } else if (failCount === 0) {
    console.log("\n⚠️  SOME WARNINGS FOUND. Review recommendations above.\n");
  } else {
    console.log("\n❌ CRITICAL ISSUES FOUND. Fix failed checks before deploying.\n");
  }
}

async function main() {
  console.log("\n🚀 Starting PCS Copilot Data Verification...\n");
  
  await verifyEntitlementsData();
  await verifyJTRRatesCache();
  await verifyStateTaxRates();
  await verifyMilitaryBases();
  await verifyPCSClaims();
  await verifyEntitlementSnapshots();
  
  printSummary();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });

