import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Generate ticket ID (format: GLXXXX-YYYYMMDD-RRRR)
function generateTicketId(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GL-${date}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication (optional - works for both public and authenticated users)
    const { userId } = await auth();

    const body = await req.json();
    const { name, email, subject, urgency, message, variant } = body;

    // Validation
    if (!name || !email || !message) {
      throw Errors.invalidInput('Missing required fields: name, email, and message are required');
    }

    if (message.length < 10) {
      throw Errors.invalidInput('Message must be at least 10 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.invalidInput('Invalid email address format');
    }

    const supabase = getAdminClient();
    const ticketId = generateTicketId();

    // Store in database
    const { error: dbError } = await supabase.from('contact_submissions').insert({
      ticket_id: ticketId,
      user_id: userId || null,
      name,
      email,
      subject: subject || 'general',
      urgency: urgency || 'low',
      message,
      variant: variant || 'public',
      status: 'new',
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      logger.error('[Contact] Failed to save submission', dbError, { email, subject });
      throw Errors.databaseError('Failed to submit contact form');
    }

    // Send email notification to admin (fire and forget)
    if (process.env.RESEND_API_KEY) {
      const emailSubject = `[${ticketId}] New Contact Form Submission - ${subject}`;
      const emailBody = `
New contact form submission received:

Ticket ID: ${ticketId}
From: ${name} <${email}>
Subject: ${subject}
${urgency !== 'low' ? `Priority: ${urgency.toUpperCase()}` : ''}
Variant: ${variant}

Message:
${message}

---
Reply directly to this email to respond to the user.
      `.trim();

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Garrison Ledger <noreply@familymedia.com>',
          to: ['joemugnai@familymedia.com'],
          reply_to: email,
          subject: emailSubject,
          text: emailBody,
        }),
      }).catch((emailError) => {
        logger.warn('[Contact] Failed to send email notification', { ticketId, error: emailError });
      });
    }

    logger.info('[Contact] Submission received', { ticketId, email, subject, urgency });
    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Message sent successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}

