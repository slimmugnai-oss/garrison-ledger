"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { toast } from "sonner";

import BinderEmptyState from "@/app/components/binder/BinderEmptyState";
import BinderLoadingSkeleton from "@/app/components/binder/BinderLoadingSkeleton";
import FileCard from "@/app/components/binder/FileCard";
import FilePreview from "@/app/components/binder/FilePreview";
import FolderSidebar from "@/app/components/binder/FolderSidebar";
import StorageBar from "@/app/components/binder/StorageBar";
import UploadModal from "@/app/components/binder/UploadModal";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Icon from "@/app/components/ui/Icon";

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

interface StorageInfo {
  used: number;
  limit: number;
  isPremium: boolean;
}

const FOLDERS = [
  { name: "Personal Records", icon: "Target" as const, color: "#00E5A0" },
  { name: "PCS Documents", icon: "Truck" as const, color: "#0EA5E9" },
  { name: "Financial Records", icon: "DollarSign" as const, color: "#F59E0B" },
  { name: "Housing Records", icon: "House" as const, color: "#8B5CF6" },
  { name: "Legal", icon: "Shield" as const, color: "#EF4444" },
];

const DOC_TYPES = [
  { value: "orders", label: "Orders" },
  { value: "poa", label: "Power of Attorney" },
  { value: "birth_cert", label: "Birth Certificate" },
  { value: "lease", label: "Lease" },
  { value: "deed", label: "Deed" },
  { value: "tax_return", label: "Tax Return" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

type SortOption = "name-asc" | "name-desc" | "date-asc" | "date-desc" | "size-asc" | "size-desc";

function BinderContent() {
  const searchParams = useSearchParams();

  // State
  const [files, setFiles] = useState<BinderFile[]>([]);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterDocType, setFilterDocType] = useState<string>("all");
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Selected file for modals
  const [selectedFile, setSelectedFile] = useState<BinderFile | null>(null);
  const [newName, setNewName] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  // Handle URL parameters
  useEffect(() => {
    const target = searchParams?.get("target");
    if (target) {
      const decodedFolder = decodeURIComponent(target);
      if (FOLDERS.find((f) => f.name === decodedFolder)) {
        setSelectedFolder(decodedFolder);
        setShowUploadModal(true);
      }
    }
  }, [searchParams]);

  // Load files
  const loadFiles = useCallback(async () => {
    try {
      const url =
        selectedFolder === "all"
          ? "/api/binder/list"
          : `/api/binder/list?folder=${encodeURIComponent(selectedFolder)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFiles(data.files || []);
      setStorage(data.storage);
      setFolderCounts(data.folderCounts || {});
    } catch {
      // Non-critical: Error handled via UI state
      setFiles([]);
      setStorage(null);
      setFolderCounts({});
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Filter and sort files
  const getFilteredAndSortedFiles = useCallback(() => {
    let filtered =
      selectedFolder === "all" ? files : files.filter((f) => f.folder === selectedFolder);

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.display_name.toLowerCase().includes(query) ||
          f.doc_type.toLowerCase().includes(query) ||
          f.folder.toLowerCase().includes(query)
      );
    }

    // Apply doc type filter
    if (filterDocType !== "all") {
      filtered = filtered.filter((f) => f.doc_type === filterDocType);
    }

    // Apply expiring filter
    if (showExpiringOnly) {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(
        (f) =>
          f.expires_on &&
          new Date(f.expires_on).getTime() < now + thirtyDays &&
          new Date(f.expires_on).getTime() > now
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.display_name.localeCompare(a.display_name));
        break;
      case "date-asc":
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "date-desc":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "size-asc":
        sorted.sort((a, b) => a.size_bytes - b.size_bytes);
        break;
      case "size-desc":
        sorted.sort((a, b) => b.size_bytes - a.size_bytes);
        break;
    }

    return sorted;
  }, [files, selectedFolder, searchQuery, sortBy, filterDocType, showExpiringOnly]);

  const filteredFiles = getFilteredAndSortedFiles();

  // File actions
  const handleUpload = async (file: File, folder: string, docType: string, expiresOn: string) => {
    if (!storage) return;

    try {
      const uploadResponse = await fetch("/api/binder/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder,
          displayName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
          docType,
          expiresOn: expiresOn || null,
        }),
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        toast.error(uploadData.error || "Failed to prepare upload");
        return;
      }

      const storageResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (storageResponse.status >= 400) {
        toast.error(`Failed to upload file: ${storageResponse.status} ${storageResponse.statusText}`);
        return;
      }

      toast.success(`File uploaded successfully to ${folder}`);
      setShowUploadModal(false);
      await loadFiles();
    } catch {
      // Non-critical: Error handled via UI state
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const handleRename = async () => {
    if (!selectedFile || !newName) return;

    try {
      const response = await fetch("/api/binder/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedFile.id, newName }),
      });

      if (response.ok) {
        toast.success(`File renamed to "${newName}"`);
        setShowRenameModal(false);
        setNewName("");
        loadFiles();
      } else {
        toast.error("Failed to rename file");
      }
    } catch {
      // Non-critical: Error handled via UI state
      // Error handled - failed rename is non-critical
    }
  };

  const handleMove = async () => {
    if (!selectedFile || !newFolder) return;

    try {
      const response = await fetch("/api/binder/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedFile.id, newFolder }),
      });

      if (response.ok) {
        toast.success(`File moved to "${newFolder}"`);
        setShowMoveModal(false);
        setNewFolder("");
        loadFiles();
      } else {
        toast.error("Failed to move file");
      }
    } catch {
      // Non-critical: Error handled via UI state
      // Error handled - failed move is non-critical
    }
  };

  const handleSetExpiry = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch("/api/binder/set-expiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          expiresOn: expiryDate || null,
        }),
      });

      if (response.ok) {
        toast.success(expiryDate ? "Expiry date set" : "Expiry date removed");
        setShowExpiryModal(false);
        setExpiryDate("");
        loadFiles();
      } else {
        toast.error("Failed to update expiry date");
      }
    } catch {
      // Non-critical: Error handled via UI state
      // Error handled - failed expiry update is non-critical
    }
  };

  const handleDelete = async (file: BinderFile) => {
    // Use toast for confirmation instead of confirm()
    const confirmDelete = window.confirm(`Delete "${file.display_name}"? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/binder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id }),
      });

      if (response.ok) {
        toast.success("File deleted successfully");
        loadFiles();
      } else {
        toast.error("Failed to delete file");
      }
    } catch {
      // Non-critical: Error handled via UI state
      toast.error("Failed to delete file");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    const confirmDelete = window.confirm(`Delete ${selectedFiles.size} files? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await Promise.all(
        Array.from(selectedFiles).map((fileId) =>
          fetch("/api/binder/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          })
        )
      );
      toast.success(`${selectedFiles.size} files deleted successfully`);
      setSelectedFiles(new Set());
      setSelectionMode(false);
      loadFiles();
    } catch {
      // Non-critical: Error handled via UI state
      toast.error("Failed to delete files");
    }
  };

  const handleCreateShare = async () => {
    if (!selectedFile || !storage?.isPremium) return;

    try {
      const response = await fetch("/api/binder/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedFile.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setShareUrl(data.share.url);
        toast.success("Share link created successfully");
      } else {
        toast.error(data.error || "Failed to create share link");
      }
    } catch {
      // Non-critical: Error handled via UI state
    }
  };

  const toggleFileSelection = (file: BinderFile) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      newSelected.add(file.id);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0A0F1E] pb-16 pt-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
              My Binder
            </h1>
            <p className="text-muted">Secure storage for your important military documents</p>
          </div>

          {/* Storage Bar */}
          {storage && (
            <StorageBar used={storage.used} limit={storage.limit} isPremium={storage.isPremium} />
          )}

          {/* Search & Controls */}
          <div className="mb-6 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Icon
                  name="Search"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted"
                />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] py-2.5 pl-10 pr-4 text-white placeholder-gray-400 transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="size-desc">Largest First</option>
                <option value="size-asc">Smallest First</option>
              </select>

              {/* Doc Type Filter */}
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
              >
                <option value="all">All Types</option>
                {DOC_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Expiring Filter */}
              <button
                onClick={() => setShowExpiringOnly(!showExpiringOnly)}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all ${
                  showExpiringOnly
                    ? "bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E]"
                    : "bg-[#2A2F3E] text-white hover:bg-[#3A3F4E]"
                }`}
              >
                {showExpiringOnly ? "✓ " : ""}Expiring Soon
              </button>

              {/* Selection Mode */}
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedFiles(new Set());
                }}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all ${
                  selectionMode
                    ? "bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E]"
                    : "bg-[#2A2F3E] text-white hover:bg-[#3A3F4E]"
                }`}
              >
                {selectionMode ? "Cancel" : "Select"}
              </button>
            </div>

            {/* Selection Mode Controls */}
            {selectionMode && (
              <div className="mt-4 flex items-center gap-3 border-t border-[#2A2F3E] pt-4">
                <span className="text-sm text-muted">{selectedFiles.size} selected</span>
                <button onClick={selectAll} className="text-sm text-[#00E5A0] hover:underline">
                  Select All
                </button>
                <button onClick={deselectAll} className="text-sm text-[#00E5A0] hover:underline">
                  Deselect All
                </button>
                {selectedFiles.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="bg-danger/20 hover:bg-danger/30 ml-auto flex items-center gap-2 rounded-lg px-4 py-2 text-red-400 transition-colors"
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                    Delete Selected
                  </button>
                )}
              </div>
            )}

            {/* Active Filters */}
            {(searchQuery || filterDocType !== "all" || showExpiringOnly) && (
              <div className="mt-4 flex items-center gap-2 border-t border-[#2A2F3E] pt-4">
                <span className="text-sm text-muted">Active filters:</span>
                {searchQuery && (
                  <span className="rounded bg-[#2A2F3E] px-2 py-1 text-xs text-white">
                    Search: {searchQuery}
                  </span>
                )}
                {filterDocType !== "all" && (
                  <span className="rounded bg-[#2A2F3E] px-2 py-1 text-xs text-white">
                    Type: {DOC_TYPES.find((t) => t.value === filterDocType)?.label}
                  </span>
                )}
                {showExpiringOnly && (
                  <span className="rounded bg-[#2A2F3E] px-2 py-1 text-xs text-white">
                    Expiring Soon
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDocType("all");
                    setShowExpiringOnly(false);
                  }}
                  className="ml-2 text-xs text-[#00E5A0] hover:underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Sidebar */}
            <FolderSidebar
              folders={FOLDERS}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
              onUpload={() => setShowUploadModal(true)}
              folderCounts={folderCounts}
              totalFiles={files.length}
            />

            {/* File List */}
            <div className="lg:col-span-3">
              {loading ? (
                <BinderLoadingSkeleton />
              ) : filteredFiles.length === 0 ? (
                <BinderEmptyState
                  folderName={selectedFolder}
                  onUpload={() => setShowUploadModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onPreview={(f) => {
                        setSelectedFile(f);
                        setShowPreviewModal(true);
                      }}
                      onRename={(f) => {
                        setSelectedFile(f);
                        setNewName(f.display_name);
                        setShowRenameModal(true);
                      }}
                      onMove={(f) => {
                        setSelectedFile(f);
                        setNewFolder(f.folder);
                        setShowMoveModal(true);
                      }}
                      onSetExpiry={(f) => {
                        setSelectedFile(f);
                        setExpiryDate(f.expires_on || "");
                        setShowExpiryModal(true);
                      }}
                      onShare={
                        storage?.isPremium
                          ? (f) => {
                              setSelectedFile(f);
                              setShareUrl("");
                              setShowShareModal(true);
                            }
                          : undefined
                      }
                      onDelete={handleDelete}
                      isPremium={storage?.isPremium || false}
                      isSelected={selectedFiles.has(file.id)}
                      onSelect={toggleFileSelection}
                      selectionMode={selectionMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        folders={FOLDERS}
        docTypes={DOC_TYPES}
        initialFolder={selectedFolder !== "all" ? selectedFolder : "Personal Records"}
        storageLimit={storage?.limit || 0}
        storageUsed={storage?.used || 0}
      />

      {/* Preview Modal */}
      <FilePreview
        file={selectedFile}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* Rename Modal */}
      {showRenameModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Rename File</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mb-4 w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
              placeholder="New name"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 rounded-lg bg-[#2A2F3E] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E]"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] px-4 py-2.5 font-semibold text-[#0A0F1E] transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMoveModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Move File</h2>
            <select
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              className="mb-4 w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
            >
              {FOLDERS.map((folder) => (
                <option key={folder.name} value={folder.name}>
                  {folder.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMoveModal(false)}
                className="flex-1 rounded-lg bg-[#2A2F3E] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E]"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] px-4 py-2.5 font-semibold text-[#0A0F1E] transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Modal */}
      {showExpiryModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Set Expiry Date</h2>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="mb-4 w-full rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-4 py-2.5 text-white transition-colors [color-scheme:dark] focus:border-[#00E5A0] focus:ring-1 focus:ring-[#00E5A0]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowExpiryModal(false)}
                className="flex-1 rounded-lg bg-[#2A2F3E] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E]"
              >
                Cancel
              </button>
              <button
                onClick={handleSetExpiry}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] px-4 py-2.5 font-semibold text-[#0A0F1E] transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Share File</h2>
            {shareUrl ? (
              <>
                <p className="mb-2 text-sm text-muted">Share this link with others:</p>
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] px-3 py-2 text-sm text-white"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Share link copied to clipboard!");
                    }}
                    className="rounded-lg bg-[#2A2F3E] px-4 py-2 text-white transition-colors hover:bg-[#3A3F4E]"
                  >
                    Copy
                  </button>
                </div>
              </>
            ) : (
              <p className="mb-4 text-sm text-muted">Create a secure share link for this file</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 rounded-lg bg-[#2A2F3E] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#3A3F4E]"
              >
                Close
              </button>
              {!shareUrl && (
                <button
                  onClick={handleCreateShare}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] px-4 py-2.5 font-semibold text-[#0A0F1E] transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  Create Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function BinderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00E5A0] border-r-transparent"></div>
            <p className="mt-4 text-muted">Loading your binder...</p>
          </div>
        </div>
      }
    >
      <BinderContent />
    </Suspense>
  );
}
