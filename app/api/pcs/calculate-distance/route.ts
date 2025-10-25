import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    // For now, return a mock distance calculation
    // In production, this would use Google Maps API or similar
    const mockDistance = Math.floor(Math.random() * 2000) + 100; // 100-2100 miles

    return NextResponse.json({
      distance: mockDistance,
      origin,
      destination,
      unit: "miles",
      source: "Mock calculation - verify with finance office"
    });
  } catch (error) {
    console.error("Distance calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate distance" },
      { status: 500 }
    );
  }
}
