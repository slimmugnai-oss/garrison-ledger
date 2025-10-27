/**
 * PPM WITHHOLDING CALCULATOR TESTS
 * 
 * Comprehensive tests for tax withholding logic
 */

import { calculatePPMWithholding } from "@/lib/pcs/ppm-withholding-calculator";

// Mock Supabase for testing
jest.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: jest.fn((table) => {
      if (table === "state_tax_rates") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn((field, value) => {
              // Store state code for conditional returns
              const stateCode = field === "state_code" ? value : null;
              return {
                eq: jest.fn(() => ({
                  maybeSingle: jest.fn(() => {
                    // Return different data based on state code
                    if (stateCode === "NC") {
                      return Promise.resolve({
                        data: {
                          state_name: "North Carolina",
                          flat_rate: null,
                          avg_rate_mid: "5.0", // 5% stored as whole number
                        },
                        error: null,
                      });
                    } else if (stateCode === "WA") {
                      return Promise.resolve({
                        data: {
                          state_name: "Washington",
                          flat_rate: null,
                          avg_rate_mid: "5.0", // 5% stored as whole number
                        },
                        error: null,
                      });
                    }
                    // Default for unknown states
                    return Promise.resolve({
                      data: null,
                      error: { message: "State not found" },
                    });
                  }),
                })),
              };
            }),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      };
    }),
  },
}));

describe("PPM Withholding Calculator", () => {
  describe("Basic Withholding Calculation", () => {
    it("should calculate federal withholding at 22% supplemental rate", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.grossPayout).toBe(8500);
      expect(result.taxableAmount).toBe(8500); // No expenses
      expect(result.estimatedWithholding.federal.rate).toBe(22);
      expect(result.estimatedWithholding.federal.amount).toBe(8500 * 0.22);
    });

    it("should calculate state withholding from database rate", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.estimatedWithholding.state.stateName).toBe("North Carolina");
      expect(result.estimatedWithholding.state.rate).toBe(5); // Mock returns 5%
      expect(result.estimatedWithholding.state.amount).toBeCloseTo(8500 * 0.05, 2);
    });

    it("should calculate FICA at 6.2%", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.estimatedWithholding.fica.rate).toBe(6.2);
      expect(result.estimatedWithholding.fica.amount).toBeCloseTo(8500 * 0.062, 2);
    });

    it("should calculate Medicare at 1.45%", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.estimatedWithholding.medicare.rate).toBe(1.45);
      expect(result.estimatedWithholding.medicare.amount).toBeCloseTo(8500 * 0.0145, 2);
    });
  });

  describe("Allowed Expenses Deduction", () => {
    it("should reduce taxable amount by allowed expenses", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 1200,
          fuelReceipts: 800,
          laborCosts: 300,
          tollsAndFees: 100,
        },
        destinationState: "NC",
      });

      expect(result.totalAllowedExpenses).toBe(2400);
      expect(result.taxableAmount).toBe(6100); // 8500 - 2400
      
      // Taxes calculated on reduced taxable amount
      expect(result.estimatedWithholding.federal.amount).toBeCloseTo(6100 * 0.22, 2);
      expect(result.estimatedWithholding.state.amount).toBeCloseTo(6100 * 0.05, 2); // Mock uses 5%
    });

    it("should handle expenses greater than payout (taxable = 0)", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 10000, // More than payout
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.taxableAmount).toBe(0); // Can't be negative
      expect(result.estimatedWithholding.federal.amount).toBe(0);
      expect(result.estimatedWithholding.state.amount).toBe(0);
      expect(result.estimatedNetPayout).toBe(8500); // Gets full amount
    });
  });

  describe("Incentive Percentage Variations", () => {
    it("should handle 130% peak season rate", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 130,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.grossPayout).toBe(11050); // 8500 * 1.30
      expect(result.incentivePercentage).toBe(130);
    });

    it("should handle 100% standard rate", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.grossPayout).toBe(8500);
      expect(result.incentivePercentage).toBe(100);
    });
  });

  describe("Custom Rate Overrides", () => {
    it("should use custom federal rate when provided", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
        customFederalRate: 24, // User knows they're in 24% bracket
      });

      expect(result.estimatedWithholding.federal.rate).toBe(24);
      expect(result.estimatedWithholding.federal.isCustom).toBe(true);
      expect(result.estimatedWithholding.federal.amount).toBe(8500 * 0.24);
    });

    it("should use custom state rate when provided", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
        customStateRate: 5.5, // User knows their specific rate
      });

      expect(result.estimatedWithholding.state.rate).toBe(5.5);
      expect(result.estimatedWithholding.state.isCustom).toBe(true);
      expect(result.estimatedWithholding.state.amount).toBe(8500 * 0.055);
    });
  });

  describe("FICA Cap Handling", () => {
    it("should cap FICA at annual limit", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 10000,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
        yearToDateFICA: 168000, // Already near cap
      });

      // Only $600 subject to FICA (168600 cap - 168000 YTD)
      expect(result.estimatedWithholding.fica.amount).toBeCloseTo(600 * 0.062, 2);
      expect(result.estimatedWithholding.fica.cappedAtYTD).toBe(true);
    });

    it("should not cap Medicare (no limit)", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 10000,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
        yearToDateFICA: 200000, // Way over FICA cap
      });

      // Medicare still applies to full amount
      expect(result.estimatedWithholding.medicare.amount).toBeCloseTo(10000 * 0.0145, 2);
    });
  });

  describe("Net Payout Calculation", () => {
    it("should calculate correct net payout", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 1200,
          fuelReceipts: 800,
          laborCosts: 300,
          tollsAndFees: 100,
        },
        destinationState: "NC",
      });

      const expectedFederal = 6100 * 0.22; // $1,342
      const expectedState = 6100 * 0.05; // $305 (mock uses 5%)
      const expectedFICA = 6100 * 0.062; // $378.20
      const expectedMedicare = 6100 * 0.0145; // $88.45
      const expectedTotal = expectedFederal + expectedState + expectedFICA + expectedMedicare;

      expect(result.totalWithholding).toBeCloseTo(expectedTotal, 2);
      expect(result.estimatedNetPayout).toBeCloseTo(8500 - expectedTotal, 2);
    });
  });

  describe("Source and Confidence Tracking", () => {
    it("should mark official mode with 100% confidence", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.source).toBe("MilMove (user-entered)");
      expect(result.confidence).toBe(100);
    });

    it("should mark estimator mode with 50% confidence", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 11400, // From estimator
        incentivePercentage: 100,
        mode: "estimator",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.source).toBe("Estimator (planning only)");
      expect(result.confidence).toBe(50);
    });
  });

  describe("Required Fields and Metadata", () => {
    it("should include all required fields", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      // Check all required fields exist
      expect(result.gccAmount).toBeDefined();
      expect(result.incentivePercentage).toBeDefined();
      expect(result.source).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.grossPayout).toBeDefined();
      expect(result.totalAllowedExpenses).toBeDefined();
      expect(result.taxableAmount).toBeDefined();
      expect(result.estimatedWithholding).toBeDefined();
      expect(result.totalWithholding).toBeDefined();
      expect(result.estimatedNetPayout).toBeDefined();
      expect(result.effectiveWithholdingRate).toBeDefined();
      expect(result.disclaimer).toBeDefined();
      expect(result.isEstimate).toBe(true);
      expect(result.notTaxAdvice).toBe(true);
    });

    it("should include proper source citations", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.estimatedWithholding.federal.basis).toContain("IRS Pub 15");
      expect(result.estimatedWithholding.fica.basis).toContain("Social Security");
      expect(result.estimatedWithholding.medicare.basis).toContain("Medicare");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero GCC amount", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 0,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      expect(result.grossPayout).toBe(0);
      expect(result.totalWithholding).toBe(0);
      expect(result.estimatedNetPayout).toBe(0);
    });

    it("should calculate effective withholding rate correctly", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 10000,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 0,
          fuelReceipts: 0,
          laborCosts: 0,
          tollsAndFees: 0,
        },
        destinationState: "NC",
      });

      const expectedRate = (result.totalWithholding / result.grossPayout) * 100;
      expect(result.effectiveWithholdingRate).toBeCloseTo(expectedRate, 2);
    });
  });

  describe("Real-World Scenario Tests", () => {
    it("E-5 Fort Bragg to JBLM scenario", async () => {
      const result = await calculatePPMWithholding({
        gccAmount: 8500,
        incentivePercentage: 100,
        mode: "official",
        allowedExpenses: {
          movingCosts: 1200,
          fuelReceipts: 800,
          laborCosts: 300,
          tollsAndFees: 100,
        },
        destinationState: "WA", // Washington
      });

      // Total expenses: $2,400
      // Taxable: $6,100
      expect(result.taxableAmount).toBe(6100);
      
      // Federal: 6100 * 0.22 = $1,342
      expect(result.estimatedWithholding.federal.amount).toBeCloseTo(1342, 0);
      
      // WA: Mock returns 5% (in reality WA has no income tax, but our mock simplifies)
      expect(result.estimatedWithholding.state.amount).toBeCloseTo(305, 0);
      
      // FICA: 6100 * 0.062 = $378.20
      expect(result.estimatedWithholding.fica.amount).toBeCloseTo(378.20, 1);
      
      // Medicare: 6100 * 0.0145 = $88.45
      expect(result.estimatedWithholding.medicare.amount).toBeCloseTo(88.45, 1);
      
      // Net: 8500 - (1342 + 305 + 378.20 + 88.45) ≈ $6,386.35
      expect(result.estimatedNetPayout).toBeCloseTo(6386, 0);
    });
  });
});

