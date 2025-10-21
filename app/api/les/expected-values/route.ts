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
import { supabaseAdmin } from '@/lib/supabase';
import { buildExpectedSnapshot } from '@/lib/les/expected';
import { ssot } from '@/lib/ssot';
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

    // Fetch full profile to get years of service for base pay calculation
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('time_in_service_months')
      .eq('user_id', userId)
      .maybeSingle();
    
    const yos = profile?.time_in_service_months ? Math.floor(profile.time_in_service_months / 12) : undefined;

    // Try to build expected snapshot using the same logic as audit
    let snapshot;
    try {
      snapshot = await buildExpectedSnapshot({
        userId,
        month,
        year,
        paygrade: rank,
        mha_or_zip: location,
        with_dependents: Boolean(hasDependents),
        yos
      });
    } catch (error) {
      // If exact match fails (e.g., location not in BAH table), use smart fallbacks
      logger.warn('[ExpectedValues] buildExpectedSnapshot failed, using fallbacks', { 
        rank, 
        location, 
        error 
      });
      
      // Return reasonable defaults for testing/demo (from SSOT)
      const isOfficerRank = rank?.toLowerCase().includes('officer') || 
                           rank?.toLowerCase().includes('lieutenant') ||
                           rank?.toLowerCase().includes('captain') ||
                           rank?.toLowerCase().includes('major') ||
                           rank?.toLowerCase().includes('colonel') ||
                           rank?.startsWith('O');
      
      return NextResponse.json({
        bah: Boolean(hasDependents) ? 180000 : 140000, // $1,800 with deps, $1,400 without (average CONUS)
        bas: isOfficerRank ? ssot.militaryPay.basMonthlyCents.officer : ssot.militaryPay.basMonthlyCents.enlisted,
        cola: 0, // Most CONUS locations have no COLA
        fallback: true,
        message: `Using typical ${isOfficerRank ? 'officer' : 'enlisted'} rates for ${location}. Exact BAH rate not found - this is for testing only.`
      });
    }

    // Return expected values in cents (will be converted to dollars in UI)
    // Use fallback values if database lookup failed
    const isOfficerRank = rank?.toLowerCase().includes('officer') || rank?.startsWith('O');
    
    return NextResponse.json({
      bah: snapshot.expected.bah_cents || (Boolean(hasDependents) ? 180000 : 140000),
      bas: snapshot.expected.bas_cents || (isOfficerRank ? ssot.militaryPay.basMonthlyCents.officer : ssot.militaryPay.basMonthlyCents.enlisted),
      cola: snapshot.expected.cola_cents || 0,
      base_pay: snapshot.expected.base_pay_cents || 0,
      sdap: snapshot.expected.specials?.find(sp => sp.code === 'SDAP')?.cents || 0,
      hfp_idp: snapshot.expected.specials?.find(sp => sp.code === 'HFP_IDP')?.cents || 0,
      fsa: snapshot.expected.specials?.find(sp => sp.code === 'FSA')?.cents || 0,
      flpp: snapshot.expected.specials?.find(sp => sp.code === 'FLPP')?.cents || 0,
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

