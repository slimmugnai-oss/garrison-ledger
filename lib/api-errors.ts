/**
 * API ERROR HANDLING UTILITIES
 * 
 * Standardized error responses and error classes for API routes.
 * 
 * Usage in API routes:
 * ```typescript
 * import { APIError, errorResponse } from '@/lib/api-errors';
 * 
 * export async function POST(req: NextRequest) {
 *   try {
 *     // ... logic
 *     if (!valid) {
 *       throw new APIError('Invalid input', 400, 'INVALID_INPUT');
 *     }
 *     return NextResponse.json({ success: true });
 *   } catch (error) {
 *     return errorResponse(error);
 *   }
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Custom API Error class with status code and error code
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Common error codes for consistency
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED'
} as const;

/**
 * Standardized error response format
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Convert any error to a standardized NextResponse
 */
export function errorResponse(error: unknown): NextResponse<ErrorResponse> {
  // Handle our custom APIError
  if (error instanceof APIError) {
    logger.warn('API Error', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    });

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    logger.error('Unexpected API error', error);
    
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : error.message;

    return NextResponse.json(
      {
        error: message,
        code: ErrorCodes.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  logger.error('Unknown error type', error);
  
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: ErrorCodes.INTERNAL_ERROR
    },
    { status: 500 }
  );
}

/**
 * Common error responses as factory functions
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized') => 
    new APIError(message, 401, ErrorCodes.UNAUTHORIZED),
  
  forbidden: (message = 'Forbidden') => 
    new APIError(message, 403, ErrorCodes.FORBIDDEN),
  
  notFound: (resource = 'Resource', message?: string) => 
    new APIError(message || `${resource} not found`, 404, ErrorCodes.NOT_FOUND),
  
  invalidInput: (message = 'Invalid input', details?: Record<string, unknown>) => 
    new APIError(message, 400, ErrorCodes.INVALID_INPUT, details),
  
  rateLimitExceeded: (message = 'Rate limit exceeded') => 
    new APIError(message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED),
  
  premiumRequired: (message = 'Premium subscription required') => 
    new APIError(message, 403, ErrorCodes.PREMIUM_REQUIRED),
  
  validationError: (message: string, details?: Record<string, unknown>) => 
    new APIError(message, 400, ErrorCodes.VALIDATION_ERROR, details),
  
  databaseError: (message = 'Database operation failed') => 
    new APIError(message, 500, ErrorCodes.DATABASE_ERROR),
  
  externalApiError: (service: string, message?: string) => 
    new APIError(
      message || `External service ${service} failed`, 
      502, 
      ErrorCodes.EXTERNAL_API_ERROR,
      { service }
    )
};

