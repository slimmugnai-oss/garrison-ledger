'use client';

import Icon from './Icon';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function ProgressIndicator({
  steps,
  currentStep,
  orientation = 'horizontal',
  className = ''
}: ProgressIndicatorProps) {
  return (
    <div className={`${orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col'} ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const _isPending = index > currentStep;

        return (
          <div
            key={step.id}
            className={`flex ${orientation === 'horizontal' ? 'items-center' : 'items-start'} ${
              index < steps.length - 1 ? (orientation === 'horizontal' ? 'flex-1' : 'mb-4') : ''
            }`}
          >
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'bg-success border-success'
                    : isCurrent
                    ? 'bg-info border-info'
                    : 'bg-surface border-subtle'
                }`}
              >
                {isCompleted ? (
                  <Icon name="Check" className="h-5 w-5 text-white" />
                ) : (
                  <span
                    className={`font-bold ${
                      isCurrent ? 'text-white' : 'text-muted'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Step Label */}
              {orientation === 'vertical' && (
                <div className="mt-2 text-left">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent ? 'text-info' : isCompleted ? 'text-success' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted mt-1">{step.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`${
                  orientation === 'horizontal'
                    ? 'flex-1 h-0.5 mx-2'
                    : 'w-0.5 h-8 ml-5 my-2'
                } ${isCompleted ? 'bg-success' : 'bg-subtle'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

