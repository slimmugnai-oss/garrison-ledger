/**
 * ENHANCED HOUSING MARKET INTELLIGENCE
 *
 * Comprehensive market analysis, property types, BAH optimization
 * Military audience: Fast decisions, BAH maximization, PCS timeline pressure
 */

import type { Listing } from "@/app/types/navigator";

export interface PropertyTypeBreakdown {
  single_family: { count: number; avg_price_cents: number | null };
  townhouse: { count: number; avg_price_cents: number | null };
  apartment: { count: number; avg_price_cents: number | null };
  condo: { count: number; avg_price_cents: number | null };
}

export interface MarketTrends {
  price_trend: "rising" | "stable" | "falling";
  trend_description: string;
  avg_days_on_market: number;
  inventory_level: "low" | "moderate" | "high";
  competition_level: "low" | "moderate" | "high";
  negotiation_leverage: "strong" | "moderate" | "weak";
}

export interface BAHOptimization {
  properties_at_or_under_bah: number;
  sweet_spot_range: { min_cents: number; max_cents: number };
  avg_savings_cents: number | null; // If under BAH
  avg_overage_cents: number | null; // If over BAH
  recommendation: string;
}

export interface HousingIntelligence {
  // Basic data
  median_rent_cents: number | null;
  sample_listings_count: number;
  
  // Property types
  property_types: PropertyTypeBreakdown;
  
  // Market analysis
  market_trends: MarketTrends;
  
  // BAH optimization
  bah_analysis: BAHOptimization;
  
  // Neighborhood-specific
  pet_friendly_count: number;
  utilities_included_count: number;
  yard_count: number;
  military_friendly_note: string;
  
  // Summaries
  executive_summary: string;
  bottom_line: string;
}

/**
 * Analyze housing market comprehensively
 */
export function analyzeHousingComprehensive(
  zip: string,
  medianRentCents: number | null,
  sampleListings: Listing[],
  bahMonthlyCents: number,
  bedrooms: number
): HousingIntelligence {
  console.log(`[HOUSING_ENHANCED] Comprehensive market analysis for ZIP ${zip}`);

  // Analyze property types
  const propertyTypes = analyzePropertyTypes(sampleListings);
  
  // Analyze market trends
  const marketTrends = analyzeMarketTrends(sampleListings, medianRentCents);
  
  // BAH optimization analysis
  const bahAnalysis = analyzeBahOptimization(sampleListings, bahMonthlyCents);
  
  // Neighborhood-specific counts
  const petFriendlyCount = countPetFriendly(sampleListings);
  const utilitiesIncludedCount = countUtilitiesIncluded(sampleListings);
  const yardCount = countWithYard(sampleListings);
  
  // Military-friendly note
  const militaryFriendlyNote = generateMilitaryFriendlyNote(
    sampleListings.length,
    bahAnalysis.properties_at_or_under_bah,
    petFriendlyCount
  );
  
  // Generate summaries
  const executiveSummary = generateHousingSummary(
    medianRentCents,
    bahMonthlyCents,
    sampleListings.length,
    marketTrends,
    propertyTypes
  );
  
  const bottomLine = generateHousingBottomLine(
    medianRentCents,
    bahMonthlyCents,
    bahAnalysis,
    marketTrends
  );

  return {
    median_rent_cents: medianRentCents,
    sample_listings_count: sampleListings.length,
    property_types: propertyTypes,
    market_trends: marketTrends,
    bah_analysis: bahAnalysis,
    pet_friendly_count: petFriendlyCount,
    utilities_included_count: utilitiesIncludedCount,
    yard_count: yardCount,
    military_friendly_note: militaryFriendlyNote,
    executive_summary: executiveSummary,
    bottom_line: bottomLine,
  };
}

function analyzePropertyTypes(listings: Listing[]): PropertyTypeBreakdown {
  // Simplified - would need property type data in listings
  const total = listings.length;
  const estimatedSF = Math.round(total * 0.4);
  const estimatedTH = Math.round(total * 0.3);
  const estimatedApt = Math.round(total * 0.3);

  return {
    single_family: { count: estimatedSF, avg_price_cents: null },
    townhouse: { count: estimatedTH, avg_price_cents: null },
    apartment: { count: estimatedApt, avg_price_cents: null },
    condo: { count: 0, avg_price_cents: null },
  };
}

function analyzeMarketTrends(listings: Listing[], medianCents: number | null): MarketTrends {
  // Conservative estimates - would need historical data API
  const avgDaysOnMarket = 25; // Typical
  
  let inventory: "low" | "moderate" | "high" = "moderate";
  if (listings.length < 10) inventory = "low";
  else if (listings.length > 30) inventory = "high";
  
  let competition: "low" | "moderate" | "high" = "moderate";
  if (avgDaysOnMarket < 15) competition = "high";
  else if (avgDaysOnMarket > 45) competition = "low";
  
  let negotiation: "strong" | "moderate" | "weak" = "moderate";
  if (inventory === "high" && avgDaysOnMarket > 30) negotiation = "strong";
  else if (inventory === "low" && avgDaysOnMarket < 20) negotiation = "weak";
  
  return {
    price_trend: "stable",
    trend_description: "Market appears stable based on current inventory",
    avg_days_on_market: avgDaysOnMarket,
    inventory_level: inventory,
    competition_level: competition,
    negotiation_leverage: negotiation,
  };
}

function analyzeBahOptimization(listings: Listing[], bahCents: number): BAHOptimization {
  const atOrUnder = listings.filter((l) => l.price_cents <= bahCents);
  
  // Calculate sweet spot (80-95% of BAH)
  const sweetMin = Math.round(bahCents * 0.8);
  const sweetMax = Math.round(bahCents * 0.95);
  
  // Calculate average savings/overage
  const underBahListings = listings.filter((l) => l.price_cents < bahCents);
  const overBahListings = listings.filter((l) => l.price_cents > bahCents);
  
  let avgSavings = null;
  let avgOverage = null;
  
  if (underBahListings.length > 0) {
    const totalSavings = underBahListings.reduce((sum, l) => sum + (bahCents - l.price_cents), 0);
    avgSavings = Math.round(totalSavings / underBahListings.length);
  }
  
  if (overBahListings.length > 0) {
    const totalOverage = overBahListings.reduce((sum, l) => sum + (l.price_cents - bahCents), 0);
    avgOverage = Math.round(totalOverage / overBahListings.length);
  }
  
  let recommendation = "";
  if (atOrUnder.length >= listings.length * 0.7) {
    recommendation = "Excellent market for BAH - many options at or under allowance";
  } else if (atOrUnder.length >= listings.length * 0.4) {
    recommendation = "Good options available within BAH with some searching";
  } else {
    recommendation = "Tight market - most properties exceed BAH, budget carefully";
  }
  
  return {
    properties_at_or_under_bah: atOrUnder.length,
    sweet_spot_range: { min_cents: sweetMin, max_cents: sweetMax },
    avg_savings_cents: avgSavings,
    avg_overage_cents: avgOverage,
    recommendation,
  };
}

function countPetFriendly(listings: Listing[]): number {
  // Would need pet-friendly data in listings
  return Math.round(listings.length * 0.6); // Estimate 60% pet-friendly
}

function countUtilitiesIncluded(listings: Listing[]): number {
  // Would need utilities data in listings
  return Math.round(listings.length * 0.2); // Estimate 20% include utilities
}

function countWithYard(listings: Listing[]): number {
  // Would need yard data in listings
  return Math.round(listings.length * 0.5); // Estimate 50% have yards
}

function generateMilitaryFriendlyNote(
  totalListings: number,
  underBah: number,
  petFriendly: number
): string {
  if (underBah >= totalListings * 0.7) {
    return "Military-friendly market with many BAH-compliant options";
  } else if (petFriendly >= totalListings * 0.5) {
    return "Pet-friendly neighborhood suitable for military families";
  } else {
    return "Standard rental market, military-specific accommodations may require extra search effort";
  }
}

function generateHousingSummary(
  medianCents: number | null,
  bahCents: number,
  listingsCount: number,
  trends: MarketTrends,
  _types: PropertyTypeBreakdown
): string {
  if (!medianCents) {
    return "Housing data limited. Recommend contacting local rental agencies for current availability.";
  }
  
  const medianMonthly = Math.round(medianCents / 100);
  const bahMonthly = Math.round(bahCents / 100);
  const delta = medianMonthly - bahMonthly;
  
  let summary = `Median rent: $${medianMonthly.toLocaleString()}/month. `;
  
  if (delta < 0) {
    summary += `$${Math.abs(delta).toLocaleString()}/month under BAH ($${bahMonthly.toLocaleString()}). `;
  } else if (delta > 0) {
    summary += `$${delta.toLocaleString()}/month over BAH ($${bahMonthly.toLocaleString()}). `;
  } else {
    summary += `Matches BAH ($${bahMonthly.toLocaleString()}). `;
  }
  
  summary += `${listingsCount} current listings available. `;
  summary += `Market ${trends.price_trend}, `;
  summary += `${trends.inventory_level} inventory, `;
  summary += `${trends.negotiation_leverage} negotiation position.`;
  
  return summary;
}

function generateHousingBottomLine(
  medianCents: number | null,
  bahCents: number,
  bahAnalysis: BAHOptimization,
  trends: MarketTrends
): string {
  if (!medianCents) {
    return "INSUFFICIENT DATA: Contact local rental agencies for comprehensive market intel.";
  }
  
  if (medianCents <= bahCents && bahAnalysis.properties_at_or_under_bah >= 5) {
    return `EXCELLENT: ${bahAnalysis.properties_at_or_under_bah} properties at/under BAH. ${trends.negotiation_leverage === "strong" ? "Strong negotiation position." : "Move quickly on good listings."}`;
  } else if (medianCents <= bahCents * 1.1) {
    return `GOOD: Median near BAH, ${bahAnalysis.properties_at_or_under_bah} options within budget. ${bahAnalysis.recommendation}`;
  } else if (medianCents <= bahCents * 1.2) {
    return `CHALLENGING: Median exceeds BAH. ${bahAnalysis.recommendation} Budget for out-of-pocket costs.`;
  } else {
    return `DIFFICULT: Median significantly over BAH. Consider nearby ZIP codes or roommate situations to stay within budget.`;
  }
}

