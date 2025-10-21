/**
 * Tests for Logger Utility
 * Ensures PII sanitization and environment-aware logging work correctly
 */

import { logger, sanitizeForLogging } from '../logger';

// Mock console methods
const originalConsole = global.console;

beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
});

describe('Logger Utility', () => {
  describe('sanitizeForLogging', () => {
    it('should redact email addresses', () => {
      const data = { email: 'user@example.com', name: 'John' };
      const sanitized = sanitizeForLogging(data);
      
      expect(sanitized.email).toBe('[REDACTED]');
      expect(sanitized.name).toBe('John');
    });

    it('should redact password fields', () => {
      const data = { password: 'secret123', username: 'john' };
      const sanitized = sanitizeForLogging(data);
      
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.username).toBe('john');
    });

    it('should redact SSN', () => {
      const data = { ssn: '123-45-6789', age: 30 };
      const sanitized = sanitizeForLogging(data);
      
      expect(sanitized.ssn).toBe('[REDACTED]');
      expect(sanitized.age).toBe(30);
    });

    it('should redact API keys and tokens', () => {
      const data = { 
        api_key: 'sk_test_123',
        token: 'bearer_xyz',
        userId: 'user_123'
      };
      const sanitized = sanitizeForLogging(data);
      
      expect(sanitized.api_key).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.userId).toBe('user_123');
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          email: 'test@example.com',
          name: 'John'
        },
        settings: {
          password: 'secret'
        }
      };
      const sanitized = sanitizeForLogging(data);
      
      expect(sanitized.user.email).toBe('[REDACTED]');
      expect(sanitized.user.name).toBe('John');
      expect(sanitized.settings.password).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const data = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' }
      ];
      const sanitized = sanitizeForLogging(data);
      
      expect(sanitized[0].email).toBe('[REDACTED]');
      expect(sanitized[1].email).toBe('[REDACTED]');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeForLogging(null)).toBe(null);
      expect(sanitizeForLogging(undefined)).toBe(undefined);
    });

    it('should handle primitive types', () => {
      expect(sanitizeForLogging('string')).toBe('string');
      expect(sanitizeForLogging(123)).toBe(123);
      expect(sanitizeForLogging(true)).toBe(true);
    });
  });

  describe('logger.debug', () => {
    it('should log in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.debug('Test message', { data: 'value' });
      
      expect(console.log).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should NOT log in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger.debug('Test message', { data: 'value' });
      
      expect(console.log).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logger.info', () => {
    it('should always log info messages', () => {
      logger.info('Test info', { userId: '123' });
      
      expect(console.log).toHaveBeenCalledWith(
        '[INFO] Test info',
        { userId: '123' }
      );
    });

    it('should sanitize PII in info logs', () => {
      logger.info('User data', { email: 'test@example.com' });
      
      expect(console.log).toHaveBeenCalledWith(
        '[INFO] User data',
        { email: '[REDACTED]' }
      );
    });
  });

  describe('logger.warn', () => {
    it('should log warnings', () => {
      logger.warn('Warning message', { issue: 'something' });
      
      expect(console.warn).toHaveBeenCalledWith(
        '[WARN] Warning message',
        { issue: 'something' }
      );
    });
  });

  describe('logger.error', () => {
    it('should log errors with error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { context: 'test' });
      
      // Logger.error wraps context in a nested object
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        expect.objectContaining({
          context: expect.objectContaining({
            context: 'test'
          })
        })
      );
    });

    it('should sanitize PII in error logs', () => {
      logger.error('Failed to process', new Error('Test'), { 
        email: 'user@example.com',
        userId: '123'
      });
      
      // Should redact email in context
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Failed to process',
        expect.objectContaining({
          context: expect.objectContaining({
            email: '[REDACTED]',
            userId: '123'
          })
        })
      );
    });
  });
});

