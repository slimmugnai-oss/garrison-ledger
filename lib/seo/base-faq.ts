/**
 * BASE NAVIGATOR SEO - FAQ CONTENT GENERATION
 * 
 * Generates SEO-rich FAQ content for hidden sections
 * Targets long-tail keywords and provides value to users
 */

interface BaseSeed {
  name: string;
  state: string;
  branch: string;
  code: string;
}

/**
 * Get city name from base
 */
function getCityFromBaseName(baseName: string): string {
  const cityMap: Record<string, string> = {
    'Fort Liberty': 'Fayetteville',
    'Fort Campbell': 'Clarksville',
    'Fort Cavazos': 'Killeen',
    'Fort Moore': 'Columbus',
    'Fort Carson': 'Colorado Springs',
    'Fort Bliss': 'El Paso',
    'Fort Stewart': 'Hinesville',
    'JBLM': 'Tacoma',
    'Naval Station Norfolk': 'Norfolk',
    'Naval Base San Diego': 'San Diego',
    'Camp Lejeune': 'Jacksonville',
    'Camp Pendleton': 'Oceanside',
    'SHAW AFB': 'Sumter',
    'LACKLAND AFB': 'San Antonio',
    'TINKER AFB': 'Oklahoma City',
    'MACDILL AFB': 'Tampa',
    'BUCKLEY SFB': 'Denver',
    'PETERSON SFB': 'Colorado Springs',
  };

  for (const [baseKey, city] of Object.entries(cityMap)) {
    if (baseName.toUpperCase().includes(baseKey.toUpperCase())) {
      return city;
    }
  }

  const parts = baseName.split(/[,/]/);
  return parts[0].replace(/Fort |Camp |Naval Station |NAS |MCB /gi, '').trim();
}

/**
 * Generate "About This Base" SEO content
 */
export function generateAboutContent(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  const state = base.state;
  const branch = base.branch === 'USAF' ? 'Air Force' : 
                 base.branch === 'USMC' ? 'Marine Corps' : base.branch;

  return `${baseName} is a major ${branch} installation located${city ? ` in ${city}, ${state}` : ` in ${state}`}. For military families planning a PCS move to ${baseName}, finding the right neighborhood is critical for quality of life. Our Base Navigator analyzes the top neighborhoods near ${baseName}, providing comprehensive intelligence on schools, housing costs, commute times, weather, and local amenities. Whether you're looking for the best school districts, affordable housing within your BAH, or a short commute to base, our PCS planning tool helps ${branch} families make informed decisions about where to live near ${baseName}.`;
}

/**
 * Generate "PCS Planning" SEO content
 */
export function generatePCSPlanningContent(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  
  return `Planning your PCS move to ${baseName}? Our Base Navigator tool is designed specifically for military families facing the challenges of relocation. We provide detailed neighborhood analysis including school district ratings, median rent vs BAH comparison, gate-to-home commute calculations, and comprehensive amenity mapping. Start your ${baseName} housing search early by identifying the best neighborhoods${city ? ` in the ${city} area` : ''} that match your family's needs and budget. Our intelligence reports help you understand the local housing market, school quality, and quality of life factors before you move, giving you confidence in your PCS planning decisions.`;
}

/**
 * Generate "Housing Guide" SEO content
 */
export function generateHousingGuideContent(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  const state = base.state;
  
  return `Finding housing near ${baseName} requires understanding the local ${city ? `${city}, ${state}` : state} real estate market and how it compares to your BAH. Our Base Navigator provides real-time housing market intelligence, including median rent by bedroom count, sample property listings from Zillow, and analysis of properties at or under your BAH rate. We help military families identify neighborhoods with the best housing value, whether you're looking for single-family homes, townhouses, or apartments. Each neighborhood profile includes property type distribution, pet-friendly options, and market trends to support your ${baseName} housing search.`;
}

/**
 * Generate "Schools Guide" SEO content
 */
export function generateSchoolsGuideContent(base: BaseSeed): string {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityFromBaseName(base.name);
  
  return `School quality is a top priority for military families with children PCSing to ${baseName}. Our Base Navigator uses SchoolDigger data to analyze elementary, middle, and high schools in the primary district serving each neighborhood${city ? ` in the ${city} area` : ''}. You'll see detailed school ratings (0-10 scale), enrollment numbers, state rankings, and special programs like magnet or charter schools. We help you identify neighborhoods with the best educational options for your children, including backup options for PCS flexibility. Understanding school quality before your move to ${baseName} ensures your kids have access to quality education.`;
}

/**
 * Generate complete hidden SEO content block
 */
export function generateHiddenSEOContent(base: BaseSeed): {
  aboutBase: string;
  pcsPlanning: string;
  housingGuide: string;
  schoolsGuide: string;
} {
  return {
    aboutBase: generateAboutContent(base),
    pcsPlanning: generatePCSPlanningContent(base),
    housingGuide: generateHousingGuideContent(base),
    schoolsGuide: generateSchoolsGuideContent(base),
  };
}

