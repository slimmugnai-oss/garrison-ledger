import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Lead Magnet API
 * Captures emails and sends free resources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type } = body;

    if (!email) {
      throw Errors.invalidInput('Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.invalidInput('Invalid email format');
    }

    // Store lead in database
    const { error: dbError } = await supabaseAdmin
      .from('email_captures')
      .insert({
        email,
        source: 'lead-magnet',
        lead_magnet_type: type || 'pcs-checklist',
        captured_at: new Date().toISOString(),
        email_sent: false
      });

    if (dbError) {
      logger.error('[LeadMagnet] Failed to save email capture', { email: email.split('@')[1], error: dbError.message });
      throw Errors.databaseError('Failed to save email capture');
    }

    logger.info('[LeadMagnet] Email captured', { email: email.split('@')[1], type }); // Log domain only (PII-safe)

    // Send email with PCS checklist
    if (process.env.RESEND_API_KEY) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrison-ledger.vercel.app';
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Garrison Ledger <noreply@familymedia.com>',
            to: [email],
            subject: 'Your PCS Financial Checklist - Garrison Ledger',
            html: getPCSChecklistEmail(baseUrl)
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error('[LeadMagnet] Resend API error', new Error(errorText), { statusCode: response.status });
          throw new Error('Failed to send email');
        }

        // Update email_captures to mark email as sent
        await supabaseAdmin
          .from('email_captures')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('email', email)
          .eq('lead_magnet_type', type || 'pcs-checklist');

        logger.info('[LeadMagnet] Email sent successfully', { email: email.split('@')[1] });

      } catch (emailError) {
        logger.error('[LeadMagnet] Failed to send email', emailError);
        // Don't fail the request - they're still captured in database
        return NextResponse.json({
          success: true,
          message: 'Thank you! We\'ll send your checklist shortly.'
        });
      }
    } else {
      logger.warn('[LeadMagnet] RESEND_API_KEY not configured, skipping email send');
    }

    return NextResponse.json({
      success: true,
      message: 'Checklist sent! Check your email.'
    });

  } catch (error) {
    return errorResponse(error);
  }
}

function getPCSChecklistEmail(baseUrl: string): string {
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Your PCS Financial Checklist</h1>
        <p style="color: #e0e7ff; margin: 12px 0 0 0; font-size: 16px;">Everything you need for a financially successful move</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 40px 20px;">
        <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 16px 0;">Mission Brief: PCS Financial Preparation</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          You're about to execute one of the most financially complex operations in military life. This checklist will help you maximize your entitlements and avoid costly mistakes.
        </p>
        
        <!-- Checklist Items -->
        <div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 24px; margin: 24px 0; border-radius: 8px;">
          <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0;">Critical Financial Actions</h3>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 12px; line-height: 1.4;">✓</span>
              <span style="color: #374151; font-size: 15px; line-height: 1.6;"><strong>Review Your Orders:</strong> Verify reporting date, authorized travel days, and dependent authorization</span>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 12px; line-height: 1.4;">✓</span>
              <span style="color: #374151; font-size: 15px; line-height: 1.6;"><strong>Calculate DITY/PPM Potential:</strong> Compare government contracted move vs. do-it-yourself profit opportunity</span>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 12px; line-height: 1.4;">✓</span>
              <span style="color: #374151; font-size: 15px; line-height: 1.6;"><strong>Request Advance Pay:</strong> Get up to 1 month's pay + allowances to cover upfront costs</span>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 12px; line-height: 1.4;">✓</span>
              <span style="color: #374151; font-size: 15px; line-height: 1.6;"><strong>Research New BAH Rate:</strong> Understand housing cost changes and budget accordingly</span>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 12px; line-height: 1.4;">✓</span>
              <span style="color: #374151; font-size: 15px; line-height: 1.6;"><strong>Track All Receipts:</strong> Keep every receipt for DLA, mileage, lodging, and per diem claims</span>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 12px; line-height: 1.4;">✓</span>
              <span style="color: #374151; font-size: 15px; line-height: 1.6;"><strong>Update Your TSP:</strong> Maintain contributions during PCS and update address</span>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${baseUrl}/dashboard/tools/pcs-planner" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
            Use PCS Financial Planner
          </a>
        </div>
        
        <!-- Additional Resources -->
        <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 16px;">Free Tools Available Now</h4>
          <ul style="color: #15803d; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
            <li>PCS Financial Planner - Budget your entire move</li>
            <li>House Hacking Calculator - Analyze property investment potential</li>
            <li>TSP Calculator - Project retirement growth</li>
            <li>Base Navigator - Compare 203 installations worldwide</li>
          </ul>
        </div>
        
        <!-- Sign-off -->
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
          Questions? Reply to this email - we read every message.
        </p>
        <p style="color: #2563eb; font-weight: 600; margin: 8px 0 0 0;">
          - The Garrison Ledger Team
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; line-height: 1.5;">
          You received this email because you requested the PCS Financial Checklist from Garrison Ledger.
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.5;">
          Garrison Ledger | Military Financial Intelligence Platform<br/>
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
}
