import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes should be protected (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',  // Protect /dashboard and all its sub-routes
  '/profile(.*)',    // Protect /profile and all its sub-routes
  '/settings(.*)',   // Protect /settings and all its sub-routes
]);

export default clerkMiddleware((auth, req) => {
  // If the current route is protected and user is not authenticated
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
