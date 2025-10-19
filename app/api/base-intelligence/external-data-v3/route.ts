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
    windSpeed: number;
    source: string;
  };
  housing?: {
    medianRent: number;
    medianHomePrice: number;
    pricePerSqFt: number;
    marketTrend: string;
    zestimate: number;
    source: string;
  };
  cached: boolean;
  cachedAt?: string;
  requiresPremium?: boolean;
}

/**
 * Fetch real external data for a base
 * GET /api/base-intelligence/external-data-v3?baseId=fort-carson
 * 
 * GreatSchools: Premium/Pro only ($97/month)
 * Weather: Google Weather API (free, restricted key)
 * Housing: Zillow API via RapidAPI (pay per use)
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

    // 2. Google Weather API (FREE - restricted key)
    if (lat && lng && process.env.GOOGLE_WEATHER_API_KEY) {
      try {
        const weatherResponse = await fetch(
          `https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.GOOGLE_WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
        );
        
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json();
          
          if (weather.currentConditions) {
            const current = weather.currentConditions;
            
            externalData.weather = {
              avgTemp: Math.round(current.temperature || 0),
              feelsLike: Math.round(current.temperatureApparent || current.temperature || 0),
              condition: current.condition || 'N/A',
              humidity: Math.round((current.humidity || 0) * 100),
              windSpeed: Math.round(current.windSpeed || 0),
              source: 'Google Weather API'
            };
          }
        }
      } catch (error) {
        console.error('Google Weather API error:', error);
      }
    }

    // 3. Zillow API via RapidAPI (Property data)
    if (city && state && process.env.RAPIDAPI_KEY) {
      try {
        // Use Zillow's property search by location
        const housingResponse = await fetch(
          `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(city)}, ${state}&home_type=Houses&status_type=ForSale&sort=Newest`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
            }
          }
        );
        
        if (housingResponse.ok) {
          const housing = await housingResponse.json();
          
          if (housing.props && housing.props.length > 0) {
            // Calculate median values from first 20 properties
            const properties = housing.props.slice(0, 20);
            const prices = properties
              .map((p: any) => p.price)
              .filter((p: number) => p && p > 0);
            
            const pricePerSqFt = properties
              .map((p: any) => p.price / (p.livingArea || 1))
              .filter((p: number) => p && p > 0 && p < 1000); // Reasonable range
            
            const medianPrice = prices.length > 0 
              ? prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)]
              : 0;
            
            const medianPricePerSqFt = pricePerSqFt.length > 0
              ? pricePerSqFt.sort((a: number, b: number) => a - b)[Math.floor(pricePerSqFt.length / 2)]
              : 0;

            // Get Zestimate for first property as market indicator
            const firstProperty = properties[0];
            const zestimate = firstProperty.zestimate || medianPrice;

            externalData.housing = {
              medianRent: 0, // Would need rental API for this
              medianHomePrice: medianPrice,
              pricePerSqFt: Math.round(medianPricePerSqFt),
              marketTrend: medianPrice > zestimate ? 'Seller\'s Market' : 'Buyer\'s Market',
              zestimate: zestimate,
              source: 'Zillow (RapidAPI)'
            };
          }
        }
      } catch (error) {
        console.error('Zillow API error:', error);
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
    console.error('[External Data V3] Error:', error);
    return NextResponse.json({ 
      error: "Failed to fetch external data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

