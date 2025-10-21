/**
 * Centralized email configuration
 * 
 * IMPORTANT: Update RESEND_FROM_EMAIL environment variable with your verified domain
 * 
 * Options:
 * 1. Use Resend's default: "onboarding@resend.dev"
 * 2. Verify your domain in Resend dashboard and use: "noreply@yourdomain.com"
 * 
 * To verify a domain in Resend:
 * 1. Go to https://resend.com/domains
 * 2. Add your domain
 * 3. Add DNS records (SPF, DKIM, DMARC)
 * 4. Wait for verification
 * 5. Update RESEND_FROM_EMAIL env var
 */

export const EMAIL_CONFIG = {
  // Sender email - falls back to Resend's default if not configured
  from: process.env.RESEND_FROM_EMAIL || 'Garrison Ledger <onboarding@resend.dev>',
  
  // Reply-to email (where users can actually reply)
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@garrisonledger.com',
  
  // For display purposes
  fromName: 'Garrison Ledger',
} as const;

