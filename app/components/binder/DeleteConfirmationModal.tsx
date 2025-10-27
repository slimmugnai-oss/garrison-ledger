"use client";

import Icon from "../ui/Icon";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  fileName: string;
  fileCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  fileName,
  fileCount,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const isMultiple = fileCount && fileCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-slideInUp rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#1A1F2E] to-[#141824] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#2A2F3E] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <Icon name="AlertTriangle" className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
            <p className="text-sm text-muted">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-4 text-white">
            {isMultiple ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-400">{fileCount} files</span>?
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-400">&quot;{fileName}&quot;</span>?
              </>
            )}
          </p>

          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-300">
                {isMultiple
                  ? "All selected files will be permanently removed from your Binder and cannot be recovered."
                  : "This file will be permanently removed from your Binder and cannot be recovered."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#2A2F3E] p-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-[#2A2F3E] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-6 py-2.5 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/50"
          >
            <Icon name="Trash2" className="h-4 w-4" />
            {isMultiple ? `Delete ${fileCount} Files` : "Delete File"}
          </button>
        </div>
      </div>
    </div>
  );
}
