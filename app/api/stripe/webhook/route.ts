import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { auditLogger } from "@/lib/audit-logger";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    logger.error("Stripe webhook signature verification failed", err);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  logger.info("Stripe webhook received", { eventType: event.type, eventId: event.id });

  // ==========================================================================
  // IDEMPOTENCY CHECK - Prevent duplicate processing
  // ==========================================================================
  const { data: existing } = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('id, status')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existing) {
    logger.info('[StripeWebhook] Duplicate event ignored', { 
      eventId: event.id, 
      eventType: event.type,
      previousStatus: existing.status 
    });
    return NextResponse.json({ 
      received: true, 
      duplicate: true,
      message: 'Event already processed' 
    });
  }

  // Record event start (prevents concurrent processing of same event)
  const { error: insertError } = await supabaseAdmin
    .from('stripe_webhook_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
      status: 'processed'
    });

  if (insertError) {
    logger.error('[StripeWebhook] Failed to record event', insertError, { eventId: event.id });
    // Continue anyway - idempotency is best-effort
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      // Update entitlements for the user
      if (session.metadata?.userId) {
        const userId = session.metadata.userId;

        // Check if this is a credit pack purchase (one-time payment)
        if (session.payment_status === "paid" && !session.subscription) {
          // This is a credit pack purchase
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const lineItem = lineItems.data[0];

          if (lineItem && lineItem.price) {
            const priceId = lineItem.price.id;
            const quantity = lineItem.quantity || 1;

            // Map price ID to credit pack size
            let packSize = 0;
            let priceCents = 0;

            if (priceId === "price_1SLShbQnBqVFfU8hmlMX4OAw") {
              packSize = 25;
              priceCents = 199;
            } else if (priceId === "price_1SLSjiQnBqVFfU8hQM482yKn") {
              packSize = 100;
              priceCents = 599;
            } else if (priceId === "price_1SLSkfQnBqVFfU8hYGhP4kXE") {
              packSize = 250;
              priceCents = 999;
            }

            if (packSize > 0) {
              // Record the purchase
              await supabaseAdmin.from("ask_credit_purchases").insert({
                user_id: userId,
                pack_size: packSize,
                price_cents: priceCents,
                stripe_payment_intent_id: session.payment_intent as string,
                status: "completed",
              });

              // Add credits to user's account
              const { data: existingCredits } = await supabaseAdmin
                .from("ask_credits")
                .select("*")
                .eq("user_id", userId)
                .single();

              if (existingCredits) {
                // Update existing credits
                await supabaseAdmin
                  .from("ask_credits")
                  .update({
                    credits_remaining: existingCredits.credits_remaining + packSize,
                    credits_total: existingCredits.credits_total + packSize,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", userId);
              } else {
                // Create new credit record
                await supabaseAdmin.from("ask_credits").insert({
                  user_id: userId,
                  credits_remaining: packSize,
                  credits_total: packSize,
                  tier: "pack",
                });
              }

              logger.info("Credit pack purchase processed", {
                userId,
                packSize,
                priceCents,
              });

              // AUDIT LOG: Record credit pack purchase
              await auditLogger.logPayment(
                userId,
                'credit_pack_purchased',
                session.payment_intent as string,
                'success',
                {
                  pack_size: packSize,
                  price_cents: priceCents,
                  stripe_session_id: session.id
                }
              );
            }
          }
        } else if (session.subscription) {
          // This is a subscription (premium/pro tier)
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;

          // Map price ID to tier
          let tier: "premium" | "pro" = "premium"; // default to premium

          // Pro tier price IDs
          if (
            priceId === "price_1SJOFTQnBqVFfU8hcALojXhY" || // Pro Monthly
            priceId === "price_1SJOFTQnBqVFfU8hAxbEoVff"
          ) {
            // Pro Annual
            tier = "pro";
          }
          // Premium tier price IDs (fallback default)
          else if (
            priceId === "price_1SHdWQQnBqVFfU8hW2UE3je8" || // Premium Monthly
            priceId === "price_1SHdWpQnBqVFfU8hPGQ3hLqK"
          ) {
            // Premium Annual
            tier = "premium";
          }

          await supabaseAdmin.from("entitlements").upsert({
            user_id: userId,
            tier: tier,
            status: "active",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          });

          // 🎯 PROCESS REFERRAL CONVERSION (Give $10 rewards to both users)
          try {
            const { data: conversionResult } = await supabaseAdmin.rpc(
              "process_referral_conversion",
              {
                p_referred_user_id: userId,
              }
            );

            if (conversionResult) {
              logger.info("Referral conversion processed via Stripe webhook", { userId });
              // TODO: Send email notifications to both users about their $10 credit
            }
          } catch (refError) {
            logger.warn("Referral conversion failed in Stripe webhook", {
              error: refError instanceof Error ? refError.message : "Unknown",
              userId,
            });
            // Don't fail the webhook if referral processing fails
          }

          // AUDIT LOG: Record subscription creation
          await auditLogger.logPayment(
            userId,
            'subscription_created',
            session.subscription as string,
            'success',
            {
              tier,
              stripe_customer_id: session.customer as string,
              price_id: priceId
            }
          );
        }
      }

      break;

    case "payment_intent.succeeded":
      // Future: Handle payment intent succeeded
      break;

    case "invoice.payment_succeeded":
      // Future: Handle invoice payment succeeded
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;

      // Get user ID before canceling
      const { data: entitlementToCancel } = await supabaseAdmin
        .from("entitlements")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      // Revoke premium access
      await supabaseAdmin
        .from("entitlements")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      // AUDIT LOG: Record subscription cancellation
      if (entitlementToCancel) {
        await auditLogger.logPayment(
          entitlementToCancel.user_id,
          'subscription_canceled',
          subscription.id,
          'success',
          {
            stripe_subscription_id: subscription.id,
            canceled_at: new Date().toISOString()
          }
        );
      }

      break;

    default:
      logger.info('[StripeWebhook] Unhandled event type', { eventType: event.type });
  }

  // Update processing time
  const processingTime = Date.now() - startTime;
  await supabaseAdmin
    .from('stripe_webhook_events')
    .update({ processing_time_ms: processingTime })
    .eq('event_id', event.id);

  logger.info('[StripeWebhook] Event processed successfully', {
    eventId: event.id,
    eventType: event.type,
    processingTimeMs: processingTime
  });

  return NextResponse.json({ received: true });
}
