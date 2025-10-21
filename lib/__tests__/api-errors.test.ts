/**
 * Tests for API Error Utilities
 * Ensures standardized error handling works correctly
 */

import { APIError, Errors, ErrorCodes } from '../api-errors';

describe('API Error Utilities', () => {
  describe('APIError class', () => {
    it('should create error with message and status code', () => {
      const error = new APIError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('APIError');
    });

    it('should default to 500 status code', () => {
      const error = new APIError('Server error');
      
      expect(error.statusCode).toBe(500);
    });

    it('should include error code', () => {
      const error = new APIError('Unauthorized', 401, 'UNAUTHORIZED');
      
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should include details object', () => {
      const details = { field: 'email', reason: 'Invalid format' };
      const error = new APIError('Validation failed', 400, 'INVALID_INPUT', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('Errors factory functions', () => {
    it('should create unauthorized error', () => {
      const error = Errors.unauthorized();
      
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe(ErrorCodes.UNAUTHORIZED);
    });

    it('should create forbidden error', () => {
      const error = Errors.forbidden('Admin access required');
      
      expect(error.message).toBe('Admin access required');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe(ErrorCodes.FORBIDDEN);
    });

    it('should create not found error', () => {
      const error = Errors.notFound('User');
      
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('should create invalid input error', () => {
      const details = { field: 'email' };
      const error = Errors.invalidInput('Email is required', details);
      
      expect(error.message).toBe('Email is required');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCodes.INVALID_INPUT);
      expect(error.details).toEqual(details);
    });

    it('should create rate limit error', () => {
      const error = Errors.rateLimitExceeded();
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe(ErrorCodes.RATE_LIMIT_EXCEEDED);
    });

    it('should create premium required error', () => {
      const error = Errors.premiumRequired();
      
      expect(error.message).toBe('Premium subscription required');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe(ErrorCodes.PREMIUM_REQUIRED);
    });

    it('should create database error', () => {
      const details = { table: 'users', operation: 'insert' };
      const error = Errors.databaseError('Failed to insert user', details);
      
      expect(error.message).toBe('Failed to insert user');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(error.details).toEqual(details);
    });

    it('should create external API error', () => {
      const error = Errors.externalApiError('Stripe', 'Payment processing failed');
      
      expect(error.message).toBe('Payment processing failed');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe(ErrorCodes.EXTERNAL_API_ERROR);
      expect(error.details).toEqual({ service: 'Stripe' });
    });

    it('should create validation error', () => {
      const details = { field: 'email', errors: ['Invalid format'] };
      const error = Errors.validationError('Validation failed', details);
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.details).toEqual(details);
    });
  });

  describe('Error code constants', () => {
    it('should have all required error codes', () => {
      expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCodes.INVALID_INPUT).toBe('INVALID_INPUT');
      expect(ErrorCodes.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ErrorCodes.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_ERROR');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.PREMIUM_REQUIRED).toBe('PREMIUM_REQUIRED');
    });
  });
});
