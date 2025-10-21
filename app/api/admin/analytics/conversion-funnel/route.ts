import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

const ADMIN_USER_IDS = ['user_2qG7CqFtj5L8X2dRNJpW0kFYW8f'];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      logger.warn('[AdminConversionFunnel] Unauthorized access attempt', { userId });
      throw Errors.forbidden('Admin access required');
    }

    const { data, error } = await supabaseAdmin.rpc('get_conversion_funnel');

    if (error) {
      logger.error('[AdminConversionFunnel] Failed to fetch conversion funnel', error, { userId });
      throw Errors.databaseError('Failed to fetch conversion funnel data');
    }

    logger.info('[AdminConversionFunnel] Funnel data fetched', { userId, stageCount: data?.length || 0 });
    return NextResponse.json({ data });

  } catch (error) {
    return errorResponse(error);
  }
}

