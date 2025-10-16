'use client';

interface ProfileProgressProps {
  complete: number;
  total: number;
  percentage: number;
}

export default function ProfileProgress({ complete, total, percentage }: ProfileProgressProps) {
  return (
    <div className="bg-surface rounded-xl border border-subtle p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-body">Overall Progress</div>
          <div className="text-3xl sm:text-4xl font-bold text-primary">
            {Math.round(percentage)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm sm:text-base text-body">
            <span className="font-semibold">{complete}</span> of {total} fields
          </div>
          <div className="text-xs text-muted mt-1">
            {complete < total ? (
              <span className="flex items-center gap-1 justify-end">
                <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Keep going!
              </span>
            ) : (
              <span className="flex items-center gap-1 justify-end text-success font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Complete!
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-surface-hover h-3 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

