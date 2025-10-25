import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = "nodejs";

/**
 * POST /api/cron/onboarding-sequence
 * 
 * Cron job that runs daily to send onboarding emails to users
 * Triggered by Vercel Cron at 6am UTC daily
 * 
 * 3-Email Sequence:
 * - Day 0: Welcome (sent immediately on signup, not by cron)
 * - Day 3: Unique Features (Base Navigator + LES Auditor)
 * - Day 7: Premium Upgrade
 * 
 * Processes users ready for day 3 or day 7 emails
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized onboarding sequence attempt', { 
        hasAuth: !!authHeader,
        hasCronSecret: !!cronSecret
      });
      throw Errors.unauthorized();
    }

    logger.info('Starting onboarding sequence processing');

    // Get users who are in the onboarding sequence and ready for next email
    // Only days 0, 3, and 7 (skip 1, 2, 4, 5, 6)
    const now = new Date();
    const { data: usersToEmail, error: fetchError } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id, onboarding_day, next_onboarding_email')
      .eq('onboarding_sequence_started', true)
      .eq('onboarding_sequence_completed', false)
      .lte('next_onboarding_email', now.toISOString())
      .in('onboarding_day', [0, 3]); // Only process users on day 0 or 3 (day 7 will be handled below)

    if (fetchError) {
      throw Errors.databaseError('Failed to fetch onboarding users', { error: fetchError.message });
    }

    if (!usersToEmail || usersToEmail.length === 0) {
      logger.info('No users ready for onboarding emails');
      return NextResponse.json({ message: "No users to email", processed: 0 });
    }

    logger.info(`Found ${usersToEmail.length} users ready for onboarding emails`);

    let sentCount = 0;
    let failedCount = 0;

    // Process each user
    for (const userPreference of usersToEmail) {
      try {
        // Determine next email day (0 → 3 → 7)
        const currentDay = userPreference.onboarding_day;
        const nextDay = currentDay === 0 ? 3 : 7;
        
        // Get user's email and name from Clerk or user_profiles
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('rank, email')
          .eq('user_id', userPreference.user_id)
          .maybeSingle();

        if (!profile?.email) {
          logger.warn('No email found for user', { userId: userPreference.user_id });
          failedCount++;
          continue;
        }

        // Send next day's email
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://garrison-ledger.vercel.app'}/api/emails/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}` // Internal auth
          },
          body: JSON.stringify({
            userEmail: profile.email,
            userName: profile.rank || 'Service Member',
            dayNumber: nextDay
          })
        });

        // Update user's onboarding progress
        const nextEmailDate = new Date();
        const daysToWait = currentDay === 0 ? 3 : 4; // Day 0→3 (3 days), Day 3→7 (4 days)
        nextEmailDate.setDate(nextEmailDate.getDate() + daysToWait);

        const updateData: {
          onboarding_day: number;
          next_onboarding_email: string | null;
          onboarding_sequence_completed?: boolean;
        } = {
          onboarding_day: nextDay,
          next_onboarding_email: nextEmailDate.toISOString()
        };

        // Mark as completed if this was day 7 email
        if (nextDay === 7) {
          updateData.onboarding_sequence_completed = true;
          updateData.next_onboarding_email = null;
        }

        await supabaseAdmin
          .from('email_preferences')
          .update(updateData)
          .eq('user_id', userPreference.user_id);

        sentCount++;

      } catch (error) {
        failedCount++;
        logger.error('Failed to process onboarding email for user', error, {
          userId: userPreference.user_id
        });
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Onboarding sequence processing complete', {
      duration,
      sent: sentCount,
      failed: failedCount,
      total: usersToEmail.length
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: usersToEmail.length,
      durationMs: duration
    });

  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Helper function to start onboarding sequence for a new user
 * Can be called from signup webhook or profile completion
 */
export async function startOnboardingSequence(userId: string, userEmail: string, userName?: string) {
  try {
    // Create or update email preferences to start sequence
    const nextEmailDate = new Date();
    nextEmailDate.setDate(nextEmailDate.getDate() + 3); // Next email (Day 3) in 3 days

    await supabaseAdmin
      .from('email_preferences')
      .upsert({
        user_id: userId,
        onboarding_sequence_started: true,
        onboarding_sequence_completed: false,
        onboarding_day: 0, // Day 0 = welcome email sent immediately
        next_onboarding_email: nextEmailDate.toISOString(), // Day 3 email scheduled
        subscribed_to_marketing: true,
        subscribed_to_product_updates: true,
        subscribed_to_weekly_digest: true
      });

    // Send immediate welcome email (Day 0)
    if (process.env.RESEND_API_KEY) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.familymedia.com'}/api/emails/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          userName: userName || 'Service Member',
          dayNumber: 0 // Day 0 = Welcome email
        })
      });

      logger.info('Started onboarding sequence', { userId, email: userEmail.split('@')[1] });
    }

  } catch (error) {
    logger.error('Failed to start onboarding sequence', error, { userId });
  }
}

