import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET - Fetch user's rating for content
 * POST - Rate content
 */

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .rpc('get_user_rating', {
        p_user_id: userId,
        p_content_id: contentId
      });

    if (error) {
      console.error('Error fetching rating:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rating: data && data.length > 0 ? data[0] : null
    });

  } catch (error) {
    console.error('Ratings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, rating, feedback } = body;

    if (!contentId || !rating) {
      return NextResponse.json(
        { error: 'contentId and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
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
      console.error('Error saving rating:', error);
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    // Update the content block's overall rating
    await supabaseAdmin.rpc('update_content_rating_from_users', {
      p_content_id: contentId
    });

    // Track the rate interaction
    await supabaseAdmin.rpc('track_content_interaction', {
      p_user_id: userId,
      p_content_id: contentId,
      p_interaction_type: 'rate',
      p_interaction_value: rating
    });

    return NextResponse.json({
      success: true,
      rating: data,
      message: 'Rating saved successfully'
    });

  } catch (error) {
    console.error('Ratings POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

