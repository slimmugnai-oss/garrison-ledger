import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';
import { logger } from './logger';

/**
 * Safety function to ensure user exists in database
 * Creates missing user records if they don't exist
 * Used as a safety net in critical paths
 */
export async function ensureUserExists() {
  const user = await currentUser();
  if (!user) return null;

  // Check if user exists in user_profiles
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  // If not exists, create user records (safety net)
  if (!profile) {
    logger.warn('[EnsureUser] User missing from database, creating now', { userId: user.id });
    
    try {
      // Create user_profiles
      await supabaseAdmin.from('user_profiles').insert({ user_id: user.id });
      
      // Create entitlements
      await supabaseAdmin.from('entitlements').insert({
        user_id: user.id,
        tier: 'free',
        status: 'active',
      });
      
      // Create ask_credits
      await supabaseAdmin.from('ask_credits').insert({
        user_id: user.id,
        credits_remaining: 5,
        credits_total: 5,
        tier: 'free',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Create gamification
      await supabaseAdmin.from('user_gamification').insert({
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        total_logins: 1,
        points: 0,
      });

      logger.info('[EnsureUser] User records created successfully', { userId: user.id });
    } catch (error) {
      logger.error('[EnsureUser] Failed to create user records', error, { userId: user.id });
      // Don't throw - let the user continue even if this fails
    }
  }

  return user;
}
