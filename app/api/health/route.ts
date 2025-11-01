/**
 * COMPREHENSIVE HEALTH CHECK ENDPOINT
 * 
 * GET /api/health
 * 
 * Monitors all critical systems:
 * - Database connectivity
 * - Storage access
 * - External API health
 * - Authentication service
 * 
 * Used by:
 * - UptimeRobot / BetterStack monitoring
 * - Internal admin dashboard
 * - Incident response validation
 * 
 * Returns:
 * - 200: All systems healthy
 * - 503: One or more systems degraded
 * - 500: Critical failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10 second timeout

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  checks: {
    database: HealthCheck;
    storage: HealthCheck;
    clerk: HealthCheck;
    stripe: HealthCheck;
    gemini: HealthCheck;
  };
  summary: {
    total_checks: number;
    healthy: number;
    degraded: number;
    down: number;
  };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const results: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'healthy' },
      storage: { status: 'healthy' },
      clerk: { status: 'healthy' },
      stripe: { status: 'healthy' },
      gemini: { status: 'healthy' }
    },
    summary: {
      total_checks: 5,
      healthy: 0,
      degraded: 0,
      down: 0
    }
  };

  // ==========================================================================
  // 1. DATABASE HEALTH CHECK
  // ==========================================================================
  try {
    const dbStart = Date.now();
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();

    results.checks.database = {
      status: error ? 'down' : 'healthy',
      response_time_ms: Date.now() - dbStart,
      error: error?.message,
      details: {
        connected: !error,
        test_query: 'SELECT id FROM profiles LIMIT 1'
      }
    };
  } catch (err) {
    results.checks.database = {
      status: 'down',
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }

  // ==========================================================================
  // 2. STORAGE HEALTH CHECK
  // ==========================================================================
  try {
    const storageStart = Date.now();
    
    // List buckets to verify storage API is accessible
    const { data: buckets, error } = await supabaseAdmin
      .storage
      .listBuckets();

    results.checks.storage = {
      status: error ? 'degraded' : 'healthy',
      response_time_ms: Date.now() - storageStart,
      error: error?.message,
      details: {
        buckets_found: buckets?.length || 0,
        bucket_names: buckets?.map(b => b.name) || []
      }
    };
  } catch (err) {
    results.checks.storage = {
      status: 'down',
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }

  // ==========================================================================
  // 3. CLERK HEALTH CHECK (Lightweight - just verify env var)
  // ==========================================================================
  try {
    const clerkPublicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    results.checks.clerk = {
      status: (clerkPublicKey && clerkSecretKey) ? 'healthy' : 'down',
      details: {
        public_key_set: !!clerkPublicKey,
        secret_key_set: !!clerkSecretKey,
        key_prefix: clerkPublicKey?.substring(0, 7) + '...'
      }
    };
  } catch (err) {
    results.checks.clerk = {
      status: 'down',
      error: 'Configuration error'
    };
  }

  // ==========================================================================
  // 4. STRIPE HEALTH CHECK (Lightweight - verify env var)
  // ==========================================================================
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    results.checks.stripe = {
      status: (stripeKey && stripeWebhookSecret) ? 'healthy' : 'down',
      details: {
        secret_key_set: !!stripeKey,
        webhook_secret_set: !!stripeWebhookSecret,
        key_prefix: stripeKey?.substring(0, 7) + '...'
      }
    };
  } catch (err) {
    results.checks.stripe = {
      status: 'down',
      error: 'Configuration error'
    };
  }

  // ==========================================================================
  // 5. GEMINI API HEALTH CHECK (Lightweight - verify env var)
  // ==========================================================================
  try {
    const geminiKey = process.env.GEMINI_API_KEY;

    results.checks.gemini = {
      status: geminiKey ? 'healthy' : 'degraded',
      details: {
        api_key_set: !!geminiKey,
        key_prefix: geminiKey?.substring(0, 10) + '...'
      }
    };
  } catch (err) {
    results.checks.gemini = {
      status: 'degraded',
      error: 'AI features may be unavailable'
    };
  }

  // ==========================================================================
  // 6. CALCULATE SUMMARY
  // ==========================================================================
  Object.values(results.checks).forEach(check => {
    if (check.status === 'healthy') results.summary.healthy++;
    else if (check.status === 'degraded') results.summary.degraded++;
    else results.summary.down++;
  });

  // Set overall status
  if (results.summary.down > 0) {
    results.status = 'critical';
  } else if (results.summary.degraded > 0) {
    results.status = 'degraded';
  } else {
    results.status = 'healthy';
  }

  // ==========================================================================
  // 7. LOG IF UNHEALTHY
  // ==========================================================================
  const totalTime = Date.now() - startTime;

  if (results.status !== 'healthy') {
    logger.error('[Health Check] System degraded or down', {
      status: results.status,
      summary: results.summary,
      unhealthy_systems: Object.entries(results.checks)
        .filter(([_, check]) => check.status !== 'healthy')
        .map(([name, check]) => ({ name, status: check.status, error: check.error }))
    });

    // Create system alert
    try {
      await supabaseAdmin.from('system_alerts').insert({
        severity: results.status === 'critical' ? 'critical' : 'high',
        category: 'system',
        message: `Health check failed: ${results.status}`,
        details: {
          unhealthy_systems: Object.keys(results.checks).filter(
            key => results.checks[key as keyof typeof results.checks].status !== 'healthy'
          ),
          timestamp: results.timestamp
        }
      });
    } catch {
      // Best-effort alerting
    }
  } else {
    logger.info('[Health Check] All systems healthy', { 
      response_time_ms: totalTime 
    });
  }

  // ==========================================================================
  // 8. RETURN RESPONSE
  // ==========================================================================
  const statusCode = results.status === 'healthy' ? 200 : 503;

  return NextResponse.json(results, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': results.status,
      'X-Response-Time': String(totalTime)
    }
  });
}

