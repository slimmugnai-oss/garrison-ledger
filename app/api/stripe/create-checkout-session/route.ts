import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw Errors.unauthorized();
    }

    const { priceId, successUrl, cancelUrl } = await req.json();
    
    // Log checkout request
    logger.info('Checkout session requested', {
      priceId,
      userEmail: user.emailAddresses[0]?.emailAddress ? 'has_email' : 'no_email',
      userId: user.id.substring(0, 8) + '...'
    });

    // 🎯 CHECK REFERRAL CREDITS - Auto-apply discount
    let discountCouponId: string | undefined;
    try {
      const { data: creditBalance } = await supabaseAdmin
        .rpc('get_user_credit_balance', { p_user_id: user.id });
      
      if (creditBalance && creditBalance > 0) {
        
        // Create one-time Stripe coupon for their credit amount
        const coupon = await stripe.coupons.create({
          amount_off: creditBalance, // Amount in cents
          currency: 'usd',
          duration: 'once',
          name: `Referral Credit - $${(creditBalance / 100).toFixed(2)}`,
        });
        
        discountCouponId = coupon.id;
        
        // Mark credits as used (negative entry)
        await supabaseAdmin
          .from('user_reward_credits')
          .insert({
            user_id: user.id,
            amount_cents: -creditBalance, // Negative = used
            source: 'used_for_premium',
            description: `Applied $${(creditBalance / 100).toFixed(2)} credit to premium purchase`,
          });
        
        logger.info('Referral credit applied to checkout', {
          userId: user.id.substring(0, 8) + '...',
          creditAmount: creditBalance
        });
      }
    } catch (creditError) {
      // Continue without discount if credit check fails
      logger.warn('Failed to apply referral credit', {
        error: creditError instanceof Error ? creditError.message : 'Unknown error',
        userId: user.id.substring(0, 8) + '...'
      });
    }

    // Validate price ID exists
    try {
      const price = await stripe.prices.retrieve(priceId);
      
      logger.debug('Stripe price validated', {
        priceId: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        active: price.active
      });
      
      if (!price.active) {
        throw Errors.invalidInput('Price is not active');
      }
    } catch (priceError) {
      logger.error('Invalid Stripe price ID', priceError, { priceId });
      throw Errors.invalidInput(
        'Invalid price ID',
        { priceId, error: priceError instanceof Error ? priceError.message : 'Unknown' }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0]?.emailAddress,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://garrison-ledger.vercel.app'}/dashboard/upgrade/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://garrison-ledger.vercel.app'}/dashboard/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
      },
      // 🎯 AUTO-APPLY REFERRAL CREDIT DISCOUNT
      ...(discountCouponId && {
        discounts: [{ coupon: discountCouponId }],
      }),
    });

    logger.info('Checkout session created successfully', {
      sessionId: session.id,
      hasDiscount: Boolean(discountCouponId),
      userId: user.id.substring(0, 8) + '...'
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    return errorResponse(error);
  }
}
