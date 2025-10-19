'use client';

import { useState } from 'react';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';
import LesUpload from '@/app/components/les/LesUpload';
import LesHistory from '@/app/components/les/LesHistory';
import Icon from '@/app/components/ui/Icon';

interface Props {
  tier: string;
  isPremium: boolean;
  hasProfile: boolean;
  profile: {
    paygrade?: string;
    duty_station?: string;
    dependents?: number;
    years_of_service?: number;
  };
  recentUploads: Array<{
    id: string;
    month: number;
    year: number;
    uploaded_at: string;
    parsed_ok: boolean;
  }>;
  monthlyUploadsCount: number;
}

export default function PaycheckAuditClient({
  tier,
  isPremium,
  hasProfile,
  profile,
  recentUploads,
  monthlyUploadsCount
}: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Paycheck Audit"
        description="Upload your LES and instantly detect pay discrepancies. Verify BAH, BAS, COLA, and special pays."
        badge={<Badge variant="warning">Beta</Badge>}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Warning */}
        {!hasProfile && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Profile Required</h3>
                <p className="text-sm text-amber-800 mt-1">
                  Complete your profile (paygrade, duty station, dependents) to run pay audits.
                </p>
                <Link
                  href="/dashboard/profile/setup"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-amber-900 hover:text-amber-700"
                >
                  Complete Profile
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tier Status Banner */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Shield" className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold">
                  {tier === 'free' ? 'Starter Tier' : 'Premium Tier'}
                </h3>
                <p className="text-sm text-gray-600">
                  {tier === 'free' 
                    ? `1 LES upload per month (${monthlyUploadsCount}/1 used this month)` 
                    : 'Unlimited LES uploads'}
                </p>
              </div>
            </div>
            {tier === 'free' && (
              <Link
                href="/dashboard/upgrade?feature=paycheck-audit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Upgrade for Unlimited
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon name="Upload" className="h-4 w-4" />
                Upload LES
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon name="History" className="h-4 w-4" />
                History ({recentUploads.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'upload' ? (
          <LesUpload
            tier={tier}
            isPremium={isPremium}
            hasProfile={hasProfile}
            monthlyUploadsCount={monthlyUploadsCount}
          />
        ) : (
          <LesHistory
            tier={tier}
            isPremium={isPremium}
            uploads={recentUploads}
          />
        )}

        {/* Help Section */}
        <div className="mt-8 rounded-lg border bg-blue-50 border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Upload your LES PDF (downloaded from MyPay)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>We parse and verify BAH, BAS, COLA, and special pays</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Get instant flags for discrepancies with actionable next steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Copy pre-written email templates to send to finance</span>
            </li>
          </ol>
          <p className="mt-4 text-xs text-blue-700">
            <Icon name="AlertCircle" className="inline h-3 w-3 mr-1" />
            Estimates &amp; guidance only. Verify all findings with your finance office before taking action.
          </p>
        </div>
      </div>
    </div>
  );
}

