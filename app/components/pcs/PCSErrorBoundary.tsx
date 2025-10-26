"use client";

import React, { Component, ReactNode } from "react";
import { toast } from "sonner";

import Button from "@/app/components/ui/Button";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import { PCSErrorHandler } from "@/lib/pcs/error-handler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class PCSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("PCS Error Boundary caught an error:", error, errorInfo);
    }

    // Handle the error
    const pcsError = PCSErrorHandler.handleError(error, "Error Boundary");

    // Show toast notification
    toast.error(pcsError.userMessage, {
      description: pcsError.recovery,
      duration: 10000,
      action: pcsError.supportUrl
        ? {
            label: "Get Help",
            onClick: () => window.open(pcsError.supportUrl, "_blank"),
          }
        : undefined,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportError = () => {
    const { error } = this.state;
    if (error) {
      // In a real app, you'd send this to your error reporting service
      console.log("Reporting error:", error);
      toast.success("Error reported. Thank you for helping us improve!");
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const pcsError = this.state.error
        ? PCSErrorHandler.handleError(this.state.error, "Error Boundary")
        : null;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Icon name="AlertTriangle" className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                {pcsError?.userMessage || "An unexpected error occurred in the PCS Copilot."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pcsError?.recovery && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Try this:</strong> {pcsError.recovery}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Button onClick={this.handleReportError} variant="outline" className="w-full">
                  <Icon name="AlertTriangle" className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>

                {pcsError?.supportUrl && (
                  <Button
                    onClick={() => window.open(pcsError.supportUrl, "_blank")}
                    variant="outline"
                    className="w-full"
                  >
                    <Icon name="HelpCircle" className="mr-2 h-4 w-4" />
                    Get Help
                  </Button>
                )}
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600">
                    Technical Details (Development)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling errors in functional components
 */
export function usePCSErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const pcsError = PCSErrorHandler.handleError(error, context);

    // Show toast notification
    toast.error(pcsError.userMessage, {
      description: pcsError.recovery,
      duration: 10000,
      action: pcsError.supportUrl
        ? {
            label: "Get Help",
            onClick: () => window.open(pcsError.supportUrl, "_blank"),
          }
        : undefined,
    });

    return pcsError;
  };

  return { handleError };
}

/**
 * Higher-order component for wrapping components with error handling
 */
export function withPCSErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <PCSErrorBoundary fallback={fallback}>
      <Component {...props} />
    </PCSErrorBoundary>
  );

  WrappedComponent.displayName = `withPCSErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
