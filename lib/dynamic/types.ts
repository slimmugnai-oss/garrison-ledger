/**
 * DYNAMIC DATA TYPES
 * 
 * Shared types for dynamic data providers and registry
 */

export type SourceKey = 
  | 'BAH' 
  | 'BAS' 
  | 'COLA' 
  | 'IRS_TSP_LIMITS' 
  | 'TRICARE_COSTS'
  | 'MILEAGE_RATE';

export type DataFormat = 'money' | 'rate' | 'percent' | 'plain';

export interface DataRefParams {
  source: SourceKey;
  code?: string;              // e.g., MHA for BAH/COLA, ZIP for location-based
  paygrade?: string;          // E01..O07
  withDeps?: boolean;         // For BAH/COLA
  field?: string;             // For IRS/TRICARE (e.g., 'tsp_elective_deferral_limit_annual')
  format?: DataFormat;
}

export interface ResolvedData {
  value: number;              // Raw value (cents for money, decimal for rates/percents)
  currency?: string;          // 'USD' for money values
  asOf: string;               // ISO date string (YYYY-MM-DD)
  sourceName: string;         // Human-readable source (e.g., 'DFAS BAH Rates')
  sourceUrl?: string;         // Official source URL
  format: DataFormat;
  displayValue: string;       // Formatted for display (e.g., '$2,450.00', '8.5%', '0.70')
}

export interface ProviderResult {
  data: ResolvedData | null;
  error?: string;
  cached: boolean;
}

export interface FeedStatus {
  sourceKey: SourceKey;
  ttlSeconds: number;
  lastRefreshAt: string | null;
  status: 'ok' | 'stale' | 'error';
  notes?: string;
  errorMessage?: string;
}

export interface CacheEntry<T = ResolvedData> {
  value: T;
  cachedAt: number;           // Unix timestamp
  expiresAt: number;          // Unix timestamp
}

