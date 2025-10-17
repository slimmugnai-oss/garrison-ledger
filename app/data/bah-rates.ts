/**
 * BAH Rate Data for Major Military Installations
 * Source: DFAS BAH Calculator
 * Updated: 2025 (approximate rates for planning)
 * 
 * Note: Actual BAH rates vary by rank and dependency status.
 * Always verify current rates at https://www.defensetravel.dod.mil/bah/
 */

export interface BAHData {
  base: string;
  location: string;
  state: string;
  // E-5 with dependents (typical baseline)
  e5_with: number;
  // O-3 with dependents (typical officer baseline)
  o3_with: number;
}

export const bahRates: BAHData[] = [
  // High-cost areas
  { base: 'San Diego, CA', location: 'San Diego', state: 'CA', e5_with: 3390, o3_with: 4020 },
  { base: 'San Francisco, CA', location: 'San Francisco', state: 'CA', e5_with: 4290, o3_with: 5100 },
  { base: 'Los Angeles, CA', location: 'Los Angeles', state: 'CA', e5_with: 3630, o3_with: 4290 },
  { base: 'Washington, DC', location: 'Washington', state: 'DC', e5_with: 3120, o3_with: 3750 },
  { base: 'New York, NY', location: 'New York', state: 'NY', e5_with: 3810, o3_with: 4530 },
  { base: 'Honolulu, HI', location: 'Honolulu', state: 'HI', e5_with: 3540, o3_with: 4260 },
  { base: 'Seattle, WA', location: 'Seattle', state: 'WA', e5_with: 2790, o3_with: 3360 },
  { base: 'Boston, MA', location: 'Boston', state: 'MA', e5_with: 2880, o3_with: 3480 },
  
  // Mid-cost areas
  { base: 'Norfolk, VA', location: 'Norfolk', state: 'VA', e5_with: 2160, o3_with: 2580 },
  { base: 'San Antonio, TX', location: 'San Antonio', state: 'TX', e5_with: 1740, o3_with: 2070 },
  { base: 'Colorado Springs, CO', location: 'Colorado Springs', state: 'CO', e5_with: 2070, o3_with: 2460 },
  { base: 'Tampa, FL', location: 'Tampa', state: 'FL', e5_with: 2010, o3_with: 2400 },
  { base: 'Jacksonville, FL', location: 'Jacksonville', state: 'FL', e5_with: 1710, o3_with: 2040 },
  { base: 'Charleston, SC', location: 'Charleston', state: 'SC', e5_with: 1920, o3_with: 2280 },
  { base: 'Pensacola, FL', location: 'Pensacola', state: 'FL', e5_with: 1650, o3_with: 1950 },
  
  // Lower-cost areas
  { base: 'Fort Hood, TX', location: 'Killeen', state: 'TX', e5_with: 1410, o3_with: 1680 },
  { base: 'Fort Bragg, NC', location: 'Fayetteville', state: 'NC', e5_with: 1440, o3_with: 1710 },
  { base: 'Fort Campbell, KY', location: 'Clarksville', state: 'TN', e5_with: 1380, o3_with: 1650 },
  { base: 'Fort Benning, GA', location: 'Columbus', state: 'GA', e5_with: 1260, o3_with: 1500 },
  { base: 'Offutt AFB, NE', location: 'Omaha', state: 'NE', e5_with: 1470, o3_with: 1740 },
  { base: 'Tinker AFB, OK', location: 'Oklahoma City', state: 'OK', e5_with: 1380, o3_with: 1650 },
  { base: 'Fort Riley, KS', location: 'Junction City', state: 'KS', e5_with: 1200, o3_with: 1440 },
  { base: 'Mountain Home AFB, ID', location: 'Mountain Home', state: 'ID', e5_with: 1230, o3_with: 1470 },
];

// Get BAH rate for a location (E-5 with dependents as baseline)
export function getBAHRate(location: string): number | null {
  const match = bahRates.find(b => 
    b.location.toLowerCase().includes(location.toLowerCase()) ||
    b.base.toLowerCase().includes(location.toLowerCase())
  );
  return match ? match.e5_with : null;
}

// Compare BAH between two locations
export function compareBAH(origin: string, destination: string) {
  const originBAH = getBAHRate(origin);
  const destBAH = getBAHRate(destination);
  
  if (!originBAH || !destBAH) return null;
  
  const difference = destBAH - originBAH;
  const percentChange = (difference / originBAH) * 100;
  
  return {
    origin: originBAH,
    destination: destBAH,
    difference,
    percentChange,
    favorable: difference > 0
  };
}

// Best/worst PCS months based on housing market trends
export const pcsTimingAdvice = {
  best: [
    { month: 'October', reason: 'Off-season, less competition, better deals', score: 95 },
    { month: 'November', reason: 'Slow market, motivated sellers, good inventory', score: 90 },
    { month: 'February', reason: 'Winter lull, negotiating power', score: 85 }
  ],
  avoid: [
    { month: 'June', reason: 'Peak PCS season, high prices, low inventory', score: 30 },
    { month: 'July', reason: 'Peak demand, bidding wars common', score: 25 },
    { month: 'August', reason: 'Back-to-school rush, premium prices', score: 35 }
  ],
  decent: [
    { month: 'January', reason: 'New year inventory, moderate competition', score: 70 },
    { month: 'March', reason: 'Spring market warming up', score: 65 },
    { month: 'April', reason: 'Good inventory, increasing activity', score: 60 },
    { month: 'May', reason: 'PCS season starting, rising prices', score: 50 },
    { month: 'September', reason: 'Post-summer slowdown beginning', score: 75 },
    { month: 'December', reason: 'Holiday season, limited inventory', score: 55 }
  ]
};

