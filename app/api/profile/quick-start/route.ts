/**
 * QUICK START PROFILE API
 * 
 * POST /api/profile/quick-start
 * Saves minimal profile (5 essential fields only)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      rank,
      branch,
      current_base,
      has_dependents,
      service_status
    } = body;

    // Validate required fields
    if (!rank || !branch || !current_base) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert profile with minimal data
    // Note: Adjust column names to match your actual user_profiles schema
    const { error: upsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        rank,
        branch,
        current_base,
        marital_status: has_dependents ? 'married' : 'single', // Proxy for has_dependents
        service_status: service_status || 'active_duty',
        profile_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('[Quick Start] Database error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    // Analytics
    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'profile_quick_start_complete',
        payload: { branch, rank }
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Quick Start] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

