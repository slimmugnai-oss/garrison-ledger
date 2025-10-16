import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await req.json();
    
    // Log the request for debugging
    console.log('Creating checkout session with:', {
      priceId,
      userEmail: user.emailAddresses[0]?.emailAddress,
      userId: user.id
    });

    // 🎯 CHECK REFERRAL CREDITS - Auto-apply discount
    let discountCouponId: string | undefined;
    try {
      const { data: creditBalance } = await supabaseAdmin
        .rpc('get_user_credit_balance', { p_user_id: user.id });
      
      if (creditBalance && creditBalance > 0) {
        console.log(`💰 User has ${creditBalance} cents in referral credits`);
        
        // Create one-time Stripe coupon for their credit amount
        const coupon = await stripe.coupons.create({
          amount_off: creditBalance, // Amount in cents
          currency: 'usd',
          duration: 'once',
          name: `Referral Credit - $${(creditBalance / 100).toFixed(2)}`,
        });
        
        discountCouponId = coupon.id;
        console.log('✅ Created discount coupon:', coupon.id, `for $${(creditBalance / 100).toFixed(2)}`);
        
        // Mark credits as used (negative entry)
        await supabaseAdmin
          .from('user_reward_credits')
          .insert({
            user_id: user.id,
            amount_cents: -creditBalance, // Negative = used
            source: 'used_for_premium',
            description: `Applied $${(creditBalance / 100).toFixed(2)} credit to premium purchase`,
          });
      } else {
        console.log('ℹ️ No referral credits available for user');
      }
    } catch (creditError) {
      console.error('⚠️ Credit check error (non-critical):', creditError);
      // Continue without discount if credit check fails
    }

    // Test if the price ID exists
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price found:', {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        active: price.active
      });
    } catch (priceError) {
      console.error('Price ID error:', priceError);
      return NextResponse.json({
        error: 'Invalid price ID',
        details: priceError instanceof Error ? priceError.message : 'Unknown error'
      }, { status: 400 });
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

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
