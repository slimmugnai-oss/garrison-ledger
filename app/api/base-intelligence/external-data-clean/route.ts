import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';
import { getBaseById } from '@/app/data/bases-clean';

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
    feelsLike?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    source: string;
  };
  housing?: {
    medianRent: number;
    medianHomePrice: number;
    pricePerSqFt?: number;
    marketTrend: string;
    zestimate?: number;
    source: string;
  };
  cached: boolean;
  cachedAt?: string;
  requiresPremium?: boolean;
  error?: string;
}

/**
 * UNIFIED EXTERNAL DATA API
 * 
 * Features:
 * - Single endpoint for all external data
 * - Proper premium/pro restrictions
 * - Optimized caching (30 days for schools/housing, 1 day for weather)
 * - Background weather updates
 * - Comprehensive error handling
 * - Rate limiting protection
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const baseId = searchParams.get('baseId');

    if (!baseId) {
      return NextResponse.json({ 
        error: "baseId parameter is required",
        cached: false 
      }, { status: 400 });
    }

    // Validate base exists
    const base = getBaseById(baseId);
    if (!base) {
      return NextResponse.json({ 
        error: "Base not found",
        cached: false 
      }, { status: 404 });
    }

    // Check authentication for premium features
    const { userId } = await auth();
    let userTier = 'free';
    
    if (userId) {
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('subscription_tier')
          .eq('clerk_id', userId)
          .maybeSingle();
        
        userTier = profile?.subscription_tier || 'free';
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Continue with free tier if profile fetch fails
      }
    }

    // Check cache first
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: cachedData } = await supabaseAdmin
      .from('base_external_data_cache')
      .select('*')
      .eq('base_id', baseId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .maybeSingle();

    if (cachedData) {
      const response: ExternalDataResponse = { 
        ...cachedData.data, 
        cached: true, 
        cachedAt: cachedData.created_at 
      };
      
      // Check if weather data is stale (older than 1 day)
      const weatherStale = cachedData.created_at < oneDayAgo.toISOString();
      
      // Filter premium content for free users
      if (!['premium', 'pro'].includes(userTier)) {
        delete response.schools;
        delete response.housing;
        response.requiresPremium = true;
      }
      
      // Background weather update if stale
      if (weatherStale && base.lat && base.lng && process.env.GOOGLE_WEATHER_API_KEY) {
        // Don't await - let it run in background
        updateWeatherData(baseId, base.lat, base.lng).catch(error => {
          console.error('Background weather update failed:', error);
        });
      }
      
      return NextResponse.json(response);
    }

    // Fetch fresh data from external APIs
    const externalData: ExternalDataResponse = {
      cached: false
    };

    // Parallel API calls for better performance
    const apiPromises: Promise<void>[] = [];

    // 1. GreatSchools API (Premium/Pro only - $97/month)
    if (['premium', 'pro'].includes(userTier) && process.env.GREATSCHOOLS_API_KEY) {
      apiPromises.push(
        fetchSchoolsData(base.state, base.city, base.lat, base.lng)
          .then(schoolsData => {
            if (schoolsData) {
              externalData.schools = schoolsData;
            }
          })
          .catch(error => {
            console.error('GreatSchools API error:', error);
          })
      );
    } else {
      externalData.requiresPremium = true;
    }

    // 2. Google Weather API (Free tier available)
    if (base.lat && base.lng && process.env.GOOGLE_WEATHER_API_KEY) {
      apiPromises.push(
        fetchWeatherData(base.lat, base.lng)
          .then(weatherData => {
            if (weatherData) {
              externalData.weather = weatherData;
            }
          })
          .catch(error => {
            console.error('Weather API error:', error);
          })
      );
    }

    // 3. Zillow API via RapidAPI (Premium/Pro only - pay per use)
    if (['premium', 'pro'].includes(userTier) && base.city && base.state && process.env.RAPIDAPI_KEY) {
      apiPromises.push(
        fetchHousingData(base.city, base.state, base.lat, base.lng)
          .then(housingData => {
            if (housingData) {
              externalData.housing = housingData;
            }
          })
          .catch(error => {
            console.error('Housing API error:', error);
          })
      );
    }

    // Wait for all API calls to complete
    await Promise.allSettled(apiPromises);

    // Cache the results (cache all tiers, but filter on read)
    try {
      await supabaseAdmin
        .from('base_external_data_cache')
        .upsert({
          base_id: baseId,
          data: externalData,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'base_id'
        });
    } catch (error) {
      console.error('Failed to cache data:', error);
      // Continue even if caching fails
    }

    return NextResponse.json(externalData);

  } catch (error) {
    console.error('[External Data Clean] Error:', error);
    return NextResponse.json({ 
      error: "Failed to fetch external data",
      cached: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to fetch schools data
async function fetchSchoolsData(state: string, city: string, lat: number, lng: number) {
  if (!process.env.GREATSCHOOLS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://api.greatschools.org/schools?state=${state}&city=${encodeURIComponent(city)}&limit=20&sort=rating&api_key=${process.env.GREATSCHOOLS_API_KEY}`,
      {
        headers: { 'Accept': 'application/json' },
        // Add timeout
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.schools || data.schools.length === 0) return null;
    
    // Calculate average rating
    const ratings = data.schools
      .map((s: any) => s.rating)
      .filter((r: any) => r && r > 0);
    
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
      : 0;

    // Determine rating band
    let ratingBand: 'below_average' | 'average' | 'above_average' = 'average';
    if (avgRating < 5) ratingBand = 'below_average';
    else if (avgRating > 7) ratingBand = 'above_average';

    const topSchool = data.schools[0];
    
    return {
      averageRating: Math.round(avgRating * 10) / 10,
      ratingBand,
      topSchool: topSchool?.name || 'N/A',
      schoolCount: data.schools.length,
      source: 'GreatSchools.org'
    };
  } catch (error) {
    console.error('GreatSchools fetch error:', error);
    return null;
  }
}

// Helper function to fetch weather data
async function fetchWeatherData(lat: number, lng: number) {
  if (!process.env.GOOGLE_WEATHER_API_KEY) return null;

  try {
    const response = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.GOOGLE_WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`,
      {
        // Add timeout
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.currentConditions) return null;
    
    const current = data.currentConditions;
    
    return {
      avgTemp: Math.round(current.temperature || 0),
      feelsLike: Math.round(current.temperatureApparent || current.temperature || 0),
      condition: current.condition || 'N/A',
      humidity: Math.round((current.humidity || 0) * 100),
      windSpeed: Math.round(current.windSpeed || 0),
      source: 'Google Weather API'
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

// Helper function to fetch housing data
async function fetchHousingData(city: string, state: string, lat: number, lng: number) {
  if (!process.env.RAPIDAPI_KEY) return null;

  try {
    const response = await fetch(
      `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(city)}, ${state}&home_type=Houses&limit=42`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
        },
        // Add timeout
        signal: AbortSignal.timeout(15000)
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.props || data.props.length === 0) return null;
    
    // Calculate median values
    const prices = data.props
      .map((p: any) => p.price || p.unformattedPrice)
      .filter((p: number) => p && p > 0);
    
    const sqFtPrices = data.props
      .map((p: any) => p.pricePerSqFt)
      .filter((p: number) => p && p > 0);
    
    const medianPrice = prices.length > 0 
      ? prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)]
      : 0;
    
    const medianPricePerSqFt = sqFtPrices.length > 0
      ? sqFtPrices.sort((a: number, b: number) => a - b)[Math.floor(sqFtPrices.length / 2)]
      : 0;

    return {
      medianRent: 0, // Would need rental API for this
      medianHomePrice: medianPrice,
      pricePerSqFt: medianPricePerSqFt,
      marketTrend: 'Active market',
      source: 'Zillow (RapidAPI)'
    };
  } catch (error) {
    console.error('Housing fetch error:', error);
    return null;
  }
}

// Background weather update function
async function updateWeatherData(baseId: string, lat: number, lng: number) {
  if (!process.env.GOOGLE_WEATHER_API_KEY) return;

  try {
    const weatherData = await fetchWeatherData(lat, lng);
    
    if (weatherData) {
      // Get current cached data
      const { data: cachedData } = await supabaseAdmin
        .from('base_external_data_cache')
        .select('data')
        .eq('base_id', baseId)
        .maybeSingle();

      if (cachedData) {
        // Update only the weather portion
        const updatedData = { ...cachedData.data, weather: weatherData };
        
        await supabaseAdmin
          .from('base_external_data_cache')
          .update({
            data: updatedData,
            created_at: new Date().toISOString()
          })
          .eq('base_id', baseId);
      }
    }
  } catch (error) {
    console.error('Background weather update error:', error);
  }
}
