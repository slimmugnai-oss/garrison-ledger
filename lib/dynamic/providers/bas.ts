/**
 * BAS PROVIDER
 * 
 * Basic Allowance for Subsistence (BAS) constants from SSOT
 * Data source: lib/ssot.ts (from DFAS official rates)
 * TTL: 7 days (BAS changes rarely, usually once annually in January)
 */

import { ssot } from '@/lib/ssot';
import type { ResolvedData, ProviderResult } from '../types';

export interface BASParams {
  paygrade: string;  // E01-E09, O01-O10, W01-W05
}

/**
 * Get BAS rate from SSOT
 * Returns rate in cents
 */
export async function getBASRate(params: BASParams): Promise<ProviderResult> {
  const { paygrade } = params;

  try {
    // Determine if officer or enlisted
    const normalizedGrade = paygrade.toUpperCase();
    const isOfficer = normalizedGrade.startsWith('O') || normalizedGrade.startsWith('W');
    const isEnlisted = normalizedGrade.startsWith('E');

    if (!isOfficer && !isEnlisted) {
      return {
        data: null,
        error: `Invalid paygrade: ${paygrade}`,
        cached: false
      };
    }

    const rateCents = isOfficer 
      ? ssot.militaryPay.basMonthlyCents.officer
      : ssot.militaryPay.basMonthlyCents.enlisted;

    // SSOT as_of date
    const asOfDate = ssot.lastUpdatedISO;

    const resolved: ResolvedData = {
      value: rateCents,
      currency: 'USD',
      asOf: asOfDate,
      sourceName: 'DFAS BAS Rates',
      sourceUrl: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/',
      format: 'money',
      displayValue: formatCents(rateCents)
    };

    return {
      data: resolved,
      cached: false
    };

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false
    };
  }
}

/**
 * Get both officer and enlisted BAS rates
 */
export async function getAllBASRates(): Promise<{
  officer: ResolvedData;
  enlisted: ResolvedData;
}> {
  const officerResult = await getBASRate({ paygrade: 'O01' });
  const enlistedResult = await getBASRate({ paygrade: 'E01' });

  if (!officerResult.data || !enlistedResult.data) {
    throw new Error('Failed to get BAS rates from SSOT');
  }

  return {
    officer: officerResult.data,
    enlisted: enlistedResult.data
  };
}

/**
 * Format cents as USD currency
 */
function formatCents(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

