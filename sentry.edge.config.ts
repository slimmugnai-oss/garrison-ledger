/**
 * SENTRY EDGE RUNTIME CONFIGURATION
 * 
 * For middleware and edge functions
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,

    // Minimal config for edge runtime
    beforeSend(event) {
      // Redact sensitive data
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/user_[a-zA-Z0-9]+/g, 'user_REDACTED');
      }
      return event;
    }
  });
}

