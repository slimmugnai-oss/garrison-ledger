'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { track } from '@/lib/track';
import CitySearchInput from '@/app/components/ui/CitySearchInput';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import Section from '@/app/components/ui/Section';
import PaywallWrapper from '@/app/components/ui/PaywallWrapper';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import Explainer from '@/app/components/ai/Explainer';
import ExportButtons from '@/app/components/calculators/ExportButtons';
import ComparisonMode from '@/app/components/calculators/ComparisonMode';
import { getSkillsGap, remoteWorkPremiums } from '@/app/data/mos-translator';

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

  // Enhanced features
  const [isRemote, setIsRemote] = useState(false);
  const [showSkillsGap, setShowSkillsGap] = useState(false);

  // Save state functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view on mount
  useEffect(() => {
    track('career_opportunity_analyzer_view');
  }, []);

  // Auto-populate from profile (UX IMPROVEMENT)
  useEffect(() => {
    fetch('/api/user-profile')
      .then(res => res.json())
      .then(profile => {
        if (profile && profile.current_base) {
          // Try to set current location from profile
          // Extract city and state from current_base (e.g., "Fort Liberty, NC" → "Fayetteville, NC")
          const baseToCity: Record<string, { city: string; state: string }> = {
            'West Point': { city: 'West Point', state: 'NY' },
            'Fort Liberty, NC': { city: 'Fayetteville', state: 'NC' },
            'Fort Bragg, NC': { city: 'Fayetteville', state: 'NC' },
            'Fort Cavazos, TX': { city: 'Killeen', state: 'TX' },
            'Fort Hood, TX': { city: 'Killeen', state: 'TX' },
            // Can expand this mapping as needed
          };
          
          const cityData = baseToCity[profile.current_base];
          if (cityData) {
            setCurrentData(prev => ({
              ...prev,
              city: { 
                city: cityData.city, 
                state: cityData.state, 
                cost_of_living_index: prev.city?.cost_of_living_index || 100 
              }
            }));
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
      fetch('/api/saved-models?tool=career')
        .then(res => res.json())
        .then(data => {
          if (data.input) {
            if (data.input.currentData) {
              setCurrentData(data.input.currentData);
            }
            if (data.input.newData) {
              setNewData(data.input.newData);
            }
          }
        })
    }
  }, [isPremium]);

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

  // Auto-save (debounced, premium only)
  useEffect(() => {
    if (isPremium && (currentData.salary > 0 || newData.salary > 0)) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const timeout = setTimeout(() => {
        fetch('/api/saved-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'career',
            input: {
              currentData,
              newData
            },
            output: analysis
          })
        });
      }, 2000);
      saveTimeoutRef.current = timeout;
    }
  }, [isPremium, currentData, newData, analysis]);

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
      
      <div id="career-results" className="calculator-results">
      
      <div className="bg-card rounded-xl border border-border shadow-sm">

        <div className="p-8">
          {/* Input Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Current Situation */}
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-info rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-info rounded-full"></div>
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
                  <div className="bg-info-subtle border border-blue-300 rounded-lg p-3">
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
                    <input
                      type="number"
                      value={currentData.salary}
                      onChange={(e) => setCurrentData({ ...currentData, salary: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-default rounded-lg focus:border-blue-600 focus:outline-none text-lg"
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
                    <input
                      type="number"
                      value={currentData.bonus}
                      onChange={(e) => setCurrentData({ ...currentData, bonus: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-default rounded-lg focus:border-blue-600 focus:outline-none text-base"
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
                      className="w-full pl-4 pr-10 py-3 border-2 border-default rounded-lg focus:border-blue-600 focus:outline-none text-base"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-medium">%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
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
                      className="w-full pl-4 pr-10 py-3 border-2 border-default rounded-lg focus:border-blue-600 focus:outline-none text-base"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-medium">%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Popular rates: CA ~9%, NY ~7%, TX/FL/WA 0%
                  </p>
                </div>

              </div>
            </div>

            {/* New Offer */}
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-success rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-success rounded-full"></div>
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
                  <div className="bg-success-subtle border border-green-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-success">
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
                    <input
                      type="number"
                      value={newData.salary}
                      onChange={(e) => setNewData({ ...newData, salary: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-default rounded-lg focus:border-green-600 focus:outline-none text-lg"
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
                    <input
                      type="number"
                      value={newData.bonus}
                      onChange={(e) => setNewData({ ...newData, bonus: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-default rounded-lg focus:border-green-600 focus:outline-none text-base"
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
                      className="w-full pl-4 pr-10 py-3 border-2 border-default rounded-lg focus:border-green-600 focus:outline-none text-base"
                      placeholder="5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-medium">%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
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
                      className="w-full pl-4 pr-10 py-3 border-2 border-default rounded-lg focus:border-green-600 focus:outline-none text-base"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-medium">%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Popular rates: CA ~9%, NY ~7%, TX/FL/WA 0%
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Results Section with Single Paywall */}
          {analysis && (
            <PaywallWrapper
              isPremium={isPremium}
              title="Your Complete Analysis is Ready!"
              description="Unlock to see your total compensation breakdowns, net financial difference, and AI-powered insights"
              toolName="Career Opportunity Analyzer"
              sampleData={
                <div className="space-y-8">
                  {/* Sample Current Situation Summary */}
                  <div className="bg-info-subtle border-2 border-blue-300 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-body">Total Compensation:</span>
                        <span className="font-bold text-blue-900">$63,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-body">After Taxes:</span>
                        <span className="font-bold text-blue-900">$60,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample New Offer Summary */}
                  <div className="bg-success-subtle border-2 border-green-300 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-body">Total Compensation:</span>
                        <span className="font-bold text-success">$79,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-body">After Taxes:</span>
                        <span className="font-bold text-success">$67,320</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Executive Summary */}
                  <div className="rounded-xl border-4 p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-400">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-primary mb-4">Executive Summary</h3>
                      <div className="mb-6">
                        <div className="text-sm font-semibold text-body mb-2">NET FINANCIAL DIFFERENCE</div>
                        <div className="text-6xl font-black mb-2 text-success">+$7,320</div>
                        <div className="text-sm text-body">After Taxes & Cost of Living Adjustment</div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="space-y-8">
                {/* Current Situation Summary */}
                <div className="bg-info-subtle border-2 border-blue-300 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-body">Total Compensation:</span>
                      <span className="font-bold text-blue-900">{fmt(analysis.currentTotalComp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-body">After Taxes:</span>
                      <span className="font-bold text-blue-900">{fmt(analysis.currentAfterTax)}</span>
                    </div>
                  </div>
                </div>

                {/* New Offer Summary */}
                <div className="bg-success-subtle border-2 border-green-300 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-body">Total Compensation:</span>
                      <span className="font-bold text-success">{fmt(analysis.newTotalComp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-body">After Taxes:</span>
                      <span className="font-bold text-success">{fmt(analysis.newAfterTax)}</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className={`rounded-xl border-4 p-8 ${
                  analysis.isPositive 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400' 
                    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-400'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-text-headings mb-4">
                      <Icon name="BarChart" className="h-6 w-6 inline mr-2" /> Executive Summary
                    </h3>
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-body mb-2">
                        NET FINANCIAL DIFFERENCE
                      </div>
                      <div className={`text-6xl font-black mb-2 ${
                        analysis.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.isPositive ? '+' : ''}{fmt(analysis.netDifference)}
                      </div>
                      <div className="text-sm text-body">
                        After Taxes & Cost of Living Adjustment
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-card rounded-lg p-6 mb-6 border border-border">
                    <h4 className="font-bold text-text-headings mb-4 text-lg">Financial Breakdown</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-body mb-1">Your Current After-Tax Income</div>
                        <div className="text-2xl font-bold text-info">{fmt(analysis.currentAfterTax)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-body mb-1">New Offer (Adjusted to Your City&apos;s COL)</div>
                        <div className="text-2xl font-bold text-success">{fmt(analysis.adjustedNewOffer)}</div>
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-subtle">
                        <div className="text-sm text-body mb-1">Effective Change in Purchasing Power</div>
                        <div className={`text-3xl font-black ${analysis.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {analysis.isPositive ? '+' : ''}{fmt(analysis.netDifference)} 
                          <span className="text-xl ml-2">
                            ({analysis.isPositive ? '+' : ''}{((analysis.netDifference / analysis.currentAfterTax) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </PaywallWrapper>
          )}

          {/* AI Explainer */}
          {analysis && (
            <Explainer payload={{
              tool: "career-analyzer",
              inputs: {
                currentJob: { salary: currentData.salary, bonus: currentData.bonus, city: currentData.city?.city },
                newOffer: { salary: newData.salary, bonus: newData.bonus, city: newData.city?.city }
              },
              outputs: {
                currentTotal: analysis.currentTotalComp,
                newTotal: analysis.newTotalComp,
                netDifference: analysis.netDifference,
                executiveSummary: analysis.executiveSummary,
                isPositive: analysis.isPositive
              }
            }} />
          )}
          
          {/* Export Options */}
          {analysis && (
            <div className="mt-8 pt-6 border-t border-border">
              <ExportButtons 
                tool="salary-calculator"
                resultsElementId="career-results"
                data={{
                  inputs: { currentData, newData },
                  outputs: analysis
                }}
              />
            </div>
          )}
        </div>
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
      
      {/* Comparison Mode */}
      {analysis && (
        <ComparisonMode
          tool="salary-calculator"
          currentInput={{ currentData, newData }}
          currentOutput={analysis}
          onLoadScenario={(input) => {
            if (input.currentData) setCurrentData(input.currentData);
            if (input.newData) setNewData(input.newData);
          }}
          renderComparison={(scenarios) => (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left p-3 text-sm font-bold text-primary">Scenario</th>
                    <th className="text-right p-3 text-sm font-bold text-primary">Current Salary</th>
                    <th className="text-right p-3 text-sm font-bold text-primary">New Salary</th>
                    <th className="text-right p-3 text-sm font-bold text-primary">Difference</th>
                    <th className="text-right p-3 text-sm font-bold text-primary">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario, idx) => (
                    <tr key={scenario.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 font-semibold text-primary">{scenario.name}</td>
                      <td className="p-3 text-right text-body">
                        {fmt(scenario.input.currentData.salary)}
                      </td>
                      <td className="p-3 text-right text-body">
                        {fmt(scenario.input.newData.salary)}
                      </td>
                      <td className={`p-3 text-right font-bold ${
                        scenario.output.isPositive ? 'text-success' : 'text-danger'
                      }`}>
                        {scenario.output.isPositive ? '+' : ''}{fmt(scenario.output.netDifference || 0)}
                      </td>
                      <td className={`p-3 text-right text-sm ${
                        scenario.output.isPositive ? 'text-success' : 'text-danger'
                      }`}>
                        {scenario.output.isPositive ? '✓ Better' : '⚠ Worse'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      )}

      {/* Remote Work Premium Calculator */}
      {analysis && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4">
            <Icon name="Monitor" className="h-5 w-5 inline mr-2" />
            Remote Work Calculator
          </h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="w-5 h-5 accent-purple-600"
              />
              <span className="text-lg font-semibold text-purple-900">
                This is a remote position
              </span>
            </label>
          </div>

          {isRemote && newData.city && (() => {
            const remotePremium = remoteWorkPremiums.average; // 8% average
            const adjustedNewSalary = Math.round(newData.salary * remotePremium);
            const premiumAmount = adjustedNewSalary - newData.salary;
            const colaAdjusted = adjustedNewSalary * (100 / newData.city.cost_of_living_index);
            
            return (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-300">
                    <p className="text-sm text-purple-700 mb-1">Standard Salary</p>
                    <p className="text-2xl font-bold text-purple-900">{fmt(newData.salary)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-success">
                    <p className="text-sm text-success mb-1">Remote Premium (+{Math.round((remotePremium - 1) * 100)}%)</p>
                    <p className="text-2xl font-bold text-success">{fmt(adjustedNewSalary)}</p>
                  </div>
                </div>

                <div className="bg-success-subtle rounded-lg p-4 border border-success">
                  <p className="text-sm font-semibold text-success mb-2">Remote Work Benefits:</p>
                  <ul className="space-y-1 text-sm text-success">
                    <li>• Extra {fmt(premiumAmount)}/year in compensation</li>
                    <li>• Save ~$5,000/year on commuting costs</li>
                    <li>• Save ~$2,000/year on work clothing & meals</li>
                    <li>• Geographic flexibility (live anywhere!)</li>
                    <li>• Better work-life balance</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-300">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Cost-of-Living Adjusted Remote Salary:</p>
                  <p className="text-3xl font-bold text-success">{fmt(colaAdjusted)}</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Equivalent purchasing power in {newData.city.city}, {newData.city.state} (COLA: {newData.city.cost_of_living_index})
                  </p>
                </div>
              </div>
            );
          })()}

          {!isRemote && (
            <p className="text-sm text-purple-700">
              <Icon name="Info" className="h-3 w-3 inline mr-1" />
              Remote positions typically pay 5-15% more due to nationwide competition for talent
            </p>
          )}
        </div>
      )}

      {/* Skills Gap Analysis */}
      {analysis && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-900">
              <Icon name="Target" className="h-5 w-5 inline mr-2" />
              Skills Gap & Career Roadmap
            </h3>
            <button
              onClick={() => setShowSkillsGap(!showSkillsGap)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              {showSkillsGap ? 'Hide' : 'Show'} Analysis
            </button>
          </div>

          {showSkillsGap && (() => {
            const currentMilitarySalary = currentData.salary; // Current military compensation
            const targetCivilianSalary = newData.salary;
            const gap = getSkillsGap(currentMilitarySalary, targetCivilianSalary);
            const salaryIncrease = targetCivilianSalary - currentMilitarySalary;
            const percentIncrease = (salaryIncrease / currentMilitarySalary) * 100;
            
            return (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <p className="text-sm text-blue-700 mb-1">Current Military Pay</p>
                    <p className="text-2xl font-bold text-blue-900">{fmt(currentMilitarySalary)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <p className="text-sm text-blue-700 mb-1">Target Civilian Salary</p>
                    <p className="text-2xl font-bold text-blue-900">{fmt(targetCivilianSalary)}</p>
                  </div>
                  <div className={`bg-white rounded-lg p-4 border ${
                    salaryIncrease > 0 ? 'border-success' : 'border-warning'
                  }`}>
                    <p className="text-sm text-blue-700 mb-1">Salary Change</p>
                    <p className={`text-2xl font-bold ${salaryIncrease > 0 ? 'text-success' : 'text-warning'}`}>
                      {salaryIncrease > 0 ? '+' : ''}{fmt(salaryIncrease)}
                    </p>
                    <p className="text-xs text-blue-700">({percentIncrease > 0 ? '+' : ''}{percentIncrease.toFixed(1)}%)</p>
                  </div>
                </div>

                <div className={`rounded-lg p-4 border-2 ${
                  gap.level === 'Small Gap' ? 'bg-green-50 border-green-300' :
                  gap.level === 'Moderate Gap' ? 'bg-amber-50 border-amber-300' :
                  'bg-red-50 border-red-300'
                }`}>
                  <h4 className="font-bold text-lg mb-2">
                    Gap Assessment: <span className={
                      gap.level === 'Small Gap' ? 'text-success' :
                      gap.level === 'Moderate Gap' ? 'text-warning' :
                      'text-danger'
                    }>{gap.level}</span>
                  </h4>
                  <p className="text-sm mb-3">
                    <strong>Timeline to Achieve:</strong> {gap.timeline}
                  </p>
                  <p className="text-sm font-semibold mb-2">Recommended Action Steps:</p>
                  <ul className="space-y-1 text-sm">
                    {gap.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs mt-3 font-semibold">
                    Certifications: {gap.certifications}
                  </p>
                </div>

                <div className="bg-info-subtle rounded-lg p-4 border border-info">
                  <p className="text-sm font-semibold text-info mb-2">
                    <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" />
                    Military Transition Resources:
                  </p>
                  <ul className="text-xs text-info space-y-1">
                    <li>• Use GI Bill for certifications or degree programs</li>
                    <li>• SkillBridge: 180-day internship before separation</li>
                    <li>• VA VR&E: Vocational rehab & employment services</li>
                    <li>• Hiring Our Heroes: Career fairs & mentorship</li>
                    <li>• LinkedIn for Veterans: Free Premium access</li>
                  </ul>
                </div>
              </div>
            );
          })()}

          {!showSkillsGap && (
            <p className="text-sm text-blue-700">
              Click "Show Analysis" to see your personalized career transition roadmap
            </p>
          )}
        </div>
      )}
    </Section>
  );
}

