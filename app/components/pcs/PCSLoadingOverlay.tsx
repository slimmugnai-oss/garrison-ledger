"use client";

import { useEffect, useState } from "react";

import Button from "@/app/components/ui/Button";
import Card, { CardContent } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import { LoadingState, useLoadingStateManager } from "@/lib/pcs/loading-state-manager";

interface PCSLoadingOverlayProps {
  loadingStates: LoadingState[];
  onCancel?: (id: string) => void;
  showProgress?: boolean;
  maxDisplay?: number;
}

/**
 * Loading overlay that shows all active loading states
 */
export function PCSLoadingOverlay({
  loadingStates,
  onCancel,
  showProgress = true,
  maxDisplay = 3,
}: PCSLoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const activeStates = loadingStates.filter((state) => state.status === "loading");

  useEffect(() => {
    setIsVisible(activeStates.length > 0);
  }, [activeStates.length]);

  if (!isVisible || activeStates.length === 0) {
    return null;
  }

  const displayStates = activeStates.slice(0, maxDisplay);
  const hasMore = activeStates.length > maxDisplay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-3">
        {displayStates.map((state) => (
          <LoadingStateCard
            key={state.id}
            state={state}
            onCancel={onCancel}
            showProgress={showProgress}
          />
        ))}

        {hasMore && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">
                +{activeStates.length - maxDisplay} more operations in progress
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Individual loading state card
 */
function LoadingStateCard({
  state,
  onCancel,
  showProgress,
}: {
  state: LoadingState;
  onCancel?: (id: string) => void;
  showProgress?: boolean;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "claim":
        return "File";
      case "document":
        return "Upload";
      case "calculation":
        return "Calculator";
      case "validation":
        return "Shield";
      case "export":
        return "Download";
      case "search":
        return "Search";
      case "sync":
        return "RefreshCw";
      default:
        return "Loader";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "claim":
        return "border-blue-200 bg-blue-50";
      case "document":
        return "border-green-200 bg-green-50";
      case "calculation":
        return "border-purple-200 bg-purple-50";
      case "validation":
        return "border-amber-200 bg-amber-50";
      case "export":
        return "border-indigo-200 bg-indigo-50";
      case "search":
        return "border-cyan-200 bg-cyan-50";
      case "sync":
        return "border-gray-200 bg-gray-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "claim":
        return "text-blue-900";
      case "document":
        return "text-green-900";
      case "calculation":
        return "text-purple-900";
      case "validation":
        return "text-amber-900";
      case "export":
        return "text-indigo-900";
      case "search":
        return "text-cyan-900";
      case "sync":
        return "text-gray-900";
      default:
        return "text-gray-900";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "claim":
        return "text-blue-600";
      case "document":
        return "text-green-600";
      case "calculation":
        return "text-purple-600";
      case "validation":
        return "text-amber-600";
      case "export":
        return "text-indigo-600";
      case "search":
        return "text-cyan-600";
      case "sync":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className={`${getTypeColor(state.type)} animate-pulse`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon
              name={getTypeIcon(state.type)}
              className={`h-5 w-5 ${getIconColor(state.type)}`}
            />
            <div>
              <div className={`font-medium ${getTextColor(state.type)}`}>{state.message}</div>
              {state.metadata && (
                <div className="mt-1 text-xs text-gray-600">
                  {state.metadata.claimId && `Claim: ${state.metadata.claimId}`}
                  {state.metadata.documentId && `Document: ${state.metadata.documentId}`}
                  {state.metadata.operation && ` • ${state.metadata.operation}`}
                </div>
              )}
            </div>
          </div>

          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(state.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icon name="X" className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showProgress && state.progress !== undefined && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  state.type === "claim"
                    ? "bg-blue-600"
                    : state.type === "document"
                      ? "bg-green-600"
                      : state.type === "calculation"
                        ? "bg-purple-600"
                        : state.type === "validation"
                          ? "bg-amber-600"
                          : state.type === "export"
                            ? "bg-indigo-600"
                            : state.type === "search"
                              ? "bg-cyan-600"
                              : "bg-gray-600"
                }`}
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Started {new Date(state.startTime).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact loading indicator for smaller spaces
 */
export function PCSCompactLoadingIndicator({
  loadingStates,
  maxDisplay = 2,
}: {
  loadingStates: LoadingState[];
  maxDisplay?: number;
}) {
  const activeStates = loadingStates.filter((state) => state.status === "loading");

  if (activeStates.length === 0) {
    return null;
  }

  const displayStates = activeStates.slice(0, maxDisplay);
  const hasMore = activeStates.length > maxDisplay;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon name="Loader" className="h-4 w-4 animate-spin" />
      <span>
        {displayStates.length === 1
          ? displayStates[0].message
          : `${displayStates.length} operations in progress`}
      </span>
      {hasMore && (
        <span className="text-xs text-gray-500">(+{activeStates.length - maxDisplay} more)</span>
      )}
    </div>
  );
}

/**
 * Loading state summary for status bars
 */
export function PCSLoadingSummary({ loadingStates }: { loadingStates: LoadingState[] }) {
  const activeStates = loadingStates.filter((state) => state.status === "loading");
  const completedStates = loadingStates.filter((state) => state.status === "success");
  const errorStates = loadingStates.filter((state) => state.status === "error");

  if (activeStates.length === 0 && completedStates.length === 0 && errorStates.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {activeStates.length > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <Icon name="Loader" className="h-4 w-4 animate-spin" />
          <span>{activeStates.length} active</span>
        </div>
      )}

      {completedStates.length > 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <Icon name="CheckCircle" className="h-4 w-4" />
          <span>{completedStates.length} completed</span>
        </div>
      )}

      {errorStates.length > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <Icon name="XCircle" className="h-4 w-4" />
          <span>{errorStates.length} failed</span>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing loading states in components
 */
export function usePCSLoadingStates() {
  const loadingManager = useLoadingStateManager();

  const startClaimLoading = (claimId: string, operation: string) => {
    loadingManager.startLoading(
      `claim-${operation}-${claimId}`,
      "claim",
      `${operation} PCS claim...`,
      { claimId, operation }
    );
  };

  const startDocumentLoading = (documentId: string, operation: string) => {
    loadingManager.startLoading(
      `document-${operation}-${documentId}`,
      "document",
      `${operation} document...`,
      { documentId, operation }
    );
  };

  const startValidationLoading = (claimId: string, validationType: string) => {
    loadingManager.startLoading(
      `validation-${claimId}-${validationType}`,
      "validation",
      `Validating ${validationType}...`,
      { claimId, validationType }
    );
  };

  const startExportLoading = (claimId: string, exportType: string) => {
    loadingManager.startLoading(
      `export-${exportType}-${claimId}`,
      "export",
      `Generating ${exportType}...`,
      { claimId, exportType }
    );
  };

  return {
    ...loadingManager,
    startClaimLoading,
    startDocumentLoading,
    startValidationLoading,
    startExportLoading,
  };
}

export default PCSLoadingOverlay;
