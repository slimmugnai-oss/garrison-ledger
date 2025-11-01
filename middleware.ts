import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes should be protected (require authentication)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)", // Protect /dashboard and all its sub-routes (includes /profile, /assessment, /referrals)
  "/profile(.*)", // Protect /profile and all its sub-routes
  "/settings(.*)", // Protect /settings and all its sub-routes
]);

// IP rate limiting cache (in-memory for edge runtime)
const ipRateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * IP-based rate limiting for unauthenticated routes
 * Prevents bot spam, DDoS, and abuse
 */
function checkIPRateLimit(req: NextRequest): { allowed: boolean; remaining: number } {
  // Get IP address
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
              req.headers.get('x-real-ip') || 
              'unknown';
  
  // Skip rate limiting for localhost in development
  if (process.env.NODE_ENV === 'development' && (ip === '127.0.0.1' || ip === '::1')) {
    return { allowed: true, remaining: 999 };
  }

  const now = Date.now();
  const cacheKey = `${ip}:${req.nextUrl.pathname}`;
  
  // Get or create entry
  let entry = ipRateLimitCache.get(cacheKey);
  
  // Reset if expired (1 hour window)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 3600000 }; // 1 hour from now
    ipRateLimitCache.set(cacheKey, entry);
  }

  // Increment counter
  entry.count++;

  // Different limits for different route types
  let limit = 100; // Default: 100 requests/hour
  
  if (req.nextUrl.pathname.startsWith('/api/')) {
    limit = 50; // API routes: 50/hour for unauthenticated
  }

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return { allowed, remaining };
}

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of ipRateLimitCache.entries()) {
      if (now > entry.resetAt + 3600000) { // 1 hour past reset
        ipRateLimitCache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[IPRateLimit] Cleaned ${cleaned} expired entries`);
    }
  }, 600000); // 10 minutes
}

export default clerkMiddleware(async (auth, req) => {
  // IP-based rate limiting for all routes (especially unauthenticated)
  const ipRateLimit = checkIPRateLimit(req);
  
  if (!ipRateLimit.allowed) {
    console.warn('[Middleware] IP rate limit exceeded', {
      ip: req.headers.get('x-forwarded-for')?.substring(0, 15) + '...',
      path: req.nextUrl.pathname
    });
    
    return new NextResponse(JSON.stringify({
      error: 'Too many requests from this IP address. Please try again later.'
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '3600', // 1 hour
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0'
      }
    });
  }

  // Capture referral code from URL and store in cookie
  const url = req.nextUrl;
  const refCode = url.searchParams.get("ref");

  if (refCode) {
    const response = NextResponse.next();
    // Store referral code in cookie for 30 days
    response.cookies.set("ref_code", refCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
