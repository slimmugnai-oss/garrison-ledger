import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

interface ExternalDataResponse {
  schools?: {
    averageRating: number;
    topSchool: string;
    schoolCount: number;
    source: string;
  };
  weather?: {
    avgTemp: number;
    precipitation: number;
    climate: string;
    source: string;
  };
  housing?: {
    medianRent: number;
    medianHomePrice: number;
    marketTrend: string;
    source: string;
  };
  cached: boolean;
  cachedAt?: string;
}

/**
 * Fetch real external data for a base
 * GET /api/base-intelligence/external-data?baseId=fort-carson
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const baseId = searchParams.get('baseId');
    const zipCode = searchParams.get('zipCode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!baseId) {
      return NextResponse.json({ error: "baseId required" }, { status: 400 });
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
      return NextResponse.json({
        ...cachedData.data,
        cached: true,
        cachedAt: cachedData.created_at
      });
    }

    // Fetch fresh data from external APIs
    const externalData: ExternalDataResponse = {
      cached: false
    };

    // 1. GreatSchools API (if zipCode provided)
    if (zipCode && process.env.GREATSCHOOLS_API_KEY) {
      try {
        const schoolsResponse = await fetch(
          `https://api.greatschools.org/schools?state=&zip=${zipCode}&limit=10&key=${process.env.GREATSCHOOLS_API_KEY}`
        );
        
        if (schoolsResponse.ok) {
          const schools = await schoolsResponse.json();
          const ratings = schools.schools
            ?.map((s: any) => s.rating)
            .filter((r: any) => r && r > 0);
          
          if (ratings && ratings.length > 0) {
            const avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
            const topSchool = schools.schools[0];
            
            externalData.schools = {
              averageRating: Math.round(avgRating * 10) / 10,
              topSchool: topSchool?.name || 'N/A',
              schoolCount: schools.schools?.length || 0,
              source: 'GreatSchools.org'
            };
          }
        }
      } catch (error) {
        console.error('GreatSchools API error:', error);
      }
    }

    // 2. OpenWeatherMap API (if lat/lng provided)
    if (lat && lng && process.env.OPENWEATHER_API_KEY) {
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json();
          
          externalData.weather = {
            avgTemp: Math.round(weather.main?.temp || 0),
            precipitation: 0, // Would need historical data API for this
            climate: weather.weather?.[0]?.description || 'N/A',
            source: 'OpenWeatherMap'
          };
        }
      } catch (error) {
        console.error('OpenWeatherMap API error:', error);
      }
    }

    // 3. Housing Data (placeholder - would integrate with Zillow or similar)
    // Note: Zillow API is deprecated, but we can use RapidAPI alternatives
    // For now, we'll leave this as a placeholder for future integration
    externalData.housing = {
      medianRent: 0,
      medianHomePrice: 0,
      marketTrend: 'Data not available',
      source: 'Coming soon'
    };

    // Cache the results
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
    console.error('[External Data] Error:', error);
    return NextResponse.json({ 
      error: "Failed to fetch external data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

