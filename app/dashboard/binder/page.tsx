"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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
  { name: "Legal", icon: "Shield" as const, color: "#EF4444" }
];

const DOC_TYPES = [
  { value: "orders", label: "Orders" },
  { value: "poa", label: "Power of Attorney" },
  { value: "birth_cert", label: "Birth Certificate" },
  { value: "lease", label: "Lease" },
  { value: "deed", label: "Deed" },
  { value: "tax_return", label: "Tax Return" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" }
];

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

function BinderContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<BinderFile[]>([]);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<BinderFile | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [uploadFolder, setUploadFolder] = useState("Personal Records");
  const [uploadDocType, setUploadDocType] = useState("other");
  const [uploadExpiryDate, setUploadExpiryDate] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const target = searchParams.get("target");
    if (target) {
      const decodedFolder = decodeURIComponent(target);
      if (FOLDERS.find((f) => f.name === decodedFolder)) {
        setSelectedFolder(decodedFolder);
        setUploadFolder(decodedFolder);
        setShowUploadModal(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadFiles();
  }, [selectedFolder]);

  async function loadFiles() {
    try {
      const url =
        selectedFolder === "all"
          ? "/api/binder/list"
          : `/api/binder/list?folder=${encodeURIComponent(selectedFolder)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setFiles(data.files || []);
        setStorage(data.storage);
        setFolderCounts(data.folderCounts || {});
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);

    if (!storage) return;

    if (file.size > storage.limit - storage.used) {
      alert(
        `Storage limit exceeded. You need ${formatFileSize(file.size - (storage.limit - storage.used))} more space. ${storage.isPremium ? "" : "Upgrade to Premium for 10 GB storage."}`
      );
      return;
    }
  }

  async function handleUpload() {
    if (!uploadFile || !storage) return;

    setUploading(true);

    try {
      // Get upload URL
      const uploadResponse = await fetch("/api/binder/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: uploadFolder,
          displayName: uploadFile.name,
          contentType: uploadFile.type,
          sizeBytes: uploadFile.size,
          docType: uploadDocType,
          expiresOn: uploadExpiryDate || null
        })
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        alert(uploadData.error || "Failed to prepare upload");
        return;
      }

      // Upload file to Supabase Storage
      const storageResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: uploadFile,
        headers: {
          "Content-Type": uploadFile.type,
          "x-upsert": "false"
        }
      });

      if (!storageResponse.ok) {
        alert("Failed to upload file");
        return;
      }

      setShowUploadModal(false);
      setUploadFile(null);
      setUploadExpiryDate("");
      setUploadFolder("Personal Records");
      setUploadDocType("other");
      loadFiles();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRename() {
    if (!selectedFile || !newName) return;

    try {
      const response = await fetch("/api/binder/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedFile.id, newName })
      });

      if (response.ok) {
        setShowRenameModal(false);
        setNewName("");
        loadFiles();
      }
    } catch (error) {
      console.error("Rename error:", error);
    }
  }

  async function handleMove() {
    if (!selectedFile || !newFolder) return;

    try {
      const response = await fetch("/api/binder/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedFile.id, newFolder })
      });

      if (response.ok) {
        setShowMoveModal(false);
        setNewFolder("");
        loadFiles();
      }
    } catch (error) {
      console.error("Move error:", error);
    }
  }

  async function handleSetExpiry() {
    if (!selectedFile) return;

    try {
      const response = await fetch("/api/binder/set-expiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          expiresOn: expiryDate || null
        })
      });

      if (response.ok) {
        setShowExpiryModal(false);
        setExpiryDate("");
        loadFiles();
      }
    } catch (error) {
      console.error("Set expiry error:", error);
    }
  }

  async function handleDelete(file: BinderFile) {
    if (!confirm(`Delete "${file.display_name}"?`)) return;

    try {
      const response = await fetch("/api/binder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id })
      });

      if (response.ok) {
        loadFiles();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  async function handleCreateShare() {
    if (!selectedFile) return;

    if (!storage?.isPremium) {
      alert("Sharing requires a Premium subscription");
      return;
    }

    try {
      const response = await fetch("/api/binder/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: selectedFile.id })
      });

      const data = await response.json();

      if (response.ok) {
        setShareUrl(data.share.url);
      } else {
        alert(data.error || "Failed to create share link");
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  }

  function openPreview(file: BinderFile) {
    setSelectedFile(file);
    setShowPreviewModal(true);
  }

  const filteredFiles =
    selectedFolder === "all"
      ? files
      : files.filter((f) => f.folder === selectedFolder);

  const storagePercent = storage
    ? Math.round((storage.used / storage.limit) * 100)
    : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0A0F1E] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Binder</h1>
            <p className="text-gray-400">
              Secure storage for your important military documents
            </p>
          </div>

          {/* Storage Bar */}
          {storage && (
            <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Storage Used</span>
                <span className="text-sm font-medium">
                  {formatFileSize(storage.used)} / {formatFileSize(storage.limit)}
                  {!storage.isPremium && (
                    <a
                      href="/dashboard/billing"
                      className="ml-2 text-[#00E5A0] hover:underline"
                    >
                      Upgrade
                    </a>
                  )}
                </span>
              </div>
              <div className="w-full bg-[#2A2F3E] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    storagePercent > 90
                      ? "bg-red-500"
                      : storagePercent > 70
                      ? "bg-yellow-500"
                      : "bg-[#00E5A0]"
                  }`}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full mb-4 px-4 py-3 bg-[#00E5A0] text-[#0A0F1E] rounded-lg font-medium hover:bg-[#00CC8E] transition-colors flex items-center justify-center"
                >
                  <Icon name="Plus" className="w-5 h-5 mr-2" />
                  Upload
                </button>

                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedFolder("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedFolder === "all"
                        ? "bg-[#2A2F3E] text-white"
                        : "text-gray-200 hover:bg-[#2A2F3E]/50"
                    }`}
                  >
                    <span className="flex items-center">
                      <Icon name="Folder" className="w-4 h-4 mr-2" />
                      All Files
                    </span>
                    <span className="text-xs text-gray-300">{files.length}</span>
                  </button>

                  {FOLDERS.map((folder) => (
                    <button
                      key={folder.name}
                      onClick={() => setSelectedFolder(folder.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedFolder === folder.name
                          ? "bg-[#2A2F3E] text-white"
                          : "text-gray-200 hover:bg-[#2A2F3E]/50"
                      }`}
                    >
                      <span className="flex items-center">
                        <span style={{ color: folder.color }}>
                          <Icon
                            name={folder.icon}
                            className="w-4 h-4 mr-2"
                          />
                        </span>
                        {folder.name}
                      </span>
                      <span className="text-xs text-gray-300">
                        {folderCounts[folder.name] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00E5A0] border-r-transparent"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-12 text-center">
                  <Icon name="Folder" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-100">No files yet</h3>
                  <p className="text-gray-300 mb-4">
                    Upload your first document to get started
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg font-medium hover:bg-[#00CC8E] transition-colors"
                  >
                    Upload File
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => {
                    const isExpiringSoon =
                      file.expires_on &&
                      new Date(file.expires_on) <
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                    return (
                      <div
                        key={file.id}
                        className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] p-4 hover:border-[#3A3F4E] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => openPreview(file)}
                            className="flex items-center flex-1 min-w-0 text-left"
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-[#2A2F3E] rounded-lg flex items-center justify-center mr-3">
                              <Icon
                                name={
                                  file.content_type.startsWith("image/")
                                    ? "Image"
                                    : file.content_type === "application/pdf"
                                    ? "File"
                                    : "File"
                                }
                                className="w-5 h-5 text-[#00E5A0]"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate text-gray-100">
                                {file.display_name}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-gray-300">
                                <span>{formatFileSize(file.size_bytes)}</span>
                                <span>•</span>
                                <span>{formatDate(file.created_at)}</span>
                                {file.expires_on && (
                                  <>
                                    <span>•</span>
                                    <span
                                      className={
                                        isExpiringSoon ? "text-yellow-500" : ""
                                      }
                                    >
                                      Expires{" "}
                                      {new Date(file.expires_on).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setNewName(file.display_name);
                                setShowRenameModal(true);
                              }}
                              className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-colors"
                              title="Rename"
                            >
                              <Icon name="Edit" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setNewFolder(file.folder);
                                setShowMoveModal(true);
                              }}
                              className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-colors"
                              title="Move"
                            >
                              <Icon name="Folder" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setExpiryDate(file.expires_on || "");
                                setShowExpiryModal(true);
                              }}
                              className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-colors"
                              title="Set Expiry"
                            >
                              <Icon name="Calendar" className="w-4 h-4" />
                            </button>
                            {storage?.isPremium && (
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShareUrl("");
                                  setShowShareModal(true);
                                }}
                                className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-colors"
                                title="Share"
                              >
                                <Icon name="Share2" className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(file)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                              title="Delete"
                            >
                              <Icon name="Trash2" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-gray-100"
                >
                  {FOLDERS.map((folder) => (
                    <option key={folder.name} value={folder.name}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Document Type
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-gray-100"
                >
                  {DOC_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={uploadExpiryDate}
                  onChange={(e) => setUploadExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-gray-100"
                />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00E5A0] file:text-[#0A0F1E] hover:file:bg-[#00CC8E]"
                />
                {uploadFile && (
                  <div className="mt-2 text-sm text-gray-300">
                    Selected: {uploadFile.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-[#2A2F3E] text-gray-100 rounded-lg hover:bg-[#3A3F4E] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadFile}
                className="flex-1 px-4 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg hover:bg-[#00CC8E] transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {uploading && (
              <div className="mt-4 text-center text-sm text-gray-300">
                Uploading...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#2A2F3E] flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedFile.display_name}</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-[#2A2F3E] rounded-lg"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {selectedFile.content_type === "application/pdf" && (
                <iframe
                  src={selectedFile.signedUrl || ""}
                  className="w-full h-[600px] rounded border border-[#2A2F3E]"
                />
              )}
              {selectedFile.content_type.startsWith("image/") && (
                <img
                  src={selectedFile.signedUrl || ""}
                  alt={selectedFile.display_name}
                  className="max-w-full h-auto mx-auto rounded"
                />
              )}
              {!selectedFile.content_type.startsWith("image/") &&
                selectedFile.content_type !== "application/pdf" && (
                  <div className="text-center py-12 text-gray-400">
                    <p>Preview not available for this file type</p>
                    <a
                      href={selectedFile.signedUrl || ""}
                      download={selectedFile.display_name}
                      className="mt-4 inline-block px-6 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg font-medium hover:bg-[#00CC8E]"
                    >
                      Download
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Rename File</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg mb-4"
              placeholder="New name"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 px-4 py-2 bg-[#2A2F3E] rounded-lg hover:bg-[#3A3F4E]"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="flex-1 px-4 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg hover:bg-[#00CC8E]"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMoveModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Move File</h2>
            <select
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg mb-4"
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
                className="flex-1 px-4 py-2 bg-[#2A2F3E] rounded-lg hover:bg-[#3A3F4E]"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                className="flex-1 px-4 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg hover:bg-[#00CC8E]"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Modal */}
      {showExpiryModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Set Expiry Date</h2>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowExpiryModal(false)}
                className="flex-1 px-4 py-2 bg-[#2A2F3E] rounded-lg hover:bg-[#3A3F4E]"
              >
                Cancel
              </button>
              <button
                onClick={handleSetExpiry}
                className="flex-1 px-4 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg hover:bg-[#00CC8E]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F2E] rounded-lg border border-[#2A2F3E] max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Share File</h2>
            {shareUrl ? (
              <>
                <p className="text-sm text-gray-400 mb-2">
                  Share this link with others:
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-[#0A0F1E] border border-[#2A2F3E] rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-[#2A2F3E] rounded-lg hover:bg-[#3A3F4E]"
                  >
                    Copy
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 mb-4">
                Create a secure share link for this file
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-[#2A2F3E] rounded-lg hover:bg-[#3A3F4E]"
              >
                Close
              </button>
              {!shareUrl && (
                <button
                  onClick={handleCreateShare}
                  className="flex-1 px-4 py-2 bg-[#00E5A0] text-[#0A0F1E] rounded-lg hover:bg-[#00CC8E]"
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00E5A0] border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <BinderContent />
    </Suspense>
  );
}

