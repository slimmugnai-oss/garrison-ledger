"use client";

import { useState, useEffect } from "react";

import Explainer from "@/app/components/ai/Explainer";
import CitySearchInput from "@/app/components/ui/CitySearchInput";
import Icon from "@/app/components/ui/Icon";
import { track } from "@/lib/track";

const fmt = (v: number) =>
  v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

interface City {
  city: string;
  state: string;
  cost_of_living_index: number;
}

interface JobData {
  salary: number;
  bonus: number;
  retirementMatch: number;
  stateTax: number;
  city: City | null;
}

export default function CareerOpportunityAnalyzer() {
  const [currentJob, setCurrentJob] = useState<JobData>({
    salary: 60000,
    bonus: 0,
    retirementMatch: 5,
    stateTax: 5,
    city: { city: "National Average", state: "US", cost_of_living_index: 100.0 },
  });

  const [newOffer, setNewOffer] = useState<JobData>({
    salary: 70000,
    bonus: 5000,
    retirementMatch: 6,
    stateTax: 0,
    city: { city: "San Antonio", state: "TX", cost_of_living_index: 86.9 },
  });

  // Track page view on mount
  useEffect(() => {
    track("career_analyzer_view");
  }, []);

  // Calculate total compensation
  const currentTotal =
    currentJob.salary + currentJob.bonus + currentJob.salary * (currentJob.retirementMatch / 100);
  const newTotal =
    newOffer.salary + newOffer.bonus + newOffer.salary * (newOffer.retirementMatch / 100);

  // Calculate after-tax income (simplified federal ~15% effective + state tax)
  const federalRate = 0.15;
  const currentAfterTax = currentTotal * (1 - federalRate - currentJob.stateTax / 100);
  const newAfterTax = newTotal * (1 - federalRate - newOffer.stateTax / 100);

  // Adjust for cost of living
  const currentCOL = currentJob.city?.cost_of_living_index || 100;
  const newCOL = newOffer.city?.cost_of_living_index || 100;

  // Adjust new offer to current city's COL for apples-to-apples comparison
  const adjustedNewOffer = newAfterTax * (currentCOL / newCOL);
  const netDifference = adjustedNewOffer - currentAfterTax;
  const percentChange = ((netDifference / currentAfterTax) * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Data Provenance Banner */}
      <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-600 p-3">
            <Icon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-blue-900">Total Compensation Comparison</h3>
            <p className="mb-3 text-sm text-blue-800">
              This calculator compares total compensation adjusted for cost of living and taxes.
              Uses simplified tax calculations (~15% federal effective rate) and COL index data from
              multiple sources. Actual results may vary significantly.
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 font-semibold text-blue-700">COL Data</p>
                <p className="text-blue-900">Multiple Sources</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 font-semibold text-blue-700">Tax Model</p>
                <p className="text-blue-900">Simplified</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-3">
                <p className="mb-1 font-semibold text-blue-700">Confidence</p>
                <p className="font-bold text-blue-900">Fair</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Current Job */}
        <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-blue-600"></div>
            <h3 className="text-xl font-bold text-gray-900">Current Job</h3>
          </div>

          <div className="space-y-4">
            <CitySearchInput
              value={currentJob.city ? `${currentJob.city.city}, ${currentJob.city.state}` : ""}
              onSelect={(city) => setCurrentJob({ ...currentJob, city })}
              label="City/Location"
              placeholder="Start typing..."
              accentColor="blue"
            />

            {currentJob.city && (
              <div className="rounded-lg border border-blue-300 bg-blue-100 p-3">
                <p className="text-xs font-semibold text-blue-900">
                  COL Index: {currentJob.city.cost_of_living_index}
                  {currentJob.city.cost_of_living_index !== 100 &&
                    ` (${currentJob.city.cost_of_living_index > 100 ? "+" : ""}${(currentJob.city.cost_of_living_index - 100).toFixed(0)}% vs national avg)`}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="current_salary"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Base Annual Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={currentJob.salary}
                  onChange={(e) => setCurrentJob({ ...currentJob, salary: Number(e.target.value) })}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="current_bonus"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Annual Bonus
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={currentJob.bonus}
                  onChange={(e) => setCurrentJob({ ...currentJob, bonus: Number(e.target.value) })}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-base font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="current_retirement_match"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Retirement Match (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={currentJob.retirementMatch}
                onChange={(e) =>
                  setCurrentJob({ ...currentJob, retirementMatch: Number(e.target.value) })
                }
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-600">
                Value: {fmt(currentJob.salary * (currentJob.retirementMatch / 100))}
              </p>
            </div>

            <div>
              <label
                htmlFor="current_state_tax"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                State Income Tax (%)
              </label>
              <input
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={currentJob.stateTax}
                onChange={(e) => setCurrentJob({ ...currentJob, stateTax: Number(e.target.value) })}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-medium text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-600">TX/FL/WA: 0%, CA: ~9%, NY: ~7%</p>
            </div>
          </div>
        </div>

        {/* New Offer */}
        <div className="rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-green-600"></div>
            <h3 className="text-xl font-bold text-gray-900">New Offer</h3>
          </div>

          <div className="space-y-4">
            <CitySearchInput
              value={newOffer.city ? `${newOffer.city.city}, ${newOffer.city.state}` : ""}
              onSelect={(city) => setNewOffer({ ...newOffer, city })}
              label="City/Location"
              placeholder="Start typing..."
              accentColor="green"
            />

            {newOffer.city && (
              <div className="rounded-lg border border-green-300 bg-green-100 p-3">
                <p className="text-xs font-semibold text-green-900">
                  COL Index: {newOffer.city.cost_of_living_index}
                  {newOffer.city.cost_of_living_index !== 100 &&
                    ` (${newOffer.city.cost_of_living_index > 100 ? "+" : ""}${(newOffer.city.cost_of_living_index - 100).toFixed(0)}% vs national avg)`}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="new_salary"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Base Annual Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={newOffer.salary}
                  onChange={(e) => setNewOffer({ ...newOffer, salary: Number(e.target.value) })}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-lg font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="new_bonus" className="mb-2 block text-sm font-semibold text-gray-700">
                Annual Bonus
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={newOffer.bonus}
                  onChange={(e) => setNewOffer({ ...newOffer, bonus: Number(e.target.value) })}
                  className="w-full rounded-lg border-2 border-gray-300 py-3 pl-10 pr-4 text-base font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="new_retirement_match"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Retirement Match (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={newOffer.retirementMatch}
                onChange={(e) =>
                  setNewOffer({ ...newOffer, retirementMatch: Number(e.target.value) })
                }
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-600">
                Value: {fmt(newOffer.salary * (newOffer.retirementMatch / 100))}
              </p>
            </div>

            <div>
              <label
                htmlFor="new_state_tax"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                State Income Tax (%)
              </label>
              <input
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={newOffer.stateTax}
                onChange={(e) => setNewOffer({ ...newOffer, stateTax: Number(e.target.value) })}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base font-medium text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-600">TX/FL/WA: 0%, CA: ~9%, NY: ~7%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {currentJob.city && newOffer.city && (
        <div className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Compensation Comparison
          </h2>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border-2 border-blue-400 bg-white p-6">
              <p className="mb-3 text-sm font-semibold text-gray-600">Current Job</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Compensation:</span>
                  <span className="font-bold text-blue-900">{fmt(currentTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-700">After Taxes:</span>
                  <span className="font-bold text-blue-900">{fmt(currentAfterTax)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-green-400 bg-white p-6">
              <p className="mb-3 text-sm font-semibold text-gray-600">New Offer</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Compensation:</span>
                  <span className="font-bold text-green-900">{fmt(newTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-700">After Taxes:</span>
                  <span className="font-bold text-green-900">{fmt(newAfterTax)}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg border-2 p-6 ${
              netDifference >= 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
            }`}
          >
            <div className="text-center">
              <p
                className={`mb-2 text-2xl font-bold ${netDifference >= 0 ? "text-green-700" : "text-red-700"}`}
              >
                {netDifference >= 0 ? (
                  <>
                    <Icon name="TrendingUp" className="mr-2 inline h-6 w-6" />
                    Better Purchasing Power
                  </>
                ) : (
                  <>
                    <Icon name="TrendingDown" className="mr-2 inline h-6 w-6" />
                    Lower Purchasing Power
                  </>
                )}
              </p>
              <p
                className={`mb-4 text-5xl font-bold ${netDifference >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {netDifference >= 0 ? "+" : ""}
                {fmt(netDifference)}
              </p>
              <p className="text-sm text-gray-700">
                Annual difference after taxes and cost of living adjustment (
                {netDifference >= 0 ? "+" : ""}
                {percentChange}%)
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-gray-300 bg-white p-4">
              <h4 className="mb-3 text-sm font-bold text-gray-900">How We Calculate This:</h4>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Current after-tax income:</span>
                  <span className="font-semibold">{fmt(currentAfterTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New offer adjusted to your COL:</span>
                  <span className="font-semibold">{fmt(adjustedNewOffer)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold">Net purchasing power change:</span>
                  <span
                    className={`font-bold ${netDifference >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {netDifference >= 0 ? "+" : ""}
                    {fmt(netDifference)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
            <p className="mb-1 text-sm font-semibold text-amber-900">
              <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
              Important Disclaimer
            </p>
            <p className="text-xs text-amber-800">
              This calculator uses simplified tax estimates and generalized cost of living data.{" "}
              <strong>Actual financial outcomes vary significantly</strong> based on personal
              circumstances, deductions, housing costs, lifestyle choices, and local variations.
              This is a planning tool only. Consult with a financial advisor before making major
              career decisions.
            </p>
          </div>

          {/* AI Explainer - Provides career decision insights and non-financial factors to consider */}
          <div className="mt-6">
            <Explainer
              payload={{
                tool: "career-comparison-calculator",
                inputs: {
                  currentCity: currentJob.city?.city,
                  currentSalary: currentJob.salary,
                  newCity: newOffer.city?.city,
                  newSalary: newOffer.salary,
                },
                outputs: {
                  currentAfterTax,
                  newAfterTax,
                  netDifference,
                  percentChange,
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-blue-900">Understanding Total Compensation</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>Base salary</strong> is just the starting point - bonuses and retirement
                matching add significant value
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>State taxes</strong> vary from 0% (TX, FL, WA) to 9%+ (CA) - can be
                thousands annually
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>
                <strong>Cost of living</strong> dramatically impacts purchasing power - same salary
                goes further in low-COL areas
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-purple-900">Career Decision Factors</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Consider non-financial factors: career growth, work-life balance, commute</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>
                Research actual housing costs in new location (rentals or purchase prices)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>Factor in healthcare costs, childcare, and other family-specific expenses</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
              <span>
                Military transition: Consider GI Bill, SkillBridge, and veteran hiring programs
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Resources */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Icon name="ExternalLink" className="h-5 w-5 text-gray-600" />
          Career Transition Resources
        </h3>
        <div className="space-y-3">
          <a
            href="https://www.hiringourheroes.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Hiring Our Heroes - Military Transition Program →
          </a>
          <a
            href="https://skillbridge.osd.mil/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            SkillBridge - Pre-Separation Training Program →
          </a>
          <a
            href="https://www.nerdwallet.com/cost-of-living-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Cost of Living Calculator (NerdWallet) →
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          Cost of living data from multiple public sources. Tax calculations are simplified
          estimates. Consult a financial advisor for personalized career guidance.
        </p>
      </div>
    </div>
  );
}
