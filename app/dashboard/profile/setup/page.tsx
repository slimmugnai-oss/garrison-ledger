'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/app/components/ui/Icon';
import BaseAutocomplete from '@/app/components/ui/BaseAutocomplete';
import ProfileLoadingSkeleton from '@/app/components/profile/ProfileLoadingSkeleton';
import ProfileSection from '@/app/components/profile/ProfileSection';
import ProfileFormField, { getInputClass } from '@/app/components/profile/ProfileFormField';
import ProfileProgress from '@/app/components/profile/ProfileProgress';
import militaryRanks from '@/lib/data/military-ranks.json';
import militaryComponents from '@/lib/data/military-components.json';
import { getRankPaygrade, getRankCategory } from '@/lib/data/rank-paygrade-map';
import { getBaseMHA, getMHALocationType } from '@/lib/data/base-mha-helpers';

type ProfilePayload = {
  // Basic info
  age?: number | null;
  gender?: string | null;
  years_of_service?: number | null;
  birth_year?: number | null;
  
  // Computed fields (auto-derived, user never edits directly)
  paygrade?: string | null;
  rank_category?: string | null;
  mha_code?: string | null;
  duty_location_type?: string | null;
  
  // Military identity
  service_status?: string | null;
  branch?: string | null;
  rank?: string | null;
  component?: string | null;
  time_in_service_months?: number | null;
  
  // Location & Deployment
  current_base?: string | null;
  next_base?: string | null;
  pcs_date?: string | null;
  pcs_count?: number | null;
  
  // Family
  marital_status?: string | null;
  num_children?: number | null;
  has_dependents?: boolean | null;  // Auto-derived from num_children + marital_status
  
  // Financial & Planning
  tsp_balance_range?: string | null;
  housing_situation?: string | null;
  owns_rental_properties?: boolean | null;
  retirement_age_target?: number | null;
  
  // Special Pays & Allowances (for LES Auditor)
  mha_code_override?: string | null;
  receives_sdap?: boolean | null;
  sdap_monthly_cents?: number | null;
  receives_hfp_idp?: boolean | null;
  hfp_idp_monthly_cents?: number | null;
  receives_fsa?: boolean | null;
  fsa_monthly_cents?: number | null;
  receives_flpp?: boolean | null;
  flpp_monthly_cents?: number | null;
  
  // Deductions & Taxes (for LES Auditor)
  tsp_contribution_percent?: number | null;
  tsp_contribution_type?: string | null;
  sgli_coverage_amount?: number | null;
  has_dental_insurance?: boolean | null;
  filing_status?: string | null;
  state_of_residence?: string | null;
  w4_allowances?: number | null;
  
  // System
  profile_completed?: boolean | null;
};

type MilitaryRanks = {
  [key: string]: {
    enlisted?: { code: string; title: string }[];
    warrant?: { code: string; title: string }[];
    officer?: { code: string; title: string }[];
  };
};

type MilitaryComponents = {
  [key: string]: string[];
};

const ranksData = militaryRanks as MilitaryRanks;
const componentsData = militaryComponents as MilitaryComponents;
const serviceStatuses = [
  { value: 'active_duty', label: 'Active Duty' },
  { value: 'reserve', label: 'Reserve' },
  { value: 'national_guard', label: 'National Guard' },
  { value: 'retired', label: 'Retired' },
  { value: 'veteran', label: 'Veteran (Separated)' },
  { value: 'separating', label: 'Separating (within 12 months)' },
  { value: 'military_spouse', label: 'Military Spouse / Dependent' },
  { value: 'dod_civilian', label: 'DoD Civilian / Contractor' }
];

// Form option arrays - only keep what's actively used
const branches = ['Army','Navy','Air Force','Marines','Coast Guard','Space Force'];
const civilianBranches = ['Army','Navy','Air Force','Marines','Coast Guard','Space Force','Multiple / Joint','N/A (not service-specific)'];
const genders = ['Male','Female','Prefer not to say'];
const housingOptions = ['On-base housing','Rent off-base','Own primary residence','Own rental property','Living with family','Other'];
const tspRanges = ['0-25k','25k-50k','50k-100k','100k-200k','200k+','prefer-not-to-say'];

const yesNo = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<ProfilePayload>({});
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/user-profile', { cache: 'no-store' });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setData({
            // Basic
            age: json?.age ?? null,
            gender: json?.gender ?? null,
            years_of_service: json?.years_of_service ?? null,
            // Computed (loaded but not edited by user)
            paygrade: json?.paygrade ?? null,
            rank_category: json?.rank_category ?? null,
            mha_code: json?.mha_code ?? null,
            duty_location_type: json?.duty_location_type ?? null,
            // Military
            service_status: json?.service_status ?? null,
            branch: json?.branch ?? null,
            rank: json?.rank ?? null,
            component: json?.component ?? null,
            time_in_service_months: json?.time_in_service_months ?? null,
            // Location & Deployment
            current_base: json?.current_base ?? null,
            next_base: json?.next_base ?? null,
            pcs_date: json?.pcs_date ?? null,
            pcs_count: json?.pcs_count ?? null,
            // Family
            marital_status: json?.marital_status ?? null,
            num_children: json?.num_children ?? null,
            has_dependents: json?.has_dependents ?? null,
            // Financial & Planning
            tsp_balance_range: json?.tsp_balance_range ?? null,
            housing_situation: json?.housing_situation ?? null,
            owns_rental_properties: json?.owns_rental_properties ?? null,
            retirement_age_target: json?.retirement_age_target ?? null,
            // Special Pays & Allowances
            mha_code_override: json?.mha_code_override ?? null,
            receives_sdap: json?.receives_sdap ?? null,
            sdap_monthly_cents: json?.sdap_monthly_cents ?? null,
            receives_hfp_idp: json?.receives_hfp_idp ?? null,
            hfp_idp_monthly_cents: json?.hfp_idp_monthly_cents ?? null,
            receives_fsa: json?.receives_fsa ?? null,
            fsa_monthly_cents: json?.fsa_monthly_cents ?? null,
            receives_flpp: json?.receives_flpp ?? null,
            flpp_monthly_cents: json?.flpp_monthly_cents ?? null,
            // Deductions & Taxes
            tsp_contribution_percent: json?.tsp_contribution_percent ?? null,
            tsp_contribution_type: json?.tsp_contribution_type ?? null,
            sgli_coverage_amount: json?.sgli_coverage_amount ?? null,
            has_dental_insurance: json?.has_dental_insurance ?? null,
            filing_status: json?.filing_status ?? null,
            state_of_residence: json?.state_of_residence ?? null,
            w4_allowances: json?.w4_allowances ?? null,
            // System
            profile_completed: json?.profile_completed ?? false,
          });
          // Expand all sections if profile exists
          if (json) {
            setExpandedSections(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
          }
        } else if (res.status !== 404) {
          setError('Failed to load profile');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Compute available ranks based on selected branch
  const availableRanks = useMemo(() => {
    if (!data.branch || !ranksData[data.branch]) return [];
    const branchRanks = ranksData[data.branch];
    const allRanks = [
      ...(branchRanks.enlisted || []),
      ...(branchRanks.warrant || []),
      ...(branchRanks.officer || [])
    ];
    return allRanks;
  }, [data.branch]);

  // Compute available components based on selected branch
  const availableComponents = useMemo(() => {
    if (!data.branch || !componentsData[data.branch]) return [];
    return componentsData[data.branch];
  }, [data.branch]);

  // Reset rank if it's not available for the newly selected branch
  useEffect(() => {
    if (data.branch && data.rank) {
      const rankExists = availableRanks.some(r => r.title === data.rank || r.code === data.rank);
      if (!rankExists) {
        setData(d => ({ ...d, rank: null }));
      }
    }
  }, [data.branch, data.rank, availableRanks]);

  // Reset component if it's not available for the newly selected branch
  useEffect(() => {
    if (data.branch && data.component) {
      const componentExists = availableComponents.includes(data.component);
      if (!componentExists) {
        setData(d => ({ ...d, component: null }));
      }
    }
  }, [data.branch, data.component, availableComponents]);

  // Calculate time in service months from years
  useEffect(() => {
    if (data.years_of_service !== null && data.years_of_service !== undefined) {
      setData(d => ({ ...d, time_in_service_months: data.years_of_service! * 12 }));
    }
  }, [data.years_of_service]);

  // Children array removed - we only track count (num_children) now
  // Base Navigator uses count, not individual ages

  // Auto-derive has_dependents from num_children and marital_status
  // CRITICAL: Required for LES Auditor and Base Navigator BAH calculations
  useEffect(() => {
    const derived = (data.num_children ?? 0) > 0 || data.marital_status === 'married';
    if (data.has_dependents !== derived) {
      setData(d => ({ ...d, has_dependents: derived }));
    }
  }, [data.num_children, data.marital_status, data.has_dependents]);

  // Auto-derive paygrade and rank_category from rank
  // CRITICAL: Required for LES Auditor, PCS Copilot, all pay calculations
  useEffect(() => {
    if (data.rank) {
      const paygrade = getRankPaygrade(data.rank);
      const rankCategory = paygrade ? getRankCategory(paygrade) : null;
      if (data.paygrade !== paygrade || data.rank_category !== rankCategory) {
        setData(d => ({ 
          ...d, 
          paygrade: paygrade ?? undefined, 
          rank_category: rankCategory ?? undefined 
        }));
      }
    }
  }, [data.rank, data.paygrade, data.rank_category]);

  // Auto-derive mha_code and duty_location_type from current_base
  // CRITICAL: Required for BAH lookups in LES Auditor and Base Navigator
  useEffect(() => {
    if (data.current_base) {
      const mhaCode = getBaseMHA(data.current_base);
      const locationType = mhaCode ? getMHALocationType(mhaCode) : null;
      if (data.mha_code !== mhaCode || data.duty_location_type !== locationType) {
        setData(d => ({ 
          ...d, 
          mha_code: mhaCode ?? undefined,
          duty_location_type: locationType ?? undefined
        }));
      }
    }
  }, [data.current_base, data.mha_code, data.duty_location_type]);

  // Section completion calculator
  const getSectionCompletion = (section: number): { complete: number; total: number; percentage: number } => {
    let complete = 0;
    let total = 0;
    
    switch(section) {
      case 1: // Basic info
        total = 3;
        if (data.age) complete++;
        if (data.gender) complete++;
        if (data.years_of_service !== null && data.years_of_service !== undefined) complete++;
        break;
      case 2: // Military identity
        total = data.service_status && !['military_spouse', 'dod_civilian'].includes(data.service_status) ? 3 : 1;
        if (data.service_status) complete++;
        if (data.service_status && !['military_spouse', 'dod_civilian'].includes(data.service_status)) {
          if (data.branch) complete++;
          if (data.rank) complete++;
        }
        break;
      case 3: // Location & Deployment
        total = 1;
        if (data.current_base) complete++;
        // deployment_count removed - not used by any tool
        break;
      case 4: // Family
        total = 2;
        if (data.marital_status) complete++;
        if (data.num_children !== null && data.num_children !== undefined) complete++;
        // spouse_military and has_efmp removed - not used by any tool
        break;
      case 5: // Financial
        total = 2;
        if (data.tsp_balance_range) complete++;
        if (data.housing_situation) complete++;
        // debt_amount_range removed - not used
        break;
      case 6: // Goals
        total = 1;
        if (data.retirement_age_target) complete++;
        // long_term_goal and financial_priorities removed - not used
        break;
      case 7: // Special Pays & Allowances (optional - for LES Auditor)
        // All special pays are optional - section can be skipped
        total = 0; // Don't require any fields
        complete = 0;
        break;
      case 8: // Deductions & Taxes (optional - for LES Auditor accuracy)
        // All deduction/tax fields are optional
        total = 0; // Don't require any fields
        complete = 0;
        break;
    }
    
    return { complete, total, percentage: total > 0 ? (complete / total) * 100 : 0 };
  };

  // Overall progress
  const overallProgress = useMemo(() => {
    let totalComplete = 0;
    let totalFields = 0;
    for (let i = 1; i <= 8; i++) {
      const section = getSectionCompletion(i);
      totalComplete += section.complete;
      totalFields += section.total;
    }
    return { complete: totalComplete, total: totalFields, percentage: (totalComplete / totalFields) * 100 };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle section expansion
  function toggleSection(section: number) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  async function submit() {
    // Validate required fields
    const errors: Record<string, string> = {};
    const requiredFields = [
      { field: data.age, name: 'age', label: 'Age' },
      { field: data.gender, name: 'gender', label: 'Gender' },
      { field: data.years_of_service, name: 'years_of_service', label: 'Years of service' },
      { field: data.service_status, name: 'service_status', label: 'Service status' },
      { field: data.marital_status, name: 'marital_status', label: 'Marital status' },
      { field: data.num_children, name: 'num_children', label: 'Number of children' },
      { field: data.tsp_balance_range, name: 'tsp_balance_range', label: 'TSP balance' }
    ];

    // Add branch/rank requirements conditionally
    if (data.service_status && !['military_spouse', 'dod_civilian'].includes(data.service_status)) {
      requiredFields.push(
        { field: data.rank, name: 'rank', label: 'Rank' },
        { field: data.branch, name: 'branch', label: 'Branch' }
      );
    }

    requiredFields.forEach(f => {
      if (f.field === null || f.field === undefined || f.field === '') {
        errors[f.name] = `${f.label} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(`Please complete the following required fields: ${Object.values(errors).join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);
    try {
      // Ensure has_dependents is derived before saving
      const hasDependents = (data.num_children ?? 0) > 0 || data.marital_status === 'married';
      
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          has_dependents: hasDependents,
          profile_completed: true 
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      
      // Auto-redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch {
      setError('Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // toggleArray removed - no multi-select fields remain in streamlined profile

  if (loading) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-surface-hover">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-2xl shadow-lg">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Set up your profile</h1>
              <p className="text-sm text-body">Help us personalize your experience</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-info hover:text-info hover:underline transition-colors">
            Skip for now
          </Link>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <ProfileProgress
            complete={overallProgress.complete}
            total={overallProgress.total}
            percentage={overallProgress.percentage}
          />
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-4 border-l-4 border-danger bg-danger-subtle rounded-r-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-danger">Please complete required fields</p>
                <p className="text-sm text-danger mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 border-l-4 border-success bg-success-subtle rounded-r-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-success">Profile saved successfully!</p>
                <p className="text-sm text-success">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-4">
          {/* Section 1: Basic Info */}
          <ProfileSection
            number={1}
            title="About You"
            icon="👤"
            description="Basic information to personalize your experience"
            required
            expanded={expandedSections.has(1)}
            onToggle={() => toggleSection(1)}
            completion={getSectionCompletion(1)}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProfileFormField
                label="Age"
                required
                error={fieldErrors.age}
                description="Helps with retirement planning"
                success={!!data.age}
              >
                <input
                  type="number"
                  min={17}
                  max={100}
                  placeholder="e.g., 28"
                  className={getInputClass(!!fieldErrors.age, !!data.age)}
                  value={data.age ?? ''}
                  onChange={e => setData(d => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))}
                />
              </ProfileFormField>

              <ProfileFormField
                label="Gender"
                required
                error={fieldErrors.gender}
                success={!!data.gender}
              >
                <select
                  className={getInputClass(!!fieldErrors.gender, !!data.gender)}
                  value={data.gender ?? ''}
                  onChange={e => setData(d => ({ ...d, gender: e.target.value || null }))}
                >
                  <option value="">Select</option>
                  {genders.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                </select>
              </ProfileFormField>

              <ProfileFormField
                label="Years of Service"
                required
                error={fieldErrors.years_of_service}
                description="Total military service time"
                success={!!data.years_of_service}
              >
                <input
                  type="number"
                  min={0}
                  max={40}
                  placeholder="e.g., 6"
                  className={getInputClass(!!fieldErrors.years_of_service, !!data.years_of_service)}
                  value={data.years_of_service ?? ''}
                  onChange={e => setData(d => ({ ...d, years_of_service: e.target.value ? Number(e.target.value) : null }))}
                />
              </ProfileFormField>
            </div>
          </ProfileSection>

          {/* Section 2: Military Identity */}
          <ProfileSection
            number={2}
            title="Military Identity"
            icon="🎖️"
            description="Your military background and current status"
            required
            expanded={expandedSections.has(2)}
            onToggle={() => toggleSection(2)}
            completion={getSectionCompletion(2)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProfileFormField
                  label="Service Status"
                  required
                  error={fieldErrors.service_status}
                  success={!!data.service_status}
                >
                  <select
                    className={getInputClass(!!fieldErrors.service_status, !!data.service_status)}
                    value={data.service_status ?? ''}
                    onChange={e => setData(d => ({ ...d, service_status: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    {serviceStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </ProfileFormField>
                {/* Conditional fields based on service status */}
                {data.service_status === 'military_spouse' ? (
                  <>
                    <div className="flex items-center justify-center text-sm text-muted italic md:col-span-2">
                      Branch/rank not applicable for military spouses
                    </div>
                  </>
                ) : data.service_status === 'dod_civilian' ? (
                  <>
                    <ProfileFormField
                      label="Which Service"
                      description="DoD branch you work with"
                      success={!!data.branch}
                    >
                      <select
                        className={getInputClass(false, !!data.branch)}
                        value={data.branch ?? ''}
                        onChange={e => setData(d => ({ ...d, branch: e.target.value || null }))}
                      >
                        <option value="">Select (optional)</option>
                        {civilianBranches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </ProfileFormField>
                    <div className="flex items-center justify-center text-sm text-muted italic md:col-span-1">
                      Rank not applicable
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileFormField
                      label="Branch"
                      required
                      error={fieldErrors.branch}
                      success={!!data.branch}
                    >
                      <select
                        className={getInputClass(!!fieldErrors.branch, !!data.branch)}
                        value={data.branch ?? ''}
                        onChange={e => setData(d => ({ ...d, branch: e.target.value || null }))}
                      >
                        <option value="">Select</option>
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </ProfileFormField>

                    <ProfileFormField
                      label="Rank"
                      required
                      error={fieldErrors.rank}
                      description={!data.branch ? 'Select branch first' : undefined}
                      success={!!data.rank}
                    >
                      <select
                        className={getInputClass(!!fieldErrors.rank, !!data.rank)}
                        value={data.rank ?? ''}
                        onChange={e => setData(d => ({ ...d, rank: e.target.value || null }))}
                        disabled={!data.branch}
                      >
                        <option value="">Select {!data.branch ? '(select branch first)' : ''}</option>
                        {availableRanks.length > 0 && (
                          <>
                            {ranksData[data.branch!]?.enlisted && ranksData[data.branch!].enlisted!.length > 0 && (
                              <optgroup label="Enlisted">
                                {ranksData[data.branch!].enlisted!.map(r => (
                                  <option key={r.code + '-' + r.title} value={r.title}>{r.title}</option>
                                ))}
                              </optgroup>
                            )}
                            {ranksData[data.branch!]?.warrant && ranksData[data.branch!].warrant!.length > 0 && (
                              <optgroup label="Warrant Officer">
                                {ranksData[data.branch!].warrant!.map(r => (
                                  <option key={r.code + '-' + r.title} value={r.title}>{r.title}</option>
                                ))}
                              </optgroup>
                            )}
                            {ranksData[data.branch!]?.officer && ranksData[data.branch!].officer!.length > 0 && (
                              <optgroup label="Officer">
                                {ranksData[data.branch!].officer!.map(r => (
                                  <option key={r.code + '-' + r.title} value={r.title}>{r.title}</option>
                                ))}
                              </optgroup>
                            )}
                          </>
                        )}
                      </select>
                    </ProfileFormField>
                  </>
                )}
              </div>

              {/* NEW: Additional military fields */}
              {/* MOS/AFSC and Clearance fields removed - not used by any tools */}
            </div>
            {data.service_status && ['reserve', 'national_guard'].includes(data.service_status) && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-2">🎖️ You selected {serviceStatuses.find(s => s.value === data.service_status)?.label}. This gives us context for your service type.</p>
              </div>
            )}
            {data.service_status === 'retired' && (
              <div className="mt-4 bg-info-subtle border-l-4 border-info rounded-r-lg p-4">
                <p className="text-sm text-blue-900"><strong>Thank you for your service!</strong> We&apos;ll tailor content for your retirement phase, including continued benefits, VA resources, and transition planning.</p>
              </div>
            )}
            {data.service_status === 'veteran' && (
              <div className="mt-4 bg-success-subtle border-l-4 border-success rounded-r-lg p-4">
                <p className="text-sm text-success"><strong>Thank you for your service!</strong> We&apos;ll focus on veteran benefits, civilian career transition, and post-service life planning.</p>
              </div>
            )}
            {data.service_status === 'separating' && (
              <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
                <p className="text-sm text-amber-900"><strong>Transition Planning Mode:</strong> We&apos;ll prioritize TAP/SFL-TAP resources, resume building, job search strategies, and benefits preservation.</p>
              </div>
            )}
            {data.service_status === 'military_spouse' && (
              <div className="mt-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
                <p className="text-sm text-purple-900"><strong>Military Spouse Resources:</strong> We&apos;ll focus on spouse employment, PCS support, deployment readiness, and comprehensive planning for military family life.</p>
              </div>
            )}
            {data.service_status === 'dod_civilian' && (
              <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
                <p className="text-sm text-indigo-900"><strong>DoD Civilian Resources:</strong> We&apos;ll focus on federal employment benefits, TSP optimization, and career advancement within the DoD system.</p>
              </div>
            )}
          </ProfileSection>

          {/* Section 3: Location & Deployment */}
          <ProfileSection
            number={3}
            title="Location & Deployment"
            icon="📍"
            description="Where you are and where you're going"
            expanded={expandedSections.has(3)}
            onToggle={() => toggleSection(3)}
            completion={getSectionCompletion(3)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProfileFormField
                  label="Current Base"
                  description="Your current duty station"
                  success={!!data.current_base}
                >
                  <BaseAutocomplete 
                    value={data.current_base ?? ''} 
                    onChange={(value) => setData(d => ({ ...d, current_base: value || null }))}
                    placeholder="e.g., Fort Liberty, NC"
                  />
                </ProfileFormField>

                <ProfileFormField
                  label="Next Base"
                  description="If you have orders"
                  success={!!data.next_base}
                >
                  <BaseAutocomplete 
                    value={data.next_base ?? ''} 
                    onChange={(value) => setData(d => ({ ...d, next_base: value || null }))}
                    placeholder="If known (optional)"
                  />
                </ProfileFormField>

                <ProfileFormField
                  label="PCS Date"
                  description="Report date if known"
                  success={!!data.pcs_date}
                >
                  <input
                    type="date"
                    className={getInputClass(false, !!data.pcs_date)}
                    value={data.pcs_date ?? ''}
                    onChange={e => setData(d => ({ ...d, pcs_date: e.target.value || null }))}
                  />
                </ProfileFormField>
              </div>

              {/* deployment_count, deployment_status, last_deployment_date all removed - not used by any tool */}
            </div>
          </ProfileSection>

          {/* Section 4: Family */}
          <ProfileSection
            number={4}
            title="Family Details"
            icon="👨‍👩‍👧‍👦"
            description="Family structure and dependents"
            required
            expanded={expandedSections.has(4)}
            onToggle={() => toggleSection(4)}
            completion={getSectionCompletion(4)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProfileFormField
                  label="Marital Status"
                  required
                  error={fieldErrors.marital_status}
                  success={!!data.marital_status}
                >
                  <select
                    className={getInputClass(!!fieldErrors.marital_status, !!data.marital_status)}
                    value={data.marital_status ?? ''}
                    onChange={e => setData(d => ({ ...d, marital_status: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="Number of Children"
                  required
                  error={fieldErrors.num_children}
                  success={data.num_children !== null && data.num_children !== undefined}
                >
                  <input
                    type="number"
                    min={0}
                    max={10}
                    placeholder="0"
                    className={getInputClass(!!fieldErrors.num_children, data.num_children !== null && data.num_children !== undefined)}
                    value={data.num_children ?? 0}
                    onChange={e => setData(d => ({ ...d, num_children: Number(e.target.value) }))}
                  />
                </ProfileFormField>

              {/* has_efmp removed - not used by any tool */}
              </div>

              {/* NEW: Spouse details (conditional) */}
              {/* spouse_military removed - not used by any tool */}
            </div>

            {/* Children ages section removed - Base Navigator uses count only, not individual ages */}
          </ProfileSection>

          {/* Section 5: Financial Snapshot */}
          <ProfileSection
            number={5}
            title="Financial Snapshot"
            icon="💰"
            description="Privacy-friendly ranges to tailor financial advice"
            required
            expanded={expandedSections.has(5)}
            onToggle={() => toggleSection(5)}
            completion={getSectionCompletion(5)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProfileFormField
                  label="TSP Balance"
                  required
                  error={fieldErrors.tsp_balance_range}
                  description="Current TSP account balance"
                  success={!!data.tsp_balance_range}
                >
                  <select
                    className={getInputClass(!!fieldErrors.tsp_balance_range, !!data.tsp_balance_range)}
                    value={data.tsp_balance_range ?? ''}
                    onChange={e => setData(d => ({ ...d, tsp_balance_range: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    {tspRanges.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </ProfileFormField>

                {/* tsp_allocation and monthly_income_range removed - not used by tools */}
              </div>

              {/* debt_amount_range, emergency_fund_range, bah_amount all removed - not used by tools */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileFormField
                  label="Housing Situation"
                  description="Current living arrangement"
                  success={!!data.housing_situation}
                >
                  <select
                    className={getInputClass(false, !!data.housing_situation)}
                    value={data.housing_situation ?? ''}
                    onChange={e => setData(d => ({ ...d, housing_situation: e.target.value || null }))}
                  >
                    <option value="">Select (optional)</option>
                    {housingOptions.map(h => <option key={h} value={h.toLowerCase().replace(' ', '-')}>{h}</option>)}
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="Own Rental Properties"
                  description="Real estate investments"
                  success={data.owns_rental_properties !== null && data.owns_rental_properties !== undefined}
                >
                  <select
                    className={getInputClass(false, data.owns_rental_properties !== null && data.owns_rental_properties !== undefined)}
                    value={data.owns_rental_properties === null || data.owns_rental_properties === undefined ? '' : String(data.owns_rental_properties)}
                    onChange={e => setData(d => ({ ...d, owns_rental_properties: e.target.value === '' ? null : e.target.value === 'true' }))}
                  >
                    <option value="">Select (optional)</option>
                    {yesNo.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                  </select>
                </ProfileFormField>
              </div>
            </div>
          </ProfileSection>

          {/* Section 6: Career & Goals */}
          <ProfileSection
            number={6}
            title="Career & Goals"
            icon="🎯"
            description="Long-term plans and career aspirations"
            expanded={expandedSections.has(6)}
            onToggle={() => toggleSection(6)}
            completion={getSectionCompletion(6)}
          >
            <div className="space-y-4">
              <div>
                <ProfileFormField
                  label="Retirement Age Target"
                  description="When do you plan to fully retire?"
                  success={!!data.retirement_age_target}
                >
                  <input
                    type="number"
                    min={40}
                    max={80}
                    placeholder="e.g., 60"
                    className={getInputClass(false, !!data.retirement_age_target)}
                    value={data.retirement_age_target ?? ''}
                    onChange={e => setData(d => ({ ...d, retirement_age_target: e.target.value ? Number(e.target.value) : null }))}
                  />
                </ProfileFormField>
                {/* long_term_goal, financial_priorities, career_interests all removed - not used by tools */}
              </div>
            </div>
          </ProfileSection>

          {/* Section 7: Special Pays & Allowances (Optional - For LES Auditor Accuracy) */}
          <ProfileSection
            number={7}
            title="Special Pays & Allowances"
            icon="💵"
            description="Optional: Improves LES Auditor accuracy if you receive special pays"
            expanded={expandedSections.has(7)}
            onToggle={() => toggleSection(7)}
            completion={getSectionCompletion(7)}
          >
            <div className="space-y-6">
              {/* MHA Override - For bases not in our database */}
              {data.current_base && !data.mha_code && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertCircle" className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900">MHA Code Not Found</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        We couldn't auto-detect the Military Housing Area (MHA) code for {data.current_base}. 
                        You can enter it manually below to enable accurate BAH verification.
                      </p>
                      <ProfileFormField
                        label="MHA Code Override"
                        description="Find this on your LES or at the DFAS BAH Calculator"
                        success={!!data.mha_code_override}
                      >
                        <input
                          type="text"
                          placeholder="e.g., NY349, CA926, TX210"
                          className={getInputClass(false, !!data.mha_code_override)}
                          value={data.mha_code_override ?? ''}
                          onChange={e => setData(d => ({ ...d, mha_code_override: e.target.value.toUpperCase() || null }))}
                          maxLength={10}
                        />
                      </ProfileFormField>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Banner */}
              <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Why Configure Special Pays?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      The LES Auditor can verify your special pays are correct if you configure them here. 
                      This is completely optional - skip if you don't receive any special pays.
                    </p>
                  </div>
                </div>
              </div>

              {/* SDAP - Special Duty Assignment Pay */}
              <div className="space-y-3">
                <ProfileFormField
                  label="Do you receive SDAP (Special Duty Assignment Pay)?"
                  description="For specific skill identifiers or duty assignments"
                  success={data.receives_sdap !== null}
                >
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_sdap === true}
                        onChange={() => setData(d => ({ ...d, receives_sdap: true }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_sdap === false}
                        onChange={() => setData(d => ({ ...d, receives_sdap: false, sdap_monthly_cents: null }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </ProfileFormField>

                {data.receives_sdap === true && (
                  <ProfileFormField
                    label="SDAP Monthly Amount"
                    description="Enter the exact amount from your LES"
                    success={!!data.sdap_monthly_cents}
                  >
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 450.00"
                        className={getInputClass(false, !!data.sdap_monthly_cents)}
                        value={data.sdap_monthly_cents ? (data.sdap_monthly_cents / 100).toFixed(2) : ''}
                        onChange={e => setData(d => ({ 
                          ...d, 
                          sdap_monthly_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null 
                        }))}
                        style={{ paddingLeft: '2rem' }}
                      />
                    </div>
                  </ProfileFormField>
                )}
              </div>

              {/* HFP/IDP - Hostile Fire Pay / Imminent Danger Pay */}
              <div className="space-y-3">
                <ProfileFormField
                  label="Do you receive HFP/IDP (Hostile Fire Pay / Imminent Danger Pay)?"
                  description="$225/month for service in hostile fire or imminent danger zones"
                  success={data.receives_hfp_idp !== null}
                >
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_hfp_idp === true}
                        onChange={() => setData(d => ({ ...d, receives_hfp_idp: true, hfp_idp_monthly_cents: 22500 }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_hfp_idp === false}
                        onChange={() => setData(d => ({ ...d, receives_hfp_idp: false, hfp_idp_monthly_cents: null }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </ProfileFormField>
              </div>

              {/* FSA - Family Separation Allowance */}
              <div className="space-y-3">
                <ProfileFormField
                  label="Do you receive FSA (Family Separation Allowance)?"
                  description="$250/month for involuntary separation from family due to military duty"
                  success={data.receives_fsa !== null}
                >
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_fsa === true}
                        onChange={() => setData(d => ({ ...d, receives_fsa: true, fsa_monthly_cents: 25000 }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_fsa === false}
                        onChange={() => setData(d => ({ ...d, receives_fsa: false, fsa_monthly_cents: null }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </ProfileFormField>
              </div>

              {/* FLPP - Foreign Language Proficiency Pay */}
              <div className="space-y-3">
                <ProfileFormField
                  label="Do you receive FLPP (Foreign Language Proficiency Pay)?"
                  description="For certified foreign language proficiency"
                  success={data.receives_flpp !== null}
                >
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_flpp === true}
                        onChange={() => setData(d => ({ ...d, receives_flpp: true }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.receives_flpp === false}
                        onChange={() => setData(d => ({ ...d, receives_flpp: false, flpp_monthly_cents: null }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </ProfileFormField>

                {data.receives_flpp === true && (
                  <ProfileFormField
                    label="FLPP Monthly Amount"
                    description="Enter the exact amount from your LES (varies by language and proficiency level)"
                    success={!!data.flpp_monthly_cents}
                  >
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 300.00"
                        className={getInputClass(false, !!data.flpp_monthly_cents)}
                        value={data.flpp_monthly_cents ? (data.flpp_monthly_cents / 100).toFixed(2) : ''}
                        onChange={e => setData(d => ({ 
                          ...d, 
                          flpp_monthly_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null 
                        }))}
                        style={{ paddingLeft: '2rem' }}
                      />
                    </div>
                  </ProfileFormField>
                )}
              </div>
            </div>
          </ProfileSection>

          {/* Section 8: Deductions & Taxes (Optional - For Complete LES Validation) */}
          <ProfileSection
            number={8}
            title="Deductions & Taxes"
            icon="📊"
            description="Optional: Enables complete paycheck validation including net pay verification"
            expanded={expandedSections.has(8)}
            onToggle={() => toggleSection(8)}
            completion={getSectionCompletion(8)}
          >
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Complete Paycheck Validation</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Configure your deductions and tax settings to enable full LES validation including net pay verification. 
                      This helps catch errors in TSP contributions, SGLI premiums, and tax withholding.
                    </p>
                  </div>
                </div>
              </div>

              {/* TSP Configuration */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">TSP (Thrift Savings Plan)</h5>
                
                <ProfileFormField
                  label="TSP Contribution Percentage"
                  description="Percentage of gross pay contributed to TSP (e.g., 5% = 0.05)"
                  success={data.tsp_contribution_percent !== null}
                >
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="e.g., 0.05 for 5%"
                    className={getInputClass(false, data.tsp_contribution_percent !== null)}
                    value={data.tsp_contribution_percent ?? ''}
                    onChange={e => setData(d => ({ ...d, tsp_contribution_percent: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label="TSP Contribution Type"
                  description="Traditional (pre-tax) or Roth (post-tax)"
                  success={!!data.tsp_contribution_type}
                >
                  <select
                    className={getInputClass(false, !!data.tsp_contribution_type)}
                    value={data.tsp_contribution_type ?? ''}
                    onChange={e => setData(d => ({ ...d, tsp_contribution_type: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    <option value="traditional">Traditional (Pre-Tax)</option>
                    <option value="roth">Roth (Post-Tax)</option>
                    <option value="split">Split (Both)</option>
                  </select>
                </ProfileFormField>
              </div>

              {/* SGLI Configuration */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">SGLI (Life Insurance)</h5>
                
                <ProfileFormField
                  label="SGLI Coverage Amount"
                  description="Your total SGLI coverage (increments of $50K up to $500K)"
                  success={data.sgli_coverage_amount !== null}
                >
                  <select
                    className={getInputClass(false, data.sgli_coverage_amount !== null)}
                    value={data.sgli_coverage_amount ?? ''}
                    onChange={e => setData(d => ({ ...d, sgli_coverage_amount: e.target.value ? parseInt(e.target.value) : null }))}
                  >
                    <option value="">Select</option>
                    <option value="0">$0 (Declined)</option>
                    <option value="50000">$50,000</option>
                    <option value="100000">$100,000</option>
                    <option value="150000">$150,000</option>
                    <option value="200000">$200,000</option>
                    <option value="250000">$250,000</option>
                    <option value="300000">$300,000</option>
                    <option value="350000">$350,000</option>
                    <option value="400000">$400,000 (Maximum)</option>
                  </select>
                </ProfileFormField>
              </div>

              {/* Dental Insurance */}
              <div className="space-y-3">
                <ProfileFormField
                  label="Do you have TRICARE Dental (or other military dental insurance)?"
                  success={data.has_dental_insurance !== null}
                >
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.has_dental_insurance === true}
                        onChange={() => setData(d => ({ ...d, has_dental_insurance: true }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={data.has_dental_insurance === false}
                        onChange={() => setData(d => ({ ...d, has_dental_insurance: false }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </ProfileFormField>
              </div>

              {/* Tax Withholding Configuration */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">Tax Withholding</h5>
                
                <ProfileFormField
                  label="Filing Status"
                  description="Your tax filing status for withholding calculations"
                  success={!!data.filing_status}
                >
                  <select
                    className={getInputClass(false, !!data.filing_status)}
                    value={data.filing_status ?? ''}
                    onChange={e => setData(d => ({ ...d, filing_status: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married_filing_jointly">Married Filing Jointly</option>
                    <option value="married_filing_separately">Married Filing Separately</option>
                    <option value="head_of_household">Head of Household</option>
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="State of Legal Residence"
                  description="For state income tax withholding (your home of record)"
                  success={!!data.state_of_residence}
                >
                  <input
                    type="text"
                    placeholder="e.g., CA, TX, FL, NY"
                    maxLength={2}
                    className={getInputClass(false, !!data.state_of_residence)}
                    value={data.state_of_residence ?? ''}
                    onChange={e => setData(d => ({ ...d, state_of_residence: e.target.value.toUpperCase() || null }))}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label="W-4 Allowances"
                  description="Number of allowances claimed on your W-4 (affects federal tax withholding)"
                  success={data.w4_allowances !== null}
                >
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="e.g., 0, 1, 2"
                    className={getInputClass(false, data.w4_allowances !== null)}
                    value={data.w4_allowances ?? ''}
                    onChange={e => setData(d => ({ ...d, w4_allowances: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </ProfileFormField>
              </div>

              {/* Help Text */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-700">
                  <Icon name="HelpCircle" className="inline w-3 h-3 mr-1" />
                  <strong>Why configure this?</strong> The LES Auditor can calculate your expected deductions and taxes to verify your net pay is correct. 
                  Tax calculations are estimates - actual withholding depends on your W-4 settings and year-to-date earnings.
                </p>
              </div>
            </div>
          </ProfileSection>
        </div>

        {/* Mobile Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-subtle p-4 md:hidden shadow-lg z-50">
          <button
            onClick={submit}
            disabled={saving || saved}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>✅ Saved! Redirecting...</>
            ) : (
              <>💾 Save Profile</>
            )}
          </button>
        </div>

        {/* Desktop Save Button */}
        <div className="hidden md:flex items-center gap-4 mt-8 mb-20">
          <button
            onClick={submit}
            disabled={saving || saved}
            className="inline-flex items-center bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving your profile...
              </>
            ) : saved ? (
              <>
                <span className="mr-2">✅</span>
                Saved! Redirecting...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Save Profile
              </>
            )}
          </button>
          {!saved && (
            <Link href="/dashboard" className="text-sm text-body hover:text-primary hover:underline transition-colors">
              Back to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


