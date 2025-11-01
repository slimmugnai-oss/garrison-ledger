/**
 * LOGGING UTILITY
 * 
 * Centralized logging with environment-aware behavior and PII sanitization.
 * 
 * Usage:
 * - logger.debug() - Development only, auto-disabled in production
 * - logger.error() - Always logs, should be sent to error tracking service
 * - logger.warn() - Always logs
 * - logger.info() - Always logs
 */

/**
 * Sanitize data for logging by redacting sensitive fields
 * Exported for testing purposes
 */
export function sanitizeForLogging(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitive = ['email', 'ssn', 'password', 'token', 'api_key', 'secret', 'authorization'];

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitive.some(s => lowerKey.includes(s));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  /**
   * Debug logging - only in development
   * Use for temporary debugging or verbose logging
   */
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data ? sanitizeForLogging(data) : '');
    }
  },

  /**
   * Info logging - always logs
   * Use for normal operational events
   */
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data ? sanitizeForLogging(data) : '');
  },

  /**
   * Warning logging - always logs
   * Use for recoverable errors or concerning situations
   */
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data ? sanitizeForLogging(data) : '');
  },

  /**
   * Error logging - always logs
   * Automatically sends to Sentry in production (if configured)
   */
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[ERROR] ${message}`, {
      error: errorMessage,
      stack: errorStack,
      context: context ? sanitizeForLogging(context) : undefined
    });

    // Send to Sentry in production (if configured)
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      // Server-side only (avoid double-reporting)
      import('@sentry/nextjs').then(Sentry => {
        if (Sentry && process.env.SENTRY_DSN) {
          Sentry.captureException(error instanceof Error ? error : new Error(message), {
            contexts: {
              custom: sanitizeForLogging(context) as Record<string, unknown>
            },
            tags: {
              source: context?.source as string || 'unknown',
              severity: 'error'
            },
            extra: {
              message,
              timestamp: new Date().toISOString()
            }
          });
        }
      }).catch(() => {
        // Sentry not installed - silent fail
      });
    }
  }
};

/**
 * API-specific logger for tracking API calls
 */
export function logAPICall(
  route: string, 
  userId: string | null, 
  duration: number,
  statusCode?: number
) {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (CloudWatch, DataDog, etc.)
    // For now, just structured console logging
    logger.info('API Call', {
      route,
      userId: userId ? `user_${userId.substring(0, 8)}` : 'anonymous',
      duration_ms: duration,
      status: statusCode
    });
  } else {
    logger.debug(`API: ${route}`, {
      user: userId ? `${userId.substring(0, 8)}...` : 'anonymous',
      duration: `${duration}ms`,
      status: statusCode
    });
  }
}

export default logger;

