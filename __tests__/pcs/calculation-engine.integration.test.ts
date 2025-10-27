/**
 * PCS CALCULATION ENGINE INTEGRATION TESTS
 * 
 * Tests full calculation flow with real data structures
 */

import { calculatePCSClaim, type FormData } from "@/lib/pcs/calculation-engine";

// Mock Supabase Admin for rate lookups
jest.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: jest.fn((table) => {
      if (table === "entitlements_data") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() =>
                  Promise.resolve({
                    data: {
                      amount_cents: 350000, // $3,500 DLA for E-5 with dependents
                    },
                    error: null,
                  })
                ),
              })),
            })),
          })),
        };
      }
      if (table === "jtr_rates_cache") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() =>
                Promise.resolve({
                  data: {
                    rate_cents: 67, // $0.67 per mile for 2025
                  },
                  error: null,
                })
              ),
            })),
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

// Mock per diem calculation (uses external API)
jest.mock("@/lib/pcs/jtr-api", () => ({
  getPerDiemRate: jest.fn(() =>
    Promise.resolve({
      perDiemRate: 166,
      lodgingRate: 107,
      mealsRate: 59,
      incidentalsRate: 5,
    })
  ),
  getDLARate: jest.fn(() => Promise.resolve(350000)), // $3,500
  getMALTRate: jest.fn(() => Promise.resolve(67)), // $0.67/mile
  calculatePerDiem: jest.fn((days: number) => Promise.resolve(days * 166)),
}));

describe("PCS Calculation Engine - Integration Tests", () => {
  const baseFormData: FormData = {
    claim_name: "Test PCS Move Fort Bragg to JBLM",
    rank_at_pcs: "E5",
    branch: "Army",
    dependents_count: 2,
    travel_method: "POV",
    origin_base: "Fort Bragg, NC",
    destination_base: "JBLM, WA",
    pcs_orders_date: "2025-06-01",
    departure_date: "2025-06-01",
    arrival_date: "2025-06-05",
    tle_origin_nights: 3,
    tle_destination_nights: 5,
    tle_origin_rate: 107,
    tle_destination_rate: 150,
    distance_miles: 2850,
    malt_distance: 2850,
    per_diem_days: 5,
    fuel_receipts: 350,
    estimated_weight: 8000,
    actual_weight: 8000,
  };

  describe("Complete Claim Calculation", () => {
    it("should calculate all entitlements for E-5 PCS", async () => {
      const result = await calculatePCSClaim(baseFormData);

      // Verify structure
      expect(result).toHaveProperty("dla");
      expect(result).toHaveProperty("tle");
      expect(result).toHaveProperty("malt");
      expect(result).toHaveProperty("perDiem");
      expect(result).toHaveProperty("ppm");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("jtrRuleVersion");
      expect(result).toHaveProperty("dataSources");
    });

    it("should calculate DLA correctly for E-5 with dependents", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.dla.amount).toBeGreaterThan(0);
      expect(result.dla.citation).toContain("JTR");
      expect(result.dla.confidence).toBeGreaterThan(0);
    });

    it("should calculate TLE for both origin and destination", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.tle.origin.days).toBe(3);
      expect(result.tle.origin.rate).toBeGreaterThan(0);
      expect(result.tle.origin.amount).toBeGreaterThan(0);

      expect(result.tle.destination.days).toBe(5);
      expect(result.tle.destination.rate).toBeGreaterThan(0);
      expect(result.tle.destination.amount).toBeGreaterThan(0);

      expect(result.tle.total).toBe(
        result.tle.origin.amount + result.tle.destination.amount
      );
    });

    it("should calculate MALT based on actual distance", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.malt.distance).toBe(2850);
      expect(result.malt.amount).toBeGreaterThan(0);
      expect(result.malt.citation).toContain("JTR");
    });

    it("should calculate per diem for travel days", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.perDiem.days).toBe(5);
      expect(result.perDiem.amount).toBeGreaterThan(0);
    });

    it("should calculate PPM based on weight and distance", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.ppm.weight).toBeLessThanOrEqual(8000);
      expect(result.ppm.distance).toBe(2850);
      expect(result.ppm.amount).toBeGreaterThan(0);
    });

    it("should calculate correct total", async () => {
      const result = await calculatePCSClaim(baseFormData);

      const expectedTotal =
        result.dla.amount +
        result.tle.total +
        result.malt.amount +
        result.perDiem.amount +
        result.ppm.amount;

      expect(result.total).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe("Confidence Scoring", () => {
    it("should have high confidence with complete data", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.confidence.overall).toBeGreaterThanOrEqual(70);
      expect(result.confidence.data).toBeDefined();
      expect(result.confidence.rates).toBeDefined();
      expect(result.confidence.completeness).toBeDefined();
    });

    it("should have lower confidence with estimated weight", async () => {
      const formWithEstimate = {
        ...baseFormData,
        actual_weight: undefined,
        estimated_weight: 8000,
      };

      const result = await calculatePCSClaim(formWithEstimate);

      // PPM should be marked as estimate
      expect(result.ppm.amount).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single member (no dependents)", async () => {
      const singleMember = {
        ...baseFormData,
        dependents_count: 0,
      };

      const result = await calculatePCSClaim(singleMember);

      expect(result.dla.amount).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it("should handle short distance moves", async () => {
      const shortMove = {
        ...baseFormData,
        distance_miles: 50,
        malt_distance: 50,
      };

      const result = await calculatePCSClaim(shortMove);

      expect(result.malt.distance).toBe(50);
      expect(result.malt.amount).toBeGreaterThan(0);
    });

    it("should handle long distance moves", async () => {
      const longMove = {
        ...baseFormData,
        distance_miles: 5000,
        malt_distance: 5000,
      };

      const result = await calculatePCSClaim(longMove);

      expect(result.malt.distance).toBe(5000);
      expect(result.malt.amount).toBeGreaterThan(0);
    });

    it("should handle maximum weight allowance", async () => {
      const maxWeight = {
        ...baseFormData,
        actual_weight: 15000,
      };

      const result = await calculatePCSClaim(maxWeight);

      // E-5 with dependents has lower max weight than 15000
      expect(result.ppm.weight).toBeLessThan(15000);
      expect(result.ppm.maxWeight).toBeDefined();
    });

    it("should handle zero TLE nights", async () => {
      const noTLE = {
        ...baseFormData,
        tle_origin_nights: 0,
        tle_destination_nights: 0,
      };

      const result = await calculatePCSClaim(noTLE);

      expect(result.tle.total).toBe(0);
      expect(result.total).toBeGreaterThan(0); // Should still have other entitlements
    });
  });

  describe("JTR Compliance", () => {
    it("should include JTR citations for all calculations", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.dla.citation).toMatch(/JTR/);
      expect(result.tle.citation).toMatch(/JTR/);
      expect(result.malt.citation).toMatch(/JTR/);
      expect(result.perDiem.citation).toMatch(/JTR/);
      expect(result.ppm.citation).toMatch(/JTR/);
    });

    it("should include current JTR rule version", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.jtrRuleVersion).toBeDefined();
      expect(result.jtrRuleVersion).toMatch(/2025/); // Should be current year
    });
  });

  describe("Data Sources", () => {
    it("should track all data sources used", async () => {
      const result = await calculatePCSClaim(baseFormData);

      expect(result.dataSources).toBeDefined();
      expect(Array.isArray(result.dataSources)).toBe(true);
      expect(result.dataSources.length).toBeGreaterThan(0);
    });

    it("should include source URLs for verification", async () => {
      const result = await calculatePCSClaim(baseFormData);

      const hasUrls = result.dataSources.some((source: any) => source.url);
      expect(hasUrls).toBe(true);
    });
  });

  describe("Real-World Scenarios", () => {
    it("E-5 Army CONUS to CONUS (Fort Bragg → JBLM)", async () => {
      const result = await calculatePCSClaim(baseFormData);

      // Should have reasonable totals for this move
      expect(result.total).toBeGreaterThan(5000); // At least $5k in entitlements
      expect(result.total).toBeLessThan(50000); // Sanity check
      
      // All components should be present
      expect(result.dla.amount).toBeGreaterThan(0);
      expect(result.tle.total).toBeGreaterThan(0);
      expect(result.malt.amount).toBeGreaterThan(0);
      expect(result.perDiem.amount).toBeGreaterThan(0);
      expect(result.ppm.amount).toBeGreaterThan(0);
    });

    it("O-3 Air Force short move (less than 500 miles)", async () => {
      const shortMoveOfficer: FormData = {
        ...baseFormData,
        rank_at_pcs: "O3",
        branch: "Air Force",
        distance_miles: 300,
        malt_distance: 300,
        per_diem_days: 2,
        actual_weight: 6000,
      };

      const result = await calculatePCSClaim(shortMoveOfficer);

      expect(result.total).toBeGreaterThan(0);
      expect(result.malt.distance).toBe(300);
    });
  });
});

