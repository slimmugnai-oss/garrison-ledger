import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";
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

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  console.log('Assessment API - Saving for user:', userId);
  
  // IMPORTANT: explicit conflict target prevents "internal error" if PK != user_id
  const { error } = await sb
    .from("assessments")
    .upsert({ user_id: userId, answers }, { onConflict: "user_id" });

  if (error) {
    console.error('Assessment API - Upsert error:', error);
    return NextResponse.json({
      error: "persist failed",
      details: error.message || String(error),
      code: error.code || ""
    }, { status: 500 });
  }

  console.log('Assessment API - Saved successfully');
  return NextResponse.json({ ok: true });
}

