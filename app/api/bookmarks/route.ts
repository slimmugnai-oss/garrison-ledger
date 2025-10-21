import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

/**
 * GET - Fetch user's bookmarks
 * POST - Add a bookmark
 * DELETE - Remove a bookmark
 */

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabaseAdmin
      .rpc('get_user_bookmarks', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });

    if (error) {
      logger.error('[Bookmarks] Failed to fetch bookmarks', error, { userId });
      throw Errors.databaseError('Failed to fetch bookmarks');
    }

    logger.info('[Bookmarks] Fetched bookmarks', { userId, count: data?.length || 0 });
    return NextResponse.json({
      success: true,
      bookmarks: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await request.json();
    const { contentId, notes } = body;

    if (!contentId) {
      throw Errors.invalidInput('contentId is required');
    }

    // Insert bookmark
    const { data, error } = await supabaseAdmin
      .from('user_bookmarks')
      .insert({
        user_id: userId,
        content_block_id: contentId,
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate bookmark
      if (error.code === '23505') {
        logger.warn('[Bookmarks] Duplicate bookmark attempt', { userId, contentId });
        throw new Errors.invalidInput('Content already bookmarked');
      }
      
      logger.error('[Bookmarks] Failed to create bookmark', error, { userId, contentId });
      throw Errors.databaseError('Failed to create bookmark');
    }

    // Track the save interaction (fire and forget)
    supabaseAdmin.rpc('track_content_interaction', {
      p_user_id: userId,
      p_content_id: contentId,
      p_interaction_type: 'save',
      p_interaction_value: 1
    }).catch((trackError) => {
      logger.warn('[Bookmarks] Failed to track interaction', { userId, contentId, error: trackError });
    });

    logger.info('[Bookmarks] Bookmark created', { userId, contentId });
    return NextResponse.json({
      success: true,
      bookmark: data,
      message: 'Content bookmarked successfully'
    });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      throw Errors.invalidInput('contentId is required');
    }

    const { error } = await supabaseAdmin
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_block_id', contentId);

    if (error) {
      logger.error('[Bookmarks] Failed to delete bookmark', error, { userId, contentId });
      throw Errors.databaseError('Failed to delete bookmark');
    }

    logger.info('[Bookmarks] Bookmark deleted', { userId, contentId });
    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    return errorResponse(error);
  }
}

