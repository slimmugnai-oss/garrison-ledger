'use client';

import { useState, useEffect } from 'react';
import PremiumGate from '@/app/components/premium/PremiumGate';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

const fmt = (v: number) => v.toLocaleString(undefined, { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

type ApiResponse = {
  partial: boolean;
  yearsVisible: number;
  seriesDefault: number[];
  seriesCustom: number[];
  endDefault?: number;
  endCustom?: number;
  diff?: number;
};

export default function TspModeler() {
  const { isPremium } = usePremiumStatus();

  // inputs
  const [age, setAge] = useState(30);
  const [ret, setRet] = useState(50);
  const [bal, setBal] = useState(50000);
  const [cont, setCont] = useState(500);
  const [wC, setWC] = useState(70);
  const [wS, setWS] = useState(30);
  const [wI, setWI] = useState(0);
  const [wF, setWF] = useState(0);
  const [wG, setWG] = useState(0);

  // API response state
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const saveTimeoutRef = useState<NodeJS.Timeout | null>(null)[0];

  // Load saved model on mount (premium only)
  useEffect(() => {
    if (isPremium) {
      fetch('/api/saved-models?tool=tsp')
        .then(res => res.json())
        .then(data => {
          if (data.input) {
            setAge(data.input.age || 30);
            setRet(data.input.retire || 50);
            setBal(data.input.balance || 50000);
            setCont(data.input.monthly || 500);
            if (data.input.mix) {
              setWC(data.input.mix.C || 70);
              setWS(data.input.mix.S || 30);
              setWI(data.input.mix.I || 0);
              setWF(data.input.mix.F || 0);
              setWG(data.input.mix.G || 0);
            }
          }
        })
        .catch(console.error);
    }
  }, [isPremium]);

  // Optional prefill via query
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = (k: string, def: number) => Number(p.get(k) ?? def);
    setAge(n('age', 30));
    setRet(n('retire', 50));
    setBal(n('bal', 50000));
    setCont(n('cont', 500));
    const mix = p.get('mix');
    if (mix) {
      const m: Record<string, number> = {};
      mix.split(',').forEach(kv => {
        const [k, v] = kv.split(':');
        m[k] = Number(v);
      });
      setWC(m.C ?? 70);
      setWS(m.S ?? 30);
      setWI(m.I ?? 0);
      setWF(m.F ?? 0);
      setWG(m.G ?? 0);
    }
  }, []);

  // Calculate on input change
  useEffect(() => {
    const calculate = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tools/tsp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age,
            retire: ret,
            balance: bal,
            monthly: cont,
            mix: { C: wC, S: wS, I: wI, F: wF, G: wG }
          })
        });
        const data = await response.json();
        setApiData(data);
        
        // Debounced save for premium users
        if (isPremium && data) {
          if (saveTimeoutRef) clearTimeout(saveTimeoutRef);
          const timeout = setTimeout(() => {
            fetch('/api/saved-models', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'tsp',
                input: { age, retire: ret, balance: bal, monthly: cont, mix: { C: wC, S: wS, I: wI, F: wF, G: wG } },
                output: { endDefault: data.endDefault, endCustom: data.endCustom, diff: data.diff }
              })
            }).catch(console.error);
          }, 1000);
          Object.assign(saveTimeoutRef as object, timeout);
        }
      } catch (error) {
        console.error('Error calculating TSP:', error);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [age, ret, bal, cont, wC, wS, wI, wF, wG, isPremium, saveTimeoutRef]);

  // Lightweight SVG line plot
  const Chart = ({ seriesA, seriesB }: { seriesA: number[]; seriesB: number[] }) => {
    const w = 560, h = 240, pad = 24;
    const all = [...seriesA, ...seriesB];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const X = (i: number, n: number) => pad + (i / (n - 1)) * (w - 2 * pad);
    const Y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    const toPath = (s: number[]) => s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${X(i, s.length)} ${Y(v)}`).join(' ');
    
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-60 border rounded bg-white">
        <path d={toPath(seriesA)} fill="none" stroke="#94a3b8" strokeWidth="2" />
        <path d={toPath(seriesB)} fill="none" stroke="#0b3d91" strokeWidth="2" />
        <text x={20} y={20} className="text-xs fill-gray-600">Default Mix</text>
        <text x={20} y={40} className="text-xs fill-blue-800">Custom Mix</text>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📈 TSP Allocation Modeler</h1>
          <p className="text-xl text-gray-600">Optimize your Thrift Savings Plan allocation for maximum retirement growth</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Current Age</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium text-gray-900 bg-white" 
                  value={age} 
                  onChange={e => setAge(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Retirement Age</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium text-gray-900 bg-white" 
                  value={ret} 
                  onChange={e => setRet(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Current Balance</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium text-gray-900 bg-white" 
                  value={bal} 
                  onChange={e => setBal(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Monthly Contribution</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium text-gray-900 bg-white" 
                  value={cont} 
                  onChange={e => setCont(Number(e.target.value))} 
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Allocation Mix</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Range label="C Fund" v={wC} set={setWC} />
              <Range label="S Fund" v={wS} set={setWS} />
              <Range label="I Fund" v={wI} set={setWI} />
              <Range label="F Fund" v={wF} set={setWF} />
              <Range label="G Fund" v={wG} set={setWG} />
            </div>
            <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg mt-4">
              💡 <strong>Note:</strong> Weights normalize automatically. This is for educational purposes only. Past performance is not predictive of future results.
            </div>
            
            {/* Calculate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetch('/api/tools/tsp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        age,
                        retire: ret,
                        balance: bal,
                        monthly: cont,
                        mix: { C: wC, S: wS, I: wI, F: wF, G: wG }
                      })
                    });
                    const data = await response.json();
                    setApiData(data);
                  } catch (error) {
                    console.error('Error calculating TSP:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Calculating...' : '🚀 Generate TSP Analysis'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Growth Projection</h2>
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : apiData ? (
              <>
                <Chart seriesA={apiData.seriesDefault} seriesB={apiData.seriesCustom} />
                {apiData.partial && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      📊 Preview shows {apiData.yearsVisible} years. Unlock to view full {Math.max(0, ret - age)}-year projection and ROI analysis.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-60 text-gray-500">
                Enter your information above to see projections
              </div>
            )}
          </div>

          {!isPremium && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock ROI Analysis</h3>
                <p className="text-lg text-gray-600 mb-6">
                  See projected balances and the potential difference at retirement with detailed breakdowns.
                </p>
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-block">
                  Upgrade to Premium
                </div>
              </div>
            </div>
          )}
          {isPremium && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Retirement Projection Results</h2>
              {apiData && apiData.endDefault && apiData.endCustom && apiData.diff !== undefined ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Default Mix (L2050)</h3>
                      <p className="text-3xl font-bold text-gray-900">{fmt(apiData.endDefault)}</p>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Custom Mix</h3>
                      <p className="text-3xl font-bold text-blue-900">{fmt(apiData.endCustom)}</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-lg border-2 ${apiData.diff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-3xl font-bold mb-2 ${apiData.diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {apiData.diff >= 0 ? '💰 Potential Gain' : '📉 Potential Loss'}
                    </div>
                    <div className={`text-4xl font-bold mb-4 ${apiData.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {apiData.diff >= 0 ? '+' : ''}{fmt(apiData.diff)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Note:</strong> This is for educational purposes only. Past performance is not predictive of future results. 
                      Consider factors like your risk tolerance, time horizon, and other retirement accounts when making allocation decisions.
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Complete the form above to see detailed retirement projections
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Range({ label, v, set }: { label: string; v: number; set: (n: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-lg font-bold text-blue-600">{v}%</span>
      </div>
      <input 
        type="range" 
        min={0} 
        max={100} 
        value={v} 
        onChange={e => set(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" 
      />
    </div>
  );
}
