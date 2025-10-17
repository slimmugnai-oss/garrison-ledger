import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * PLAN FEEDBACK API
 * Collects user feedback on personalized plans
 */

// POST - Submit plan feedback
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { helpfulness, actionability, relevance, comments } = body;

    // Validation
    if (
      typeof helpfulness !== 'number' || helpfulness < 1 || helpfulness > 5 ||
      typeof actionability !== 'number' || actionability < 1 || actionability > 5 ||
      typeof relevance !== 'number' || relevance < 1 || relevance > 5
    ) {
      return NextResponse.json({ 
        error: 'Invalid feedback values. All ratings must be 1-5.' 
      }, { status: 400 });
    }

    // Get user's current plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (planError || !plan) {
      return NextResponse.json({ 
        error: 'No plan found for user' 
      }, { status: 404 });
    }

    // Update plan with feedback
    const { error: updateError } = await supabaseAdmin
      .from('user_plans')
      .update({
        user_feedback: {
          helpfulness,
          actionability,
          relevance,
          comments: comments || null,
          average: ((helpfulness + actionability + relevance) / 3).toFixed(1)
        },
        feedback_submitted_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[Plan Feedback] Error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to save feedback' 
      }, { status: 500 });
    }

    // Track analytics event
    await supabaseAdmin
      .from('plan_analytics')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        event_type: 'feedback_submitted',
        metadata: {
          helpfulness,
          actionability,
          relevance,
          has_comments: !!comments
        }
      })
      .then(() => {
        console.log('[Plan Feedback] Analytics tracked');
      })
      .catch((err) => {
        console.error('[Plan Feedback] Analytics error:', err);
        // Don't fail the request if analytics fails
      });

    return NextResponse.json({ 
      success: true,
      message: 'Thank you for your feedback!' 
    });
  } catch (error) {
    console.error('[Plan Feedback] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET - Retrieve feedback for user's plan
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: plan, error } = await supabaseAdmin
      .from('user_plans')
      .select('user_feedback, feedback_submitted_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Plan Feedback GET] Error:', error);
      return NextResponse.json({ 
        error: 'Failed to load feedback' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      feedback: plan?.user_feedback || null,
      submitted_at: plan?.feedback_submitted_at || null
    });
  } catch (error) {
    console.error('[Plan Feedback GET] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

