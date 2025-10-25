import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from '@/lib/api-errors';
import { EMAIL_CONFIG } from '@/lib/email-config';
import { 
  renderOnboardingWelcome, 
  renderOnboardingFeatures,
  renderOnboardingPremium,
  renderWeeklyDigest,
  renderPCSChecklist,
  getEmailSubject 
} from '@/lib/email-templates';
import { logger } from '@/lib/logger';

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
    const { subject, html } = await getTestEmailContent(templateType, templateData);

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
        from: EMAIL_CONFIG.from,
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

async function getTestEmailContent(templateType: string, data: { userName?: string; subject?: string; html?: string } = {}): Promise<{ subject: string; html: string }> {
  const userName = data.userName || 'Service Member';

  // Use React Email templates (3-email sequence + recurring)
  let html: string;
  let subject: string;

  switch (templateType) {
    case 'onboarding_welcome':
      html = await renderOnboardingWelcome(userName);
      subject = getEmailSubject('onboarding_welcome', userName);
      break;
    case 'onboarding_features':
      html = await renderOnboardingFeatures(userName);
      subject = getEmailSubject('onboarding_features', userName);
      break;
    case 'onboarding_premium':
      html = await renderOnboardingPremium(userName);
      subject = getEmailSubject('onboarding_premium', userName);
      break;
    case 'weekly_digest':
      html = await renderWeeklyDigest(userName);
      subject = getEmailSubject('weekly_digest', userName);
      break;
    case 'pcs_checklist':
      html = await renderPCSChecklist();
      subject = getEmailSubject('pcs_checklist');
      break;
    case 'custom':
      html = data.html || '<p>This is a test email with no content provided.</p>';
      subject = data.subject || 'Test Email from Garrison Ledger';
      break;
    default:
      html = await renderOnboardingWelcome(userName);
      subject = getEmailSubject('onboarding_welcome', userName);
  }

  return { subject, html };
}

