/**
 * DYNAMIC DATA FETCH & CACHE
 * 
 * Handles caching layer for dynamic data using external_cache table
 * Implements TTL-based cache invalidation and refresh logic
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { CacheEntry, ResolvedData } from './types';

/**
 * Get cached data or fetch fresh
 * Uses external_cache table for persistence
 */
export async function getCached<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  try {
    // Try cache first
    const cached = await readCache<T>(cacheKey);
    
    if (cached) {
      const now = Date.now();
      if (cached.expiresAt > now) {
        // Cache hit and not expired
        return { data: cached.value, fromCache: true };
      }
    }

    // Cache miss or expired - fetch fresh
    const freshData = await fetchFn();
    
    // Write to cache
    await writeCache(cacheKey, freshData, ttlSeconds);
    
    return { data: freshData, fromCache: false };

  } catch (error) {
    console.error('[Fetch] getCached error:', error);
    // On cache error, try to fetch fresh
    const freshData = await fetchFn();
    return { data: freshData, fromCache: false };
  }
}

/**
 * Read from cache (external_cache table)
 */
async function readCache<T>(cacheKey: string): Promise<CacheEntry<T> | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('external_cache')
      .select('data')
      .eq('key', cacheKey)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Parse cached data
    const entry = data.data as CacheEntry<T>;
    
    if (!entry || !entry.value) {
      return null;
    }

    return entry;

  } catch (error) {
    console.error('[Fetch] readCache error:', error);
    return null;
  }
}

/**
 * Write to cache (external_cache table)
 */
async function writeCache<T>(
  cacheKey: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      cachedAt: now,
      expiresAt: now + (ttlSeconds * 1000)
    };

    // Upsert to external_cache
    const { error } = await supabaseAdmin
      .from('external_cache')
      .upsert({
        key: cacheKey,
        data: entry,
        cached_at: new Date(now).toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('[Fetch] writeCache error:', error);
    }

  } catch (error) {
    console.error('[Fetch] writeCache error:', error);
  }
}

/**
 * Invalidate cache for a specific key
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('external_cache')
      .delete()
      .eq('key', cacheKey);
  } catch (error) {
    console.error('[Fetch] invalidateCache error:', error);
  }
}

/**
 * Invalidate all caches matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    // Get all keys matching pattern
    const { data, error } = await supabaseAdmin
      .from('external_cache')
      .select('key')
      .ilike('key', `${pattern}%`);

    if (error || !data) {
      return;
    }

    // Delete all matching keys
    const keys = data.map(row => row.key);
    if (keys.length > 0) {
      await supabaseAdmin
        .from('external_cache')
        .delete()
        .in('key', keys);
    }

  } catch (error) {
    console.error('[Fetch] invalidateCachePattern error:', error);
  }
}

/**
 * Generate cache key for DataRef params
 */
export function generateCacheKey(params: {
  source: string;
  code?: string;
  paygrade?: string;
  withDeps?: boolean;
  field?: string;
}): string {
  const parts = [
    `data:${params.source}`,
    params.code && `code:${params.code}`,
    params.paygrade && `grade:${params.paygrade}`,
    params.withDeps !== undefined && `deps:${params.withDeps}`,
    params.field && `field:${params.field}`
  ].filter(Boolean);

  return parts.join(':');
}

/**
 * Refresh all data for a source
 * Called by cron jobs to preemptively refresh stale data
 */
export async function refreshSourceData(source: string): Promise<{
  refreshed: number;
  errors: number;
}> {
  let refreshed = 0;
  let errors = 0;

  try {
    // Get feed config
    const { data: feed } = await supabaseAdmin
      .from('dynamic_feeds')
      .select('*')
      .eq('source_key', source)
      .maybeSingle();

    if (!feed) {
      console.warn(`[Fetch] No feed config for ${source}`);
      return { refreshed: 0, errors: 1 };
    }

    // Invalidate all caches for this source
    await invalidateCachePattern(`data:${source}`);

    // Update feed status
    await supabaseAdmin
      .from('dynamic_feeds')
      .update({
        last_refresh_at: new Date().toISOString(),
        status: 'ok',
        updated_at: new Date().toISOString()
      })
      .eq('source_key', source);

    refreshed = 1;

  } catch (error) {
    console.error(`[Fetch] refreshSourceData error for ${source}:`, error);
    
    // Update feed status to error
    await supabaseAdmin
      .from('dynamic_feeds')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('source_key', source);

    errors = 1;
  }

  return { refreshed, errors };
}

/**
 * Get feed status for all sources
 */
export async function getAllFeedStatuses() {
  try {
    const { data, error } = await supabaseAdmin
      .from('dynamic_feeds')
      .select('*')
      .order('source_key');

    if (error || !data) {
      return [];
    }

    return data.map(feed => ({
      sourceKey: feed.source_key,
      ttlSeconds: feed.ttl_seconds,
      lastRefreshAt: feed.last_refresh_at,
      status: feed.status,
      notes: feed.notes,
      errorMessage: feed.error_message
    }));

  } catch (error) {
    console.error('[Fetch] getAllFeedStatuses error:', error);
    return [];
  }
}

