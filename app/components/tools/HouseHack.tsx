'use client';

import { useEffect, useState, useRef } from 'react';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';
import Icon from '@/app/components/ui/Icon';
import FootNote from '@/app/components/layout/FootNote';
import Explainer from '@/app/components/ai/Explainer';
import ExportButtons from '@/app/components/calculators/ExportButtons';
import ComparisonMode from '@/app/components/calculators/ComparisonMode';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';
import PaywallWrapper from '@/app/components/ui/PaywallWrapper';

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

type PropertyType = 'sfr' | 'duplex' | 'triplex' | 'fourplex';

export default function HouseHack() {
  const [price, setPrice] = useState(400000);
  const [rate, setRate] = useState(6.5);
  const [tax, setTax] = useState(4800);
  const [ins, setIns] = useState(1600);
  const [bah, setBah] = useState(2400);
  const [rent, setRent] = useState(2200);
  const [propertyType, setPropertyType] = useState<PropertyType>('duplex');
  const [numUnits, setNumUnits] = useState(2);
  const [appreciation, setAppreciation] = useState(3);
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
            });
          }, 1000);
          saveTimeoutRef.current = timeout;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error saving analysis:', err);
        }
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
            <h2 className="text-2xl font-bold text-primary mb-6">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Num label="Property Price" v={price} set={setPrice} />
              <Num label="Interest Rate (%)" v={rate} set={setRate} step={0.1} />
              <Num label="Annual Taxes" v={tax} set={setTax} />
              <Num label="Annual Insurance" v={ins} set={setIns} />
              <Num label="Monthly BAH" v={bah} set={setBah} />
              <Num label="Monthly Rent" v={rent} set={setRent} />
            </div>
            {/* Property Type Selector */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-purple-900 mb-3">
                <Icon name="Home" className="h-4 w-4 inline mr-1" />
                Property Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'sfr' as PropertyType, label: 'Single Family', units: 1, desc: 'Rent out rooms' },
                  { type: 'duplex' as PropertyType, label: 'Duplex', units: 2, desc: 'Live in 1, rent 1' },
                  { type: 'triplex' as PropertyType, label: 'Triplex', units: 3, desc: 'Live in 1, rent 2' },
                  { type: 'fourplex' as PropertyType, label: 'Fourplex', units: 4, desc: 'Live in 1, rent 3' }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => {
                      setPropertyType(option.type);
                      setNumUnits(option.units);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      propertyType === option.type
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-purple-200 bg-white hover:border-purple-400'
                    }`}
                  >
                    <p className="font-bold text-purple-900 text-sm">{option.label}</p>
                    <p className="text-xs text-purple-700">{option.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-purple-700 mt-2">
                <Icon name="Info" className="h-3 w-3 inline mr-1" />
                VA loans work for 1-4 unit properties when you live in one unit
              </p>
            </div>

            <div className="text-sm text-muted mt-4 p-4 bg-surface-hover rounded-lg">
              <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> <strong>Note:</strong> Assumes 30-year VA loan with 0% down. This is for educational purposes only. Consult with financial and real estate professionals for actual investment decisions.
            </div>
            
            {/* Generate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  try {
                    const response = await fetch('/api/tools/house', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ price, rate, tax, ins, bah, rent })
                    });
                    const data = await response.json();
                    setApiData(data);
                  } catch {
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

          {/* Tax Benefits Calculator */}
          {apiData && apiData.costs > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">
                <Icon name="Calculator" className="h-5 w-5 inline mr-2" />
                Tax Benefits & Deductions
              </h3>
              
              {(() => {
                // Calculate tax benefits
                const monthlyMortgage = price * (rate / 100 / 12) * Math.pow(1 + (rate / 100 / 12), 360) / (Math.pow(1 + (rate / 100 / 12), 360) - 1);
                const _annualMortgage = monthlyMortgage * 12;
                const yearOneInterest = price * (rate / 100); // Simplified first-year interest
                const depreciation = (price * 0.85) / 27.5; // Land ~15%, structure 85%, 27.5 year depreciation
                const _annualRentalIncome = rent * 12;
                
                return (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-green-300">
                        <p className="text-sm text-green-700 mb-1">Mortgage Interest (Year 1)</p>
                        <p className="text-2xl font-bold text-green-900">{fmt(yearOneInterest)}</p>
                        <p className="text-xs text-green-700">Tax deductible</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-300">
                        <p className="text-sm text-green-700 mb-1">Annual Depreciation</p>
                        <p className="text-2xl font-bold text-green-900">{fmt(depreciation)}</p>
                        <p className="text-xs text-green-700">27.5 years</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-success">
                      <p className="text-sm text-success mb-2">Total Annual Tax Deductions:</p>
                      <p className="text-3xl font-bold text-success">
                        {fmt(yearOneInterest + depreciation + tax + ins)}
                      </p>
                      <p className="text-xs text-success mt-1">
                        Interest + Depreciation + Property Tax + Insurance
                      </p>
                    </div>

                    <p className="text-xs text-green-700">
                      <Icon name="Info" className="h-3 w-3 inline mr-1" />
                      These deductions significantly reduce your taxable rental income. Consult a tax professional.
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Long-Term Projection */}
          {apiData && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">
                <Icon name="TrendingUp" className="h-5 w-5 inline mr-2" />
                Long-Term Wealth Projection
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-indigo-900 mb-2">
                  Expected Annual Appreciation (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={appreciation}
                  onChange={(e) => setAppreciation(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg"
                />
                <p className="text-xs text-indigo-700 mt-1">Historical average: 3-4% annually</p>
              </div>
              
              {(() => {
                const years = [5, 10, 20];
                const cashFlow = (apiData.income - apiData.costs) * 12;
                const results = years.map(y => {
                  const futureValue = price * Math.pow(1 + appreciation / 100, y);
                  const totalCashFlow = cashFlow * y;
                  const principalPaidDown = price * 0.02 * y; // Simplified 2% per year
                  const equity = futureValue - (price - principalPaidDown);
                  const totalWealth = equity + totalCashFlow;
                  
                  return { years: y, value: futureValue, equity, cashFlow: totalCashFlow, total: totalWealth };
                });
                
                return (
                  <div className="grid md:grid-cols-3 gap-4">
                    {results.map(r => (
                      <div key={r.years} className="bg-white rounded-lg p-5 border border-indigo-300">
                        <p className="text-sm font-semibold text-indigo-700 mb-3">After {r.years} Years</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-indigo-600">Property Value</p>
                            <p className="text-lg font-bold text-indigo-900">{fmt(r.value)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-600">Total Cash Flow</p>
                            <p className="text-md font-bold text-success">{fmt(r.cashFlow)}</p>
                          </div>
                          <div className="border-t border-indigo-200 pt-2">
                            <p className="text-xs text-indigo-600">Total Wealth Built</p>
                            <p className="text-xl font-bold text-success">{fmt(r.total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              
              <p className="text-xs text-indigo-700 mt-4">
                <Icon name="Info" className="h-3 w-3 inline mr-1" />
                Projection assumes consistent rent, {appreciation}% appreciation, and mortgage paydown via rent payments
              </p>
            </div>
          )}

          {/* Results Section - Single Comprehensive Paywall */}
          <PaywallWrapper
            isPremium={isPremium}
            title="Your House Hacking Analysis is Ready!"
            description="Unlock to see your complete property investment analysis with PITI breakdowns and cash flow projections"
            toolName="House Hacking"
            sampleData={
              <div className="space-y-8">
                {/* Monthly Summary */}
                <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  <h2 className="text-2xl font-bold text-primary mb-6">Monthly Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-danger-subtle rounded-lg border border-danger">
                      <h3 className="text-lg font-semibold text-danger mb-2">Monthly Costs (PITI)</h3>
                      <p className="text-3xl font-bold text-danger">$2,847</p>
                      <p className="text-sm text-danger mt-1">Principal, Interest, Taxes, Insurance</p>
                    </div>
                    <div className="p-6 bg-success-subtle rounded-lg border border-success">
                      <h3 className="text-lg font-semibold text-success mb-2">Monthly Income</h3>
                      <p className="text-3xl font-bold text-success">$4,600</p>
                      <p className="text-sm text-success mt-1">BAH + Tenant Rent</p>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Analysis */}
                <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  <h2 className="text-2xl font-bold text-primary mb-6">Cash Flow Analysis</h2>
                  <div className="p-6 rounded-lg border-2 bg-success-subtle border-success">
                    <div className="text-3xl font-bold mb-2 text-success">
                      <Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Positive Cash Flow
                    </div>
                    <div className="text-4xl font-bold mb-4 text-success">
                      $1,753
                    </div>
                    <div className="text-sm text-body">
                      <strong>Note:</strong> This is before vacancy rates, maintenance costs, and property management fees. 
                      Consult with financial and real estate professionals for actual investment decisions.
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            {/* Monthly Summary */}
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-2xl font-bold text-primary mb-6">Monthly Summary</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : apiData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-danger-subtle rounded-lg border border-danger">
                    <h3 className="text-lg font-semibold text-danger mb-2">Monthly Costs (PITI)</h3>
                    <p className="text-3xl font-bold text-danger">{fmt(apiData.costs)}</p>
                    <p className="text-sm text-danger mt-1">Principal, Interest, Taxes, Insurance</p>
                  </div>
                  <div className="p-6 bg-success-subtle rounded-lg border border-success">
                    <h3 className="text-lg font-semibold text-success mb-2">Monthly Income</h3>
                    <p className="text-3xl font-bold text-success">{fmt(apiData.income)}</p>
                    <p className="text-sm text-success mt-1">BAH + Tenant Rent</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-8">
                  Enter property details above to see monthly summary
                </div>
              )}
            </div>

            {/* Cash Flow Analysis */}
            <div className="bg-card rounded-xl p-8 border border-border" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-2xl font-bold text-primary mb-6">Cash Flow Analysis</h2>
              {apiData && apiData.verdict !== undefined ? (
                <div className={`p-6 rounded-lg border-2 ${apiData.verdict >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-3xl font-bold mb-2 ${apiData.verdict >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {apiData.verdict >= 0 ? <><Icon name="DollarSign" className="h-5 w-5 inline mr-1" /> Positive Cash Flow</> : <><Icon name="TrendingDown" className="h-5 w-5 inline mr-1" /> Negative Cash Flow</>}
                  </div>
                  <div className={`text-4xl font-bold mb-4 ${apiData.verdict >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(apiData.verdict)}
                  </div>
                  <div className="text-sm text-body">
                    <strong>Note:</strong> This is before vacancy rates, maintenance costs, and property management fees. 
                    Consult with financial and real estate professionals for actual investment decisions.
                  </div>
                  <Explainer payload={{ 
                    tool: "house", 
                    inputs: { price, rate, tax, ins, bah, rent }, 
                    outputs: { costs: apiData.costs, income: apiData.income, verdict: apiData.verdict } 
                  }} />
                  
                  {/* Export Options */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <ExportButtons 
                      tool="house-hacking"
                      resultsElementId="house-hacking-results"
                      data={{
                        inputs: { price, rate, tax, ins, bah, rent },
                        outputs: apiData
                      }}
                    />
                  </div>
                  
                  <FootNote />
                  
                  {/* Comparison Mode */}
                  <ComparisonMode
                    tool="house-hacking"
                    currentInput={{ price, rate, tax, ins, bah, rent }}
                    currentOutput={apiData}
                    onLoadScenario={(input) => {
                      setPrice(input.price || 400000);
                      setRate(input.rate || 6.5);
                      setTax(input.tax || 4800);
                      setIns(input.ins || 1600);
                      setBah(input.bah || 2400);
                      setRent(input.rent || 2200);
                    }}
                    renderComparison={(scenarios) => (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-border">
                              <th className="text-left p-3 text-sm font-bold text-primary">Scenario</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Price</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Rent</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Cash Flow</th>
                              <th className="text-right p-3 text-sm font-bold text-primary">Verdict</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scenarios.map((scenario, idx) => (
                              <tr key={scenario.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="p-3 font-semibold text-primary">{scenario.name}</td>
                                <td className="p-3 text-right text-body">{fmt(scenario.input.price)}</td>
                                <td className="p-3 text-right text-body">{fmt(scenario.input.rent)}</td>
                                <td className={`p-3 text-right font-bold ${
                                  (scenario.output.income - scenario.output.costs) >= 0 ? 'text-success' : 'text-danger'
                                }`}>
                                  {fmt(scenario.output.income - scenario.output.costs)}
                                </td>
                                <td className="p-3 text-right text-sm text-body">{scenario.output.verdict}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-8">
                  Complete the form above to see cash flow analysis
                </div>
              )}
            </div>
          </PaywallWrapper>
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
      <label className="block text-sm font-semibold text-body">
        {label}
      </label>
      <input 
        type="number" 
        value={v} 
        onChange={e => set(Number(e.target.value))}
        step={step} 
        className="block w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-lg font-medium text-primary bg-surface" 
      />
    </div>
  );
}
