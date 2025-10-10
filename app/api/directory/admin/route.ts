import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

function isAllowed(email: string | undefined | null) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!isAllowed(email)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const payload = await req.json().catch(() => ({}));
  // Minimal validation
  const type = String(payload.type || "");
  if (!["agent", "lender", "property_manager", "other"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const insert = {
    status: payload.status ?? "approved",
    created_by: user?.id ?? null,
    name: payload.name ?? null,
    business_name: payload.business_name ?? null,
    type,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    website: payload.website ?? null,
    calendly: payload.calendly ?? null,
    state: (payload.state || "").toUpperCase() || null,
    city: payload.city ?? null,
    zip: payload.zip ?? null,
    stations: payload.stations ?? [],
    coverage_states: (payload.coverage_states || []).map((s: string) => s.toUpperCase()),
    military_friendly: !!payload.military_friendly,
    spouse_owned: !!payload.spouse_owned,
    va_expert: !!payload.va_expert,
    license_id: payload.license_id ?? null,
    notes: payload.notes ?? null,
  };

  const { data, error } = await sb.from("providers").insert(insert).select("id").single();
  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!isAllowed(email)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const payload = await req.json().catch(() => ({}));
  const id = String(payload.id || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const updates: Record<string, unknown> = {};
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.notes !== undefined) updates.notes = payload.notes;
  if (payload.va_expert !== undefined) updates.va_expert = payload.va_expert;
  if (payload.military_friendly !== undefined) updates.military_friendly = payload.military_friendly;
  if (payload.spouse_owned !== undefined) updates.spouse_owned = payload.spouse_owned;

  const { error } = await sb.from("providers").update(updates).eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

