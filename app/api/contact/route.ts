import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      );
    }

    // Send email notification to admin
    try {
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
View in Supabase: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor (contact_submissions table)
      `.trim();

      // Send email using Resend (requires RESEND_API_KEY env var)
      if (process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
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
        });
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Message sent successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

