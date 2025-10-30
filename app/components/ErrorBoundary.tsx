"use client";

/**
 * ERROR BOUNDARY
 * 
 * Catches React component errors and displays fallback UI
 * Prevents entire app from crashing when a component fails
 */

import React from "react";
import Icon from "@/app/components/ui/Icon";
import { logger } from "@/lib/logger";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("[ErrorBoundary] Component error:", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8 text-center">
          <Icon name="AlertTriangle" className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Something went wrong
          </h3>
          <p className="mb-4 text-sm text-red-700">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            <Icon name="RefreshCw" className="h-4 w-4" />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

