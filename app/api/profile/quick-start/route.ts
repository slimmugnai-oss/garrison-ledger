/**
 * QUICK START PROFILE API
 * 
 * POST /api/profile/quick-start
 * Saves minimal profile (5 essential fields only)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw Errors.unauthorized();
    }

    const body = await request.json();
    const {
      rank,
      branch,
      current_base,
      has_dependents,
      service_status
    } = body;

    // Validate required fields (branch optional for contractors/civilians)
    if (!rank || !current_base) {
      throw Errors.invalidInput('Missing required fields: rank and current_base', {
        missing: { rank: !rank, current_base: !current_base }
      });
    }

    // Upsert profile with minimal data
    // Note: Adjust column names to match your actual user_profiles schema
    const { error: upsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        rank,
        branch: branch || 'N/A', // N/A for contractors/civilians
        current_base,
        has_dependents,
        service_status: service_status || 'active_duty',
        profile_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      logger.error('Failed to save quick start profile', upsertError, { userId });
      throw Errors.databaseError('Failed to save profile');
    }

    // Analytics (non-blocking)
    try {
      await supabaseAdmin
        .from('events')
        .insert({
          user_id: userId,
          event_type: 'profile_quick_start_complete',
          payload: { branch, rank }
        });
    } catch (analyticsError) {
      logger.warn('Failed to record profile completion event', {
        error: analyticsError instanceof Error ? analyticsError.message : 'Unknown',
        userId
      });
      // Continue - analytics failure shouldn't block profile save
    }

    logger.info('Profile quick start completed', {
      userId: userId.substring(0, 8) + '...',
      rank,
      branch: branch || 'N/A'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return errorResponse(error);
  }
}

