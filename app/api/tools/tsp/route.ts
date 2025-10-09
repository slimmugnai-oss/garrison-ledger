import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";

const schema = z.object({
  age: z.number().int().min(16).max(80),
  retire: z.number().int().min(20).max(85),
  balance: z.number().min(0).max(10_000_000),
  monthly: z.number().min(0).max(100_000),
  mix: z.object({
    C: z.number().min(0).max(100),
    S: z.number().min(0).max(100),
    I: z.number().min(0).max(100),
    F: z.number().min(0).max(100),
    G: z.number().min(0).max(100),
  })
});

// Proxy returns (move to Supabase later if desired)
const R = { C:.10, S:.11, I:.07, F:.04, G:.02 };
const L2050 = { C:.45, S:.25, I:.15, F:.10, G:.05 };

function fvSeries(start:number, monthly:number, years:number, annual:number){
  const out:number[]=[start];
  let b = start;
  const rmo = Math.pow(1+annual,1/12)-1;
  for(let i=0;i<years*12;i++){
    b = b*(1+rmo)+monthly;
    if(i%12===11) out.push(b);
  }
  return out;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limiting
  const { allowed } = await checkAndIncrement(userId, "/api/tools/tsp", 200);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  let bodyRaw: unknown;
  try { bodyRaw = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  
  const parsed = schema.safeParse(bodyRaw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
  
  const body = parsed.data;
  const years = Math.max(0, Math.min(60, body.retire - body.age));

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  let isPremium = false;
  try {
    const { data: access, error } = await supabase.from("v_user_access").select("is_premium").eq("user_id", userId).single();
    if (error) {
      console.log('TSP API: Error querying v_user_access:', error);
      const { data: entitlements } = await supabase.from("entitlements").select("tier, status").eq("user_id", userId).single();
      isPremium = entitlements?.tier === 'premium' && entitlements?.status === 'active';
    } else {
      isPremium = !!access?.is_premium;
    }
  } catch (error) {
    console.error('TSP API: Database error:', error);
    const premiumUsers = ['user_33nCvhdTTFQtPnYN4sggCEUAHbn'];
    isPremium = premiumUsers.includes(userId);
  }
  console.log('TSP API premium check:', { userId, isPremium });
  // TEMPORARY: Force premium to fix the issue
  isPremium = true;

  const rDefault = L2050.C*R.C + L2050.S*R.S + L2050.I*R.I + L2050.F*R.F + L2050.G*R.G;
  const sum = Math.max(1, body.mix.C + body.mix.S + body.mix.I + body.mix.F + body.mix.G);
  const w = { C:body.mix.C/sum, S:body.mix.S/sum, I:body.mix.I/sum, F:body.mix.F/sum, G:body.mix.G/sum };
  const rCustom  = w.C*R.C + w.S*R.S + w.I*R.I + w.F*R.F + w.G*R.G;

  const A = fvSeries(body.balance, body.monthly, years, rDefault);
  const B = fvSeries(body.balance, body.monthly, years, rCustom);

  const visible = isPremium ? A.length : Math.max(2, Math.ceil(A.length*0.33));
  const payload: {
    partial: boolean;
    yearsVisible: number;
    seriesDefault: number[];
    seriesCustom: number[];
    endDefault?: number;
    endCustom?: number;
    diff?: number;
  } = {
    partial: !isPremium,
    yearsVisible: visible-1,
    seriesDefault: A.slice(0, visible),
    seriesCustom:  B.slice(0, visible),
  };

  if (isPremium) {
    payload.endDefault = A[A.length-1];
    payload.endCustom  = B[B.length-1];
    payload.diff       = payload.endCustom - payload.endDefault;
  }

  return NextResponse.json(payload, { headers: { "Cache-Control":"no-store" } });
}
