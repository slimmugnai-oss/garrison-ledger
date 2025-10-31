"use client";

/**
 * DOCUMENT UPLOAD COMPONENT FOR ASK MILITARY EXPERT
 *
 * Allows users to upload documents (PCS orders, LES, DD-214, leases, etc.)
 * for intelligent OCR analysis and proactive insights
 */

import { Upload, File, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { useState, useCallback } from "react";

interface DocumentUploadProps {
  onAnalysisComplete?: (result: DocumentAnalysisResult) => void;
}

interface DocumentAnalysisResult {
  documentType: string;
  confidence: number;
  extractedData: Record<string, unknown>;
  insights: string[];
  warnings: string[];
  recommendations: string[];
  detectedIssues: Array<{
    issue: string;
    severity: "low" | "medium" | "high";
    recommendation: string;
  }>;
  suggestedActions: Array<{
    action: string;
    url?: string;
    priority: number;
  }>;
}

export default function DocumentUpload({ onAnalysisComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and image files (JPEG, PNG, WebP) are supported");
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setAnalysisResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ask/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAnalysisResult(data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      {!file && !analysisResult && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-slate-400 bg-white"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-semibold text-slate-700 mb-2">
            Upload Military Document for Analysis
          </p>
          <p className="text-sm text-slate-500 mb-4">
            PCS Orders, LES, DD-214, Lease Contract, or other military documents
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Drag and drop or click to browse • PDF, JPEG, PNG, WebP • Max 10MB
          </p>

          <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors">
            <Upload className="h-5 w-5 mr-2" />
            Choose File
            <input
              type="file"
              className="hidden"
              accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
          </label>

          <p className="text-xs text-slate-500 mt-4">
            🔒 Secure: Files are analyzed in-memory only. No documents stored on our servers.
          </p>
        </div>
      )}

      {/* File Selected - Ready to Upload */}
      {file && !analysisResult && !uploading && (
        <div className="border border-slate-300 rounded-lg p-6 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <File className="h-10 w-10 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={handleUpload}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Analyze Document with AI
          </button>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="border border-blue-300 rounded-lg p-8 bg-blue-50 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="font-semibold text-slate-800 mb-2">Analyzing Your Document...</p>
          <p className="text-sm text-slate-600">
            Using OCR + AI to extract key information and generate insights
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-4">
          {/* Document Type & Confidence */}
          <div className="border border-green-300 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Document Analyzed: {formatDocumentType(analysisResult.documentType)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Confidence: {analysisResult.confidence}%
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload Another
              </button>
            </div>
          </div>

          {/* Critical Warnings */}
          {analysisResult.warnings.length > 0 && (
            <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 mb-2">⚠️ Warnings Detected</p>
                  <ul className="space-y-2">
                    {analysisResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-slate-700">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {analysisResult.insights.length > 0 && (
            <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
              <p className="font-semibold text-slate-800 mb-3">💡 Key Insights</p>
              <ul className="space-y-2">
                {analysisResult.insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-slate-700">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detected Issues */}
          {analysisResult.detectedIssues.length > 0 && (
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <p className="font-semibold text-slate-800 mb-3">🚨 Issues Detected</p>
              <div className="space-y-3">
                {analysisResult.detectedIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      issue.severity === "high"
                        ? "bg-red-50 border border-red-200"
                        : issue.severity === "medium"
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-slate-50 border border-slate-200"
                    }`}
                  >
                    <p className="font-semibold text-sm text-slate-800 mb-1">
                      {issue.severity.toUpperCase()}: {issue.issue}
                    </p>
                    <p className="text-sm text-slate-600">{issue.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <p className="font-semibold text-slate-800 mb-3">✅ Recommendations</p>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Actions */}
          {analysisResult.suggestedActions.length > 0 && (
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <p className="font-semibold text-slate-800 mb-3">🎯 Suggested Actions</p>
              <div className="space-y-2">
                {analysisResult.suggestedActions.map((action, idx) => (
                  <a
                    key={idx}
                    href={action.url || "#"}
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <p className="font-medium text-blue-600 hover:text-blue-700">
                      {action.action} →
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Upload Failed</p>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearFile}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDocumentType(type: string): string {
  const typeMap: Record<string, string> = {
    pcs_orders: "PCS Orders",
    deployment_orders: "Deployment Orders",
    les_paycheck: "Leave & Earnings Statement (LES)",
    dd214: "DD-214 Discharge Paperwork",
    lease_contract: "Lease/Rental Contract",
    car_contract: "Vehicle Purchase Contract",
    marriage_certificate: "Marriage Certificate",
    divorce_decree: "Divorce Decree",
    va_rating_decision: "VA Rating Decision",
    other: "Military Document",
  };

  return typeMap[type] || "Document";
}

