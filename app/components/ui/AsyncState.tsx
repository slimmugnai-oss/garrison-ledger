/**
 * ASYNC STATE COMPONENT
 * 
 * Reusable component for handling async data states
 * Eliminates duplicate loading/error UI patterns
 * 
 * Usage:
 * ```tsx
 * <AsyncState data={profile} loading={loading} error={error}>
 *   {(profile) => <ProfileDisplay profile={profile} />}
 * </AsyncState>
 * ```
 */

'use client';

import { ReactNode } from 'react';
import Icon from '@/app/components/ui/Icon';

export interface AsyncStateProps<T> {
  data: T | null | undefined;
  loading: boolean;
  error: Error | string | null;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error | string) => ReactNode;
  emptyComponent?: ReactNode;
}

/**
 * Handle async data states with consistent UI patterns
 */
export default function AsyncState<T>({
  data,
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent
}: AsyncStateProps<T>) {
  
  // Loading state
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    
    return errorComponent ? errorComponent(error) : (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Error Loading Data
            </h3>
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return emptyComponent || (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Icon name="Info" className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  // Success state - render children with data
  return <>{children(data)}</>;
}

/**
 * Skeleton loading component for common use cases
 */
export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" />
      ))}
    </div>
  );
}

/**
 * Error message component for common use cases
 */
export function ErrorMessage({ 
  error, 
  onRetry 
}: { 
  error: Error | string;
  onRetry?: () => void;
}) {
  const message = error instanceof Error ? error.message : error;
  
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <Icon name="AlertCircle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

