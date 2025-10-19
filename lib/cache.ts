/**
 * CACHE UTILITIES
 * 
 * Simple cache helpers for external_cache table
 * Reused across Base Navigator, Intel Library, etc.
 */

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Get cached value
 * Returns null if not found or expired
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('external_cache')
      .select('data, cached_at')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Check if we have payload (old schema) or data (new schema)
    const payload = data.data || (data as any).payload;
    
    if (!payload) {
      return null;
    }

    // If payload has expiresAt, check expiration
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    // Return the value (handle both wrapped and unwrapped formats)
    return (payload.value !== undefined ? payload.value : payload) as T;

  } catch (error) {
    console.error('[Cache] getCache error:', error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function setCache<T>(key: string, payload: T, ttlSeconds: number): Promise<void> {
  try {
    const now = Date.now();
    const expiresAt = now + (ttlSeconds * 1000);

    // Wrap payload with expiration metadata
    const wrappedPayload = {
      value: payload,
      cachedAt: now,
      expiresAt
    };

    const { error } = await supabaseAdmin
      .from('external_cache')
      .upsert({
        key,
        data: wrappedPayload,
        cached_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('[Cache] setCache error:', error);
    }

  } catch (error) {
    console.error('[Cache] setCache error:', error);
  }
}

/**
 * Delete cache entry
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('external_cache')
      .delete()
      .eq('key', key);
  } catch (error) {
    console.error('[Cache] deleteCache error:', error);
  }
}

/**
 * Delete all cache entries matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('external_cache')
      .delete()
      .ilike('key', `${pattern}%`);
  } catch (error) {
    console.error('[Cache] deleteCachePattern error:', error);
  }
}

