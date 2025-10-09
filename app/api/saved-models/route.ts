import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tool = req.nextUrl.searchParams.get("tool");
  if (!tool) return NextResponse.json({ error: "tool required" }, { status: 400 });

  const { data } = await supabase
    .from("saved_models")
    .select("input, output")
    .eq("user_id", userId)
    .eq("tool", tool)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ input: data?.input ?? null, output: data?.output ?? null });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tool, input, output } = await req.json();
  if (!tool || !input) return NextResponse.json({ error: "tool and input required" }, { status: 400 });

  const { error } = await supabase
    .from("saved_models")
    .upsert({
      user_id: userId,
      tool,
      input,
      output: output || null
    }, {
      onConflict: 'user_id,tool'
    });

  if (error) {
    console.error('Error saving model:', error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
