import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define which routes should be protected (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',  // Protect /dashboard and all its sub-routes (includes /profile, /assessment, /referrals)
  '/profile(.*)',    // Protect /profile and all its sub-routes
  '/settings(.*)',   // Protect /settings and all its sub-routes
]);

export default clerkMiddleware((auth, req) => {
  // Capture referral code from URL and store in cookie
  const url = req.nextUrl;
  const refCode = url.searchParams.get('ref');
  
  if (refCode) {
    const response = NextResponse.next();
    // Store referral code in cookie for 30 days
    response.cookies.set('ref_code', refCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
