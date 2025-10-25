'use client';

import { useState } from 'react';

import Icon from '@/app/components/ui/Icon';

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestEmailModal({ isOpen, onClose }: TestEmailModalProps) {
  const [testEmail, setTestEmail] = useState('');
  const [templateType, setTemplateType] = useState('onboarding_welcome');
  const [userName, setUserName] = useState('Service Member');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!testEmail) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/campaigns/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail,
          templateType,
          templateData: { userName }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send test email');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setTestEmail('');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-headings">Send Test Email</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body transition-colors"
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Test Email Input */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              Send To
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info"
            />
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              Email Template
            </label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info"
            >
              <optgroup label="Onboarding Sequence (3 emails)">
                <option value="onboarding_welcome">Day 0 - Welcome (6 Free Tools)</option>
                <option value="onboarding_features">Day 3 - Unique Features (Navigator + LES)</option>
                <option value="onboarding_premium">Day 7 - Premium Upgrade</option>
              </optgroup>
              <optgroup label="Recurring & Lead Magnets">
                <option value="weekly_digest">Weekly Digest</option>
                <option value="pcs_checklist">PCS Checklist (Lead Magnet)</option>
              </optgroup>
            </select>
          </div>

          {/* User Name */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              User Name (for personalization)
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="E-5, O-3, Service Member"
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              Test email sent successfully! Check your inbox.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-subtle rounded-lg text-text-body hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || success}
            className="flex-1 px-4 py-2 bg-info hover:bg-info text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <Icon name="Send" className="h-4 w-4" />
                Send Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

