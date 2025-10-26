"use client";

import Card, { CardContent, CardHeader } from "@/app/components/ui/Card";

/**
 * Skeleton loader for PCS claim cards
 */
export function PCSClaimSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-6 w-16 rounded bg-gray-200"></div>
        </div>
        <div className="mt-2 h-3 w-48 rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded bg-gray-200"></div>
            <div className="h-3 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-24 rounded bg-gray-200"></div>
            <div className="h-3 w-20 rounded bg-gray-200"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-28 rounded bg-gray-200"></div>
            <div className="h-3 w-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for PCS calculations
 */
export function PCSCalculationSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-gray-200"></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-8 w-20 rounded bg-gray-200"></div>
                <div className="h-3 w-16 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for document list
 */
export function PCSDocumentSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
          <div className="h-10 w-10 rounded bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="h-3 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="h-6 w-16 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for validation results
 */
export function PCSValidationSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
          <div className="h-5 w-5 rounded bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-gray-200"></div>
            <div className="h-3 w-64 rounded bg-gray-200"></div>
            <div className="h-3 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for export buttons
 */
export function PCSExportSkeleton() {
  return (
    <div className="flex animate-pulse gap-2">
      <div className="h-10 w-24 rounded bg-gray-200"></div>
      <div className="h-10 w-24 rounded bg-gray-200"></div>
      <div className="h-10 w-24 rounded bg-gray-200"></div>
    </div>
  );
}

/**
 * Skeleton loader for form fields
 */
export function PCSFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-full rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for statistics cards
 */
export function PCSStatsSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-8 w-16 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for table rows
 */
export function PCSTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-6 w-16 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for comparison cards
 */
export function PCSComparisonSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-32 rounded bg-gray-200"></div>
            <div className="h-4 w-48 rounded bg-gray-200"></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-8 w-20 rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-gray-200"></div>
              <div className="h-3 w-20 rounded bg-gray-200"></div>
              <div className="h-3 w-28 rounded bg-gray-200"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Generic skeleton loader with customizable dimensions
 */
export function PCSGenericSkeleton({
  width = "w-full",
  height = "h-4",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${width} ${height} ${className}`}></div>
  );
}
