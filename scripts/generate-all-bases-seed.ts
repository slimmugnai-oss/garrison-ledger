/**
 * GENERATE ALL BASES SEED
 * 
 * Generates lib/data/bases-all.json from military-bases.json
 * Includes all major US military installations (~75 bases)
 * 
 * Usage: npx tsx scripts/generate-all-bases-seed.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";

import { getAllBasesWithCodes } from "../lib/data/base-code-map";

interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  center: { lat: number; lng: number };
  gate: { lat: number; lng: number };
  candidateZips: string[];
  mha: string;
}

/**
 * Filter to actual military installations (not just cities)
 */
function isActualMilitaryBase(locationName: string): boolean {
  const militaryKeywords = [
    "AFB",
    "Air Force Base",
    "Fort ",
    "Naval",
    "Marine Corps",
    "Coast Guard",
    "Joint Base",
    "Camp ",
    "NAS ",
    "MCAS ",
    "Army",
    "Barracks",
    "Station",
    "Arsenal",
  ];

  return militaryKeywords.some((keyword) => locationName.includes(keyword));
}

/**
 * Detect branch from location name
 */
function detectBranch(locationName: string): string {
  if (locationName.includes("AFB") || locationName.includes("Air Force")) return "Air Force";
  if (locationName.includes("Naval") || locationName.includes("NAS ")) return "Navy";
  if (locationName.includes("Marine Corps") || locationName.includes("MCAS") || locationName.includes("MCRD")) return "USMC";
  if (locationName.includes("Coast Guard")) return "Coast Guard";
  if (locationName.includes("Fort ") || locationName.includes("Army")) return "Army";
  if (locationName.includes("Joint Base")) return "Joint";
  return "Joint";
}

/**
 * Get candidate ZIPs - placeholder for now
 * In production, these would be manually curated or geocoded
 */
function getCandidateZips(_mha: string): string[] {
  // Placeholder - will be manually curated for top bases
  return [];
}

async function main() {
  console.log("🔄 Generating bases-all.json from military-bases.json + BAH rates...\n");

  // Get all bases from military-bases.json with codes and MHA mappings
  const basesWithCodes = getAllBasesWithCodes();

  // Filter to actual military installations
  const militaryBases = basesWithCodes.filter((base) => isActualMilitaryBase(base.name));

  console.log(`Found ${militaryBases.length} military installations\n`);

  // Transform to BaseSeed format
  const baseSeeds: BaseSeed[] = [];

  for (const base of militaryBases) {
    if (!base.mha) {
      console.log(`⚠️  Skipping ${base.name} - no MHA code found`);
      continue;
    }

    const candidateZips = getCandidateZips(base.mha);

    baseSeeds.push({
      code: base.code,
      name: base.name,
      branch: base.branch,
      state: base.state,
      center: { lat: base.lat, lng: base.lng },
      gate: { lat: base.lat, lng: base.lng }, // Use same coords for now
      candidateZips,
      mha: base.mha,
    });

    console.log(`✅ ${base.name} (${base.mha}) → ${base.code}`);
  }

  // Write to file
  const output = {
    _meta: {
      generated: new Date().toISOString(),
      source: "military-bases.json + bah_rates table",
      total: baseSeeds.length,
      note: "Auto-generated list of US military installations. DO NOT manually edit.",
    },
    bases: baseSeeds,
  };

  const outputPath = join(process.cwd(), "lib", "data", "bases-all.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Generated ${baseSeeds.length} bases → lib/data/bases-all.json`);
  console.log("\nSample bases:");
  baseSeeds.slice(0, 10).forEach((b) => {
    console.log(`  - ${b.name} (${b.code}, ${b.mha})`);
  });
}

main().catch((err) => {
  console.error("Error generating bases:", err);
  process.exit(1);
});

