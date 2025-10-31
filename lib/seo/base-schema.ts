/**
 * BASE NAVIGATOR SEO - SCHEMA.ORG MARKUP
 * 
 * Generates structured data for all 164 base pages
 * Supports: Place, WebPage, FAQPage schemas
 */

interface BaseSeed {
  name: string;
  state: string;
  branch: string;
  center: { lat: number; lng: number };
  candidateZips: string[];
  mha: string | null;
  code: string;
}

/**
 * Get the nearest major city for address schema
 */
function getCityForBase(baseName: string): string {
  // Same city map as in base-keywords.ts
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

  return baseName.split(',')[0].trim();
}

/**
 * Generate Place schema for the military base
 */
export function generatePlaceSchema(base: BaseSeed) {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityForBase(base.name);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    '@id': `https://www.garrisonledger.com/dashboard/navigator/${base.code}#place`,
    name: baseName,
    description: `Military base neighborhood guide for ${baseName}. Find the best places to live with comprehensive analysis of schools, housing, commute times, and local amenities for military families.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: base.state,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: base.center.lat,
      longitude: base.center.lng,
    },
    additionalType: 'MilitaryBase',
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(base: BaseSeed) {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityForBase(base.name);
  const branch = base.branch === 'USAF' ? 'Air Force' : 
                 base.branch === 'USMC' ? 'Marine Corps' : base.branch;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `https://www.garrisonledger.com/dashboard/navigator/${base.code}#webpage`,
    url: `https://www.garrisonledger.com/dashboard/navigator/${base.code}`,
    name: `${baseName} Neighborhood Guide for Military Families`,
    description: `Comprehensive ${branch} PCS planning tool for ${baseName}. Compare top neighborhoods${city ? ` in ${city}` : ''} with analysis of schools, housing costs vs BAH, commute times, weather, and amenities.`,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://www.garrisonledger.com/#website',
      name: 'Garrison Ledger',
      url: 'https://www.garrisonledger.com',
    },
    about: {
      '@type': 'Thing',
      name: `${baseName} Military Neighborhoods`,
      description: `Neighborhood intelligence and PCS planning for military families moving to ${baseName}`,
    },
    keywords: [
      `${baseName} housing`,
      `${baseName} schools`,
      `${baseName} neighborhoods`,
      `PCS to ${baseName}`,
      `${baseName} BAH`,
      `${city} military housing`,
      `${baseName} family housing`,
      `${baseName} off base housing`,
      `best place to live near ${baseName}`,
    ].join(', '),
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  };
}

/**
 * Generate FAQ schema for common base questions
 */
export function generateFAQSchema(base: BaseSeed) {
  const baseName = base.name.split(',')[0].trim();
  const city = getCityForBase(base.name);
  const state = base.state;
  const branch = base.branch === 'USAF' ? 'Air Force' : 
                 base.branch === 'USMC' ? 'Marine Corps' : base.branch;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://www.garrisonledger.com/dashboard/navigator/${base.code}#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the BAH rate at ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BAH (Basic Allowance for Housing) at ${baseName} varies by rank and dependency status. Use our Base Navigator to see current 2025 BAH rates and find neighborhoods that fit within your housing allowance. The tool analyzes real-time housing costs to help you maximize your BAH.`,
        },
      },
      {
        '@type': 'Question',
        name: `What are the best schools near ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our Base Navigator analyzes school ratings${city ? ` in the ${city} area` : ''} near ${baseName}, including elementary, middle, and high schools. You'll see detailed school district information, ratings from GreatSchools, enrollment numbers, and distance from base to help you choose the best neighborhood for your family's education needs.`,
        },
      },
      {
        '@type': 'Question',
        name: `Should I live on-base or off-base at ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The decision depends on your family's priorities. On-base housing offers convenience, community, and short commutes. Off-base housing provides more options, potential BAH savings, and integration with the local community. Our Base Navigator helps you compare top off-base neighborhoods with comprehensive intelligence on schools, housing costs, commute times, and amenities.`,
        },
      },
      {
        '@type': 'Question',
        name: `What neighborhoods are closest to ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our Base Navigator identifies and ranks the top 3 neighborhoods near ${baseName} based on your Family Fit Score. We analyze commute times from each neighborhood's gate, helping ${branch} families find the perfect balance of short commute, quality schools, and affordable housing.`,
        },
      },
      {
        '@type': 'Question',
        name: `How much does housing cost near ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Housing costs${city ? ` in ${city}, ${state}` : ` near ${baseName}`} vary by neighborhood and property type. Our Base Navigator shows real-time median rent, sample listings from Zillow, and compares costs against your BAH to identify neighborhoods where you can live comfortably within your housing allowance or even save money.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the quality of life at ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Quality of life near ${baseName} includes factors like school quality, housing affordability, commute times, weather, and local amenities. Our Base Navigator provides comprehensive intelligence across all these categories${city ? ` for the ${city} area` : ''}, helping you understand what daily life will be like for your family before you PCS.`,
        },
      },
      {
        '@type': 'Question',
        name: `When should I start looking for housing near ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Start your housing search 60-90 days before your PCS move to ${baseName}. Use our Base Navigator early in your planning to identify target neighborhoods, understand the local housing market, and set up alerts for properties that fit your BAH and family needs. Early planning gives you the best selection and negotiating power.`,
        },
      },
      {
        '@type': 'Question',
        name: `What amenities are available near ${baseName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our Base Navigator analyzes 30+ amenity categories${city ? ` around ${city}` : ` near ${baseName}`}, including grocery stores, healthcare, dining, fitness, schools, childcare, spouse employment opportunities, and family activities. Each neighborhood is scored for walkability and family-friendliness to help you find the best fit.`,
        },
      },
    ],
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(base: BaseSeed) {
  const baseName = base.name.split(',')[0].trim();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.garrisonledger.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Base Navigator',
        item: 'https://www.garrisonledger.com/dashboard/navigator',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${baseName} Neighborhoods`,
        item: `https://www.garrisonledger.com/dashboard/navigator/${base.code}`,
      },
    ],
  };
}

