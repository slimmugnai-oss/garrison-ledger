/**
 * BASE NAVIGATOR - COMPUTE RANKINGS
 *
 * POST /api/navigator/base
 * Computes family fit scores for all candidate ZIPs near a base
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import type {
  NavigatorRequest,
  NavigatorResponse,
  NeighborhoodCard,
  KidsGrade,
} from "@/app/types/navigator";
import { errorResponse, Errors } from "@/lib/api-errors";
import bases from "@/lib/data/bases-seed.json";
import { logger } from "@/lib/logger";
import { fetchAmenitiesData } from "@/lib/navigator/amenities";
import { fetchEnhancedAmenitiesData } from "@/lib/navigator/amenities-enhanced";
import { analyzeCommuteComprehensive } from "@/lib/navigator/commute-enhanced";
import { commuteMinutesFromZipToGate } from "@/lib/navigator/distance";
import { analyzeHousingComprehensive } from "@/lib/navigator/housing-enhanced";
import { fetchMedianRent, fetchSampleListings } from "@/lib/navigator/housing";
import { generateNeighborhoodIntelligence } from "@/lib/navigator/neighborhood-intelligence";
import { analyzeSchoolsComprehensive } from "@/lib/navigator/schools-enhanced";
import { fetchSchoolsByZip, computeChildWeightedSchoolScore } from "@/lib/navigator/schools";
import { familyFitScore100, applyContextBoost } from "@/lib/navigator/score";
import { analyzeWeatherComprehensive } from "@/lib/navigator/weather-enhanced";
import { weatherComfortIndex } from "@/lib/navigator/weather";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from("entitlements")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle();

    const tier = entitlement?.tier || "free";
    const isPremium = tier === "premium" && entitlement?.status === "active";

    // Rate limiting (Free: 3/day, Premium: Unlimited)
    if (!isPremium) {
      const { data: quotaCheck } = await supabaseAdmin
        .from("api_quota")
        .select("count")
        .eq("user_id", userId)
        .eq("route", "navigator_base")
        .eq("day", new Date().toISOString().split("T")[0])
        .maybeSingle();

      const FREE_DAILY_LIMIT = 3;

      if (quotaCheck && quotaCheck.count >= FREE_DAILY_LIMIT) {
        logger.info("Navigator rate limit hit", {
          userId: userId.substring(0, 8) + "...",
          tier,
          limit: FREE_DAILY_LIMIT,
          used: quotaCheck.count,
        });

        throw Errors.rateLimitExceeded(
          `Daily limit reached (${FREE_DAILY_LIMIT} base computations/day for free tier). Upgrade to Premium for unlimited access.`
        );
      }
    }

    // Parse request
    const body: NavigatorRequest = await request.json();
    const { baseCode, bedrooms = 3, bahMonthlyCents, kidsGrades = [] } = body;

    // Find base
    const base = bases.find((b) => b.code === baseCode);
    if (!base) {
      throw Errors.notFound("Base", `Base code ${baseCode} not found`);
    }

    // Process each candidate ZIP
    const results: NeighborhoodCard[] = [];

    for (const zip of base.candidateZips) {
      // Fetch data in parallel
      let schoolsData, medianRent, sampleListings, commute, weather, amenitiesData;

      try {
        const results = await Promise.all([
          fetchSchoolsByZip(zip).catch((err) => {
            logger.warn(`Schools fetch failed for ${zip}`, { error: err });
            return [];
          }),
          fetchMedianRent(zip, bedrooms).catch((err) => {
            logger.warn(`Housing fetch failed for ${zip}`, { error: err });
            return null;
          }),
          fetchSampleListings(zip, bedrooms).catch((err) => {
            logger.warn(`Listings fetch failed for ${zip}`, { error: err });
            return [];
          }),
          commuteMinutesFromZipToGate({ zip, gate: base.gate }).catch((err) => {
            logger.warn(`Commute fetch failed for ${zip}`, { error: err });
            return { am: null, pm: null };
          }),
          weatherComfortIndex(zip).catch((err) => {
            logger.warn(`Weather fetch failed for ${zip}`, { error: err });
            return { index10: 7, note: "Weather data unavailable" };
          }),
          fetchAmenitiesData(zip).catch((err) => {
            logger.warn(`Amenities fetch failed for ${zip}`, { error: err });
            return {
              amenities_score: 6,
              grocery_stores: 0,
              restaurants: 0,
              gyms: 0,
              hospitals: 0,
              shopping_centers: 0,
              note: "Amenities data unavailable",
            };
          }),
        ]);

        [schoolsData, medianRent, sampleListings, commute, weather, amenitiesData] = results;
      } catch (error) {
        logger.error(`Failed to fetch data for ZIP ${zip}`, error);
        // Continue with next ZIP
        continue;
      }

      // Compute school score
      const { score10: schoolScore10, top: topSchools } = computeChildWeightedSchoolScore(
        schoolsData,
        kidsGrades as KidsGrade[]
      );

      // Compute family fit score (without demographics and military)
      const scoreResult = familyFitScore100({
        schools10: schoolScore10,
        medianRentCents: medianRent,
        bahMonthlyCents,
        amMin: commute.am,
        pmMin: commute.pm,
        weather10: weather.index10,
        amenities10: amenitiesData.amenities_score,
        demographics10: 0, // Removed - not using demographics
        military10: 0, // Removed - not using military
      });

      // Upsert to neighborhood_profiles
      await supabaseAdmin.from("neighborhood_profiles").upsert(
        {
          base_code: base.code,
          zip,
          bedrooms,
          median_rent_cents: medianRent,
          school_score: schoolScore10,
          commute_am_minutes: commute.am,
          commute_pm_minutes: commute.pm,
          weather_index: weather.index10,
          family_fit_score: scoreResult.total,
          payload: {
            top_schools: topSchools.slice(0, 2),
            sample_listings: sampleListings,
            weather_note: weather.note,
            commute_text:
              commute.am && commute.pm
                ? `AM ${commute.am} min / PM ${commute.pm} min`
                : "Commute estimate unavailable",
            amenities_data: {
              amenities_score: amenitiesData.amenities_score,
              grocery_stores: amenitiesData.grocery_stores,
              restaurants: amenitiesData.restaurants,
              gyms: amenitiesData.gyms,
              hospitals: amenitiesData.hospitals,
              shopping_centers: amenitiesData.shopping_centers,
              note: amenitiesData.note,
            },
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "base_code,zip,bedrooms",
        }
      );

      // Add to results
      results.push({
        zip,
        family_fit_score: scoreResult.total,
        subscores: scoreResult.subs,
        school_score: schoolScore10,
        median_rent_cents: medianRent,
        commute_am_minutes: commute.am,
        commute_pm_minutes: commute.pm,
        weather_index: weather.index10,
        payload: {
          top_schools: topSchools.slice(0, 2),
          sample_listings: sampleListings,
          weather_note: weather.note,
          commute_text:
            commute.am && commute.pm
              ? `AM ${commute.am} min / PM ${commute.pm} min`
              : "Commute estimate unavailable",
          amenities_data: {
            amenities_score: amenitiesData.amenities_score,
            grocery_stores: amenitiesData.grocery_stores,
            restaurants: amenitiesData.restaurants,
            gyms: amenitiesData.gyms,
            hospitals: amenitiesData.hospitals,
            shopping_centers: amenitiesData.shopping_centers,
            note: amenitiesData.note,
          },
        },
      });
    }

    // Sort by family_fit_score descending
    results.sort((a, b) => b.family_fit_score - a.family_fit_score);

    // ENHANCED DATA FOR TOP 3 NEIGHBORHOODS
    // Generate comprehensive intelligence reports for premium users
    logger.info("Generating enhanced intelligence for top 3 neighborhoods", {
      baseCode,
      userId: userId.substring(0, 8) + "...",
    });

    for (let i = 0; i < Math.min(3, results.length); i++) {
      const result = results[i];
      const rank = i + 1;

      try {
        // Find geocoded coordinates for this ZIP
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${result.zip}&country=us&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "GarrisonLedger/1.0",
            },
          }
        );

        if (!geocodeResponse.ok) {
          logger.warn(`Failed to geocode ${result.zip} for enhanced data`);
          continue;
        }

        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length === 0) {
          logger.warn(`No geocode results for ${result.zip}`);
          continue;
        }

        const lat = parseFloat(geocodeData[0].lat);
        const lon = parseFloat(geocodeData[0].lon);

        // Fetch enhanced amenities data (30+ categories)
        const enhancedAmenities = await fetchEnhancedAmenitiesData(result.zip, lat, lon);

        // Generate comprehensive intelligence for ALL sections
        
        // 1. Schools Intelligence
        const schoolsIntelligence = analyzeSchoolsComprehensive(
          result.payload.top_schools,
          kidsGrades as KidsGrade[]
        );
        
        // 2. Commute Intelligence  
        const commuteIntelligence = analyzeCommuteComprehensive(
          result.zip,
          lat,
          lon,
          base.gate.lat,
          base.gate.lng,
          result.commute_am_minutes,
          result.commute_pm_minutes
        );
        
        // 3. Weather Intelligence
        // Extract temperature from weather note (format: "Current: 67°F, 83% humidity, Mostly cloudy")
        const tempMatch = result.payload.weather_note.match(/(\d+)°F/);
        const humidityMatch = result.payload.weather_note.match(/(\d+)% humidity/);
        const conditionMatch = result.payload.weather_note.match(/humidity, (.+)$/);
        
        const currentTemp = tempMatch ? parseInt(tempMatch[1]) : 70;
        const currentHumidity = humidityMatch ? parseInt(humidityMatch[1]) : 50;
        const currentCondition = conditionMatch ? conditionMatch[1] : "Moderate";
        
        const weatherIntelligence = analyzeWeatherComprehensive(
          result.zip,
          currentTemp,
          currentCondition,
          currentHumidity
        );
        
        // 4. Housing Intelligence
        const housingIntelligence = analyzeHousingComprehensive(
          result.zip,
          result.median_rent_cents,
          result.payload.sample_listings,
          bahMonthlyCents,
          bedrooms
        );

        // Generate overall neighborhood intelligence report (executive summary)
        const intelligence = generateNeighborhoodIntelligence({
          zip: result.zip,
          rank,
          familyFitScore: result.family_fit_score,
          schools: result.payload.top_schools,
          schoolScore: result.school_score,
          kidsGrades: kidsGrades as KidsGrade[],
          medianRentCents: result.median_rent_cents,
          bahMonthlyCents,
          commuteAm: result.commute_am_minutes,
          commutePm: result.commute_pm_minutes,
          weatherIndex: result.weather_index,
          weatherNote: result.payload.weather_note,
          enhancedAmenities,
        });

        // Add enhanced data to result
        result.payload.intelligence = intelligence;
        result.payload.enhanced_amenities = {
          overall_score: enhancedAmenities.overall_score,
          walkability_score: enhancedAmenities.walkability_score,
          family_friendliness_score: enhancedAmenities.family_friendliness_score,
          essentials: enhancedAmenities.essentials,
          family_activities: enhancedAmenities.family_activities,
          healthcare: enhancedAmenities.healthcare,
          dining: enhancedAmenities.dining,
          fitness: enhancedAmenities.fitness,
          services: enhancedAmenities.services,
          spouse_employment: enhancedAmenities.spouse_employment,
          pets: enhancedAmenities.pets,
          community: enhancedAmenities.community,
          home_auto: enhancedAmenities.home_auto,
          total_amenities: enhancedAmenities.total_amenities,
          quick_summary: enhancedAmenities.quick_summary,
        };
        
        // Add comprehensive intelligence for all sections
        result.payload.schools_intelligence = {
          total_schools: schoolsIntelligence.total_schools,
          overall_avg_rating: schoolsIntelligence.overall_avg_rating,
          by_grade: schoolsIntelligence.by_grade,
          pcs_flexibility: schoolsIntelligence.pcs_flexibility,
          executive_summary: schoolsIntelligence.executive_summary,
          detailed_analysis: schoolsIntelligence.detailed_analysis,
        };
        
        result.payload.commute_intelligence = {
          best_departure_time: commuteIntelligence.best_departure_time,
          worst_departure_time: commuteIntelligence.worst_departure_time,
          traffic_variance: commuteIntelligence.traffic_variance,
          primary_route_miles: commuteIntelligence.primary_route_miles,
          alternative_routes_available: commuteIntelligence.alternative_routes_available,
          annual_fuel_cost: commuteIntelligence.annual_fuel_cost,
          weekly_time_cost_hours: commuteIntelligence.weekly_time_cost_hours,
          work_life_balance_score: commuteIntelligence.work_life_balance_score,
          early_duty_impact: commuteIntelligence.early_duty_impact,
          late_duty_impact: commuteIntelligence.late_duty_impact,
          weekend_flexibility: commuteIntelligence.weekend_flexibility,
          executive_summary: commuteIntelligence.executive_summary,
          bottom_line: commuteIntelligence.bottom_line,
        };
        
        result.payload.weather_intelligence = {
          seasonal_breakdown: weatherIntelligence.seasonal_breakdown,
          best_months: weatherIntelligence.best_months,
          worst_months: weatherIntelligence.worst_months,
          extreme_weather_risks: weatherIntelligence.extreme_weather_risks,
          outdoor_season_months: weatherIntelligence.outdoor_season_months,
          pool_season: weatherIntelligence.pool_season,
          park_season: weatherIntelligence.park_season,
          ac_cost_impact: weatherIntelligence.ac_cost_impact,
          heating_cost_impact: weatherIntelligence.heating_cost_impact,
          overall_comfort_score: weatherIntelligence.overall_comfort_score,
          executive_summary: weatherIntelligence.executive_summary,
          military_family_considerations: weatherIntelligence.military_family_considerations,
        };
        
        result.payload.housing_intelligence = {
          property_types: {
            single_family: { count: housingIntelligence.property_types.single_family.count },
            townhouse: { count: housingIntelligence.property_types.townhouse.count },
            apartment: { count: housingIntelligence.property_types.apartment.count },
          },
          market_trends: housingIntelligence.market_trends,
          bah_analysis: housingIntelligence.bah_analysis,
          pet_friendly_count: housingIntelligence.pet_friendly_count,
          utilities_included_count: housingIntelligence.utilities_included_count,
          yard_count: housingIntelligence.yard_count,
          military_friendly_note: housingIntelligence.military_friendly_note,
          executive_summary: housingIntelligence.executive_summary,
          bottom_line: housingIntelligence.bottom_line,
        };

        // Apply context-aware score boosting for top 3
        const boostedScore = applyContextBoost(
          result.family_fit_score,
          result.subscores,
          {
            hasKids: kidsGrades.length > 0,
            kidCount: kidsGrades.length,
            schoolScore10: result.school_score,
            totalSchools: result.payload.top_schools.length,
            medianRentCents: result.median_rent_cents,
            bahMonthlyCents,
            commuteMin: result.commute_am_minutes,
            walkabilityScore: enhancedAmenities.walkability_score,
          }
        );

        // Update score if boosted
        if (boostedScore !== result.family_fit_score) {
          result.family_fit_score = boostedScore;
        }

        logger.info(`Enhanced intelligence generated for ${result.zip} (Rank #${rank})`, {
          totalAmenities: enhancedAmenities.total_amenities,
          confidenceScore: intelligence.confidence_score,
          finalScore: result.family_fit_score,
        });
      } catch (error) {
        logger.error(`Failed to generate enhanced data for ${result.zip}`, error);
        // Continue without enhanced data for this ZIP
      }
    }

    const topResults = results.slice(0, 5);

    // Track usage (only for free users, premium is unlimited)
    if (!isPremium) {
      const { data: quotaCheck } = await supabaseAdmin
        .from("api_quota")
        .select("count")
        .eq("user_id", userId)
        .eq("route", "navigator_base")
        .eq("day", new Date().toISOString().split("T")[0])
        .maybeSingle();

      await supabaseAdmin.from("api_quota").upsert(
        {
          user_id: userId,
          route: "navigator_base",
          day: new Date().toISOString().split("T")[0],
          count: (quotaCheck?.count || 0) + 1,
        },
        {
          onConflict: "user_id,route,day",
        }
      );
    }

    // Analytics (non-blocking)
    try {
      await supabaseAdmin.from("events").insert({
        user_id: userId,
        event_type: "navigator_compute",
        payload: {
          base_code: base.code,
          bedrooms,
          result_count: topResults.length,
        },
      });
    } catch (analyticsError) {
      logger.warn("Failed to record navigator analytics", {
        error: analyticsError instanceof Error ? analyticsError.message : "Unknown",
        userId: userId.substring(0, 8) + "...",
      });
      // Continue - analytics failure shouldn't block results
    }

    const duration = Date.now() - startTime;

    logger.info("Navigator computation complete", {
      userId: userId.substring(0, 8) + "...",
      baseCode,
      zipCount: base.candidateZips.length,
      resultCount: topResults.length,
      duration_ms: duration,
      tier,
    });

    const response: NavigatorResponse = {
      base,
      results: topResults,
    };

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Navigator computation failed", error, {
      duration_ms: duration,
    });
    return errorResponse(error);
  }
}
