'use client';

import Icon from '@/app/components/ui/Icon';

interface DisclaimerBannerProps {
  variant?: 'full' | 'compact';
  confidenceLevel?: 'high' | 'medium' | 'low';
  showConfidence?: boolean;
}

export default function DisclaimerBanner({ 
  variant = 'full', 
  confidenceLevel = 'medium',
  showConfidence = false 
}: DisclaimerBannerProps) {
  
  const confidenceConfig = {
    high: {
      color: 'emerald',
      icon: 'CheckCircle' as const,
      label: 'High Confidence',
      description: 'Complete documentation, verified data'
    },
    medium: {
      color: 'yellow',
      icon: 'AlertCircle' as const,
      label: 'Medium Confidence',
      description: 'Some assumptions required'
    },
    low: {
      color: 'red',
      icon: 'AlertTriangle' as const,
      label: 'Low Confidence',
      description: 'Significant unknowns present'
    }
  };

  const config = confidenceConfig[confidenceLevel];

  if (variant === 'compact') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Estimates Only - Not Financial Advice
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
              Always verify with your finance office before making financial decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" className="w-7 h-7 text-yellow-600 dark:text-yellow-300" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            ⚠️ Important: These Are Estimates Only
          </h3>
          
          <div className="space-y-3 text-sm text-yellow-900 dark:text-yellow-100">
            <p className="font-medium">
              <strong>This tool provides administrative assistance, not financial advice.</strong> Actual reimbursements may differ based on:
            </p>
            
            <ul className="space-y-1.5 ml-5 list-disc">
              <li>Your finance office's interpretation of regulations</li>
              <li>Incomplete or inaccurate documentation</li>
              <li>Command-specific policies and approvals</li>
              <li>Changes to JTR rates or rules after calculation</li>
              <li>Individual circumstances not captured in our system</li>
            </ul>

            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 mt-3">
              <p className="font-semibold flex items-center gap-2">
                <Icon name="Shield" className="w-4 h-4" />
                What You Must Do:
              </p>
              <ul className="space-y-1 ml-6 mt-2 list-disc text-xs">
                <li>Verify all estimates with your servicing finance office</li>
                <li>Keep original receipts and documentation</li>
                <li>Submit claims according to your finance office procedures</li>
                <li>Do not make major financial decisions based solely on these estimates</li>
              </ul>
            </div>

            {showConfidence && (
              <div className={`bg-${config.color}-100 dark:bg-${config.color}-900/30 border border-${config.color}-300 dark:border-${config.color}-700 rounded-lg p-3 mt-3`}>
                <div className="flex items-center gap-2">
                  <Icon name={config.icon} className={`w-4 h-4 text-${config.color}-600`} />
                  <span className={`font-semibold text-${config.color}-900 dark:text-${config.color}-100`}>
                    {config.label}
                  </span>
                  <span className={`text-xs text-${config.color}-700 dark:text-${config.color}-300`}>
                    — {config.description}
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs mt-3 opacity-80">
              <strong>Legal Disclaimer:</strong> Garrison Ledger provides information and tools for educational and organizational purposes only. We are not liable for differences between estimated and actual reimbursements. By using this tool, you acknowledge that final determinations are made by your finance office, not by Garrison Ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

