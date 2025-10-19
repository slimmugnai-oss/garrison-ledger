/**
 * QUICK START PROFILE
 * 
 * Simplified onboarding - only 5 essential fields
 * Get users to tools faster, collect details later
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';

const RANKS = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'W-1', 'W-2', 'W-3', 'W-4', 'W-5', 'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'CIV', 'CTR'];

const SERVICE_STATUSES = [
  { value: 'active_duty', label: 'Active Duty' },
  { value: 'reserve', label: 'Reserve' },
  { value: 'national_guard', label: 'National Guard' },
  { value: 'military_spouse', label: 'Military Spouse' },
  { value: 'veteran', label: 'Veteran' },
  { value: 'dod_civilian', label: 'DoD Civilian' },
  { value: 'contractor', label: 'Government Contractor' },
  { value: 'other', label: 'Other' }
];

export default function QuickStartProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only 5 essential fields
  const [rank, setRank] = useState('');
  const [branch, setBranch] = useState('');
  const [currentBase, setCurrentBase] = useState('');
  const [hasDependents, setHasDependents] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('active_duty');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/quick-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rank,
          branch,
          current_base: currentBase,
          has_dependents: hasDependents,
          service_status: serviceStatus,
          profile_completed: true
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save profile');
      }

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSaving(false);
    }
  };

  const isValid = rank && branch && currentBase;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 font-lora mb-3">
            Welcome to Garrison Ledger
          </h1>
          <p className="text-lg text-gray-600">
            Answer 5 quick questions to unlock your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          
          {/* 1. Service Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Service Status <span className="text-red-600">*</span>
            </label>
            <select
              value={serviceStatus}
              onChange={(e) => setServiceStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              required
            >
              {SERVICE_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Branch <span className="text-red-600">*</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              required
            >
              <option value="">Select...</option>
              <option value="Army">Army</option>
              <option value="Navy">Navy</option>
              <option value="Air Force">Air Force</option>
              <option value="Marine Corps">Marine Corps</option>
              <option value="Space Force">Space Force</option>
              <option value="Coast Guard">Coast Guard</option>
            </select>
          </div>

          {/* 3. Rank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Paygrade <span className="text-red-600">*</span>
            </label>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              required
            >
              <option value="">Select...</option>
              {RANKS.map(r => (
                <option key={r} value={r}>
                  {r === 'CIV' ? 'GS/Civilian' : r === 'CTR' ? 'Contractor' : r}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Current Base */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4. Current Base (City, State or ZIP) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={currentBase}
              onChange={(e) => setCurrentBase(e.target.value)}
              placeholder="Fort Liberty, NC or 28310"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for BAH lookup and location-based features
            </p>
          </div>

          {/* 5. Dependents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              5. Do you have dependents? <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setHasDependents(false)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium border-2 transition-colors ${
                  !hasDependents
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                No Dependents
              </button>
              <button
                type="button"
                onClick={() => setHasDependents(true)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium border-2 transition-colors ${
                  hasDependents
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                Have Dependents
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Affects BAH rate (with dependents = higher rate)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || saving}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {saving ? 'Saving...' : 'Complete Setup →'}
          </button>

          {/* Skip Link */}
          <p className="text-center text-sm text-gray-600">
            You can add more details later in Settings
          </p>
        </form>

        {/* Why We Ask */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Icon name="Info" className="w-5 h-5" />
            Why We Ask These 5 Questions
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Rank:</strong> Determines your BAH/BAS rates for pay verification</li>
            <li><strong>Branch:</strong> Branch-specific guidance and resources</li>
            <li><strong>Base:</strong> Local BAH rates, COLA, base-specific intel</li>
            <li><strong>Dependents:</strong> BAH "with dependents" vs "without" (different rates)</li>
            <li><strong>Status:</strong> Active duty vs reserve (affects entitlements)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
