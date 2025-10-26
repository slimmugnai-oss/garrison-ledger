import { NextRequest, NextResponse } from "next/server";
import { calculateDistance } from "@/lib/pcs/distance";

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, useGoogleMaps = false } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    // Use the real distance calculation function
    const result = await calculateDistance(origin, destination, useGoogleMaps);

    return NextResponse.json({
      distance: result.miles,
      origin,
      destination,
      unit: "miles",
      method: result.method,
      source: result.method === 'google-maps' 
        ? "Google Maps Distance Matrix API" 
        : result.method === 'cached'
        ? "Pre-calculated base-to-base distances"
        : "Haversine formula (straight-line distance)"
    });
  } catch (error) {
    console.error("Distance calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate distance" },
      { status: 500 }
    );
  }
}
