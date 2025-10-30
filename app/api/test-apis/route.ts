/**
 * TEST API ENDPOINT - Verify all Navigator APIs work
 * DELETE THIS FILE after testing
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment_variables: {
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 10)}...` : "MISSING",
      SCHOOLDIGGER_APP_ID: process.env.SCHOOLDIGGER_APP_ID || "MISSING",
      SCHOOLDIGGER_APP_KEY: process.env.SCHOOLDIGGER_APP_KEY ? `${process.env.SCHOOLDIGGER_APP_KEY.substring(0, 10)}...` : "MISSING",
    },
    api_tests: {} as any,
  };

  const testZip = "23511";
  const testLat = 36.8508;
  const testLon = -76.2859;

  // Test Weather API
  try {
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${testLat}&location.longitude=${testLon}&key=${process.env.GOOGLE_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    
    results.api_tests.weather = {
      status: weatherRes.status,
      success: weatherRes.ok,
      data: weatherRes.ok ? {
        temperature: weatherData.temperature,
        condition: weatherData.weatherCondition?.description?.text,
        humidity: weatherData.relativeHumidity,
      } : weatherData,
    };
  } catch (error: any) {
    results.api_tests.weather = { error: error.message };
  }

  // Test Places API
  try {
    const placesRes = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!,
        "X-Goog-FieldMask": "places.displayName",
      },
      body: JSON.stringify({
        includedTypes: ["supermarket"],
        maxResultCount: 5,
        locationRestriction: {
          circle: {
            center: { latitude: testLat, longitude: testLon },
            radius: 5000.0,
          },
        },
      }),
    });
    const placesData = await placesRes.json();
    
    results.api_tests.places = {
      status: placesRes.status,
      success: placesRes.ok,
      count: placesData.places?.length || 0,
      data: placesRes.ok ? placesData.places?.slice(0, 3) : placesData,
    };
  } catch (error: any) {
    results.api_tests.places = { error: error.message };
  }

  // Test Distance Matrix API
  try {
    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${testZip}&destinations=${testLat},${testLon}&departure_time=${Math.floor(Date.now() / 1000)}&traffic_model=best_guess&key=${process.env.GOOGLE_API_KEY}`;
    const distanceRes = await fetch(distanceUrl);
    const distanceData = await distanceRes.json();
    
    results.api_tests.distance = {
      status: distanceRes.status,
      success: distanceRes.ok && distanceData.status === "OK",
      data: distanceRes.ok ? {
        status: distanceData.status,
        duration: distanceData.rows?.[0]?.elements?.[0]?.duration_in_traffic,
      } : distanceData,
    };
  } catch (error: any) {
    results.api_tests.distance = { error: error.message };
  }

  // Test SchoolDigger API
  try {
    const schoolUrl = `https://api.schooldigger.com/v2.3/schools?st=VA&zip=${testZip}&perPage=5&page=1&sortBy=rank&appID=${process.env.SCHOOLDIGGER_APP_ID}&appKey=${process.env.SCHOOLDIGGER_APP_KEY}`;
    const schoolRes = await fetch(schoolUrl);
    const schoolData = await schoolRes.json();
    
    results.api_tests.schooldigger = {
      status: schoolRes.status,
      success: schoolRes.ok,
      count: schoolData.schoolList?.length || 0,
      data: schoolRes.ok ? schoolData.schoolList?.slice(0, 2).map((s: any) => ({ name: s.schoolName })) : schoolData,
    };
  } catch (error: any) {
    results.api_tests.schooldigger = { error: error.message };
  }

  return NextResponse.json(results, { status: 200 });
}

