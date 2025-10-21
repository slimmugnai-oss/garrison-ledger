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

      const { sessionId, url } = await response.json();

      if (url) {
        // Use the direct session URL from Stripe
        window.location.href = url;
      } else if (sessionId) {
        // Fallback to constructing the URL
        window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`${className || 'bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg hover:shadow-xl`}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
}
