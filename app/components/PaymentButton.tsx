'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  priceId: string;
  buttonText?: string;
  className?: string;
}

export default function PaymentButton({ 
  priceId, 
  buttonText = 'Subscribe Now',
  className = ''
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
        }),
      });

      const { sessionId } = await response.json();

      if (sessionId) {
        // Redirect to Stripe Checkout using the session URL
        const stripe = await import('@stripe/stripe-js').then(mod => mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId,
          });
          
          if (error) {
            console.error('Stripe checkout error:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
}
