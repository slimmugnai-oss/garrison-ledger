/**
 * NEIGHBORHOOD SCORING ENGINE
 *
 * Computes family fit scores based on:
 * - Schools (35% weight)
 * - Rent vs BAH (25% weight)
 * - Commute (15% weight)
 * - Weather (10% weight)
 * - Amenities (8% weight)
 * - Demographics (5% weight)
 * - Military (2% weight)
 */

import { ssot as _ssot } from "@/lib/ssot";

/**
 * Convert school score (0-10) to 0-100 scale
 */
export function schoolsScore100(score10: number): number {
  return Math.max(0, Math.min(100, (score10 / 10) * 100));
}

/**
 * Compute rent vs BAH score (0-100)
 * Piecewise linear bands based on how much rent exceeds BAH
 */
export function rentVsBahScore100(medianRentCents: number | null, bahMonthlyCents: number): number {
  if (!medianRentCents || !bahMonthlyCents) {
    return 0;
  }

  // If rent <= BAH, perfect score
  if (medianRentCents <= bahMonthlyCents) {
    return 100;
  }

  // Calculate how much rent exceeds BAH (as percentage)
  const overageRatio = medianRentCents / bahMonthlyCents - 1;

  // Piecewise linear scoring:
  // 0-10% over: 100-80 points
  if (overageRatio <= 0.1) {
    return Math.round(100 - overageRatio * 200);
  }

  // 10-20% over: 80-50 points
  if (overageRatio <= 0.2) {
    return Math.round(80 - (overageRatio - 0.1) * 300);
  }

  // 20-40% over: 50-30 points
  if (overageRatio <= 0.4) {
    return Math.round(50 - (overageRatio - 0.2) * 100);
  }

  // >40% over: 15 points (very poor fit)
  return 15;
}

/**
 * Compute commute score (0-100)
 * Piecewise linear based on commute minutes
 */
export function commuteScore100(amMinutes: number | null, pmMinutes: number | null): number {
  const avgMinutes = averageDefined([amMinutes, pmMinutes]);

  if (avgMinutes === null) {
    return 0;
  }

  // Piecewise mapping:
  // 0 min: 100 pts
  // 15 min: 90 pts
  // 30 min: 75 pts
  // 45 min: 55 pts
  // 60 min: 35 pts
  // 75 min: 20 pts
  // 90 min: 5 pts
  // 120+ min: 0 pts

  const breakpoints: Array<[number, number]> = [
    [0, 100],
    [15, 90],
    [30, 75],
    [45, 55],
    [60, 35],
    [75, 20],
    [90, 5],
    [120, 0],
  ];

  // Find which segment we're in
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [x1, y1] = breakpoints[i];
    const [x2, y2] = breakpoints[i + 1];

    if (avgMinutes <= x2) {
      // Linear interpolation
      const t = (avgMinutes - x1) / (x2 - x1);
      return Math.round(y1 + t * (y2 - y1));
    }
  }

  return 0; // >120 minutes
}

/**
 * Convert weather index (0-10) to 0-100 scale
 */
export function weatherScore100(index10: number): number {
  return Math.round(Math.max(0, Math.min(10, index10)) * 10);
}

/**
 * Convert amenities score (0-10) to 0-100 scale
 */
export function amenitiesScore100(score10: number): number {
  return Math.round(Math.max(0, Math.min(10, score10)) * 10);
}

/**
 * Convert demographics score (0-10) to 0-100 scale
 */
export function demographicsScore100(score10: number): number {
  return Math.round(Math.max(0, Math.min(10, score10)) * 10);
}

/**
 * Convert military score (0-10) to 0-100 scale
 */
export function militaryScore100(score10: number): number {
  return Math.round(Math.max(0, Math.min(10, score10)) * 10);
}

/**
 * Compute final family fit score (0-100)
 * Weighted combination of all subscores
 */
export function familyFitScore100(
  subscores: {
    schools10: number;
    medianRentCents: number | null;
    bahMonthlyCents: number;
    amMin: number | null;
    pmMin: number | null;
    weather10: number;
    amenities10: number;
    demographics10: number;
    military10: number;
  },
  weights = {
    schools: 0.35,
    rentVsBah: 0.25,
    commute: 0.15,
    weather: 0.1,
    amenities: 0.08,
    demographics: 0.05,
    military: 0.02,
  }
): {
  total: number;
  subs: {
    schools: number;
    rentVsBah: number;
    commute: number;
    weather: number;
    amenities: number;
    demographics: number;
    military: number;
  };
} {
  const schoolScore = schoolsScore100(subscores.schools10);
  const rentScore = rentVsBahScore100(subscores.medianRentCents, subscores.bahMonthlyCents);
  const commuteScore = commuteScore100(subscores.amMin, subscores.pmMin);
  const weatherScore = weatherScore100(subscores.weather10);
  const amenitiesScore = amenitiesScore100(subscores.amenities10);
  const demographicsScore = demographicsScore100(subscores.demographics10);
  const militaryScore = militaryScore100(subscores.military10);

  const total = Math.round(
    schoolScore * weights.schools +
      rentScore * weights.rentVsBah +
      commuteScore * weights.commute +
      weatherScore * weights.weather +
      amenitiesScore * weights.amenities +
      demographicsScore * weights.demographics +
      militaryScore * weights.military
  );

  return {
    total: Math.max(0, Math.min(100, total)),
    subs: {
      schools: schoolScore,
      rentVsBah: rentScore,
      commute: commuteScore,
      weather: weatherScore,
      amenities: amenitiesScore,
      demographics: demographicsScore,
      military: militaryScore,
    },
  };
}

/**
 * Helper: Average of defined values
 */
function averageDefined(arr: Array<number | null | undefined>): number | null {
  const defined = arr.filter((x): x is number => typeof x === "number");

  if (defined.length === 0) {
    return null;
  }

  return defined.reduce((sum, val) => sum + val, 0) / defined.length;
}

/**
 * Get score breakdown explanation
 */
export function getScoreBreakdown(score: number): {
  tier: "excellent" | "good" | "fair" | "poor";
  color: string;
  message: string;
} {
  if (score >= 80) {
    return {
      tier: "excellent",
      color: "green",
      message: "Excellent fit - highly recommended",
    };
  }

  if (score >= 60) {
    return {
      tier: "good",
      color: "blue",
      message: "Good fit - solid option",
    };
  }

  if (score >= 40) {
    return {
      tier: "fair",
      color: "yellow",
      message: "Fair fit - consider trade-offs",
    };
  }

  return {
    tier: "poor",
    color: "red",
    message: "Poor fit - explore other areas",
  };
}
