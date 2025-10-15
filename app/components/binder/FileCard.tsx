'use client';

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

interface FileCardProps {
  file: BinderFile;
  onPreview: (file: BinderFile) => void;
  onRename: (file: BinderFile) => void;
  onMove: (file: BinderFile) => void;
  onSetExpiry: (file: BinderFile) => void;
  onShare?: (file: BinderFile) => void;
  onDelete: (file: BinderFile) => void;
  isPremium: boolean;
  isSelected?: boolean;
  onSelect?: (file: BinderFile) => void;
  selectionMode?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function FileCard({
  file,
  onPreview,
  onRename,
  onMove,
  onSetExpiry,
  onShare,
  onDelete,
  isPremium,
  isSelected = false,
  onSelect,
  selectionMode = false,
}: FileCardProps) {
  const isExpiringSoon =
    file.expires_on &&
    new Date(file.expires_on) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const isExpired = file.expires_on && new Date(file.expires_on) < new Date();

  const getFileIcon = () => {
    if (file.content_type.startsWith('image/')) return 'Image';
    if (file.content_type === 'application/pdf') return 'File';
    return 'File';
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#1A1F2E] to-[#151924] rounded-xl border transition-all group ${
        isSelected
          ? 'border-[#00E5A0] shadow-lg shadow-[#00E5A0]/20'
          : 'border-[#2A2F3E] hover:border-[#3A3F4E] hover:shadow-lg'
      } p-4`}
    >
      <div className="flex items-center justify-between">
        {/* File Info */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Selection Checkbox */}
          {selectionMode && onSelect && (
            <button
              onClick={() => onSelect(file)}
              className="flex-shrink-0 mr-3"
            >
              <div
                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#00E5A0] border-[#00E5A0]'
                    : 'border-gray-400 hover:border-[#00E5A0]'
                }`}
              >
                {isSelected && (
                  <Icon name="Check" className="w-3 h-3 text-[#0A0F1E]" />
                )}
              </div>
            </button>
          )}

          {/* File Icon */}
          <button
            onClick={() => !selectionMode && onPreview(file)}
            className="flex items-center flex-1 min-w-0 text-left group-hover:scale-[1.01] transition-transform"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#2A2F3E] to-[#1F2433] rounded-xl flex items-center justify-center mr-3 group-hover:shadow-lg transition-all">
              <Icon
                name={getFileIcon()}
                className="w-6 h-6 text-[#00E5A0] group-hover:scale-110 transition-transform"
              />
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-white group-hover:text-[#00E5A0] transition-colors">
                {file.display_name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="font-medium">{formatFileSize(file.size_bytes)}</span>
                <span>•</span>
                <span>{formatDate(file.created_at)}</span>
                {file.expires_on && (
                  <>
                    <span>•</span>
                    <span
                      className={`font-medium ${
                        isExpired
                          ? 'text-red-400'
                          : isExpiringSoon
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {isExpired ? '⚠️ Expired' : `Expires ${new Date(file.expires_on).toLocaleDateString()}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        {!selectionMode && (
          <div className="flex items-center gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRename(file)}
              className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-all hover:scale-110"
              title="Rename"
            >
              <Icon name="Edit" className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => onMove(file)}
              className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-all hover:scale-110"
              title="Move"
            >
              <Icon name="Folder" className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => onSetExpiry(file)}
              className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-all hover:scale-110"
              title="Set Expiry"
            >
              <Icon name="Calendar" className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            {isPremium && onShare && (
              <button
                onClick={() => onShare(file)}
                className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-all hover:scale-110"
                title="Share"
              >
                <Icon name="Share2" className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
            <button
              onClick={() => onDelete(file)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110 text-red-400"
              title="Delete"
            >
              <Icon name="Trash2" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

