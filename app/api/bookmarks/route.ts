import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET - Fetch user's bookmarks
 * POST - Add a bookmark
 */

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      console.error('Error fetching bookmarks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookmarks: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Bookmarks GET error:', error);
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
    const { contentId, notes } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: 'Content already bookmarked' },
          { status: 409 }
        );
      }
      
      console.error('Error creating bookmark:', error);
      return NextResponse.json(
        { error: 'Failed to create bookmark' },
        { status: 500 }
      );
    }

    // Track the save interaction
    await supabaseAdmin.rpc('track_content_interaction', {
      p_user_id: userId,
      p_content_id: contentId,
      p_interaction_type: 'save',
      p_interaction_value: 1
    });

    return NextResponse.json({
      success: true,
      bookmark: data,
      message: 'Content bookmarked successfully'
    });

  } catch (error) {
    console.error('Bookmarks POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { error } = await supabaseAdmin
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_block_id', contentId);

    if (error) {
      console.error('Error deleting bookmark:', error);
      return NextResponse.json(
        { error: 'Failed to delete bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Bookmarks DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

