import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "nodejs";

/**
 * POST /api/lead-capture
 * 
 * Captures email leads from exit-intent popups, lead magnets, etc.
 * - Stores in database for email marketing
 * - Sends welcome email with promised content
 * - Tracks lead source for attribution
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source, lead_magnet } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      throw Errors.invalidInput("Valid email address is required");
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.invalidInput("Invalid email format");
    }

    // Store lead in database
    const { error: insertError } = await supabaseAdmin
      .from('email_leads')
      .insert({
        email: email.toLowerCase().trim(),
        source: source || 'unknown',
        lead_magnet: lead_magnet || null,
        status: 'subscribed',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      })
      .select()
      .single();

    if (insertError) {
      // Check if email already exists
      if (insertError.code === '23505') { // Unique violation
        logger.info('[LeadCapture] Duplicate email attempt', { email: email.split('@')[1], source });
        return NextResponse.json({ 
          success: true, 
          message: "You're already subscribed!" 
        });
      }
      
      logger.error('[LeadCapture] Failed to capture lead', insertError, { email: email.split('@')[1], source });
      throw Errors.databaseError("Failed to capture lead");
    }

    // Send welcome email with lead magnet (if Resend is configured)
    if (process.env.RESEND_API_KEY && lead_magnet === 'pcs_financial_checklist') {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Garrison Ledger <noreply@familymedia.com>',
            to: [email],
            subject: '🎁 Your FREE PCS Financial Checklist',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 16px;">Your FREE PCS Checklist is Here! 🎁</h1>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                  Thanks for requesting our PCS Financial Checklist! Here's what's inside:
                </p>
                
                <ul style="font-size: 14px; color: #4b5563; line-height: 1.8;">
                  <li><strong>Complete PCS Budget Template</strong> - Track every expense</li>
                  <li><strong>TMO Coordination Checklist</strong> - Never miss a deadline</li>
                  <li><strong>Hidden Benefits Guide</strong> - Maximize your entitlements</li>
                  <li><strong>PPM Profit Calculator</strong> - Could save you $2,000-$5,000</li>
                </ul>
                
                <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 14px; color: #1e40af;">
                    <strong>💡 Pro Tip:</strong> The average PCS costs $3,000-$5,000 out of pocket. Our checklist helps you budget perfectly and avoid surprise expenses.
                  </p>
                </div>
                
                <a href="https://garrison-ledger.vercel.app/dashboard" 
                   style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
                  Access Your Garrison Ledger Dashboard →
                </a>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                  Not a member yet? <a href="https://garrison-ledger.vercel.app/sign-up" style="color: #2563eb;">Create your free account</a> to get your personalized AI-curated financial plan.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                  Garrison Ledger · Intelligent Planning for Military Life<br />
                  <a href="https://garrison-ledger.vercel.app/privacy" style="color: #9ca3af; text-decoration: none;">Privacy Policy</a> · 
                  <a href="https://garrison-ledger.vercel.app/unsubscribe" style="color: #9ca3af; text-decoration: none; margin-left: 8px;">Unsubscribe</a>
                </p>
              </div>
            `
          }),
        });
      } catch (emailError) {
        // Don't fail the request if email fails
        logger.warn('[LeadCapture] Failed to send email', { email: email.split('@')[1], lead_magnet, error: emailError });
      }
    }

    logger.info('[LeadCapture] Lead captured', { email: email.split('@')[1], source, lead_magnet });
    return NextResponse.json({ 
      success: true,
      message: "Check your email for your free checklist!"
    });

  } catch (error) {
    return errorResponse(error);
  }
}

