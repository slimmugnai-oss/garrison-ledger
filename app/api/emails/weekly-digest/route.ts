import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';

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
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users subscribed to weekly digest
    const { data: subscribers } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id, email')
      .eq('subscribed_to_weekly_digest', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers" });
    }

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

        // Log email sent
        await supabaseAdmin
          .from('email_logs')
          .insert({
            user_id: subscriber.user_id,
            email: subscriber.email,
            template: 'weekly_digest',
            status: 'sent',
            sent_at: new Date().toISOString()
          });

      } catch (error) {
        console.error(`[Weekly Digest] Failed for ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length
    });

  } catch (error) {
    console.error('[Weekly Digest] Error:', error);
    return NextResponse.json({ error: "Failed to send digests" }, { status: 500 });
  }
}

async function sendWeeklyDigest(email: string, data: { userName: string; hasPlan: boolean; planUpdated: boolean }) {
  if (!process.env.RESEND_API_KEY) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Garrison Ledger <noreply@familymedia.com>',
      to: [email],
      subject: `${data.userName}, Your Weekly Military Finance Update 📊`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Your Weekly Update 📊</h1>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Hi ${data.userName}, here's what's new at Garrison Ledger this week:
          </p>
          
          ${data.hasPlan ? `
            <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #1e40af;">🤖 Your AI Plan ${data.planUpdated ? 'Has Been Updated!' : 'is Ready'}</h3>
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                ${data.planUpdated 
                  ? 'We\'ve refreshed your plan with new content. Check out the latest recommendations!' 
                  : 'Your personalized financial plan is waiting for you. Take action this week!'}
              </p>
            </div>
          ` : `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #92400e;">⚠️ You're Missing Your Personalized Plan</h3>
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                Complete your assessment to get AI-curated financial strategies for your unique situation.
              </p>
            </div>
          `}
          
          <h3 style="color: #111827; font-size: 20px; margin: 24px 0 12px 0;">📚 New Content This Week</h3>
          <ul style="font-size: 14px; color: #4b5563; line-height: 1.8;">
            <li>TSP allocation strategies for 2025 market conditions</li>
            <li>PCS budgeting for OCONUS moves</li>
            <li>Deployment SDP maximization tactics</li>
          </ul>
          
          <a href="https://garrison-ledger.vercel.app/dashboard" 
             style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
            Open Your Dashboard →
          </a>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; text-align: center;">
            Don't want weekly emails? <a href="https://garrison-ledger.vercel.app/dashboard/settings" style="color: #2563eb;">Update preferences</a>
          </p>
        </div>
      `
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

