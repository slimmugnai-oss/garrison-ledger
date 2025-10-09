import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
const fv = (pv:number, r:number, years:number)=> pv * Math.pow(1+r, years);

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { amount } = await req.json();
  const years = 15;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: access } = await supabase.from("v_user_access").select("is_premium").eq("user_id", userId).single();
  const isPremium = !!access?.is_premium;

  const hy = fv(amount||0, 0.04, years);
  if (!isPremium) return NextResponse.json({ partial:true, hy });

  const cons = fv(amount||0, 0.06, years);
  const mod  = fv(amount||0, 0.08, years);
  return NextResponse.json({ partial:false, hy, cons, mod });
}
