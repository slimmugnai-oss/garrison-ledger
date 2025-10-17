'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface BinderDocument {
  id: string;
  category: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  expires_at?: string;
}

interface BinderStats {
  totalDocuments: number;
  categories: string[];
  expiringDocuments: number;
  storageUsed: number;
}

interface BinderPreviewProps {
  userId: string;
}

export default function BinderPreview({ userId }: BinderPreviewProps) {
  const [documents, setDocuments] = useState<BinderDocument[]>([]);
  const [stats, setStats] = useState<BinderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBinderData();
  }, [userId]);

  const fetchBinderData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/binder/documents');
      if (response.ok) {
        const data = await response.json();
        const docs = data.documents || [];
        setDocuments(docs.slice(0, 5)); // Show 5 most recent

        // Calculate stats
        const totalDocs = docs.length;
        const categories = [...new Set(docs.map((d: BinderDocument) => d.category))];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiring = docs.filter((d: BinderDocument) => 
          d.expires_at && new Date(d.expires_at) < thirtyDaysFromNow
        ).length;
        const storage = docs.reduce((sum: number, d: BinderDocument) => sum + d.file_size, 0);

        setStats({
          totalDocuments: totalDocs,
          categories: categories as string[],
          expiringDocuments: expiring,
          storageUsed: storage
        });
      }
    } catch (error) {
      console.error('Error fetching binder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Orders': 'File',
      'LES': 'DollarSign',
      'Medical': 'HeartPulse',
      'Insurance': 'Shield',
      'Housing': 'Home',
      'Education': 'GraduationCap',
      'Other': 'Folder'
    };
    return icons[category] || 'File';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Orders': 'text-blue-600',
      'LES': 'text-green-600',
      'Medical': 'text-red-600',
      'Insurance': 'text-purple-600',
      'Housing': 'text-indigo-600',
      'Education': 'text-orange-600',
      'Other': 'text-gray-600'
    };
    return colors[category] || 'text-gray-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <AnimatedCard className="bg-card border border-border p-8" delay={250}>
        <div className="animate-pulse">
          <div className="h-8 bg-surface-hover rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-hover rounded"></div>
            ))}
          </div>
        </div>
      </AnimatedCard>
    );
  }

  if (!stats || stats.totalDocuments === 0) {
    return (
      <AnimatedCard className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-8" delay={250}>
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FolderOpen" className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">Your Digital Binder is Empty</h3>
          <p className="text-body mb-6">
            Store important military documents like orders, LES, insurance policies, and medical records securely
          </p>
          <Link
            href="/dashboard/binder"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
          >
            <Icon name="Upload" className="h-4 w-4" />
            Upload Documents
          </Link>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="bg-card border border-border" delay={250}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Icon name="FolderOpen" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black text-text-headings">My Binder</h2>
              <p className="text-sm text-text-body">
                {stats.totalDocuments} {stats.totalDocuments === 1 ? 'document' : 'documents'} across {stats.categories.length} {stats.categories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/binder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            View All
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{stats.totalDocuments}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{stats.categories.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{formatFileSize(stats.storageUsed)}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Storage</div>
          </div>
        </div>

        {/* Expiring Documents Alert */}
        {stats.expiringDocuments > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <Icon name="AlertTriangle" className="h-4 w-4 text-amber-600" />
              <span className="font-semibold">{stats.expiringDocuments} {stats.expiringDocuments === 1 ? 'document expires' : 'documents expire'} in next 30 days</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Documents */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Recent Documents</h3>
        <div className="space-y-2">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href="/dashboard/binder"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon 
                  name={getCategoryIcon(doc.category)} 
                  className={`h-5 w-5 flex-shrink-0 ${getCategoryColor(doc.category)}`} 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {doc.file_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {doc.category} • {formatFileSize(doc.file_size)}
                  </div>
                </div>
              </div>
              <Icon name="ChevronRight" className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Upload New */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/binder"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg font-semibold transition-all"
          >
            <Icon name="Upload" className="h-4 w-4" />
            Upload New Document
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
}

