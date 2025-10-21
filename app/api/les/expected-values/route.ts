/**
 * GET EXPECTED PAY VALUES
 * 
 * POST /api/les/expected-values
 * Returns expected BAH, BAS, COLA for a given month/year/rank/location
 * Used to auto-populate manual entry form
 * 
 * Security: Clerk authentication required
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { buildExpectedSnapshot } from '@/lib/les/expected';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ExpectedValuesRequest {
  month: number;
  year: number;
  rank?: string;
  location?: string;
  hasDependents?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Parse request
    const body: ExpectedValuesRequest = await req.json();
    const { month, year, rank, location, hasDependents } = body;

    // Validate inputs
    if (!month || !year) {
      throw Errors.invalidInput('month and year are required');
    }

    if (!rank || !location || hasDependents === undefined || hasDependents === null) {
      throw Errors.invalidInput('Profile incomplete: rank, location, and dependent status required');
    }

    // Build expected snapshot using the same logic as audit
    const snapshot = await buildExpectedSnapshot({
      userId,
      month,
      year,
      paygrade: rank,
      mha_or_zip: location,
      with_dependents: Boolean(hasDependents),
      yos: undefined
    });

    // Return expected values in cents (will be converted to dollars in UI)
    return NextResponse.json({
      bah: snapshot.expected.bah_cents || 0,
      bas: snapshot.expected.bas_cents || 0,
      cola: snapshot.expected.cola_cents || 0,
      snapshot: {
        paygrade: snapshot.paygrade,
        location: snapshot.mha_or_zip,
        with_dependents: snapshot.with_dependents,
        month: snapshot.month,
        year: snapshot.year
      }
    });

  } catch (error) {
    logger.error('[ExpectedValues] Failed to fetch expected values', error);
    return errorResponse(error);
  }
}

