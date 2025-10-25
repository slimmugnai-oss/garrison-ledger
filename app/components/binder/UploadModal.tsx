'use client';

import { useState, useRef } from 'react';

import Icon from '../ui/Icon';

interface Folder {
  name: string;
  icon: 'Target' | 'Truck' | 'DollarSign' | 'House' | 'Shield';
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
  initialFolder = 'Personal Records',
  storageLimit,
  storageUsed,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState(initialFolder);
  const [uploadDocType, setUploadDocType] = useState('other');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    
    if (file.size > storageLimit - storageUsed) {
      alert(
        `Storage limit exceeded. You need ${formatFileSize(file.size - (storageLimit - storageUsed))} more space.`
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
      setUploadExpiryDate('');
      setUploadDocType('other');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-2xl border border-[#2A2F3E] max-w-2xl w-full shadow-2xl animate-slideInUp">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2F3E] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Document</h2>
            <p className="text-sm text-muted mt-1">
              Add a new file to your secure binder
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-colors"
          >
            <Icon name="X" className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive
                ? 'border-[#00E5A0] bg-[#00E5A0]/10'
                : 'border-[#2A2F3E] hover:border-[#3A3F4E]'
            }`}
          >
            <div className="text-center">
              <div className={`inline-block p-4 rounded-full mb-4 ${
                dragActive ? 'bg-[#00E5A0]/20' : 'bg-[#2A2F3E]'
              }`}>
                <Icon name="Upload" className={`w-8 h-8 ${
                  dragActive ? 'text-[#00E5A0]' : 'text-gray-400'
                }`} />
              </div>
              <p className="text-muted mb-2">
                {dragActive ? 'Drop file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-muted mb-4">or</p>
              <label className="cursor-pointer inline-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="px-6 py-2.5 bg-[#2A2F3E] text-white rounded-lg hover:bg-[#3A3F4E] transition-colors font-medium inline-block">
                  Choose File
                </span>
              </label>
              
              {uploadFile && (
                <div className="mt-4 p-3 bg-[#0A0F1E] rounded-lg border border-[#2A2F3E]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="File" className="w-5 h-5 text-[#00E5A0]" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{uploadFile.name}</p>
                        <p className="text-xs text-muted">{formatFileSize(uploadFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="p-1.5 hover:bg-[#2A2F3E] rounded-lg transition-colors"
                    >
                      <Icon name="X" className="w-4 h-4 text-muted" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-disabled">
              Folder
            </label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-2.5 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-white focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0] transition-colors"
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
            <label className="block text-sm font-semibold mb-2 text-disabled">
              Document Type
            </label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-2.5 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-white focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0] transition-colors"
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
            <label className="block text-sm font-semibold mb-2 text-disabled">
              Expiry Date <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={uploadExpiryDate}
              onChange={(e) => setUploadExpiryDate(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-2.5 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-white focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0] transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2A2F3E] flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-6 py-2.5 bg-[#2A2F3E] text-white rounded-lg hover:bg-[#3A3F4E] transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !uploadFile}
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all font-semibold disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Icon name="Upload" className="w-4 h-4" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

