'use client';

import { useState, useEffect, useMemo } from 'react';
import { track } from '@/lib/track';
import CitySearchInput from '@/app/components/ui/CitySearchInput';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

interface City {
  city: string;
  state: string;
  cost_of_living_index: number;
}

interface CompensationData {
  salary: number;
  bonus: number;
  retirementMatchPercent: number;
  stateTaxPercent: number;
  city: City | null;
}

export default function CareerOpportunityAnalyzer() {
  const { isPremium } = usePremiumStatus();
  
  const [currentData, setCurrentData] = useState<CompensationData>({
    salary: 60000,
    bonus: 0,
    retirementMatchPercent: 5,
    stateTaxPercent: 5,
    city: { city: 'National Average', state: 'US', cost_of_living_index: 100.0 }
  });

  const [newData, setNewData] = useState<CompensationData>({
    salary: 70000,
    bonus: 5000,
    retirementMatchPercent: 6,
    stateTaxPercent: 0,
    city: { city: 'San Antonio', state: 'TX', cost_of_living_index: 86.9 }
  });

  // Track page view on mount
  useEffect(() => {
    track('career_opportunity_analyzer_view');
  }, []);

  // Format currency
  const fmt = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate total compensation for a scenario
  const calculateTotalCompensation = (data: CompensationData): number => {
    const retirementMatch = data.salary * (data.retirementMatchPercent / 100);
    return data.salary + data.bonus + retirementMatch;
  };

  // Calculate after-tax income
  const calculateAfterTaxIncome = (totalComp: number, stateTaxPercent: number): number => {
    // Simplified calculation: deduct state tax and estimated federal tax (~15% effective)
    const federalTaxRate = 0.15;
    const stateTaxRate = stateTaxPercent / 100;
    return totalComp * (1 - federalTaxRate - stateTaxRate);
  };

  // Real-time analysis calculation
  const analysis = useMemo(() => {
    if (!currentData.city || !newData.city) {
      return null;
    }

    // Total compensation
    const currentTotalComp = calculateTotalCompensation(currentData);
    const newTotalComp = calculateTotalCompensation(newData);

    // After-tax income
    const currentAfterTax = calculateAfterTaxIncome(currentTotalComp, currentData.stateTaxPercent);
    const newAfterTax = calculateAfterTaxIncome(newTotalComp, newData.stateTaxPercent);

    // Cost of living adjustment
    const currentCOL = currentData.city.cost_of_living_index;
    const newCOL = newData.city.cost_of_living_index;
    
    // Adjust new offer to current city's cost of living for comparison
    const adjustedNewOffer = newAfterTax * (currentCOL / newCOL);
    
    // Net financial difference
    const netDifference = adjustedNewOffer - currentAfterTax;

    // Generate executive summary
    let executiveSummary = '';
    const percentDifference = ((netDifference / currentAfterTax) * 100).toFixed(1);
    
    if (netDifference > 5000) {
      executiveSummary = `Excellent opportunity! After accounting for cost of living differences and tax implications, this new offer would give you approximately ${fmt(netDifference)} more in effective annual purchasing power (${percentDifference}% increase). `;
      
      if (newCOL < currentCOL) {
        executiveSummary += `The lower cost of living in ${newData.city.city}, ${newData.city.state} significantly boosts the real value of this offer.`;
      }
      
      if (newData.stateTaxPercent < currentData.stateTaxPercent) {
        const taxSavings = currentAfterTax * ((currentData.stateTaxPercent - newData.stateTaxPercent) / 100);
        executiveSummary += ` You'll also save approximately ${fmt(taxSavings)} annually in state income taxes.`;
      }
    } else if (netDifference > 1000) {
      executiveSummary = `Solid opportunity. This offer provides approximately ${fmt(netDifference)} more in effective annual income (${percentDifference}% increase) after adjusting for cost of living and taxes. The financial improvement is modest but meaningful.`;
    } else if (netDifference > -1000) {
      executiveSummary = `This offer is financially comparable to your current situation. After adjusting for cost of living and tax differences, the effective annual income is within ${fmt(Math.abs(netDifference))} of your current compensation. The decision should be based on non-financial factors like career growth, quality of life, and personal goals.`;
    } else if (netDifference > -5000) {
      executiveSummary = `Exercise caution. This offer would result in approximately ${fmt(Math.abs(netDifference))} less in effective annual purchasing power (${Math.abs(parseFloat(percentDifference))}% decrease). `;
      
      if (newCOL > currentCOL) {
        executiveSummary += `The higher cost of living in ${newData.city.city}, ${newData.city.state} significantly impacts the real value of this offer.`;
      }
      
      executiveSummary += ` If you're considering this move, ensure the intangible benefits (career advancement, better work-life balance, etc.) justify the financial trade-off.`;
    } else {
      executiveSummary = `Strong caution advised. This offer would result in a significant reduction of approximately ${fmt(Math.abs(netDifference))} in effective annual purchasing power (${Math.abs(parseFloat(percentDifference))}% decrease). `;
      
      if (newCOL > currentCOL) {
        const colImpact = ((newCOL - currentCOL) / currentCOL * 100).toFixed(0);
        executiveSummary += `The ${colImpact}% higher cost of living in ${newData.city.city}, ${newData.city.state} dramatically erodes the nominal salary increase.`;
      }
      
      executiveSummary += ` Unless there are compelling strategic career reasons, this move would significantly harm your financial position.`;
    }

    return {
      currentTotalComp,
      newTotalComp,
      currentAfterTax,
      newAfterTax,
      adjustedNewOffer,
      netDifference,
      executiveSummary,
      isPositive: netDifference > 0
    };
  }, [currentData, newData]);

  // Format percentage (currently unused but available for future use)
  // const fmtPercent = (value: number) => {
  //   return `${value.toFixed(1)}%`;
  // };

  return (
    <Section>
      <PageHeader 
        title="Career Opportunity Analyzer"
        subtitle="Compare total compensation, state taxes, and cost of living to understand your real earning power"
      />
      
      <div className="bg-card rounded-xl border border-border shadow-sm">

        <div className="p-8">
          {/* Input Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Current Situation */}
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-text-headings">Current Situation</h3>
              </div>
              
              <div className="space-y-4">
                {/* Current City */}
                <CitySearchInput
                  value={currentData.city ? `${currentData.city.city}, ${currentData.city.state}` : ''}
                  onSelect={(city) => setCurrentData({ ...currentData, city })}
                  label="Current City"
                  placeholder="Start typing a city name..."
                  accentColor="blue"
                />
                
                {currentData.city && (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-900">
                      Cost of Living Index: {currentData.city.cost_of_living_index}
                      {currentData.city.cost_of_living_index > 100 && 
                        ` (${(currentData.city.cost_of_living_index - 100).toFixed(0)}% above national average)`}
                      {currentData.city.cost_of_living_index < 100 && 
                        ` (${(100 - currentData.city.cost_of_living_index).toFixed(0)}% below national average)`}
                      {currentData.city.cost_of_living_index === 100 && 
                        ` (national average)`}
                    </p>
                  </div>
                )}

                {/* Current Salary */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Base Annual Salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      value={currentData.salary}
                      onChange={(e) => setCurrentData({ ...currentData, salary: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                      placeholder="60000"
                    />
                  </div>
                </div>

                {/* Current Bonus */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Annual Bonus (if applicable)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      value={currentData.bonus}
                      onChange={(e) => setCurrentData({ ...currentData, bonus: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-base"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Current Retirement Match */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Retirement Match (e.g., 401k match %)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={currentData.retirementMatchPercent}
                      onChange={(e) => setCurrentData({ ...currentData, retirementMatchPercent: Number(e.target.value) })}
                      step="0.5"
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-base"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Value: {fmt(currentData.salary * (currentData.retirementMatchPercent / 100))}
                  </p>
                </div>

                {/* Current State Tax */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Estimated State Income Tax (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={currentData.stateTaxPercent}
                      onChange={(e) => setCurrentData({ ...currentData, stateTaxPercent: Number(e.target.value) })}
                      step="0.5"
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-base"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Popular rates: CA ~9%, NY ~7%, TX/FL/WA 0%
                  </p>
                </div>

                {/* Total Compensation Summary */}
                {analysis && (
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Total Compensation:</span>
                        <span className="font-bold text-blue-900">{fmt(analysis.currentTotalComp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">After Taxes:</span>
                        <span className="font-bold text-blue-900">{fmt(analysis.currentAfterTax)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* New Offer */}
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-text-headings">New Offer</h3>
              </div>
              
              <div className="space-y-4">
                {/* New City */}
                <CitySearchInput
                  value={newData.city ? `${newData.city.city}, ${newData.city.state}` : ''}
                  onSelect={(city) => setNewData({ ...newData, city })}
                  label="New City"
                  placeholder="Start typing a city name..."
                  accentColor="green"
                />
                
                {newData.city && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-900">
                      Cost of Living Index: {newData.city.cost_of_living_index}
                      {newData.city.cost_of_living_index > 100 && 
                        ` (${(newData.city.cost_of_living_index - 100).toFixed(0)}% above national average)`}
                      {newData.city.cost_of_living_index < 100 && 
                        ` (${(100 - newData.city.cost_of_living_index).toFixed(0)}% below national average)`}
                      {newData.city.cost_of_living_index === 100 && 
                        ` (national average)`}
                    </p>
                  </div>
                )}

                {/* New Salary */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Base Annual Salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      value={newData.salary}
                      onChange={(e) => setNewData({ ...newData, salary: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-lg"
                      placeholder="70000"
                    />
                  </div>
                </div>

                {/* New Bonus */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Annual Bonus (if applicable)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      value={newData.bonus}
                      onChange={(e) => setNewData({ ...newData, bonus: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* New Retirement Match */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Retirement Match (e.g., 401k match %)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newData.retirementMatchPercent}
                      onChange={(e) => setNewData({ ...newData, retirementMatchPercent: Number(e.target.value) })}
                      step="0.5"
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Value: {fmt(newData.salary * (newData.retirementMatchPercent / 100))}
                  </p>
                </div>

                {/* New State Tax */}
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">
                    Estimated State Income Tax (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newData.stateTaxPercent}
                      onChange={(e) => setNewData({ ...newData, stateTaxPercent: Number(e.target.value) })}
                      step="0.5"
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-base"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Popular rates: CA ~9%, NY ~7%, TX/FL/WA 0%
                  </p>
                </div>

                {/* Total Compensation Summary */}
                {analysis && (
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Total Compensation:</span>
                        <span className="font-bold text-green-900">{fmt(analysis.newTotalComp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">After Taxes:</span>
                        <span className="font-bold text-green-900">{fmt(analysis.newAfterTax)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verdict Card */}
          {analysis && (
            <div>
              {isPremium ? (
                <div className={`rounded-xl border-4 p-8 ${
                  analysis.isPositive 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400' 
                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-400'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-text-headings mb-4">
                      <Icon name="BarChart" className="h-6 w-6 inline mr-2" /> Executive Summary
                    </h3>
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-600 mb-2">
                        NET FINANCIAL DIFFERENCE
                      </div>
                      <div className={`text-6xl font-black mb-2 ${
                        analysis.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.isPositive ? '+' : ''}{fmt(analysis.netDifference)}
                      </div>
                      <div className="text-sm text-gray-600">
                        After Taxes & Cost of Living Adjustment
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-card rounded-lg p-6 mb-6 border border-border">
                    <h4 className="font-bold text-text-headings mb-4 text-lg">Financial Breakdown</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Your Current After-Tax Income</div>
                        <div className="text-2xl font-bold text-blue-600">{fmt(analysis.currentAfterTax)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">New Offer (Adjusted to Your City&apos;s COL)</div>
                        <div className="text-2xl font-bold text-green-600">{fmt(analysis.adjustedNewOffer)}</div>
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Effective Change in Purchasing Power</div>
                        <div className={`text-3xl font-black ${analysis.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {analysis.isPositive ? '+' : ''}{fmt(analysis.netDifference)} 
                          <span className="text-xl ml-2">
                            ({analysis.isPositive ? '+' : ''}{((analysis.netDifference / analysis.currentAfterTax) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI-Generated Executive Summary */}
                  <div className={`rounded-lg p-6 ${
                    analysis.isPositive 
                      ? 'bg-green-100 border-2 border-green-300' 
                      : 'bg-red-100 border-2 border-red-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Icon name="Lightbulb" className="h-8 w-8 text-gray-700" />
                      <div>
                        <h4 className={`font-bold mb-2 text-lg ${
                          analysis.isPositive ? 'text-green-900' : 'text-red-900'
                        }`}>
                          The Bottom Line
                        </h4>
                        <p className={`leading-relaxed ${
                          analysis.isPositive ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {analysis.executiveSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Net Financial Difference */}
                      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-blue-100">Net Financial Difference</span>
                          <span className={`text-3xl font-black ${(analysis?.netDifference || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {(analysis?.netDifference || 0) >= 0 ? '+' : ''}${Math.abs(analysis?.netDifference || 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-blue-100">After taxes & cost of living</p>
                      </div>

                      {/* AI Narrative */}
                      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="text-sm font-semibold text-blue-100 mb-3">AI Analysis</div>
                        <p className="text-sm text-blue-100 leading-relaxed">
                          {analysis?.executiveSummary || 'Complete your analysis to see personalized insights'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-2xl">
                    <div className="bg-white rounded-2xl p-10 shadow-2xl border-2 border-indigo-400 text-center max-w-lg">
                      <Icon name="Lock" className="h-16 w-16 text-gray-700 mb-4 mx-auto" />
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        Your Results Are Ready!
                      </h3>
                      <p className="text-lg text-gray-700 mb-2">
                        Unlock to see your complete financial analysis with total compensation comparison
                      </p>
                      <p className="text-3xl font-black text-gray-900 mb-6">
                        $9.99<span className="text-lg font-normal text-gray-600">/month</span>
                      </p>
                      <a href="/dashboard/upgrade" className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mb-4">
                        Unlock Now →
                      </a>
                      <p className="text-xs text-gray-500">
                        Less than a coffee per week · Upgrade anytime
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
          <Icon name="Lightbulb" className="h-5 w-5 inline mr-2" /> Understanding Your Real Earning Power
        </h3>
        <div className="space-y-3 text-sm text-amber-900">
          <p>
            <strong>Cost of Living Index:</strong> Measures how expensive it is to live in a city compared to the national average (100). 
            A city at 120 is 20% more expensive, while 80 is 20% less expensive.
          </p>
          <p>
            <strong>Total Compensation:</strong> Your base salary is just the beginning. Bonuses and retirement matching 
            can add thousands to your effective annual income.
          </p>
          <p>
            <strong>State Tax Impact:</strong> State income taxes vary dramatically—from 0% in Texas, Florida, and Washington 
            to over 9% in California. This difference alone can represent thousands of dollars annually.
          </p>
          <p className="text-xs text-amber-800 pt-2 border-t border-amber-200">
            <strong>Disclaimer:</strong> This analyzer uses simplified tax calculations and general cost of living data. 
            Your actual financial outcome may vary based on personal circumstances, deductions, local taxes, housing costs, 
            and lifestyle choices. Always consult with a financial advisor for personalized guidance on major career decisions.
          </p>
        </div>
      </div>
    </Section>
  );
}

