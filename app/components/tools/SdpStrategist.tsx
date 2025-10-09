'use client';

import { useState, useEffect, useCallback } from 'react';
import PremiumGate from '@/app/components/premium/PremiumGate';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

type Scenario = {
  key: 'A' | 'B' | 'C';
  title: string;
  rate: number; // annual
  desc: string;
  value?: number;
};

const SCENARIOS: Scenario[] = [
  { key: 'A', title: 'High-Yield Savings (4%)', rate: 0.04, desc: 'Safe, liquid savings for emergencies.' },
  { key: 'B', title: 'Conservative Growth (6%)', rate: 0.06, desc: 'Balanced stock/bond index mix.' },
  { key: 'C', title: 'Moderate Growth (8%)', rate: 0.08, desc: 'Stock-heavy mix for long horizons.' }
];

type ApiResponse = {
  partial: boolean;
  hy: number;
  cons?: number;
  mod?: number;
};

export default function SdpStrategist() {
  const [amount, setAmount] = useState<number>(10000);
  const { isPremium } = usePremiumStatus();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved model on mount (premium only)
  useEffect(() => {
    if (isPremium) {
      fetch('/api/saved-models?tool=sdp')
        .then(res => res.json())
        .then(data => {
          if (data.input && data.input.amount) {
            setAmount(data.input.amount);
          }
        })
        .catch(console.error);
    }
  }, [isPremium]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((data: ApiResponse) => {
      if (isPremium && data) {
        fetch('/api/saved-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'sdp',
            input: { amount },
            output: { hy: data.hy, cons: data.cons, mod: data.mod }
          })
        }).catch(console.error);
      }
    }, 1000),
    [isPremium, amount]
  );

  // Calculate on amount change
  useEffect(() => {
    const calculate = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tools/sdp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        const data = await response.json();
        setApiData(data);
        debouncedSave(data);
      } catch (error) {
        console.error('Error calculating SDP:', error);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [amount, debouncedSave]);

  // Debounce utility
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  // Create results array with API data
  const results = SCENARIOS.map(s => ({
    ...s,
    value: s.key === 'A' ? apiData?.hy : 
           s.key === 'B' ? apiData?.cons : 
           s.key === 'C' ? apiData?.mod : undefined
  }));

  const fmt = (v: number) => v.toLocaleString(undefined, { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 SDP Strategist</h1>
          <p className="text-xl text-gray-600">Maximize your Savings Deposit Program returns with strategic investment planning</p>
        </div>

        <div className="space-y-8">
          {/* Input */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Amount</h2>
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                SDP Payout Amount
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium"
              />
              <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                💡 <strong>Note:</strong> Enter your expected SDP payout amount. This tool helps you compare different investment strategies over a 15-year period. Past performance is not predictive of future results.
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.map((r) => (
                <div key={r.key} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg font-semibold text-gray-900 mb-3">{r.title}</div>
                  {loading ? (
                    <div className="text-3xl font-bold mb-2">
                      <span className="inline-block h-8 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ) : r.value !== undefined ? (
                    <div className="text-3xl font-bold text-green-600 mb-2">{fmt(r.value)}</div>
                  ) : (
                    <div className="text-3xl font-bold mb-2">
                      <span className="inline-block h-8 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  )}
                  <div className="text-sm text-gray-700 font-medium">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI payoff (premium only) */}
          <PremiumGate
            placeholder={
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock ROI Analysis</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    See how much more your payout could grow in 15 years with detailed breakdowns.
                  </p>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold inline-block">
                    Upgrade to Premium
                  </div>
                </div>
              </div>
            }
          >
            {/* Rendered only when premium; compute diff here to avoid DOM leakage */}
            <RoiBox apiData={apiData} fmt={fmt} amount={amount} />
          </PremiumGate>
        </div>
      </div>
    </div>
  );
}

function RoiBox({ 
  apiData,
  fmt,
  amount
}: { 
  apiData: ApiResponse | null;
  fmt: (n: number) => string;
  amount: number;
}) {
  if (!apiData || apiData.partial || !apiData.mod) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center text-gray-500 py-8">
          Enter an amount above to see ROI analysis
        </div>
      </div>
    );
  }

  const diff = apiData.mod - apiData.hy;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ROI Analysis</h2>
      <div className={`p-6 rounded-lg border-2 ${diff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`text-3xl font-bold mb-2 ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {diff >= 0 ? '💰 Potential Gain' : '📉 Potential Loss'}
        </div>
        <div className={`text-4xl font-bold mb-4 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diff >= 0 ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-sm text-gray-600 mb-6">
          <strong>15-year comparison:</strong> Moderate Growth (8%) vs High-Yield Savings (4%)
        </div>
        <button
          onClick={async () => {
            const hy = results.find(r => r.key === 'A')!.value;
            const mod = results.find(r => r.key === 'C')!.value;
            try {
              const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  tool: 'sdp', 
                  inputs: { amount }, 
                  outputs: { hy, mod } 
                })
              });
              const json = await res.json();
              alert(json.text);
            } catch (error) {
              console.error('Error getting explanation:', error);
              alert('Unable to generate explanation at this time.');
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          📊 Explain This Result
        </button>
      </div>
      <div className="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
        <strong>Note:</strong> This is for educational purposes only. Past performance is not predictive of future results. 
        Consider factors like your risk tolerance, time horizon, and other investment accounts when making decisions.
      </div>
    </div>
  );
}
