import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");
  const location = searchParams.get("location");

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  let query = sb
    .from("providers")
    .select("*")
    .eq("active", true)
    .order("name");

  if (type) query = query.eq("type", type);
  if (location) query = query.ilike("location", `%${location}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }

  return NextResponse.json({ providers: data || [] });
}

