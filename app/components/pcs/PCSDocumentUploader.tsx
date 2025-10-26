"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  ocrText?: string;
  extractedData?: {
    amount?: number;
    date?: string;
    vendor?: string;
    category?: string;
  };
  uploadedAt: string;
}

interface PCSDocumentUploaderProps {
  claimId: string;
  onDocumentUploaded?: (document: UploadedDocument) => void;
  onDocumentProcessed?: (document: UploadedDocument) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export default function PCSDocumentUploader({
  claimId,
  onDocumentUploaded,
  onDocumentProcessed,
  maxFiles = 20,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
}: PCSDocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Validate file count
      if (uploadedDocuments.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate file types
      const invalidFiles = fileArray.filter((file) => !acceptedTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast.error(`Invalid file types: ${invalidFiles.map((f) => f.name).join(", ")}`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const progress = ((i + 1) / fileArray.length) * 100;
          setUploadProgress(progress);

          // Upload file to Supabase Storage
          const formData = new FormData();
          formData.append("file", file);
          formData.append("claimId", claimId);

          const response = await fetch("/api/pcs/documents/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const result = await response.json();
          const uploadedDoc: UploadedDocument = {
            id: result.documentId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.url,
            thumbnail: result.thumbnail,
            uploadedAt: new Date().toISOString(),
          };

          setUploadedDocuments((prev) => [...prev, uploadedDoc]);
          onDocumentUploaded?.(uploadedDoc);

          // Process document for OCR
          if (result.needsOCR) {
            const processResponse = await fetch("/api/pcs/documents/process", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                documentId: result.documentId,
                claimId,
              }),
            });

            if (processResponse.ok) {
              const processResult = await processResponse.json();
              const processedDoc = {
                ...uploadedDoc,
                ocrText: processResult.ocrText,
                extractedData: processResult.extractedData,
              };

              setUploadedDocuments((prev) =>
                prev.map((doc) => (doc.id === result.documentId ? processedDoc : doc))
              );
              onDocumentProcessed?.(processedDoc);
            }
          }
        }

        toast.success(`${fileArray.length} document(s) uploaded successfully`);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload documents. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [
      claimId,
      maxFiles,
      acceptedTypes,
      uploadedDocuments.length,
      onDocumentUploaded,
      onDocumentProcessed,
    ]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  const handleRemoveDocument = useCallback(
    async (documentId: string) => {
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

        setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete document");
      }
    },
    [claimId]
  );

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

  return (
    <AnimatedCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Document Upload</h3>
        <p className="text-sm text-slate-600">
          Upload receipts, invoices, and other PCS-related documents
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-slate-900">Uploading...</p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-600">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 p-3">
              <Icon name="Upload" className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-slate-600">
                Supports: JPG, PNG, PDF, WebP (max {maxFiles} files)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900">
              Uploaded Documents ({uploadedDocuments.length})
            </h4>
            <Badge variant="neutral" size="sm">
              {uploadedDocuments.length}/{maxFiles}
            </Badge>
          </div>

          <div className="space-y-3">
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                {/* Thumbnail or Icon */}
                <div className="flex-shrink-0">
                  {doc.thumbnail ? (
                    <img
                      src={doc.thumbnail}
                      alt={doc.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100">
                      <Icon name={getFileIcon(doc.type)} className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Document Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatFileSize(doc.size)}</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    {doc.extractedData?.amount && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-green-600">
                          ${doc.extractedData.amount.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {doc.ocrText ? (
                    <Badge variant="success" size="sm">
                      Processed
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Processing
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => window.open(doc.url, "_blank")}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="View document"
                  >
                    <Icon name="Eye" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Delete document"
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <Icon name="Info" className="mt-0.5 h-4 w-4 text-blue-600" />
          <div className="text-xs text-blue-800">
            <p className="font-medium">Document Tips:</p>
            <ul className="mt-1 space-y-1">
              <li>• Upload clear, well-lit photos of receipts</li>
              <li>• Include all PCS-related expenses (gas, lodging, meals, etc.)</li>
              <li>• Keep original receipts for your records</li>
              <li>• Documents are automatically processed for expense extraction</li>
            </ul>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
