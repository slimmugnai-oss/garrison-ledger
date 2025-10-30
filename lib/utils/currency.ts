/**
 * CURRENCY FORMATTING UTILITIES
 * 
 * Shared currency formatting functions for consistent display across the app
 */

/**
 * Format cents to USD currency string
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format cents to USD currency string with thousands separator
 * @param cents - Amount in cents
 * @returns Formatted currency string with commas (e.g., "$1,234.56")
 */
export function formatCurrencyWithCommas(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Parse currency string to cents
 * @param value - Currency string (e.g., "$1,234.56" or "1234.56")
 * @returns Amount in cents, or null if invalid
 */
export function parseCurrency(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  
  return Math.round(parsed * 100);
}

/**
 * Validate currency amount
 * @param cents - Amount in cents
 * @param min - Minimum allowed (default: 0)
 * @param max - Maximum allowed (default: 99999999 = $999,999.99)
 * @returns True if valid
 */
export function isValidCurrency(cents: number, min = 0, max = 99999999): boolean {
  return !isNaN(cents) && isFinite(cents) && cents >= min && cents <= max;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use formatCurrency instead
 */
export const centsToDoollars = formatCurrency;

