/**
 * TDY UPLOAD ZONE
 * 
 * Drag-drop PDF upload with doc type selection
 */

'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';
import type { DocType } from '@/app/types/tdy';

interface Props {
  tripId: string;
  isPremium: boolean;
  docsCount: number;
  onUploadComplete: () => void;
}

export default function TdyUploadZone({ tripId, isPremium, docsCount, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<DocType>('LODGING');
  const [error, setError] = useState<string | null>(null);

  const canUpload = isPremium || docsCount < 3;
  const remainingUploads = isPremium ? '∞' : (3 - docsCount);

  const handleFileSelect = async (file: File) => {
    if (!canUpload) {
      alert('Free tier limit: 3 receipts per trip. Upgrade for unlimited.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('tripId', tripId);
      formData.append('docType', docType);
      formData.append('file', file);

      const response = await fetch('/api/tdy/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (!result.parsedOk) {
        setError(result.error || 'Could not parse PDF. Use Manual Entry.');
      } else {
        onUploadComplete();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Receipts</h3>
        <Badge variant={canUpload ? 'success' : 'warning'}>
          {remainingUploads} uploads remaining
        </Badge>
      </div>

      {/* Doc Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ORDERS">Orders</option>
          <option value="LODGING">Lodging (Hotel)</option>
          <option value="MEALS">Meals</option>
          <option value="MILEAGE">Mileage</option>
          <option value="MISC">Misc (Parking, Tolls, etc.)</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Upload Zone */}
      <label className={`block border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        canUpload && !uploading
          ? 'border-gray-300 hover:border-blue-500 cursor-pointer'
          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
      }`}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          disabled={!canUpload || uploading}
        />

        {uploading ? (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Uploading & Parsing...</p>
          </>
        ) : (
          <>
            <Icon name="Upload" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-1">
              {canUpload ? 'Click to upload or drag PDF here' : 'Upgrade to upload more'}
            </p>
            <p className="text-sm text-gray-600">
              PDF only, 10MB max
            </p>
          </>
        )}
      </label>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isPremium && docsCount >= 2 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm text-yellow-800 mb-2">
            📊 You've used {docsCount}/3 free uploads
          </p>
          <a
            href="/dashboard/upgrade?feature=tdy-copilot"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Upgrade for unlimited →
          </a>
        </div>
      )}
    </div>
  );
}

