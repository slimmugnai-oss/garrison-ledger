import { NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error('No email found in webhook data');
      return new Response('No email found', { status: 400 });
    }

    try {
      // Insert the new user into the user_profiles table
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            clerk_user_id: id,
            email: email,
          },
        ]);

      if (profileError) {
        console.error('Error inserting user_profile:', profileError);
        return new Response('Database error', { status: 500 });
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
        console.error('Error creating entitlement:', entitlementError);
        // Don't fail the webhook - user profile is created, entitlement can be fixed later
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
        console.error('Error creating gamification:', gamificationError);
        // Don't fail the webhook - core profile is created
      }

      return new Response('User created successfully', { status: 200 });
    } catch (error) {
      console.error('Unexpected error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  // For other event types, just return success
  return new Response('Webhook processed', { status: 200 });
}
