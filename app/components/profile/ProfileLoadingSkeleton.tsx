'use client';

export default function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-surface-hover">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 bg-surface-hover rounded-lg w-64 animate-pulse"></div>
          <div className="h-5 bg-surface-hover rounded w-16 animate-pulse"></div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-4 bg-surface-hover rounded w-24 mb-2 animate-pulse"></div>
          <div className="w-full bg-surface-hover h-2 rounded">
            <div className="bg-surface-hover h-2 rounded w-1/6 animate-pulse"></div>
          </div>
        </div>

        {/* Form sections */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].map((section) => (
            <div key={section} className="bg-surface rounded-xl border border-subtle p-6 animate-pulse">
              <div className="h-7 bg-surface-hover rounded w-48 mb-2"></div>
              <div className="h-4 bg-surface-hover rounded w-full mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((field) => (
                  <div key={field}>
                    <div className="h-4 bg-surface-hover rounded w-24 mb-2"></div>
                    <div className="h-10 bg-surface-hover rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-8">
          <div className="h-12 bg-surface-hover rounded-xl w-40 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

