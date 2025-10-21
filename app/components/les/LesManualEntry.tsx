'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import LesFlags from './LesFlags';
import type { LesAuditResponse } from '@/app/types/les';

interface Props {
  tier: string;
  isPremium: boolean;
  hasProfile: boolean;
  monthlyEntriesCount: number;
  userProfile?: {
    rank?: string;
    currentBase?: string;
    hasDependents?: boolean;
  };
}

type EntryState = 'idle' | 'auditing' | 'complete' | 'error' | 'loading';

export default function LesManualEntry({ tier, isPremium: _isPremium, hasProfile, monthlyEntriesCount: _monthlyEntriesCount, userProfile }: Props) {
  const [state, setState] = useState<EntryState>('idle');
  const [auditData, setAuditData] = useState<LesAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form values
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [bah, setBah] = useState('');
  const [bas, setBas] = useState('');
  const [cola, setCola] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  // Auto-populate expected values based on user profile
  useEffect(() => {
    if (hasProfile && userProfile && !autoFilled) {
      setState('loading');
      
      // Fetch expected pay values from our own audit system
      fetch('/api/les/expected-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year,
          rank: userProfile.rank,
          location: userProfile.currentBase,
          hasDependents: userProfile.hasDependents
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.bah) setBah((data.bah / 100).toFixed(2));
        if (data.bas) setBas((data.bas / 100).toFixed(2));
        if (data.cola && data.cola > 0) setCola((data.cola / 100).toFixed(2));
        
        // Check if fallback values were used
        if (data.fallback && data.message) {
          setFallbackMessage(data.message);
        }
        
        setAutoFilled(true);
        setState('idle');
      })
      .catch(() => {
        // Silently fail - user can enter values manually
        // Error is already logged server-side
        setState('idle');
      });
    }
  }, [hasProfile, userProfile, autoFilled, month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasProfile) {
      setError('Profile required. Please complete your profile first.');
      return;
    }

    setState('auditing');
    setError(null);

    try {
      const response = await fetch('/api/les/audit-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year,
          allowances: {
            BAH: bah ? Math.round(parseFloat(bah) * 100) : undefined,
            BAS: bas ? Math.round(parseFloat(bas) * 100) : undefined,
            COLA: cola ? Math.round(parseFloat(cola) * 100) : undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Audit failed');
      }

      const data: LesAuditResponse = await response.json();
      setAuditData(data);
      setState('complete');
    } catch (err) {
      setError((err as Error).message || 'Audit failed');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setAuditData(null);
    setError(null);
    setBah('');
    setBas('');
    setCola('');
  };

  // Audit complete state
  if (state === 'complete' && auditData) {
    return (
      <div className="space-y-6">
        <LesFlags
          flags={auditData.flags}
          tier={tier}
          summary={auditData.summary}
        />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
          <div className="text-sm text-gray-600">
            Manual audit complete for {month}/{year}
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Icon name="RefreshCw" className="h-4 w-4" />
            New Audit
          </button>
        </div>
      </div>
    );
  }

  // Manual entry form
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Quick Manual Entry</h3>
            <p className="text-sm text-blue-800 mt-1">
              {autoFilled ? (
                <>
                  ✅ <strong>Auto-filled</strong> with {fallbackMessage ? 'typical' : 'your expected'} allowances
                  {fallbackMessage ? ` (${fallbackMessage})` : ' based on your rank, location, and dependent status.'}
                  {' '}Adjust the values to match your actual LES, then click "Run Audit" to compare.
                </>
              ) : state === 'loading' ? (
                <>
                  <Icon name="Loader" className="inline-block w-4 h-4 animate-spin mr-2" />
                  Loading your expected allowances...
                </>
              ) : (
                <>
                  Don't have your LES PDF? Enter your allowances manually for instant verification.
                  Perfect for deployed service members or quick spot checks.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Icon name="Edit" className="h-5 w-5 text-blue-600" />
          Enter LES Allowances
        </h3>

        <div className="space-y-6">
          {/* Month/Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium mb-2">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-2">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {[2025, 2024, 2023].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BAH */}
          <div>
            <label htmlFor="bah" className="block text-sm font-medium mb-2">
              BAH (Basic Allowance for Housing)
              <span className="text-gray-500 font-normal ml-2">$/month</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="bah"
                type="number"
                step="0.01"
                placeholder="1500.00"
                value={bah}
                onChange={(e) => setBah(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Found on LES as "BAH W/DEP" or "BAH W/O DEP"
            </p>
          </div>

          {/* BAS */}
          <div>
            <label htmlFor="bas" className="block text-sm font-medium mb-2">
              BAS (Basic Allowance for Subsistence)
              <span className="text-gray-500 font-normal ml-2">$/month</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="bas"
                type="number"
                step="0.01"
                placeholder="460.66"
                value={bas}
                onChange={(e) => setBas(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Found on LES as "BAS" or "BASIC ALLOW SUBSISTENCE"
            </p>
          </div>

          {/* COLA */}
          <div>
            <label htmlFor="cola" className="block text-sm font-medium mb-2">
              COLA (Cost of Living Allowance)
              <span className="text-gray-500 font-normal ml-2">$/month - Optional</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="cola"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cola}
                onChange={(e) => setCola(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Leave blank if not receiving COLA. Found on LES as "COLA" or "COST OF LIVING"
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state === 'auditing' || !hasProfile}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === 'auditing' ? (
              <>
                <Icon name="Loader" className="h-5 w-5 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <Icon name="Shield" className="h-5 w-5" />
                Run Paycheck Audit
              </>
            )}
          </button>

          {/* Error State */}
          {state === 'error' && error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900">Audit Failed</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Help Section */}
      <div className="rounded-lg border bg-gray-50 p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="HelpCircle" className="h-5 w-5 text-gray-600" />
          Where to Find These Values
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>MyPay:</strong> Login at mypay.dfas.mil → View LES → Look in "Entitlements" section
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Physical LES:</strong> Check mid-month or end-month statement from your unit
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Deployed?</strong> Ask your rear-detachment or S1/admin for LES access
            </span>
          </li>
        </ul>
        <p className="text-xs text-gray-600 mt-4 pt-4 border-t">
          <Icon name="Info" className="inline h-3 w-3 mr-1" />
          Enter values exactly as shown on your LES. We'll compare against expected rates for your rank and location.
        </p>
      </div>
    </div>
  );
}

