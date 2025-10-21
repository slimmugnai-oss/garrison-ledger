'use client';

import { useState } from 'react';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

export default function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // Call API to capture email and send checklist
      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'pcs-checklist' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send checklist');
      }
      
      setSubmitted(true);
    } catch (error) {
      // Show user-friendly error
      alert('Failed to send checklist. Please try again or contact support@garrisonledger.com');
      
      if (process.env.NODE_ENV === 'development') {
        console.error('[LeadMagnet] Submission failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedCard delay={0}>
          {!submitted ? (
            <div className="bg-white rounded-2xl p-10 shadow-2xl border-2 border-green-200">
              <div className="text-center mb-8">
                <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                  <Icon name="Gift" className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Not Ready to Sign Up? Start Here.
                </h2>
                <p className="text-xl text-gray-700">
                  Download our free <strong>PCS Financial Checklist</strong> - no account required
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-8 mb-8 border-2 border-green-200">
                <h3 className="font-bold text-xl mb-4 text-gray-900">🎁 What You'll Get:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle" className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Complete PCS Timeline</div>
                      <div className="text-sm text-gray-600">90-60-30 day action items</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle" className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">DITY Move Calculator</div>
                      <div className="text-sm text-gray-600">Estimate PPM profit potential</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle" className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Entitlements Checklist</div>
                      <div className="text-sm text-gray-600">Don't miss any allowances</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle" className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Money-Saving Hacks</div>
                      <div className="text-sm text-gray-600">Save $500+ on your move</div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  >
                    {loading ? 'Sending...' : 'Download Free Checklist →'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  We respect your privacy. Unsubscribe anytime. No spam, ever.
                </p>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 shadow-2xl border-2 border-green-500 text-center">
              <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
                <Icon name="CheckCircle" className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h3>
              <p className="text-xl text-gray-700 mb-8">
                We've sent the <strong>PCS Financial Checklist</strong> to <strong>{email}</strong>
              </p>
              <p className="text-gray-600 mb-6">
                While you're here, why not create a free account to access our full suite of calculators and get your personalized AI plan?
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                Create Free Account →
              </button>
            </div>
          )}
        </AnimatedCard>
      </div>
    </section>
  );
}

