import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs/server';

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
      success_url: successUrl || 'https://garrison-ledger.vercel.app/dashboard?success=true',
      cancel_url: cancelUrl || 'https://garrison-ledger.vercel.app/dashboard?canceled=true',
      metadata: {
        userId: user.id,
      },
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
