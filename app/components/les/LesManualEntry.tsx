'use client';

import { useState, useEffect } from 'react';

import Icon from '@/app/components/ui/Icon';
import type { LesAuditResponse } from '@/app/types/les';

import CurrencyInput from './CurrencyInput';
import LesFlags from './LesFlags';

interface Props {
  tier: string;
  isPremium: boolean;
  hasProfile: boolean;
  monthlyEntriesCount: number;
  userProfile?: {
    rank?: string;
    paygrade?: string;
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
  
  // Form values - Deductions
  const [tsp, setTsp] = useState('');
  const [sgli, setSgli] = useState('');
  const [dental, setDental] = useState('');
  
  // Form values - Taxes
  const [federalTax, setFederalTax] = useState('');
  const [stateTax, setStateTax] = useState('');
  const [fica, setFica] = useState('');
  const [medicare, setMedicare] = useState('');
  
  // Form values - Net Pay
  const [netPay, setNetPay] = useState('');
  
  // Auto-fill tracking
  const [autoFilled, setAutoFilled] = useState({
    bah: false,
    bas: false,
    cola: false,
    sdap: false,
    hfpIdp: false,
    fsa: false,
    flpp: false,
    basePay: false,
    tsp: false,
    sgli: false,
    dental: false,
    federalTax: false,
    stateTax: false,
    fica: false,
    medicare: false,
    netPay: false
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
          rank: userProfile.paygrade || userProfile.rank, // Use paygrade (E01) not rank name (Private PV1)
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
        
        // Deductions
        if (data.tsp && data.tsp > 0) {
          setTsp((data.tsp / 100).toFixed(2));
          newAutoFilled.tsp = true;
        }
        if (data.sgli && data.sgli > 0) {
          setSgli((data.sgli / 100).toFixed(2));
          newAutoFilled.sgli = true;
        }
        if (data.dental && data.dental > 0) {
          setDental((data.dental / 100).toFixed(2));
          newAutoFilled.dental = true;
        }
        
        // Taxes
        if (data.federal_tax && data.federal_tax > 0) {
          setFederalTax((data.federal_tax / 100).toFixed(2));
          newAutoFilled.federalTax = true;
        }
        if (data.state_tax && data.state_tax > 0) {
          setStateTax((data.state_tax / 100).toFixed(2));
          newAutoFilled.stateTax = true;
        }
        if (data.fica && data.fica > 0) {
          setFica((data.fica / 100).toFixed(2));
          newAutoFilled.fica = true;
        }
        if (data.medicare && data.medicare > 0) {
          setMedicare((data.medicare / 100).toFixed(2));
          newAutoFilled.medicare = true;
        }
        
        // Net Pay
        if (data.net_pay && data.net_pay > 0) {
          setNetPay((data.net_pay / 100).toFixed(2));
          newAutoFilled.netPay = true;
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
          basePay: basePay ? Math.round(parseFloat(basePay) * 100) : undefined,
          deductions: {
            TSP: tsp ? Math.round(parseFloat(tsp) * 100) : undefined,
            SGLI: sgli ? Math.round(parseFloat(sgli) * 100) : undefined,
            DENTAL: dental ? Math.round(parseFloat(dental) * 100) : undefined
          },
          taxes: {
            FITW: federalTax ? Math.round(parseFloat(federalTax) * 100) : undefined,
            SITW: stateTax ? Math.round(parseFloat(stateTax) * 100) : undefined,
            FICA: fica ? Math.round(parseFloat(fica) * 100) : undefined,
            MEDICARE: medicare ? Math.round(parseFloat(medicare) * 100) : undefined
          },
          netPay: netPay ? Math.round(parseFloat(netPay) * 100) : undefined
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
    setTsp('');
    setSgli('');
    setDental('');
    setFederalTax('');
    setStateTax('');
    setFica('');
    setMedicare('');
    setNetPay('');
    setAutoFilled({
      bah: false,
      bas: false,
      cola: false,
      sdap: false,
      hfpIdp: false,
      fsa: false,
      flpp: false,
      basePay: false,
      tsp: false,
      sgli: false,
      dental: false,
      federalTax: false,
      stateTax: false,
      fica: false,
      medicare: false,
      netPay: false
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
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">LES Manual Entry</h2>
            <span className="text-sm font-medium text-gray-500">
              {Math.round((Object.values(autoFilled).filter(Boolean).length / Object.keys(autoFilled).length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((Object.values(autoFilled).filter(Boolean).length / Object.keys(autoFilled).length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Icon name="Info" className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-blue-900">Quick Manual Entry</h3>
            <p className="text-blue-800 mt-2">
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Month/Year Selection */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="Calendar" className="h-6 w-6 text-blue-600" />
            Select Pay Period
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="month" className="block text-sm font-semibold text-gray-700 mb-3">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-3">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                {[2025, 2024, 2023].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Allowances Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-4">
            <Icon name="DollarSign" className="h-6 w-6 text-green-600" />
            Basic Allowances
          </h4>
            
          <div className="space-y-6">
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
        </div>

        {/* Special Pays Section */}
        {(sdap || hfpIdp || fsa || flpp || autoFilled.sdap || autoFilled.hfpIdp || autoFilled.fsa || autoFilled.flpp) && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-4">
              <Icon name="Star" className="h-6 w-6 text-amber-600" />
              Special Pays (Conditional)
            </h4>
            <div className="space-y-6">
              
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
          </div>
        )}

        {/* Base Pay Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-4">
            <Icon name="Shield" className="h-6 w-6 text-blue-600" />
            Base Pay
          </h4>
          <div className="space-y-6">
            
            <CurrencyInput
              label="Base Pay (Monthly)"
              value={basePay}
              autoFilled={autoFilled.basePay}
              onChange={setBasePay}
              onOverride={() => setAutoFilled(prev => ({ ...prev, basePay: false }))}
              helpText='Found on LES as "BASE PAY" - Your monthly base pay based on rank and years of service'
            />
          </div>
        </div>

        {/* Deductions Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-4">
            <Icon name="Calculator" className="h-6 w-6 text-red-600" />
            Deductions
          </h4>
          <div className="space-y-6">
            
            <CurrencyInput
              label="TSP Contribution"
              value={tsp}
              autoFilled={autoFilled.tsp}
              onChange={setTsp}
              onOverride={() => setAutoFilled(prev => ({ ...prev, tsp: false }))}
              helpText='Found on LES as "TSP" or "THRIFT SAVINGS PLAN"'
              optional
            />

            <CurrencyInput
              label="SGLI Premium"
              value={sgli}
              autoFilled={autoFilled.sgli}
              onChange={setSgli}
              onOverride={() => setAutoFilled(prev => ({ ...prev, sgli: false }))}
              helpText='Found on LES as "SGLI" - Life insurance premium'
              optional
            />

            <CurrencyInput
              label="Dental Insurance"
              value={dental}
              autoFilled={autoFilled.dental}
              onChange={setDental}
              onOverride={() => setAutoFilled(prev => ({ ...prev, dental: false }))}
              helpText='Found on LES as "DENTAL" or "TRICARE DENTAL"'
              optional
            />
          </div>
        </div>

        {/* Taxes Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-4">
            <Icon name="Landmark" className="h-6 w-6 text-purple-600" />
            Tax Withholding
          </h4>
          <div className="space-y-6">
            
            <CurrencyInput
              label="Federal Income Tax Withheld"
              value={federalTax}
              autoFilled={autoFilled.federalTax}
              onChange={setFederalTax}
              onOverride={() => setAutoFilled(prev => ({ ...prev, federalTax: false }))}
              helpText='Found on LES as "FED TAX" or "FITW"'
            />

            <CurrencyInput
              label="State Income Tax Withheld"
              value={stateTax}
              autoFilled={autoFilled.stateTax}
              onChange={setStateTax}
              onOverride={() => setAutoFilled(prev => ({ ...prev, stateTax: false }))}
              helpText='Found on LES as "STATE TAX" or "SITW" (0 for no-tax states)'
            />

            <CurrencyInput
              label="FICA (Social Security Tax)"
              value={fica}
              autoFilled={autoFilled.fica}
              onChange={setFica}
              onOverride={() => setAutoFilled(prev => ({ ...prev, fica: false }))}
              helpText='Found on LES as "FICA" or "SOC SEC" - Typically 6.2% of gross pay'
              optional
            />

            <CurrencyInput
              label="Medicare Tax"
              value={medicare}
              autoFilled={autoFilled.medicare}
              onChange={setMedicare}
              onOverride={() => setAutoFilled(prev => ({ ...prev, medicare: false }))}
              helpText='Found on LES as "MEDICARE" - Typically 1.45% of gross pay'
              optional
            />
          </div>
        </div>

        {/* Net Pay Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-4">
            <Icon name="DollarSign" className="w-6 h-6 text-green-600" />
            Net Pay (The Bottom Line)
          </h4>
          <div className="space-y-6">
            
            <CurrencyInput
              label="Net Pay (Take-Home)"
              value={netPay}
              autoFilled={autoFilled.netPay}
              onChange={setNetPay}
              onOverride={() => setAutoFilled(prev => ({ ...prev, netPay: false }))}
              helpText='Found on LES as "NET PAY" - The amount that actually hits your bank account'
            />
            
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <Icon name="Info" className="w-4 h-4" />
                Net Pay = (Base Pay + Allowances + Special Pays) - (Deductions + Taxes)
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6">
          <button
            type="submit"
            disabled={state === 'auditing' || !hasProfile}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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

