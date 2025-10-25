/**
 * Tests for LES Comparison Logic
 * 
 * This is CRITICAL business logic that detects pay discrepancies
 * for military service members. Thorough testing is essential.
 */

import type { LesLine, ExpectedSnapshot } from '@/app/types/les';

import { compareLesToExpected } from '../compare';

describe('LES Comparison Logic', () => {
  describe('Basic Functionality', () => {
    it('should compare LES lines without crashing', () => {
      const lesLines: LesLine[] = [
        {
          line_code: 'BAH',
          description: 'BAH WITH DEPENDENTS',
          section: 'ALLOWANCE',
          amount_cents: 200000 // $2000.00
        }
      ];

      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: true,
        expected: {
          bah_cents: 250000 // $2500.00
        }
      };

      const result = compareLesToExpected(lesLines, snapshot);

      // Basic structure validation
      expect(result).toBeDefined();
      expect(result.flags).toBeDefined();
      expect(Array.isArray(result.flags)).toBe(true);
      expect(result.totals).toBeDefined();
    });

    it('should return flags array', () => {
      const lesLines: LesLine[] = [];
      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: false,
        expected: {}
      };

      const result = compareLesToExpected(lesLines, snapshot);

      expect(Array.isArray(result.flags)).toBe(true);
    });

    it('should return totals object', () => {
      const lesLines: LesLine[] = [];
      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: false,
        expected: {}
      };

      const result = compareLesToExpected(lesLines, snapshot);

      expect(result.totals).toBeDefined();
      expect(typeof result.totals).toBe('object');
    });
  });

  describe('Flag Generation', () => {
    it('should detect BAH underpayment', () => {
      const lesLines: LesLine[] = [
        {
          line_code: 'BAH',
          description: 'BAH',
          section: 'ALLOWANCE',
          amount_cents: 150000 // $1500
        }
      ];

      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: true,
        mha_or_zip: 'KSCP',
        expected: {
          bah_cents: 200000 // $2000 - should flag $500 underpayment
        }
      };

      const result = compareLesToExpected(lesLines, snapshot);

      // Should have at least one BAH-related flag
      const bahFlags = result.flags.filter(f => f.flag_code.includes('BAH'));
      expect(bahFlags.length).toBeGreaterThan(0);
    });

    it('should handle missing allowances', () => {
      const lesLines: LesLine[] = [
        // No BAH line
      ];

      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: true,
        expected: {
          bah_cents: 200000 // Expected BAH but not on LES
        }
      };

      const result = compareLesToExpected(lesLines, snapshot);

      // Should flag missing BAH
      const missingFlags = result.flags.filter(f => 
        f.flag_code.includes('MISSING') || f.flag_code.includes('BAH')
      );
      expect(missingFlags.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty LES lines', () => {
      const lesLines: LesLine[] = [];
      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: false,
        expected: {}
      };

      const result = compareLesToExpected(lesLines, snapshot);

      expect(result).toBeDefined();
      expect(result.flags).toBeDefined();
    });

    it('should handle empty expected values', () => {
      const lesLines: LesLine[] = [
        {
          line_code: 'BASP',
          description: 'BASE PAY',
          section: 'ALLOWANCE',
          amount_cents: 350000
        }
      ];

      const snapshot: ExpectedSnapshot = {
        user_id: 'test-user',
        month: 10,
        year: 2025,
        paygrade: 'E-5',
        with_dependents: false,
        expected: {}
      };

      const result = compareLesToExpected(lesLines, snapshot);

      // Should not crash
      expect(result).toBeDefined();
    });
  });
});
