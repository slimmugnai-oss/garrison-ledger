/**
 * SENTRY SERVER-SIDE CONFIGURATION
 * 
 * Captures server-side errors, API errors, and database errors.
 * 
 * Setup: Same as client config - DSN shared between client/server
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',

    // Sample rate (lower for server to reduce costs)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

    // Server-side only integrations
    integrations: [
      // No replay on server
    ],

    // Filter sensitive data from server errors
    beforeSend(event, hint) {
      // Redact database connection strings
      if (event.exception?.values) {
        event.exception.values.forEach(exception => {
          if (exception.value) {
            exception.value = exception.value.replace(
              /postgres:\/\/[^@]+@[^/]+/g,
              'postgres://REDACTED@REDACTED'
            );
            exception.value = exception.value.replace(
              /Bearer [a-zA-Z0-9._-]+/g,
              'Bearer REDACTED'
            );
          }
        });
      }

      // Redact sensitive context
      if (event.contexts) {
        // Remove full request body if it exists
        if (event.contexts.request) {
          delete event.contexts.request.data;
        }
      }

      // Redact user IDs (show first 8 chars only)
      if (event.user?.id) {
        event.user.id = event.user.id.substring(0, 8) + '...';
      }

      if (event.tags?.user_id) {
        event.tags.user_id = event.tags.user_id.substring(0, 8) + '...';
      }

      return event;
    },

    // Ignore expected/handled errors
    ignoreErrors: [
      // Clerk webhook verification (handled gracefully)
      'Signature verification failed',
      // Expected rate limiting
      'Rate limit exceeded',
      // Expected quota exceeded
      'Premium required',
      // Expected not found
      'Not found',
    ],

    // Add server-specific tags
    initialScope: {
      tags: {
        app: 'garrison-ledger',
        component: 'server',
        runtime: 'nodejs'
      }
    }
  });

  logger.info('[Sentry] Server-side monitoring initialized');
} else {
  logger.warn('[Sentry] No DSN configured - error monitoring disabled');
}

