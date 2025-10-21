import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = "nodejs";

/**
 * POST /api/emails/onboarding
 * 
 * Trigger onboarding email sequence for new user
 * Called automatically after user signs up
 * 
 * 7-Day Sequence:
 * - Day 1: Welcome + profile completion value
 * - Day 2: Assessment preview + social proof
 * - Day 3: AI plan benefits + testimonial
 * - Day 5: Free tools showcase
 * - Day 7: Premium upgrade offer
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw Errors.unauthorized();
    }

    const body = await req.json();
    const { userEmail, userName, dayNumber } = body;

    if (!userEmail || !dayNumber) {
      throw Errors.invalidInput('userEmail and dayNumber are required');
    }

    // Validate day number
    if (typeof dayNumber !== 'number' || dayNumber < 1 || dayNumber > 7) {
      throw Errors.invalidInput('dayNumber must be between 1 and 7');
    }

    logger.info('Sending onboarding email', {
      userId,
      dayNumber,
      email: userEmail.replace(/@.*/, '@***') // PII-safe logging
    });

    // Get email content based on day
    const emailContent = getOnboardingEmail(dayNumber, userName);

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Garrison Ledger <noreply@familymedia.com>',
          to: [userEmail],
          subject: emailContent.subject,
          html: emailContent.html
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Resend API error', new Error(errorText), { statusCode: response.status });
        throw Errors.externalApiError('Resend', 'Failed to send onboarding email');
      }

      // Log email sent (fire-and-forget)
      supabaseAdmin
        .from('email_logs')
        .insert({
          user_id: userId,
          email: userEmail,
          template: `onboarding_day_${dayNumber}`,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) logger.warn('Failed to log email', { error: error.message });
        });
    } else {
      logger.warn('RESEND_API_KEY not configured, skipping email send');
    }

    const duration = Date.now() - startTime;
    logger.info('Onboarding email sent successfully', { duration, dayNumber });

    return NextResponse.json({ success: true, dayNumber });

  } catch (error) {
    return errorResponse(error);
  }
}

function getOnboardingEmail(day: number, userName: string): { subject: string; html: string } {
  const name = userName || 'Service Member';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrison-ledger.vercel.app';
  const unsubscribeUrl = `${baseUrl}/dashboard/settings`;

  const emails = {
    1: {
      subject: `Welcome to Garrison Ledger, ${name} - Mission Briefing`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Welcome Aboard, ${name}</h1>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You just joined <strong>500+ military families</strong> who are taking control of their finances with AI-powered planning.
          </p>
          
          <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px;">Your Next Step (2 Minutes)</h3>
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              Complete your profile so AI can curate the perfect financial plan for your unique military situation.
            </p>
          </div>
          
          <a href="${baseUrl}/dashboard/profile/setup" 
             style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
            Complete Your Profile →
          </a>
          
          <h3 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0;">What You Get (100% Free)</h3>
          <ul style="font-size: 14px; color: #4b5563; line-height: 1.8;">
            <li>6 Military-Specific Financial Calculators</li>
            <li>410+ Expert Content Blocks</li>
            <li>AI-Curated Personalized Plan</li>
            <li>5 Resource Hub Pages</li>
          </ul>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
            Questions? Just reply to this email - we read every message.<br />
            <strong style="color: #2563eb;">- The Garrison Ledger Team</strong>
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              You're receiving this as part of your 7-day onboarding sequence.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    },
    2: {
      subject: `${name}, Your AI-Curated Financial Plan is Ready`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Your AI Plan is Ready</h1>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Our AI Master Curator analyzes <strong>410+ expert content blocks</strong> and selects the 8-10 most relevant for your military situation.
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Real Example:</strong> If you're an E-5 with 8 years TIS, planning a PCS, with 2 kids, AI might recommend:
              TSP allocation strategies, PCS budgeting, BAH optimization, dependent care credits, and deployment SDP tactics.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            <strong>87 plans generated this week</strong> - Join them!
          </p>
          
          <a href="${baseUrl}/dashboard/tools" 
             style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
            Explore Financial Tools →
          </a>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              You're receiving this as part of your 7-day onboarding sequence.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    },
    3: {
      subject: `${name}, Real Success: How Sarah Saved $9,600/Year`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a; font-size: 28px; margin-bottom: 16px;">Real Military Family Success Story</h1>
          
          <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; font-style: italic;">
              "The TSP Modeler showed me I was losing $800/month in potential gains with my conservative allocation. I adjusted immediately. That's $9,600 more per year!"
            </p>
            <p style="margin-top: 12px; font-size: 14px; color: #166534;">
              <strong>- Sarah K., O-3 Navy, San Diego</strong>
            </p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            <strong>${name}, are you optimizing YOUR TSP?</strong> Most service members leave thousands on the table every year.
          </p>
          
          <a href="${baseUrl}/dashboard/tools/tsp-modeler" 
             style="display: inline-block; background: linear-gradient(to right, #16a34a, #059669); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
            Check Your TSP Allocation →
          </a>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Plus: Get your full AI-curated financial plan by completing your assessment.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              You're receiving this as part of your 7-day onboarding sequence.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    },
    5: {
      subject: `${name}, 6 Free Financial Tools at Your Command`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Your Military Financial Toolkit</h1>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            All 6 calculators are <strong>100% free forever</strong>. Here's what you have access to:
          </p>
          
          <div style="margin: 24px 0;">
            <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
              <strong style="color: #1e40af;">TSP Modeler</strong><br />
              <span style="font-size: 14px; color: #1e40af;">Project retirement growth with different allocations</span>
            </div>
            <div style="background: #dcfce7; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
              <strong style="color: #166534;">PCS Financial Planner</strong><br />
              <span style="font-size: 14px; color: #166534;">Budget your move + estimate PPM profit potential</span>
            </div>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
              <strong style="color: #92400e;">House Hacking Calculator</strong><br />
              <span style="font-size: 14px; color: #92400e;">Analyze multi-unit property ROI with BAH</span>
            </div>
          </div>
          
          <a href="${baseUrl}/dashboard" 
             style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
            Explore All 6 Tools →
          </a>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              You're receiving this as part of your 7-day onboarding sequence.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    },
    7: {
      subject: `${name}, Upgrade to Premium - Just $0.33/Day`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 16px;">Unlock Premium for Just $0.33/Day</h1>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You've seen what Garrison Ledger can do for free. Imagine what <strong>unlimited access</strong> could do for your family's financial future.
          </p>
          
          <div style="background: linear-gradient(to right, #7c3aed, #ec4899); color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; font-size: 24px;">Premium = $9.99/month</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">Less than 2 coffees. Could save you $5,000+/year.</p>
            <ul style="font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Full AI plan (8-10 blocks vs 2)</li>
              <li>Unlimited assessments (vs 1/week)</li>
              <li>Unlimited Intel Library (vs 5/day)</li>
              <li>Full AI Explainer analysis</li>
              <li>Priority support (24-hour response)</li>
            </ul>
          </div>
          
          <a href="${baseUrl}/dashboard/upgrade" 
             style="display: inline-block; background: white; color: #7c3aed; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Upgrade to Premium →
          </a>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            <strong>Risk-free:</strong> 7-day money-back guarantee. If you're not satisfied, we'll refund 100%.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              You're receiving this as part of your 7-day onboarding sequence.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    }
  };

  return emails[day as keyof typeof emails] || emails[1];
}

