/**
 * API ROUTE MIDDLEWARE
 * 
 * Standardized authentication and error handling for API routes
 * Eliminates duplicate auth checks across routes
 * 
 * Usage:
 * ```typescript
 * export const POST = withAuth(async (req, userId) => {
 *   // userId is guaranteed to exist here
 *   const body = await req.json();
 *   // ... handle request
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { Errors, errorResponse } from '@/lib/api-errors';

/**
 * Authenticated route handler type
 */
export type AuthenticatedHandler = (
  req: NextRequest,
  userId: string
) => Promise<NextResponse>;

/**
 * Middleware to enforce authentication on API routes
 * 
 * @param handler - Function that handles the authenticated request
 * @returns Next.js API route handler
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        throw Errors.unauthorized();
      }

      return await handler(req, userId);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Optional authentication - provides userId if available, but doesn't require it
 */
export type OptionalAuthHandler = (
  req: NextRequest,
  userId: string | null
) => Promise<NextResponse>;

export function withOptionalAuth(handler: OptionalAuthHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { userId } = await auth();
      return await handler(req, userId);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

