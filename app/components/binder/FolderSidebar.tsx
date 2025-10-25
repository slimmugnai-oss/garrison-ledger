'use client';

import { useState } from 'react';

import Icon from '../ui/Icon';

interface Folder {
  name: string;
  icon: 'Target' | 'Truck' | 'DollarSign' | 'House' | 'Shield';
  color: string;
}

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  onUpload: () => void;
  folderCounts: Record<string, number>;
  totalFiles: number;
}

export default function FolderSidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  onUpload,
  folderCounts,
  totalFiles,
}: FolderSidebarProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const FolderList = () => (
    <>
      <button
        onClick={onUpload}
        className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center group"
      >
        <Icon name="Plus" className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
        Upload Document
      </button>

      <div className="space-y-1">
        <button
          onClick={() => {
            onFolderSelect('all');
            setMobileDrawerOpen(false);
          }}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
            selectedFolder === 'all'
              ? 'bg-gradient-to-r from-[#2A2F3E] to-[#252937] text-white shadow-md'
              : 'text-gray-300 hover:bg-[#2A2F3E]/50 hover:text-white'
          }`}
        >
          <span className="flex items-center font-medium">
            <Icon name="Folder" className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            All Files
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            selectedFolder === 'all'
              ? 'bg-[#00E5A0]/20 text-[#00E5A0]'
              : 'bg-[#2A2F3E] text-gray-400'
          }`}>
            {totalFiles}
          </span>
        </button>

        {folders.map((folder) => (
          <button
            key={folder.name}
            onClick={() => {
              onFolderSelect(folder.name);
              setMobileDrawerOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
              selectedFolder === folder.name
                ? 'bg-gradient-to-r from-[#2A2F3E] to-[#252937] text-white shadow-md'
                : 'text-gray-300 hover:bg-[#2A2F3E]/50 hover:text-white'
            }`}
          >
            <span className="flex items-center font-medium">
              <span style={{ color: selectedFolder === folder.name ? folder.color : 'currentColor' }}>
                <Icon
                  name={folder.icon}
                  className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                />
              </span>
              <span className="truncate">{folder.name}</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedFolder === folder.name
                ? 'bg-[#00E5A0]/20 text-[#00E5A0]'
                : 'bg-[#2A2F3E] text-gray-400'
            }`}>
              {folderCounts[folder.name] || 0}
            </span>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="bg-[#1A1F2E] rounded-xl border border-[#2A2F3E] p-4 shadow-lg sticky top-24">
          <FolderList />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-full p-4 shadow-2xl hover:shadow-[#00E5A0]/50 transition-all hover:scale-110 flex items-center gap-2"
        >
          <Icon name="Folder" className="w-6 h-6" />
          {selectedFolder !== 'all' && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
              1
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#0A0F1E] border-r border-[#2A2F3E] z-50 animate-slideInLeft shadow-2xl">
            <div className="h-full overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Folders</h2>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 hover:bg-[#2A2F3E] rounded-lg transition-colors"
                >
                  <Icon name="X" className="w-5 h-5" />
                </button>
              </div>
              <FolderList />
            </div>
          </div>
        </>
      )}
    </>
  );
}

