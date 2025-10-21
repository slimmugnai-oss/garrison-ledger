# Email Campaign System - Deployment Checklist

**Date:** 2025-10-21  
**Status:** Ready for deployment  

---

## Pre-Deployment Steps

### 1. Database Migration (REQUIRED)
```bash
# Run in Supabase SQL Editor:
# Copy contents of supabase-migrations/62_email_captures_and_campaigns.sql
# Execute the migration

# Verify tables created:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_captures', 'email_campaigns', 'email_analytics');
```

**Expected Result:** 3 tables found

---

### 2. Environment Variables (REQUIRED)

Add to Vercel environment variables:

```bash
# Already configured (verify they exist):
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://garrison-ledger.vercel.app

# NEW - Generate secure random string:
CRON_SECRET=<generate-random-secret>

# OPTIONAL - For internal API calls:
INTERNAL_API_KEY=<generate-random-secret>
```

**How to generate secrets:**
```bash
# macOS/Linux:
openssl rand -hex 32

# Or use online generator:
# https://www.random.org/strings/
```

---

### 3. Verify Resend Configuration

1. Login to Resend Dashboard: https://resend.com/dashboard
2. Verify `RESEND_API_KEY` is valid and active
3. Check current quota/usage
4. Verify domain `familymedia.com` is verified
5. Check rate limits: Free tier = 10 emails/second

---

## Deployment Steps

### 1. Commit Changes

```bash
# Stage all changes:
git add .

# Commit with descriptive message:
git commit -m "feat: Complete email campaign system audit and fixes

- Add email_captures, email_campaigns, email_analytics tables
- Implement lead magnet email sending (PCS checklist)
- Fix onboarding email templates (remove emojis, add unsubscribe)
- Add weekly digest cron job to vercel.json
- Create onboarding sequence automation cron
- Build test email, bulk announcement, targeted campaign modals
- Add test-send and bulk-send API endpoints
- Replace hardcoded URLs with environment variables
- Add CAN-SPAM compliance footers to all emails

Fixes: #email-campaign-audit
Status: All P0 and P1 issues resolved"
```

### 2. Push to GitHub

```bash
git push origin main
```

**Vercel will auto-deploy.**

---

### 3. Apply Database Migration

**In Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/[your-project]/sql
2. Open: `supabase-migrations/62_email_captures_and_campaigns.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify: ✅ "Success. No rows returned"

---

### 4. Set Environment Variables in Vercel

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** [generated secret from step 2]
   - **Environment:** Production, Preview, Development
   - Click "Save"

3. **Redeploy** to apply new environment variable:
   - Go to Deployments tab
   - Click ⋮ on latest deployment
   - Click "Redeploy"

---

### 5. Verify Cron Jobs in Vercel

1. Go to: Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Verify these cron jobs exist:

```
✅ /api/emails/weekly-digest - 0 19 * * 0 (Sundays 7pm UTC)
✅ /api/cron/onboarding-sequence - 0 6 * * * (Daily 6am UTC)
```

If not visible, trigger a redeploy.

---

## Post-Deployment Testing

### 1. Test Lead Magnet Email (5 min)

1. Go to: https://garrison-ledger.vercel.app/[lead-magnet-form-page]
2. Submit your personal email
3. **Expected:** Receive PCS Financial Checklist email within 1 minute
4. **Verify:**
   - Subject: "Your PCS Financial Checklist - Garrison Ledger"
   - Email renders correctly
   - Unsubscribe link works
   - CTA button links to correct page

---

### 2. Test Send Test Email (5 min)

1. Go to: https://garrison-ledger.vercel.app/dashboard/admin/campaigns
2. Click "Send Test Email" button
3. Enter your email address
4. Select template: "Onboarding Day 1 - Welcome"
5. Click "Send Test"
6. **Expected:** Test email received within 30 seconds
7. **Verify:**
   - Subject: "[TEST] Welcome to Garrison Ledger, Service Member - Mission Briefing"
   - NO emojis in subject or body
   - Unsubscribe link present
   - All links work

---

### 3. Test Bulk Announcement (CAREFUL - Use Test Segment)

**IMPORTANT:** Don't send to all users yet!

1. First, verify database has test data:
```sql
-- Check how many users would receive email:
SELECT COUNT(*) FROM email_preferences WHERE subscribed_to_marketing = true;
SELECT COUNT(*) FROM email_captures;
```

2. If count > 10, **SKIP** bulk test for now
3. If count < 5, safe to test:
   - Go to campaigns page
   - Click "Bulk Announcement"
   - Subject: "Test Announcement - Please Ignore"
   - Message: "This is a test of the bulk email system. You can ignore this message."
   - Click "Send to All"
   - **Verify:** See success message with count

---

### 4. Verify Database Tables (5 min)

```sql
-- Check email_captures populated:
SELECT * FROM email_captures ORDER BY created_at DESC LIMIT 5;

-- Check email_campaigns created:
SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 5;

-- Check email_logs populated:
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

**Expected:** Rows exist with your test data

---

### 5. Check Cron Job Logs (24 hours later)

**Next Day at 6:05am UTC:**
```bash
# In Vercel dashboard:
# Functions → /api/cron/onboarding-sequence → Logs
```

**Expected:**
- "Starting onboarding sequence processing"
- "Found X users ready for onboarding emails" OR "No users to email"
- No errors

**Sunday at 7:05pm UTC:**
```bash
# Functions → /api/emails/weekly-digest → Logs
```

**Expected:**
- "Starting weekly digest send"
- "Found X weekly digest subscribers" OR "No subscribers"
- No errors

---

## Monitoring (First Week)

### Daily Checks:

1. **Resend Dashboard** (https://resend.com/dashboard)
   - Check delivery rate (should be > 95%)
   - Check bounce rate (should be < 5%)
   - Check complaint rate (should be < 0.1%)

2. **Vercel Function Logs**
   - `/api/emails/weekly-digest` - Check Sundays 7pm UTC
   - `/api/cron/onboarding-sequence` - Check daily 6am UTC
   - Look for errors or failed sends

3. **Database Metrics**
```sql
-- Daily email volume:
SELECT 
  DATE(sent_at) as date,
  template,
  status,
  COUNT(*) as count
FROM email_logs
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at), template, status
ORDER BY date DESC;

-- Campaign performance:
SELECT 
  name,
  total_recipients,
  emails_sent,
  emails_failed,
  sent_at
FROM email_campaigns
ORDER BY sent_at DESC
LIMIT 10;
```

---

## Rollback Plan (If Needed)

### If Emails Sending Too Many/Wrong Recipients:

1. **Immediately pause cron jobs:**
   - Remove cron entries from `vercel.json`
   - Commit and push
   - Wait for deployment

2. **Stop manual sends:**
   - Add `return NextResponse.json({ error: 'Temporarily disabled' })` to bulk-send route
   - Deploy

3. **Investigate:**
   - Check `email_logs` for unexpected sends
   - Check `email_preferences` for incorrect subscriber counts
   - Check Resend logs

### If Database Migration Fails:

1. **Don't panic** - Tables are additive, won't break existing features
2. Check error message for specific issue
3. Fix SQL syntax if needed
4. Drop failed tables: `DROP TABLE IF EXISTS email_captures, email_campaigns, email_analytics;`
5. Re-run corrected migration

---

## Success Criteria

After 7 days of monitoring, verify:

- [ ] Weekly digest sent successfully (check Sunday logs)
- [ ] Onboarding emails sending daily (check daily logs)
- [ ] Lead magnet emails sending (submit test form)
- [ ] Test email modal works
- [ ] Bulk announcement modal works (tested with small group)
- [ ] Zero bounce complaints
- [ ] Delivery rate > 95%
- [ ] No errors in cron job logs
- [ ] Database tables populated correctly

**If all checked:** ✅ Email system is production-ready and operating correctly

---

## Support & Troubleshooting

### Common Issues:

**Issue:** Emails not sending  
**Check:**
- `RESEND_API_KEY` set correctly in Vercel
- Resend account not over quota
- Domain `familymedia.com` verified in Resend

**Issue:** Cron jobs not running  
**Check:**
- `vercel.json` pushed to GitHub
- `CRON_SECRET` set in Vercel environment variables
- Function logs for authentication errors

**Issue:** Database errors  
**Check:**
- Migration ran successfully in Supabase
- RLS policies enabled
- Admin user ID correct in campaign routes

**Issue:** Unsubscribe links not working  
**Check:**
- `NEXT_PUBLIC_APP_URL` set correctly
- `/dashboard/settings` page exists and works
- Email preference update functionality works

---

## Contacts for Issues

- **Resend Support:** support@resend.com
- **Supabase Support:** https://supabase.com/dashboard/support
- **Vercel Support:** https://vercel.com/help

---

**Deployment Checklist Version:** 1.0  
**Last Updated:** 2025-10-21  
**Status:** Ready for production deployment

