import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { checkAndIncrement } from "@/lib/limits";

// Use Node runtime so Clerk server client works for fallback storage
export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const endpoint = `${url}/rest/v1/assessments?user_id=eq.${encodeURIComponent(userId)}&select=answers&limit=1`;
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'public', 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      // Fallback: read from Clerk private metadata
      try {
        const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
        const u = await backend.users.getUser(userId);
        const fromClerk = (u?.privateMetadata as Record<string, unknown> | undefined)?.assessment ?? null;
        return NextResponse.json({ answers: fromClerk ?? null, source: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
      } catch {
        return NextResponse.json({
          error: 'load failed',
          details: text || 'request failed',
          meta: {
            endpointHost: (()=>{ try { return new URL(endpoint).host; } catch { return 'n/a'; } })(),
            hasKey: Boolean(key),
            keyLen: (key || '').length
          }
        }, { status: 500 });
      }
    }
    const rows = (await res.json()) as Array<{ answers?: unknown }>;
    return NextResponse.json({ answers: rows?.[0]?.answers ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    // Fallback: read from Clerk private metadata
    try {
      const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
      const u = await backend.users.getUser(userId);
      const fromClerk = (u?.privateMetadata as Record<string, unknown> | undefined)?.assessment ?? null;
      return NextResponse.json({ answers: fromClerk ?? null, source: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return NextResponse.json({
        error: 'load failed',
        details: e instanceof Error ? e.message : String(e),
        meta: { hasKey: Boolean(key), keyLen: (key || '').length }
      }, { status: 500 });
    }
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
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Profile': 'public', 'Prefer': 'params=single-object' },
      body: JSON.stringify({ p_user_id: userId, p_answers: answers })
    });
    if (!res.ok) {
      const text = await res.text();
      // Fallback: direct upsert to table via REST
      const upsertEndpoint = `${url}/rest/v1/assessments?on_conflict=user_id`;
      const up = await fetch(upsertEndpoint, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Content-Profile': 'public',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify([{ user_id: userId, answers }])
      });
      if (!up.ok) {
        // Final fallback: persist in Clerk private metadata
        try {
          const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
          await backend.users.updateUser(userId, { privateMetadata: { assessment: answers } as Record<string, unknown> });
          return NextResponse.json({ ok: true, stored: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
        } catch {
          const upText = await up.text();
          return NextResponse.json({
            error: 'persist failed',
            details: upText || text || 'request failed',
            meta: {
              endpointHost: (()=>{ try { return new URL(upsertEndpoint).host; } catch { return 'n/a'; } })(),
              hasKey: Boolean(key),
              keyLen: (key || '').length
            }
          }, { status: 500 });
        }
      }
    }
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    // Final fallback: persist in Clerk private metadata
    try {
      const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
      await backend.users.updateUser(userId, { privateMetadata: { assessment: answers } as Record<string, unknown> });
      return NextResponse.json({ ok: true, stored: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return NextResponse.json({
        error: 'persist failed',
        details: e instanceof Error ? e.message : String(e),
        meta: { hasKey: Boolean(key), keyLen: (key || '').length }
      }, { status: 500 });
    }
  }
}

