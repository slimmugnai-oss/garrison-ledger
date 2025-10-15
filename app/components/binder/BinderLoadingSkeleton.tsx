'use client';

export default function BinderLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-4">
          {/* Upload Button */}
          <div className="w-full h-11 bg-[#2A2F3E] rounded-lg mb-4 animate-pulse" />
          
          {/* Folder Items */}
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center flex-1">
                  <div className="w-4 h-4 bg-[#2A2F3E] rounded mr-2 animate-pulse" />
                  <div className="h-4 bg-[#2A2F3E] rounded w-24 animate-pulse" />
                </div>
                <div className="w-6 h-4 bg-[#2A2F3E] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File List Skeleton */}
      <div className="lg:col-span-3">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-[#2A2F3E] rounded-lg mr-3 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#2A2F3E] rounded w-48 mb-2 animate-pulse" />
                    <div className="h-3 bg-[#2A2F3E] rounded w-32 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="w-8 h-8 bg-[#2A2F3E] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

