/**
 * ENVIRONMENT VARIABLE VALIDATION
 * 
 * Validates all required environment variables are present and properly formatted.
 * Prevents runtime failures due to missing secrets.
 * 
 * Usage:
 * - Called automatically in instrumentation.ts (Next.js startup)
 * - Can be run manually: node -e "require('./lib/env-validation').validateEnvironment()"
 */

import { logger } from './logger';

/**
 * Environment variable configuration
 */
const ENV_CONFIG = {
  // CRITICAL - App won't work without these
  critical: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ] as const,

  // IMPORTANT - Core features won't work without these
  important: [
    'GEMINI_API_KEY', // AI plan generation, LES OCR
    'NEXT_PUBLIC_SITE_URL', // Email links, OG images
  ] as const,

  // OPTIONAL - Advanced features
  optional: [
    'SENTRY_DSN', // Error monitoring
    'VIRUSTOTAL_API_KEY', // Malware scanning
    'RESEND_WEBHOOK_SECRET', // Email analytics
    'OPENAI_API_KEY', // Future AI features
  ] as const
} as const;

/**
 * Validation results
 */
interface ValidationResult {
  isValid: boolean;
  missing: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  malformed: {
    variable: string;
    reason: string;
  }[];
}

/**
 * Validate an environment variable exists and is non-empty
 */
function checkEnvVar(key: string): boolean {
  const value = process.env[key];
  return value !== undefined && value !== null && value.trim() !== '';
}

/**
 * Validate environment variable format
 */
function validateFormat(key: string, value: string): { valid: boolean; reason?: string } {
  // Supabase URL format
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
    if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
      return { valid: false, reason: 'Must be https://*.supabase.co format' };
    }
  }

  // Clerk publishable key format
  if (key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
    if (!value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
      return { valid: false, reason: 'Must start with pk_test_ or pk_live_' };
    }
  }

  // Clerk secret key format
  if (key === 'CLERK_SECRET_KEY') {
    if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_')) {
      return { valid: false, reason: 'Must start with sk_test_ or sk_live_' };
    }
  }

  // Stripe secret key format
  if (key === 'STRIPE_SECRET_KEY') {
    if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_')) {
      return { valid: false, reason: 'Must start with sk_test_ or sk_live_' };
    }
  }

  // Stripe webhook secret format
  if (key === 'STRIPE_WEBHOOK_SECRET') {
    if (!value.startsWith('whsec_')) {
      return { valid: false, reason: 'Must start with whsec_' };
    }
  }

  // Site URL format
  if (key === 'NEXT_PUBLIC_SITE_URL') {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return { valid: false, reason: 'Must start with http:// or https://' };
    }
  }

  return { valid: true };
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const missing = {
    critical: [] as string[],
    important: [] as string[],
    optional: [] as string[]
  };

  const malformed: { variable: string; reason: string }[] = [];

  // Check critical variables
  ENV_CONFIG.critical.forEach(key => {
    if (!checkEnvVar(key)) {
      missing.critical.push(key);
    } else {
      const value = process.env[key]!;
      const formatCheck = validateFormat(key, value);
      if (!formatCheck.valid) {
        malformed.push({
          variable: key,
          reason: formatCheck.reason || 'Invalid format'
        });
      }
    }
  });

  // Check important variables
  ENV_CONFIG.important.forEach(key => {
    if (!checkEnvVar(key)) {
      missing.important.push(key);
    }
  });

  // Check optional variables
  ENV_CONFIG.optional.forEach(key => {
    if (!checkEnvVar(key)) {
      missing.optional.push(key);
    }
  });

  return {
    isValid: missing.critical.length === 0 && malformed.length === 0,
    missing,
    malformed
  };
}

/**
 * Validate and exit if critical variables missing (production)
 */
export function enforceEnvironmentValidation(): void {
  const result = validateEnvironment();

  if (!result.isValid) {
    console.error('\n❌ ========================================');
    console.error('   ENVIRONMENT VALIDATION FAILED');
    console.error('========================================\n');

    if (result.missing.critical.length > 0) {
      console.error('🔴 CRITICAL: Missing required environment variables:');
      result.missing.critical.forEach(key => {
        console.error(`   - ${key}`);
      });
      console.error('');
    }

    if (result.malformed.length > 0) {
      console.error('🔴 CRITICAL: Malformed environment variables:');
      result.malformed.forEach(({ variable, reason }) => {
        console.error(`   - ${variable}: ${reason}`);
      });
      console.error('');
    }

    if (result.missing.important.length > 0) {
      console.error('🟡 WARNING: Missing important environment variables:');
      result.missing.important.forEach(key => {
        console.error(`   - ${key}`);
      });
      console.error('');
    }

    console.error('📖 See: docs/guides/ENV_SETUP.md for setup instructions\n');

    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 PRODUCTION MODE: Exiting to prevent runtime failures\n');
      process.exit(1);
    } else {
      console.error('🔧 DEVELOPMENT MODE: Continuing, but expect errors\n');
    }
  } else {
    logger.info('✅ Environment validation passed', {
      critical: ENV_CONFIG.critical.length,
      important: ENV_CONFIG.important.length,
      optional: ENV_CONFIG.optional.length
    });

    if (result.missing.optional.length > 0) {
      logger.warn('ℹ️  Optional features disabled (missing env vars)', {
        missing: result.missing.optional
      });
    }
  }
}

/**
 * Check specific variable for conditional logic
 */
export function hasEnvVar(key: string): boolean {
  return checkEnvVar(key);
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback || '';
}

/**
 * Mask secret for logging (show first 4 chars + "****_" + last 4 chars)
 */
export function maskSecret(secret: string): string {
  if (secret.length < 12) {
    return '****';
  }
  const prefix = secret.substring(0, 4);
  const suffix = secret.substring(secret.length - 4);
  return `${prefix}****_${suffix}`;
}

/**
 * Get environment summary for debugging (safe to log)
 */
export function getEnvironmentSummary(): Record<string, string> {
  const summary: Record<string, string> = {};

  [...ENV_CONFIG.critical, ...ENV_CONFIG.important, ...ENV_CONFIG.optional].forEach(key => {
    const value = process.env[key];
    if (value) {
      summary[key] = maskSecret(value);
    } else {
      summary[key] = 'NOT_SET';
    }
  });

  return summary;
}

/**
 * Runtime check - throws if variable missing
 */
export function requireEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    logger.error(`Missing required environment variable: ${key}`);
    throw new Error(`${key} is required but not set`);
  }
  return value;
}

