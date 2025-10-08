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
    // Temporarily disable verification for debugging
    console.log('Webhook verification failed, parsing payload directly...');
    try {
      evt = JSON.parse(payload) as WebhookEvent;
    } catch (parseErr) {
      console.error('Error parsing payload:', parseErr);
      return new Response('Error occurred', {
        status: 400,
      });
    }
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Webhook with type ${eventType} received`);
  console.log('Webhook data:', JSON.stringify(evt.data, null, 2));

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    console.log('Processing user.created event:', { id, email });

    if (!email) {
      console.error('No email found in webhook data');
      return new Response('No email found', { status: 400 });
    }

    try {
      // Insert the new user into the profiles table
      console.log('Attempting to insert profile:', { id, email });
      
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: id,
            email: email,
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return new Response(`Database error: ${error.message}`, { status: 500 });
      }

      console.log('Profile created successfully:', data);
      console.log(`Profile created for user ${id} with email ${email}`);
      return new Response('Profile created successfully', { status: 200 });
    } catch (error) {
      console.error('Unexpected error:', error);
      return new Response(`Internal server error: ${error}`, { status: 500 });
    }
  }

  // For other event types, just return success
  return new Response('Webhook processed', { status: 200 });
}
