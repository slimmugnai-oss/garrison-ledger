import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { checkAndIncrement } from "@/lib/limits";

export const runtime = "edge";

const schema = z.object({ 
  amount: z.number().min(0).max(1_000_000) 
});

const fv = (pv:number, r:number, years:number)=> pv * Math.pow(1+r, years);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // Rate limiting
  const { allowed } = await checkAndIncrement(userId, "/api/tools/sdp", 200);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  
  const { amount } = parsed.data;
  const years = 15;

  // ALL USERS GET FULL ACCESS (freemium model v2.2.0)
  // Calculators are free for everyone - no premium checks needed
  
  // Calculate all scenarios
  const hy = fv(amount||0, 0.04, years);
  const cons = fv(amount||0, 0.06, years);
  const mod  = fv(amount||0, 0.08, years);
  
  // Always return full data (all calculators are free)
  return NextResponse.json({ 
    partial: false, 
    hy, 
    cons, 
    mod 
  });
}
