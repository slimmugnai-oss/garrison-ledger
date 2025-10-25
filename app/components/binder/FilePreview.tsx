'use client';

import Image from 'next/image';

import Icon from '../ui/Icon';

interface BinderFile {
  id: string;
  display_name: string;
  folder: string;
  doc_type: string;
  size_bytes: number;
  content_type: string;
  expires_on: string | null;
  created_at: string;
  signedUrl: string | null;
}

interface FilePreviewProps {
  file: BinderFile | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  if (!isOpen || !file) return null;

  const canPreview =
    file.content_type.startsWith('image/') ||
    file.content_type === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-2xl border border-[#2A2F3E] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2F3E] flex items-center justify-between bg-[#1A1F2E]/50 backdrop-blur">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{file.display_name}</h2>
            <div className="flex items-center gap-3 text-sm text-muted mt-1">
              <span>{formatFileSize(file.size_bytes)}</span>
              <span>•</span>
              <span className="capitalize">{file.doc_type.replace('_', ' ')}</span>
              <span>•</span>
              <span className="capitalize">{file.folder}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {file.signedUrl && (
              <a
                href={file.signedUrl}
                download={file.display_name}
                className="p-2.5 bg-[#2A2F3E] hover:bg-[#3A3F4E] rounded-lg transition-all hover:scale-105"
                title="Download"
              >
                <Icon name="Download" className="w-5 h-5 text-[#00E5A0]" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-[#2A2F3E] rounded-lg transition-colors"
            >
              <Icon name="X" className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          {file.content_type === 'application/pdf' && file.signedUrl && (
            <iframe
              src={file.signedUrl}
              className="w-full h-full min-h-[600px] rounded-lg border border-[#2A2F3E] bg-surface"
              title={file.display_name}
            />
          )}
          
          {file.content_type.startsWith('image/') && file.signedUrl && (
            <div className="flex items-center justify-center relative min-h-[400px]">
              <Image
                src={file.signedUrl}
                alt={file.display_name}
                width={1200}
                height={800}
                className="max-w-full h-auto rounded-lg shadow-2xl object-contain"
                style={{ maxHeight: '70vh' }}
                priority
              />
            </div>
          )}

          {!canPreview && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-[#2A2F3E] p-6 rounded-full mb-6">
                <Icon name="File" className="w-12 h-12 text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Preview Not Available
              </h3>
              <p className="text-muted mb-6 max-w-md">
                This file type cannot be previewed in the browser. Download it to view the contents.
              </p>
              {file.signedUrl && (
                <a
                  href={file.signedUrl}
                  download={file.display_name}
                  className="px-6 py-3 bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Icon name="Download" className="w-5 h-5" />
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

