"use client";

import { useState, useEffect } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface Document {
  id: string;
  claim_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_url: string;
  thumbnail_url?: string;
  ocr_text?: string;
  extracted_data?: {
    amount?: number;
    date?: string;
    vendor?: string;
    category?: string;
  };
  upload_status: string;
  processing_status: string;
  created_at: string;
  processed_at?: string;
}

interface PCSDocumentLibraryProps {
  claimId: string;
  onDocumentSelect?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
}

export default function PCSDocumentLibrary({
  claimId,
  onDocumentSelect,
  onDocumentDelete,
}: PCSDocumentLibraryProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "processed" | "pending">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "amount">("date");

  useEffect(() => {
    loadDocuments();
  }, [claimId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pcs/documents/list?claimId=${claimId}`);

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch("/api/pcs/documents/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, claimId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      onDocumentDelete?.(documentId);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "Image";
    if (type === "application/pdf") return "File";
    return "File";
  };

  const getStatusBadge = (document: Document) => {
    if (document.processing_status === "completed") {
      return (
        <Badge variant="success" size="sm">
          Processed
        </Badge>
      );
    } else if (document.processing_status === "processing") {
      return (
        <Badge variant="warning" size="sm">
          Processing
        </Badge>
      );
    } else if (document.processing_status === "failed") {
      return (
        <Badge variant="danger" size="sm">
          Failed
        </Badge>
      );
    } else {
      return (
        <Badge variant="neutral" size="sm">
          Pending
        </Badge>
      );
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "fuel":
        return "Fuel";
      case "lodging":
        return "Bed";
      case "meals":
        return "Utensils";
      case "lodging":
        return "Bed";
      default:
        return "Receipt";
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === "processed") return doc.processing_status === "completed";
    if (filter === "pending") return doc.processing_status !== "completed";
    return true;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.file_name.localeCompare(b.file_name);
      case "amount":
        const aAmount = a.extracted_data?.amount || 0;
        const bAmount = b.extracted_data?.amount || 0;
        return bAmount - aAmount;
      case "date":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalAmount = documents
    .filter((doc) => doc.extracted_data?.amount)
    .reduce((sum, doc) => sum + (doc.extracted_data?.amount || 0), 0);

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="ml-3 text-sm text-slate-600">Loading documents...</span>
        </div>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard className="p-6">
        <div className="py-8 text-center">
          <Icon name="AlertCircle" className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={loadDocuments}
            className="mt-4 text-sm text-blue-600 underline hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Document Library</h3>
            <p className="text-sm text-slate-600">
              {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          {totalAmount > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Extracted</p>
              <p className="text-lg font-semibold text-green-600">${totalAmount.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setFilter("processed")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filter === "processed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Processed ({documents.filter((d) => d.processing_status === "completed").length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pending ({documents.filter((d) => d.processing_status !== "completed").length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "amount")}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {sortedDocuments.length === 0 ? (
        <div className="py-8 text-center">
          <Icon name="File" className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">No documents found</p>
          <p className="text-xs text-slate-500">Upload receipts and invoices to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              {/* Document Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {doc.thumbnail_url ? (
                    <img
                      src={doc.thumbnail_url}
                      alt={doc.file_name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                      <Icon name={getFileIcon(doc.file_type)} className="h-4 w-4 text-slate-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.file_name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(doc.file_size)}</p>
                  </div>
                </div>
                {getStatusBadge(doc)}
              </div>

              {/* Extracted Data */}
              {doc.extracted_data && (
                <div className="mb-3 space-y-1">
                  {doc.extracted_data.amount && (
                    <div className="flex items-center gap-2">
                      <Icon name="DollarSign" className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        ${doc.extracted_data.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {doc.extracted_data.vendor && (
                    <div className="flex items-center gap-2">
                      <Icon name="Building" className="h-3 w-3 text-slate-500" />
                      <span className="truncate text-xs text-slate-600">
                        {doc.extracted_data.vendor}
                      </span>
                    </div>
                  )}
                  {doc.extracted_data.date && (
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-600">
                        {new Date(doc.extracted_data.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {doc.extracted_data.category && (
                    <div className="flex items-center gap-2">
                      <Icon
                        name={getCategoryIcon(doc.extracted_data.category)}
                        className="h-3 w-3 text-slate-500"
                      />
                      <span className="text-xs capitalize text-slate-600">
                        {doc.extracted_data.category}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => window.open(doc.storage_url, "_blank")}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="View document"
                  >
                    <Icon name="Eye" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDocumentSelect?.(doc)}
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="View details"
                  >
                    <Icon name="Info" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Delete document"
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AnimatedCard>
  );
}
