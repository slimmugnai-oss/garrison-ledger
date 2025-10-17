import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * ASSESSMENT ANALYTICS API
 * Tracks user behavior during assessment for optimization
 */

// POST - Track analytics event
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event_type, question_id, time_spent_seconds, metadata } = body;

    // Validation
    const validEvents = ['started', 'question_answered', 'completed', 'abandoned', 'resumed'];
    if (!event_type || !validEvents.includes(event_type)) {
      return NextResponse.json({ 
        error: 'Invalid event_type' 
      }, { status: 400 });
    }

    // Insert analytics event
    const { error } = await supabaseAdmin
      .from('assessment_analytics')
      .insert({
        user_id: userId,
        event_type,
        question_id: question_id || null,
        time_spent_seconds: time_spent_seconds || null,
        metadata: metadata || {}
      });

    if (error) {
      console.error('[Assessment Analytics] Error:', error);
      // Don't fail the request - analytics are non-critical
      return NextResponse.json({ 
        success: true,
        message: 'Event tracked (with errors)' 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Assessment Analytics] Error:', error);
    // Don't fail the request - analytics are non-critical
    return NextResponse.json({ 
      success: true,
      message: 'Event tracking failed silently' 
    });
  }
}

