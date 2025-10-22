/**
 * UNIT TESTS: lib/les/codes.ts
 * Tests taxable base computation and line code definitions
 */

import { computeTaxableBases, getLineCodeDefinition, isValidLineCode, validateAndNormalizeCode } from '@/lib/les/codes';

describe('codes.ts', () => {
  describe('computeTaxableBases', () => {
    it('excludes BAH and BAS from all tax bases', () => {
      const lines = [
        { code: 'BASEPAY', amount_cents: 350000 },
        { code: 'BAH', amount_cents: 180000 },
        { code: 'BAS', amount_cents: 46025 }
      ];
      
      const bases = computeTaxableBases(lines);
      
      expect(bases.fed).toBe(350000);      // Only base pay
      expect(bases.state).toBe(350000);    // Only base pay
      expect(bases.oasdi).toBe(350000);    // Only base pay
      expect(bases.medicare).toBe(350000); // Only base pay
    });
    
    it('includes HFP in FICA/Medicare but not Fed/State', () => {
      const lines = [
        { code: 'BASEPAY', amount_cents: 350000 },
        { code: 'HFP', amount_cents: 22500 }  // Hostile Fire Pay - partially taxable
      ];
      
      const bases = computeTaxableBases(lines);
      
      expect(bases.fed).toBe(350000);        // Excludes HFP (combat pay exempt)
      expect(bases.state).toBe(350000);      // Excludes HFP
      expect(bases.oasdi).toBe(372500);      // Includes HFP (FICA taxable)
      expect(bases.medicare).toBe(372500);   // Includes HFP (Medicare taxable)
    });
    
    it('includes all fully-taxable specials in all bases', () => {
      const lines = [
        { code: 'BASEPAY', amount_cents: 350000 },
        { code: 'SDAP', amount_cents: 15000 },    // Special Duty - fully taxable
        { code: 'FSA', amount_cents: 25000 },     // Family Sep - fully taxable
        { code: 'FLPP', amount_cents: 10000 }     // Language - fully taxable
      ];
      
      const bases = computeTaxableBases(lines);
      
      const expected = 350000 + 15000 + 25000 + 10000; // 400000
      expect(bases.fed).toBe(expected);
      expect(bases.state).toBe(expected);
      expect(bases.oasdi).toBe(expected);
      expect(bases.medicare).toBe(expected);
    });
    
    it('handles mixed taxability correctly', () => {
      const lines = [
        { code: 'BASEPAY', amount_cents: 350000 },  // All taxable
        { code: 'BAH', amount_cents: 180000 },      // Non-taxable
        { code: 'HFP', amount_cents: 22500 },       // FICA/Med only
        { code: 'SDAP', amount_cents: 15000 }       // All taxable
      ];
      
      const bases = computeTaxableBases(lines);
      
      expect(bases.fed).toBe(365000);        // Base + SDAP (excludes BAH, HFP)
      expect(bases.state).toBe(365000);      // Base + SDAP
      expect(bases.oasdi).toBe(387500);      // Base + HFP + SDAP (excludes BAH)
      expect(bases.medicare).toBe(387500);   // Base + HFP + SDAP
    });
  });

  describe('getLineCodeDefinition', () => {
    it('returns correct definition for BAH', () => {
      const def = getLineCodeDefinition('BAH');
      
      expect(def.section).toBe('ALLOWANCE');
      expect(def.description).toBe('Basic Allowance for Housing');
      expect(def.taxability.fed).toBe(false);
      expect(def.taxability.state).toBe(false);
      expect(def.taxability.oasdi).toBe(false);
      expect(def.taxability.medicare).toBe(false);
    });
    
    it('returns correct definition for FICA', () => {
      const def = getLineCodeDefinition('FICA');
      
      expect(def.section).toBe('TAX');
      expect(def.description).toBe('FICA (Social Security Tax)');
      // Tax deductions themselves are not taxable
      expect(def.taxability.fed).toBe(false);
    });
  });

  describe('isValidLineCode', () => {
    it('returns true for valid codes', () => {
      expect(isValidLineCode('BASEPAY')).toBe(true);
      expect(isValidLineCode('BAH')).toBe(true);
      expect(isValidLineCode('FICA')).toBe(true);
    });
    
    it('returns false for invalid codes', () => {
      expect(isValidLineCode('INVALID_CODE')).toBe(false);
      expect(isValidLineCode('RANDOM')).toBe(false);
    });
  });

  describe('validateAndNormalizeCode', () => {
    it('returns code without warning for valid codes', () => {
      const result = validateAndNormalizeCode('BASEPAY');
      
      expect(result.code).toBe('BASEPAY');
      expect(result.warning).toBeUndefined();
    });
    
    it('returns OTHER with warning for invalid codes', () => {
      const result = validateAndNormalizeCode('UNKNOWN_PAY');
      
      expect(result.code).toBe('OTHER');
      expect(result.warning).toBeDefined();
      expect(result.warning?.severity).toBe('yellow');
      expect(result.warning?.flag_code).toBe('UNKNOWN_CODE');
      expect(result.warning?.message).toContain('UNKNOWN_PAY');
    });
  });
});

