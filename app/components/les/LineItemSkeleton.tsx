/**
 * LINE ITEM SKELETON
 * 
 * Loading placeholder for line items during auto-population
 * Shows shimmer effect for better perceived performance
 */

import React from "react";

interface LineItemSkeletonProps {
  count?: number;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded"></div>
          <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
        </div>
        <div className="h-3 w-48 bg-slate-100 rounded"></div>
      </div>
      <div className="h-6 w-24 bg-slate-200 rounded"></div>
    </div>
  );
}

export default function LineItemSkeleton({ count = 3 }: LineItemSkeletonProps) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

