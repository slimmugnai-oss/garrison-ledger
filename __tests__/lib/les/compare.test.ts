/**
 * UNIT TESTS: lib/les/compare.ts
 * Tests LES comparison and validation logic
 */

import { compareDetailed } from '@/lib/les/compare';

describe('compare.ts', () => {
  describe('compareDetailed', () => {
    it('flags BAH mismatch when delta > $5', () => {
      const result = compareDetailed({
        expected: { bah_cents: 195000 },  // Expected: $1,950
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BAH', amount_cents: 165000, section: 'ALLOWANCE' }  // Actual: $1,650
        ],
        netPayCents: 0
      });
      
      const bahFlag = result.flags.find(f => f.flag_code === 'BAH_MISMATCH');
      expect(bahFlag).toBeDefined();
      expect(bahFlag?.severity).toBe('red');
      expect(bahFlag?.delta_cents).toBe(30000); // $300 underpaid
    });
    
    it('passes FICA check when 6.2%', () => {
      const result = compareDetailed({
        expected: {},
        taxable_bases: { 
          fed: 0, 
          state: 0, 
          oasdi: 350000,     // $3,500 FICA base
          medicare: 0 
        },
        actualLines: [
          { line_code: 'FICA', amount_cents: 21700, section: 'TAX' }  // $217 = 6.2% of $3,500
        ],
        netPayCents: 0
      });
      
      const ficaFlag = result.flags.find(f => f.flag_code === 'FICA_PCT_CORRECT');
      expect(ficaFlag).toBeDefined();
      expect(ficaFlag?.severity).toBe('green');
    });
    
    it('flags FICA when percentage out of range', () => {
      const result = compareDetailed({
        expected: {},
        taxable_bases: { 
          fed: 0, 
          state: 0, 
          oasdi: 350000,     // $3,500 FICA base
          medicare: 0 
        },
        actualLines: [
          { line_code: 'FICA', amount_cents: 14000, section: 'TAX' }  // $140 = 4% (too low)
        ],
        netPayCents: 0
      });
      
      const ficaFlag = result.flags.find(f => f.flag_code === 'FICA_PCT_OUT_OF_RANGE');
      expect(ficaFlag).toBeDefined();
      expect(ficaFlag?.severity).toBe('yellow');
    });
    
    it('passes Medicare check when 1.45%', () => {
      const result = compareDetailed({
        expected: {},
        taxable_bases: { 
          fed: 0, 
          state: 0, 
          oasdi: 0,
          medicare: 350000   // $3,500 Medicare base
        },
        actualLines: [
          { line_code: 'MEDICARE', amount_cents: 5075, section: 'TAX' }  // $50.75 = 1.45% of $3,500
        ],
        netPayCents: 0
      });
      
      const medicareFlag = result.flags.find(f => f.flag_code === 'MEDICARE_PCT_CORRECT');
      expect(medicareFlag).toBeDefined();
      expect(medicareFlag?.severity).toBe('green');
    });
    
    it('net math ±$1 passes, ±$1.01 fails', () => {
      // PASS: $1.00 difference (100 cents) - within tolerance
      const pass = compareDetailed({
        expected: {},
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BASEPAY', amount_cents: 100000, section: 'ALLOWANCE' }  // $1,000 income
        ],
        netPayCents: 99900  // $999.00 net (exactly $1 difference)
      });
      
      const passFlag = pass.flags.find(f => f.flag_code === 'NET_MATH_VERIFIED');
      expect(passFlag).toBeDefined();
      expect(passFlag?.severity).toBe('green');
      
      // FAIL: $1.01 difference (101 cents) - exceeds tolerance
      const fail = compareDetailed({
        expected: {},
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BASEPAY', amount_cents: 100000, section: 'ALLOWANCE' }  // $1,000 income
        ],
        netPayCents: 99899  // $998.99 net ($1.01 difference)
      });
      
      const failFlag = fail.flags.find(f => f.flag_code === 'NET_MATH_MISMATCH');
      expect(failFlag).toBeDefined();
      expect(failFlag?.severity).toBe('red');
    });
    
    it('validates complete audit scenario', () => {
      const result = compareDetailed({
        expected: {
          base_pay_cents: 350000,
          bah_cents: 180000,
          bas_cents: 46025,
          cola_cents: 0
        },
        taxable_bases: {
          fed: 350000,
          state: 350000,
          oasdi: 350000,
          medicare: 350000
        },
        actualLines: [
          // Allowances
          { line_code: 'BASEPAY', amount_cents: 350000, section: 'ALLOWANCE' },
          { line_code: 'BAH', amount_cents: 180000, section: 'ALLOWANCE' },
          { line_code: 'BAS', amount_cents: 46025, section: 'ALLOWANCE' },
          // Taxes
          { line_code: 'TAX_FED', amount_cents: 35000, section: 'TAX' },
          { line_code: 'FICA', amount_cents: 21700, section: 'TAX' },
          { line_code: 'MEDICARE', amount_cents: 5075, section: 'TAX' },
          // Deductions
          { line_code: 'TSP', amount_cents: 28800, section: 'DEDUCTION' },
          { line_code: 'SGLI', amount_cents: 2700, section: 'DEDUCTION' }
        ],
        netPayCents: 482750  // Should match: 576025 - 61775 - 31500 = 482750
      });
      
      // Should have green flags for FICA, Medicare, and Net Math
      const ficaGreen = result.flags.find(f => f.flag_code === 'FICA_PCT_CORRECT');
      const medicareGreen = result.flags.find(f => f.flag_code === 'MEDICARE_PCT_CORRECT');
      const netGreen = result.flags.find(f => f.flag_code === 'NET_MATH_VERIFIED');
      
      expect(ficaGreen).toBeDefined();
      expect(medicareGreen).toBeDefined();
      expect(netGreen).toBeDefined();
      
      // Should have no red flags
      const redFlags = result.flags.filter(f => f.severity === 'red');
      expect(redFlags.length).toBe(0);
    });
    
    it('flags BAH_PARTIAL_OR_DIFF yellow for small variance', () => {
      const result = compareDetailed({
        expected: { bah_cents: 200000 },  // $2,000 expected
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BAH', amount_cents: 185000, section: 'ALLOWANCE' }  // $1,850 (small $150 variance)
        ],
        netPayCents: 0
      });
      
      const bahFlag = result.flags.find(f => f.flag_code === 'BAH_PARTIAL_OR_DIFF');
      expect(bahFlag).toBeDefined();
      expect(bahFlag?.severity).toBe('yellow');
      expect(bahFlag?.delta_cents).toBe(15000);  // $150
    });
    
    it('shows CZTE_INFO when fed tax near zero but FICA/Medicare present', () => {
      const result = compareDetailed({
        expected: {},
        taxable_bases: { fed: 0, state: 0, oasdi: 350000, medicare: 350000 },
        actualLines: [
          { line_code: 'TAX_FED', amount_cents: 0, section: 'TAX' },
          { line_code: 'FICA', amount_cents: 21700, section: 'TAX' },
          { line_code: 'MEDICARE', amount_cents: 5075, section: 'TAX' }
        ],
        netPayCents: 0
      });
      
      const czteFlag = result.flags.find(f => f.flag_code === 'CZTE_INFO');
      expect(czteFlag).toBeDefined();
      expect(czteFlag?.severity).toBe('green');
    });
  });
});

