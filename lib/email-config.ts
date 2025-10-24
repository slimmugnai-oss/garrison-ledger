/**
 * Centralized email configuration
 *
 * PRODUCTION: Using verified garrisonledger.com domain
 *
 * Configuration:
 * - From: Garrison Ledger <noreply@garrisonledger.com> (via RESEND_FROM_EMAIL env var)
 * - Reply-to: support@garrisonledger.com (for user replies)
 *
 * To update sender email:
 * 1. Update RESEND_FROM_EMAIL environment variable in Vercel
 * 2. Redeploy to pick up changes
 *
 * Domain verification completed in Resend dashboard:
 * - garrisonledger.com verified with DNS records
 * - SPF, DKIM, DMARC configured
 */

export const EMAIL_CONFIG = {
  // Sender email - uses verified garrisonledger.com domain
  from: process.env.RESEND_FROM_EMAIL || "Garrison Ledger <noreply@garrisonledger.com>",

  // Reply-to email (where users can actually reply)
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || "support@garrisonledger.com",

  // For display purposes
  fromName: "Garrison Ledger",
} as const;
