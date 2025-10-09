import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { checkAndIncrement } from "@/lib/limits";
import { currentUser } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { allowed } = await checkAndIncrement(userId, "/api/support/refund", 10);
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const reason = String(body?.reason || "").slice(0, 2000);

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: ent } = await sb.from("entitlements")
    .select("stripe_subscription_id, status")
    .eq("user_id", userId).maybeSingle();

  await sb.from("refund_requests").insert({
    user_id: userId,
    email,
    reason,
    stripe_subscription_id: ent?.stripe_subscription_id ?? null
  });

  // We log the request and process manually; optional: auto-refund if within 7 days.
  // If you want auto-refund later, add a created_at check against entitlements and call Stripe refunds API.

  return NextResponse.json({ ok: true });
}

