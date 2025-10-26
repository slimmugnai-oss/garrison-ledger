import React, { useState, useCallback, useRef, useEffect } from "react";

export interface LoadingState {
  id: string;
  type: "claim" | "document" | "calculation" | "validation" | "export" | "search" | "sync";
  status: "pending" | "loading" | "success" | "error";
  message: string;
  progress?: number;
  startTime: number;
  metadata?: Record<string, any>;
}

export interface LoadingStateManager {
  loadingStates: LoadingState[];
  isLoading: (type?: string) => boolean;
  startLoading: (id: string, type: string, message: string, metadata?: Record<string, any>) => void;
  updateProgress: (id: string, progress: number) => void;
  completeLoading: (id: string, success: boolean, message?: string) => void;
  clearLoading: (id: string) => void;
  clearAllLoading: () => void;
  getLoadingState: (id: string) => LoadingState | undefined;
}

/**
 * Custom hook for managing loading states across the PCS Copilot
 */
export function useLoadingStateManager(): LoadingStateManager {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startLoading = useCallback(
    (id: string, type: string, message: string, metadata?: Record<string, any>) => {
      setLoadingStates((prev) => {
        const existing = prev.find((state) => state.id === id);
        if (existing) {
          return prev.map((state) =>
            state.id === id ? { ...state, status: "loading", message, metadata } : state
          );
        }

        return [
          ...prev,
          {
            id,
            type: type as LoadingState["type"],
            status: "loading",
            message,
            progress: 0,
            startTime: Date.now(),
            metadata,
          },
        ];
      });
    },
    []
  );

  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingStates((prev) =>
      prev.map((state) =>
        state.id === id ? { ...state, progress: Math.min(100, Math.max(0, progress)) } : state
      )
    );
  }, []);

  const completeLoading = useCallback((id: string, success: boolean, message?: string) => {
    setLoadingStates((prev) =>
      prev.map((state) =>
        state.id === id
          ? {
              ...state,
              status: success ? "success" : "error",
              message: message || state.message,
              progress: success ? 100 : state.progress,
            }
          : state
      )
    );

    // Auto-clear after 3 seconds
    const timeout = setTimeout(() => {
      clearLoading(id);
    }, 3000);

    timeoutsRef.current.set(id, timeout);
  }, []);

  const clearLoading = useCallback((id: string) => {
    setLoadingStates((prev) => prev.filter((state) => state.id !== id));

    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates([]);
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  const isLoading = useCallback(
    (type?: string) => {
      if (type) {
        return loadingStates.some((state) => state.type === type && state.status === "loading");
      }
      return loadingStates.some((state) => state.status === "loading");
    },
    [loadingStates]
  );

  const getLoadingState = useCallback(
    (id: string) => {
      return loadingStates.find((state) => state.id === id);
    },
    [loadingStates]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    loadingStates,
    isLoading,
    startLoading,
    updateProgress,
    completeLoading,
    clearLoading,
    clearAllLoading,
    getLoadingState,
  };
}

/**
 * Utility functions for common loading patterns
 */
export const LoadingPatterns = {
  /**
   * Simulate progress for long-running operations
   */
  simulateProgress: (
    id: string,
    updateProgress: (id: string, progress: number) => void,
    duration: number = 2000
  ) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      updateProgress(id, progress);

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  },

  /**
   * Create a loading state for claim operations
   */
  createClaimLoading: (
    claimId: string,
    operation: "create" | "update" | "delete" | "calculate"
  ) => ({
    id: `claim-${operation}-${claimId}`,
    type: "claim" as const,
    message: `${
      operation === "create"
        ? "Creating"
        : operation === "update"
          ? "Updating"
          : operation === "delete"
            ? "Deleting"
            : "Calculating"
    } PCS claim...`,
    metadata: { claimId, operation },
  }),

  /**
   * Create a loading state for document operations
   */
  createDocumentLoading: (documentId: string, operation: "upload" | "process" | "delete") => ({
    id: `document-${operation}-${documentId}`,
    type: "document" as const,
    message: `${
      operation === "upload" ? "Uploading" : operation === "process" ? "Processing" : "Deleting"
    } document...`,
    metadata: { documentId, operation },
  }),

  /**
   * Create a loading state for validation operations
   */
  createValidationLoading: (claimId: string, validationType: string) => ({
    id: `validation-${claimId}-${validationType}`,
    type: "validation" as const,
    message: `Validating ${validationType}...`,
    metadata: { claimId, validationType },
  }),

  /**
   * Create a loading state for export operations
   */
  createExportLoading: (claimId: string, exportType: "PDF" | "Excel" | "Summary") => ({
    id: `export-${exportType.toLowerCase()}-${claimId}`,
    type: "export" as const,
    message: `Generating ${exportType}...`,
    metadata: { claimId, exportType },
  }),
};

/**
 * Higher-order component for adding loading states to components
 */
export function withLoadingState<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  loadingStateKey: string = "loadingState"
) {
  return function LoadingStateWrapper(props: T) {
    const loadingManager = useLoadingStateManager();

    return React.createElement(Component, {
      ...props,
      [loadingStateKey]: loadingManager,
    });
  };
}

/**
 * Hook for optimistic UI updates
 */
export function useOptimisticUpdate<T>(
  initialValue: T,
  updateFn: (current: T, optimistic: T) => T
) {
  const [value, setValue] = useState<T>(initialValue);
  const [optimisticValue, setOptimisticValue] = useState<T | null>(null);

  const setOptimistic = useCallback(
    (newValue: T) => {
      setOptimisticValue(newValue);
      setValue(updateFn(value, newValue));
    },
    [value, updateFn]
  );

  const confirmOptimistic = useCallback(() => {
    setOptimisticValue(null);
  }, []);

  const revertOptimistic = useCallback(() => {
    setOptimisticValue(null);
    setValue(initialValue);
  }, [initialValue]);

  return {
    value: optimisticValue || value,
    isOptimistic: optimisticValue !== null,
    setOptimistic,
    confirmOptimistic,
    revertOptimistic,
  };
}
