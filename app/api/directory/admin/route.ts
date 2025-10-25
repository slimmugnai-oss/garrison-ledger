import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "edge";

function isAllowed(email: string | undefined | null) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
    if (!isAllowed(email)) {
      logger.warn('[DirectoryAdmin] Unauthorized access attempt', { email: email?.split('@')[1] });
      throw Errors.forbidden("Admin access required");
    }

    const payload = await req.json().catch(() => ({}));
    // Minimal validation
    const type = String(payload.type || "");
    if (!["agent", "lender", "property_manager", "other"].includes(type)) {
      throw Errors.invalidInput("Type must be one of: agent, lender, property_manager, other");
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
    if (error) {
      logger.error('[DirectoryAdmin] Failed to insert provider', error, { type });
      throw Errors.databaseError("Failed to create provider");
    }

    logger.info('[DirectoryAdmin] Provider created', { id: data?.id, type });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
    if (!isAllowed(email)) {
      logger.warn('[DirectoryAdmin] Unauthorized PATCH attempt', { email: email?.split('@')[1] });
      throw Errors.forbidden("Admin access required");
    }

    const payload = await req.json().catch(() => ({}));
    const id = String(payload.id || "");
    if (!id) throw Errors.invalidInput("Provider id is required");

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    const updates: Record<string, unknown> = {};
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.notes !== undefined) updates.notes = payload.notes;
    if (payload.va_expert !== undefined) updates.va_expert = payload.va_expert;
    if (payload.military_friendly !== undefined) updates.military_friendly = payload.military_friendly;
    if (payload.spouse_owned !== undefined) updates.spouse_owned = payload.spouse_owned;

    if (Object.keys(updates).length === 0) {
      throw Errors.invalidInput("No updates provided");
    }

    const { error } = await sb.from("providers").update(updates).eq("id", id);

    if (error) {
      logger.error('[DirectoryAdmin] Failed to update provider', error, { id, updateCount: Object.keys(updates).length });
      throw Errors.databaseError("Failed to update provider");
    }

    logger.info('[DirectoryAdmin] Provider updated', { id, fields: Object.keys(updates) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

