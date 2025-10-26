"use client";

import { useState, useTransition } from "react";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import { FormData } from "@/lib/pcs/calculation-engine";

// Define local types for optimistic UI
interface PCSClaimData extends FormData {
  id?: string;
  status?: string;
}

interface PCSClaim {
  id: string;
  claim_name: string;
  status: string;
  total_entitlements?: number;
}

/**
 * Optimistic UI for PCS claim creation
 */
export function PCSOptimisticClaimCard({
  claimData,
  onCancel,
}: {
  claimData: PCSClaimData;
  onCancel: () => void;
}) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Loader" className="h-4 w-4 animate-spin text-blue-600" />
            <span className="font-medium text-blue-900">Creating claim...</span>
          </div>
          <Badge variant="info">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <strong>From:</strong> {claimData.origin_base || "Not specified"}
          </div>
          <div>
            <strong>To:</strong> {claimData.destination_base || "Not specified"}
          </div>
          <div>
            <strong>Move Type:</strong> {claimData.travel_method || "Not specified"}
          </div>
          <div>
            <strong>Distance:</strong>{" "}
            {claimData.malt_distance ? `${claimData.malt_distance} miles` : "Calculating..."}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-blue-300 text-blue-600 hover:bg-blue-100"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Optimistic UI for document upload
 */
export function PCSOptimisticDocumentCard({
  fileName,
  fileSize,
  onCancel,
}: {
  fileName: string;
  fileSize: number;
  onCancel: () => void;
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center space-x-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <Icon name="Loader" className="h-5 w-5 animate-spin text-blue-600" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-blue-900">{fileName}</p>
        <p className="text-xs text-blue-600">{formatFileSize(fileSize)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="info" className="text-xs">
          Uploading...
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-blue-600 hover:bg-blue-100"
        >
          <Icon name="X" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Optimistic UI for calculation updates
 */
export function PCSOptimisticCalculationCard({
  calculationType,
  estimatedValue,
}: {
  calculationType: string;
  estimatedValue?: number;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="Loader" className="h-4 w-4 animate-spin text-amber-600" />
          <span className="font-medium text-amber-900">Recalculating {calculationType}...</span>
        </div>
        {estimatedValue && (
          <div className="text-sm text-amber-800">
            <strong>Estimated:</strong> ${estimatedValue.toLocaleString()}
          </div>
        )}
        <div className="mt-1 text-xs text-amber-600">Using latest 2025 rates and regulations</div>
      </CardContent>
    </Card>
  );
}

/**
 * Optimistic UI for validation
 */
export function PCSOptimisticValidationCard({ validationType }: { validationType: string }) {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="Loader" className="h-4 w-4 animate-spin text-purple-600" />
          <span className="font-medium text-purple-900">Validating {validationType}...</span>
        </div>
        <div className="text-sm text-purple-800">
          Checking against JTR regulations and requirements
        </div>
        <div className="mt-1 text-xs text-purple-600">AI-powered validation in progress</div>
      </CardContent>
    </Card>
  );
}

/**
 * Optimistic UI for export operations
 */
export function PCSOptimisticExportCard({
  exportType,
  onCancel,
}: {
  exportType: "PDF" | "Excel" | "Summary";
  onCancel: () => void;
}) {
  const getExportIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return "File";
      case "Excel":
        return "BarChart";
      case "Summary":
        return "Printer";
      default:
        return "Download";
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Loader" className="h-4 w-4 animate-spin text-green-600" />
            <span className="font-medium text-green-900">Generating {exportType}...</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-green-600 hover:bg-green-100"
          >
            <Icon name="X" className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-green-800">
          <Icon name={getExportIcon(exportType)} className="mr-1 inline h-4 w-4" />
          Preparing your claim package with all documents and calculations
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Optimistic UI for status updates
 */
export function PCSOptimisticStatusUpdate({
  status,
  message,
}: {
  status: "success" | "error" | "info";
  message: string;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "CheckCircle";
      case "error":
        return "XCircle";
      case "info":
        return "Info";
      default:
        return "Info";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${getStatusColor(status)}`}>
      <div className="flex items-center gap-2">
        <Icon name={getStatusIcon(status)} className="h-4 w-4" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

/**
 * Optimistic UI for form auto-save
 */
export function PCSOptimisticAutoSave({
  isSaving,
  lastSaved,
}: {
  isSaving: boolean;
  lastSaved?: Date;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {isSaving ? (
        <>
          <Icon name="Loader" className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Icon name="CheckCircle" className="h-3 w-3 text-green-600" />
          <span>Saved {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : (
        <>
          <Icon name="Timer" className="h-3 w-3" />
          <span>Not saved</span>
        </>
      )}
    </div>
  );
}

/**
 * Optimistic UI for search operations
 */
export function PCSOptimisticSearchResults({
  query,
  resultCount,
}: {
  query: string;
  resultCount: number;
}) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon name="Search" className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-900">Searching for "{query}"...</span>
      </div>
      <div className="text-sm text-blue-800">Found {resultCount} potential matches</div>
    </div>
  );
}

/**
 * Optimistic UI for data synchronization
 */
export function PCSOptimisticSyncStatus({
  isSyncing,
  lastSync,
}: {
  isSyncing: boolean;
  lastSync?: Date;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {isSyncing ? (
        <>
          <Icon name="Loader" className="h-3 w-3 animate-spin" />
          <span>Syncing data...</span>
        </>
      ) : lastSync ? (
        <>
          <Icon name="CheckCircle" className="h-3 w-3 text-green-600" />
          <span>Last sync: {lastSync.toLocaleTimeString()}</span>
        </>
      ) : (
        <>
          <Icon name="RefreshCw" className="h-3 w-3" />
          <span>Ready to sync</span>
        </>
      )}
    </div>
  );
}
