'use client';

import { SignUpButton } from '@clerk/nextjs';
import { useState } from 'react';

import Icon from '../ui/Icon';

export default function InteractiveHeroCalculator() {
  const [step, setStep] = useState(1);
  const [rank, setRank] = useState('');
  const [hasPCS, setHasPCS] = useState<boolean | null>(null);
  const [hasOptimizedTSP, setHasOptimizedTSP] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [savings, setSavings] = useState({ tsp: 0, pcs: 0, shopping: 0, total: 0 });

  const calculateSavings = () => {
    let tspSavings = 0;
    let pcsSavings = 0;
    const shoppingSavings = 447; // Base commissary savings

    // TSP Savings based on rank and optimization status (only for service members)
    if (!hasOptimizedTSP && !rank.includes('Military Spouse')) {
      if (rank.includes('E-1') || rank.includes('E-4')) {
        tspSavings = 800; // Lower ranks, smaller optimization potential
      } else if (rank.includes('E-5') || rank.includes('E-9')) {
        tspSavings = 1200; // Mid-enlisted
      } else if (rank.includes('O-1') || rank.includes('O-3')) {
        tspSavings = 1800; // Junior officers
      } else if (rank.includes('O-4') || rank.includes('O-6')) {
        tspSavings = 2400; // Senior officers
      }
    }

    // PCS Savings if applicable
    if (hasPCS) {
      if (rank.includes('E-')) {
        pcsSavings = 2800; // Average DITY profit for enlisted
      } else if (rank.includes('O-')) {
        pcsSavings = 3800; // Larger household = more profit
      }
    }

    const total = tspSavings + pcsSavings + shoppingSavings;

    setSavings({
      tsp: tspSavings,
      pcs: pcsSavings,
      shopping: shoppingSavings,
      total
    });
    setShowResults(true);
  };

  const handleNext = () => {
    if (step === 1 && rank) {
      // Skip TSP question for military spouses
      if (rank.includes('Military Spouse')) {
        setStep(2);
      } else {
        setStep(2);
      }
    }
    else if (step === 2 && hasPCS !== null) {
      // Skip TSP question for military spouses
      if (rank.includes('Military Spouse')) {
        calculateSavings();
      } else {
        setStep(3);
      }
    }
    else if (step === 3 && hasOptimizedTSP !== null) calculateSavings();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!showResults ? (
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-blue-600' : s < step ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            {step === 1 && "What's your rank?"}
            {step === 2 && rank.includes('Military Spouse') ? "Do you have a PCS planned?" : "Do you have a PCS planned?"}
            {step === 3 && "Are you optimizing your TSP?"}
          </h3>

          {/* Step 1: Rank Selection */}
          {step === 1 && (
            <div className="space-y-3">
              {['E-1 to E-4', 'E-5 to E-9', 'O-1 to O-3', 'O-4 to O-6', 'Military Spouse'].map((rankOption) => (
                <button
                  key={rankOption}
                  onClick={() => setRank(rankOption)}
                  className={`w-full px-6 py-4 rounded-lg font-semibold text-left transition-all ${
                    rank === rankOption
                      ? 'bg-blue-600 text-white border-2 border-blue-600'
                      : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {rankOption}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: PCS Status */}
          {step === 2 && (
            <div className="space-y-3">
              <button
                onClick={() => setHasPCS(true)}
                className={`w-full px-6 py-4 rounded-lg font-semibold transition-all ${
                  hasPCS === true
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold mb-1">Yes, within 6 months</div>
                <div className="text-sm opacity-90">I could save $2,800+ with DITY move planning</div>
              </button>
              <button
                onClick={() => setHasPCS(false)}
                className={`w-full px-6 py-4 rounded-lg font-semibold transition-all ${
                  hasPCS === false
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold mb-1">Not planning a PCS soon</div>
                <div className="text-sm opacity-90">Focus on other savings opportunities</div>
              </button>
            </div>
          )}

          {/* Step 3: TSP Optimization */}
          {step === 3 && (
            <div className="space-y-3">
              <button
                onClick={() => setHasOptimizedTSP(true)}
                className={`w-full px-6 py-4 rounded-lg font-semibold transition-all ${
                  hasOptimizedTSP === true
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold mb-1">Yes, I've optimized my TSP</div>
                <div className="text-sm opacity-90">Great! You're already maximizing retirement</div>
              </button>
              <button
                onClick={() => setHasOptimizedTSP(false)}
                className={`w-full px-6 py-4 rounded-lg font-semibold transition-all ${
                  hasOptimizedTSP === false
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold mb-1">No, I haven't optimized TSP yet</div>
                <div className="text-sm opacity-90">You could be leaving $1,200+/year on the table</div>
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !rank) ||
                (step === 2 && hasPCS === null) ||
                (step === 3 && hasOptimizedTSP === null && !rank.includes('Military Spouse'))
              }
              className="ml-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {step === 3 ? 'See My Savings →' : (step === 2 && rank.includes('Military Spouse')) ? 'See My Savings →' : 'Next →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-success to-navy-professional rounded-2xl shadow-2xl p-10 text-white text-center">
          {/* Explosion Animation */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="DollarSign" className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2">You Could Save</h3>
          </div>

          {/* Big Savings Number */}
          <div className="mb-8">
            <div className="text-7xl md:text-8xl font-black mb-2">
              ${savings.total.toLocaleString()}
            </div>
            <div className="text-2xl font-semibold text-green-100">
              This Year
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8 text-left">
            <div className="text-lg font-bold mb-4 text-center">Here's How:</div>
            <div className="space-y-3">
              {savings.tsp > 0 && (
                <div className="flex items-center justify-between">
                  <span>TSP Optimization</span>
                  <span className="font-bold">${savings.tsp.toLocaleString()}/year</span>
                </div>
              )}
              {savings.pcs > 0 && (
                <div className="flex items-center justify-between">
                  <span>PCS DITY Move Profit</span>
                  <span className="font-bold">${savings.pcs.toLocaleString()} (one-time)</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>On-Base Shopping Savings</span>
                <span className="font-bold">${savings.shopping}/year</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <SignUpButton mode="modal">
              <button className="w-full bg-white text-green-600 px-8 py-5 rounded-xl font-black text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2">
                Get My Personalized Plan (Free) →
                <Icon name="Sparkles" className="h-5 w-5" />
              </button>
            </SignUpButton>
            
            <div className="text-sm text-green-100">
              Free Forever • No Credit Card • Takes 10 Minutes
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setStep(1);
                setRank('');
                setHasPCS(null);
                setHasOptimizedTSP(null);
              }}
              className="text-white/80 hover:text-white text-sm font-semibold"
            >
              ← Recalculate
            </button>
          </div>
        </div>
      )}

      {/* Trust Indicators Below */}
      {!showResults && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <Icon name="Users" className="h-4 w-4 text-blue-600" />
              500+ military families
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Star" className="h-4 w-4 text-yellow-600" />
              4.8/5 rating
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Shield" className="h-4 w-4 text-green-600" />
              All branches welcome
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

