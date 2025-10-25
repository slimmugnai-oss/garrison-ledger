'use client';

import { useState, useEffect } from 'react';

import Explainer from '@/app/components/ai/Explainer';
import Icon from '@/app/components/ui/Icon';
import { track } from '@/lib/track';

const CITY_DATA = [
  { value: "100.0", label: "National Average" },
  { value: "79.1", label: "Columbus, GA" },
  { value: "79.9", label: "Omaha, NE" },
  { value: "82.1", label: "Fayetteville, NC" },
  { value: "82.4", label: "Jacksonville, NC" },
  { value: "83.3", label: "Killeen, TX" },
  { value: "84.9", label: "Norfolk, VA" },
  { value: "86.5", label: "Clarksville, TN" },
  { value: "86.9", label: "San Antonio, TX" },
  { value: "87.7", label: "Tampa, FL" },
  { value: "89.8", label: "Houston, TX" },
  { value: "91.7", label: "Atlanta, GA" },
  { value: "94.1", label: "Dallas, TX" },
  { value: "95.7", label: "Miami, FL" },
  { value: "96.8", label: "Colorado Springs, CO" },
  { value: "101.2", label: "Denver, CO" },
  { value: "101.5", label: "Seattle, WA" },
  { value: "104.9", label: "Chicago, IL" },
  { value: "107.5", label: "Shipage, AK" },
  { value: "115.7", label: "Washington, DC" },
  { value: "117.8", label: "Boston, MA" },
  { value: "122.1", label: "San Diego, CA" },
  { value: "142.4", label: "Honolulu, HI" },
  { value: "148.7", label: "Los Angeles, CA" },
  { value: "166.4", label: "New York, NY (Manhattan)" },
];

export default function SalaryRelocationCalculator() {
  const [currentSalary, setCurrentSalary] = useState(60000);
  const [currentCity, setCurrentCity] = useState("100.0");
  const [newSalary, setNewSalary] = useState(65000);
  const [newCity, setNewCity] = useState("100.0");
  const [useCustom, setUseCustom] = useState(false);
  const [customCurrentCOL, setCustomCurrentCOL] = useState(100);
  const [customNewCOL, setCustomNewCOL] = useState(100);
  const [showResult, setShowResult] = useState(false);

  // Track page view on mount
  useEffect(() => {
    track('salary_relocation_view');
  }, []);

  const calculateComparison = () => {
    if (currentSalary === 0 || newSalary === 0) {
      return null;
    }

    let currentCOL = parseFloat(currentCity);
    let newCOL = parseFloat(newCity);

    // Use custom COL indices if enabled
    if (useCustom && customCurrentCOL > 0 && customNewCOL > 0) {
      currentCOL = customCurrentCOL;
      newCOL = customNewCOL;
    }

    const equivalentSalary = currentSalary * (newCOL / currentCOL);
    const difference = newSalary - equivalentSalary;
    
    const newCityLabel = CITY_DATA.find(c => c.value === newCity)?.label || "the new location";

    return {
      equivalentSalary,
      difference,
      newCityLabel
    };
  };

  const result = calculateComparison();

  const fmt = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-surface rounded-xl border border-subtle p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-primary mb-3">Salary & Relocation Calculator</h2>
        <p className="text-body mb-8">
          Compare your current salary to a new job offer, adjusted for cost of living differences. 
          Is that civilian job really worth the move?
        </p>

        {/* Input Grid */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-subtle rounded-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-end">
            {/* Current Situation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-info rounded-full"></div>
                <h3 className="text-lg font-semibold text-primary">Current Situation</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-body mb-2">
                  Current Annual Salary
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
                  <input
                    type="number"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-default rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                    placeholder="60000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-body mb-2">
                  Current City
                </label>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-default rounded-lg focus:border-blue-600 focus:outline-none text-base"
                >
                  {CITY_DATA.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted mt-1">
                  Cost of living index: {currentCity}
                </p>
              </div>
            </div>

            {/* New Offer */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <h3 className="text-lg font-semibold text-primary">New Offer</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-body mb-2">
                  New Salary Offer
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-default rounded-lg focus:border-green-600 focus:outline-none text-lg"
                    placeholder="65000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-body mb-2">
                  New City
                </label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-default rounded-lg focus:border-green-600 focus:outline-none text-base"
                >
                  {CITY_DATA.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted mt-1">
                  Cost of living index: {newCity}
                </p>
              </div>
            </div>
          </div>

          {/* Custom COL Option */}
          <div className="mt-6 pt-6 border-t border-subtle">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="h-4 w-4 rounded border-default text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-medium text-body">
                Use custom cost-of-living indices
              </span>
            </label>
            
            {useCustom && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-body mb-1">
                    Current City COL Index
                  </label>
                  <input
                    type="number"
                    value={customCurrentCOL}
                    onChange={(e) => setCustomCurrentCOL(Number(e.target.value))}
                    step="0.1"
                    className="w-full px-3 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                    placeholder="100.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1">
                    New City COL Index
                  </label>
                  <input
                    type="number"
                    value={customNewCOL}
                    onChange={(e) => setCustomNewCOL(Number(e.target.value))}
                    step="0.1"
                    className="w-full px-3 py-2 border border-default rounded-lg focus:border-indigo-600 focus:outline-none"
                    placeholder="100.0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowResult(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-[2px]"
            >
              Calculate Comparison
            </button>
          </div>
        </div>

        {/* Results */}
        {showResult && result && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-8">
            <h4 className="text-2xl font-bold text-primary mb-4">Here&apos;s the breakdown:</h4>
            
            <p className="text-body mb-6 text-lg">
              To maintain your current lifestyle in <strong>{result.newCityLabel}</strong>, 
              you would need a salary of approximately{' '}
              <span className="text-indigo-600 font-black text-2xl">
                {fmt(result.equivalentSalary)}
              </span>
            </p>

            {result.difference > 100 && (
              <div className="bg-success-subtle border-2 border-green-300 rounded-xl p-6">
                <p className="font-bold text-success text-lg">
                  <Icon name="CircleCheck" className="h-5 w-5 inline mr-1" /> Good news! Your offer of <strong>{fmt(newSalary)}</strong> is about{' '}
                  <span className="text-2xl text-success">{fmt(result.difference)}</span> more 
                  than you need, giving you increased purchasing power.
                </p>
              </div>
            )}

            {result.difference < -100 && (
              <div className="bg-danger-subtle border-2 border-red-300 rounded-xl p-6">
                <p className="font-bold text-danger text-lg">
                  <Icon name="AlertTriangle" className="h-5 w-5 inline mr-1" /> Heads up! Your offer of <strong>{fmt(newSalary)}</strong> is about{' '}
                  <span className="text-2xl text-danger">{fmt(Math.abs(result.difference))}</span> short 
                  of maintaining your current lifestyle in the new city.
                </p>
              </div>
            )}

            {result.difference >= -100 && result.difference <= 100 && (
              <div className="bg-info-subtle border-2 border-blue-300 rounded-xl p-6">
                <p className="font-bold text-blue-900 text-lg">
                  <Icon name="Target" className="h-5 w-5 inline mr-1" /> It&apos;s a match! Your offer of <strong>{fmt(newSalary)}</strong> should provide 
                  a similar standard of living in your new location.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Explainer */}
      {showResult && result && (
        <Explainer payload={{
          tool: "salary",
          inputs: { currentSalary, newSalary, currentCity, newCity },
          outputs: { equivalentSalary: result.equivalentSalary, difference: result.difference }
        }} />
      )}

      {/* Educational Content */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2"><Icon name="Lightbulb" className="h-5 w-5" /> Understanding Cost of Living</h3>
        <p className="text-sm text-amber-800 mb-3">
          Cost of living indices help compare how far your money goes in different cities. 
          A city with an index of 120 is 20% more expensive than the national average (100), 
          while an index of 80 is 20% less expensive.
        </p>
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> This calculator uses general cost of living data. 
          Your actual expenses may vary based on lifestyle, housing choices, and family situation. 
          Always research specific costs like housing, childcare, and taxes for your new location.
        </p>
      </div>
    </div>
  );
}

