import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { event, properties, timestamp } = body;

    // Store event in database for admin analytics
    await supabaseAdmin.from('analytics_events').insert({
      user_id: userId || 'anonymous',
      event_name: event,
      properties: properties || {},
      created_at: timestamp || new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't fail the request - analytics shouldn't break user experience
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

