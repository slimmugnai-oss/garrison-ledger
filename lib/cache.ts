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
    // Use base_external_data_cache (the table that actually exists)
    const { data, error } = await supabaseAdmin
      .from('base_external_data_cache')
      .select('data, created_at') // Column is created_at not cached_at
      .eq('base_id', key) // Column is base_id not key
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
      .from('base_external_data_cache')
      .upsert({
        base_id: key, // Use base_id column
        data: wrappedPayload,
        created_at: new Date().toISOString(), // Column is created_at not cached_at
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'base_id'
      });

    if (error) {
    }

  } catch (error) {
  }
}

/**
 * Delete cache entry
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('base_external_data_cache')
      .delete()
      .eq('base_id', key);
  } catch (error) {
  }
}

/**
 * Delete all cache entries matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('base_external_data_cache')
      .delete()
      .ilike('base_id', `${pattern}%`);
  } catch (error) {
  }
}

