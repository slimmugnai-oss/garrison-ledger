'use client';

import { useState, useEffect, useRef } from 'react';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';
import FootNote from '@/app/components/layout/FootNote';
import Explainer from '@/app/components/ai/Explainer';
import ExportButtons from '@/app/components/calculators/ExportButtons';
import ComparisonMode from '@/app/components/calculators/ComparisonMode';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';

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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    track('tsp_view');
  }, []);

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
      track('tsp_input_change');
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
        
        // Track analytics based on premium status
        if (data.partial && !isPremium) {
          track('tsp_preview_gate_view');
        } else if (isPremium && data.endDefault) {
          track('tsp_roi_view');
        }
        
        // Debounced save for premium users
        if (isPremium && data) {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
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
          saveTimeoutRef.current = timeout;
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
    // Transform data for Recharts
    const chartData = seriesA.map((defaultVal, index) => ({
      year: index,
      'Default Mix': Math.round(defaultVal),
      'Your Custom Mix': Math.round(seriesB[index] || 0),
    }));
    
    return (
      <div className="w-full h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years from Now', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis 
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
              stroke="#6b7280"
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Default Mix" 
              stroke="#94a3b8" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Your Custom Mix" 
              stroke="#0A2463" 
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />
      
      <Section>
        <PageHeader 
          title="TSP Allocation Modeler"
          subtitle="Optimize your Thrift Savings Plan allocation for maximum retirement growth"
          right={<Icon name="TrendingUp" className="h-10 w-10 text-text-headings" />}
        />

        <div className="space-y-8">
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="text-2xl font-bold text-primary mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-body">Current Age</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface" 
                  value={age} 
                  onChange={e => setAge(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-body">Retirement Age</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface" 
                  value={ret} 
                  onChange={e => setRet(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-body">Current Balance</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface" 
                  value={bal} 
                  onChange={e => setBal(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-body">Monthly Contribution</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface" 
                  value={cont} 
                  onChange={e => setCont(Number(e.target.value))} 
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="text-2xl font-bold text-primary mb-6">Custom Allocation Mix</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Range label="C Fund" v={wC} set={setWC} />
              <Range label="S Fund" v={wS} set={setWS} />
              <Range label="I Fund" v={wI} set={setWI} />
              <Range label="F Fund" v={wF} set={setWF} />
              <Range label="G Fund" v={wG} set={setWG} />
            </div>
            <div className="text-sm text-body p-4 bg-surface-hover rounded-lg mt-4">
              <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> <strong>Note:</strong> Weights normalize automatically. This is for educational purposes only. Past performance is not predictive of future results.
            </div>
            
            {/* Calculate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  console.log('TSP Generate button clicked!');
                  setLoading(true);
                  try {
                    console.log('Sending TSP request with:', { age, retire: ret, balance: bal, monthly: cont, mix: { C: wC, S: wS, I: wI, F: wF, G: wG } });
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
                    console.log('TSP response status:', response.status);
                    const data = await response.json();
                    console.log('TSP response data:', data);
                    setApiData(data);
                  } catch (error) {
                    console.error('Error calculating TSP:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-info hover:bg-info text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Calculating...' : '🚀 Generate TSP Analysis'}
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="text-2xl font-bold text-primary mb-6">Growth Projection</h2>
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : apiData ? (
              <Chart seriesA={apiData.seriesDefault} seriesB={apiData.seriesCustom} />
            ) : (
              <div className="flex items-center justify-center h-60 text-muted">
                Enter your information above to see projections
              </div>
            )}
          </div>

          {/* Retirement Projection Results - Available to ALL users (free tier benefit) */}
          <div id="tsp-results" className="bg-card rounded-xl p-8 border border-border calculator-results" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-2xl font-bold text-primary mb-6">Retirement Projection Results</h2>
              {apiData && apiData.endDefault && apiData.endCustom && apiData.diff !== undefined ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 bg-surface-hover rounded-lg border border-subtle">
                      <h3 className="text-lg font-semibold text-primary mb-2">Default Mix (L2050)</h3>
                      <p className="text-3xl font-bold text-primary">{fmt(apiData.endDefault)}</p>
                    </div>
                    <div className="p-6 bg-info-subtle rounded-lg border border-info">
                      <h3 className="text-lg font-semibold text-info mb-2">Custom Mix</h3>
                      <p className="text-3xl font-bold text-blue-900">{fmt(apiData.endCustom)}</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-lg border-2 ${apiData.diff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-3xl font-bold mb-2 ${apiData.diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {apiData.diff >= 0 ? <><Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Potential Gain</> : <><Icon name="TrendingDown" className="h-5 w-5 inline mr-1" /> Potential Loss</>}
                    </div>
                    <div className={`text-4xl font-bold mb-4 ${apiData.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {apiData.diff >= 0 ? '+' : ''}{fmt(apiData.diff)}
                    </div>
                    <div className="text-sm text-body">
                      <strong>Note:</strong> This is for educational purposes only. Past performance is not predictive of future results. 
                      Consider factors like your risk tolerance, time horizon, and other retirement accounts when making allocation decisions.
                    </div>
                  </div>
                  <Explainer payload={{ 
                    tool: "tsp", 
                    inputs: { age, retire: ret, balance: bal, monthly: cont, mix: { C: wC, S: wS, I: wI, F: wF, G: wG } }, 
                    outputs: { endDefault: apiData.endDefault, endCustom: apiData.endCustom, diff: apiData.diff } 
                  }} />
                  
                  {/* Export Options */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <ExportButtons 
                      tool="tsp-modeler"
                      resultsElementId="tsp-results"
                      data={{
                        inputs: { age, retire: ret, balance: bal, monthly: cont, mix: { C: wC, S: wS, I: wI, F: wF, G: wG } },
                        outputs: { endDefault: apiData.endDefault, endCustom: apiData.endCustom, diff: apiData.diff }
                      }}
                    />
                  </div>
                  
                  <FootNote />
                  
                  {/* Comparison Mode */}
                  <ComparisonMode
                    tool="tsp-modeler"
                    currentInput={{ age, retire: ret, balance: bal, monthly: cont, mix: { C: wC, S: wS, I: wI, F: wF, G: wG } }}
                    currentOutput={{ endDefault: apiData.endDefault, endCustom: apiData.endCustom, diff: apiData.diff }}
                    renderComparison={(scenarios) => (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-border">
                              <th className="text-left p-3 text-sm font-bold text-primary">Scenario</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Age</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Monthly Contribution</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Allocation</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Final Balance</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">vs Default</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scenarios.map((scenario, idx) => (
                              <tr key={scenario.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="p-3 font-semibold text-primary">{scenario.name}</td>
                                <td className="p-3 text-right text-body">{scenario.input.age}</td>
                                <td className="p-3 text-right text-body">{fmt(scenario.input.monthly)}</td>
                                <td className="p-3 text-right text-xs text-body">
                                  C{scenario.input.mix?.C || 0}% / S{scenario.input.mix?.S || 0}%
                                </td>
                                <td className="p-3 text-right font-bold text-success">
                                  {fmt(scenario.output.endCustom || 0)}
                                </td>
                                <td className={`p-3 text-right font-bold ${
                                  (scenario.output.diff || 0) >= 0 ? 'text-success' : 'text-danger'
                                }`}>
                                  {(scenario.output.diff || 0) >= 0 ? '+' : ''}{fmt(scenario.output.diff || 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  />
                </>
              ) : (
                <div className="text-center text-muted py-8">
                  Complete the form above to see detailed retirement projections
                </div>
              )}
            </div>
        </div>
      </Section>
    </div>
  );
}

function Range({ label, v, set }: { label: string; v: number; set: (n: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-body">{label}</label>
        <span className="text-lg font-bold text-info">{v}%</span>
      </div>
      <input 
        type="range" 
        min={0} 
        max={100} 
        value={v} 
        onChange={e => set(Number(e.target.value))}
        className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer slider" 
      />
    </div>
  );
}
