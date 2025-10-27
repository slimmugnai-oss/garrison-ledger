import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse, Errors } from "@/lib/api-errors";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";

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
  }),
});

// TSP Fund Historical Returns (10-year averages as of 2024)
// Source: TSP.gov official fund performance data
// Note: Past performance does not guarantee future results
const R = { C: 0.1, S: 0.11, I: 0.07, F: 0.04, G: 0.02 }; // C=Large Cap, S=Small Cap, I=International, F=Bonds, G=Government
const L2050 = { C: 0.45, S: 0.25, I: 0.15, F: 0.1, G: 0.05 }; // Official L2050 Lifecycle Fund allocation

function fvSeries(start: number, monthly: number, years: number, annual: number) {
  const out: number[] = [start];
  let b = start;
  const rmo = Math.pow(1 + annual, 1 / 12) - 1;
  for (let i = 0; i < years * 12; i++) {
    b = b * (1 + rmo) + monthly;
    if (i % 12 === 11) out.push(b);
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Rate limiting
    const { allowed } = await checkAndIncrement(userId, "/api/tools/tsp", 200);
    if (!allowed) throw Errors.rateLimitExceeded();

    let bodyRaw: unknown;
    try {
      bodyRaw = await req.json();
    } catch {
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const parsed = schema.safeParse(bodyRaw);
    if (!parsed.success) {
      logger.warn("[TSP] Invalid input", { userId, errors: parsed.error.errors });
      throw Errors.invalidInput("Invalid calculator input", { validation: parsed.error.errors });
    }

    const body = parsed.data;
    const years = Math.max(0, Math.min(60, body.retire - body.age));

    // ALL USERS GET FULL ACCESS (freemium model v2.1.2)
    // Calculators are free for everyone - no premium checks needed

    const rDefault = L2050.C * R.C + L2050.S * R.S + L2050.I * R.I + L2050.F * R.F + L2050.G * R.G;
    const sum = Math.max(1, body.mix.C + body.mix.S + body.mix.I + body.mix.F + body.mix.G);
    const w = {
      C: body.mix.C / sum,
      S: body.mix.S / sum,
      I: body.mix.I / sum,
      F: body.mix.F / sum,
      G: body.mix.G / sum,
    };
    const rCustom = w.C * R.C + w.S * R.S + w.I * R.I + w.F * R.F + w.G * R.G;

    const A = fvSeries(body.balance, body.monthly, years, rDefault);
    const B = fvSeries(body.balance, body.monthly, years, rCustom);

    // Always return full data (all calculators are free)
    const payload = {
      partial: false,
      yearsVisible: A.length - 1,
      seriesDefault: A,
      seriesCustom: B,
      endDefault: A[A.length - 1],
      endCustom: B[B.length - 1],
      diff: B[B.length - 1] - A[A.length - 1],
    };

    logger.info("[TSP] Calculation completed", { userId, years, endValue: payload.endCustom });
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
