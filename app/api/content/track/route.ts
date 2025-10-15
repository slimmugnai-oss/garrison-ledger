import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, interactionType, interactionValue = 1 } = body;

    if (!contentId || !interactionType) {
      return NextResponse.json(
        { error: 'contentId and interactionType are required' },
        { status: 400 }
      );
    }

    // Validate interaction type
    const validTypes = ['view', 'click', 'share', 'save', 'rate', 'complete'];
    if (!validTypes.includes(interactionType)) {
      return NextResponse.json(
        { error: `Invalid interactionType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Track the interaction
    const { data, error } = await supabaseAdmin
      .rpc('track_content_interaction', {
        p_user_id: userId,
        p_content_id: contentId,
        p_interaction_type: interactionType,
        p_interaction_value: interactionValue
      });

    if (error) {
      console.error('Error tracking interaction:', error);
      return NextResponse.json(
        { error: 'Failed to track interaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interactionId: data,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Track interaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

