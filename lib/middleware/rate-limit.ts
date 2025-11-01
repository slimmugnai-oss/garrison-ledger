/**
 * COMPREHENSIVE RATE LIMITING MIDDLEWARE
 * 
 * Enforces tier-based rate limits across all API routes to prevent abuse.
 * Works with existing `api_quota` table and `checkAndIncrement` function.
 * 
 * Usage:
 * ```typescript
 * import { enforceRateLimit } from '@/lib/middleware/rate-limit';
 * 
 * export async function POST(req: NextRequest) {
 *   const { userId } = await auth();
 *   if (!userId) throw Errors.unauthorized();
 *   
 *   const tier = await getUserTier(userId);
 *   await enforceRateLimit(userId, '/api/route/name', tier, { free: 10, premium: 100 });
 *   
 *   // ... rest of handler
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import { checkAndIncrement } from '@/lib/limits';
import { logger } from '@/lib/logger';
import { Errors } from '@/lib/api-errors';

export type Tier = 'free' | 'premium' | 'pro' | 'staff';

export interface RateLimitConfig {
  free: number;
  premium: number | null; // null = unlimited
  pro?: number | null;
}

/**
 * Enforce rate limit with tier-based limits
 * Throws Errors.rateLimitExceeded if limit exceeded
 */
export async function enforceRateLimit(
  userId: string,
  route: string,
  tier: Tier,
  limits: RateLimitConfig
): Promise<{ count: number; remaining: number }> {
  
  // Map tier to limit
  let limit: number;
  if (tier === 'staff' || tier === 'pro') {
    limit = limits.pro ?? limits.premium ?? 999999;
  } else if (tier === 'premium') {
    limit = limits.premium ?? 999999;
  } else {
    limit = limits.free;
  }

  // Check for unlimited (null = unlimited)
  if (limit === null || limit >= 999999) {
    return { count: 0, remaining: 999999 };
  }

  // Check and increment
  const result = await checkAndIncrement(userId, route, limit);

  if (!result.allowed) {
    logger.warn('[RateLimit] Limit exceeded', {
      userId: userId.substring(0, 8) + '...',
      route,
      tier,
      count: result.count,
      limit
    });

    throw Errors.rateLimitExceeded(
      `Daily limit reached (${result.count}/${limit}). ${tier === 'free' ? 'Upgrade to Premium for higher limits.' : 'Please try again tomorrow.'}`
    );
  }

  const remaining = Math.max(0, limit - result.count);
  
  logger.debug('[RateLimit] Check passed', {
    userId: userId.substring(0, 8) + '...',
    route,
    tier,
    count: result.count,
    limit,
    remaining
  });

  return { count: result.count, remaining };
}

/**
 * Create rate limit headers for API responses
 */
export function rateLimitHeaders(count: number, limit: number, resetDate?: string): Record<string, string> {
  const remaining = Math.max(0, limit - count);
  const reset = resetDate || new Date().toISOString().slice(0, 10); // Today

  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': reset
  };
}

/**
 * IP-based rate limiting for unauthenticated routes
 * Uses simple in-memory cache (production should use Redis/Edge Config)
 */
const ipRateLimitCache = new Map<string, { count: number; resetAt: number }>();

export function enforceIPRateLimit(
  ipAddress: string,
  route: string,
  limitPerHour: number = 100
): { allowed: boolean; remaining: number } {
  
  const now = Date.now();
  const cacheKey = `${ipAddress}:${route}`;
  
  // Get or create entry
  let entry = ipRateLimitCache.get(cacheKey);
  
  // Reset if expired (1 hour)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 3600000 }; // 1 hour from now
    ipRateLimitCache.set(cacheKey, entry);
  }

  // Increment
  entry.count++;

  const allowed = entry.count <= limitPerHour;
  const remaining = Math.max(0, limitPerHour - entry.count);

  if (!allowed) {
    logger.warn('[IPRateLimit] IP limit exceeded', {
      ip: ipAddress.substring(0, 10) + '...',
      route,
      count: entry.count,
      limit: limitPerHour
    });
  }

  return { allowed, remaining };
}

/**
 * Clean up expired IP rate limit entries (call periodically)
 */
export function cleanupIPRateLimitCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of ipRateLimitCache.entries()) {
    if (now > entry.resetAt + 3600000) { // 1 hour past reset
      ipRateLimitCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug('[IPRateLimit] Cache cleaned', { entriesRemoved: cleaned });
  }
}

// Cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupIPRateLimitCache, 600000);
}

/**
 * Recommended rate limits by route category
 */
export const RATE_LIMIT_PRESETS = {
  // AI-powered features (expensive)
  aiHeavy: { free: 3, premium: 50 },
  aiLight: { free: 10, premium: 100 },
  
  // File uploads
  uploadHeavy: { free: 3, premium: null }, // unlimited for premium
  uploadLight: { free: 20, premium: 100 },
  
  // Data queries
  queryLight: { free: 50, premium: 500 },
  queryHeavy: { free: 10, premium: 100 },
  
  // Profile updates
  profileUpdate: { free: 20, premium: 100 },
  
  // Public content
  publicContent: { free: 1000, premium: null },
} as const;

