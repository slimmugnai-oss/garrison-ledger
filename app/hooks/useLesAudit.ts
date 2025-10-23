/**
 * USE LES AUDIT HOOK
 * 
 * React hook for real-time LES audit computation with debouncing.
 * Calls /api/les/audit/compute on every input change (400ms debounce).
 * 
 * Features:
 * - Debounced API calls (400ms)
 * - Loading states
 * - Error handling
 * - Automatic recomputation on input changes
 * 
 * Usage:
 * ```tsx
 * const { result, loading, error } = useLesAudit(inputs);
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MaskedAuditResult } from '@/lib/les/paywall';

export interface AuditInputs {
  month: number | null;
  year: number | null;
  profile: {
    paygrade: string;
    yos: number;
    mhaOrZip: string;
    withDependents: boolean;
    specials?: {
      sdap?: boolean;
      hfp?: boolean;
      fsa?: boolean;
      flpp?: boolean;
    };
  } | null;
  actual: {
    allowances: Array<{ code: string; amount_cents: number }>;
    taxes: Array<{ code: string; amount_cents: number }>;
    deductions: Array<{ code: string; amount_cents: number }>;
    allotments?: Array<{ code: string; amount_cents: number }>;
    debts?: Array<{ code: string; amount_cents: number }>;
    adjustments?: Array<{ code: string; amount_cents: number }>;
  };
  net_pay_cents?: number;
}

export interface LesAuditHookResult {
  result: MaskedAuditResult | null;
  loading: boolean;
  error: string | null;
  recompute: () => void;
}

/**
 * Real-time LES audit computation hook
 * 
 * Automatically recomputes audit on input changes with 400ms debounce
 * 
 * @param inputs - Audit input data
 * @param enabled - Whether to run computation (default: true)
 * @returns Audit result, loading state, and error
 */
export function useLesAudit(
  inputs: AuditInputs,
  enabled: boolean = true
): LesAuditHookResult {
  const [result, setResult] = useState<MaskedAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute function
  const compute = useCallback(async () => {
    // Check if we have minimum required data
    if (!inputs.month || !inputs.year || !inputs.profile) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/les/audit/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: inputs.month,
          year: inputs.year,
          profile: inputs.profile,
          actual: inputs.actual,
          net_pay_cents: inputs.net_pay_cents
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          setError(data.message || 'Upgrade required');
        } else {
          setError('Failed to compute audit');
        }
        setResult(null);
        return;
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error('[useLesAudit] Computation error:', err);
      setError('Network error. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [inputs]);

  // Debounced effect - recompute on input changes
  useEffect(() => {
    if (!enabled) {
      setResult(null);
      return;
    }

    // Debounce: wait 400ms after last input change
    const timer = setTimeout(() => {
      compute();
    }, 400);

    return () => clearTimeout(timer);
  }, [inputs, enabled, compute]);

  // Manual recompute function
  const recompute = useCallback(() => {
    compute();
  }, [compute]);

  return { result, loading, error, recompute };
}

