/**
 * CIRCUIT BREAKER MONITORING ENDPOINT
 * 
 * GET /api/admin/circuit-breakers
 * 
 * Returns current state of all circuit breakers for admin dashboard.
 * Shows which external APIs are healthy, degraded, or down.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { getAllCircuitBreakerStats, resetAllCircuitBreakers } from '@/lib/circuit-breaker';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    // TODO: Add admin role check
    // For now, any authenticated user can view (for debugging)

    const stats = getAllCircuitBreakerStats();
    
    logger.info('[CircuitBreakers] Stats requested', {
      userId: userId.substring(0, 8) + '...'
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      circuits: stats,
      summary: {
        total: Object.keys(stats).length,
        healthy: Object.values(stats).filter(s => s.state === 'CLOSED').length,
        degraded: Object.values(stats).filter(s => s.state === 'HALF_OPEN').length,
        down: Object.values(stats).filter(s => s.state === 'OPEN').length
      }
    });

  } catch (error) {
    logger.error('[CircuitBreakers] Error fetching stats', error);
    return errorResponse(error);
  }
}

/**
 * Reset all circuit breakers (admin operation)
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    // TODO: Add admin role check

    resetAllCircuitBreakers();

    logger.info('[CircuitBreakers] All circuits manually reset', {
      userId: userId.substring(0, 8) + '...'
    });

    return NextResponse.json({
      success: true,
      message: 'All circuit breakers reset to CLOSED state'
    });

  } catch (error) {
    logger.error('[CircuitBreakers] Error resetting circuits', error);
    return errorResponse(error);
  }
}

