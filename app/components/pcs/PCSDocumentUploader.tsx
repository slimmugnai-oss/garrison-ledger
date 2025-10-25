"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

import Icon from "@/app/components/ui/Icon";

interface PCSDocumentUploaderProps {
  claimId: string;
  onDocumentProcessed?: (document: any) => void;
  className?: string;
}

interface DocumentStatus {
  id: string;
  fileName: string;
  documentType: string;
  ocrStatus: 'processing' | 'completed' | 'needs_review' | 'failed';
  confidence: {
    score: number;
    level: string;
    requiresReview: boolean;
  };
  processingTime: number | null;
  extractedData: any;
  normalizedData: any;
  lastUpdated: string;
}

export default function PCSDocumentUploader({ 
  claimId, 
  onDocumentProcessed,
  className = "" 
}: PCSDocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'orders', label: 'PCS Orders', icon: 'File' },
    { value: 'weigh_ticket', label: 'Weigh Ticket', icon: 'Scale' },
    { value: 'lodging_receipt', label: 'Lodging Receipt', icon: 'Home' },
    { value: 'fuel_receipt', label: 'Fuel Receipt', icon: 'Fuel' },
    { value: 'meal_receipt', label: 'Meal Receipt', icon: 'Utensils' },
    { value: 'other', label: 'Other Document', icon: 'FileText' }
  ];

  const pollDocumentStatus = async (documentId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/pcs/document-status/${documentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();
        const doc = data.document;

        // Update document in state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  ocrStatus: doc.ocrStatus,
                  extractedData: doc.normalizedData,
                  normalizedData: doc.normalizedData,
                  lastUpdated: doc.updatedAt,
                  confidence: doc.normalizedData?.ocr_confidence
                    ? {
                        score: doc.normalizedData.ocr_confidence,
                        level: doc.normalizedData.ocr_confidence_level || 'unknown',
                        requiresReview: doc.normalizedData.requires_manual_review || false,
                      }
                    : d.confidence,
                }
              : d
          )
        );

        // Check if processing is complete
        if (doc.ocrStatus === 'completed' || doc.ocrStatus === 'needs_review') {
          toast.success(
            doc.ocrStatus === 'completed'
              ? `Document processed successfully (${doc.normalizedData?.ocr_confidence || 0}% confidence)`
              : 'Document processed but needs review'
          );
          
          // Call callback if provided
          if (onDocumentProcessed && doc.normalizedData) {
            onDocumentProcessed({
              id: documentId,
              normalizedData: doc.normalizedData,
            });
          }
          return;
        }

        if (doc.ocrStatus === 'failed') {
          toast.error('Document processing failed. Please try uploading again.');
          return;
        }

        // Continue polling if still processing
        if (doc.ocrStatus === 'processing' && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000); // Poll every second
        } else if (attempts >= maxAttempts) {
          toast.warning('Document is still processing. Check back in a moment.');
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000); // Retry with longer interval
        }
      }
    };

    // Start polling
    poll();
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const documentType = (document.getElementById('document-type') as HTMLSelectElement)?.value || 'other';

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    await uploadDocument(file, documentType);
  };

  const uploadDocument = async (file: File, documentType: string) => {
    setUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload document
      const response = await fetch('/api/pcs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          documentType,
          fileName: file.name,
          fileData: base64,
          contentType: file.type
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      toast.success('Document uploaded successfully! OCR processing started...');
      
      // Add to documents list
      const newDocument: DocumentStatus = {
        id: result.document.id,
        fileName: result.document.fileName,
        documentType: result.document.documentType,
        ocrStatus: 'processing',
        confidence: { score: 0, level: 'unknown', requiresReview: false },
        processingTime: null,
        extractedData: null,
        normalizedData: null,
        lastUpdated: new Date().toISOString()
      };

      setDocuments(prev => [...prev, newDocument]);

      // Start polling for status updates
      pollDocumentStatus(result.document.id);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return 'Loader';
      case 'completed': return 'CheckCircle';
      case 'needs_review': return 'AlertTriangle';
      case 'failed': return 'XCircle';
      default: return 'File';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'needs_review': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <Icon name="Upload" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload PCS Documents
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        
        {/* Document Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            id="document-type"
            className="w-full max-w-xs mx-auto block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Icon name="Loader" className="animate-spin h-4 w-4 mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Icon name="Upload" className="h-4 w-4 mr-2" />
              Choose Files
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <p className="text-xs text-gray-500 mt-2">
          Supported: JPEG, PNG, WebP, PDF (max 10MB)
        </p>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getStatusIcon(doc.ocrStatus)} 
                  className={`h-5 w-5 ${getStatusColor(doc.ocrStatus)} ${
                    doc.ocrStatus === 'processing' ? 'animate-spin' : ''
                  }`} 
                />
                <div>
                  <p className="font-medium text-gray-900">{doc.fileName}</p>
                  <p className="text-sm text-gray-600">
                    {doc.documentType.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {doc.ocrStatus === 'completed' && (
                  <div className="text-sm">
                    <span className={`font-medium ${getConfidenceColor(doc.confidence.score)}`}>
                      {doc.confidence.score}% confidence
                    </span>
                    {doc.confidence.requiresReview && (
                      <p className="text-xs text-yellow-600">Needs review</p>
                    )}
                  </div>
                )}
                {doc.ocrStatus === 'processing' && (
                  <p className="text-sm text-blue-600">Processing...</p>
                )}
                {doc.ocrStatus === 'failed' && (
                  <p className="text-sm text-red-600">Failed</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
