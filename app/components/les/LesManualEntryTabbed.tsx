"use client";

import { useState, useEffect, useMemo } from "react";

import Icon from "@/app/components/ui/Icon";
import { type IconName } from "@/app/components/ui/icon-registry";
import type { LesAuditResponse } from "@/app/types/les";

import CurrencyInput from "./CurrencyInput";
import LesFlags from "./LesFlags";

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

type EntryState = "idle" | "auditing" | "complete" | "error" | "loading";
type TabId = "entitlements" | "deductions" | "taxes" | "summary";

export default function LesManualEntryTabbed({
  tier,
  isPremium: _isPremium,
  hasProfile,
  monthlyEntriesCount: _monthlyEntriesCount,
  userProfile,
}: Props) {
  const [state, setState] = useState<EntryState>("idle");
  const [auditData, setAuditData] = useState<LesAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("entitlements");

  // Form values - Period
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  // Form values - Entitlements
  const [basePay, setBasePay] = useState("");
  const [bah, setBah] = useState("");
  const [bas, setBas] = useState("");
  const [cola, setCola] = useState("");
  const [sdap, setSdap] = useState("");
  const [hfpIdp, setHfpIdp] = useState("");
  const [fsa, setFsa] = useState("");
  const [flpp, setFlpp] = useState("");

  // Form values - Deductions
  const [tsp, setTsp] = useState("");
  const [sgli, setSgli] = useState("");
  const [dental, setDental] = useState("");

  // Form values - Taxes
  const [federalTax, setFederalTax] = useState("");
  const [stateTax, setStateTax] = useState("");
  const [fica, setFica] = useState("");
  const [medicare, setMedicare] = useState("");

  // Form values - Net Pay
  const [netPay, setNetPay] = useState("");

  // Auto-fill tracking
  const [autoFilled, setAutoFilled] = useState({
    basePay: false,
    bah: false,
    bas: false,
    cola: false,
    sdap: false,
    hfpIdp: false,
    fsa: false,
    flpp: false,
    tsp: false,
    sgli: false,
    dental: false,
    federalTax: false,
    stateTax: false,
    fica: false,
    medicare: false,
    netPay: false,
  });
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  // Auto-populate expected values based on user profile
  useEffect(() => {
    if (hasProfile && userProfile && !autoFilled.bah) {
      setState("loading");

      fetch("/api/les/expected-values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          rank: userProfile.paygrade || userProfile.rank, // Use paygrade (E01) not rank name (Private PV1)
          location: userProfile.currentBase,
          hasDependents: userProfile.hasDependents,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const newAutoFilled = { ...autoFilled };

          // Entitlements
          if (data.base_pay && data.base_pay > 0) {
            setBasePay((data.base_pay / 100).toFixed(2));
            newAutoFilled.basePay = true;
          }
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

          // Deductions
          if (data.tsp && data.tsp > 0) {
            setTsp((data.tsp / 100).toFixed(2));
            newAutoFilled.tsp = true;
          }
          if (data.sgli && data.sgli > 0) {
            setSgli((data.sgli / 100).toFixed(2));
            newAutoFilled.sgli = true;
          }
          // DENTAL - NO AUTO-FILL (premiums vary too much)
          // User enters actual premium from LES

          // TAXES - NO AUTO-FILL (user enters actual values from LES)
          // We provide fica_expected_percent and medicare_expected_percent for validation only
          // Users enter: federal_tax, state_tax, fica, medicare from their actual LES

          // NET PAY - NO AUTO-FILL (calculated during comparison with actual tax values)

          if (data.fallback && data.message) {
            setFallbackMessage(data.message);
          }

          setAutoFilled(newAutoFilled);
          setState("idle");
        })
        .catch(() => {
          setState("idle");
        });
    }
  }, [hasProfile, userProfile, autoFilled.bah, month, year]);

  // Auto-calculate FICA (6.2%) and Medicare (1.45%) based on taxable gross
  useEffect(() => {
    // Calculate taxable gross (excludes BAH/BAS which are non-taxable)
    const taxableGross =
      parseFloat(basePay || "0") +
      parseFloat(cola || "0") +
      parseFloat(sdap || "0") +
      parseFloat(hfpIdp || "0") +
      parseFloat(fsa || "0") +
      parseFloat(flpp || "0");

    if (taxableGross > 0) {
      // Auto-fill FICA (6.2%) if empty or zero
      if (!fica || parseFloat(fica) === 0) {
        const calculatedFica = (taxableGross * 0.062).toFixed(2);
        setFica(calculatedFica);
        setAutoFilled((prev) => ({ ...prev, fica: true }));
      }

      // Auto-fill Medicare (1.45%) if empty or zero
      if (!medicare || parseFloat(medicare) === 0) {
        const calculatedMedicare = (taxableGross * 0.0145).toFixed(2);
        setMedicare(calculatedMedicare);
        setAutoFilled((prev) => ({ ...prev, medicare: true }));
      }
    }
  }, [basePay, cola, sdap, hfpIdp, fsa, flpp, fica, medicare]);

  // Calculate totals for summary tab
  const totals = useMemo(() => {
    const parseNum = (val: string) => (val ? parseFloat(val) : 0);

    const grossPay =
      parseNum(basePay) +
      parseNum(bah) +
      parseNum(bas) +
      parseNum(cola) +
      parseNum(sdap) +
      parseNum(hfpIdp) +
      parseNum(fsa) +
      parseNum(flpp);
    const totalDeductions = parseNum(tsp) + parseNum(sgli) + parseNum(dental);
    const totalTaxes =
      parseNum(federalTax) + parseNum(stateTax) + parseNum(fica) + parseNum(medicare);
    const calculatedNet = grossPay - totalDeductions - totalTaxes;

    return { grossPay, totalDeductions, totalTaxes, calculatedNet };
  }, [
    basePay,
    bah,
    bas,
    cola,
    sdap,
    hfpIdp,
    fsa,
    flpp,
    tsp,
    sgli,
    dental,
    federalTax,
    stateTax,
    fica,
    medicare,
  ]);

  const handleSubmit = async () => {
    if (!hasProfile) {
      setError("Profile required. Please complete your profile first.");
      return;
    }

    setState("auditing");
    setError(null);

    try {
      const response = await fetch("/api/les/audit-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            FLPP: flpp ? Math.round(parseFloat(flpp) * 100) : undefined,
          },
          basePay: basePay ? Math.round(parseFloat(basePay) * 100) : undefined,
          deductions: {
            TSP: tsp ? Math.round(parseFloat(tsp) * 100) : undefined,
            SGLI: sgli ? Math.round(parseFloat(sgli) * 100) : undefined,
            DENTAL: dental ? Math.round(parseFloat(dental) * 100) : undefined,
          },
          taxes: {
            FITW: federalTax ? Math.round(parseFloat(federalTax) * 100) : undefined,
            SITW: stateTax ? Math.round(parseFloat(stateTax) * 100) : undefined,
            FICA: fica ? Math.round(parseFloat(fica) * 100) : undefined,
            MEDICARE: medicare ? Math.round(parseFloat(medicare) * 100) : undefined,
          },
          netPay: netPay ? Math.round(parseFloat(netPay) * 100) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Audit failed");
      }

      const data: LesAuditResponse = await response.json();
      setAuditData(data);
      setState("complete");
    } catch (err) {
      setError((err as Error).message || "Audit failed");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setAuditData(null);
    setError(null);
    setActiveTab("entitlements");
    // Reset all values
    setBasePay("");
    setBah("");
    setBas("");
    setCola("");
    setSdap("");
    setHfpIdp("");
    setFsa("");
    setFlpp("");
    setTsp("");
    setSgli("");
    setDental("");
    setFederalTax("");
    setStateTax("");
    setFica("");
    setMedicare("");
    setNetPay("");
    setAutoFilled({
      basePay: false,
      bah: false,
      bas: false,
      cola: false,
      sdap: false,
      hfpIdp: false,
      fsa: false,
      flpp: false,
      tsp: false,
      sgli: false,
      dental: false,
      federalTax: false,
      stateTax: false,
      fica: false,
      medicare: false,
      netPay: false,
    });
  };

  // Audit complete state
  if (state === "complete" && auditData) {
    return (
      <div className="space-y-6">
        <LesFlags flags={auditData.flags} tier={tier} summary={auditData.summary} />

        <div className="flex items-center justify-between rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">
            Complete audit for {month}/{year}
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Icon name="RefreshCw" className="h-4 w-4" />
            New Audit
          </button>
        </div>
      </div>
    );
  }

  // Tab definitions
  const tabs: { id: TabId; label: string; icon: IconName; count: number }[] = [
    {
      id: "entitlements",
      label: "Entitlements",
      icon: "DollarSign",
      count: [basePay, bah, bas, cola, sdap, hfpIdp, fsa, flpp].filter((v) => v).length,
    },
    {
      id: "deductions",
      label: "Deductions",
      icon: "Calculator",
      count: [tsp, sgli, dental].filter((v) => v).length,
    },
    {
      id: "taxes",
      label: "Taxes",
      icon: "Landmark",
      count: [federalTax, stateTax, fica, medicare].filter((v) => v).length,
    },
    { id: "summary", label: "Summary & Net Pay", icon: "CheckCircle", count: netPay ? 1 : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Complete Paycheck Validation</h3>
            <p className="mt-1 text-sm text-blue-800">
              {autoFilled.bah || autoFilled.basePay ? (
                <>
                  ✅ <strong>Auto-filled</strong> with your expected pay values.
                  {fallbackMessage && ` (${fallbackMessage})`} Review each tab, verify values match
                  your LES, then submit for complete validation.
                </>
              ) : state === "loading" ? (
                <>
                  <Icon name="Loader" className="mr-2 inline-block h-4 w-4 animate-spin" />
                  Loading your expected values...
                </>
              ) : (
                <>
                  Enter your LES values by tab for complete paycheck validation. We'll verify
                  entitlements, deductions, taxes, and calculate your expected net pay.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Month/Year Selection */}
      <div className="rounded-lg border bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className="mb-2 block text-sm font-medium">
              Month
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="mb-2 block text-sm font-medium">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              required
            >
              {[2025, 2024, 2023].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="rounded-t-lg border-b border-gray-200 bg-white">
        <nav className="-mb-px flex overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            // Calculate completion percentage for each tab
            const getCompletionPercentage = (tabId: TabId) => {
              switch (tabId) {
                case "entitlements":
                  return Math.round(([basePay, bah, bas, cola, sdap, hfpIdp, fsa, flpp].filter((v) => v).length / 8) * 100);
                case "deductions":
                  return Math.round(([tsp, sgli, dental].filter((v) => v).length / 3) * 100);
                case "taxes":
                  return Math.round(([federalTax, stateTax, fica, medicare].filter((v) => v).length / 4) * 100);
                case "summary":
                  return netPay ? 100 : 0;
                default:
                  return 0;
              }
            };

            const completionPercentage = getCompletionPercentage(tab.id);
            const isComplete = completionPercentage === 100;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative inline-flex items-center gap-3 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                }`}
                title={`${tab.label} - ${completionPercentage}% complete`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    name={tab.icon}
                    className={`h-5 w-5 transition-colors ${
                      activeTab === tab.id 
                        ? "text-blue-600" 
                        : isComplete 
                          ? "text-green-500" 
                          : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  <span>{tab.label}</span>
                </div>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  {tab.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        activeTab === tab.id 
                          ? "bg-blue-100 text-blue-600" 
                          : isComplete
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  
                  {/* Completion percentage bar */}
                  <div className="h-1 w-12 rounded-full bg-gray-200">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isComplete ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px] rounded-lg border border-t-0 bg-white p-6">
        {/* Tab 1: Entitlements */}
        {activeTab === "entitlements" && (
          <div className="space-y-8">
            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="DollarSign" className="h-6 w-6 text-blue-600" />
                Entitlements (Income)
              </h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">From LES "Entitlements" section</span>
            </div>

            {/* Clarification: What We Prefill */}
            <div className="mb-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Icon name="Info" className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
                <div className="text-sm">
                  <p className="mb-2 text-lg font-bold text-blue-900">
                    What We Prefill vs What You Enter
                  </p>
                  <p className="mb-3 text-blue-800">
                    <strong>We prefill:</strong> Only authoritative values from official DFAS tables
                    (Base Pay, BAH, BAS, COLA).
                  </p>
                  <p className="text-blue-800">
                    <strong>You enter:</strong> Taxes, TSP, Dental from YOUR LES. TSP default = % of
                    BASIC PAY; override if you elected contributions from other pays.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Entitlements Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="Shield" className="h-5 w-5 text-green-600" />
                Core Entitlements (Auto-filled)
              </h4>
              <div className="space-y-6">
              <CurrencyInput
                label="Base Pay (Monthly)"
                value={basePay}
                autoFilled={autoFilled.basePay}
                onChange={setBasePay}
                onOverride={() => setAutoFilled((prev) => ({ ...prev, basePay: false }))}
                helpText="Auto-filled from official 2025 DFAS pay tables (effective 2025-04-01)"
              />

              <CurrencyInput
                label="BAH (Basic Allowance for Housing)"
                value={bah}
                autoFilled={autoFilled.bah}
                onChange={setBah}
                onOverride={() => setAutoFilled((prev) => ({ ...prev, bah: false }))}
                helpText="Auto-filled from official 2025 DFAS BAH tables (effective 2025-01-01)"
              />

              <CurrencyInput
                label="BAS (Basic Allowance for Subsistence)"
                value={bas}
                autoFilled={autoFilled.bas}
                onChange={setBas}
                onOverride={() => setAutoFilled((prev) => ({ ...prev, bas: false }))}
                helpText="Auto-filled from official 2025 DFAS BAS rates (effective 2025-01-01)"
              />

              <CurrencyInput
                label="COLA (Cost of Living Allowance)"
                value={cola}
                autoFilled={autoFilled.cola}
                onChange={setCola}
                onOverride={() => setAutoFilled((prev) => ({ ...prev, cola: false }))}
                helpText="Optional - Only if you receive COLA at your location"
                optional
              />
              </div>
            </div>

            {/* Special Pays - Only show if configured */}
            {(sdap ||
              hfpIdp ||
              fsa ||
              flpp ||
              autoFilled.sdap ||
              autoFilled.hfpIdp ||
              autoFilled.fsa ||
              autoFilled.flpp) && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <h4 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Icon name="Star" className="h-5 w-5 text-amber-600" />
                  Special Pays (Conditional)
                </h4>
                <div className="space-y-6">
                    {(sdap || autoFilled.sdap) && (
                      <CurrencyInput
                        label="SDAP (Special Duty Assignment Pay)"
                        value={sdap}
                        autoFilled={autoFilled.sdap}
                        onChange={setSdap}
                        onOverride={() => setAutoFilled((prev) => ({ ...prev, sdap: false }))}
                        helpText='Found on LES as "SDAP"'
                      />
                    )}

                    {(hfpIdp || autoFilled.hfpIdp) && (
                      <CurrencyInput
                        label="HFP/IDP (Hostile Fire / Imminent Danger Pay)"
                        value={hfpIdp}
                        autoFilled={autoFilled.hfpIdp}
                        onChange={setHfpIdp}
                        onOverride={() => setAutoFilled((prev) => ({ ...prev, hfpIdp: false }))}
                        helpText='Typically $225/month - Found on LES as "HFP/IDP"'
                      />
                    )}

                    {(fsa || autoFilled.fsa) && (
                      <CurrencyInput
                        label="FSA (Family Separation Allowance)"
                        value={fsa}
                        autoFilled={autoFilled.fsa}
                        onChange={setFsa}
                        onOverride={() => setAutoFilled((prev) => ({ ...prev, fsa: false }))}
                        helpText='Typically $250/month - Found on LES as "FSA"'
                      />
                    )}

                    {(flpp || autoFilled.flpp) && (
                      <CurrencyInput
                        label="FLPP (Foreign Language Proficiency Pay)"
                        value={flpp}
                        autoFilled={autoFilled.flpp}
                        onChange={setFlpp}
                        onOverride={() => setAutoFilled((prev) => ({ ...prev, flpp: false }))}
                        helpText='Found on LES as "FLPP"'
                      />
                    )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end border-t pt-6">
              <button
                onClick={() => setActiveTab("deductions")}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Next: Deductions
                <Icon name="ArrowRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Deductions */}
        {activeTab === "deductions" && (
          <div className="space-y-8">
            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="Calculator" className="h-6 w-6 text-red-600" />
                Deductions
              </h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">From LES "Deductions" section</span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="TrendingDown" className="h-5 w-5 text-red-600" />
                Standard Deductions
              </h4>
              <div className="space-y-6">
              <CurrencyInput
                label="TSP Contribution"
                value={tsp}
                autoFilled={autoFilled.tsp}
                onChange={setTsp}
                onOverride={() => setAutoFilled((prev) => ({ ...prev, tsp: false }))}
                helpText="TSP prefill assumes % of BASIC PAY; edit if you elected other sources"
                optional
              />

              <CurrencyInput
                label="SGLI Premium"
                value={sgli}
                autoFilled={autoFilled.sgli}
                onChange={setSgli}
                onOverride={() => setAutoFilled((prev) => ({ ...prev, sgli: false }))}
                helpText='Found on LES as "SGLI" - Life insurance premium'
                optional
              />

              <CurrencyInput
                label="Dental Insurance"
                value={dental}
                autoFilled={false}
                onChange={setDental}
                onOverride={() => {}}
                helpText='Enter exact amount from LES "DENTAL" or "TRICARE DENTAL" line'
                optional
              />
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t pt-6">
              <button
                onClick={() => setActiveTab("entitlements")}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Icon name="ArrowLeft" className="h-4 w-4" />
                Back: Entitlements
              </button>
              <button
                onClick={() => setActiveTab("taxes")}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Next: Taxes
                <Icon name="ArrowRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Taxes */}
        {activeTab === "taxes" && (
          <div className="space-y-8">
            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="Landmark" className="h-6 w-6 text-purple-600" />
                Tax Withholding
              </h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">From LES "Taxes" section</span>
            </div>

            {/* Important Notice: Manual Tax Entry Required */}
            <div className="mb-6 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Icon
                  name="AlertTriangle"
                  className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600"
                />
                <div>
                  <p className="mb-2 text-lg font-bold text-amber-900">
                    Enter exactly what appears on your LES
                  </p>
                  <p className="text-amber-800">
                    We do <strong>NOT</strong> estimate federal/state taxes in v1. You provide the
                    actual values, we validate the percentages.
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Entry Instructions */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm">
                  <p className="mb-1 font-semibold text-blue-900">
                    <strong>FICA and Medicare are auto-calculated</strong> based on your taxable
                    gross pay.
                  </p>
                  <p className="text-blue-800">
                    We automatically calculate FICA (6.2%) and Medicare (1.45%) from your taxable
                    pay (Base + COLA + Special Pays, NOT including BAH/BAS). You can edit these if
                    your LES shows different amounts (rare).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="Receipt" className="h-5 w-5 text-purple-600" />
                Tax Withholding Details
              </h4>
              <div className="space-y-6">
                <CurrencyInput
                  label="Federal Income Tax Withheld"
                  value={federalTax}
                  autoFilled={false}
                  onChange={setFederalTax}
                  onOverride={() => {}}
                  helpText='Enter exact amount from LES "FED TAX" or "FITW" line'
                />

                <CurrencyInput
                  label="State Income Tax Withheld"
                  value={stateTax}
                  autoFilled={false}
                  onChange={setStateTax}
                  onOverride={() => {}}
                  helpText='Enter exact amount from LES "STATE TAX" (enter 0 for TX, FL, WA, etc.)'
                />

                <CurrencyInput
                  label="FICA (Social Security) - Auto-calculated at 6.2%"
                  value={fica}
                  autoFilled={autoFilled.fica}
                  onChange={setFica}
                  onOverride={() => setAutoFilled((prev) => ({ ...prev, fica: false }))}
                  helpText="Auto-calculated at 6.2% of taxable gross - edit if your LES differs"
                  optional
                />

                <CurrencyInput
                  label="Medicare - Auto-calculated at 1.45%"
                  value={medicare}
                  autoFilled={autoFilled.medicare}
                  onChange={setMedicare}
                  onOverride={() => setAutoFilled((prev) => ({ ...prev, medicare: false }))}
                  helpText="Auto-calculated at 1.45% of taxable gross - edit if your LES differs"
                  optional
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t pt-6">
              <button
                onClick={() => setActiveTab("deductions")}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Icon name="ArrowLeft" className="h-4 w-4" />
                Back: Deductions
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Next: Summary
                <Icon name="ArrowRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Summary & Net Pay */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Summary & Net Pay</h3>
              <span className="text-sm text-gray-500">The bottom line</span>
            </div>

            {/* Calculation Summary */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Gross Pay (Entitlements)</span>
                <span className="font-semibold text-green-600">${totals.grossPay.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Total Deductions</span>
                <span className="font-semibold text-red-600">
                  -${totals.totalDeductions.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Total Taxes</span>
                <span className="font-semibold text-red-600">-${totals.totalTaxes.toFixed(2)}</span>
              </div>
              <div className="my-2 h-px bg-gray-300"></div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Expected Net Pay</span>
                <span className="text-xl font-bold text-blue-600">
                  ${totals.calculatedNet.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actual Net Pay Input */}
            <div className="space-y-4">
              <CurrencyInput
                label="Your Actual Net Pay (from LES)"
                value={netPay}
                autoFilled={false}
                onChange={setNetPay}
                onOverride={() => {}}
                helpText='Enter exact amount from bottom of LES "NET PAY" - the amount deposited to your bank'
              />

              {netPay && (
                <div
                  className={`rounded-lg border p-4 ${
                    Math.abs(totals.calculatedNet - parseFloat(netPay)) < 1
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name={
                        Math.abs(totals.calculatedNet - parseFloat(netPay)) < 1
                          ? "CheckCircle"
                          : "AlertCircle"
                      }
                      className={`h-5 w-5 ${Math.abs(totals.calculatedNet - parseFloat(netPay)) < 1 ? "text-green-600" : "text-yellow-600"}`}
                    />
                    <p
                      className={`text-sm font-medium ${Math.abs(totals.calculatedNet - parseFloat(netPay)) < 1 ? "text-green-900" : "text-yellow-900"}`}
                    >
                      {Math.abs(totals.calculatedNet - parseFloat(netPay)) < 1
                        ? "Net pay matches! Math checks out."
                        : `Variance: $${Math.abs(totals.calculatedNet - parseFloat(netPay)).toFixed(2)} - We'll identify the source.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between border-t pt-6">
              <button
                onClick={() => setActiveTab("taxes")}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Icon name="ArrowLeft" className="h-4 w-4" />
                Back: Taxes
              </button>
              <button
                onClick={handleSubmit}
                disabled={state === "auditing" || !hasProfile}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-8 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state === "auditing" ? (
                  <>
                    <Icon name="Loader" className="h-5 w-5 animate-spin" />
                    Running Complete Audit...
                  </>
                ) : (
                  <>
                    <Icon name="Shield" className="h-5 w-5" />
                    Run Complete Audit
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === "error" && error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Audit Failed</h4>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="rounded-lg border bg-gray-50 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Icon name="HelpCircle" className="h-5 w-5 text-gray-600" />
          Where to Find LES Values
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>
              <strong>MyPay:</strong> Login at mypay.dfas.mil → View LES → Look in "Entitlements",
              "Deductions", and "Taxes" sections
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>
              <strong>Physical LES:</strong> Check mid-month or end-month statement from your unit
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>
              <strong>Net Pay:</strong> Found at the very bottom of your LES - matches your bank
              deposit
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
