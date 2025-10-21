/**
 * TDY ITEMS API
 * GET /api/tdy/items?tripId=XXX
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
      logger.warn('[TDYItems] Trip not found', { userId, tripId });
      throw Errors.notFound('TDY trip');
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('tdy_items_normalized')
      .select('*')
      .eq('trip_id', tripId)
      .order('tx_date', { ascending: true });

    if (itemsError) {
      logger.error('[TDYItems] Failed to fetch items', itemsError, { userId, tripId });
      throw Errors.databaseError('Failed to fetch trip items');
    }

    logger.info('[TDYItems] Items fetched', { userId, tripId, count: items?.length || 0 });
    return NextResponse.json({ items: items || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

