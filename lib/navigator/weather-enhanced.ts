/**
 * ENHANCED WEATHER INTELLIGENCE
 *
 * Seasonal climate analysis, monthly breakdowns, extreme weather risks
 * Military audience: Plan for year-round living, outdoor activities, utility costs
 */

export interface MonthlyClimate {
  month: number; // 1-12
  month_name: string;
  avg_high_f: number;
  avg_low_f: number;
  avg_precip_inches: number;
  description: string; // "Mild and pleasant" | "Hot and humid" | etc.
}

export interface SeasonalBreakdown {
  season: "spring" | "summer" | "fall" | "winter";
  months: string;
  avg_temp_range: string; // "55-75°F"
  conditions: string;
  outdoor_activities: string;
  utility_impact: string; // AC/heating costs
}

export interface ExtremeWeatherRisk {
  type: "hurricane" | "tornado" | "blizzard" | "heat_wave" | "flooding";
  risk_level: "none" | "low" | "moderate" | "high";
  season: string;
  preparation_needed: string;
}

export interface WeatherIntelligence {
  // Current conditions
  current_temp_f: number;
  current_condition: string;
  current_humidity: number;
  
  // Seasonal guide
  seasonal_breakdown: SeasonalBreakdown[];
  
  // Monthly details
  monthly_climate: MonthlyClimate[];
  best_months: string[]; // ["April", "May", "October"]
  worst_months: string[]; // ["July", "August"]
  
  // Extreme weather
  extreme_weather_risks: ExtremeWeatherRisk[];
  
  // Outdoor activity calendar
  outdoor_season_months: number; // Months suitable for outdoor activities
  pool_season: string; // "May-September"
  park_season: string; // "March-November"
  
  // Cost implications
  ac_cost_impact: "none" | "moderate" | "significant"; // Summer AC costs
  heating_cost_impact: "none" | "moderate" | "significant"; // Winter heating
  weatherization_needs: string[];
  
  // Climate score
  overall_comfort_score: number; // 0-100
  
  // Summaries
  executive_summary: string;
  military_family_considerations: string;
}

/**
 * Analyze weather comprehensively based on ZIP region
 * Uses current data + regional climate patterns
 */
export function analyzeWeatherComprehensive(
  zip: string,
  currentTempF: number,
  currentCondition: string,
  currentHumidity: number
): WeatherIntelligence {
  console.log(`[WEATHER_ENHANCED] Comprehensive climate analysis for ZIP ${zip}`);

  const zipNum = parseInt(zip);
  
  // Determine climate zone
  const climateZone = determineClimateZone(zipNum);
  
  // Generate seasonal breakdown
  const seasonalBreakdown = generateSeasonalBreakdown(climateZone);
  
  // Generate monthly climate data
  const monthlyClimate = generateMonthlyClimate(climateZone);
  
  // Identify best and worst months
  const bestMonths = identifyBestMonths(monthlyClimate);
  const worstMonths = identifyWorstMonths(monthlyClimate);
  
  // Assess extreme weather risks
  const extremeWeatherRisks = assessExtremeWeatherRisks(climateZone);
  
  // Calculate outdoor seasons
  const outdoorSeasonMonths = calculateOutdoorSeasonLength(monthlyClimate);
  const poolSeason = determinePoolSeason(monthlyClimate);
  const parkSeason = determineParkSeason(monthlyClimate);
  
  // Cost implications
  const acCostImpact = assessACCost(climateZone);
  const heatingCostImpact = assessHeatingCost(climateZone);
  const weatherizationNeeds = determineWeatherizationNeeds(climateZone);
  
  // Overall comfort score
  const overallComfort = calculateOverallComfort(climateZone, extremeWeatherRisks);
  
  // Generate summaries
  const executiveSummary = generateWeatherSummary(
    currentTempF,
    currentCondition,
    climateZone,
    bestMonths,
    worstMonths
  );
  
  const militaryConsiderations = generateMilitaryWeatherConsiderations(
    outdoorSeasonMonths,
    extremeWeatherRisks,
    acCostImpact,
    heatingCostImpact
  );

  return {
    current_temp_f: currentTempF,
    current_condition: currentCondition,
    current_humidity: currentHumidity,
    seasonal_breakdown: seasonalBreakdown,
    monthly_climate: monthlyClimate,
    best_months: bestMonths,
    worst_months: worstMonths,
    extreme_weather_risks: extremeWeatherRisks,
    outdoor_season_months: outdoorSeasonMonths,
    pool_season: poolSeason,
    park_season: parkSeason,
    ac_cost_impact: acCostImpact,
    heating_cost_impact: heatingCostImpact,
    weatherization_needs: weatherizationNeeds,
    overall_comfort_score: overallComfort,
    executive_summary: executiveSummary,
    military_family_considerations: militaryConsiderations,
  };
}

/**
 * Determine climate zone based on ZIP
 */
function determineClimateZone(zipNum: number): string {
  if (zipNum >= 33000 && zipNum <= 34999) return "southeast_coastal"; // VA, NC coast
  if (zipNum >= 30000 && zipNum <= 32999) return "southeast_inland"; // GA, SC
  if (zipNum >= 20000 && zipNum <= 22999) return "mid_atlantic"; // DC, MD
  if (zipNum >= 10000 && zipNum <= 14999) return "northeast"; // NY, PA
  if (zipNum >= 90000 && zipNum <= 96999) return "california"; // CA
  if (zipNum >= 98000 && zipNum <= 99999) return "pacific_northwest"; // WA, OR
  if (zipNum >= 80000 && zipNum <= 84999) return "mountain_west"; // CO, UT
  if (zipNum >= 70000 && zipNum <= 73999) return "south_central"; // TX, OK
  if (zipNum >= 60000 && zipNum <= 62999) return "midwest"; // IL, IN
  return "temperate";
}

function generateSeasonalBreakdown(zone: string): SeasonalBreakdown[] {
  const patterns: Record<string, SeasonalBreakdown[]> = {
    southeast_coastal: [
      {
        season: "spring",
        months: "Mar-May",
        avg_temp_range: "60-75°F",
        conditions: "Mild, increasing humidity",
        outdoor_activities: "Ideal for parks, beaches, outdoor sports",
        utility_impact: "Low - minimal AC/heating"
      },
      {
        season: "summer",
        months: "Jun-Aug",
        avg_temp_range: "80-92°F",
        conditions: "Hot, humid, afternoon thunderstorms",
        outdoor_activities: "Beach, pools, early morning/evening activities",
        utility_impact: "High AC costs ($150-250/month)"
      },
      {
        season: "fall",
        months: "Sep-Nov",
        avg_temp_range: "65-80°F",
        conditions: "Warm, decreasing humidity, hurricane season",
        outdoor_activities: "Excellent outdoor weather",
        utility_impact: "Moderate AC in Sep, low Oct-Nov"
      },
      {
        season: "winter",
        months: "Dec-Feb",
        avg_temp_range: "40-60°F",
        conditions: "Mild, occasional cold snaps, rare snow",
        outdoor_activities: "Year-round outdoor activities possible",
        utility_impact: "Moderate heating ($80-120/month)"
      }
    ],
    // Add other zones as needed
  };
  
  return patterns[zone] || patterns.southeast_coastal;
}

function generateMonthlyClimate(zone: string): MonthlyClimate[] {
  // Simplified - would ideally fetch from weather API historical data
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Example for southeast coastal
  const temps = [
    [48, 35], [52, 38], [60, 45], [68, 52], [76, 62], [84, 70],
    [88, 74], [87, 73], [81, 68], [71, 57], [62, 47], [52, 38]
  ];
  
  return months.map((name, i) => ({
    month: i + 1,
    month_name: name,
    avg_high_f: temps[i][0],
    avg_low_f: temps[i][1],
    avg_precip_inches: 3 + Math.random() * 2,
    description: generateMonthDescription(temps[i][0], i + 1)
  }));
}

function generateMonthDescription(avgHigh: number, month: number): string {
  if (avgHigh >= 85) return "Hot - AC essential";
  if (avgHigh >= 75) return "Warm and pleasant";
  if (avgHigh >= 65) return "Mild and comfortable";
  if (avgHigh >= 55) return "Cool - light jacket weather";
  return "Cold - heating needed";
}

function identifyBestMonths(monthly: MonthlyClimate[]): string[] {
  // Best = 65-78°F average high
  return monthly
    .filter((m) => m.avg_high_f >= 65 && m.avg_high_f <= 78)
    .map((m) => m.month_name)
    .slice(0, 3);
}

function identifyWorstMonths(monthly: MonthlyClimate[]): string[] {
  // Worst = too hot (>90) or too cold (<45)
  return monthly
    .filter((m) => m.avg_high_f > 90 || m.avg_high_f < 45)
    .map((m) => m.month_name)
    .slice(0, 2);
}

function assessExtremeWeatherRisks(zone: string): ExtremeWeatherRisk[] {
  const risks: ExtremeWeatherRisk[] = [];
  
  if (zone === "southeast_coastal") {
    risks.push({
      type: "hurricane",
      risk_level: "moderate",
      season: "June-November",
      preparation_needed: "Emergency kit, evacuation plan, renter's insurance"
    });
    risks.push({
      type: "heat_wave",
      risk_level: "moderate",
      season: "July-August",
      preparation_needed: "Reliable AC, hydration for outdoor activities"
    });
  }
  
  // Add other zones as needed
  
  return risks;
}

function calculateOutdoorSeasonLength(monthly: MonthlyClimate[]): number {
  // Months with avg high 55-85°F
  return monthly.filter((m) => m.avg_high_f >= 55 && m.avg_high_f <= 85).length;
}

function determinePoolSeason(monthly: MonthlyClimate[]): string {
  const poolMonths = monthly.filter((m) => m.avg_high_f >= 75);
  if (poolMonths.length === 0) return "Not applicable";
  return `${poolMonths[0].month_name}-${poolMonths[poolMonths.length - 1].month_name}`;
}

function determineParkSeason(monthly: MonthlyClimate[]): string {
  const parkMonths = monthly.filter((m) => m.avg_high_f >= 50 && m.avg_high_f <= 90);
  if (parkMonths.length >= 10) return "Year-round";
  return `${parkMonths[0].month_name}-${parkMonths[parkMonths.length - 1].month_name}`;
}

function assessACCost(zone: string): "none" | "moderate" | "significant" {
  if (zone.includes("southeast") || zone.includes("south")) return "significant";
  if (zone.includes("california") || zone.includes("mid_atlantic")) return "moderate";
  return "none";
}

function assessHeatingCost(zone: string): "none" | "moderate" | "significant" {
  if (zone.includes("northeast") || zone.includes("midwest")) return "significant";
  if (zone.includes("mid_atlantic") || zone.includes("mountain")) return "moderate";
  return "none";
}

function determineWeatherizationNeeds(zone: string): string[] {
  const needs: string[] = [];
  
  if (zone.includes("southeast")) {
    needs.push("Hurricane shutters or impact windows");
    needs.push("Reliable AC unit");
    needs.push("Dehumidifier");
  }
  
  if (zone.includes("northeast")) {
    needs.push("Snow removal equipment");
    needs.push("Insulated windows");
    needs.push("Heating system");
  }
  
  return needs;
}

function calculateOverallComfort(zone: string, risks: ExtremeWeatherRisk[]): number {
  let score = 70; // Base
  
  // Moderate climates score higher
  if (zone.includes("california") || zone.includes("pacific_northwest")) score += 20;
  else if (zone.includes("mid_atlantic")) score += 10;
  
  // Penalize for extreme weather
  const highRisks = risks.filter((r) => r.risk_level === "high");
  const modRisks = risks.filter((r) => r.risk_level === "moderate");
  
  score -= highRisks.length * 15;
  score -= modRisks.length * 5;
  
  return Math.max(0, Math.min(100, score));
}

function generateWeatherSummary(
  currentTemp: number,
  currentCondition: string,
  zone: string,
  bestMonths: string[],
  worstMonths: string[]
): string {
  let summary = `Currently ${Math.round(currentTemp)}°F and ${currentCondition.toLowerCase()}. `;
  
  summary += `Climate zone: ${zone.replace(/_/g, " ")}. `;
  
  if (bestMonths.length > 0) {
    summary += `Best weather: ${bestMonths.join(", ")} (mild and comfortable). `;
  }
  
  if (worstMonths.length > 0) {
    summary += `Most challenging: ${worstMonths.join(", ")} (extreme temperatures).`;
  }
  
  return summary;
}

function generateMilitaryWeatherConsiderations(
  outdoorMonths: number,
  risks: ExtremeWeatherRisk[],
  acCost: string,
  heatingCost: string
): string {
  let considerations = `${outdoorMonths} months suitable for outdoor family activities. `;
  
  if (risks.length > 0) {
    const riskTypes = risks.map((r) => r.type.replace(/_/g, " ")).join(", ");
    considerations += `Prepare for: ${riskTypes}. `;
  }
  
  if (acCost === "significant") {
    considerations += "Budget $150-250/month for summer AC costs. ";
  } else if (acCost === "moderate") {
    considerations += "Budget $80-150/month for summer AC. ";
  }
  
  if (heatingCost === "significant") {
    considerations += "Budget $150-250/month for winter heating. ";
  } else if (heatingCost === "moderate") {
    considerations += "Budget $80-150/month for winter heating. ";
  }
  
  considerations += "Plan utility budget accordingly.";
  
  return considerations;
}

