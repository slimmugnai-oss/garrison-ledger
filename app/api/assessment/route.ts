import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const endpoint = `${supabaseUrl}/rest/v1/assessments_v2?user_id=eq.${encodeURIComponent(userId)}&select=answers&limit=1`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      cache: "no-store"
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "load failed", details: text }, { status: 500 });
    }
    const arr = (await res.json()) as Array<{ answers?: unknown }>;
    return NextResponse.json({ answers: arr?.[0]?.answers ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "load failed", details: e instanceof Error ? e.message : String(e) }, { status: 500 });
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const rpcEndpoint = `${supabaseUrl}/rest/v1/rpc/assessments_v2_save`;
  try {
    const res = await fetch(rpcEndpoint, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ p_user_id: userId, p_answers: answers })
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "persist failed", details: text }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "persist failed", details: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

