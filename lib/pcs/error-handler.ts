/**
 * PCS COPILOT ERROR HANDLER
 *
 * Centralized error handling with user-friendly messages,
 * recovery suggestions, and support escalation paths.
 */

import { logger } from "@/lib/logger";

export interface PCSError {
  code: string;
  message: string;
  userMessage: string;
  recovery?: string;
  supportUrl?: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "calculation" | "validation" | "document" | "export" | "network" | "auth" | "data";
}

export class PCSErrorHandler {
  private static errorMap: Record<string, PCSError> = {
    // Calculation Errors
    CALC_MISSING_DATA: {
      code: "CALC_MISSING_DATA",
      message: "Required calculation data is missing",
      userMessage:
        "Some required information is missing for calculations. Please check your claim details.",
      recovery: "Verify all required fields are filled out in your claim",
      severity: "medium",
      category: "calculation",
    },
    CALC_INVALID_RATES: {
      code: "CALC_INVALID_RATES",
      message: "Invalid or outdated rate data",
      userMessage: "Rate data appears to be outdated. We're fetching the latest rates.",
      recovery: "Wait a moment and try again, or contact support if the issue persists",
      severity: "high",
      category: "calculation",
    },
    CALC_DATABASE_ERROR: {
      code: "CALC_DATABASE_ERROR",
      message: "Database error during calculation",
      userMessage: "We're experiencing technical difficulties. Your data is safe.",
      recovery: "Please try again in a few moments",
      supportUrl: "/dashboard/support",
      severity: "high",
      category: "calculation",
    },

    // Validation Errors
    VALIDATION_RULES_LOAD_FAILED: {
      code: "VALIDATION_RULES_LOAD_FAILED",
      message: "Failed to load JTR validation rules",
      userMessage: "Unable to validate your claim against current regulations.",
      recovery: "Your claim can still be submitted, but manual verification is recommended",
      severity: "medium",
      category: "validation",
    },
    VALIDATION_AI_EXPLANATION_FAILED: {
      code: "VALIDATION_AI_EXPLANATION_FAILED",
      message: "AI explanation service unavailable",
      userMessage: "AI explanations are temporarily unavailable.",
      recovery: "Validation results are still available without AI explanations",
      severity: "low",
      category: "validation",
    },

    // Document Errors
    DOC_UPLOAD_FAILED: {
      code: "DOC_UPLOAD_FAILED",
      message: "Document upload failed",
      userMessage: "Failed to upload your document. Please try again.",
      recovery: "Check your internet connection and file size (max 10MB)",
      severity: "medium",
      category: "document",
    },
    DOC_OCR_FAILED: {
      code: "DOC_OCR_FAILED",
      message: "OCR processing failed",
      userMessage: "Unable to read text from your document. You can still add it manually.",
      recovery: "Try uploading a clearer image or enter the information manually",
      severity: "low",
      category: "document",
    },
    DOC_STORAGE_QUOTA_EXCEEDED: {
      code: "DOC_STORAGE_QUOTA_EXCEEDED",
      message: "Storage quota exceeded",
      userMessage: "You've reached your document storage limit.",
      recovery: "Delete some old documents or upgrade your plan",
      supportUrl: "/dashboard/upgrade",
      severity: "medium",
      category: "document",
    },

    // Export Errors
    EXPORT_PDF_FAILED: {
      code: "EXPORT_PDF_FAILED",
      message: "PDF generation failed",
      userMessage: "Unable to generate PDF. Please try again.",
      recovery: "Check that all required data is present and try again",
      severity: "medium",
      category: "export",
    },
    EXPORT_EXCEL_FAILED: {
      code: "EXPORT_EXCEL_FAILED",
      message: "Excel generation failed",
      userMessage: "Unable to generate Excel file. Please try again.",
      recovery: "Check that all required data is present and try again",
      severity: "medium",
      category: "export",
    },
    EXPORT_LARGE_DATASET: {
      code: "EXPORT_LARGE_DATASET",
      message: "Dataset too large for export",
      userMessage: "Your claim has too much data for export. Try exporting in smaller sections.",
      recovery: "Split your claim into smaller parts or contact support for assistance",
      supportUrl: "/dashboard/support",
      severity: "medium",
      category: "export",
    },

    // Network Errors
    NETWORK_TIMEOUT: {
      code: "NETWORK_TIMEOUT",
      message: "Network request timed out",
      userMessage: "Request timed out. Please check your connection and try again.",
      recovery: "Check your internet connection and try again",
      severity: "medium",
      category: "network",
    },
    NETWORK_OFFLINE: {
      code: "NETWORK_OFFLINE",
      message: "No internet connection",
      userMessage: "You appear to be offline. Some features may not work.",
      recovery: "Check your internet connection and refresh the page",
      severity: "high",
      category: "network",
    },

    // Authentication Errors
    AUTH_EXPIRED: {
      code: "AUTH_EXPIRED",
      message: "Authentication expired",
      userMessage: "Your session has expired. Please sign in again.",
      recovery: "Sign in again to continue",
      severity: "medium",
      category: "auth",
    },
    AUTH_INSUFFICIENT_PERMISSIONS: {
      code: "AUTH_INSUFFICIENT_PERMISSIONS",
      message: "Insufficient permissions",
      userMessage: "You don't have permission to access this feature.",
      recovery: "Upgrade your plan or contact support",
      supportUrl: "/dashboard/upgrade",
      severity: "high",
      category: "auth",
    },

    // Data Errors
    DATA_CORRUPTED: {
      code: "DATA_CORRUPTED",
      message: "Data corruption detected",
      userMessage: "We detected an issue with your data. Your information is safe.",
      recovery: "Refresh the page or contact support if the issue persists",
      supportUrl: "/dashboard/support",
      severity: "critical",
      category: "data",
    },
    DATA_SYNC_FAILED: {
      code: "DATA_SYNC_FAILED",
      message: "Data synchronization failed",
      userMessage: "Unable to sync your data. Changes may not be saved.",
      recovery: "Check your connection and try saving again",
      severity: "high",
      category: "data",
    },
  };

  /**
   * Handle and format errors for user display
   */
  static handleError(error: any, context?: string): PCSError {
    // Log the original error
    logger.error("PCS Error occurred", {
      error: error.message || error,
      context,
      stack: error.stack,
    });

    // Try to identify the error type
    const errorCode = this.identifyErrorCode(error);
    const pcsError = this.errorMap[errorCode] || this.getGenericError(error);

    // Add context if provided
    if (context) {
      pcsError.userMessage = `${pcsError.userMessage} (${context})`;
    }

    return pcsError;
  }

  /**
   * Identify error code from error object
   */
  private static identifyErrorCode(error: any): string {
    const message = error.message?.toLowerCase() || "";
    const code = error.code || "";

    // Network errors
    if (message.includes("timeout") || code === "TIMEOUT") return "NETWORK_TIMEOUT";
    if (message.includes("offline") || !navigator.onLine) return "NETWORK_OFFLINE";
    if (message.includes("network") || code === "NETWORK_ERROR") return "NETWORK_TIMEOUT";

    // Authentication errors
    if (message.includes("unauthorized") || code === "UNAUTHORIZED") return "AUTH_EXPIRED";
    if (message.includes("forbidden") || code === "FORBIDDEN")
      return "AUTH_INSUFFICIENT_PERMISSIONS";
    if (message.includes("token") && message.includes("expired")) return "AUTH_EXPIRED";

    // Database errors
    if (message.includes("database") || message.includes("connection"))
      return "CALC_DATABASE_ERROR";
    if (message.includes("corrupt") || message.includes("invalid data")) return "DATA_CORRUPTED";

    // Document errors
    if (message.includes("upload") && message.includes("failed")) return "DOC_UPLOAD_FAILED";
    if (message.includes("ocr") || message.includes("vision")) return "DOC_OCR_FAILED";
    if (message.includes("quota") || message.includes("storage"))
      return "DOC_STORAGE_QUOTA_EXCEEDED";

    // Export errors
    if (message.includes("pdf") && message.includes("failed")) return "EXPORT_PDF_FAILED";
    if (message.includes("excel") && message.includes("failed")) return "EXPORT_EXCEL_FAILED";
    if (message.includes("too large") || message.includes("dataset")) return "EXPORT_LARGE_DATASET";

    // Validation errors
    if (message.includes("validation") && message.includes("rules"))
      return "VALIDATION_RULES_LOAD_FAILED";
    if (message.includes("ai") && message.includes("explanation"))
      return "VALIDATION_AI_EXPLANATION_FAILED";

    // Calculation errors
    if (message.includes("missing") && message.includes("data")) return "CALC_MISSING_DATA";
    if (message.includes("invalid") && message.includes("rate")) return "CALC_INVALID_RATES";

    // Default to generic error
    return "GENERIC_ERROR";
  }

  /**
   * Get generic error for unknown errors
   */
  private static getGenericError(error: any): PCSError {
    return {
      code: "GENERIC_ERROR",
      message: error.message || "Unknown error occurred",
      userMessage:
        "Something went wrong. Please try again or contact support if the issue persists.",
      recovery: "Refresh the page and try again",
      supportUrl: "/dashboard/support",
      severity: "medium",
      category: "network",
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: any, context?: string): string {
    const pcsError = this.handleError(error, context);
    return pcsError.userMessage;
  }

  /**
   * Get recovery suggestion
   */
  static getRecoverySuggestion(error: any, context?: string): string | undefined {
    const pcsError = this.handleError(error, context);
    return pcsError.recovery;
  }

  /**
   * Get support URL if available
   */
  static getSupportUrl(error: any, context?: string): string | undefined {
    const pcsError = this.handleError(error, context);
    return pcsError.supportUrl;
  }

  /**
   * Check if error is critical
   */
  static isCritical(error: any, context?: string): boolean {
    const pcsError = this.handleError(error, context);
    return pcsError.severity === "critical";
  }

  /**
   * Get error severity
   */
  static getSeverity(error: any, context?: string): "low" | "medium" | "high" | "critical" {
    const pcsError = this.handleError(error, context);
    return pcsError.severity;
  }
}

/**
 * React hook for error handling
 */
export function usePCSErrorHandler() {
  const handleError = (error: any, context?: string) => {
    return PCSErrorHandler.handleError(error, context);
  };

  const showUserError = (error: any, context?: string) => {
    const pcsError = PCSErrorHandler.handleError(error, context);
    return {
      message: pcsError.userMessage,
      recovery: pcsError.recovery,
      supportUrl: pcsError.supportUrl,
      severity: pcsError.severity,
    };
  };

  return {
    handleError,
    showUserError,
  };
}
