import { NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, svix-id, svix-timestamp, svix-signature',
      },
    });
  }

  // Get the headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error('[ClerkWebhook] Signature verification failed', err);
    return new Response('Invalid signature', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      logger.warn('[ClerkWebhook] User created with no email', { userId: id });
      return new Response('No email found', { status: 400 });
    }

    try {
      // Insert into profiles table (used for auth/staff bypass)
      const { error: profilesError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: id,
            email: email,
          },
        ]);

      if (profilesError) {
        logger.error('[ClerkWebhook] Failed to create profiles record', profilesError, { userId: id, email: email.split('@')[1] });
        return new Response('Database error', { status: 500 });
      }

      // Insert the new user into the user_profiles table
      const { error: userProfileError } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            user_id: id,
          },
        ]);

      if (userProfileError) {
        logger.error('[ClerkWebhook] Failed to create user_profiles record', userProfileError, { userId: id, email: email.split('@')[1] });
        // Don't fail the webhook - profiles record is created
      }

      // Create free tier entitlement for new user
      const { error: entitlementError } = await supabaseAdmin
        .from('entitlements')
        .insert([
          {
            user_id: id,
            tier: 'free',
            status: 'active',
          },
        ]);

      if (entitlementError) {
        // Don't fail the webhook - user profile is created, entitlement can be fixed later
        logger.warn('[ClerkWebhook] Failed to create entitlement', { userId: id, error: entitlementError });
      }

      // Initialize gamification for new user
      const { error: gamificationError } = await supabaseAdmin
        .from('user_gamification')
        .insert([
          {
            user_id: id,
            current_streak: 0,
            longest_streak: 0,
            total_logins: 1,
            points: 0,
          },
        ]);

      if (gamificationError) {
        // Don't fail the webhook - core profile is created
        logger.warn('[ClerkWebhook] Failed to create gamification', { userId: id, error: gamificationError });
      }

      logger.info('[ClerkWebhook] New user created', { userId: id, email: email.split('@')[1] });
      return new Response('User created successfully', { status: 200 });
    } catch (error) {
      logger.error('[ClerkWebhook] Error creating user', error, { userId: id });
      return new Response('Internal server error', { status: 500 });
    }
  }

  // For other event types, just return success
  return new Response('Webhook processed', { status: 200 });
}
