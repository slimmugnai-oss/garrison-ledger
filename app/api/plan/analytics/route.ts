import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * PLAN ANALYTICS API
 * Track user interactions with their personalized plans
 */

// POST - Track analytics event
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event_type, content_block_id, tool_name, metadata } = body;

    // Validation
    const validEvents = ['viewed', 'content_expanded', 'tool_clicked', 'feedback_submitted', 'regenerated'];
    if (!event_type || !validEvents.includes(event_type)) {
      return NextResponse.json({ 
        error: 'Invalid event_type' 
      }, { status: 400 });
    }

    // Get user's plan ID
    const { data: plan } = await supabaseAdmin
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!plan) {
      // User doesn't have a plan yet, skip analytics
      return NextResponse.json({ success: true });
    }

    // Insert analytics event (non-blocking, fire-and-forget)
    void supabaseAdmin
      .from('plan_analytics')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        event_type,
        content_block_id: content_block_id || null,
        tool_name: tool_name || null,
        metadata: metadata || {}
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Plan Analytics] Error:', error);
    // Don't fail the request - analytics are non-critical
    return NextResponse.json({ success: true });
  }
}

