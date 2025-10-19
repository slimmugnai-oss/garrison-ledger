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
    teaser?: boolean;
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

    // Check cache first (30-day cache for schools/housing, 1-day cache for weather)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
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
        // Show housing teaser for free users
        if (response.housing) {
          response.housing = {
            ...response.housing,
            teaser: true,
            medianRent: Math.round(response.housing.medianRent * 0.8), // Show 80% of actual rent
            medianHomePrice: Math.round(response.housing.medianHomePrice * 0.9), // Show 90% of actual price
            pricePerSqFt: Math.round(response.housing.pricePerSqFt * 0.85), // Show 85% of actual price
            marketTrend: response.housing.marketTrend,
            zestimate: Math.round(response.housing.zestimate * 0.95), // Show 95% of actual zestimate
            source: response.housing.source
          };
        }
        response.requiresPremium = true;
      }
      
      // Always fetch weather data for free users (weather is free)
      if (lat && lng && process.env.GOOGLE_WEATHER_API_KEY && !response.weather) {
        try {
          const weatherResponse = await fetch(
            `https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.GOOGLE_WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
          );
          
          if (weatherResponse.ok) {
            const weather = await weatherResponse.json();
            
            if (weather.currentConditions) {
              const current = weather.currentConditions;
              const weatherData = {
                avgTemp: Math.round((current.temperature.degrees || 0) * 9/5 + 32), // Convert Celsius to Fahrenheit
                feelsLike: Math.round((current.feelsLikeTemperature.degrees || current.temperature.degrees || 0) * 9/5 + 32),
                condition: current.weatherCondition?.description?.text || 'N/A',
                humidity: Math.round((current.relativeHumidity || 0)),
                windSpeed: Math.round((current.wind?.speed?.value || 0) * 0.621371), // Convert km/h to mph
                source: 'Google Weather API'
              };
              
              response.weather = weatherData;
              
              // Update cache with new weather data
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
          console.error('Weather API error:', error);
        }
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
              avgTemp: Math.round((current.temperature.degrees || 0) * 9/5 + 32), // Convert Celsius to Fahrenheit
              feelsLike: Math.round((current.feelsLikeTemperature.degrees || current.temperature.degrees || 0) * 9/5 + 32),
              condition: current.weatherCondition?.description?.text || 'N/A',
              humidity: Math.round((current.relativeHumidity || 0)),
              windSpeed: Math.round((current.wind?.speed?.value || 0) * 0.621371), // Convert km/h to mph
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
        // Step 1: Get properties using /propertyExtendedSearch
        const searchResponse = await fetch(
          `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(city)}, ${state}&home_type=Houses&status_type=ForSale&sort=Newest&limit=20`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
            }
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.props && searchData.props.length > 0) {
            // Calculate median values from properties
            const properties = searchData.props;
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

            // Step 2: Get Zestimate for first property using /zestimate
            let zestimate = 0;
            const firstProperty = properties[0];
            if (firstProperty.zpid) {
              try {
                const zestimateResponse = await fetch(
                  `https://zillow-com1.p.rapidapi.com/zestimate?zpid=${firstProperty.zpid}`,
                  {
                    headers: {
                      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
                    }
                  }
                );
                
                if (zestimateResponse.ok) {
                  const zestimateData = await zestimateResponse.json();
                  zestimate = zestimateData.zestimate || firstProperty.zestimate || medianPrice;
                }
              } catch (zestimateError) {
                console.error('Zestimate API error:', zestimateError);
                zestimate = firstProperty.zestimate || medianPrice;
              }
            } else {
              zestimate = firstProperty.zestimate || medianPrice;
            }

            // Step 3: Get market trend using /valueHistory/localHomeValues
            let marketTrend = 'Active Market';
            try {
              const trendResponse = await fetch(
                `https://zillow-com1.p.rapidapi.com/valueHistory/localHomeValues?location=${encodeURIComponent(city)}, ${state}`,
                {
                  headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
                  }
                }
              );
              
              if (trendResponse.ok) {
                const trendData = await trendResponse.json();
                // Analyze trend data to determine market condition
                if (trendData.history && trendData.history.length > 1) {
                  const recent = trendData.history[0];
                  const previous = trendData.history[1];
                  const change = ((recent.value - previous.value) / previous.value) * 100;
                  
                  if (change > 5) marketTrend = 'Seller\'s Market';
                  else if (change < -5) marketTrend = 'Buyer\'s Market';
                  else marketTrend = 'Balanced Market';
                }
              }
            } catch (trendError) {
              console.error('Market trend API error:', trendError);
              // Fallback to simple comparison
              marketTrend = medianPrice > zestimate ? 'Seller\'s Market' : 'Buyer\'s Market';
            }

            externalData.housing = {
              medianRent: 0, // Would need /rentEstimate endpoint for this
              medianHomePrice: medianPrice,
              pricePerSqFt: Math.round(medianPricePerSqFt),
              marketTrend: marketTrend,
              zestimate: zestimate,
              source: 'Zillow (RapidAPI)'
            };
          }
        }
      } catch (error) {
        console.error('Zillow API error:', error);
      }
    }

    // Apply teaser logic for free users
    if (!['premium', 'pro'].includes(userTier)) {
      delete externalData.schools;
      // Show housing teaser for free users
      if (externalData.housing) {
        externalData.housing = {
          ...externalData.housing,
          teaser: true,
          medianRent: Math.round(externalData.housing.medianRent * 0.8), // Show 80% of actual rent
          medianHomePrice: Math.round(externalData.housing.medianHomePrice * 0.9), // Show 90% of actual price
          pricePerSqFt: Math.round(externalData.housing.pricePerSqFt * 0.85), // Show 85% of actual price
          marketTrend: externalData.housing.marketTrend,
          zestimate: Math.round(externalData.housing.zestimate * 0.95), // Show 95% of actual zestimate
          source: externalData.housing.source
        };
      }
      externalData.requiresPremium = true;
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

