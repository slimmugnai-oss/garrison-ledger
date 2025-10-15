'use client';

import Icon from '../ui/Icon';

interface BinderEmptyStateProps {
  folderName: string;
  onUpload: () => void;
}

export default function BinderEmptyState({ folderName, onUpload }: BinderEmptyStateProps) {
  const isAllFiles = folderName === 'all';

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-2xl border border-[#2A2F3E] p-12 text-center shadow-lg">
      <div className="inline-block p-6 bg-gradient-to-br from-[#2A2F3E] to-[#1F2433] rounded-2xl mb-6 shadow-inner">
        <Icon name="Folder" className="w-16 h-16 text-gray-400" />
      </div>
      
      <h3 className="text-2xl font-bold mb-3 text-white">
        {isAllFiles ? 'Your Binder is Empty' : `No Files in ${folderName}`}
      </h3>
      
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        {isAllFiles
          ? 'Start organizing your important military documents. Upload your first file to get started.'
          : `You haven't added any files to ${folderName} yet. Upload documents to keep them organized.`}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onUpload}
          className="px-6 py-3 bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Icon name="Plus" className="w-5 h-5" />
          Upload File
        </button>
        
        {isAllFiles && (
          <a
            href="/resources/pcs-hub"
            className="px-6 py-3 bg-[#2A2F3E] text-white rounded-lg font-medium hover:bg-[#3A3F4E] transition-colors"
          >
            Learn More
          </a>
        )}
      </div>

      {/* Helpful Tips */}
      <div className="mt-8 pt-8 border-t border-[#2A2F3E] text-left max-w-2xl mx-auto">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">💡 Quick Tips:</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
            <span>Upload PCS orders, birth certificates, insurance docs, and more</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
            <span>Set expiration dates to get reminders before documents expire</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
            <span>Organize files into folders for easy access when you need them</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

