'use client';

interface StorageBarProps {
  used: number;
  limit: number;
  isPremium: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function StorageBar({ used, limit, isPremium: _isPremium }: StorageBarProps) {
  const storagePercent = Math.round((used / limit) * 100);
  
  // Determine tier based on limit
  // Limits defined in /api/binder/list/route.ts
  const FREE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB
  const PREMIUM_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
  
  let tierLabel = '1 GB Free Storage';
  let upgradeText = 'Upgrade to Premium for 5 GB →';
  
  if (limit >= PREMIUM_LIMIT) {
    tierLabel = '5 GB Premium Storage';
    upgradeText = '';
  }

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-xl border border-[#2A2F3E] p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-muted">Storage Used</span>
          <p className="text-xs text-muted mt-0.5">
            {tierLabel}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-white">
            {formatFileSize(used)}
          </span>
          <span className="text-sm text-muted"> / {formatFileSize(limit)}</span>
          {upgradeText && (
            <a
              href="/dashboard/upgrade"
              className="block mt-1 text-xs text-[#00E5A0] hover:text-[#00CC8E] font-medium transition-colors"
            >
              {upgradeText}
            </a>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative w-full bg-[#0A0F1E] rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-3 rounded-full transition-all duration-500 relative overflow-hidden ${
            storagePercent > 90
              ? 'bg-gradient-to-r from-slate-600 to-slate-500'
              : storagePercent > 70
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
              : 'bg-gradient-to-r from-[#00E5A0] to-[#00CC8E]'
          }`}
          style={{ width: `${Math.min(storagePercent, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* Storage Warning */}
      {storagePercent > 80 && (
        <div className={`mt-3 text-xs flex items-center gap-2 ${
          storagePercent > 90 ? 'text-red-400' : 'text-yellow-400'
        }`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            {storagePercent > 90
              ? 'Storage almost full! Delete files or upgrade.'
              : 'Storage getting low. Consider upgrading.'}
          </span>
        </div>
      )}
    </div>
  );
}

