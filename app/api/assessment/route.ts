import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";
// Assessment save with RPC - final fix
// Force deployment - assessment save fix

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb.from("assessments").select("answers").eq("user_id", userId).maybeSingle();
  
  return NextResponse.json({ answers: data?.answers ?? null });
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
  
  console.log('Assessment API - Saving for user:', userId);
  
  try {
    // Call RPC via direct REST API (bypasses JS client issues in Edge)
    const rpcEndpoint = `${supabaseUrl}/rest/v1/rpc/assessments_save`;
    
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_answers: answers
      })
    });
    
    console.log('Assessment API - RPC response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Assessment API - RPC error:', errorText);
      return NextResponse.json({
        error: "persist failed",
        details: errorText || 'RPC call failed',
        status: response.status
      }, { status: 500 });
    }
    
    console.log('Assessment API - Saved successfully via RPC');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Assessment API - Exception:', e);
    return NextResponse.json({
      error: "unexpected error",
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}

