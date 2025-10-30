/**
 * ENHANCED COMMUTE INTELLIGENCE
 *
 * Comprehensive traffic analysis, alternative routes, transit options
 * Military audience: Early duty, late duty, weekend flexibility
 */

export interface TrafficPattern {
  hour: number; // 0-23
  avg_minutes: number;
  traffic_level: "light" | "moderate" | "heavy";
}

export interface CommuteIntelligence {
  // Current data
  am_minutes: number | null; // 8 AM
  pm_minutes: number | null; // 5 PM
  
  // Traffic patterns
  best_departure_time: { hour: number; minutes: number; description: string };
  worst_departure_time: { hour: number; minutes: number; description: string };
  traffic_variance: "consistent" | "moderate" | "unpredictable";
  
  // Route intelligence
  primary_route_miles: number;
  alternative_routes_available: number;
  
  // Transportation options
  public_transit: {
    available: boolean;
    duration_minutes: number | null;
    description: string;
  };
  bike_route: {
    viable: boolean;
    distance_miles: number | null;
    difficulty: "easy" | "moderate" | "difficult" | "not_viable";
  };
  walk_score: number; // 0-100 (100 = fully walkable)
  
  // Impact analysis
  annual_fuel_cost: number; // Estimated
  weekly_time_cost_hours: number; // Round trip × 5 days
  work_life_balance_score: number; // 0-100
  
  // Military-specific
  early_duty_impact: string; // Impact of 0600 report times
  late_duty_impact: string; // Impact of staying till 1900
  weekend_flexibility: string; // Weekend duty accessibility
  
  // Executive summary
  executive_summary: string;
  bottom_line: string;
}

/**
 * Analyze commute comprehensively
 */
export function analyzeCommuteComprehensive(
  zip: string,
  zipLat: number,
  zipLon: number,
  gateLat: number,
  gateLon: number,
  amMinutes: number | null,
  pmMinutes: number | null
): CommuteIntelligence {
  console.log(`[COMMUTE_ENHANCED] Comprehensive analysis for ZIP ${zip}`);

  // Calculate straight-line distance for estimates
  const straightLineMiles = calculateDistance(zipLat, zipLon, gateLat, gateLon);
  const estimatedDrivingMiles = straightLineMiles * 1.3; // Add 30% for actual roads

  // Analyze traffic patterns
  const trafficVariance = analyzeTrafficVariance(amMinutes, pmMinutes);
  
  // Estimate best/worst times
  const bestTime = estimateBestDepartureTime(amMinutes, pmMinutes);
  const worstTime = estimateWorstDepartureTime(amMinutes, pmMinutes);
  
  // Public transit assessment
  const publicTransit = assessPublicTransit(straightLineMiles, zip);
  
  // Bike route assessment
  const bikeRoute = assessBikeViability(estimatedDrivingMiles);
  
  // Walk score
  const walkScore = calculateWalkScore(straightLineMiles);
  
  // Cost calculations
  const avgCommute = amMinutes && pmMinutes ? (amMinutes + pmMinutes) / 2 : amMinutes || pmMinutes || 30;
  const annualFuelCost = calculateAnnualFuelCost(estimatedDrivingMiles);
  const weeklyTimeHours = (avgCommute * 2 * 5) / 60; // Round trip, 5 days
  
  // Work-life balance score
  const workLifeBalance = calculateWorkLifeBalance(avgCommute, trafficVariance);
  
  // Military-specific impacts
  const earlyDutyImpact = assessEarlyDutyImpact(avgCommute);
  const lateDutyImpact = assessLateDutyImpact(avgCommute);
  const weekendFlexibility = assessWeekendFlexibility(straightLineMiles);
  
  // Generate summaries
  const executiveSummary = generateCommuteSummary(
    amMinutes,
    pmMinutes,
    trafficVariance,
    workLifeBalance,
    publicTransit.available
  );
  
  const bottomLine = generateCommuteBottomLine(avgCommute, workLifeBalance, annualFuelCost);

  return {
    am_minutes: amMinutes,
    pm_minutes: pmMinutes,
    best_departure_time: bestTime,
    worst_departure_time: worstTime,
    traffic_variance: trafficVariance,
    primary_route_miles: Math.round(estimatedDrivingMiles * 10) / 10,
    alternative_routes_available: estimateAlternativeRoutes(straightLineMiles),
    public_transit: publicTransit,
    bike_route: bikeRoute,
    walk_score: walkScore,
    annual_fuel_cost: annualFuelCost,
    weekly_time_cost_hours: Math.round(weeklyTimeHours * 10) / 10,
    work_life_balance_score: workLifeBalance,
    early_duty_impact: earlyDutyImpact,
    late_duty_impact: lateDutyImpact,
    weekend_flexibility: weekendFlexibility,
    executive_summary: executiveSummary,
    bottom_line: bottomLine,
  };
}

/**
 * Calculate distance using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function analyzeTrafficVariance(
  am: number | null,
  pm: number | null
): "consistent" | "moderate" | "unpredictable" {
  if (!am || !pm) return "moderate";
  const diff = Math.abs(pm - am);
  if (diff < 5) return "consistent";
  if (diff < 15) return "moderate";
  return "unpredictable";
}

function estimateBestDepartureTime(am: number | null, pm: number | null): TrafficPattern & { description: string } {
  const baseTime = am || pm || 25;
  return {
    hour: 6,
    avg_minutes: Math.max(10, Math.round(baseTime * 0.75)),
    traffic_level: "light",
    description: "Early morning (6:00-6:30 AM) typically lightest traffic"
  };
}

function estimateWorstDepartureTime(am: number | null, pm: number | null): TrafficPattern & { description: string } {
  const baseTime = pm || am || 25;
  return {
    hour: 17,
    avg_minutes: Math.round(baseTime * 1.2),
    traffic_level: "heavy",
    description: "Evening rush (5:00-6:00 PM) typically heaviest"
  };
}

function assessPublicTransit(miles: number, _zip: string): CommuteIntelligence["public_transit"] {
  // Conservative estimate - would need Transit API for real data
  if (miles < 5) {
    return {
      available: true,
      duration_minutes: Math.round(miles * 15), // ~15 min/mile on transit
      description: "Public transit likely available for short distance"
    };
  } else if (miles < 15) {
    return {
      available: true,
      duration_minutes: Math.round(miles * 10),
      description: "Public transit may be available, check local routes"
    };
  }
  
  return {
    available: false,
    duration_minutes: null,
    description: "Distance typically requires personal vehicle"
  };
}

function assessBikeViability(miles: number): CommuteIntelligence["bike_route"] {
  if (miles < 5) {
    return {
      viable: true,
      distance_miles: miles,
      difficulty: "easy"
    };
  } else if (miles < 10) {
    return {
      viable: true,
      distance_miles: miles,
      difficulty: "moderate"
    };
  } else if (miles < 15) {
    return {
      viable: true,
      distance_miles: miles,
      difficulty: "difficult"
    };
  }
  
  return {
    viable: false,
    distance_miles: miles,
    difficulty: "not_viable"
  };
}

function calculateWalkScore(miles: number): number {
  if (miles < 1) return 100;
  if (miles < 2) return 80;
  if (miles < 3) return 60;
  if (miles < 5) return 40;
  return 0;
}

function calculateAnnualFuelCost(milesOneWay: number): number {
  const daysPerYear = 240; // ~20 days/month × 12
  const annualMiles = milesOneWay * 2 * daysPerYear;
  const mpg = 25; // Average vehicle
  const costPerGallon = 3.50;
  return Math.round((annualMiles / mpg) * costPerGallon);
}

function calculateWorkLifeBalance(avgMinutes: number, variance: string): number {
  let score = 100;
  
  // Commute time penalty
  if (avgMinutes > 45) score -= 40;
  else if (avgMinutes > 35) score -= 30;
  else if (avgMinutes > 25) score -= 20;
  else if (avgMinutes > 15) score -= 10;
  
  // Variance penalty
  if (variance === "unpredictable") score -= 15;
  else if (variance === "moderate") score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

function estimateAlternativeRoutes(miles: number): number {
  if (miles < 5) return 1;
  if (miles < 15) return 2;
  return 3;
}

function assessEarlyDutyImpact(avgMinutes: number): string {
  if (avgMinutes < 15) {
    return "Minimal impact - short commute allows 0600 reports without major sleep disruption";
  } else if (avgMinutes < 30) {
    return "Moderate impact - early reports require 0500-0515 departure";
  } else {
    return "Significant impact - early reports require 0430-0500 departure, may affect family routine";
  }
}

function assessLateDutyImpact(avgMinutes: number): string {
  if (avgMinutes < 20) {
    return "Minimal impact - quick commute home after late duty";
  } else if (avgMinutes < 35) {
    return "Moderate impact - 1900 release means 1945 arrival home";
  } else {
    return "Significant impact - late duty means missing family dinner/bedtime";
  }
}

function assessWeekendFlexibility(miles: number): string {
  if (miles < 10) {
    return "Excellent - easy weekend duty access without major disruption";
  } else if (miles < 20) {
    return "Good - weekend duty manageable";
  } else {
    return "Fair - weekend duty requires longer travel time";
  }
}

function generateCommuteSummary(
  am: number | null,
  pm: number | null,
  variance: string,
  workLifeBalance: number,
  hasTransit: boolean
): string {
  if (!am || !pm) {
    return "Commute data unavailable. Recommend testing route during typical duty hours.";
  }
  
  const avg = Math.round((am + pm) / 2);
  
  let summary = `${am}min morning, ${pm}min evening commute. `;
  
  if (workLifeBalance >= 80) {
    summary += "Excellent work-life balance with short commute. ";
  } else if (workLifeBalance >= 60) {
    summary += "Good work-life balance. ";
  } else {
    summary += "Longer commute may impact family time. ";
  }
  
  if (variance === "consistent") {
    summary += "Traffic patterns consistent and predictable.";
  } else if (variance === "moderate") {
    summary += `PM traffic ${pm - am}min heavier than AM.`;
  } else {
    summary += `High traffic variance (${pm - am}min difference) - plan buffer time.`;
  }
  
  if (hasTransit) {
    summary += " Public transit available as backup.";
  }
  
  return summary;
}

function generateCommuteBottomLine(avgMin: number, workLifeScore: number, fuelCost: number): string {
  if (avgMin < 20 && workLifeScore >= 80) {
    return `EXCELLENT: Short commute (~${avgMin}min) maximizes family time. Est. $${fuelCost.toLocaleString()}/year fuel cost.`;
  } else if (avgMin < 30 && workLifeScore >= 60) {
    return `GOOD: Reasonable commute (~${avgMin}min) for the area. Est. $${fuelCost.toLocaleString()}/year fuel cost.`;
  } else if (avgMin < 45) {
    return `ACCEPTABLE: Moderate commute (~${avgMin}min). Budget $${fuelCost.toLocaleString()}/year for fuel. Consider early duty impact.`;
  } else {
    return `CHALLENGING: Long commute (~${avgMin}min) will impact work-life balance. Est. $${fuelCost.toLocaleString()}/year fuel cost. Strongly consider closer options.`;
  }
}

