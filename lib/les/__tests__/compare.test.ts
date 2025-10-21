/**
 * Tests for LES Comparison Logic
 * 
 * This is CRITICAL business logic that detects pay discrepancies
 * for military service members. Thorough testing is essential.
 */

import { compareLesToExpected } from '../compare';
import type { LesLine, ExpectedSnapshot } from '@/app/types/les';

describe('LES Comparison Logic', () => {
  describe('Basic Functionality', () => {
    it('should compare LES lines without crashing', () => {
      const lesLines: LesLine[] = [
        {
          line_code: 'BAH',
          line_desc: 'BAH WITH DEPENDENTS',
          section: 'ALLOWANCE',
          amount_cents: 200000, // $2000.00
          ytd_cents: 2400000
        }
      ];

      const snapshot: ExpectedSnapshot = {
        expected: {
          bah_cents: 250000, // $2500.00
        },
        profile: {
          has_dependents: true,
          rank: 'E-5',
          current_base: 'KSCP'
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
        expected: {},
        profile: {
          rank: 'E-5'
        }
      };

      const result = compareLesToExpected(lesLines, snapshot);

      expect(Array.isArray(result.flags)).toBe(true);
    });

    it('should return totals object', () => {
      const lesLines: LesLine[] = [];
      const snapshot: ExpectedSnapshot = {
        expected: {},
        profile: {
          rank: 'E-5'
        }
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
          line_desc: 'BAH',
          section: 'ALLOWANCE',
          amount_cents: 150000, // $1500
          ytd_cents: 1800000
        }
      ];

      const snapshot: ExpectedSnapshot = {
        expected: {
          bah_cents: 200000, // $2000 - should flag $500 underpayment
        },
        profile: {
          rank: 'E-5'
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
        expected: {
          bah_cents: 200000, // Expected BAH but not on LES
        },
        profile: {
          rank: 'E-5'
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
        expected: {},
        profile: {
          rank: 'E-5'
        }
      };

      const result = compareLesToExpected(lesLines, snapshot);

      expect(result).toBeDefined();
      expect(result.flags).toBeDefined();
    });

    it('should handle empty expected values', () => {
      const lesLines: LesLine[] = [
        {
          line_code: 'BASP',
          line_desc: 'BASE PAY',
          section: 'PAY',
          amount_cents: 350000,
          ytd_cents: 4200000
        }
      ];

      const snapshot: ExpectedSnapshot = {
        expected: {},
        profile: {
          rank: 'E-5'
        }
      };

      const result = compareLesToExpected(lesLines, snapshot);

      // Should not crash
      expect(result).toBeDefined();
    });
  });
});
