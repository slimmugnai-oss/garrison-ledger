'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/Icon';

interface TargetedCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TargetedCampaignModal({ isOpen, onClose }: TargetedCampaignModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [segment, setSegment] = useState<'premium' | 'free' | 'has_plan' | 'no_plan'>('premium');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ totalRecipients: number; sent: number; failed: number } | null>(null);

  const getSegmentConfig = () => {
    switch (segment) {
      case 'premium':
        return { premiumOnly: true };
      case 'free':
        return { premiumOnly: false };
      case 'has_plan':
        return { hasPlan: true };
      case 'no_plan':
        return { hasPlan: false };
      default:
        return null;
    }
  };

  const getSegmentDescription = () => {
    switch (segment) {
      case 'premium':
        return 'Premium subscribers only';
      case 'free':
        return 'Free users only (non-premium)';
      case 'has_plan':
        return 'Users with AI-generated plans';
      case 'no_plan':
        return 'Users without AI plans (potential conversion)';
      default:
        return '';
    }
  };

  const handleSend = async () => {
    if (!subject || !message) {
      setError('Please fill in all fields');
      return;
    }

    const confirmed = window.confirm(
      `Send to: ${getSegmentDescription()}\n\nAre you sure? This cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Garrison Ledger</h1>
          <div style="font-size: 16px; color: #374151; line-height: 1.6; white-space: pre-wrap;">
            ${message.replace(/\n/g, '<br />')}
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
            - The Garrison Ledger Team
          </p>
        </div>
      `;

      const response = await fetch('/api/campaigns/bulk-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          html,
          segment: getSegmentConfig()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send targeted campaign');
      }

      setSuccess(true);
      setResult(data);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSubject('');
        setMessage('');
        setResult(null);
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send targeted campaign');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-headings">Targeted Campaign</h2>
            <p className="text-sm text-text-muted mt-1">Send to specific user segment</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body transition-colors"
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Segment Selector */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              Target Segment
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as 'premium' | 'free' | 'has_plan' | 'no_plan')}
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info"
            >
              <option value="premium">Premium Subscribers</option>
              <option value="free">Free Users Only</option>
              <option value="has_plan">Users with AI Plans</option>
              <option value="no_plan">Users without AI Plans</option>
            </select>
            <p className="text-xs text-text-muted mt-1">
              {getSegmentDescription()}
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Exclusive Feature Update for Premium Members"
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your targeted message here..."
              rows={8}
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <Icon name="Check" className="h-5 w-5" />
                Campaign sent successfully!
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>Segment: {getSegmentDescription()}</p>
                <p>Total recipients: {result.totalRecipients}</p>
                <p>Successfully sent: {result.sent}</p>
                {result.failed > 0 && <p className="text-amber-700">Failed: {result.failed}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-subtle rounded-lg text-text-body hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || success}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : success ? (
              <>
                <Icon name="Check" className="h-4 w-4" />
                Sent!
              </>
            ) : (
              <>
                <Icon name="Target" className="h-4 w-4" />
                Send to Segment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

