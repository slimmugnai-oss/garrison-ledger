'use client';

import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already seen/dismissed popup
    const hasSeenPopup = localStorage.getItem('exit_intent_shown');
    if (hasSeenPopup) return;

    let lastY = 0;
    let isExiting = false;

    const handleMouseMove = (e: MouseEvent) => {
      const currentY = e.clientY;
      
      // Detect upward movement towards top of page (exit intent)
      if (currentY < 50 && lastY > currentY && !isExiting) {
        isExiting = true;
        setIsVisible(true);
        localStorage.setItem('exit_intent_shown', 'true');
      }
      
      lastY = currentY;
    };

    // Add slight delay before activating (don't trigger immediately)
    const timer = setTimeout(() => {
      document.addEventListener('mousemove', handleMouseMove);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit email to your email capture API
      await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'exit_intent',
          lead_magnet: 'pcs_financial_checklist'
        })
      });

      setIsSubmitted(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.error('Lead capture error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg mx-4 p-8 animate-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <Icon name="X" className="w-6 h-6" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Content */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">
                Wait! Don&apos;t Leave Empty-Handed
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Get our <strong className="text-blue-600">FREE PCS Financial Checklist</strong>
              </p>
              <p className="text-sm text-gray-500">
                The ultimate guide to maximizing your move benefits and avoiding costly mistakes
              </p>
            </div>

            {/* Value bullets */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Complete PCS budget template ($2,000+ average savings)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>TMO coordination checklist (avoid common pitfalls)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Hidden PCS benefits most service members miss</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : '🎁 Send Me the Free Checklist'}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Icon name="CheckCircle" className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Check Your Email! 📧
            </h3>
            <p className="text-gray-600">
              We&apos;ve sent your FREE PCS Financial Checklist to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              (This window will close automatically)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

