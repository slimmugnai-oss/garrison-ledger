// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Next.js server APIs in test environment
global.Request = class Request {}
global.Response = class Response {
  static json(data, init) {
    return {
      ...init,
      status: init?.status || 200,
      json: async () => data
    }
  }
}
global.Headers = class Headers {}
global.fetch = jest.fn()

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123'
process.env.CLERK_SECRET_KEY = 'sk_test_123'
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.OPENAI_API_KEY = 'test-openai-key'

// Mock Next.js auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-123' })),
  currentUser: jest.fn(() => Promise.resolve({ 
    id: 'test-user-123',
    emailAddresses: [{ emailAddress: 'test@example.com' }]
  })),
}))

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
        download: jest.fn(() => Promise.resolve({ data: null, error: null })),
        remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    },
  },
}))

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

