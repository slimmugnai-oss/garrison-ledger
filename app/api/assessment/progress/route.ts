import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * ASSESSMENT PROGRESS API
 * Saves and retrieves partial assessment progress for resume capability
 */

// GET - Retrieve user's assessment progress
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: progress, error } = await supabaseAdmin
      .from('assessment_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Assessment Progress GET] Error:', error);
      return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
    }

    // Check if progress exists and hasn't expired
    if (progress && new Date(progress.expires_at) < new Date()) {
      // Delete expired progress
      await supabaseAdmin
        .from('assessment_progress')
        .delete()
        .eq('user_id', userId);
      
      return NextResponse.json({ progress: null });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('[Assessment Progress GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save assessment progress
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      partial_responses, 
      questions_asked, 
      last_question_id, 
      progress_percentage 
    } = body;

    // Validation
    if (!partial_responses || !questions_asked) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Upsert progress (insert or update)
    const { data: progress, error } = await supabaseAdmin
      .from('assessment_progress')
      .upsert({
        user_id: userId,
        partial_responses,
        questions_asked,
        last_question_id,
        progress_percentage: progress_percentage || 0,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('[Assessment Progress POST] Error:', error);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      progress 
    });
  } catch (error) {
    console.error('[Assessment Progress POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Clear assessment progress
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('assessment_progress')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[Assessment Progress DELETE] Error:', error);
      return NextResponse.json({ error: 'Failed to delete progress' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Assessment Progress DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

