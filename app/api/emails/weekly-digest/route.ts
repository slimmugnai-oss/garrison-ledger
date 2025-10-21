import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';
import { renderWeeklyDigest, getEmailSubject } from '@/lib/email-templates';
import { EMAIL_CONFIG } from '@/lib/email-config';

export const runtime = "nodejs";

/**
 * POST /api/emails/weekly-digest
 * 
 * Sends weekly digest email to all subscribed users
 * Should be triggered by a cron job (Vercel Cron or external)
 * 
 * Digest includes:
 * - Plan update notification
 * - New content added this week
 * - Personalized recommendations
 * - Upcoming financial deadlines (PCS, deployment, etc.)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized weekly digest attempt', { 
        hasAuth: !!authHeader,
        hasCronSecret: !!cronSecret
      });
      throw Errors.unauthorized();
    }

    logger.info('Starting weekly digest send');

    // Get all users subscribed to weekly digest
    const { data: subscribers, error: fetchError } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id, email')
      .eq('subscribed_to_weekly_digest', true);

    if (fetchError) {
      throw Errors.databaseError('Failed to fetch subscribers', { error: fetchError.message });
    }

    if (!subscribers || subscribers.length === 0) {
      logger.info('No weekly digest subscribers found');
      return NextResponse.json({ message: "No subscribers", sent: 0 });
    }

    logger.info(`Found ${subscribers.length} weekly digest subscribers`);

    let sentCount = 0;
    let failedCount = 0;

    // Send digest to each subscriber
    for (const subscriber of subscribers) {
      try {
        // Get user's profile and plan data
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('rank, branch')
          .eq('user_id', subscriber.user_id)
          .maybeSingle();

        const { data: plan } = await supabaseAdmin
          .from('user_plans')
          .select('updated_at')
          .eq('user_id', subscriber.user_id)
          .maybeSingle();

        // Send personalized digest
        await sendWeeklyDigest(subscriber.email, {
          userName: profile?.rank || 'Service Member',
          hasPlan: !!plan,
          planUpdated: plan ? isRecentlyUpdated(plan.updated_at) : false
        });

        sentCount++;

        // Log email sent (fire-and-forget)
        supabaseAdmin
          .from('email_logs')
          .insert({
            user_id: subscriber.user_id,
            email: subscriber.email,
            template: 'weekly_digest',
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) logger.warn('Failed to log digest email', { error: error.message });
          });

      } catch (error) {
        failedCount++;
        logger.error('Failed to send digest to subscriber', error, {
          userId: subscriber.user_id,
          email: subscriber.email.replace(/@.*/, '@***')
        });
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Weekly digest send complete', {
      duration,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
      durationMs: duration
    });

  } catch (error) {
    return errorResponse(error);
  }
}

async function sendWeeklyDigest(email: string, data: { userName: string; hasPlan: boolean; planUpdated: boolean }) {
  if (!process.env.RESEND_API_KEY) return;

  const html = await renderWeeklyDigest(data.userName, data.hasPlan, data.planUpdated);
  const subject = getEmailSubject('weekly_digest', data.userName);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_CONFIG.from,
      to: [email],
      subject,
      html
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send weekly digest');
  }
}

function isRecentlyUpdated(updatedAt: string): boolean {
  const updated = new Date(updatedAt);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return updated > weekAgo;
}

