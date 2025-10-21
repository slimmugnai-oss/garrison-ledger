'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import { useRouter } from 'next/navigation';

export default function MultiStepProfileWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Essential Identity (5 fields)
    service_status: '',
    branch: '',
    rank: '',
    current_base: '',
    years_of_service: '',
    
    // Step 2: Family & Location (5 fields)
    marital_status: '',
    num_children: '',
    has_efmp: false,
    pcs_date: '',
    next_base: '',
    
    // Step 3: Financial Snapshot (5 fields)
    tsp_balance_range: '',
    emergency_fund_range: '',
    debt_amount_range: '',
    financial_priorities: [] as string[],
    
    // Step 4: Goals & Preferences (5 fields)
    long_term_goal: '',
    career_interests: [] as string[],
    content_difficulty: 'intermediate',
    urgency_level: 'moderate'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profile_completed: true
        })
      });

      if (!response.ok) throw new Error('Failed to save profile');

      // Generate sample plan automatically
      await fetch('/api/plan/sample', { method: 'POST' });

      // Redirect to dashboard
      router.push('/dashboard?onboarding=complete');
    } catch {
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.service_status && formData.branch && formData.rank);
      case 2:
        return !!(formData.marital_status && formData.num_children !== '');
      case 3:
        return !!(formData.tsp_balance_range && formData.emergency_fund_range);
      case 4:
        return !!(formData.long_term_goal);
      default:
        return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-body">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm font-semibold text-body">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 flex items-center gap-2">
              <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                step < currentStep ? 'bg-green-500' :
                step === currentStep ? 'bg-blue-500' :
                'bg-gray-200'
              }`} />
              {step < totalSteps && (
                <div className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
                  step < currentStep ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {step < currentStep && (
                    <Icon name="Check" className="w-3 h-3 text-white" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className={`text-xs text-center ${currentStep === 1 ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
            Service
          </div>
          <div className={`text-xs text-center ${currentStep === 2 ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
            Family
          </div>
          <div className={`text-xs text-center ${currentStep === 3 ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
            Finances
          </div>
          <div className={`text-xs text-center ${currentStep === 4 ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
            Goals
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-surface rounded-2xl shadow-lg p-8 mb-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-primary mb-2">Let&apos;s Start with the Basics</h2>
              <p className="text-body">This helps AI understand your military context</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Service Status *
              </label>
              <select
                value={formData.service_status}
                onChange={(e) => setFormData({ ...formData, service_status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              >
                <option value="">Select status</option>
                <option value="active-duty">Active Duty</option>
                <option value="reserve">Reserve</option>
                <option value="national-guard">National Guard</option>
                <option value="veteran">Veteran</option>
                <option value="military-spouse">Military Spouse</option>
              </select>
            </div>

            {formData.service_status && formData.service_status !== 'military-spouse' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-body mb-2">
                    Branch *
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  >
                    <option value="">Select branch</option>
                    <option value="Army">Army</option>
                    <option value="Navy">Navy</option>
                    <option value="Air Force">Air Force</option>
                    <option value="Marines">Marines</option>
                    <option value="Space Force">Space Force</option>
                    <option value="Coast Guard">Coast Guard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-body mb-2">
                    Rank *
                  </label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    placeholder="e.g., E-5, O-3, W-2"
                    className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-body mb-2">
                    Years of Service *
                  </label>
                  <input
                    type="number"
                    value={formData.years_of_service}
                    onChange={(e) => setFormData({ ...formData, years_of_service: e.target.value })}
                    placeholder="e.g., 8"
                    min="0"
                    max="40"
                    className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Current Duty Station
              </label>
              <input
                type="text"
                value={formData.current_base}
                onChange={(e) => setFormData({ ...formData, current_base: e.target.value })}
                placeholder="e.g., Fort Hood, Camp Pendleton, etc."
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-primary mb-2">Family & Timeline</h2>
              <p className="text-body">Help us personalize your plan</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Marital Status *
              </label>
              <select
                value={formData.marital_status}
                onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Number of Children *
              </label>
              <input
                type="number"
                value={formData.num_children}
                onChange={(e) => setFormData({ ...formData, num_children: e.target.value })}
                min="0"
                max="10"
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_efmp}
                  onChange={(e) => setFormData({ ...formData, has_efmp: e.target.checked })}
                  className="w-5 h-5 text-info border-default rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-body">
                  Family member enrolled in EFMP
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Next PCS Date (if known)
              </label>
              <input
                type="date"
                value={formData.pcs_date}
                onChange={(e) => setFormData({ ...formData, pcs_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Next Duty Station (if known)
              </label>
              <input
                type="text"
                value={formData.next_base}
                onChange={(e) => setFormData({ ...formData, next_base: e.target.value })}
                placeholder="e.g., Fort Bragg, Norfolk, etc."
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-primary mb-2">Financial Snapshot</h2>
              <p className="text-body">This helps AI curate relevant strategies</p>
              <p className="text-xs text-muted mt-2">All information is private and encrypted</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                TSP Balance Range *
              </label>
              <select
                value={formData.tsp_balance_range}
                onChange={(e) => setFormData({ ...formData, tsp_balance_range: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              >
                <option value="">Select range</option>
                <option value="$0">$0 (Just starting)</option>
                <option value="$1-$10,000">$1 - $10,000</option>
                <option value="$10,001-$50,000">$10,001 - $50,000</option>
                <option value="$50,001-$100,000">$50,001 - $100,000</option>
                <option value="$100,001-$250,000">$100,001 - $250,000</option>
                <option value="$250,000+">$250,000+</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Emergency Fund Range *
              </label>
              <select
                value={formData.emergency_fund_range}
                onChange={(e) => setFormData({ ...formData, emergency_fund_range: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              >
                <option value="">Select range</option>
                <option value="$0">$0 (Need to build one)</option>
                <option value="$1-$2,500">$1 - $2,500</option>
                <option value="$2,501-$5,000">$2,501 - $5,000</option>
                <option value="$5,001-$10,000">$5,001 - $10,000</option>
                <option value="$10,000+">$10,000+</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Total Debt Range *
              </label>
              <select
                value={formData.debt_amount_range}
                onChange={(e) => setFormData({ ...formData, debt_amount_range: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              >
                <option value="">Select range</option>
                <option value="$0">$0 (Debt-free!)</option>
                <option value="$1-$10,000">$1 - $10,000</option>
                <option value="$10,001-$25,000">$10,001 - $25,000</option>
                <option value="$25,001-$50,000">$25,001 - $50,000</option>
                <option value="$50,000+">$50,000+</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-primary mb-2">Your Goals & Preferences</h2>
              <p className="text-body">Almost done! This personalizes your AI plan</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Primary Long-Term Goal *
              </label>
              <select
                value={formData.long_term_goal}
                onChange={(e) => setFormData({ ...formData, long_term_goal: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
                required
              >
                <option value="">Select your primary goal</option>
                <option value="maximize-tsp">Maximize TSP/Retirement</option>
                <option value="buy-home">Buy a Home</option>
                <option value="build-wealth">Build Generational Wealth</option>
                <option value="pay-off-debt">Pay Off All Debt</option>
                <option value="transition-prep">Prepare for Transition</option>
                <option value="education">Fund Education (Self/Kids)</option>
                <option value="financial-independence">Achieve Financial Independence</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-2">
                Content Difficulty Preference
              </label>
              <select
                value={formData.content_difficulty}
                onChange={(e) => setFormData({ ...formData, content_difficulty: e.target.value })}
                className="w-full px-4 py-3 border-2 border-default rounded-xl focus:border-info focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="beginner">Beginner - I&apos;m just starting out</option>
                <option value="intermediate">Intermediate - I know the basics</option>
                <option value="advanced">Advanced - Give me the deep dive</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t-2 border-subtle">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-default rounded-xl font-semibold text-body hover:border-strong transition-all"
            >
              <Icon name="ChevronLeft" className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <Icon name="ChevronRight" className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepComplete(currentStep) || isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Your Plan...
                </>
              ) : (
                <>
                  Complete & Get My Sample Plan
                  <Icon name="Sparkles" className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Value preview */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <p className="text-sm text-body">
          <strong className="text-info">Why we ask:</strong> AI uses this information to curate the most relevant financial strategies from our library of 410+ expert content blocks.
        </p>
      </div>
    </div>
  );
}

