'use client';

import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

import Icon from '@/app/components/ui/Icon';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for element to highlight
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional CTA text
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '🎉 Welcome to the New Intel Library!',
    description: 'We\'ve completely transformed how you discover and use content. Let us show you the powerful new features.',
    position: 'center',
    action: 'Start Tour',
    icon: 'Sparkles'
  },
  {
    id: 'personalized',
    title: '🎯 AI-Powered Personalization',
    description: 'Content is now personalized based on your assessment, profile, and interests. See your match percentage and why content is relevant to you.',
    targetElement: '.personalized-section',
    position: 'bottom',
    icon: 'Target'
  },
  {
    id: 'search',
    title: '🔍 Natural Language Search',
    description: 'Search like you talk: "I\'m PCSing to Japan next month" - our AI understands your intent and finds exactly what you need.',
    targetElement: '.search-bar',
    position: 'bottom',
    icon: 'Search'
  },
  {
    id: 'filters',
    title: '⚙️ Smart Collapsible Filters',
    description: 'Click "Filters" to refine by domain, difficulty, and audience. Active filters show a badge count.',
    targetElement: '.filter-toggle',
    position: 'left',
    icon: 'Settings'
  },
  {
    id: 'quick-actions',
    title: '⚡ Quick Actions',
    description: 'Bookmark, share, and rate content without opening it. All actions are tracked for better recommendations.',
    targetElement: '.content-block:first-child',
    position: 'right',
    icon: 'Zap'
  },
  {
    id: 'calculators',
    title: '🧮 Calculator Integration',
    description: 'Content now links directly to relevant calculators with pre-filled data. Go from learning to action instantly.',
    position: 'center',
    icon: 'Calculator'
  },
  {
    id: 'streaks',
    title: '🔥 Track Your Progress',
    description: 'Build learning streaks, earn achievements, and see your engagement analytics. Your progress is tracked automatically.',
    position: 'center',
    icon: 'TrendingUp'
  },
  {
    id: 'offline',
    title: '📱 Works Offline',
    description: 'Install as an app for offline access. Perfect for deployment zones with limited connectivity.',
    position: 'center',
    icon: 'Wifi'
  },
  {
    id: 'complete',
    title: '🚀 You\'re All Set!',
    description: 'Explore the library and discover how AI-powered content can transform your financial planning. Questions? Check the help center.',
    position: 'center',
    action: 'Start Exploring',
    icon: 'Rocket'
  }
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  // Check if user has seen tour
  useEffect(() => {
    const seen = localStorage.getItem('intel-library-tour-seen');
    if (!seen) {
      // Show tour after 1 second delay
      setTimeout(() => setIsOpen(true), 1000);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem('intel-library-tour-seen', 'true');
    setHasSeenTour(true);
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem('intel-library-tour-seen', 'true');
    setHasSeenTour(true);
    
    // Show success message
    setTimeout(() => {
      alert('🎉 Great! You\'re ready to explore the new Intel Library. Happy learning!');
    }, 300);
  };

  const handleReset = () => {
    localStorage.removeItem('intel-library-tour-seen');
    setHasSeenTour(false);
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    // Show "Take Tour" button for returning users
    return hasSeenTour ? (
      <button
        onClick={handleReset}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all z-50"
      >
        <Icon name="HelpCircle" className="h-4 w-4" />
        <span className="text-sm font-semibold">Tour Library Features</span>
      </button>
    ) : null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] transition-opacity" />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Icon name={currentStepData.icon as any} className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium opacity-90">
                    Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                  </div>
                  <h2 className="text-2xl font-bold mt-1">{currentStepData.title}</h2>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {/* Feature Highlights for Specific Steps */}
            {currentStep === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="Lightbulb" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">How it works:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Based on your assessment responses</li>
                      <li>• Learns from your interaction history</li>
                      <li>• Shows match percentage (higher = more relevant)</li>
                      <li>• Updates as you use the library</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="Link" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Smart Integration:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Auto-detects relevant calculators</li>
                      <li>• Pre-fills data from content context</li>
                      <li>• One-click to start calculating</li>
                      <li>• Tracks conversion for better recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Skip Tour
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <span>{currentStepData.action || (isLastStep ? 'Finish' : 'Next')}</span>
                  {isLastStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-8 pb-6">
            <div className="flex justify-center gap-2">
              {ONBOARDING_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'w-2 bg-green-500'
                      : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to step ${index + 1}: ${step.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

