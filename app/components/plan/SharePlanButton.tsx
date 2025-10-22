'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';

interface SharePlanButtonProps {
  className?: string;
}

export default function SharePlanButton({ className }: SharePlanButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [spouseConnected, setSpouseConnected] = useState(false);
  const [spouseUserId, setSpouseUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    // Check if user has a connected spouse
    async function checkSpouseConnection() {
      const response = await fetch('/api/collaboration/route');
      if (response.ok) {
        const data = await response.json();
        if (data.connection && data.connection.status === 'connected') {
          setSpouseConnected(true);
          // Determine spouse user ID
          const spouseId = data.connection.user_id_1 === data.currentUserId 
            ? data.connection.user_id_2 
            : data.connection.user_id_1;
          setSpouseUserId(spouseId);
        }
      }
    }
    checkSpouseConnection();
  }, []);

  const handleShare = async () => {
    if (!spouseUserId) return;

    setSharing(true);
    try {
      const response = await fetch('/api/plan/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spouse_user_id: spouseUserId,
          message: message.trim() || undefined,
          can_regenerate: false
        })
      });

      if (response.ok) {
        setShared(true);
        setTimeout(() => {
          setShowModal(false);
          setShared(false);
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to share plan:', error);
      alert('Failed to share plan. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  if (!spouseConnected) {
    return null; // Don't show if no spouse connected
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className || "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"}
      >
        <Icon name="Share2" className="h-4 w-4" />
        Share with Spouse
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            {shared ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Plan Shared!</h3>
                <p className="text-slate-600">Your spouse can now view your plan</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Share Your Plan</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Icon name="X" className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-slate-600 mb-4">
                  Share your personalized financial plan with your spouse for collaborative planning.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Add a message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hey, check out my updated financial plan..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {sharing ? (
                      <>
                        <Icon name="Loader" className="h-5 w-5 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Icon name="Share2" className="h-5 w-5" />
                        Share Plan
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

