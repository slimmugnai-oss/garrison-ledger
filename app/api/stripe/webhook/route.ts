import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update entitlements for the user
      if (session.metadata?.userId) {
        const userId = session.metadata.userId;
        
        // Get the subscription to determine tier based on price ID
        let tier: 'premium' | 'pro' = 'premium'; // default to premium
        
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          
          // Map price ID to tier
          // Pro tier price IDs
          if (priceId === 'price_1SJOFTQnBqVFfU8hcALojXhY' || // Pro Monthly
              priceId === 'price_1SJOFTQnBqVFfU8hAxbEoVff') { // Pro Annual
            tier = 'pro';
          }
          // Premium tier price IDs (fallback default)
          else if (priceId === 'price_1SHdWQQnBqVFfU8hW2UE3je8' || // Premium Monthly
                   priceId === 'price_1SHdWpQnBqVFfU8hPGQ3hLqK') { // Premium Annual
            tier = 'premium';
          }
        }
        
        await supabaseAdmin
          .from('entitlements')
          .upsert({
            user_id: userId,
            tier: tier,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString()
          });
        
        
        // 🎯 PROCESS REFERRAL CONVERSION (Give $10 rewards to both users)
        try {
          const { data: conversionResult } = await supabaseAdmin
            .rpc('process_referral_conversion', {
              p_referred_user_id: userId
            });
          
          if (conversionResult) {
            // TODO: Send email notifications to both users about their $10 credit
          } else {
          }
        } catch (refError) {
          // Don't fail the webhook if referral processing fails
        }
      }
      
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      break;
    
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      
      // Revoke premium access
      await supabaseAdmin
        .from('entitlements')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
      
      
      break;
    
    default:
  }

  return NextResponse.json({ received: true });
}
