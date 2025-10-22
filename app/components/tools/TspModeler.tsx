'use client';

import { useState, useEffect, useRef } from 'react';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';
import FootNote from '@/app/components/layout/FootNote';
import Explainer from '@/app/components/ai/Explainer';
import ExportButtons from '@/app/components/calculators/ExportButtons';
import ComparisonMode from '@/app/components/calculators/ComparisonMode';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';
import { tspHistoricalReturns, tspAverageReturns, getContributionRecommendation, getMatchingLifecycleFund } from '@/app/data/tsp-historical-returns';

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

// Helper: Convert TSP balance range to numeric midpoint
function getTSPBalanceMidpoint(range: string): number | null {
  const map: Record<string, number> = {
    '0-25k': 12500,
    '25k-50k': 37500,
    '50k-100k': 75000,
    '100k-200k': 150000,
    '200k+': 250000,
    'prefer-not-to-say': 50000
  };
  return map[range] || null;
}

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

  // Load scenario callback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadScenario = (input: Record<string, any>) => {
    setAge(input.age || 30);
    setRet(input.retire || 50);
    setBal(input.balance || 50000);
    setCont(input.monthly || 500);
    setWC(input.mix?.C || 70);
    setWS(input.mix?.S || 30);
    setWI(input.mix?.I || 0);
    setWF(input.mix?.F || 0);
    setWG(input.mix?.G || 0);
  };

  // Track page view on mount
  useEffect(() => {
    track('tsp_view');
  }, []);

  // Auto-populate from profile (CRITICAL UX IMPROVEMENT)
  useEffect(() => {
    fetch('/api/user-profile')
      .then(res => res.json())
      .then(profile => {
        if (profile) {
          // Auto-fill age
          if (profile.age) setAge(profile.age);
          
          // Auto-fill retirement age target
          if (profile.retirement_age_target) setRet(profile.retirement_age_target);
          
          // Auto-fill TSP balance from range (use midpoint)
          if (profile.tsp_balance_range) {
            const midpoint = getTSPBalanceMidpoint(profile.tsp_balance_range);
            if (midpoint) setBal(midpoint);
          }
        }
      })
      .catch(() => {
        // Profile fetch failed - user will enter manually
      });
  }, []);

  // Load saved model on mount (premium only) - takes precedence over profile
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
            });
          }, 1000);
          saveTimeoutRef.current = timeout;
        }
            } catch {
      // Non-critical: Error handled via UI state
              // Error already handled silently - saving is non-blocking
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
              tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}K`}
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
                  } catch {
      // Non-critical: Error handled via UI state
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

          {/* AI-Powered Contribution Recommendation */}
          {(() => {
            const currentYear = new Date().getFullYear();
            const retirementYear = currentYear + (ret - age);
            const recommendation = getContributionRecommendation(age, bal);
            const lifecycleFund = getMatchingLifecycleFund(retirementYear);
            
            return (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Icon name="Sparkles" className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">
                      Personalized Recommendation
                    </h3>
                    <p className="text-indigo-800 mb-4">
                      {recommendation.rationale}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-indigo-300">
                        <p className="text-sm text-indigo-700 mb-1">Recommended Allocation</p>
                        <p className="text-lg font-bold text-indigo-900">{recommendation.allocation}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-indigo-300">
                        <p className="text-sm text-indigo-700 mb-1">Matching Lifecycle Fund</p>
                        <p className="text-lg font-bold text-indigo-900">
                          {lifecycleFund.name}
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                          C{lifecycleFund.allocation.C}% / S{lifecycleFund.allocation.S}% / I{lifecycleFund.allocation.I}% / F{lifecycleFund.allocation.F}% / G{lifecycleFund.allocation.G}%
                        </p>
                      </div>
                    </div>
                    {recommendation.catchUp && (
                      <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <Icon name="CheckCircle" className="h-4 w-4 inline mr-1" />
                          <strong>Catch-Up Eligible:</strong> You can contribute an extra $7,500/year (age 50+)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Historical Performance Chart */}
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="text-2xl font-bold text-primary mb-4">TSP Historical Performance (Last 10 Years)</h2>
            <p className="text-sm text-body mb-6">
              Past performance data to inform your allocation decisions. Each fund has unique risk/return characteristics.
            </p>
            
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tspHistoricalReturns.cFund}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value: number) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="return" fill="#2563eb" name="C Fund (S&P 500)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800 mb-1">C Fund</p>
                <p className="text-2xl font-bold text-blue-900">{tspAverageReturns.cFund}%</p>
                <p className="text-xs text-blue-700">10-yr avg</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm text-indigo-800 mb-1">S Fund</p>
                <p className="text-2xl font-bold text-indigo-900">{tspAverageReturns.sFund}%</p>
                <p className="text-xs text-indigo-700">10-yr avg</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-800 mb-1">I Fund</p>
                <p className="text-2xl font-bold text-purple-900">{tspAverageReturns.iFund}%</p>
                <p className="text-xs text-purple-700">10-yr avg</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-800 mb-1">F Fund</p>
                <p className="text-2xl font-bold text-green-900">{tspAverageReturns.fFund}%</p>
                <p className="text-xs text-green-700">10-yr avg</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-800 mb-1">G Fund</p>
                <p className="text-2xl font-bold text-gray-900">{tspAverageReturns.gFund}%</p>
                <p className="text-xs text-gray-700">10-yr avg</p>
              </div>
            </div>

            <p className="text-xs text-muted mt-4">
              <Icon name="Info" className="h-3 w-3 inline mr-1" />
              Historical data shows actual fund performance. Past performance does not guarantee future results.
            </p>
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
                    onLoadScenario={loadScenario}
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
