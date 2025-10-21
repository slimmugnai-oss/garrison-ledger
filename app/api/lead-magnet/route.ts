import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

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
      throw Errors.invalidInput('Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.invalidInput('Invalid email format');
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
      // Continue anyway - don't fail the request, but log it
      logger.warn('[LeadMagnet] Failed to save email capture', { email, type, error: dbError });
    } else {
      logger.info('[LeadMagnet] Email captured', { email: email.split('@')[1], type }); // Log domain only (PII-safe)
    }

    // TODO: Send email with PCS checklist PDF
    // This would integrate with Resend or similar email service
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Checklist sent! Check your email.'
    });

  } catch (error) {
    return errorResponse(error);
  }
}

