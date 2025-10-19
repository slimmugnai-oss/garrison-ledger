import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

interface ExternalDataResponse {
  schools?: {
    averageRating: number;
    ratingBand: 'below_average' | 'average' | 'above_average';
    topSchool: string;
    schoolCount: number;
    source: string;
  };
  weather?: {
    avgTemp: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    source: string;
  };
  housing?: {
    medianRent: number;
    medianHomePrice: number;
    pricePerSqFt: number;
    marketTrend: string;
    source: string;
  };
  cached: boolean;
  cachedAt?: string;
  requiresPremium?: boolean;
}

/**
 * Fetch real external data for a base
 * GET /api/base-intelligence/external-data-v2?baseId=fort-carson
 * 
 * GreatSchools: Premium/Pro only ($97/month)
 * Weather: Free (WeatherAPI.com - 1M calls/month free)
 * Housing: RapidAPI (pay per use)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const baseId = searchParams.get('baseId');
    const zipCode = searchParams.get('zipCode');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!baseId) {
      return NextResponse.json({ error: "baseId required" }, { status: 400 });
    }

    // Check auth for premium features (GreatSchools)
    const { userId } = await auth();
    let userTier = 'free';
    
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier')
        .eq('clerk_id', userId)
        .maybeSingle();
      
      userTier = profile?.subscription_tier || 'free';
    }

    // Check cache first (30-day cache for external data)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: cachedData } = await supabaseAdmin
      .from('base_external_data_cache')
      .select('*')
      .eq('base_id', baseId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .maybeSingle();

    if (cachedData) {
      // Still check tier for schools
      const response = { ...cachedData.data, cached: true, cachedAt: cachedData.created_at };
      
      if (!['premium', 'pro'].includes(userTier)) {
        delete response.schools;
        response.requiresPremium = true;
      }
      
      return NextResponse.json(response);
    }

    // Fetch fresh data from external APIs
    const externalData: ExternalDataResponse = {
      cached: false
    };

    // 1. GreatSchools API (Premium/Pro only - $97/month)
    if (zipCode && process.env.GREATSCHOOLS_API_KEY && ['premium', 'pro'].includes(userTier)) {
      try {
        const schoolsResponse = await fetch(
          `https://api.greatschools.org/schools?state=${state}&zip=${zipCode}&limit=20&sort=rating&api_key=${process.env.GREATSCHOOLS_API_KEY}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        
        if (schoolsResponse.ok) {
          const schools = await schoolsResponse.json();
          
          if (schools.schools && schools.schools.length > 0) {
            // Calculate average rating
            const ratings = schools.schools
              .map((s: any) => s.rating)
              .filter((r: any) => r && r > 0);
            
            const avgRating = ratings.length > 0 
              ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
              : 0;

            // Determine rating band (below average < 5, average 5-7, above average > 7)
            let ratingBand: 'below_average' | 'average' | 'above_average' = 'average';
            if (avgRating < 5) ratingBand = 'below_average';
            else if (avgRating > 7) ratingBand = 'above_average';

            const topSchool = schools.schools[0];
            
            externalData.schools = {
              averageRating: Math.round(avgRating * 10) / 10,
              ratingBand,
              topSchool: topSchool?.name || 'N/A',
              schoolCount: schools.schools.length,
              source: 'GreatSchools.org'
            };
          }
        }
      } catch (error) {
        console.error('GreatSchools API error:', error);
      }
    } else if (!['premium', 'pro'].includes(userTier)) {
      externalData.requiresPremium = true;
    }

    // 2. WeatherAPI.com (FREE - 1M calls/month)
    if (lat && lng && process.env.WEATHERAPI_KEY) {
      try {
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${lat},${lng}&aqi=no`
        );
        
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json();
          
          externalData.weather = {
            avgTemp: Math.round(weather.current?.temp_f || 0),
            feelsLike: Math.round(weather.current?.feelslike_f || 0),
            condition: weather.current?.condition?.text || 'N/A',
            humidity: weather.current?.humidity || 0,
            source: 'WeatherAPI.com'
          };
        }
      } catch (error) {
        console.error('WeatherAPI error:', error);
      }
    }

    // 3. RapidAPI Housing Data (Realty Mole or similar)
    if (city && state && process.env.RAPIDAPI_KEY) {
      try {
        // Using Realty Mole API via RapidAPI
        const housingResponse = await fetch(
          `https://realty-mole-property-api.p.rapidapi.com/saleListings?city=${encodeURIComponent(city)}&state=${state}&limit=50`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
            }
          }
        );
        
        if (housingResponse.ok) {
          const housing = await housingResponse.json();
          
          if (housing && housing.length > 0) {
            // Calculate median values
            const prices = housing.map((h: any) => h.price).filter((p: number) => p > 0);
            const sqFtPrices = housing.map((h: any) => h.pricePerSquareFoot).filter((p: number) => p > 0);
            
            const medianPrice = prices.length > 0 
              ? prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)]
              : 0;
            
            const medianPricePerSqFt = sqFtPrices.length > 0
              ? sqFtPrices.sort((a: number, b: number) => a - b)[Math.floor(sqFtPrices.length / 2)]
              : 0;

            externalData.housing = {
              medianRent: 0, // Would need rental API for this
              medianHomePrice: medianPrice,
              pricePerSqFt: medianPricePerSqFt,
              marketTrend: 'Active market',
              source: 'Realty Mole (RapidAPI)'
            };
          }
        }
      } catch (error) {
        console.error('RapidAPI Housing error:', error);
      }
    }

    // Cache the results (cache all tiers, but filter on read)
    await supabaseAdmin
      .from('base_external_data_cache')
      .upsert({
        base_id: baseId,
        data: externalData,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'base_id'
      });

    return NextResponse.json(externalData);

  } catch (error) {
    console.error('[External Data V2] Error:', error);
    return NextResponse.json({ 
      error: "Failed to fetch external data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

