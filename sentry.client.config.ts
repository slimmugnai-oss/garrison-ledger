/**
 * SENTRY CLIENT-SIDE CONFIGURATION
 * 
 * Captures client-side errors, React errors, and performance data.
 * 
 * Setup:
 * 1. Create Sentry account: https://sentry.io/signup/
 * 2. Create new Next.js project
 * 3. Copy DSN to Vercel: SENTRY_DSN=https://[key]@[project].ingest.sentry.io/[id]
 * 4. Deploy
 * 
 * Free Tier: 5,000 events/month (sufficient for most apps)
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',

    // Adjust sample rate for production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (optional - privacy considerations)
    replaysSessionSampleRate: 0, // Disabled - may capture sensitive military data
    replaysOnErrorSampleRate: 0.5, // Capture 50% of sessions with errors

    // Don't capture console.log as breadcrumbs (reduce noise)
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true, // Mask all text to protect PII
        maskAllInputs: true, // Mask form inputs
        blockAllMedia: true // Block images/video
      })
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Redact sensitive URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/user_[a-zA-Z0-9]+/g, 'user_REDACTED');
        event.request.url = event.request.url.replace(/tok_[a-zA-Z0-9]+/g, 'tok_REDACTED');
      }

      // Redact sensitive breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            // Redact common PII fields
            const redactKeys = ['email', 'ssn', 'password', 'token', 'api_key', 'secret'];
            redactKeys.forEach(key => {
              if (breadcrumb.data && key in breadcrumb.data) {
                breadcrumb.data[key] = '[REDACTED]';
              }
            });
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Ignore expected errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'canvas.contentDocument',
      // Network errors (users going offline)
      'Network request failed',
      'Failed to fetch',
      // Known Clerk errors (handled gracefully)
      'Clerk: ',
    ],

    // Add custom tags
    initialScope: {
      tags: {
        app: 'garrison-ledger',
        component: 'client'
      }
    }
  });

  logger.info('[Sentry] Client-side monitoring initialized');
} else {
  logger.warn('[Sentry] No DSN configured - error monitoring disabled');
}

