import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from '@/lib/api-errors';
import { EMAIL_CONFIG } from '@/lib/email-config';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

/**
 * POST /api/campaigns/bulk-send
 * 
 * Send bulk email campaign to all subscribers or targeted segment
 * Admin only - handles rate limiting and batch processing
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      throw Errors.unauthorized();
    }

    const body = await req.json();
    const { subject, html, segment } = body;

    if (!subject || !html) {
      throw Errors.invalidInput('subject and html are required');
    }

    logger.info('Starting bulk email campaign', {
      userId,
      subject,
      segment: segment || 'all'
    });

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('email_campaigns')
      .insert({
        name: subject,
        subject,
        template_type: 'bulk',
        html_content: html,
        segment_filter: segment || null,
        status: 'sending',
        created_by: userId
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      throw Errors.databaseError('Failed to create campaign', { error: campaignError?.message });
    }

    // Get recipients based on segment
    const recipients = await getRecipients(segment);

    if (recipients.length === 0) {
      await supabaseAdmin
        .from('email_campaigns')
        .update({ status: 'failed', total_recipients: 0 })
        .eq('id', campaign.id);

      return NextResponse.json({
        success: false,
        message: 'No recipients found matching segment criteria',
        totalRecipients: 0
      });
    }

    logger.info(`Found ${recipients.length} recipients for bulk campaign`);

    // Update campaign with recipient count
    await supabaseAdmin
      .from('email_campaigns')
      .update({ total_recipients: recipients.length })
      .eq('id', campaign.id);

    let sentCount = 0;
    let failedCount = 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrison-ledger.vercel.app';
    const unsubscribeUrl = `${baseUrl}/dashboard/settings`;

    // Add unsubscribe footer to HTML if not present
    const emailHtml = html.includes('unsubscribe') ? html : `
      ${html}
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">
          You're receiving this because you're subscribed to Garrison Ledger updates.<br/>
          <a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    `;

    // Send emails in batches (Resend rate limit: 10 emails/second on free tier)
    const BATCH_SIZE = 10;
    const BATCH_DELAY = 1100; // 1.1 seconds between batches

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      // Send batch
      await Promise.all(
        batch.map(async (recipient) => {
          try {
            if (!process.env.RESEND_API_KEY) {
              throw new Error('RESEND_API_KEY not configured');
            }

            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: EMAIL_CONFIG.from,
                to: [recipient.email],
                subject,
                html: emailHtml
              }),
            });

            if (!response.ok) {
              throw new Error(`Resend API error: ${response.status}`);
            }

            // Log email sent
            await supabaseAdmin
              .from('email_logs')
              .insert({
                user_id: recipient.user_id || null,
                email: recipient.email,
                template: 'bulk_campaign',
                subject,
                status: 'sent',
                sent_at: new Date().toISOString()
              });

            sentCount++;

          } catch (error) {
            failedCount++;
            logger.error('Failed to send email to recipient', error, {
              email: recipient.email.split('@')[1]
            });
          }
        })
      );

      // Rate limiting delay between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }

      // Log progress every 50 emails
      if ((i + BATCH_SIZE) % 50 === 0) {
        logger.info(`Campaign progress: ${sentCount} sent, ${failedCount} failed`);
      }
    }

    // Update campaign status
    await supabaseAdmin
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        emails_sent: sentCount,
        emails_failed: failedCount
      })
      .eq('id', campaign.id);

    const duration = Date.now() - startTime;
    logger.info('Bulk campaign complete', {
      duration,
      sent: sentCount,
      failed: failedCount,
      total: recipients.length
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      totalRecipients: recipients.length,
      sent: sentCount,
      failed: failedCount,
      durationMs: duration
    });

  } catch (error) {
    return errorResponse(error);
  }
}

async function getRecipients(segment: { premiumOnly?: boolean; hasPlan?: boolean } | null): Promise<Array<{ email: string; user_id?: string }>> {
  // If no segment specified, get all subscribed users
  if (!segment) {
    const { data: preferences } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id, email')
      .eq('subscribed_to_marketing', true);

    // Also get email captures (lead magnets)
    const { data: captures } = await supabaseAdmin
      .from('email_captures')
      .select('email');

    const allEmails = [
      ...(preferences || []),
      ...(captures || []).map(c => ({ email: c.email, user_id: null }))
    ];

    // Deduplicate by email
    const uniqueEmails = Array.from(
      new Map(allEmails.map(item => [item.email, item])).values()
    );

    return uniqueEmails;
  }

  // Targeted segment
  const query = supabaseAdmin.from('email_preferences').select('user_id, email');

  if (segment.premiumOnly) {
    // Join with user_profiles to filter premium users
    const { data: premiumUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email')
      .eq('is_premium', true);

    return premiumUsers || [];
  }

  if (segment.hasPlan !== undefined) {
    // Get users with/without plans
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email')
      .eq('has_plan', segment.hasPlan);

    return users || [];
  }

  // Default: return all
  const { data } = await query;
  return data || [];
}

