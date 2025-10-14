'use client';

import { useState, useEffect, useRef } from 'react';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';
import Icon from '@/app/components/ui/Icon';
import FootNote from '@/app/components/layout/FootNote';
import Explainer from '@/app/components/ai/Explainer';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';
import PaywallWrapper from '@/app/components/ui/PaywallWrapper';

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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    track('sdp_view');
  }, []);

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

  // Calculate on amount change
  useEffect(() => {
    const calculate = async () => {
      setLoading(true);
      track('sdp_input_change');
      try {
        const response = await fetch('/api/tools/sdp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        const data = await response.json();
        setApiData(data);
        
        // Track analytics based on premium status
        if (data.partial && !isPremium) {
          track('sdp_preview_gate_view');
        } else if (isPremium && data.mod) {
          track('sdp_roi_view');
        }
        
        // Debounced save for premium users
        if (isPremium && data) {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          const timeout = setTimeout(() => {
            fetch('/api/saved-models', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'sdp',
                input: { amount },
                output: { hy: data.hy, cons: data.cons, mod: data.mod }
              })
            }).catch(console.error);
          }, 1000);
          saveTimeoutRef.current = timeout;
        }
      } catch (error) {
        console.error('Error calculating SDP:', error);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [amount, isPremium, saveTimeoutRef]);

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
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
      
      <Section>
        <PageHeader 
          title="SDP Strategist"
          subtitle="Maximize your Savings Deposit Program returns with strategic investment planning"
          right={<Icon name="DollarSign" className="h-10 w-10 text-text-headings" />}
        />

        <div className="space-y-8">
          {/* Input */}
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium text-gray-900 bg-white"
              />
              <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> <strong>Note:</strong> Enter your expected SDP payout amount. This tool helps you compare different investment strategies over a 15-year period. Past performance is not predictive of future results.
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="text-center">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  console.log('SDP Generate button clicked!');
                  setLoading(true);
                  try {
                    console.log('Sending SDP request with:', { amount });
                    const response = await fetch('/api/tools/sdp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount })
                    });
                    console.log('SDP response status:', response.status);
                    const data = await response.json();
                    console.log('SDP response data:', data);
                    setApiData(data);
                  } catch (error) {
                    console.error('Error calculating SDP:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Calculating...' : '🚀 Generate SDP Analysis'}
              </button>
            </div>
          </div>

          {/* Results Section - Single Comprehensive Paywall */}
          <PaywallWrapper
            isPremium={isPremium}
            title="Your SDP Analysis is Ready!"
            description="Unlock to see your complete 15-year deployment savings analysis with detailed ROI breakdowns"
            toolName="SDP Strategist"
            sampleData={
              <div className="space-y-8">
                {/* Investment Scenarios */}
                <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Scenarios</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900 mb-3">High-Yield Savings (4%)</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">$18,000</div>
                      <div className="text-sm text-gray-700 font-medium">Safe, liquid savings for emergencies.</div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900 mb-3">Conservative Growth (6%)</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">$24,000</div>
                      <div className="text-sm text-gray-700 font-medium">Balanced stock/bond index mix.</div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900 mb-3">Moderate Growth (8%)</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">$32,000</div>
                      <div className="text-sm text-gray-700 font-medium">Stock-heavy mix for long horizons.</div>
                    </div>
                  </div>
                </div>

                {/* ROI Analysis */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">15-Year ROI Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Conservative Strategy</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">$24,000</div>
                      <p className="text-sm text-blue-800">6% annual return</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Growth Strategy</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">$32,000</div>
                      <p className="text-sm text-green-800">8% annual return</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> These are estimates based on historical averages. Actual returns may vary.
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            {/* Investment Scenarios */}
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
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

            {/* ROI Analysis */}
            <RoiBox apiData={apiData} fmt={fmt} amount={amount} />
          </PaywallWrapper>
        </div>
      </Section>
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
          {diff >= 0 ? <><Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Potential Gain</> : <><Icon name="TrendingDown" className="h-5 w-5 inline mr-1" /> Potential Loss</>}
        </div>
        <div className={`text-4xl font-bold mb-4 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diff >= 0 ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          <strong>15-year comparison:</strong> Moderate Growth (8%) vs High-Yield Savings (4%)
        </div>
      </div>
      <Explainer payload={{ 
        tool: "sdp", 
        inputs: { amount }, 
        outputs: { hy: apiData.hy, cons: apiData.cons, mod: apiData.mod } 
      }} />
      <div className="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
        <strong>Note:</strong> This is for educational purposes only. Past performance is not predictive of future results. 
        Consider factors like your risk tolerance, time horizon, and other investment accounts when making decisions.
      </div>
      <FootNote />
    </div>
  );
}
