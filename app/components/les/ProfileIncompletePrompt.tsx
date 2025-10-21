/**
 * PROFILE INCOMPLETE PROMPT
 * 
 * Shown when user tries to access LES Auditor without completing their profile.
 * Guides them to complete required fields: rank, base, dependents status.
 */

'use client';

import Icon from '../ui/Icon';
import AnimatedCard from '../ui/AnimatedCard';

interface ProfileIncompletePromptProps {
  missingFields: string[];
}

export default function ProfileIncompletePrompt({ missingFields }: ProfileIncompletePromptProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <AnimatedCard>
          <div className="bg-white border border-blue-200 rounded-lg p-8">
            
            {/* Icon Header */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="User" className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* BLUF */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3 font-lora">
              Complete Your Profile First
            </h2>
            
            <p className="text-lg text-gray-700 text-center mb-8">
              To audit your LES, we need your rank, duty station, and dependent status to calculate expected pay rates.
            </p>

            {/* Missing Fields */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Icon name="AlertCircle" className="w-4 h-4" />
                Missing Required Information:
              </h3>
              <ul className="space-y-2">
                {missingFields.includes('rank') && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <Icon name="XCircle" className="w-4 h-4 text-red-500" />
                    <span><strong>Rank/Paygrade</strong> - Used to calculate BAS and BAH rates</span>
                  </li>
                )}
                {missingFields.includes('current_base') && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <Icon name="XCircle" className="w-4 h-4 text-red-500" />
                    <span><strong>Current Base</strong> - Used to determine BAH/COLA location</span>
                  </li>
                )}
                {missingFields.includes('has_dependents') && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <Icon name="XCircle" className="w-4 h-4 text-red-500" />
                    <span><strong>Dependent Status</strong> - Affects BAH rates (with/without dependents)</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Why We Need This */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Why We Need This:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Calculate Expected BAH:</strong> Each rank and location has different housing allowance rates</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Calculate Expected BAS:</strong> Officers and enlisted have different subsistence rates</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Detect Underpayments:</strong> Compare your actual LES to what you should be receiving</span>
                </p>
              </div>
            </div>

            {/* Privacy Assurance */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon name="Shield" className="w-4 h-4 text-green-600" />
                Your Privacy is Protected
              </h3>
              <p className="text-sm text-gray-700">
                Your LES is parsed server-side and never exposed. We only store the line items needed for audit (BAH, BAS, COLA amounts). 
                Your full LES PDF is encrypted and only accessible by you.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="/dashboard/profile/setup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
              >
                <Icon name="ArrowRight" className="w-5 h-5" />
                Complete Profile Now
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Takes less than 2 minutes
              </p>
            </div>

          </div>
        </AnimatedCard>

      </div>
    </div>
  );
}

