/**
 * TDY DOCS API
 * GET /api/tdy/docs?tripId=XXX
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const tripId = request.nextUrl.searchParams.get('tripId');
    if (!tripId) throw Errors.invalidInput('tripId query parameter is required');

    // Verify ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('tdy_trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip || trip.user_id !== userId) {
      logger.warn('[TDYDocs] Trip not found', { userId, tripId });
      throw Errors.notFound('TDY trip');
    }

    const { data: docs, error: docsError } = await supabaseAdmin
      .from('tdy_docs')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (docsError) {
      logger.error('[TDYDocs] Failed to fetch docs', docsError, { userId, tripId });
      throw Errors.databaseError('Failed to fetch trip documents');
    }

    logger.info('[TDYDocs] Docs fetched', { userId, tripId, count: docs?.length || 0 });
    return NextResponse.json({ docs: docs || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

