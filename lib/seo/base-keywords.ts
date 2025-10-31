/**
 * BASE NAVIGATOR SEO - KEYWORD TARGETING
 * 
 * Dynamic keyword generation for all 164 bases
 * Targets high-value military PCS and neighborhood search terms
 */

interface BaseSeed {
  name: string;
  state: string;
  branch: string;
  mha: string | null;
}

interface KeywordSet {
  primary: string[];
  secondary: string[];
  longtail: string[];
  local: string[];
}

/**
 * Extract city name from base name
 * Examples: "Fort Liberty, NC" → "Fayetteville"
 */
function getCityFromBaseName(baseName: string): string {
  const cityMap: Record<string, string> = {
    // Army
    'Fort Liberty': 'Fayetteville',
    'Fort Campbell': 'Clarksville',
    'Fort Cavazos': 'Killeen',
    'Fort Moore': 'Columbus',
    'Fort Carson': 'Colorado Springs',
    'Fort Bliss': 'El Paso',
    'Fort Stewart': 'Hinesville',
    'Fort Riley': 'Manhattan',
    'Fort Drum': 'Watertown',
    'JBLM': 'Tacoma',
    'Fort Eisenhower': 'Augusta',
    'Fort Knox': 'Louisville',
    'Fort Sill': 'Lawton',
    'Fort Leonard Wood': 'Waynesville',
    'Fort Johnson': 'Leesville',
    
    // Navy
    'Naval Station Norfolk': 'Norfolk',
    'Naval Base San Diego': 'San Diego',
    'Naval Base Kitsap': 'Bremerton',
    'NAS Jacksonville': 'Jacksonville',
    'NAS Pensacola': 'Pensacola',
    'NAS Whidbey Island': 'Oak Harbor',
    'Naval Station Mayport': 'Jacksonville',
    
    // USMC
    'Camp Lejeune': 'Jacksonville',
    'Camp Pendleton': 'Oceanside',
    'Twentynine Palms': 'Twentynine Palms',
    'MCAS Miramar': 'San Diego',
    'MCB Quantico': 'Quantico',
    
    // USAF
    'SHAW AFB': 'Sumter',
    'LACKLAND AFB': 'San Antonio',
    'TINKER AFB': 'Oklahoma City',
    'MACDILL AFB': 'Tampa',
    'LUKE AFB': 'Phoenix',
    'TRAVIS AFB': 'Fairfield',
    'EGLIN AFB': 'Valparaiso',
    'WRIGHT-PATTERSON AFB': 'Dayton',
    
    // Space Force
    'BUCKLEY SFB': 'Denver',
    'PETERSON SFB': 'Colorado Springs',
    'VANDENBERG SFB': 'Lompoc',
    'PATRICK SFB': 'Cocoa Beach',
  };

  // Try to find city in map
  for (const [baseKey, city] of Object.entries(cityMap)) {
    if (baseName.toUpperCase().includes(baseKey.toUpperCase())) {
      return city;
    }
  }

  // Fallback: extract from name
  // "SUMTER/SHAW AFB, SC" → "Sumter"
  const parts = baseName.split(/[,/]/);
  if (parts.length > 0) {
    return parts[0].replace(/Fort |Camp |Naval Station |NAS |MCB |MCAS /gi, '').trim();
  }

  return '';
}

/**
 * Get branch-specific keywords
 */
function getBranchKeywords(branch: string): string[] {
  switch (branch) {
    case 'Army':
      return ['army base', 'army post', 'military installation', 'army family', 'army spouse'];
    case 'Navy':
      return ['naval station', 'navy base', 'naval base', 'navy family', 'navy spouse', 'sailor'];
    case 'USMC':
      return ['marine corps base', 'USMC', 'marine base', 'marine family', 'marine spouse'];
    case 'USAF':
      return ['air force base', 'AFB', 'airman', 'air force family', 'air force spouse'];
    case 'Space Force':
      return ['space force base', 'SFB', 'guardian', 'space force family'];
    case 'Joint':
      return ['joint base', 'military base', 'joint installation'];
    default:
      return ['military base'];
  }
}

/**
 * Generate comprehensive keyword set for a base
 */
export function generateBaseKeywords(base: BaseSeed): KeywordSet {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  const state = base.state;
  const branchKeywords = getBranchKeywords(base.branch);

  return {
    // Primary keywords (high volume, high intent)
    primary: [
      `best neighborhoods near ${baseName}`,
      `${baseName} housing`,
      `${baseName} schools`,
      `PCS to ${baseName}`,
      `moving to ${baseName}`,
      `${baseName} BAH`,
    ],

    // Secondary keywords (medium volume, specific)
    secondary: [
      `${baseName} off base housing`,
      `${baseName} family housing`,
      `${baseName} school districts`,
      `${baseName} commute`,
      `${baseName} neighborhood guide`,
      `${baseName} area schools`,
      `where to live near ${baseName}`,
      `${baseName} ${state} housing`,
      ...(city ? [`${city} military housing`, `${city} ${state} neighborhoods`] : []),
    ],

    // Long-tail keywords (low volume, high conversion)
    longtail: [
      `best place to live near ${baseName} for families`,
      `${baseName} housing costs vs BAH`,
      `top rated schools near ${baseName}`,
      `${baseName} to ${city} commute time`,
      `is ${baseName} a good duty station`,
      `${baseName} quality of life`,
      `moving to ${baseName} with kids`,
      `${baseName} spouse employment`,
      ...(city ? [`${city} ${state} military friendly neighborhoods`] : []),
    ],

    // Local SEO keywords
    local: [
      `${city} ${state}`,
      `${city} schools`,
      `${city} housing market`,
      `${city} neighborhoods`,
      `near ${baseName}`,
      ...branchKeywords,
    ],
  };
}

/**
 * Generate SEO-optimized title (55-60 chars ideal)
 */
export function generateSEOTitle(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const state = base.state;
  
  // Format: "Best Neighborhoods Near [Base] [State] (2025) | Housing & Schools"
  // Max 60 chars for Google display
  
  if (baseName.length > 25) {
    // Long names: keep it shorter
    return `${baseName} Neighborhoods (2025) | Housing & Schools Guide`;
  }
  
  return `Best Neighborhoods Near ${baseName} ${state} (2025) | Housing & Schools`;
}

/**
 * Generate SEO-optimized description (155-160 chars ideal)
 */
export function generateSEODescription(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  const state = base.state;
  
  // Include: Primary keyword + value prop + location + CTA
  // Target 155-160 chars for optimal Google display
  
  if (city) {
    return `Find top-rated neighborhoods near ${baseName}. Compare schools, housing costs vs BAH, commute times for military families moving to ${city}, ${state}. Start your PCS planning.`;
  }
  
  return `Find the best neighborhoods near ${baseName} with comprehensive PCS planning. Compare schools, housing, commute times, and BAH optimization for ${state} military families.`;
}

/**
 * Generate Open Graph title (can be longer, more descriptive)
 */
export function generateOGTitle(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  
  if (city) {
    return `${baseName} Neighborhood Guide: Best Places to Live in ${city} for Military Families (2025)`;
  }
  
  return `${baseName} Neighborhood Guide: Find the Best Housing & Schools for Your PCS (2025)`;
}

/**
 * Generate Open Graph description (can be longer)
 */
export function generateOGDescription(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  const branch = base.branch === 'USAF' ? 'Air Force' : 
                 base.branch === 'USMC' ? 'Marine Corps' : base.branch;
  
  return `Moving to ${baseName}? Our comprehensive PCS planning tool helps ${branch} families find the perfect neighborhood. Compare top-rated schools, housing costs vs BAH, commute times, weather, and local amenities across the best neighborhoods${city ? ` in ${city}` : ''}. Make your PCS move with confidence.`;
}

