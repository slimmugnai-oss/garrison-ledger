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
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      );
    }

    // TODO: Send email notification (implement with Resend/SendGrid)
    // await sendContactNotification({ ticketId, name, email, subject, message });

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

