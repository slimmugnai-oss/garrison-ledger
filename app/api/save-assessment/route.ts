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

  // Direct REST API call to Supabase (bypassing JS client issues)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('SaveAssessment - User:', userId);
  console.log('SaveAssessment - Has URL?', !!supabaseUrl, 'Length:', supabaseUrl?.length || 0);
  console.log('SaveAssessment - Has Key?', !!supabaseKey, 'Length:', supabaseKey?.length || 0);
  console.log('SaveAssessment - URL value:', supabaseUrl);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials - URL:', !!supabaseUrl, 'Key:', !!supabaseKey);
    return NextResponse.json({ 
      error: "Server configuration error",
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    }, { status: 500 });
  }
  
  try {
    // Use direct REST API call instead of JS client
    const endpoint = `${supabaseUrl}/rest/v1/assessments`;
    
    // Try upsert via REST
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        answers,
        updated_at: new Date().toISOString()
      })
    });
    
    console.log('SaveAssessment - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SaveAssessment - API error:', errorText);
      return NextResponse.json({ 
        error: "Database save failed", 
        details: errorText,
        status: response.status
      }, { status: 500 });
    }
    
    console.log('SaveAssessment - Success!');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('SaveAssessment - Exception:', e);
    return NextResponse.json({ 
      error: "Unexpected error", 
      details: e instanceof Error ? e.message : 'Unknown' 
    }, { status: 500 });
  }
}

