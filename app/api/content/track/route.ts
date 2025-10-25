import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await request.json();
    const { contentId, interactionType, interactionValue = 1 } = body;

    if (!contentId || !interactionType) {
      throw Errors.invalidInput('contentId and interactionType are required');
    }

    // Validate interaction type
    const validTypes = ['view', 'click', 'share', 'save', 'rate', 'complete'];
    if (!validTypes.includes(interactionType)) {
      throw Errors.invalidInput(`Invalid interactionType. Must be one of: ${validTypes.join(', ')}`);
    }

    // Track the interaction (fire and forget - analytics shouldn't block UX)
    supabaseAdmin
      .rpc('track_content_interaction', {
        p_user_id: userId,
        p_content_id: contentId,
        p_interaction_type: interactionType,
        p_interaction_value: interactionValue
      })
      .then(({ error: trackError }) => {
        if (trackError) {
          logger.warn('[ContentTrack] Failed to track interaction', { userId, contentId, interactionType, error: trackError.message });
        }
      });

    logger.debug('[ContentTrack] Interaction tracked', { userId, contentId, interactionType });
    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    // Analytics failures shouldn't break UX
    logger.warn('[ContentTrack] Request failed, returning success to not break UX', { error });
    return NextResponse.json({ success: true });
  }
}

