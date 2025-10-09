'use client';

import { useMemo, useState } from 'react';
import PremiumGate from '@/app/components/premium/PremiumGate';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

type Scenario = {
  key: 'A' | 'B' | 'C';
  title: string;
  rate: number; // annual
  desc: string;
};

const SCENARIOS: Scenario[] = [
  { key: 'A', title: 'High-Yield Savings (4%)', rate: 0.04, desc: 'Safe, liquid savings for emergencies.' },
  { key: 'B', title: 'Conservative Growth (6%)', rate: 0.06, desc: 'Balanced stock/bond index mix.' },
  { key: 'C', title: 'Moderate Growth (8%)', rate: 0.08, desc: 'Stock-heavy mix for long horizons.' }
];

function fv(pv: number, r: number, years: number) {
  return pv * Math.pow(1 + r, years);
}

export default function SdpStrategist() {
  const [amount, setAmount] = useState<number>(10000);
  const years = 15;
  const { isPremium } = usePremiumStatus();

  const results = useMemo(() => {
    const amt = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    // compute all results, but do not render premium-only numbers when not premium
    return SCENARIOS.map(s => ({ ...s, value: fv(amt, s.rate, years) }));
  }, [amount]);

  const fmt = (v: number) => v.toLocaleString(undefined, { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  });

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SDP Payout Amount
        </label>
        <input
          type="number"
          min={0}
          step={100}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-48 rounded-md border px-3 py-2"
        />
        <p className="mt-2 text-xs text-gray-500">
          Illustrative, education only. Past performance is not predictive.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((r) => (
          <div key={r.key} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="font-semibold mb-1">{r.title}</div>
            {isPremium ? (
              <div className="text-2xl font-bold text-green-600">{fmt(r.value)}</div>
            ) : (
              <div className="text-2xl font-bold">
                <span className="inline-block h-6 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            )}
            <div className="mt-2 text-sm text-gray-600">{r.desc}</div>
          </div>
        ))}
      </div>

      {/* ROI payoff (premium only) */}
      <PremiumGate
        placeholder={
          <div>
            <div className="text-lg font-semibold mb-2">Unlock your ROI</div>
            <p className="text-sm text-gray-600">
              See how much more your payout could grow in 15 years—based on your amount.
            </p>
          </div>
        }
      >
        {/* Rendered only when premium; compute diff here to avoid DOM leakage */}
        <RoiBox results={results} fmt={fmt} amount={amount} />
      </PremiumGate>
    </div>
  );
}

function RoiBox({ 
  results, 
  fmt,
  amount
}: { 
  results: (Scenario & { value: number })[]; 
  fmt: (n: number) => string;
  amount: number;
}) {
  const hy = results.find(r => r.key === 'A')!.value;
  const mod = results.find(r => r.key === 'C')!.value;
  const diff = mod - hy;
  
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="text-xl font-bold">
        Potential 15-year gain vs savings: 
        <span className="text-green-700 ml-2">{fmt(diff)}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Education only. Past performance is not predictive.
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
        className="mt-3 rounded bg-slate-800 text-white px-3 py-2 hover:bg-slate-700 transition-colors"
      >
        Explain these results
      </button>
    </div>
  );
}
