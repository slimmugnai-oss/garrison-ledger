/**
 * TDY UTILITIES
 * 
 * Shared utility functions for TDY Copilot
 */

import { supabaseAdmin } from '@/lib/supabase';
import { ssot } from '@/lib/ssot';

/**
 * Get current mileage rate in cents per mile
 * Reads from config_constants or falls back to SSOT
 */
export async function getMileageRateCents(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('config_constants')
      .select('value')
      .eq('key', 'mileage_cents_per_mile')
      .maybeSingle();

    if (error || !data) {
      console.warn('[TDY Util] Using fallback mileage rate from SSOT');
      return ssot.constants?.mileageCentsPerMileFallback || 67;
    }

    return data.value?.cents || 67;
    
  } catch (error) {
    console.error('[TDY Util] Error fetching mileage rate:', error);
    return 67; // Fallback
  }
}

/**
 * Normalize locality string (ZIP or City, State)
 */
export function normalizeLocality(input: string): string {
  const trimmed = input.trim();

  // Check if it's a ZIP code (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    return `ZIP:${trimmed}`;
  }

  // Otherwise treat as City, State
  return `CITY:${trimmed.toUpperCase()}`;
}

/**
 * Parse date from various formats to YYYY-MM-DD
 */
export function parseDate(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return null;
    }
    return d.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Format cents as USD
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
}

/**
 * Calculate days between dates (inclusive)
 */
export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Inclusive
}

/**
 * Get all dates in range (inclusive)
 */
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

