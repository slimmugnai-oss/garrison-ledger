/**
 * DEEP INTERNAL TESTING FOR PCS COPILOT CRITICAL FIXES
 *
 * Tests:
 * 1. DLA calculation with supabaseAdmin fix
 * 2. PPM weight allowance with rank format fix
 * 3. Edge cases and error handling
 */

import { calculatePCSClaim, type FormData } from "@/lib/pcs/calculation-engine";

describe("PCS Copilot Critical Fixes", () => {
  describe("Fix #1: DLA = $0 bug (supabaseAdmin)", () => {
    it("should calculate DLA for E-6 with 2 dependents", async () => {
      const formData: FormData = {
        claim_name: "TEST - E6 with dependents",
        rank_at_pcs: "E-6",
        branch: "Army",
        origin_base: "Fort Liberty, NC",
        destination_base: "Joint Base Lewis-McChord, WA",
        dependents_count: 2,
        departure_date: "2025-06-01",
        arrival_date: "2025-06-15",
        pcs_orders_date: "2025-01-15",
        travel_method: "ppm",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 107,
        malt_distance: 2735,
        distance_miles: 2735,
        per_diem_days: 14,
        actual_weight: 8250,
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "98433",
      };

      const results = await calculatePCSClaim(formData);

      // DLA should be ~$3540 for E-6 with dependents
      expect(results.dla.amount).toBeGreaterThanOrEqual(3500);
      expect(results.dla.amount).toBeLessThanOrEqual(3600);
      expect(results.dla.confidence).toBeGreaterThan(0);

      console.log(`✅ DLA Amount: $${results.dla.amount.toFixed(2)}`);
    });

    it("should calculate DLA for E-5 without dependents", async () => {
      const formData: FormData = {
        claim_name: "TEST - E5 no dependents",
        rank_at_pcs: "E-5",
        branch: "Army",
        origin_base: "Fort Bliss",
        destination_base: "Fort Hood",
        dependents_count: 0,
        departure_date: "2025-03-01",
        arrival_date: "2025-03-05",
        pcs_orders_date: "2025-01-01",
        travel_method: "hhg",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 0,
        malt_distance: 500,
        distance_miles: 500,
        per_diem_days: 4,
        actual_weight: 0,
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "76544",
      };

      const results = await calculatePCSClaim(formData);

      // DLA should be ~$2950 for E-5 without dependents
      expect(results.dla.amount).toBeGreaterThanOrEqual(2900);
      expect(results.dla.amount).toBeLessThanOrEqual(3000);

      console.log(`✅ DLA Amount: $${results.dla.amount.toFixed(2)}`);
    });

    it("should calculate DLA for O-3 with dependents", async () => {
      const formData: FormData = {
        claim_name: "TEST - O3 Officer",
        rank_at_pcs: "O-3",
        branch: "Air Force",
        origin_base: "Ramstein Air Base",
        destination_base: "Travis Air Force Base",
        dependents_count: 3,
        departure_date: "2025-07-01",
        arrival_date: "2025-07-10",
        pcs_orders_date: "2025-05-01",
        travel_method: "ppm",
        tle_origin_nights: 5,
        tle_destination_nights: 5,
        tle_origin_rate: 150,
        tle_destination_rate: 180,
        malt_distance: 3500,
        distance_miles: 3500,
        per_diem_days: 9,
        actual_weight: 12000,
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "94535",
      };

      const results = await calculatePCSClaim(formData);

      // DLA should be ~$3540 for O-3 with dependents
      expect(results.dla.amount).toBeGreaterThanOrEqual(3500);
      expect(results.dla.amount).toBeLessThanOrEqual(3600);

      console.log(`✅ DLA Amount: $${results.dla.amount.toFixed(2)}`);
    });
  });

  describe("Fix #2: PPM weight = 5000 bug (rank format)", () => {
    it("should use correct weight allowance for E-6 (7000 lbs)", async () => {
      const formData: FormData = {
        claim_name: "TEST - E6 PPM weight",
        rank_at_pcs: "E-6",
        branch: "Army",
        origin_base: "Fort Liberty, NC",
        destination_base: "Joint Base Lewis-McChord, WA",
        dependents_count: 2,
        departure_date: "2025-06-01",
        arrival_date: "2025-06-15",
        pcs_orders_date: "2025-01-15",
        travel_method: "ppm",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 107,
        malt_distance: 2735,
        distance_miles: 2735,
        per_diem_days: 14,
        actual_weight: 8250, // User enters 8250
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "98433",
      };

      const results = await calculatePCSClaim(formData);

      // E-6 max weight is 7000, so should cap at 7000
      expect(results.ppm.weight).toBe(7000);
      expect(results.ppm.maxWeight).toBe(7000);
      expect(results.ppm.amount).toBeGreaterThan(0);

      console.log(`✅ PPM Weight: ${results.ppm.weight} lbs (capped from 8250)`);
      console.log(`✅ PPM Amount: $${results.ppm.amount.toFixed(2)}`);
    });

    it("should handle E-1 weight cap (5000 lbs)", async () => {
      const formData: FormData = {
        claim_name: "TEST - E1 weight cap",
        rank_at_pcs: "E-1",
        branch: "Marine Corps",
        origin_base: "Camp Pendleton",
        destination_base: "Camp Lejeune",
        dependents_count: 0,
        departure_date: "2025-02-01",
        arrival_date: "2025-02-08",
        pcs_orders_date: "2025-01-10",
        travel_method: "ppm",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 0,
        malt_distance: 2800,
        distance_miles: 2800,
        per_diem_days: 7,
        actual_weight: 6000, // User enters 6000
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "28547",
      };

      const results = await calculatePCSClaim(formData);

      // E-1 max weight is 5000, so should cap at 5000
      expect(results.ppm.weight).toBe(5000);
      expect(results.ppm.maxWeight).toBe(5000);

      console.log(`✅ PPM Weight: ${results.ppm.weight} lbs (capped from 6000)`);
    });

    it("should handle O-3 weight allowance (13000 lbs)", async () => {
      const formData: FormData = {
        claim_name: "TEST - O3 weight allowance",
        rank_at_pcs: "O-3",
        branch: "Air Force",
        origin_base: "Travis Air Force Base",
        destination_base: "Ramstein Air Base",
        dependents_count: 3,
        departure_date: "2025-07-01",
        arrival_date: "2025-07-10",
        pcs_orders_date: "2025-05-01",
        travel_method: "ppm",
        tle_origin_nights: 5,
        tle_destination_nights: 5,
        tle_origin_rate: 150,
        tle_destination_rate: 180,
        malt_distance: 3500,
        distance_miles: 3500,
        per_diem_days: 9,
        actual_weight: 12000, // Under max
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "94535",
      };

      const results = await calculatePCSClaim(formData);

      // O-3 max is 13000, user enters 12000, should use 12000
      expect(results.ppm.weight).toBe(12000);
      expect(results.ppm.maxWeight).toBe(13000);

      console.log(`✅ PPM Weight: ${results.ppm.weight} lbs (under max of 13000)`);
    });

    it("should return zero PPM when no weight entered", async () => {
      const formData: FormData = {
        claim_name: "TEST - No PPM weight",
        rank_at_pcs: "E-5",
        branch: "Army",
        origin_base: "Fort Bliss",
        destination_base: "Fort Hood",
        dependents_count: 0,
        departure_date: "2025-03-01",
        arrival_date: "2025-03-05",
        pcs_orders_date: "2025-01-01",
        travel_method: "hhg",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 0,
        malt_distance: 500,
        distance_miles: 500,
        per_diem_days: 4,
        actual_weight: 0, // No PPM
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "76544",
      };

      const results = await calculatePCSClaim(formData);

      // PPM should be zero when no weight entered
      expect(results.ppm.weight).toBe(0);
      expect(results.ppm.amount).toBe(0);
      expect(results.ppm.confidence).toBe(0);

      console.log(`✅ PPM correctly zero (no weight entered)`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rank without dash (E6 instead of E-6)", async () => {
      const formData: FormData = {
        claim_name: "TEST - No dash rank",
        rank_at_pcs: "E6", // No dash
        branch: "Army",
        origin_base: "Fort Bliss",
        destination_base: "Fort Hood",
        dependents_count: 1,
        departure_date: "2025-03-01",
        arrival_date: "2025-03-05",
        pcs_orders_date: "2025-01-01",
        travel_method: "ppm",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 0,
        malt_distance: 500,
        distance_miles: 500,
        per_diem_days: 4,
        actual_weight: 5000,
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "76544",
      };

      const results = await calculatePCSClaim(formData);

      // Should still calculate correctly
      expect(results.ppm.maxWeight).toBe(7000); // E6 allowance
      expect(results.dla.amount).toBeGreaterThan(0);

      console.log(`✅ Handled rank without dash: max weight = ${results.ppm.maxWeight} lbs`);
    });

    it("should handle senior NCO (E-9) correctly", async () => {
      const formData: FormData = {
        claim_name: "TEST - E9 Senior NCO",
        rank_at_pcs: "E-9",
        branch: "Navy",
        origin_base: "Naval Station Norfolk",
        destination_base: "Naval Base San Diego",
        dependents_count: 4,
        departure_date: "2025-08-01",
        arrival_date: "2025-08-12",
        pcs_orders_date: "2025-06-01",
        travel_method: "ppm",
        tle_origin_nights: 7,
        tle_destination_nights: 7,
        tle_origin_rate: 140,
        tle_destination_rate: 160,
        malt_distance: 2900,
        distance_miles: 2900,
        per_diem_days: 11,
        actual_weight: 15000, // Over max
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "92135",
      };

      const results = await calculatePCSClaim(formData);

      // E-9 max is 11000
      expect(results.ppm.weight).toBe(11000);
      expect(results.ppm.maxWeight).toBe(11000);
      expect(results.dla.amount).toBeGreaterThanOrEqual(3500);

      console.log(`✅ E-9: PPM weight capped at ${results.ppm.weight} lbs`);
      console.log(`✅ E-9: DLA = $${results.dla.amount.toFixed(2)}`);
    });
  });

  describe("Integration Tests", () => {
    it("should produce complete calculations matching user scenario", async () => {
      const formData: FormData = {
        claim_name: "PCS - SMITH, JOHN A",
        rank_at_pcs: "E-6",
        branch: "Army",
        origin_base: "Fort Liberty, NC",
        destination_base: "Joint Base Lewis-McChord, WA",
        dependents_count: 2,
        departure_date: "2025-06-01",
        arrival_date: "2025-06-15",
        pcs_orders_date: "2025-01-15",
        travel_method: "ppm",
        tle_origin_nights: 0,
        tle_destination_nights: 0,
        tle_origin_rate: 0,
        tle_destination_rate: 107,
        malt_distance: 2735,
        distance_miles: 2735,
        per_diem_days: 14,
        actual_weight: 8250,
        estimated_weight: 0,
        fuel_receipts: 0,
        destination_zip: "98433",
      };

      const results = await calculatePCSClaim(formData);

      // Verify all components
      expect(results.dla.amount).toBeGreaterThan(0);
      expect(results.malt.amount).toBeGreaterThan(0);
      expect(results.perDiem.amount).toBeGreaterThan(0);
      expect(results.ppm.weight).toBe(7000); // E-6 cap
      expect(results.ppm.amount).toBeGreaterThan(0);
      expect(results.total).toBeGreaterThan(0);

      console.log("\n📊 COMPLETE CALCULATION RESULTS:");
      console.log(`  DLA: $${results.dla.amount.toFixed(2)}`);
      console.log(`  MALT: $${results.malt.amount.toFixed(2)} (${results.malt.distance} miles)`);
      console.log(
        `  Per Diem: $${results.perDiem.amount.toFixed(2)} (${results.perDiem.days} days)`
      );
      console.log(
        `  PPM: $${results.ppm.amount.toFixed(2)} (${results.ppm.weight} lbs × ${results.ppm.distance} mi)`
      );
      console.log(`  TLE: $${results.tle.total.toFixed(2)}`);
      console.log(`  TOTAL: $${results.total.toFixed(2)}`);
    });
  });
});
