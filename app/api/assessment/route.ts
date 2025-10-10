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
  console.log('Assessment API - Answers type:', typeof answers);
  
  try {
    // First try to insert
    const { data: insertData, error: insertError } = await sb
      .from("assessments")
      .insert({ user_id: userId, answers: answers as Record<string, unknown> })
      .select();
    
    // If insert fails due to duplicate, update instead
    if (insertError && insertError.code === '23505') {
      const { error: updateError } = await sb
        .from("assessments")
        .update({ answers: answers as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error('Assessment API - Update error:', updateError);
        return NextResponse.json({ 
          error: "persist failed", 
          details: updateError.message || 'Update failed',
          code: updateError.code
        }, { status: 500 });
      }
      
      console.log('Assessment API - Updated successfully');
      return NextResponse.json({ ok: true });
    }
    
    if (insertError) {
      console.error('Assessment API - Insert error:', insertError);
      console.error('Assessment API - Error details:', JSON.stringify(insertError));
      return NextResponse.json({ 
        error: "persist failed", 
        details: insertError.message || insertError.hint || 'Unknown database error',
        code: insertError.code
      }, { status: 500 });
    }
    
    console.log('Assessment API - Inserted successfully');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Assessment API - Unexpected error:', e);
    return NextResponse.json({ 
      error: "persist failed", 
      details: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 });
  }
}

