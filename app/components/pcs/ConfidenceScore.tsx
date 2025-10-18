'use client';

import Icon from '@/app/components/ui/Icon';

interface ConfidenceScoreProps {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  factors: Array<{
    factor: string;
    impact: string;
    met: boolean;
  }>;
  showDetails?: boolean;
}

export default function ConfidenceScore({ 
  score, 
  level, 
  factors,
  showDetails = true 
}: ConfidenceScoreProps) {
  
  const levelConfig = {
    high: {
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      progressColor: 'bg-emerald-500',
      icon: 'CheckCircle' as const,
      label: 'High Confidence',
      description: 'Your estimate is based on complete, verified data'
    },
    medium: {
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      progressColor: 'bg-yellow-500',
      icon: 'AlertCircle' as const,
      label: 'Medium Confidence',
      description: 'Some assumptions were made, verify details with finance'
    },
    low: {
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      textColor: 'text-red-900 dark:text-red-100',
      progressColor: 'bg-red-500',
      icon: 'AlertTriangle' as const,
      label: 'Low Confidence',
      description: 'Significant data missing - upload documents to improve accuracy'
    }
  };

  const config = levelConfig[level];
  const metFactors = factors.filter(f => f.met).length;
  const totalFactors = factors.length;

  return (
    <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
            <Icon name={config.icon} className={`w-6 h-6 text-${config.color}-600`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-lg font-bold ${config.textColor}`}>
                {config.label}
              </h3>
              <span className={`text-2xl font-bold ${config.textColor}`}>
                {score}%
              </span>
            </div>
            <p className={`text-sm ${config.textColor} opacity-80 mt-0.5`}>
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div 
          className={`absolute top-0 left-0 h-full ${config.progressColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Factor Count */}
      <div className={`text-sm ${config.textColor} font-medium mb-4`}>
        {metFactors} of {totalFactors} quality factors met
      </div>

      {/* Factor Details */}
      {showDetails && (
        <div className="space-y-2">
          {factors.map((factor, index) => (
            <div 
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                {factor.met ? (
                  <Icon name="CheckCircle" className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Icon name="X" className="w-4 h-4 text-gray-400" />
                )}
                <span className={factor.met ? config.textColor : 'text-gray-500'}>
                  {factor.factor}
                </span>
              </div>
              <span className={`text-xs font-mono ${factor.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                {factor.impact}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Items for Low/Medium */}
      {level !== 'high' && (
        <div className={`mt-4 pt-4 border-t ${config.borderColor}`}>
          <p className={`text-sm font-semibold ${config.textColor} mb-2`}>
            To improve accuracy:
          </p>
          <ul className={`text-xs ${config.textColor} space-y-1 ml-5 list-disc`}>
            {!factors.find(f => f.factor.includes('Orders'))?.met && (
              <li>Upload your PCS orders for precise entitlement calculations</li>
            )}
            {!factors.find(f => f.factor.includes('Weight tickets'))?.met && (
              <li>Add weigh tickets if you're doing a PPM move</li>
            )}
            {!factors.find(f => f.factor.includes('Receipts'))?.met && (
              <li>Upload lodging and travel receipts for TLE/per diem</li>
            )}
            {!factors.find(f => f.factor.includes('location'))?.met && (
              <li>Specify exact origin and destination cities for per diem rates</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

