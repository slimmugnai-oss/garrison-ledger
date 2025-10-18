/**
 * PCS PER DIEM RATES
 * 
 * Provides locality-specific per diem rates for PCS travel.
 * Based on DTMO (Defense Travel Management Office) rates.
 * 
 * Rates are total M&IE (Meals & Incidental Expenses) per day.
 * Actual reimbursement is 75% of rate for travel days.
 */

import perDiemData from '@/lib/data/per-diem-rates.json';

interface PerDiemRate {
  state: string;
  city: string;
  rate: number;
}

const perDiemRates: PerDiemRate[] = perDiemData.localities as PerDiemRate[];
const STANDARD_CONUS_RATE = perDiemData.standard_conus_rate;

/**
 * Get per diem rate for a specific location
 * Returns daily M&IE rate
 */
export function getPerDiemRate(city: string, state: string): number {
  const normalizedCity = city.toLowerCase().trim();
  const normalizedState = state.toUpperCase().trim();

  // Find exact match
  const exactMatch = perDiemRates.find(rate => 
    rate.city.toLowerCase() === normalizedCity &&
    rate.state === normalizedState
  );

  if (exactMatch) {
    return exactMatch.rate;
  }

  // Find partial city match in same state
  const partialMatch = perDiemRates.find(rate =>
    rate.state === normalizedState &&
    (rate.city.toLowerCase().includes(normalizedCity) ||
     normalizedCity.includes(rate.city.toLowerCase()))
  );

  if (partialMatch) {
    return partialMatch.rate;
  }

  // Return standard CONUS rate as fallback
  return STANDARD_CONUS_RATE;
}

/**
 * Get per diem rate for a military base
 * Helper function that works with base names
 */
export function getPerDiemRateForBase(baseName: string): number {
  // Extract city and state from common base name patterns
  const cityStateMatch = baseName.match(/,\s*([A-Z]{2})/);
  if (!cityStateMatch) {
    return STANDARD_CONUS_RATE;
  }

  const state = cityStateMatch[1];
  const city = baseName.split(',')[0].trim();

  return getPerDiemRate(city, state);
}

/**
 * Calculate total per diem entitlement for PCS travel
 * 
 * @param originCity - Origin city
 * @param originState - Origin state (2-letter code)
 * @param destinationCity - Destination city
 * @param destinationState - Destination state (2-letter code)
 * @param travelDays - Number of travel days
 * @param dependents - Number of dependents (0 if none)
 * @returns Total per diem amount
 */
export function calculatePerDiem(
  originCity: string,
  originState: string,
  destinationCity: string,
  destinationState: string,
  travelDays: number,
  dependents: number = 0
): {
  total: number;
  dailyRate: number;
  effectiveRate: number;
  breakdown: {
    member: number;
    dependents: number;
  };
} {
  // Get rate for destination (higher of origin or destination used)
  const originRate = getPerDiemRate(originCity, originState);
  const destinationRate = getPerDiemRate(destinationCity, destinationState);
  const applicableRate = Math.max(originRate, destinationRate);

  // Travel per diem is 75% of full rate
  const travelPercentage = 0.75;
  const effectiveRate = applicableRate * travelPercentage;

  // Member gets full effective rate
  const memberAmount = effectiveRate * travelDays;

  // Each dependent gets 75% of member's rate
  const dependentPercentage = 0.75;
  const dependentDailyRate = effectiveRate * dependentPercentage;
  const dependentsAmount = dependentDailyRate * travelDays * dependents;

  return {
    total: Math.round(memberAmount + dependentsAmount),
    dailyRate: applicableRate,
    effectiveRate: Math.round(effectiveRate),
    breakdown: {
      member: Math.round(memberAmount),
      dependents: Math.round(dependentsAmount)
    }
  };
}

/**
 * Get all available per diem localities
 * Useful for autocomplete/search
 */
export function getAllPerDiemLocalities(): PerDiemRate[] {
  return perDiemRates;
}

/**
 * Search per diem localities by city or state
 */
export function searchPerDiemLocalities(query: string): PerDiemRate[] {
  const normalized = query.toLowerCase().trim();
  
  return perDiemRates.filter(rate =>
    rate.city.toLowerCase().includes(normalized) ||
    rate.state.toLowerCase().includes(normalized)
  );
}

/**
 * Get standard CONUS rate (for unknown localities)
 */
export function getStandardConusRate(): number {
  return STANDARD_CONUS_RATE;
}

