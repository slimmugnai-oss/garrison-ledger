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
import { commuteMinutesFromZipToGate } from "@/lib/navigator/distance";
import { fetchMedianRent, fetchSampleListings } from "@/lib/navigator/housing";
import { fetchMilitaryAmenitiesData } from "@/lib/navigator/military";
import { fetchSchoolsByZip, computeChildWeightedSchoolScore } from "@/lib/navigator/schools";
import { familyFitScore100 } from "@/lib/navigator/score";
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
      const [
        schoolsData,
        medianRent,
        sampleListings,
        commute,
        weather,
        amenitiesData,
        militaryData,
      ] = await Promise.all([
        fetchSchoolsByZip(zip),
        fetchMedianRent(zip, bedrooms),
        fetchSampleListings(zip, bedrooms),
        commuteMinutesFromZipToGate({ zip, gate: base.gate }),
        weatherComfortIndex(zip),
        fetchAmenitiesData(zip),
        fetchMilitaryAmenitiesData(zip),
      ]);

      // Use default demographics data (no API)
      const demographicsData = {
        demographics_score: 6,
        population: 25000,
        median_age: 35,
        median_income: 75000,
        diversity_index: 0.6,
        family_households: 65,
        note: "Demographics data not available",
      };

      // Compute school score
      const { score10: schoolScore10, top: topSchools } = computeChildWeightedSchoolScore(
        schoolsData,
        kidsGrades as KidsGrade[]
      );

      // Compute family fit score
      const scoreResult = familyFitScore100({
        schools10: schoolScore10,
        medianRentCents: medianRent,
        bahMonthlyCents,
        amMin: commute.am,
        pmMin: commute.pm,
        weather10: weather.index10,
        amenities10: amenitiesData.amenities_score,
        demographics10: demographicsData.demographics_score,
        military10: militaryData.military_score,
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
          demographics_data: {
            demographics_score: demographicsData.demographics_score,
            population: demographicsData.population,
            median_age: demographicsData.median_age,
            median_income: demographicsData.median_income,
            diversity_index: demographicsData.diversity_index,
            family_households: demographicsData.family_households,
            note: demographicsData.note,
          },
          military_data: {
            military_score: militaryData.military_score,
            commissary_distance_mi: militaryData.commissary_distance_mi,
            exchange_distance_mi: militaryData.exchange_distance_mi,
            va_facility_distance_mi: militaryData.va_facility_distance_mi,
            military_housing_distance_mi: militaryData.military_housing_distance_mi,
            note: militaryData.note,
          },
        },
      });
    }

    // Sort by family_fit_score descending and limit to top 5
    results.sort((a, b) => b.family_fit_score - a.family_fit_score);
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
