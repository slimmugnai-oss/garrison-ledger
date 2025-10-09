'use client';

import PremiumGate from '@/app/components/premium/PremiumGate';
import { useEffect, useState, useMemo } from 'react';

function pmt(rateMo: number, nper: number, pv: number) {
  return (pv * rateMo) / (1 - Math.pow(1 + rateMo, -nper));
}

const fmt = (v: number) => v.toLocaleString(undefined, { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

export default function HouseHack() {
  const [price, setPrice] = useState(400000);
  const [rate, setRate] = useState(6.5);
  const [tax, setTax] = useState(4800);
  const [ins, setIns] = useState(1600);
  const [bah, setBah] = useState(2400);
  const [rent, setRent] = useState(2200);

  // prefill via query
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = (k: string, d: number) => Number(p.get(k) ?? d);
    setPrice(n('price', 400000));
    setRate(n('rate', 6.5));
    setTax(n('tax', 4800));
    setIns(n('ins', 1600));
    setBah(n('bah', 2400));
    setRent(n('rent', 2200));
  }, []);

  const costs = useMemo(() => {
    const rMo = (rate / 100) / 12;
    const piti = pmt(rMo, 360, price) + tax / 12 + ins / 12;
    return piti;
  }, [price, rate, tax, ins]);

  const income = bah + rent;
  const verdict = income - costs; // do not render if not premium

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 House Hacking Calculator</h1>
          <p className="text-xl text-gray-600">Analyze multi-unit property investments with BAH and rental income</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Num label="Property Price" v={price} set={setPrice} />
              <Num label="Interest Rate (%)" v={rate} set={setRate} step={0.1} />
              <Num label="Annual Taxes" v={tax} set={setTax} />
              <Num label="Annual Insurance" v={ins} set={setIns} />
              <Num label="Monthly BAH" v={bah} set={setBah} />
              <Num label="Monthly Rent" v={rent} set={setRent} />
            </div>
            <div className="text-sm text-gray-500 mt-4 p-4 bg-gray-50 rounded-lg">
              💡 <strong>Note:</strong> Assumes 30-year VA loan. This is for educational purposes only. Consult with financial and real estate professionals for actual investment decisions.
            </div>
          </div>

          <PremiumGate
            placeholder={
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Monthly Breakdown</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    See detailed monthly costs and income breakdown with PITI calculations.
                  </p>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold inline-block">
                    Upgrade to Premium
                  </div>
                </div>
              </div>
            }
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Monthly Costs (PITI)</h3>
                  <p className="text-3xl font-bold text-red-600">{fmt(costs)}</p>
                  <p className="text-sm text-red-600 mt-1">Principal, Interest, Taxes, Insurance</p>
                </div>
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Monthly Income</h3>
                  <p className="text-3xl font-bold text-green-600">{fmt(income)}</p>
                  <p className="text-sm text-green-600 mt-1">BAH + Tenant Rent</p>
                </div>
              </div>
            </div>
          </PremiumGate>

          <PremiumGate
            placeholder={
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Cash Flow Analysis</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    See if this scenario is likely cash-flow positive with detailed breakdowns.
                  </p>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold inline-block">
                    Upgrade to Premium
                  </div>
                </div>
              </div>
            }
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cash Flow Analysis</h2>
              <div className={`p-6 rounded-lg border-2 ${verdict >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-3xl font-bold mb-2 ${verdict >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {verdict >= 0 ? '💰 Positive Cash Flow' : '📉 Negative Cash Flow'}
                </div>
                <div className={`text-4xl font-bold mb-4 ${verdict >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {fmt(verdict)}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Note:</strong> This is before vacancy rates, maintenance costs, and property management fees. 
                  Consult with financial and real estate professionals for actual investment decisions.
                </div>
              </div>
            </div>
          </PremiumGate>
        </div>
      </div>
    </div>
  );
}

function Num({ 
  label, 
  v, 
  set, 
  step = 100 
}: { 
  label: string; 
  v: number; 
  set: (n: number) => void; 
  step?: number 
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input 
        type="number" 
        value={v} 
        onChange={e => set(Number(e.target.value))}
        step={step} 
        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium" 
      />
    </div>
  );
}
