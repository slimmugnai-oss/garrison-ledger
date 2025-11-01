/**
 * NEXT.JS INSTRUMENTATION
 * 
 * Runs once when the Next.js server starts (before any requests).
 * Perfect for startup validation, monitoring setup, etc.
 * 
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { enforceEnvironmentValidation } from './lib/env-validation';

export async function register() {
  // Only run on server (not edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Starting Garrison Ledger server...');
    
    // Validate environment variables
    enforceEnvironmentValidation();
    
    // TODO: Initialize Sentry in production
    // if (process.env.NODE_ENV === 'production') {
    //   const Sentry = await import('@sentry/nextjs');
    //   Sentry.init({ dsn: process.env.SENTRY_DSN });
    // }
    
    console.log('✅ Server initialization complete\n');
  }
}

