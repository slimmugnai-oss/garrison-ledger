/**
 * Utility functions
 */

/**
 * Conditional classNames helper
 * Combines class names, filtering out falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

