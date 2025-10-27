"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

import Icon from "../ui/Icon";

interface Folder {
  name: string;
  icon: "Target" | "Truck" | "DollarSign" | "House" | "Shield";
  color: string;
}

interface DocType {
  value: string;
  label: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, folder: string, docType: string, expiryDate: string) => Promise<void>;
  folders: Folder[];
  docTypes: DocType[];
  initialFolder?: string;
  storageLimit: number;
  storageUsed: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  folders,
  docTypes,
  initialFolder = "Personal Records",
  storageLimit,
  storageUsed,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState(initialFolder);
  const [uploadDocType, setUploadDocType] = useState("other");
  const [uploadExpiryDate, setUploadExpiryDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (file.size > storageLimit - storageUsed) {
      toast.error(
        `Storage limit exceeded. You need ${formatFileSize(file.size - (storageLimit - storageUsed))} more space. Upgrade to Premium for more storage.`
      );
      return;
    }

    setUploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!uploadFile) return;

    setUploading(true);
    try {
      await onUpload(uploadFile, uploadFolder, uploadDocType, uploadExpiryDate);
      // Reset form
      setUploadFile(null);
      setUploadExpiryDate("");
      setUploadDocType("other");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-slideInUp rounded-2xl border border-[#2A2F3E] bg-gradient-to-br from-[#1A1F2E] to-[#141824] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2F3E] p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Document</h2>
            <p className="mt-1 text-sm text-muted">Add a new file to your secure binder</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-2 transition-colors hover:bg-[#2A2F3E]"
          >
            <Icon name="X" className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-8 transition-all ${
              dragActive
                ? "border-[#00E5A0] bg-[#00E5A0]/10"
                : "border-[#2A2F3E] hover:border-[#3A3F4E]"
            }`}
          >
            <div className="text-center">
              <div
                className={`mb-4 inline-block rounded-full p-4 ${
                  dragActive ? "bg-[#00E5A0]/20" : "bg-[#2A2F3E]"
                }`}
              >
                <Icon
                  name="Upload"
                  className={`h-8 w-8 ${dragActive ? "text-[#00E5A0]" : "text-gray-400"}`}
                />
              </div>
              <p className="mb-2 text-muted">
                {dragActive ? "Drop file here" : "Drag and drop your file here"}
              </p>
              <p className="mb-4 text-sm text-muted">or</p>
              <label className="inline-block cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="inline-block rounded-lg bg-[#2A2F3E] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E]">
                  Choose File
                </span>
              </label>

              {uploadFile && (
                <div className="mt-4 rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="File" className="h-5 w-5 text-[#00E5A0]" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{uploadFile.name}</p>
                        <p className="text-xs text-muted">{formatFileSize(uploadFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="rounded-lg p-1.5 transition-colors hover:bg-[#2A2F3E]"
                    >
                      <Icon name="X" className="h-4 w-4 text-muted" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Folder Selection */}
          <div>
            <label className="text-disabled mb-2 block text-sm font-semibold">Folder</label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              disabled={uploading}
              className="w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
            >
              {folders.map((folder) => (
                <option key={folder.name} value={folder.name}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div>
            <label className="text-disabled mb-2 block text-sm font-semibold">Document Type</label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              disabled={uploading}
              className="w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
            >
              {docTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-disabled mb-2 block text-sm font-semibold">
              Expiry Date <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="date"
              value={uploadExpiryDate}
              onChange={(e) => setUploadExpiryDate(e.target.value)}
              disabled={uploading}
              className="w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors [color-scheme:dark] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#2A2F3E] p-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 rounded-lg bg-[#2A2F3E] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !uploadFile}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] px-6 py-2.5 font-semibold text-[#0A0F1E] transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E]" />
                Uploading...
              </>
            ) : (
              <>
                <Icon name="Upload" className="h-4 w-4" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
