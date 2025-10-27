import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse, Errors } from "@/lib/api-errors";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";

export const runtime = "edge";

const schema = z.object({ 
  amount: z.number().min(0).max(1_000_000) 
});

const fv = (pv:number, r:number, years:number)=> pv * Math.pow(1+r, years);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();
    
    // Rate limiting
    const { allowed } = await checkAndIncrement(userId, "/api/tools/sdp", 200);
    if (!allowed) throw Errors.rateLimitExceeded();
    
    const raw = await req.json().catch(() => null);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      logger.warn('[SDP] Invalid input', { userId, errors: parsed.error.errors });
      throw Errors.invalidInput("Invalid calculator input", { validation: parsed.error.errors });
    }
    
    const { amount } = parsed.data;
    const years = 15;

    // ALL USERS GET FULL ACCESS (freemium model v2.2.0)
    // Calculators are free for everyone - no premium checks needed
    
    // Calculate all scenarios
    // SDP (Savings Deposit Program) official rate: 10% APR (10 USC § 1035)
    // Comparison scenarios for context
    const sdp = fv(amount||0, 0.10, years);  // Official SDP rate: 10% APR
    const hy = fv(amount||0, 0.04, years);   // High-yield savings comparison
    const cons = fv(amount||0, 0.08, years); // Conservative investment comparison
    
    const result = { 
      partial: false, 
      sdp,  // Official SDP at 10% APR
      hy,   // High-yield savings at 4% 
      cons  // Conservative investment at 8%
    };

    logger.info('[SDP] Calculation completed', { userId, amount, sdpValue: sdp });
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
