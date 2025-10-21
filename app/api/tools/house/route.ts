import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "edge";

const schema = z.object({
  price: z.number().min(0).max(5_000_000),
  rate: z.number().min(0).max(25),
  tax: z.number().min(0).max(100_000),
  ins: z.number().min(0).max(50_000),
  bah: z.number().min(0).max(20_000),
  rent: z.number().min(0).max(50_000),
});

const pmt = (rateMo:number, nper:number, pv:number)=> (pv*rateMo)/(1 - Math.pow(1+rateMo, -nper));

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Rate limiting
    const { allowed } = await checkAndIncrement(userId, "/api/tools/house", 200);
    if (!allowed) throw Errors.rateLimitExceeded();

    const raw = await req.json().catch(() => null);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      logger.warn('[HouseHack] Invalid input', { userId, errors: parsed.error.errors });
      throw Errors.invalidInput("Invalid calculator input", { validation: parsed.error.errors });
    }
    
    const { price, rate, tax, ins, bah, rent } = parsed.data;
    const rMo = (rate / 100) / 12;
    const piti = pmt(rMo, 360, price) + tax / 12 + ins / 12;
    const income = bah + rent;

    // ALL USERS GET FULL ACCESS (freemium model v2.2.0)
    // Calculators are free for everyone - no premium checks needed
    
    const result = { 
      partial: false, 
      costs: piti, 
      income, 
      verdict: income - piti 
    };

    logger.info('[HouseHack] Calculation completed', { userId, price, verdict: result.verdict });
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
