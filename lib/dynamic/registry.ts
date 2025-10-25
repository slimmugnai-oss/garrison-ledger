/**
 * DYNAMIC DATA REGISTRY
 * 
 * Central orchestrator for all dynamic data providers
 * Handles routing, validation, caching, and error handling
 */

import { getBAHRate, type BAHParams } from './providers/bah';
import { getBASRate, type BASParams } from './providers/bas';
import { getCOLARate, type COLAParams } from './providers/cola';
import { getIRSLimit, type IRSParams } from './providers/irs';
import { getMileageRate, type MileageParams } from './providers/mileage';
import { getTRICARECost, type TRICAREParams } from './providers/tricare';
import type { DataRefParams, ProviderResult, SourceKey } from './types';

/**
 * Resolve a DataRef to actual data
 * This is the main entry point for <DataRef> component
 */
export async function resolveDataRef(params: DataRefParams): Promise<ProviderResult> {
  const { source, code, paygrade, withDeps, field, format } = params;

  try {
    // Validate required parameters based on source
    const validation = validateParams(params);
    if (!validation.valid) {
      return {
        data: null,
        error: validation.error,
        cached: false
      };
    }

    // Route to appropriate provider
    let result: ProviderResult;

    switch (source) {
      case 'BAH':
        if (!paygrade || !code) {
          return {
            data: null,
            error: 'BAH requires paygrade and code (MHA or ZIP)',
            cached: false
          };
        }
        result = await getBAHRate({
          paygrade,
          mhaOrZip: code,
          withDependents: withDeps ?? false
        } as BAHParams);
        break;

      case 'BAS':
        if (!paygrade) {
          return {
            data: null,
            error: 'BAS requires paygrade',
            cached: false
          };
        }
        result = await getBASRate({ paygrade } as BASParams);
        break;

      case 'COLA':
        if (!paygrade || !code) {
          return {
            data: null,
            error: 'COLA requires paygrade and code (MHA or location code)',
            cached: false
          };
        }
        result = await getCOLARate({
          location: code,
          paygrade,
          withDependents: withDeps ?? false
        } as COLAParams);
        break;

      case 'IRS_TSP_LIMITS':
        if (!field) {
          return {
            data: null,
            error: 'IRS_TSP_LIMITS requires field parameter',
            cached: false
          };
        }
        result = await getIRSLimit({ field } as IRSParams);
        break;

      case 'TRICARE_COSTS':
        if (!field) {
          return {
            data: null,
            error: 'TRICARE_COSTS requires field parameter',
            cached: false
          };
        }
        result = await getTRICARECost({ field } as TRICAREParams);
        break;

      case 'MILEAGE_RATE':
        result = await getMileageRate({} as MileageParams);
        break;

      default:
        return {
          data: null,
          error: `Unknown source: ${source}`,
          cached: false
        };
    }

    // Override format if specified
    if (result.data && format) {
      result.data = {
        ...result.data,
        format,
        displayValue: formatValue(result.data.value, format, result.data.currency)
      };
    }

    return result;

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false
    };
  }
}

/**
 * Validate DataRef parameters
 */
function validateParams(params: DataRefParams): { valid: boolean; error?: string } {
  const { source, code, paygrade, field } = params;

  // Source-specific validation
  switch (source) {
    case 'BAH':
      if (!paygrade) return { valid: false, error: 'BAH requires paygrade' };
      if (!code) return { valid: false, error: 'BAH requires code (MHA or ZIP)' };
      break;

    case 'BAS':
      if (!paygrade) return { valid: false, error: 'BAS requires paygrade' };
      break;

    case 'COLA':
      if (!paygrade) return { valid: false, error: 'COLA requires paygrade' };
      if (!code) return { valid: false, error: 'COLA requires code (MHA or location)' };
      break;

    case 'IRS_TSP_LIMITS':
      if (!field) return { valid: false, error: 'IRS_TSP_LIMITS requires field' };
      break;

    case 'TRICARE_COSTS':
      if (!field) return { valid: false, error: 'TRICARE_COSTS requires field' };
      break;

    case 'MILEAGE_RATE':
      // No required params
      break;

    default:
      return { valid: false, error: `Unknown source: ${source}` };
  }

  return { valid: true };
}

/**
 * Format value based on format type
 */
function formatValue(value: number, format: 'money' | 'rate' | 'percent' | 'plain', currency?: string): string {
  switch (format) {
    case 'money':
      if (currency === 'USD') {
        // Assume value is in cents if > 1000, otherwise dollars
        const dollars = value > 1000 ? value / 100 : value;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(dollars);
      }
      return `${value}`;

    case 'percent':
      return `${value.toFixed(2)}%`;

    case 'rate':
      return value.toFixed(4);

    case 'plain':
    default:
      return value.toString();
  }
}

/**
 * Batch resolve multiple DataRefs
 * Useful for pages that need multiple values
 */
export async function resolveBatchDataRefs(params: DataRefParams[]): Promise<ProviderResult[]> {
  return Promise.all(params.map(p => resolveDataRef(p)));
}

/**
 * Get provenance info for a source
 * Returns human-readable attribution and source URL
 */
export function getProvenance(source: SourceKey): {
  sourceName: string;
  sourceUrl: string;
  updateFrequency: string;
} {
  const provenance: Record<SourceKey, { sourceName: string; sourceUrl: string; updateFrequency: string }> = {
    BAH: {
      sourceName: 'DFAS BAH Rates',
      sourceUrl: 'https://www.defensetravel.dod.mil/site/bahCalc.cfm',
      updateFrequency: 'Annually (January)'
    },
    BAS: {
      sourceName: 'DFAS BAS Rates',
      sourceUrl: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/',
      updateFrequency: 'Annually (January)'
    },
    COLA: {
      sourceName: 'DTMO COLA Rates',
      sourceUrl: 'https://www.travel.dod.mil/Travel-Transportation-Rates/',
      updateFrequency: 'Quarterly'
    },
    IRS_TSP_LIMITS: {
      sourceName: 'IRS / TSP.gov',
      sourceUrl: 'https://www.tsp.gov/making-contributions/contribution-limits/',
      updateFrequency: 'Annually (November for next year)'
    },
    TRICARE_COSTS: {
      sourceName: 'TRICARE',
      sourceUrl: 'https://www.tricare.mil/Costs',
      updateFrequency: 'Annually (January)'
    },
    MILEAGE_RATE: {
      sourceName: 'DFAS Mileage Rates',
      sourceUrl: 'https://www.defensetravel.dod.mil/site/mileageRates.cfm',
      updateFrequency: '1-2 times per year'
    }
  };

  return provenance[source];
}

