/**
 * TDY VOUCHER CHECKLIST
 * 
 * Final ready-to-submit voucher package (premium only)
 */

'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import type { TdyVoucher } from '@/app/types/tdy';

interface Props {
  tripId: string;
  isPremium: boolean;
}

export default function TdyVoucherChecklist({ tripId, isPremium }: Props) {
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<TdyVoucher | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVoucher = async () => {
    if (!isPremium) {
      alert('Voucher generation is a premium feature. Upgrade to download ready-to-submit package.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tdy/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate voucher');
      }

      const { voucher } = await response.json();
      setVoucher(voucher);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!voucher) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <Icon name="File" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Submit?
          </h3>
          <p className="text-gray-600 mb-6">
            Generate your final voucher package with all line items, totals, and compliance checks.
          </p>

          {isPremium ? (
            <button
              onClick={generateVoucher}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Generate Voucher Package'}
            </button>
          ) : (
            <div>
              <div className="bg-gray-100 rounded-lg p-6 mb-4 blur-sm">
                <p className="text-gray-600">Voucher preview locked</p>
              </div>
              <a
                href="/dashboard/upgrade?feature=tdy-voucher"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Upgrade to Download Voucher →
              </a>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Final Voucher Package</h3>
        <p className="text-sm text-gray-600 mt-1">
          Ready to submit to finance
        </p>
      </div>

      {/* Checklist */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Submission Checklist:</h4>
        <div className="space-y-2">
          {voucher.checklist.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Trip Summary:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Purpose</p>
            <p className="font-medium text-gray-900">{voucher.trip.purpose}</p>
          </div>
          <div>
            <p className="text-gray-600">Duration</p>
            <p className="font-medium text-gray-900">
              {new Date(voucher.trip.depart_date).toLocaleDateString()} →{' '}
              {new Date(voucher.trip.return_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Origin</p>
            <p className="font-medium text-gray-900">{voucher.trip.origin}</p>
          </div>
          <div>
            <p className="text-gray-600">Destination</p>
            <p className="font-medium text-gray-900">{voucher.trip.destination}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => {
            const json = JSON.stringify(voucher, null, 2);
            navigator.clipboard.writeText(json);
            alert('Voucher JSON copied to clipboard!');
          }}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Copy JSON
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Print Checklist
        </button>
      </div>
    </div>
  );
}

