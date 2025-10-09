import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { userId } = await auth(); // ok if null
  let payload: any = {};
  try { payload = await req.json(); } catch {}
  const name = String(payload?.name || "").slice(0, 120);
  if (!name) return NextResponse.json({ ok: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from("events").insert({
    user_id: userId ?? null,
    name,
    path: payload?.path?.slice(0, 400) ?? null,
    props: payload?.props ?? null,
    ua: req.headers.get("user-agent")?.slice(0, 400) ?? null,
  });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control":"no-store" } });
}

