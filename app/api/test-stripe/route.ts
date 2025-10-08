import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    // Test if Stripe is properly configured
    const balance = await stripe.balance.retrieve();
    
    return NextResponse.json({
      success: true,
      message: 'Stripe is properly configured',
      balance: balance.available[0]?.amount || 0,
      currency: balance.available[0]?.currency || 'usd'
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: JSON.stringify(error, null, 2)
    }, { status: 500 });
  }
}
