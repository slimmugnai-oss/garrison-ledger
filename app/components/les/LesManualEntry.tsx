'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import LesFlags from './LesFlags';
import CurrencyInput from './CurrencyInput';
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

  // Form values - Allowances
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [bah, setBah] = useState('');
  const [bas, setBas] = useState('');
  const [cola, setCola] = useState('');
  
  // Form values - Special Pays
  const [sdap, setSdap] = useState('');
  const [hfpIdp, setHfpIdp] = useState('');
  const [fsa, setFsa] = useState('');
  const [flpp, setFlpp] = useState('');
  
  // Form values - Base Pay
  const [basePay, setBasePay] = useState('');
  
  // Auto-fill tracking
  const [autoFilled, setAutoFilled] = useState({
    bah: false,
    bas: false,
    cola: false,
    sdap: false,
    hfpIdp: false,
    fsa: false,
    flpp: false,
    basePay: false
  });
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  // Auto-populate expected values based on user profile
  useEffect(() => {
    if (hasProfile && userProfile && !autoFilled.bah) {
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
        const newAutoFilled = { ...autoFilled };
        
        // Allowances
        if (data.bah) {
          setBah((data.bah / 100).toFixed(2));
          newAutoFilled.bah = true;
        }
        if (data.bas) {
          setBas((data.bas / 100).toFixed(2));
          newAutoFilled.bas = true;
        }
        if (data.cola && data.cola > 0) {
          setCola((data.cola / 100).toFixed(2));
          newAutoFilled.cola = true;
        }
        
        // Special Pays
        if (data.sdap && data.sdap > 0) {
          setSdap((data.sdap / 100).toFixed(2));
          newAutoFilled.sdap = true;
        }
        if (data.hfp_idp && data.hfp_idp > 0) {
          setHfpIdp((data.hfp_idp / 100).toFixed(2));
          newAutoFilled.hfpIdp = true;
        }
        if (data.fsa && data.fsa > 0) {
          setFsa((data.fsa / 100).toFixed(2));
          newAutoFilled.fsa = true;
        }
        if (data.flpp && data.flpp > 0) {
          setFlpp((data.flpp / 100).toFixed(2));
          newAutoFilled.flpp = true;
        }
        
        // Base Pay
        if (data.base_pay && data.base_pay > 0) {
          setBasePay((data.base_pay / 100).toFixed(2));
          newAutoFilled.basePay = true;
        }
        
        // Check if fallback values were used
        if (data.fallback && data.message) {
          setFallbackMessage(data.message);
        }
        
        setAutoFilled(newAutoFilled);
        setState('idle');
      })
      .catch(() => {
        // Silently fail - user can enter values manually
        // Error is already logged server-side
        setState('idle');
      });
    }
  }, [hasProfile, userProfile, autoFilled.bah, month, year]);

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
            COLA: cola ? Math.round(parseFloat(cola) * 100) : undefined,
            SDAP: sdap ? Math.round(parseFloat(sdap) * 100) : undefined,
            HFP_IDP: hfpIdp ? Math.round(parseFloat(hfpIdp) * 100) : undefined,
            FSA: fsa ? Math.round(parseFloat(fsa) * 100) : undefined,
            FLPP: flpp ? Math.round(parseFloat(flpp) * 100) : undefined
          },
          basePay: basePay ? Math.round(parseFloat(basePay) * 100) : undefined
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
    setSdap('');
    setHfpIdp('');
    setFsa('');
    setFlpp('');
    setBasePay('');
    setAutoFilled({
      bah: false,
      bas: false,
      cola: false,
      sdap: false,
      hfpIdp: false,
      fsa: false,
      flpp: false,
      basePay: false
    });
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
              {(autoFilled.bah || autoFilled.bas || autoFilled.basePay) ? (
                <>
                  ✅ <strong>Auto-filled</strong> with {fallbackMessage ? 'typical' : 'your expected'} pay values
                  {fallbackMessage ? ` (${fallbackMessage})` : ' based on your rank, location, and dependent status.'}
                  {' '}Verify and adjust the values to match your actual LES, then click "Run Audit" to compare.
                </>
              ) : state === 'loading' ? (
                <>
                  <Icon name="Loader" className="inline-block w-4 h-4 animate-spin mr-2" />
                  Loading your expected pay values...
                </>
              ) : (
                <>
                  Enter your LES values manually for instant verification.
                  Perfect for deployed service members, quick spot checks, or when you don't have PDF access.
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

          {/* Allowances Section */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Basic Allowances</h4>
            
            <CurrencyInput
              label="BAH (Basic Allowance for Housing)"
              value={bah}
              autoFilled={autoFilled.bah}
              onChange={setBah}
              onOverride={() => setAutoFilled(prev => ({ ...prev, bah: false }))}
              helpText='Found on LES as "BAH W/DEP" or "BAH W/O DEP"'
            />

            <CurrencyInput
              label="BAS (Basic Allowance for Subsistence)"
              value={bas}
              autoFilled={autoFilled.bas}
              onChange={setBas}
              onOverride={() => setAutoFilled(prev => ({ ...prev, bas: false }))}
              helpText='Found on LES as "BAS" or "BASIC ALLOW SUBSISTENCE"'
            />

            <CurrencyInput
              label="COLA (Cost of Living Allowance)"
              value={cola}
              autoFilled={autoFilled.cola}
              onChange={setCola}
              onOverride={() => setAutoFilled(prev => ({ ...prev, cola: false }))}
              helpText='Leave blank if not receiving COLA. Found on LES as "COLA" or "COST OF LIVING"'
              optional
            />
          </div>

          {/* Special Pays Section */}
          {(sdap || hfpIdp || fsa || flpp || autoFilled.sdap || autoFilled.hfpIdp || autoFilled.fsa || autoFilled.flpp) && (
            <div className="space-y-4 pt-4">
              <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Special Pays</h4>
              
              {(sdap || autoFilled.sdap) && (
                <CurrencyInput
                  label="SDAP (Special Duty Assignment Pay)"
                  value={sdap}
                  autoFilled={autoFilled.sdap}
                  onChange={setSdap}
                  onOverride={() => setAutoFilled(prev => ({ ...prev, sdap: false }))}
                  helpText='Found on LES as "SDAP" or "SPECIAL DUTY ASSIGNMENT PAY"'
                />
              )}

              {(hfpIdp || autoFilled.hfpIdp) && (
                <CurrencyInput
                  label="HFP/IDP (Hostile Fire Pay / Imminent Danger Pay)"
                  value={hfpIdp}
                  autoFilled={autoFilled.hfpIdp}
                  onChange={setHfpIdp}
                  onOverride={() => setAutoFilled(prev => ({ ...prev, hfpIdp: false }))}
                  helpText='Found on LES as "HFP/IDP" - typically $225/month'
                />
              )}

              {(fsa || autoFilled.fsa) && (
                <CurrencyInput
                  label="FSA (Family Separation Allowance)"
                  value={fsa}
                  autoFilled={autoFilled.fsa}
                  onChange={setFsa}
                  onOverride={() => setAutoFilled(prev => ({ ...prev, fsa: false }))}
                  helpText='Found on LES as "FSA" - typically $250/month'
                />
              )}

              {(flpp || autoFilled.flpp) && (
                <CurrencyInput
                  label="FLPP (Foreign Language Proficiency Pay)"
                  value={flpp}
                  autoFilled={autoFilled.flpp}
                  onChange={setFlpp}
                  onOverride={() => setAutoFilled(prev => ({ ...prev, flpp: false }))}
                  helpText='Found on LES as "FLPP" or "FOREIGN LANGUAGE PAY"'
                />
              )}
            </div>
          )}

          {/* Base Pay Section */}
          <div className="space-y-4 pt-4">
            <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Base Pay</h4>
            
            <CurrencyInput
              label="Base Pay (Monthly)"
              value={basePay}
              autoFilled={autoFilled.basePay}
              onChange={setBasePay}
              onOverride={() => setAutoFilled(prev => ({ ...prev, basePay: false }))}
              helpText='Found on LES as "BASE PAY" - Your monthly base pay based on rank and years of service'
            />
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

