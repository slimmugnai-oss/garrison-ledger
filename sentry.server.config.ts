/**
 * SENTRY SERVER-SIDE CONFIGURATION
 * 
 * NOTE: Sentry package not yet installed. This file is ready for when you add it.
 * See sentry.client.config.ts for setup instructions.
 */

// @ts-nocheck - Sentry package optional
const sentryServerDSN = process.env.SENTRY_DSN;

if (sentryServerDSN) {
  (async () => {
    try {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: sentryServerDSN,
        environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

        beforeSend(event: any, _hint: any) {
          // Redact database connection strings
          if (event.exception?.values) {
            event.exception.values.forEach((exception: any) => {
              if (exception.value) {
                exception.value = exception.value.replace(/postgres:\/\/[^@]+@[^/]+/g, 'postgres://REDACTED');
                exception.value = exception.value.replace(/Bearer [a-zA-Z0-9._-]+/g, 'Bearer REDACTED');
              }
            });
          }

          // Redact user IDs
          if (event.user?.id) {
            event.user.id = event.user.id.substring(0, 8) + '...';
          }

          return event;
        }
      });

      console.log('[Sentry] Server-side monitoring initialized');
    } catch {
      // Package not installed - silent fail
    }
  })();
}
