"use client";

import Icon from "../ui/Icon";

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

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
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
    file.expires_on && new Date(file.expires_on) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const isExpired = file.expires_on && new Date(file.expires_on) < new Date();

  const getFileIcon = () => {
    if (file.content_type.startsWith("image/")) return "Image";
    if (file.content_type === "application/pdf") return "File";
    return "File";
  };

  return (
    <div
      className={`group rounded-xl border bg-gradient-to-br from-[#1A1F2E] to-[#151924] transition-all ${
        isSelected
          ? "border-[#00E5A0] shadow-lg shadow-[#00E5A0]/20"
          : "border-[#2A2F3E] hover:border-[#3A3F4E] hover:shadow-lg"
      } p-4`}
    >
      <div className="flex items-center justify-between">
        {/* File Info */}
        <div className="flex min-w-0 flex-1 items-center">
          {/* Selection Checkbox */}
          {selectionMode && onSelect && (
            <button
              onClick={() => onSelect(file)}
              className="mr-3 flex-shrink-0"
              aria-label={
                isSelected ? `Deselect ${file.display_name}` : `Select ${file.display_name}`
              }
              role="checkbox"
              aria-checked={isSelected}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                  isSelected
                    ? "border-[#00E5A0] bg-[#00E5A0]"
                    : "border-gray-400 hover:border-[#00E5A0]"
                }`}
              >
                {isSelected && <Icon name="Check" className="h-3 w-3 text-[#0A0F1E]" />}
              </div>
            </button>
          )}

          {/* File Icon */}
          <button
            onClick={() => !selectionMode && onPreview(file)}
            className="flex min-w-0 flex-1 items-center text-left transition-transform group-hover:scale-[1.01]"
            aria-label={`Open ${file.display_name}`}
            tabIndex={0}
          >
            <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2A2F3E] to-[#1F2433] transition-all group-hover:shadow-lg">
              <Icon
                name={getFileIcon()}
                className="h-6 w-6 text-[#00E5A0] transition-transform group-hover:scale-110"
              />
            </div>

            {/* File Details */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-white transition-colors group-hover:text-[#00E5A0]">
                {file.display_name}
              </h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                <span className="font-medium">{formatFileSize(file.size_bytes)}</span>
                <span>•</span>
                <span>{formatDate(file.created_at)}</span>
                {file.expires_on && (
                  <>
                    <span>•</span>
                    <span
                      className={`font-medium ${
                        isExpired
                          ? "text-red-400"
                          : isExpiringSoon
                            ? "text-yellow-400"
                            : "text-gray-400"
                      }`}
                    >
                      {isExpired
                        ? "⚠️ Expired"
                        : `Expires ${new Date(file.expires_on).toLocaleDateString()}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        {!selectionMode && (
          <div className="ml-4 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onRename(file)}
              className="rounded-lg p-2 transition-all hover:scale-110 hover:bg-[#2A2F3E]"
              title="Rename file"
              aria-label={`Rename ${file.display_name}`}
            >
              <Icon name="Edit" className="h-4 w-4 text-muted hover:text-white" />
            </button>
            <button
              onClick={() => onMove(file)}
              className="rounded-lg p-2 transition-all hover:scale-110 hover:bg-[#2A2F3E]"
              title="Move to folder"
              aria-label={`Move ${file.display_name} to another folder`}
            >
              <Icon name="Folder" className="h-4 w-4 text-muted hover:text-white" />
            </button>
            <button
              onClick={() => onSetExpiry(file)}
              className="rounded-lg p-2 transition-all hover:scale-110 hover:bg-[#2A2F3E]"
              title="Set expiry date"
              aria-label={`Set expiry date for ${file.display_name}`}
            >
              <Icon name="Calendar" className="h-4 w-4 text-muted hover:text-white" />
            </button>
            {isPremium && onShare && (
              <button
                onClick={() => onShare(file)}
                className="rounded-lg p-2 transition-all hover:scale-110 hover:bg-[#2A2F3E]"
                title="Create share link"
                aria-label={`Share ${file.display_name}`}
              >
                <Icon name="Share2" className="h-4 w-4 text-muted hover:text-white" />
              </button>
            )}
            <button
              onClick={() => onDelete(file)}
              className="hover:bg-danger/20 rounded-lg p-2 text-red-400 transition-all hover:scale-110"
              title="Delete file"
              aria-label={`Delete ${file.display_name}`}
            >
              <Icon name="Trash2" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
