import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Test the specific price IDs we're using
    const monthlyPriceId = 'price_1SG1IMQnBqVFfU8hOxI25Axu';
    const annualPriceId = 'price_1SG1IMQnBqVFfU8h25rO6MoP';
    
    const results = [];
    
    // Test monthly price
    try {
      const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId);
      results.push({
        priceId: monthlyPriceId,
        status: 'success',
        data: {
          id: monthlyPrice.id,
          amount: monthlyPrice.unit_amount,
          currency: monthlyPrice.currency,
          interval: monthlyPrice.recurring?.interval,
          active: monthlyPrice.active
        }
      });
    } catch (error) {
      results.push({
        priceId: monthlyPriceId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test annual price
    try {
      const annualPrice = await stripe.prices.retrieve(annualPriceId);
      results.push({
        priceId: annualPriceId,
        status: 'success',
        data: {
          id: annualPrice.id,
          amount: annualPrice.unit_amount,
          currency: annualPrice.currency,
          interval: annualPrice.recurring?.interval,
          active: annualPrice.active
        }
      });
    } catch (error) {
      results.push({
        priceId: annualPriceId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Price ID verification complete',
      results
    });
  } catch (error) {
    console.error('Price test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
