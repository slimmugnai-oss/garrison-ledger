import { NextResponse } from "next/server";

// Temporary fallback - just returns ok so localStorage can be used
export async function POST() {
  return NextResponse.json({ ok: true, method: 'localStorage' });
}

export async function GET() {
  return NextResponse.json({ answers: null, method: 'localStorage' });
}

