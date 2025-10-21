import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

/**
 * GET - Fetch user's rating for content
 * POST - Rate content
 */

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      throw Errors.invalidInput('contentId is required');
    }

    const { data, error } = await supabaseAdmin
      .rpc('get_user_rating', {
        p_user_id: userId,
        p_content_id: contentId
      });

    if (error) {
      logger.error('[Ratings] Failed to fetch rating', error, { userId, contentId });
      throw Errors.databaseError('Failed to fetch rating');
    }

    logger.info('[Ratings] Rating fetched', { userId, contentId, hasRating: data && data.length > 0 });
    return NextResponse.json({
      success: true,
      rating: data && data.length > 0 ? data[0] : null
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
    const { contentId, rating, feedback } = body;

    if (!contentId || !rating) {
      throw Errors.invalidInput('contentId and rating are required');
    }

    if (rating < 1 || rating > 5) {
      throw Errors.invalidInput('Rating must be between 1 and 5');
    }

    // Upsert rating (insert or update)
    const { data, error } = await supabaseAdmin
      .from('user_content_ratings')
      .upsert({
        user_id: userId,
        content_block_id: contentId,
        rating,
        feedback: feedback || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,content_block_id'
      })
      .select()
      .single();

    if (error) {
      logger.error('[Ratings] Failed to save rating', error, { userId, contentId, rating });
      throw Errors.databaseError('Failed to save rating');
    }

    // Update the content block's overall rating (fire and forget)
    supabaseAdmin.rpc('update_content_rating_from_users', {
      p_content_id: contentId
    }).then(({ error: updateError }) => {
      if (updateError) {
        logger.warn('[Ratings] Failed to update content aggregate rating', { contentId, error: updateError.message });
      }
    });

    // Track the rate interaction (fire and forget)
    supabaseAdmin.rpc('track_content_interaction', {
      p_user_id: userId,
      p_content_id: contentId,
      p_interaction_type: 'rate',
      p_interaction_value: rating
    }).then(({ error: trackError }) => {
      if (trackError) {
        logger.warn('[Ratings] Failed to track interaction', { userId, contentId, error: trackError.message });
      }
    });

    logger.info('[Ratings] Rating saved', { userId, contentId, rating });
    return NextResponse.json({
      success: true,
      rating: data,
      message: 'Rating saved successfully'
    });

  } catch (error) {
    return errorResponse(error);
  }
}

