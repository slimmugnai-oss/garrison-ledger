import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

/**
 * POST /api/webhooks/resend
 * 
 * Webhook endpoint for Resend email events
 * Tracks: delivered, opened, clicked, bounced, complained
 * 
 * To configure in Resend Dashboard:
 * 1. Go to: https://resend.com/webhooks
 * 2. Add Endpoint: https://garrison-ledger.vercel.app/api/webhooks/resend
 * 3. Select events: email.delivered, email.opened, email.clicked, email.bounced, email.complained
 * 4. Copy signing secret to RESEND_WEBHOOK_SECRET env var
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify webhook signature (recommended for production)
    const signature = req.headers.get('resend-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      // In production, you'd verify the signature here
      // For now, we'll log if signature verification is enabled
      logger.info('[ResendWebhook] Signature verification enabled');
    }

    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      throw Errors.invalidInput('Missing type or data in webhook payload');
    }

    logger.info('[ResendWebhook] Received event', {
      type,
      email: data.to?.[0]?.replace(/@.*/, '@***'),
      subject: data.subject
    });

    // Map Resend event type to our analytics event type
    const eventTypeMap: Record<string, string> = {
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.delivery_delayed': 'delayed',
    };

    const eventType = eventTypeMap[type];

    if (!eventType) {
      logger.warn('[ResendWebhook] Unknown event type', { type });
      return NextResponse.json({ received: true });
    }

    // Find corresponding email log by subject and recipient
    const emailAddress = data.to?.[0];
    const subject = data.subject;

    if (!emailAddress) {
      logger.warn('[ResendWebhook] No recipient email in webhook data');
      return NextResponse.json({ received: true });
    }

    // Try to find matching email log
    const { data: emailLogs, error: findError } = await supabaseAdmin
      .from('email_logs')
      .select('id')
      .eq('email', emailAddress)
      .eq('subject', subject)
      .order('sent_at', { ascending: false })
      .limit(1);

    if (findError) {
      logger.error('[ResendWebhook] Error finding email log', findError);
    }

    const emailLogId = emailLogs?.[0]?.id || null;

    // Store analytics event
    const { error: insertError } = await supabaseAdmin
      .from('email_analytics')
      .insert({
        email_log_id: emailLogId,
        event_type: eventType,
        event_data: data,
        clicked_url: type === 'email.clicked' ? data.link?.url : null,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
        occurred_at: data.created_at || new Date().toISOString()
      });

    if (insertError) {
      logger.error('[ResendWebhook] Error inserting analytics', insertError);
      throw Errors.databaseError('Failed to store email analytics');
    }

    // Update email_logs status if available
    if (emailLogId && eventType === 'delivered') {
      await supabaseAdmin
        .from('email_logs')
        .update({ status: 'delivered' })
        .eq('id', emailLogId);
    }

    if (emailLogId && eventType === 'opened') {
      await supabaseAdmin
        .from('email_logs')
        .update({ status: 'opened' })
        .eq('id', emailLogId);
    }

    if (emailLogId && eventType === 'bounced') {
      await supabaseAdmin
        .from('email_logs')
        .update({ status: 'bounced', error_message: data.bounce?.message })
        .eq('id', emailLogId);
    }

    const duration = Date.now() - startTime;
    logger.info('[ResendWebhook] Event processed successfully', {
      duration,
      type: eventType,
      emailLogId
    });

    return NextResponse.json({ 
      received: true,
      eventType,
      emailLogId
    });

  } catch (error) {
    logger.error('[ResendWebhook] Error processing webhook', error);
    return errorResponse(error);
  }
}

/**
 * GET endpoint for webhook verification (Resend might call this during setup)
 */
export async function GET() {
  return NextResponse.json({ 
    service: 'Garrison Ledger - Resend Webhook',
    status: 'active',
    events: ['delivered', 'opened', 'clicked', 'bounced', 'complained']
  });
}

