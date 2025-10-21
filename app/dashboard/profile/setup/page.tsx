'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const spouseServiceStatuses = [
  { value: 'active_duty', label: 'Active Duty' },
  { value: 'reserve', label: 'Reserve' },
  { value: 'national_guard', label: 'National Guard' },
  { value: 'retired', label: 'Retired' },
  { value: 'veteran', label: 'Veteran' }
];
const branches = ['Army','Navy','Air Force','Marines','Coast Guard','Space Force'];
const civilianBranches = ['Army','Navy','Air Force','Marines','Coast Guard','Space Force','Multiple / Joint','N/A (not service-specific)'];
const genders = ['Male','Female','Prefer not to say'];
const educationLevels = ['High school','Some college','Associate degree','Bachelor degree','Master degree','Doctorate'];

// New field options
const clearanceLevels = ['None','Secret','Top Secret','TS/SCI','Q Clearance','Other'];
const deploymentStatuses = ['Never deployed','Pre-deployment','Currently deployed','Post-deployment','Multiple deployments'];
const housingOptions = ['On-base housing','Rent off-base','Own primary residence','Own rental property','Living with family','Other'];
const longTermGoals = ['Retire at 20 years','Retire at 30 years','Transition to civilian (soon)','Continue indefinitely','Unsure'];
const tspAllocations = ['Lifecycle Fund (L2030/L2040/L2050/etc)','G Fund (Government Securities)','F Fund (Fixed Income)','C Fund (Common Stock)','S Fund (Small Cap)','I Fund (International)','Custom mix','Not sure'];
const communicationPrefs = ['Email','SMS/Text','In-app notifications','Phone call','No preference'];
const contentDifficultyPrefs = ['Beginner-friendly','Intermediate','Advanced','All levels'];
const urgencyLevels = ['Low (just browsing)','Normal','High (need help soon)','Crisis (urgent assistance needed)'];
const educationGoalsList = ['Complete degree','Professional certification','Use MyCAA','Maximize GI Bill','TA/Tuition Assistance','Spouse education','Children college planning'];

const yesNo = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const ranges = ['none','1-5k','5-10k','10-25k','25-50k','50k+','prefer-not-to-say'];
const tspRanges = ['0-25k','25k-50k','50k-100k','100k-200k','200k+','prefer-not-to-say'];
const incomeRanges = ['<50k','50k-75k','75k-100k','100k-150k','150k+','prefer-not-to-say'];
const interests = ['federal','entrepreneur','remote','education','transition'];
const priorities = ['tsp','debt','emergency','house-hack','budget','sdp','investment'];

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
      // Sections 7 & 8 removed (education, preferences) - fields deleted from database
      case 7:
      case 8:
        total = 0;
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

  function toggleArray(field: keyof ProfilePayload, value: string) {
    setData(prev => {
      const arr = (prev[field] as string[] | null) || [];
      const exists = arr.includes(value);
      const next = exists ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  }

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

          {/* Sections 7 & 8 (Education, Preferences) removed - fields deleted from database */}
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


