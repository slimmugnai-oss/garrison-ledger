'use client';

import { useState, useEffect, useRef } from 'react';

import Explainer from '@/app/components/ai/Explainer';
import ComparisonMode from '@/app/components/calculators/ComparisonMode';
import ExportButtons from '@/app/components/calculators/ExportButtons';
import FootNote from '@/app/components/layout/FootNote';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import PaywallWrapper from '@/app/components/ui/PaywallWrapper';
import Section from '@/app/components/ui/Section';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';

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
  const [deploymentMonths, setDeploymentMonths] = useState<number>(9);
  const [basePay, setBasePay] = useState<number>(4000);
  const [stateTax, setStateTax] = useState<number>(5);
  const { isPremium } = usePremiumStatus();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [_showEnhancements, _setShowEnhancements] = useState(true);

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
          {/* Enhanced Input Section */}
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="text-2xl font-bold text-primary mb-6">Deployment & SDP Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sdp_payout_amount" className="block text-sm font-semibold text-body mb-2">SDP Payout Amount</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="block w-full px-4 py-3 border-2 border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface"
                />
                <p className="text-xs text-muted mt-1">Max: $10,000 per deployment</p>
              </div>

              <div>
                <label htmlFor="deployment_duration_months" className="block text-sm font-semibold text-body mb-2">Deployment Duration (months)</label>
                <input
                  type="number"
                  min={3}
                  max={24}
                  value={deploymentMonths}
                  onChange={(e) => setDeploymentMonths(Number(e.target.value))}
                  className="block w-full px-4 py-3 border-2 border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface"
                />
                <p className="text-xs text-muted mt-1">Typical: 6-12 months</p>
              </div>

              <div>
                <label htmlFor="monthly_base_pay" className="block text-sm font-semibold text-body mb-2">Monthly Base Pay</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={basePay}
                  onChange={(e) => setBasePay(Number(e.target.value))}
                  className="block w-full px-4 py-3 border-2 border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface"
                />
                <p className="text-xs text-muted mt-1">For tax savings calculation</p>
              </div>

              <div>
                <label htmlFor="state_tax_rate_" className="block text-sm font-semibold text-body mb-2">State Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.5}
                  value={stateTax}
                  onChange={(e) => setStateTax(Number(e.target.value))}
                  className="block w-full px-4 py-3 border-2 border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface"
                />
                <p className="text-xs text-muted mt-1">Combat zone = 0% tax</p>
              </div>
            </div>

            <div className="mt-6 bg-info-subtle border border-info rounded-lg p-4">
              <p className="text-sm text-info">
                <Icon name="Info" className="h-4 w-4 inline mr-1" />
                <strong>SDP Basics:</strong> Earn guaranteed 10% annual return while deployed. Interest accrues for up to 90 days after return. Maximum $10,000 per deployment.
              </p>
            </div>
          </div>

          {/* Deployment Timeline Visualizer */}
          {deploymentMonths > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">
                <Icon name="Calendar" className="h-5 w-5 inline mr-2" />
                Deployment Timeline
              </h3>
              
              <div className="relative">
                {/* Timeline visualization */}
                <div className="flex items-center justify-between mb-8">
                  <div className="text-center flex-1">
                    <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      1
                    </div>
                    <p className="text-sm font-semibold text-green-900">Deployment Start</p>
                    <p className="text-xs text-green-700">Deposit SDP funds</p>
                  </div>
                  
                  <div className="flex-1 h-1 bg-green-300 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-50 px-3 py-1 rounded-full border border-green-300">
                      <p className="text-xs font-semibold text-green-800">{deploymentMonths} months</p>
                    </div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      2
                    </div>
                    <p className="text-sm font-semibold text-green-900">Return Home</p>
                    <p className="text-xs text-green-700">+90 days interest</p>
                  </div>
                  
                  <div className="flex-1 h-1 bg-green-300"></div>
                  
                  <div className="text-center flex-1">
                    <div className="bg-success text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                      3
                    </div>
                    <p className="text-sm font-semibold text-green-900">Payout</p>
                    <p className="text-xs text-green-700">~120 days after</p>
                  </div>
                </div>

                {/* Calculate actual dates and amounts */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <p className="text-sm text-green-700 mb-1">Total Accrual Period</p>
                    <p className="text-2xl font-bold text-green-900">{deploymentMonths + 3} months</p>
                    <p className="text-xs text-green-700">Deployment + 90 days</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <p className="text-sm text-green-700 mb-1">Interest Earned</p>
                    <p className="text-2xl font-bold text-green-900">
                      {fmt(amount * 0.10 * ((deploymentMonths + 3) / 12))}
                    </p>
                    <p className="text-xs text-green-700">At 10% APR</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-success">
                    <p className="text-sm text-success mb-1">Total Payout</p>
                    <p className="text-2xl font-bold text-success">
                      {fmt(amount + (amount * 0.10 * ((deploymentMonths + 3) / 12)))}
                    </p>
                    <p className="text-xs text-success">Principal + Interest</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Combat Zone Tax Savings Calculator */}
          {basePay > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-amber-900 mb-4">
                <Icon name="Calculator" className="h-5 w-5 inline mr-2" />
                Combat Zone Tax Savings
              </h3>
              
              {(() => {
                const monthlyIncome = basePay;
                const deploymentIncome = monthlyIncome * deploymentMonths;
                const federalTaxRate = 0.22; // Typical military tax bracket
                const stateTaxRate = stateTax / 100;
                const totalTaxRate = federalTaxRate + stateTaxRate;
                const taxSavings = deploymentIncome * totalTaxRate;
                
                return (
                  <div className="space-y-4">
                    <p className="text-amber-800">
                      While deployed to a combat zone, your income is <strong>completely tax-free</strong>. Here's what that means for you:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <p className="text-sm text-amber-700 mb-1">Total Deployment Income</p>
                        <p className="text-2xl font-bold text-amber-900">{fmt(deploymentIncome)}</p>
                        <p className="text-xs text-amber-700">{deploymentMonths} months × {fmt(monthlyIncome)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-success">
                        <p className="text-sm text-success mb-1">Tax Savings</p>
                        <p className="text-2xl font-bold text-success">{fmt(taxSavings)}</p>
                        <p className="text-xs text-success">Federal + State taxes avoided</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-amber-300">
                      <p className="text-sm text-amber-700 mb-2">Tax Breakdown:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-amber-800">Federal Tax (22%):</span>
                          <span className="font-bold">{fmt(deploymentIncome * 0.22)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-800">State Tax ({stateTax}%):</span>
                          <span className="font-bold">{fmt(deploymentIncome * stateTaxRate)}</span>
                        </div>
                        <div className="flex justify-between border-t border-amber-200 pt-1">
                          <span className="text-amber-900 font-semibold">Total Saved:</span>
                          <span className="font-bold text-success">{fmt(taxSavings)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-amber-700">
                      <Icon name="Info" className="h-3 w-3 inline mr-1" />
                      Combat zone tax exclusion applies to all income earned while deployed in designated hostile fire/imminent danger zones
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Generate Button */}
          <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="text-center">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  try {
                    const response = await fetch('/api/tools/sdp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount })
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
                className="bg-success hover:bg-success text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h2 className="text-2xl font-bold text-primary mb-6">Investment Scenarios</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-surface-hover rounded-lg border border-subtle">
                      <div className="text-lg font-semibold text-primary mb-3">High-Yield Savings (4%)</div>
                      <div className="text-3xl font-bold text-success mb-2">$18,000</div>
                      <div className="text-sm text-body font-medium">Safe, liquid savings for emergencies.</div>
                    </div>
                    <div className="p-6 bg-surface-hover rounded-lg border border-subtle">
                      <div className="text-lg font-semibold text-primary mb-3">Conservative Growth (6%)</div>
                      <div className="text-3xl font-bold text-success mb-2">$24,000</div>
                      <div className="text-sm text-body font-medium">Balanced stock/bond index mix.</div>
                    </div>
                    <div className="p-6 bg-surface-hover rounded-lg border border-subtle">
                      <div className="text-lg font-semibold text-primary mb-3">Moderate Growth (8%)</div>
                      <div className="text-3xl font-bold text-success mb-2">$32,000</div>
                      <div className="text-sm text-body font-medium">Stock-heavy mix for long horizons.</div>
                    </div>
                  </div>
                </div>

                {/* ROI Analysis */}
                <div className="bg-surface rounded-xl shadow-lg p-8 border border-subtle">
                  <h3 className="text-2xl font-bold text-primary mb-6">15-Year ROI Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-info-subtle p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Conservative Strategy</h4>
                      <div className="text-3xl font-bold text-info mb-2">$24,000</div>
                      <p className="text-sm text-info">6% annual return</p>
                    </div>
                    <div className="bg-success-subtle p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-success mb-3">Growth Strategy</h4>
                      <div className="text-3xl font-bold text-success mb-2">$32,000</div>
                      <p className="text-sm text-success">8% annual return</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-warning-subtle border border-warning rounded-lg p-4">
                    <p className="text-sm text-warning">
                      <strong>Note:</strong> These are estimates based on historical averages. Actual returns may vary.
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            {/* Investment Scenarios */}
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-2xl font-bold text-primary mb-6">Investment Scenarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.map((r) => (
                  <div key={r.key} className="p-6 bg-surface-hover rounded-lg border border-subtle">
                    <div className="text-lg font-semibold text-primary mb-3">{r.title}</div>
                    {loading ? (
                      <div className="text-3xl font-bold mb-2">
                        <span className="inline-block h-8 w-32 bg-surface-hover rounded animate-pulse" />
                      </div>
                    ) : r.value !== undefined ? (
                      <div className="text-3xl font-bold text-success mb-2">{fmt(r.value)}</div>
                    ) : (
                      <div className="text-3xl font-bold mb-2">
                        <span className="inline-block h-8 w-32 bg-surface-hover rounded animate-pulse" />
                      </div>
                    )}
                    <div className="text-sm text-body font-medium">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI Analysis */}
            <RoiBox apiData={apiData} fmt={fmt} amount={amount} />
          </PaywallWrapper>

          {/* Comparison Mode - Moved out of RoiBox for state access */}
          {apiData && (
            <ComparisonMode
              tool="sdp-strategist"
              currentInput={{ amount }}
              currentOutput={{ hy: apiData.hy, cons: apiData.cons, mod: apiData.mod }}
              onLoadScenario={(input) => {
                setAmount(input.amount || 10000);
              }}
              renderComparison={(scenarios) => (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 text-sm font-bold text-primary">Scenario</th>
                        <th className="text-right p-3 text-sm font-bold text-primary">Amount</th>
                        <th className="text-right p-3 text-sm font-bold text-primary">Conservative</th>
                        <th className="text-right p-3 text-sm font-bold text-primary">Moderate</th>
                        <th className="text-right p-3 text-sm font-bold text-primary">High-Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios.map((scenario, idx) => (
                        <tr key={scenario.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 font-semibold text-primary">{scenario.name}</td>
                          <td className="p-3 text-right text-body">{fmt(scenario.input.amount)}</td>
                          <td className="p-3 text-right font-bold text-info">
                            {fmt(scenario.output.cons || 0)}
                          </td>
                          <td className="p-3 text-right font-bold text-success">
                            {fmt(scenario.output.mod || 0)}
                          </td>
                          <td className="p-3 text-right font-bold text-warning">
                            {fmt(scenario.output.hy || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            />
          )}
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
      <div className="bg-surface rounded-xl shadow-lg p-8 border border-subtle">
        <div className="text-center text-muted py-8">
          Enter an amount above to see ROI analysis
        </div>
      </div>
    );
  }

  const diff = apiData.mod - apiData.hy;
  
  return (
    <div className="bg-surface rounded-xl shadow-lg p-8 border border-subtle">
      <h2 className="text-2xl font-bold text-primary mb-6">ROI Analysis</h2>
      <div className={`p-6 rounded-lg border-2 ${diff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`text-3xl font-bold mb-2 ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {diff >= 0 ? <><Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Potential Gain</> : <><Icon name="TrendingDown" className="h-5 w-5 inline mr-1" /> Potential Loss</>}
        </div>
        <div className={`text-4xl font-bold mb-4 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diff >= 0 ? '+' : ''}{fmt(diff)}
        </div>
        <div className="text-sm text-body mb-4">
          <strong>15-year comparison:</strong> Moderate Growth (8%) vs High-Yield Savings (4%)
        </div>
      </div>
      <Explainer payload={{ 
        tool: "sdp", 
        inputs: { amount }, 
        outputs: { hy: apiData.hy, cons: apiData.cons, mod: apiData.mod } 
      }} />
      
      {/* Export Options */}
      <div className="mt-8 pt-6 border-t border-border">
        <ExportButtons 
          tool="sdp-strategist"
          resultsElementId="sdp-results"
          data={{
            inputs: { amount },
            outputs: apiData
          }}
        />
      </div>
      
      <div className="text-sm text-body mt-4 p-4 bg-surface-hover rounded-lg">
        <strong>Note:</strong> This is for educational purposes only. Past performance is not predictive of future results. 
        Consider factors like your risk tolerance, time horizon, and other investment accounts when making decisions.
      </div>
      <FootNote />
    </div>
  );
}

