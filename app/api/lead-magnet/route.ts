import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';
import { renderPCSChecklist, getEmailSubject } from '@/lib/email-templates';

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
        captured_at: new Date().toISOString(),
        email_sent: false
      });

    if (dbError) {
      logger.error('[LeadMagnet] Failed to save email capture', { email: email.split('@')[1], error: dbError.message });
      throw Errors.databaseError('Failed to save email capture');
    }

    logger.info('[LeadMagnet] Email captured', { email: email.split('@')[1], type }); // Log domain only (PII-safe)

    // Send email with PCS checklist (using React Email)
    if (process.env.RESEND_API_KEY) {
      try {
        const html = await renderPCSChecklist();
        const subject = getEmailSubject('pcs_checklist');
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Garrison Ledger <noreply@familymedia.com>',
            to: [email],
            subject,
            html
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error('[LeadMagnet] Resend API error', new Error(errorText), { statusCode: response.status });
          throw new Error('Failed to send email');
        }

        // Update email_captures to mark email as sent
        await supabaseAdmin
          .from('email_captures')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('email', email)
          .eq('lead_magnet_type', type || 'pcs-checklist');

        logger.info('[LeadMagnet] Email sent successfully', { email: email.split('@')[1] });

      } catch (emailError) {
        logger.error('[LeadMagnet] Failed to send email', emailError);
        // Don't fail the request - they're still captured in database
        return NextResponse.json({
          success: true,
          message: 'Thank you! We\'ll send your checklist shortly.'
        });
      }
    } else {
      logger.warn('[LeadMagnet] RESEND_API_KEY not configured, skipping email send');
    }

    return NextResponse.json({
      success: true,
      message: 'Checklist sent! Check your email.'
    });

  } catch (error) {
    return errorResponse(error);
  }
}
