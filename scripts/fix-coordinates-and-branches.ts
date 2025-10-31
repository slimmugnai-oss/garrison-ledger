#!/usr/bin/env tsx
/**
 * Fix 0,0 coordinates and branch classifications
 */

import fs from 'fs';
import path from 'path';
import militaryBasesData from '../lib/data/military-bases.json';

const basesAllPath = path.join(process.cwd(), 'lib/data/bases-all.json');
const basesAll = JSON.parse(fs.readFileSync(basesAllPath, 'utf-8'));

// Coordinate fixes from military-bases.json
const coordinateFixes: Record<string, { lat: number; lng: number }> = {
  'Detroit Arsenal, MI': { lat: 42.491, lng: -83.137 },
  'Camp Guernsey, WY': { lat: 42.283, lng: -104.750 },
  'Fort McNair, DC': { lat: 38.868, lng: -77.016 },
  'Camp Grayling, MI': { lat: 44.664, lng: -84.712 },
  'Camp Rilea, OR': { lat: 46.050, lng: -123.938 },
  'Camp James A. Garfield, OH': { lat: 41.332, lng: -81.051 },
  'Joint Base Cape Cod, MA': { lat: 41.660, lng: -70.524 },
  'Camp Dodge, IA': { lat: 41.688, lng: -93.691 },
  'Portsmouth Naval Shipyard, ME': { lat: 43.086, lng: -70.734 },
  'Naval Station Newport, RI': { lat: 41.527, lng: -71.327 },
  'Naval Submarine Base New London, CT': { lat: 41.382, lng: -72.089 },
  'Marine Barracks Washington, DC': { lat: 38.879, lng: -76.997 },
  'Joint Base McGuire-Dix-Lakehurst, NJ': { lat: 40.032, lng: -74.592 },
};

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 FIXING CRITICAL ISSUES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let coordsFixed = 0;
let branchesFixed = 0;

// Fix coordinates
console.log('Fixing 0,0 coordinates:\n');
for (const base of basesAll.bases) {
  if (base.center.lat === 0 && base.center.lng === 0) {
    const fix = coordinateFixes[base.name];
    if (fix) {
      base.center = fix;
      base.gate = fix;
      console.log(`✅ Fixed: ${base.name} → ${fix.lat.toFixed(3)}, ${fix.lng.toFixed(3)}`);
      coordsFixed++;
    } else {
      console.log(`⚠️  No fix for: ${base.name}`);
    }
  }
}

// Fix Malmstrom branch (SFB = Space Force Base, not Air Force!)
console.log('\nFixing Space Force branches:\n');
for (const base of basesAll.bases) {
  if (base.name.includes('MALMSTROM SFB') && base.branch === 'USAF') {
    base.branch = 'Space Force';
    console.log(`✅ Fixed: ${base.name} → Space Force`);
    branchesFixed++;
  }
}

// Write back
fs.writeFileSync(basesAllPath, JSON.stringify(basesAll, null, 2));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Coordinates fixed: ${coordsFixed}`);
console.log(`✅ Branches fixed: ${branchesFixed}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

