import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

const ADMIN_USER_IDS = ['user_2qG7CqFtj5L8X2dRNJpW0kFYW8f'];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      logger.warn('[AdminCalcRates] Unauthorized access attempt', { userId });
      throw Errors.forbidden('Admin access required');
    }

    const { data, error } = await supabaseAdmin.rpc('get_calculator_completion_rates');

    if (error) {
      logger.error('[AdminCalcRates] Failed to fetch calculator rates', error, { userId });
      throw Errors.databaseError('Failed to fetch calculator completion rates');
    }

    logger.info('[AdminCalcRates] Calculator rates fetched', { userId, count: data?.length || 0 });
    return NextResponse.json({ data });

  } catch (error) {
    return errorResponse(error);
  }
}

