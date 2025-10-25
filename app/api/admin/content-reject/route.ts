import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      logger.warn('[AdminContentReject] Unauthorized access attempt', { userId });
      throw Errors.forbidden('Admin access required');
    }

    const body = await req.json();
    const { feedItemId } = body;

    if (!feedItemId) {
      throw Errors.invalidInput('feedItemId is required');
    }

    // Update status to news_only (rejected for conversion)
    const { error } = await supabaseAdmin
      .from('feed_items')
      .update({ status: 'news_only' })
      .eq('id', feedItemId);

    if (error) {
      logger.error('[AdminContentReject] Failed to reject item', error, { userId, feedItemId });
      throw Errors.databaseError('Failed to update content status');
    }

    logger.info('[AdminContentReject] Item rejected', { userId, feedItemId });
    return NextResponse.json({
      success: true,
      message: 'Item marked as news only',
    });
  } catch (error) {
    return errorResponse(error);
  }
}

