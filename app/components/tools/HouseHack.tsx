'use client';

import { useEffect, useState, useRef } from 'react';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';
import Icon from '@/app/components/ui/Icon';
import FootNote from '@/app/components/layout/FootNote';
import Explainer from '@/app/components/ai/Explainer';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';

const fmt = (v: number) => v.toLocaleString(undefined, { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

type ApiResponse = {
  partial: boolean;
  costs: number;
  income: number;
  verdict?: number;
};

export default function HouseHack() {
  const [price, setPrice] = useState(400000);
  const [rate, setRate] = useState(6.5);
  const [tax, setTax] = useState(4800);
  const [ins, setIns] = useState(1600);
  const [bah, setBah] = useState(2400);
  const [rent, setRent] = useState(2200);
  const { isPremium } = usePremiumStatus();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    track('house_view');
  }, []);

  // Load saved model on mount (premium only)
  useEffect(() => {
    if (isPremium) {
      fetch('/api/saved-models?tool=house')
        .then(res => res.json())
        .then(data => {
          if (data.input) {
            setPrice(data.input.price || 400000);
            setRate(data.input.rate || 6.5);
            setTax(data.input.tax || 4800);
            setIns(data.input.ins || 1600);
            setBah(data.input.bah || 2400);
            setRent(data.input.rent || 2200);
          }
        })
        .catch(console.error);
    }
  }, [isPremium]);

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

  // Calculate on input change
  useEffect(() => {
    const calculate = async () => {
      setLoading(true);
      track('house_input_change');
      try {
        const response = await fetch('/api/tools/house', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price, rate, tax, ins, bah, rent })
        });
        const data = await response.json();
        setApiData(data);
        
        // Track analytics based on premium status
        if (data.partial && !isPremium) {
          track('house_preview_gate_view');
        } else if (isPremium && data.verdict !== undefined) {
          track('house_verdict_view');
        }
        
        // Debounced save for premium users
        if (isPremium && data) {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          const timeout = setTimeout(() => {
            fetch('/api/saved-models', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'house',
                input: { price, rate, tax, ins, bah, rent },
                output: { costs: data.costs, income: data.income, verdict: data.verdict }
              })
            }).catch(console.error);
          }, 1000);
          saveTimeoutRef.current = timeout;
        }
      } catch (error) {
        console.error('Error calculating house hack:', error);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [price, rate, tax, ins, bah, rent, isPremium, saveTimeoutRef]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
      
      <Section>
        <PageHeader 
          title="House Hacking Calculator"
          subtitle="Analyze multi-unit property investments with BAH and rental income"
          right={<Icon name="House" className="h-10 w-10 text-text-headings" />}
        />

        <div className="space-y-8">
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
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
              <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> <strong>Note:</strong> Assumes 30-year VA loan. This is for educational purposes only. Consult with financial and real estate professionals for actual investment decisions.
            </div>
            
            {/* Generate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  console.log('House Hacking Generate button clicked!');
                  setLoading(true);
                  try {
                    console.log('Sending House Hacking request with:', { price, rate, tax, ins, bah, rent });
                    const response = await fetch('/api/tools/house', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ price, rate, tax, ins, bah, rent })
                    });
                    console.log('House Hacking response status:', response.status);
                    const data = await response.json();
                    console.log('House Hacking response data:', data);
                    setApiData(data);
                  } catch (error) {
                    console.error('Error calculating House Hacking:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Calculating...' : '🚀 Generate House Analysis'}
              </button>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Monthly Breakdown</h3>
                <p className="text-lg text-gray-600 mb-6">
                  See detailed monthly costs and income breakdown with PITI calculations.
                </p>
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-block">
                  Upgrade to Premium
                </div>
              </div>
            </div>
          )}
          {isPremium && (
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Summary</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : apiData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Monthly Costs (PITI)</h3>
                    <p className="text-3xl font-bold text-red-600">{fmt(apiData.costs)}</p>
                    <p className="text-sm text-red-600 mt-1">Principal, Interest, Taxes, Insurance</p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Monthly Income</h3>
                    <p className="text-3xl font-bold text-green-600">{fmt(apiData.income)}</p>
                    <p className="text-sm text-green-600 mt-1">BAH + Tenant Rent</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Enter property details above to see monthly summary
                </div>
              )}
            </div>
          )}

          {!isPremium && (
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Cash Flow Analysis</h3>
                <p className="text-lg text-gray-600 mb-6">
                  See if this scenario is likely cash-flow positive with detailed breakdowns.
                </p>
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-block">
                  Upgrade to Premium
                </div>
              </div>
            </div>
          )}
          {isPremium && (
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cash Flow Analysis</h2>
              {apiData && apiData.verdict !== undefined ? (
                <div className={`p-6 rounded-lg border-2 ${apiData.verdict >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-3xl font-bold mb-2 ${apiData.verdict >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {apiData.verdict >= 0 ? <><Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Positive Cash Flow</> : <><Icon name="TrendingDown" className="h-5 w-5 inline mr-1" /> Negative Cash Flow</>}
                  </div>
                  <div className={`text-4xl font-bold mb-4 ${apiData.verdict >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(apiData.verdict)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Note:</strong> This is before vacancy rates, maintenance costs, and property management fees. 
                    Consult with financial and real estate professionals for actual investment decisions.
                  </div>
                  <Explainer payload={{ 
                    tool: "house", 
                    inputs: { price, rate, tax, ins, bah, rent }, 
                    outputs: { costs: apiData.costs, income: apiData.income, verdict: apiData.verdict } 
                  }} />
                  <FootNote />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Complete the form above to see cash flow analysis
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
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
        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium text-gray-900 bg-white" 
      />
    </div>
  );
}
