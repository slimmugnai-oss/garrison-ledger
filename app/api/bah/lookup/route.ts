import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * BAH LOOKUP API
 * 
 * Returns BAH rate for a given paygrade, MHA code, and dependent status
 * Used by calculators to auto-populate BAH from profile data
 */

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const paygrade = searchParams.get('paygrade');
    const mha = searchParams.get('mha');
    const hasDependents = searchParams.get('dependents') === 'true';

    if (!paygrade || !mha) {
      return NextResponse.json({ error: 'Missing paygrade or mha' }, { status: 400 });
    }

    // Lookup BAH rate from database
    const { data, error } = await supabaseAdmin
      .from('bah_rates')
      .select('rate_with_dependents, rate_without_dependents')
      .eq('paygrade', paygrade)
      .eq('mha', mha)
      .maybeSingle();

    if (error || !data) {
      // No exact match found - return null so calculator uses defaults
      return NextResponse.json({ 
        rate: null, 
        message: 'BAH rate not found for this paygrade/location combination' 
      });
    }

    const rate = hasDependents ? data.rate_with_dependents : data.rate_without_dependents;

    return NextResponse.json({ 
      rate,
      paygrade,
      mha,
      hasDependents,
      source: 'bah_rates_database'
    });

  } catch (error) {
    logger.error('[BAH Lookup] Error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

