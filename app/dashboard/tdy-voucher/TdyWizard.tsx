/**
 * TDY WIZARD - COMPLETE
 * 
 * Multi-step wizard for building travel vouchers
 */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import TdyUploadZone from '@/app/components/tdy/TdyUploadZone';
import TdyItemsTable from '@/app/components/tdy/TdyItemsTable';
import TdyEstimateView from '@/app/components/tdy/TdyEstimateView';
import TdyFlagsView from '@/app/components/tdy/TdyFlagsView';
import TdyVoucherChecklist from '@/app/components/tdy/TdyVoucherChecklist';
import type { TdyItem, EstimateTotals, TdyFlag } from '@/app/types/tdy';

interface Props {
  tripId: string;
  isPremium: boolean;
  onBack: () => void;
}

export default function TdyWizard({ tripId, isPremium, onBack }: Props) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review Items, 3: Estimate, 4: Check, 5: Voucher
  const [docs, setDocs] = useState<any[]>([]);
  const [items, setItems] = useState<TdyItem[]>([]);
  const [totals, setTotals] = useState<EstimateTotals | null>(null);
  const [flags, setFlags] = useState<TdyFlag[]>([]);
  const [loading, setLoading] = useState(false);

  // Load docs and items
  const loadData = async () => {
    try {
      // Load documents
      const docsRes = await fetch(`/api/tdy/docs?tripId=${tripId}`);
      if (docsRes.ok) {
        const { docs } = await docsRes.json();
        setDocs(docs || []);
      }

      // Load items
      const itemsRes = await fetch(`/api/tdy/items?tripId=${tripId}`);
      if (itemsRes.ok) {
        const { items } = await itemsRes.json();
        setItems(items || []);
      }
    } catch {
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  // Compute estimate
  const computeEstimate = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/tdy/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });

      if (response.ok) {
        const { totals } = await response.json();
        setTotals(totals);
        setStep(3);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Run compliance check
  const runCheck = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/tdy/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });

      if (response.ok) {
        const { flags } = await response.json();
        setFlags(flags);
        setStep(4);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, name: 'Upload', icon: 'Upload' },
    { num: 2, name: 'Review', icon: 'File' },
    { num: 3, name: 'Estimate', icon: 'DollarSign' },
    { num: 4, name: 'Check', icon: 'CheckCircle' },
    { num: 5, name: 'Submit', icon: 'Save' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          ← Back to Trips
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                step >= s.num
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {s.num}
              </div>
              <span className={`text-sm font-medium ${
                step >= s.num ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {s.name}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.num ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-6">
          <TdyUploadZone
            tripId={tripId}
            isPremium={isPremium}
            docsCount={docs.length}
            onUploadComplete={() => {
              loadData();
            }}
          />

          {docs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents ({docs.length})</h4>
              <div className="space-y-2">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-3">
                      <Icon name="File" className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.original_filename}</p>
                        <p className="text-gray-600 text-xs">
                          {doc.doc_type} • {doc.parsed_ok ? `${doc.parsed.hints || 0} items` : 'Parse failed'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={items.length === 0}
                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Review Items ({items.length}) →
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <TdyItemsTable items={items} onItemsChange={setItems} />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              ← Upload More
            </button>
            <button
              onClick={computeEstimate}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Computing...' : 'Compute Estimate →'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && totals && (
        <div className="space-y-6">
          <TdyEstimateView totals={totals} />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              ← Edit Items
            </button>
            <button
              onClick={runCheck}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Checking...' : 'Check Compliance →'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <TdyFlagsView flags={flags} />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              ← Review Estimate
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Generate Voucher →
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <TdyVoucherChecklist tripId={tripId} isPremium={isPremium} />

          <button
            onClick={() => setStep(4)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            ← Back to Flags
          </button>
        </div>
      )}
    </div>
  );
}

