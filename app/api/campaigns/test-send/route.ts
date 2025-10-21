import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = "nodejs";

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

/**
 * POST /api/campaigns/test-send
 * 
 * Send test email to preview template
 * Admin only
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      throw Errors.unauthorized();
    }

    const body = await req.json();
    const { testEmail, templateType, templateData } = body;

    if (!testEmail) {
      throw Errors.invalidInput('testEmail is required');
    }

    if (!templateType) {
      throw Errors.invalidInput('templateType is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      throw Errors.invalidInput('Invalid email format');
    }

    logger.info('Sending test email', {
      userId,
      templateType,
      testEmail: testEmail.replace(/@.*/, '@***')
    });

    // Get email content based on template type
    const { subject, html } = getTestEmailContent(templateType, templateData);

    // Send email via Resend
    if (!process.env.RESEND_API_KEY) {
      throw Errors.externalApiError("Resend", "RESEND_API_KEY not configured");
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Garrison Ledger <noreply@familymedia.com>',
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        html
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Resend API error', new Error(errorText), { statusCode: response.status });
      throw Errors.externalApiError('Resend', 'Failed to send test email');
    }

    const duration = Date.now() - startTime;
    logger.info('Test email sent successfully', { duration, templateType });

    return NextResponse.json({ 
      success: true,
      message: `Test email sent to ${testEmail}`,
      templateType
    });

  } catch (error) {
    return errorResponse(error);
  }
}

function getTestEmailContent(templateType: string, data: { userName?: string; subject?: string; html?: string } = {}): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrison-ledger.vercel.app';
  const userName = data.userName || 'Service Member';
  const unsubscribeUrl = `${baseUrl}/dashboard/settings`;

  const templates: Record<string, { subject: string; html: string }> = {
    'onboarding_day_1': {
      subject: `Welcome to Garrison Ledger, ${userName} - Mission Briefing`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Welcome Aboard, ${userName}</h1>
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
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              This is a test email.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    },
    'weekly_digest': {
      subject: `${userName}, Your Weekly Military Finance Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Your Weekly Update</h1>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Hi ${userName}, here's what's new at Garrison Ledger this week:
          </p>
          <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #1e40af;">Your AI Plan is Ready</h3>
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              Your personalized financial plan is waiting for you. Take action this week!
            </p>
          </div>
          <h3 style="color: #111827; font-size: 20px; margin: 24px 0 12px 0;">New Content This Week</h3>
          <ul style="font-size: 14px; color: #4b5563; line-height: 1.8;">
            <li>TSP allocation strategies for 2025 market conditions</li>
            <li>PCS budgeting for OCONUS moves</li>
            <li>Deployment SDP maximization tactics</li>
          </ul>
          <a href="${baseUrl}/dashboard" 
             style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
            Open Your Dashboard →
          </a>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              This is a test email.<br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Update email preferences</a>
            </p>
          </div>
        </div>
      `
    },
    'custom': {
      subject: data.subject || 'Test Email from Garrison Ledger',
      html: data.html || '<p>This is a test email with no content provided.</p>'
    }
  };

  return templates[templateType] || templates['custom'];
}

