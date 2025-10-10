import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const endpoint = `${url}/rest/v1/assessments?user_id=eq.${encodeURIComponent(userId)}&select=answers&limit=1`;
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'public' },
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'load failed', details: text }, { status: 500 });
    }
    const rows = (await res.json()) as Array<{ answers?: unknown }>;
    return NextResponse.json({ answers: rows?.[0]?.answers ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: 'load failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { allowed } = await checkAndIncrement(userId, "/api/assessment", 100);
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  let body: { answers?: unknown } = {};
  try { body = await req.json(); } catch {}
  const answers = body?.answers ?? null;
  if (!answers) return NextResponse.json({ error: "answers required" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const rpc = `${url}/rest/v1/rpc/assessments_save`;
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Profile': 'public' },
      body: JSON.stringify({ p_user_id: userId, p_answers: answers })
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'persist failed', details: text }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: 'persist failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

