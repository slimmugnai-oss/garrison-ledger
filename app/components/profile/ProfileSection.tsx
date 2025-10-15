'use client';

interface ProfileSectionProps {
  number: number;
  title: string;
  icon: string;
  description: string;
  required?: boolean;
  expanded: boolean;
  onToggle: () => void;
  completion: { complete: number; total: number; percentage: number };
  children: React.ReactNode;
}

export default function ProfileSection({
  number,
  title,
  icon,
  description,
  required = false,
  expanded,
  onToggle,
  completion,
  children
}: ProfileSectionProps) {
  const isComplete = completion.percentage === 100;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-xl sm:text-2xl">
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
              {required && <span className="text-red-500 text-sm">*</span>}
              {isComplete && <span className="text-green-500 text-lg sm:text-xl">✓</span>}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{description}</p>
            
            {/* Progress bar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-24 sm:w-32 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {completion.complete}/{completion.total}
              </span>
            </div>
          </div>
        </div>
        
        {/* Chevron */}
        <div className="flex-shrink-0 ml-2">
          <svg
            className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-200 ${expanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* Expandable content */}
      {expanded && (
        <div className="px-4 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100">
          <div className="pt-4 sm:pt-5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

