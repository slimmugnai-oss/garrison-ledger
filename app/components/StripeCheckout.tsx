'use client';

import { useState } from 'react';

interface StripeCheckoutProps {
  priceId: string;
  buttonText?: string;
  className?: string;
}

export default function StripeCheckout({ 
  priceId, 
  buttonText = 'Subscribe Now',
  className = ''
}: StripeCheckoutProps) {
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
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
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
