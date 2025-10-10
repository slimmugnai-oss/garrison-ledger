import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

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
    // Use same pattern as working tool APIs
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('SaveAssessment - Created client');
    
    // Simple insert without .select() - might be causing the issue
    const { error } = await supabase
      .from("assessments")
      .insert({ user_id: userId, answers });
    
    console.log('SaveAssessment - Insert result, error?', !!error);
    
    if (error) {
      // If duplicate, try update
      if (error.code === '23505') {
        console.log('SaveAssessment - Duplicate, trying update');
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
      
      console.error('SaveAssessment - Insert error:', error);
      return NextResponse.json({ 
        error: "Insert failed", 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    console.log('SaveAssessment - Success!');
    return NextResponse.json({ ok: true, action: 'inserted' });
  } catch (e) {
    console.error('SaveAssessment - Exception:', e);
    return NextResponse.json({ 
      error: "Unexpected error", 
      details: e instanceof Error ? e.message : 'Unknown' 
    }, { status: 500 });
  }
}

