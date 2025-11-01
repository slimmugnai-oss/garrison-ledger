/**
 * SENTRY EDGE RUNTIME CONFIGURATION
 * 
 * For middleware and edge functions
 * NOTE: Package not yet installed - ready for when you add it
 */

// @ts-nocheck - Sentry package optional
const sentryEdgeDSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (sentryEdgeDSN) {
  (async () => {
    try {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: sentryEdgeDSN,
        environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1,

        beforeSend(event: any) {
          if (event.request?.url) {
            event.request.url = event.request.url.replace(/user_[a-zA-Z0-9]+/g, 'user_REDACTED');
          }
          return event;
        }
      });
    } catch {
      // Package not installed - silent fail
    }
  })();
}
