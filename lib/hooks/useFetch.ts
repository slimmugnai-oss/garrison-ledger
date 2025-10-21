/**
 * CUSTOM FETCH HOOK
 * 
 * Reusable hook for data fetching with loading/error states
 * Eliminates duplicate fetch patterns across components
 * 
 * Usage:
 * ```tsx
 * const { data, loading, error, refetch } = useFetch<UserProfile>('/api/profile');
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseFetchOptions extends RequestInit {
  /**
   * Whether to fetch immediately on mount (default: true)
   */
  immediate?: boolean;
  
  /**
   * Dependencies for refetching (like useEffect deps)
   */
  deps?: unknown[];
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch hook with automatic loading/error state management
 */
export function useFetch<T = unknown>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { immediate = true, deps = [], ...fetchOptions } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, ...deps]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Variant for POST requests with manual trigger
 */
export function usePost<TData = unknown, TBody = unknown>(
  url: string,
  options: Omit<RequestInit, 'method' | 'body'> = {}
): {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  execute: (body: TBody) => Promise<void>;
} {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (body: TBody) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err; // Re-throw for caller to handle
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return {
    data,
    loading,
    error,
    execute
  };
}

