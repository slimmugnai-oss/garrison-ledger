import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
const pmt = (rateMo:number, nper:number, pv:number)=> (pv*rateMo)/(1 - Math.pow(1+rateMo, -nper));

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { price, rate, tax, ins, bah, rent } = await req.json();
  const rMo = (Number(rate||0)/100)/12;
  const piti = pmt(rMo, 360, Number(price||0)) + Number(tax||0)/12 + Number(ins||0)/12;
  const income = Number(bah||0) + Number(rent||0);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: access } = await supabase.from("v_user_access").select("is_premium").eq("user_id", userId).single();
  const isPremium = !!access?.is_premium;

  if (!isPremium) return NextResponse.json({ partial:true, costs:piti, income });
  return NextResponse.json({ partial:false, costs:piti, income, verdict: income - piti });
}
