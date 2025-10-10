import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { answers?: unknown } = {};
  try { body = await req.json(); } catch {}
  const answers = body?.answers ?? null;
  if (!answers) return NextResponse.json({ error: "answers required" }, { status: 400 });

  // Create Supabase client with explicit config for Node runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  
  const sb = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('SaveAssessment - User:', userId);
  
  try {
    // Try insert first
    const { error: insertError } = await sb
      .from("assessments")
      .insert({ user_id: userId, answers });
    
    // If duplicate, update instead
    if (insertError?.code === '23505') {
      const { error: updateError } = await sb
        .from("assessments")
        .update({ answers, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error('SaveAssessment - Update error:', updateError);
        return NextResponse.json({ 
          error: "Update failed", 
          details: updateError.message,
          code: updateError.code
        }, { status: 500 });
      }
      
      return NextResponse.json({ ok: true, action: 'updated' });
    }
    
    if (insertError) {
      console.error('SaveAssessment - Insert error:', insertError);
      return NextResponse.json({ 
        error: "Insert failed", 
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, action: 'inserted' });
  } catch (e) {
    console.error('SaveAssessment - Exception:', e);
    return NextResponse.json({ 
      error: "Unexpected error", 
      details: e instanceof Error ? e.message : 'Unknown' 
    }, { status: 500 });
  }
}

