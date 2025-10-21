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
      logger.warn('[AdminTopFeatures] Unauthorized access attempt', { userId });
      throw Errors.forbidden('Admin access required');
    }

    const { data, error } = await supabaseAdmin.rpc('get_top_features', { limit_count: 10 });

    if (error) {
      logger.error('[AdminTopFeatures] Failed to fetch top features', error, { userId });
      throw Errors.databaseError('Failed to fetch top features data');
    }

    logger.info('[AdminTopFeatures] Top features fetched', { userId, count: data?.length || 0 });
    return NextResponse.json({ data });

  } catch (error) {
    return errorResponse(error);
  }
}

