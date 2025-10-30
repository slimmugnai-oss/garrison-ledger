#!/usr/bin/env tsx

/**
 * Audit Base Coordinates
 * 
 * Identifies military bases with potentially incorrect coordinates by checking
 * if the lat/lng roughly matches the expected state/city location.
 * 
 * Usage: npx tsx scripts/audit-base-coordinates.ts
 */

import militaryBasesData from '../lib/data/military-bases.json';

interface MilitaryBase {
  id: string;
  name: string;
  branch: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  zip: string;
}

interface CoordinateIssue {
  id: string;
  name: string;
  state: string;
  city: string;
  currentLat: number;
  currentLng: number;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  expectedState?: string;
  expectedCity?: string;
}

/**
 * Expected state center coordinates for validation
 * If base coordinates are >50 miles from state center, flag for review
 */
const STATE_CENTERS: Record<string, { lat: number; lng: number; name: string }> = {
  'AL': { lat: 32.806671, lng: -86.791130, name: 'Alabama' },
  'AK': { lat: 61.370716, lng: -152.404419, name: 'Alaska' },
  'AZ': { lat: 33.729759, lng: -111.431221, name: 'Arizona' },
  'AR': { lat: 34.969704, lng: -92.373123, name: 'Arkansas' },
  'CA': { lat: 36.116203, lng: -119.681564, name: 'California' },
  'CO': { lat: 39.059811, lng: -105.311104, name: 'Colorado' },
  'CT': { lat: 41.597782, lng: -72.755371, name: 'Connecticut' },
  'DE': { lat: 39.318523, lng: -75.507141, name: 'Delaware' },
  'FL': { lat: 27.766279, lng: -81.686783, name: 'Florida' },
  'GA': { lat: 33.040619, lng: -83.643074, name: 'Georgia' },
  'HI': { lat: 21.094318, lng: -157.498337, name: 'Hawaii' },
  'ID': { lat: 44.240459, lng: -114.478828, name: 'Idaho' },
  'IL': { lat: 40.349457, lng: -88.986137, name: 'Illinois' },
  'IN': { lat: 39.849426, lng: -86.258278, name: 'Indiana' },
  'IA': { lat: 42.011539, lng: -93.210526, name: 'Iowa' },
  'KS': { lat: 38.526600, lng: -96.726486, name: 'Kansas' },
  'KY': { lat: 37.668140, lng: -84.670067, name: 'Kentucky' },
  'LA': { lat: 31.169546, lng: -91.867805, name: 'Louisiana' },
  'ME': { lat: 44.323535, lng: -69.765261, name: 'Maine' },
  'MD': { lat: 39.063946, lng: -76.802101, name: 'Maryland' },
  'MA': { lat: 42.230171, lng: -71.530106, name: 'Massachusetts' },
  'MI': { lat: 43.326618, lng: -84.536095, name: 'Michigan' },
  'MN': { lat: 45.694454, lng: -93.900192, name: 'Minnesota' },
  'MS': { lat: 32.741646, lng: -89.678696, name: 'Mississippi' },
  'MO': { lat: 38.456085, lng: -92.288368, name: 'Missouri' },
  'MT': { lat: 47.052952, lng: -110.454353, name: 'Montana' },
  'NE': { lat: 41.125370, lng: -98.268082, name: 'Nebraska' },
  'NV': { lat: 38.313515, lng: -117.055374, name: 'Nevada' },
  'NH': { lat: 43.452492, lng: -71.563896, name: 'New Hampshire' },
  'NJ': { lat: 40.298904, lng: -74.521011, name: 'New Jersey' },
  'NM': { lat: 34.840515, lng: -106.248482, name: 'New Mexico' },
  'NY': { lat: 42.165726, lng: -74.948051, name: 'New York' },
  'NC': { lat: 35.630066, lng: -79.806419, name: 'North Carolina' },
  'ND': { lat: 47.528912, lng: -99.784012, name: 'North Dakota' },
  'OH': { lat: 40.388783, lng: -82.764915, name: 'Ohio' },
  'OK': { lat: 35.565342, lng: -96.928917, name: 'Oklahoma' },
  'OR': { lat: 44.572021, lng: -122.070938, name: 'Oregon' },
  'PA': { lat: 40.590752, lng: -77.209755, name: 'Pennsylvania' },
  'RI': { lat: 41.680893, lng: -71.51178, name: 'Rhode Island' },
  'SC': { lat: 33.856892, lng: -80.945007, name: 'South Carolina' },
  'SD': { lat: 44.299782, lng: -99.438828, name: 'South Dakota' },
  'TN': { lat: 35.747845, lng: -86.692345, name: 'Tennessee' },
  'TX': { lat: 31.054487, lng: -97.563461, name: 'Texas' },
  'UT': { lat: 40.150032, lng: -111.862434, name: 'Utah' },
  'VT': { lat: 44.045876, lng: -72.710686, name: 'Vermont' },
  'VA': { lat: 37.769337, lng: -78.169968, name: 'Virginia' },
  'WA': { lat: 47.400902, lng: -121.490494, name: 'Washington' },
  'WV': { lat: 38.491226, lng: -80.954453, name: 'West Virginia' },
  'WI': { lat: 44.268543, lng: -89.616508, name: 'Wisconsin' },
  'WY': { lat: 41.145548, lng: -104.802042, name: 'Wyoming' },
  'DC': { lat: 38.907192, lng: -77.036873, name: 'District of Columbia' },
  'PR': { lat: 18.220833, lng: -66.590149, name: 'Puerto Rico' },
  'VI': { lat: 18.335765, lng: -64.896335, name: 'U.S. Virgin Islands' },
  'GU': { lat: 13.444304, lng: 144.793731, name: 'Guam' },
  'AS': { lat: -14.270972, lng: -170.132217, name: 'American Samoa' },
  'MP': { lat: 15.0979, lng: 145.6739, name: 'Northern Mariana Islands' }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function auditBaseCoordinates(): CoordinateIssue[] {
  console.log('🔍 Auditing military base coordinates...\n');
  
  const bases: MilitaryBase[] = militaryBasesData.bases as MilitaryBase[];
  const issues: CoordinateIssue[] = [];
  
  console.log(`📊 Found ${bases.length} military bases to audit\n`);
  
  for (const base of bases) {
    const stateCenter = STATE_CENTERS[base.state];
    
    if (!stateCenter) {
      console.log(`⚠️  Unknown state code: ${base.state} for base ${base.name}`);
      continue;
    }
    
    // Calculate distance from base to state center
    const distance = calculateDistance(
      base.lat, base.lng,
      stateCenter.lat, stateCenter.lng
    );
    
    // Flag bases that are >50 miles from state center
    if (distance > 50) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      let issue = `Base is ${distance.toFixed(1)} miles from ${stateCenter.name} center`;
      
      if (distance > 200) {
        severity = 'high';
        issue = `Base is ${distance.toFixed(1)} miles from ${stateCenter.name} center - likely wrong state`;
      } else if (distance > 100) {
        severity = 'medium';
        issue = `Base is ${distance.toFixed(1)} miles from ${stateCenter.name} center - may be wrong state`;
      }
      
      issues.push({
        id: base.id,
        name: base.name,
        state: base.state,
        city: base.city,
        currentLat: base.lat,
        currentLng: base.lng,
        issue,
        severity,
        expectedState: stateCenter.name
      });
    }
    
    // Check for obviously wrong coordinates (0,0 or extreme values)
    if (base.lat === 0 && base.lng === 0) {
      issues.push({
        id: base.id,
        name: base.name,
        state: base.state,
        city: base.city,
        currentLat: base.lat,
        currentLng: base.lng,
        issue: 'Coordinates are 0,0 - likely missing data',
        severity: 'high'
      });
    }
    
    if (Math.abs(base.lat) > 90 || Math.abs(base.lng) > 180) {
      issues.push({
        id: base.id,
        name: base.name,
        state: base.state,
        city: base.city,
        currentLat: base.lat,
        currentLng: base.lng,
        issue: 'Invalid coordinates (lat > 90 or lng > 180)',
        severity: 'high'
      });
    }
  }
  
  // Display results
  if (issues.length === 0) {
    console.log('✅ All base coordinates appear to be correct!\n');
  } else {
    console.log(`❌ Found ${issues.length} bases with coordinate issues:\n`);
    
    // Group by severity
    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    const lowIssues = issues.filter(i => i.severity === 'low');
    
    if (highIssues.length > 0) {
      console.log('🚨 HIGH PRIORITY (likely wrong state):');
      console.table(highIssues.map(i => ({
        Base: i.name,
        State: i.state,
        City: i.city,
        'Current Lat': i.currentLat,
        'Current Lng': i.currentLng,
        Issue: i.issue
      })));
      console.log('');
    }
    
    if (mediumIssues.length > 0) {
      console.log('⚠️  MEDIUM PRIORITY (may be wrong state):');
      console.table(mediumIssues.map(i => ({
        Base: i.name,
        State: i.state,
        City: i.city,
        'Current Lat': i.currentLat,
        'Current Lng': i.currentLng,
        Issue: i.issue
      })));
      console.log('');
    }
    
    if (lowIssues.length > 0) {
      console.log('ℹ️  LOW PRIORITY (far from state center):');
      console.table(lowIssues.map(i => ({
        Base: i.name,
        State: i.state,
        City: i.city,
        'Current Lat': i.currentLat,
        'Current Lng': i.currentLng,
        Issue: i.issue
      })));
      console.log('');
    }
  }
  
  // Summary
  console.log('📈 Summary:');
  console.log(`• Total bases audited: ${bases.length}`);
  console.log(`• Bases with issues: ${issues.length}`);
  console.log(`• High priority: ${issues.filter(i => i.severity === 'high').length}`);
  console.log(`• Medium priority: ${issues.filter(i => i.severity === 'medium').length}`);
  console.log(`• Low priority: ${issues.filter(i => i.severity === 'low').length}`);
  
  return issues;
}

// Run the audit
if (require.main === module) {
  const issues = auditBaseCoordinates();
  
  if (issues.some(i => i.severity === 'high')) {
    console.log('\n❌ High priority issues found - manual review required');
    process.exit(1);
  }
}

export { auditBaseCoordinates };
