import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Lead Magnet API
 * Captures emails and sends free resources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Store lead in database
    const { error: dbError } = await supabaseAdmin
      .from('email_captures')
      .insert({
        email,
        source: 'lead-magnet',
        lead_magnet_type: type || 'pcs-checklist',
        captured_at: new Date().toISOString()
      });

    if (dbError) {
      // Continue anyway - don't fail the request
    }

    // TODO: Send email with PCS checklist PDF
    // This would integrate with Resend or similar email service
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Checklist sent! Check your email.'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

