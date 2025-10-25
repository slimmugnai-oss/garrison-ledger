'use client';

import { useState } from 'react';

import Icon from '@/app/components/ui/Icon';

interface BulkAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkAnnouncementModal({ isOpen, onClose }: BulkAnnouncementModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ totalRecipients: number; sent: number; failed: number } | null>(null);

  const handleSend = async () => {
    if (!subject || !message) {
      setError('Please fill in all fields');
      return;
    }

    // Confirmation
    const confirmed = window.confirm(
      `Are you sure you want to send this announcement to ALL subscribers? This cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Convert simple message to HTML
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 16px;">Garrison Ledger Update</h1>
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
          segment: null // Send to all
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send bulk announcement');
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
      setError(err instanceof Error ? err.message : 'Failed to send bulk announcement');
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
            <h2 className="text-2xl font-bold text-text-headings">Bulk Announcement</h2>
            <p className="text-sm text-text-muted mt-1">Send to all subscribed users</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body transition-colors"
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-semibold">Important</p>
            <p className="text-xs text-amber-700 mt-1">
              This will send to ALL subscribers. Make sure your message is professional, valuable, and error-free.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-text-body mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Important Update: New Financial Tools Available"
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
              placeholder="Write your announcement here..."
              rows={8}
              className="w-full px-4 py-2 border border-subtle rounded-lg focus:ring-2 focus:ring-info focus:border-info resize-none"
            />
            <p className="text-xs text-text-muted mt-1">
              Plain text only. Line breaks will be preserved.
            </p>
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
            className="flex-1 px-4 py-2 bg-success hover:bg-success text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                Sending to all subscribers...
              </>
            ) : success ? (
              <>
                <Icon name="Check" className="h-4 w-4" />
                Sent!
              </>
            ) : (
              <>
                <Icon name="Users" className="h-4 w-4" />
                Send to All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

