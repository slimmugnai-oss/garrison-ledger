import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";

function toLike(s?: string) {
  return s ? `%${s.trim()}%` : null;
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "";
  const state = url.searchParams.get("state") || "";
  const onlyMil = url.searchParams.get("mil") === "1";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(5, parseInt(url.searchParams.get("size") || "20")));
  const offset = (page - 1) * pageSize;

  await checkAndIncrement(userId, "/api/directory/providers", 400);

  // Query approved providers
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  let query = sb.from("providers").select(`
    id, type, name, business_name, email, phone, website, calendly,
    state, city, zip, stations, coverage_states,
    military_friendly, spouse_owned, va_expert, notes, license_id, created_at
  `, { count: "exact" }).eq("status", "approved");

  if (type) query = query.eq("type", type);
  if (state) query = query.eq("state", state.toUpperCase());
  if (onlyMil) query = query.eq("military_friendly", true);
  if (q) {
    // lightweight text search
    const likeTerm = toLike(q);
    if (likeTerm) {
      query = query.or(`name.ilike.${likeTerm},business_name.ilike.${likeTerm},city.ilike.${likeTerm},notes.ilike.${likeTerm}`);
    }
  }

  query = query.order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });

  return NextResponse.json({ items: data || [], total: count || 0, page, pageSize }, { headers: { "Cache-Control": "no-store" } });
}

