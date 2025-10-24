# Clerk + Supabase Integration

## Architecture

Garrison Ledger uses Clerk for authentication and Supabase for data storage. The integration follows this flow:

1. User signs up via Clerk UI
2. Clerk fires webhook to `/api/webhooks/clerk`
3. Webhook creates records in Supabase:
   - `auth.users` (via Clerk-Supabase sync)
   - `user_profiles`
   - `entitlements`
   - `ask_credits`
   - `user_gamification`
4. Database triggers provide safety net
5. User redirected to dashboard

## Key Tables

- `auth.users` - Supabase auth table (synced from Clerk)
- `user_profiles` - User profile data
- `entitlements` - Premium tier tracking
- `ask_credits` - Ask Assistant credits
- `user_gamification` - Gamification stats

## RLS Policies

All policies use `auth.uid()` to reference the Clerk user ID:

```sql
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

## Safety Mechanisms

1. **Webhook Handler** - Primary user creation
2. **Database Trigger** - Safety net if webhook fails
3. **ensureUserExists()** - Runtime check in critical paths
4. **Admin Monitoring** - Sync status dashboard

## Testing

1. Sign up new user
2. Check `user_profiles` table for record
3. Check `ask_credits` shows 5 credits
4. Check `entitlements` shows 'free' tier
5. Verify dashboard loads without errors

## Integration Benefits

✅ **Automatic User Management** - No manual user creation
✅ **Ask Assistant Ready** - Credits initialized on signup
✅ **Better Security** - RLS with `auth.uid()` reference
✅ **Reliability** - Multiple safety nets prevent gaps
✅ **Monitoring** - Admin dashboard shows sync status
✅ **Scalability** - Handles high signup volume

## Files Involved

### Core Integration Files
- `app/api/webhooks/clerk/route.ts` - Webhook handler
- `lib/ensure-user-exists.ts` - User existence check utility
- `supabase-migrations/20251024_clerk_integration_optimization.sql` - Database triggers

### Admin Monitoring
- `app/api/admin/users/sync-status/route.ts` - Sync status endpoint

### Updated Components
- `app/dashboard/page.tsx` - Uses ensureUserExists()

## Environment Variables

Required for the integration:
- `CLERK_WEBHOOK_SECRET` - Webhook signature verification
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access to Supabase
- `ADMIN_EMAILS` - Comma-separated list of admin emails

## Troubleshooting

### User Not Created in Database
1. Check webhook logs in Vercel
2. Verify `CLERK_WEBHOOK_SECRET` is correct
3. Check if database triggers are working
4. Use `ensureUserExists()` as safety net

### RLS Policy Issues
1. Verify policies use `auth.uid()::text = user_id`
2. Check if user is authenticated
3. Ensure service role is used for admin operations

### Sync Status Issues
1. Call `/api/admin/users/sync-status` endpoint
2. Compare counts across tables
3. Check for failed webhook deliveries
4. Verify database triggers are active

## Migration Notes

This integration was added on 2025-01-24 and includes:
- Ask Assistant credit initialization
- Database triggers for safety net
- Admin monitoring endpoint
- User existence check utility

All existing users will continue to work normally. New users will benefit from the improved initialization process.
