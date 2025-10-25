/**
 * DATA FRESHNESS TRACKING SYSTEM
 *
 * Monitors staleness of cached data sources and triggers refresh when needed
 * Part of real-time hybrid data access strategy
 *
 * Strategy:
 * - Check cache first (fast)
 * - If stale, fetch live data (slower but accurate)
 * - Schedule background refresh
 */

import { logger } from "@/lib/logger";

/**
 * Created: 2025-01-25
 * Part of: Ask Military Expert Real-Time Data Layer
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DataSource {
  id: string;
  name: string;
  table: string;
  official_url: string;
  update_frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  last_updated: Date;
  last_checked: Date;
  status: "fresh" | "stale" | "expired";
  api_endpoint?: string;
  cache_ttl_days?: number;
}

export type UpdateFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "annually";

// ============================================================================
// DATA SOURCE REGISTRY
// ============================================================================

export const DATA_SOURCES: Record<string, DataSource> = {
  // Financial Data
  bah_rates: {
    id: "bah_rates",
    name: "BAH Rates",
    table: "bah_rates",
    official_url: "https://www.dfas.mil/militarymembers/payentitlements/bah/",
    update_frequency: "annually",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 365,
  },

  military_pay_tables: {
    id: "military_pay_tables",
    name: "Military Pay Tables",
    table: "military_pay_tables",
    official_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
    update_frequency: "annually",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 365,
  },

  sgli_rates: {
    id: "sgli_rates",
    name: "SGLI Life Insurance Rates",
    table: "sgli_rates",
    official_url: "https://www.va.gov/life-insurance/options-eligibility/sgli/",
    update_frequency: "annually",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 365,
  },

  conus_cola_rates: {
    id: "conus_cola_rates",
    name: "CONUS COLA Rates",
    table: "conus_cola_rates",
    official_url: "https://www.travel.dod.mil/",
    update_frequency: "quarterly",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 90,
  },

  oconus_cola_rates: {
    id: "oconus_cola_rates",
    name: "OCONUS COLA Rates",
    table: "oconus_cola_rates",
    official_url: "https://www.travel.dod.mil/",
    update_frequency: "quarterly",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 90,
  },

  tsp_constants: {
    id: "tsp_constants",
    name: "TSP Information",
    table: "tsp_constants",
    official_url: "https://www.tsp.gov/",
    update_frequency: "quarterly",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 90,
    api_endpoint: "https://www.tsp.gov/fund-performance/",
  },

  // Tax Data
  payroll_tax_constants: {
    id: "payroll_tax_constants",
    name: "Payroll Tax Rates (FICA/Medicare)",
    table: "payroll_tax_constants",
    official_url: "https://www.irs.gov/",
    update_frequency: "annually",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 365,
  },

  state_tax_rates: {
    id: "state_tax_rates",
    name: "State Tax Rates",
    table: "state_tax_rates",
    official_url: "https://www.tax-rates.org/",
    update_frequency: "annually",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 365,
  },

  // Entitlements
  entitlements_data: {
    id: "entitlements_data",
    name: "PCS Entitlements (DLA, Weight, etc)",
    table: "entitlements_data",
    official_url: "https://www.travel.dod.mil/Regulations/Joint-Travel-Regulations/",
    update_frequency: "annually",
    last_updated: new Date("2025-01-01"),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 365,
  },

  // Base Data
  base_external_data_cache: {
    id: "base_external_data_cache",
    name: "Base External Data (Weather, Schools, Housing)",
    table: "base_external_data_cache",
    official_url: "Various APIs",
    update_frequency: "monthly",
    last_updated: new Date(),
    last_checked: new Date(),
    status: "fresh",
    cache_ttl_days: 30,
  },
};

// ============================================================================
// FRESHNESS CHECKING
// ============================================================================

/**
 * Check if a data source is fresh based on update frequency
 */
export function isDataFresh(sourceId: string): boolean {
  const source = DATA_SOURCES[sourceId];
  if (!source) {
    logger.warn(`[Freshness] Unknown data source: ${sourceId}`);
    return false;
  }

  const now = new Date();
  const daysSinceUpdate = (now.getTime() - source.last_updated.getTime()) / (1000 * 60 * 60 * 24);

  // Use cache_ttl_days if set, otherwise use default thresholds
  const threshold = source.cache_ttl_days || FRESHNESS_THRESHOLDS[source.update_frequency];

  const isFresh = daysSinceUpdate < threshold;

  if (!isFresh) {
    logger.info(
      `[Freshness] ${source.name} is stale (${Math.floor(daysSinceUpdate)} days old, threshold: ${threshold})`
    );
  }

  return isFresh;
}

/**
 * Get freshness status for a data source
 */
export function getDataSourceStatus(sourceId: string): "fresh" | "stale" | "expired" | "unknown" {
  const source = DATA_SOURCES[sourceId];
  if (!source) return "unknown";

  const now = new Date();
  const daysSinceUpdate = (now.getTime() - source.last_updated.getTime()) / (1000 * 60 * 60 * 24);
  const threshold = source.cache_ttl_days || FRESHNESS_THRESHOLDS[source.update_frequency];

  if (daysSinceUpdate < threshold) {
    return "fresh";
  } else if (daysSinceUpdate < threshold * 1.5) {
    return "stale";
  } else {
    return "expired";
  }
}

/**
 * Default freshness thresholds by update frequency
 */
const FRESHNESS_THRESHOLDS: Record<UpdateFrequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  annually: 365,
};

// ============================================================================
// REFRESH SCHEDULING
// ============================================================================

export interface RefreshTask {
  sourceId: string;
  priority: "high" | "medium" | "low";
  scheduledAt: Date;
  reason: "stale" | "expired" | "requested";
}

// In-memory queue (in production, use Redis or database)
const refreshQueue: RefreshTask[] = [];

/**
 * Schedule a data refresh
 */
export function scheduleDataRefresh(
  sourceId: string,
  priority: "high" | "medium" | "low" = "medium",
  reason: "stale" | "expired" | "requested" = "stale"
): void {
  const source = DATA_SOURCES[sourceId];
  if (!source) {
    logger.warn(`[Refresh] Cannot schedule unknown source: ${sourceId}`);
    return;
  }

  // Check if already queued
  const existing = refreshQueue.find((task) => task.sourceId === sourceId);
  if (existing) {
    logger.info(`[Refresh] ${source.name} already queued, updating priority`);
    existing.priority = priority;
    return;
  }

  refreshQueue.push({
    sourceId,
    priority,
    scheduledAt: new Date(),
    reason,
  });

  logger.info(
    `[Refresh] Scheduled ${source.name} for refresh (priority: ${priority}, reason: ${reason})`
  );
}

/**
 * Get next refresh task from queue
 */
export function getNextRefreshTask(): RefreshTask | null {
  if (refreshQueue.length === 0) return null;

  // Sort by priority (high -> medium -> low), then by scheduledAt
  refreshQueue.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.scheduledAt.getTime() - b.scheduledAt.getTime();
  });

  return refreshQueue.shift() || null;
}

/**
 * Mark data source as updated
 */
export function markDataSourceUpdated(sourceId: string): void {
  const source = DATA_SOURCES[sourceId];
  if (!source) return;

  source.last_updated = new Date();
  source.last_checked = new Date();
  source.status = "fresh";

  logger.info(`[Freshness] ${source.name} marked as updated`);
}

// ============================================================================
// BATCH FRESHNESS CHECK
// ============================================================================

/**
 * Check freshness of all data sources
 * Returns list of sources that need refresh
 */
export function checkAllDataSources(): {
  fresh: string[];
  stale: string[];
  expired: string[];
} {
  const fresh: string[] = [];
  const stale: string[] = [];
  const expired: string[] = [];

  for (const [sourceId, source] of Object.entries(DATA_SOURCES)) {
    const status = getDataSourceStatus(sourceId);

    switch (status) {
      case "fresh":
        fresh.push(sourceId);
        break;
      case "stale":
        stale.push(sourceId);
        scheduleDataRefresh(sourceId, "medium", "stale");
        break;
      case "expired":
        expired.push(sourceId);
        scheduleDataRefresh(sourceId, "high", "expired");
        break;
    }
  }

  return { fresh, stale, expired };
}

/**
 * Get summary of data source freshness for admin dashboard
 */
export function getDataSourceSummary(): {
  total: number;
  fresh: number;
  stale: number;
  expired: number;
  sources: Array<{
    id: string;
    name: string;
    status: string;
    daysSinceUpdate: number;
    nextUpdate: string;
  }>;
} {
  const sources = Object.values(DATA_SOURCES).map((source) => {
    const daysSinceUpdate = Math.floor(
      (Date.now() - source.last_updated.getTime()) / (1000 * 60 * 60 * 24)
    );

    const threshold = source.cache_ttl_days || FRESHNESS_THRESHOLDS[source.update_frequency];
    const nextUpdateDate = new Date(
      source.last_updated.getTime() + threshold * 24 * 60 * 60 * 1000
    );

    return {
      id: source.id,
      name: source.name,
      status: getDataSourceStatus(source.id),
      daysSinceUpdate,
      nextUpdate: nextUpdateDate.toISOString().split("T")[0],
    };
  });

  const statusCounts = sources.reduce(
    (acc, s) => {
      acc[s.status as "fresh" | "stale" | "expired"]++;
      return acc;
    },
    { fresh: 0, stale: 0, expired: 0 }
  );

  return {
    total: sources.length,
    ...statusCounts,
    sources,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { FRESHNESS_THRESHOLDS, refreshQueue };
