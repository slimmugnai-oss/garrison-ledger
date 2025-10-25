import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      logger.warn('[AdminContentPending] Unauthorized access attempt', { userId });
      throw Errors.forbidden('Admin access required');
    }

    // Get feed items that are pending review or approved
    const { data, error } = await supabaseAdmin
      .from('feed_items')
      .select('*')
      .in('status', ['new', 'needs_review', 'approved_for_conversion'])
      .order('published_at', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('[AdminContentPending] Failed to fetch pending content', error, { userId });
      throw Errors.databaseError('Failed to fetch pending content');
    }

    logger.info('[AdminContentPending] Pending content fetched', { userId, count: data?.length || 0 });
    return NextResponse.json({
      success: true,
      items: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

