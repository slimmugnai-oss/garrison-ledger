/**
 * BASE NAVIGATOR - COMPUTE RANKINGS
 * 
 * POST /api/navigator/base
 * Computes family fit scores for all candidate ZIPs near a base
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bases from '@/lib/data/bases-seed.json';
import { fetchSchoolsByZip, computeChildWeightedSchoolScore } from '@/lib/navigator/schools';
import { fetchMedianRent, fetchSampleListings } from '@/lib/navigator/housing';
import { commuteMinutesFromZipToGate } from '@/lib/navigator/distance';
import { weatherComfortIndex } from '@/lib/navigator/weather';
import { fetchCrimeData } from '@/lib/navigator/crime';
import { fetchAmenitiesData } from '@/lib/navigator/amenities';
import { fetchMilitaryAmenitiesData } from '@/lib/navigator/military';
import { familyFitScore100 } from '@/lib/navigator/score';
import type { NavigatorRequest, NavigatorResponse, NeighborhoodCard, KidsGrade } from '@/app/types/navigator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    // Rate limiting (Free: 3/day, Premium: Unlimited)
    if (!isPremium) {
      const { data: quotaCheck } = await supabaseAdmin
        .from('api_quota')
        .select('count')
        .eq('user_id', userId)
        .eq('route', 'navigator_base')
        .eq('day', new Date().toISOString().split('T')[0])
        .maybeSingle();

      const FREE_DAILY_LIMIT = 3;

      if (quotaCheck && quotaCheck.count >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          { error: `Daily limit reached (${FREE_DAILY_LIMIT} base computations/day for free tier). Upgrade to Premium for unlimited access.` },
          { status: 429 }
        );
      }
    }

    // Parse request
    const body: NavigatorRequest = await request.json();
    const { baseCode, bedrooms = 3, bahMonthlyCents, kidsGrades = [] } = body;

    // Find base
    const base = bases.find(b => b.code === baseCode);
    if (!base) {
      return NextResponse.json(
        { error: 'Unknown base code' },
        { status: 400 }
      );
    }

    // Process each candidate ZIP
    const results: NeighborhoodCard[] = [];

    for (const zip of base.candidateZips) {
      console.log(`[Navigator] Processing ZIP ${zip}...`);

      // Fetch data in parallel
      const [schoolsData, medianRent, sampleListings, commute, weather, crimeData, amenitiesData, militaryData] = await Promise.all([
        fetchSchoolsByZip(zip),
        fetchMedianRent(zip, bedrooms),
        fetchSampleListings(zip, bedrooms),
        commuteMinutesFromZipToGate({ zip, gate: base.gate }),
        weatherComfortIndex(zip),
        fetchCrimeData(zip),
        fetchAmenitiesData(zip),
        fetchMilitaryAmenitiesData(zip)
      ]);

      // Use default demographics data (no API)
      const demographicsData = {
        demographics_score: 6,
        population: 25000,
        median_age: 35,
        median_income: 75000,
        diversity_index: 0.6,
        family_households: 65,
        note: 'Demographics data not available'
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
        safety10: crimeData.safety_score,
        amenities10: amenitiesData.amenities_score,
        demographics10: demographicsData.demographics_score,
        military10: militaryData.military_score
      });

      // Upsert to neighborhood_profiles
      await supabaseAdmin
        .from('neighborhood_profiles')
        .upsert({
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
            weather_note: weather.note
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'base_code,zip,bedrooms'
        });

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
          commute_text: (commute.am && commute.pm)
            ? `AM ${commute.am} min / PM ${commute.pm} min`
            : 'Commute estimate unavailable',
          crime_data: {
            safety_score: crimeData.safety_score,
            crime_rate_per_1000: crimeData.crime_rate_per_1000,
            violent_crime_rate: crimeData.violent_crime_rate,
            property_crime_rate: crimeData.property_crime_rate,
            note: crimeData.note
          },
          amenities_data: {
            amenities_score: amenitiesData.amenities_score,
            grocery_stores: amenitiesData.grocery_stores,
            restaurants: amenitiesData.restaurants,
            gyms: amenitiesData.gyms,
            hospitals: amenitiesData.hospitals,
            shopping_centers: amenitiesData.shopping_centers,
            note: amenitiesData.note
          },
          demographics_data: {
            demographics_score: demographicsData.demographics_score,
            population: demographicsData.population,
            median_age: demographicsData.median_age,
            median_income: demographicsData.median_income,
            diversity_index: demographicsData.diversity_index,
            family_households: demographicsData.family_households,
            note: demographicsData.note
          },
          military_data: {
            military_score: militaryData.military_score,
            commissary_distance_mi: militaryData.commissary_distance_mi,
            exchange_distance_mi: militaryData.exchange_distance_mi,
            va_facility_distance_mi: militaryData.va_facility_distance_mi,
            military_housing_distance_mi: militaryData.military_housing_distance_mi,
            note: militaryData.note
          }
        }
      });
    }

    // Sort by family_fit_score descending
    results.sort((a, b) => b.family_fit_score - a.family_fit_score);

    // Track usage (only for free users, premium is unlimited)
    if (!isPremium) {
      const { data: quotaCheck } = await supabaseAdmin
        .from('api_quota')
        .select('count')
        .eq('user_id', userId)
        .eq('route', 'navigator_base')
        .eq('day', new Date().toISOString().split('T')[0])
        .maybeSingle();

      await supabaseAdmin
        .from('api_quota')
        .upsert({
          user_id: userId,
          route: 'navigator_base',
          day: new Date().toISOString().split('T')[0],
          count: (quotaCheck?.count || 0) + 1
        }, {
          onConflict: 'user_id,route,day'
        });
    }

    // Analytics
    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'navigator_compute',
        payload: {
          base_code: base.code,
          bedrooms,
          result_count: results.length
        }
      });

    const response: NavigatorResponse = {
      base,
      results
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Navigator Base] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

