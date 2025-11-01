/**
 * SENTRY CLIENT-SIDE CONFIGURATION
 * 
 * NOTE: Sentry package not yet installed. This file is ready for when you add it.
 * 
 * Setup Instructions:
 * 1. npm install @sentry/nextjs
 * 2. Create Sentry account: https://sentry.io/signup/
 * 3. Create Next.js project  
 * 4. Add to Vercel: SENTRY_DSN=https://[key]@[project].ingest.sentry.io/[id]
 * 5. Add to Vercel: NEXT_PUBLIC_SENTRY_DSN=(same value)
 * 6. Redeploy
 * 
 * Free Tier: 5,000 events/month
 * 
 * This file will automatically initialize Sentry when package is installed.
 */

// @ts-nocheck - Sentry package optional, installed separately
const sentryDSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Conditional initialization - only if package installed AND DSN configured
if (sentryDSN) {
  (async () => {
    try {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: sentryDSN,
        environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0.5,

        integrations: [
          Sentry.replayIntegration({
            maskAllText: true,
            maskAllInputs: true,
            blockAllMedia: true
          })
        ],

        beforeSend(event: any, _hint: any) {
          // Redact sensitive URLs
          if (event.request?.url) {
            event.request.url = event.request.url.replace(/user_[a-zA-Z0-9]+/g, 'user_REDACTED');
          }

          // Redact breadcrumbs
          if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map((breadcrumb: any) => {
              if (breadcrumb.data) {
                const redactKeys = ['email', 'ssn', 'password', 'token'];
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
        }
      });

      console.log('[Sentry] Client-side monitoring initialized');
    } catch {
      // Package not installed - silent fail
    }
  })();
}
