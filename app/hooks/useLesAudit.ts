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

"use client";

import { useState, useEffect, useCallback } from "react";
import type { MaskedAuditResult } from "@/lib/les/paywall";

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
export function useLesAudit(inputs: AuditInputs, enabled: boolean = true): LesAuditHookResult {
  const [result, setResult] = useState<MaskedAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced effect - recompute on input changes
  useEffect(() => {
    if (!enabled) {
      setResult(null);
      return;
    }

    // Check if we have minimum required data
    if (!inputs.month || !inputs.year || !inputs.profile) {
      setResult(null);
      return;
    }

    // Debounce: wait 400ms after last input change
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      // Retry logic
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const response = await fetch("/api/les/audit/compute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              month: inputs.month,
              year: inputs.year,
              profile: inputs.profile,
              actual: inputs.actual,
              net_pay_cents: inputs.net_pay_cents,
            }),
          });

          if (!response.ok) {
            // Retry on 500 errors
            if (response.status >= 500 && retryCount < maxRetries) {
              console.log(`[useLesAudit] Retrying (attempt ${retryCount + 1})...`);
              await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
              retryCount++;
              continue;
            }

            if (response.status === 402) {
              const data = await response.json();
              setError(data.message || "Upgrade required");
            } else {
              setError(`Audit failed (${response.status}). Please try again.`);
            }
            setResult(null);
            break;
          }

          const data = await response.json();
          setResult(data);
          break; // Success, exit retry loop
        } catch (err) {
          // Network errors - retry once
          if (retryCount < 1) {
            console.log("[useLesAudit] Network error, retrying...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retryCount++;
            continue;
          }

          console.error("[useLesAudit] Computation error:", err);
          setError("Network error. Please check your connection and try again.");
          setResult(null);
          break;
        }
      }

      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputs, enabled]);

  // Manual recompute function
  const recompute = useCallback(() => {
    // Trigger by creating a new inputs reference
    setResult(null);
    setLoading(true);
  }, []);

  return { result, loading, error, recompute };
}
