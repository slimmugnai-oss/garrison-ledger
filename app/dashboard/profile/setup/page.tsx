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

type ProfilePayload = {
  // Basic info
  age?: number | null;
  gender?: string | null;
  years_of_service?: number | null;
  education_level?: string | null;
  
  // Military identity
  service_status?: string | null;
  spouse_service_status?: string | null;
  branch?: string | null;
  rank?: string | null;
  component?: string | null;
  mos_afsc_rate?: string | null;
  clearance_level?: string | null;
  time_in_service_months?: number | null;
  
  // Location & Deployment
  current_base?: string | null;
  next_base?: string | null;
  pcs_date?: string | null;
  deployment_count?: number | null;
  deployment_status?: string | null;
  last_deployment_date?: string | null;
  
  // Family
  marital_status?: string | null;
  spouse_age?: number | null;
  spouse_military?: boolean | null;
  spouse_employed?: boolean | null;
  spouse_career_field?: string | null;
  num_children?: number | null;
  children?: Array<{ age: number }> | null;
  has_efmp?: boolean | null;
  
  // Financial
  tsp_balance_range?: string | null;
  tsp_allocation?: string | null;
  debt_amount_range?: string | null;
  emergency_fund_range?: string | null;
  monthly_income_range?: string | null;
  bah_amount?: number | null;
  housing_situation?: string | null;
  owns_rental_properties?: boolean | null;
  
  // Goals
  long_term_goal?: string | null;
  retirement_age_target?: number | null;
  career_interests?: string[] | null;
  financial_priorities?: string[] | null;
  education_goals?: string[] | null;
  
  // Preferences
  content_difficulty_pref?: string | null;
  urgency_level?: string | null;
  communication_pref?: string | null;
  timezone?: string | null;
  
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
            education_level: json?.education_level ?? null,
            // Military
            service_status: json?.service_status ?? null,
            spouse_service_status: json?.spouse_service_status ?? null,
            branch: json?.branch ?? null,
            rank: json?.rank ?? null,
            component: json?.component ?? null,
            mos_afsc_rate: json?.mos_afsc_rate ?? null,
            clearance_level: json?.clearance_level ?? null,
            time_in_service_months: json?.time_in_service_months ?? null,
            // Location & Deployment
            current_base: json?.current_base ?? null,
            next_base: json?.next_base ?? null,
            pcs_date: json?.pcs_date ?? null,
            deployment_count: json?.deployment_count ?? null,
            deployment_status: json?.deployment_status ?? null,
            last_deployment_date: json?.last_deployment_date ?? null,
            // Family
            marital_status: json?.marital_status ?? null,
            spouse_age: json?.spouse_age ?? null,
            spouse_military: json?.spouse_military ?? null,
            spouse_employed: json?.spouse_employed ?? null,
            spouse_career_field: json?.spouse_career_field ?? null,
            num_children: json?.num_children ?? null,
            children: json?.children ?? null,
            has_efmp: json?.has_efmp ?? null,
            // Financial
            tsp_balance_range: json?.tsp_balance_range ?? null,
            tsp_allocation: json?.tsp_allocation ?? null,
            debt_amount_range: json?.debt_amount_range ?? null,
            emergency_fund_range: json?.emergency_fund_range ?? null,
            monthly_income_range: json?.monthly_income_range ?? null,
            bah_amount: json?.bah_amount ?? null,
            housing_situation: json?.housing_situation ?? null,
            owns_rental_properties: json?.owns_rental_properties ?? null,
            // Goals
            long_term_goal: json?.long_term_goal ?? null,
            retirement_age_target: json?.retirement_age_target ?? null,
            career_interests: json?.career_interests ?? [],
            financial_priorities: json?.financial_priorities ?? [],
            education_goals: json?.education_goals ?? [],
            // Preferences
            content_difficulty_pref: json?.content_difficulty_pref ?? 'all',
            urgency_level: json?.urgency_level ?? 'normal',
            communication_pref: json?.communication_pref ?? null,
            timezone: json?.timezone ?? null,
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

  // Initialize children array when num_children changes
  useEffect(() => {
    if (data.num_children !== null && data.num_children !== undefined && data.num_children > 0) {
      const currentChildren = data.children || [];
      const newChildren = Array.from({ length: data.num_children }, (_, i) => {
        return currentChildren[i] || { age: 0 };
      });
      if (JSON.stringify(currentChildren) !== JSON.stringify(newChildren)) {
        setData(d => ({ ...d, children: newChildren }));
      }
    } else if (data.num_children === 0 || data.num_children === null) {
      if (data.children && data.children.length > 0) {
        setData(d => ({ ...d, children: null }));
      }
    }
  }, [data.num_children, data.children]);

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
        total = data.service_status && !['military_spouse', 'dod_civilian'].includes(data.service_status) ? 5 : 3;
        if (data.service_status) complete++;
        if (data.service_status && !['military_spouse', 'dod_civilian'].includes(data.service_status)) {
          if (data.branch) complete++;
          if (data.rank) complete++;
          if (data.mos_afsc_rate) complete++;
          if (data.clearance_level) complete++;
        } else if (data.service_status === 'dod_civilian') {
          if (data.clearance_level) complete++;
        }
        break;
      case 3: // Location & Deployment
        total = 3;
        if (data.current_base) complete++;
        if (data.deployment_status) complete++;
        if (data.deployment_count !== null && data.deployment_count !== undefined) complete++;
        break;
      case 4: // Family
        total = 3 + (data.marital_status === 'married' ? 3 : 0);
        if (data.marital_status) complete++;
        if (data.num_children !== null && data.num_children !== undefined) complete++;
        if (data.has_efmp !== null && data.has_efmp !== undefined) complete++;
        if (data.marital_status === 'married') {
          if (data.spouse_age) complete++;
          if (data.spouse_military !== null && data.spouse_military !== undefined) complete++;
          if (data.spouse_employed !== null && data.spouse_employed !== undefined) complete++;
        }
        break;
      case 5: // Financial
        total = 6;
        if (data.tsp_balance_range) complete++;
        if (data.tsp_allocation) complete++;
        if (data.debt_amount_range) complete++;
        if (data.emergency_fund_range) complete++;
        if (data.housing_situation) complete++;
        if (data.monthly_income_range) complete++;
        break;
      case 6: // Goals
        total = 3;
        if (data.long_term_goal) complete++;
        if (data.retirement_age_target) complete++;
        if (data.career_interests && data.career_interests.length > 0) complete++;
        break;
      case 7: // Education
        total = 2;
        if (data.education_level) complete++;
        if (data.education_goals && data.education_goals.length > 0) complete++;
        break;
      case 8: // Preferences
        total = 2;
        if (data.content_difficulty_pref) complete++;
        if (data.communication_pref) complete++;
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
      { field: data.has_efmp, name: 'has_efmp', label: 'EFMP enrollment' },
      { field: data.tsp_balance_range, name: 'tsp_balance_range', label: 'TSP balance' },
      { field: data.debt_amount_range, name: 'debt_amount_range', label: 'Debt amount' },
      { field: data.emergency_fund_range, name: 'emergency_fund_range', label: 'Emergency fund' }
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
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, profile_completed: true }),
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Set up your profile</h1>
              <p className="text-sm text-gray-600">Help us personalize your experience</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
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
          <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-red-900">Please complete required fields</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-green-900">Profile saved successfully!</p>
                <p className="text-sm text-green-700">Redirecting to dashboard...</p>
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
                    <ProfileFormField
                      label="Spouse's Service Status"
                      description="Your spouse's military status"
                      success={!!data.spouse_service_status}
                    >
                      <select
                        className={getInputClass(false, !!data.spouse_service_status)}
                        value={data.spouse_service_status ?? ''}
                        onChange={e => setData(d => ({ ...d, spouse_service_status: e.target.value || null }))}
                      >
                        <option value="">Select (optional)</option>
                        {spouseServiceStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </ProfileFormField>
                    <div className="flex items-center justify-center text-sm text-gray-500 italic md:col-span-1">
                      Branch/rank not applicable
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
                    <div className="flex items-center justify-center text-sm text-gray-500 italic md:col-span-1">
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
              {data.service_status && !['military_spouse'].includes(data.service_status) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <ProfileFormField
                    label="MOS / AFSC / Rate"
                    description="Your military job code (optional)"
                    success={!!data.mos_afsc_rate}
                  >
                    <input
                      type="text"
                      placeholder="e.g., 11B, 2T3X1, BM2"
                      className={getInputClass(false, !!data.mos_afsc_rate)}
                      value={data.mos_afsc_rate ?? ''}
                      onChange={e => setData(d => ({ ...d, mos_afsc_rate: e.target.value || null }))}
                      maxLength={20}
                    />
                  </ProfileFormField>

                  <ProfileFormField
                    label="Security Clearance"
                    description="Affects career opportunities"
                    success={!!data.clearance_level}
                  >
                    <select
                      className={getInputClass(false, !!data.clearance_level)}
                      value={data.clearance_level ?? ''}
                      onChange={e => setData(d => ({ ...d, clearance_level: e.target.value || null }))}
                    >
                      <option value="">Select (optional)</option>
                      {clearanceLevels.map(c => <option key={c} value={c.toLowerCase().replace(' ', '-').replace('/', '-')}>{c}</option>)}
                    </select>
                  </ProfileFormField>
                </div>
              )}
            </div>
            {data.service_status && ['reserve', 'national_guard'].includes(data.service_status) && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-2">🎖️ You selected {serviceStatuses.find(s => s.value === data.service_status)?.label}. This gives us context for your service type.</p>
              </div>
            )}
            {data.service_status === 'retired' && (
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                <p className="text-sm text-blue-900"><strong>Thank you for your service!</strong> We&apos;ll tailor content for your retirement phase, including continued benefits, VA resources, and transition planning.</p>
              </div>
            )}
            {data.service_status === 'veteran' && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                <p className="text-sm text-green-900"><strong>Thank you for your service!</strong> We&apos;ll focus on veteran benefits, civilian career transition, and post-service life planning.</p>
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

              {/* NEW: Deployment fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <ProfileFormField
                  label="Deployment Status"
                  description="Current deployment status"
                  success={!!data.deployment_status}
                >
                  <select
                    className={getInputClass(false, !!data.deployment_status)}
                    value={data.deployment_status ?? ''}
                    onChange={e => setData(d => ({ ...d, deployment_status: e.target.value || null }))}
                  >
                    <option value="">Select (optional)</option>
                    {deploymentStatuses.map(s => <option key={s} value={s.toLowerCase().replace(' ', '-')}>{s}</option>)}
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="Number of Deployments"
                  description="Total deployments"
                  success={data.deployment_count !== null && data.deployment_count !== undefined}
                >
                  <input
                    type="number"
                    min={0}
                    max={20}
                    placeholder="e.g., 2"
                    className={getInputClass(false, data.deployment_count !== null && data.deployment_count !== undefined)}
                    value={data.deployment_count ?? ''}
                    onChange={e => setData(d => ({ ...d, deployment_count: e.target.value ? Number(e.target.value) : null }))}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label="Last Deployment Date"
                  description="Most recent deployment"
                  success={!!data.last_deployment_date}
                >
                  <input
                    type="date"
                    className={getInputClass(false, !!data.last_deployment_date)}
                    value={data.last_deployment_date ?? ''}
                    onChange={e => setData(d => ({ ...d, last_deployment_date: e.target.value || null }))}
                  />
                </ProfileFormField>
              </div>
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

                <ProfileFormField
                  label="EFMP Enrolled"
                  required
                  error={fieldErrors.has_efmp}
                  description="Exceptional Family Member Program"
                  success={data.has_efmp !== null && data.has_efmp !== undefined}
                >
                  <select
                    className={getInputClass(!!fieldErrors.has_efmp, data.has_efmp !== null && data.has_efmp !== undefined)}
                    value={data.has_efmp === null || data.has_efmp === undefined ? '' : String(data.has_efmp)}
                    onChange={e => setData(d => ({ ...d, has_efmp: e.target.value === '' ? null : e.target.value === 'true' }))}
                  >
                    <option value="">Select</option>
                    {yesNo.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                  </select>
                </ProfileFormField>
              </div>

              {/* NEW: Spouse details (conditional) */}
              {data.marital_status === 'married' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <ProfileFormField
                    label="Spouse Age"
                    description="For planning purposes"
                    success={!!data.spouse_age}
                  >
                    <input
                      type="number"
                      min={17}
                      max={100}
                      placeholder="e.g., 30"
                      className={getInputClass(false, !!data.spouse_age)}
                      value={data.spouse_age ?? ''}
                      onChange={e => setData(d => ({ ...d, spouse_age: e.target.value ? Number(e.target.value) : null }))}
                    />
                  </ProfileFormField>

                  <ProfileFormField
                    label="Spouse Military"
                    description="Dual-military household?"
                    success={data.spouse_military !== null && data.spouse_military !== undefined}
                  >
                    <select
                      className={getInputClass(false, data.spouse_military !== null && data.spouse_military !== undefined)}
                      value={data.spouse_military === null || data.spouse_military === undefined ? '' : String(data.spouse_military)}
                      onChange={e => setData(d => ({ ...d, spouse_military: e.target.value === '' ? null : e.target.value === 'true' }))}
                    >
                      <option value="">Select (optional)</option>
                      {yesNo.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                    </select>
                  </ProfileFormField>

                  <ProfileFormField
                    label="Spouse Employed"
                    description="Is your spouse employed?"
                    success={data.spouse_employed !== null && data.spouse_employed !== undefined}
                  >
                    <select
                      className={getInputClass(false, data.spouse_employed !== null && data.spouse_employed !== undefined)}
                      value={data.spouse_employed === null || data.spouse_employed === undefined ? '' : String(data.spouse_employed)}
                      onChange={e => setData(d => ({ ...d, spouse_employed: e.target.value === '' ? null : e.target.value === 'true' }))}
                    >
                      <option value="">Select (optional)</option>
                      {yesNo.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                    </select>
                  </ProfileFormField>

                  {data.spouse_employed === true && (
                    <ProfileFormField
                      label="Spouse Career Field"
                      description="What field do they work in?"
                      success={!!data.spouse_career_field}
                    >
                      <input
                        type="text"
                        placeholder="e.g., Healthcare, IT, Education"
                        className={getInputClass(false, !!data.spouse_career_field)}
                        value={data.spouse_career_field ?? ''}
                        onChange={e => setData(d => ({ ...d, spouse_career_field: e.target.value || null }))}
                        maxLength={100}
                      />
                    </ProfileFormField>
                  )}
                </div>
              )}
            </div>

            {/* Children Ages - Dynamic fields */}
            {data.num_children !== null && data.num_children !== undefined && data.num_children > 0 && (
              <div className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span>👨‍👩‍👧‍👦</span> Children&apos;s Ages
                </h3>
                <p className="text-sm text-purple-700 mb-4">Helps us provide age-appropriate school info, childcare resources, and family planning</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: data.num_children }, (_, i) => (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-purple-900 mb-2">Child {i + 1} age</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={26} 
                        placeholder="Age"
                        className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={data.children?.[i]?.age ?? ''}
                        onChange={e => {
                          const newChildren = [...(data.children || [])];
                          newChildren[i] = { age: Number(e.target.value) || 0 };
                          setData(d => ({ ...d, children: newChildren }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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

                <ProfileFormField
                  label="TSP Allocation"
                  description="Current TSP fund allocation"
                  success={!!data.tsp_allocation}
                >
                  <select
                    className={getInputClass(false, !!data.tsp_allocation)}
                    value={data.tsp_allocation ?? ''}
                    onChange={e => setData(d => ({ ...d, tsp_allocation: e.target.value || null }))}
                  >
                    <option value="">Select (optional)</option>
                    {tspAllocations.map(a => <option key={a} value={a.toLowerCase().replace(/[()/ ]/g, '-').replace(/--+/g, '-')}>{a}</option>)}
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="Monthly Income"
                  description="Household income range"
                  success={!!data.monthly_income_range}
                >
                  <select
                    className={getInputClass(false, !!data.monthly_income_range)}
                    value={data.monthly_income_range ?? ''}
                    onChange={e => setData(d => ({ ...d, monthly_income_range: e.target.value || null }))}
                  >
                    <option value="">Select (optional)</option>
                    {incomeRanges.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </ProfileFormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProfileFormField
                  label="Debt Amount"
                  required
                  error={fieldErrors.debt_amount_range}
                  description="Total debt (not including mortgage)"
                  success={!!data.debt_amount_range}
                >
                  <select
                    className={getInputClass(!!fieldErrors.debt_amount_range, !!data.debt_amount_range)}
                    value={data.debt_amount_range ?? ''}
                    onChange={e => setData(d => ({ ...d, debt_amount_range: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    {ranges.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="Emergency Fund"
                  required
                  error={fieldErrors.emergency_fund_range}
                  description="Cash savings for emergencies"
                  success={!!data.emergency_fund_range}
                >
                  <select
                    className={getInputClass(!!fieldErrors.emergency_fund_range, !!data.emergency_fund_range)}
                    value={data.emergency_fund_range ?? ''}
                    onChange={e => setData(d => ({ ...d, emergency_fund_range: e.target.value || null }))}
                  >
                    <option value="">Select</option>
                    {ranges.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </ProfileFormField>

                <ProfileFormField
                  label="BAH Amount"
                  description="Monthly BAH (if applicable)"
                  success={!!data.bah_amount}
                >
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    placeholder="e.g., 2100"
                    className={getInputClass(false, !!data.bah_amount)}
                    value={data.bah_amount ?? ''}
                    onChange={e => setData(d => ({ ...d, bah_amount: e.target.value ? Number(e.target.value) : null }))}
                  />
                </ProfileFormField>
              </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileFormField
                  label="Long-Term Goal"
                  description="Your military career plan"
                  success={!!data.long_term_goal}
                >
                  <select
                    className={getInputClass(false, !!data.long_term_goal)}
                    value={data.long_term_goal ?? ''}
                    onChange={e => setData(d => ({ ...d, long_term_goal: e.target.value || null }))}
                  >
                    <option value="">Select (optional)</option>
                    {longTermGoals.map(g => <option key={g} value={g.toLowerCase().replace(' ', '-').replace('(', '').replace(')', '')}>{g}</option>)}
                  </select>
                </ProfileFormField>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileFormField
                  label="Career Interests"
                  description="Select all that apply"
                  success={!!data.career_interests && data.career_interests.length > 0}
                >
                  <div className="flex flex-wrap gap-2">
                    {interests.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleArray('career_interests', i)}
                        className={`px-3 py-2 rounded-lg border font-medium transition-all ${
                          data.career_interests?.includes(i) 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </ProfileFormField>

                <ProfileFormField
                  label="Financial Priorities"
                  description="What matters most to you?"
                  success={!!data.financial_priorities && data.financial_priorities.length > 0}
                >
                  <div className="flex flex-wrap gap-2">
                    {priorities.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleArray('financial_priorities', p)}
                        className={`px-3 py-2 rounded-lg border font-medium transition-all ${
                          data.financial_priorities?.includes(p) 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </ProfileFormField>
              </div>
            </div>
          </ProfileSection>

          {/* Section 7: Education */}
          <ProfileSection
            number={7}
            title="Education"
            icon="🎓"
            description="Your education background and goals"
            expanded={expandedSections.has(7)}
            onToggle={() => toggleSection(7)}
            completion={getSectionCompletion(7)}
          >
            <div className="space-y-4">
              <ProfileFormField
                label="Education Level"
                description="Highest level completed"
                success={!!data.education_level}
              >
                <select
                  className={getInputClass(false, !!data.education_level)}
                  value={data.education_level ?? ''}
                  onChange={e => setData(d => ({ ...d, education_level: e.target.value || null }))}
                >
                  <option value="">Select (optional)</option>
                  {educationLevels.map(e => <option key={e} value={e.toLowerCase().replace(' ', '-')}>{e}</option>)}
                </select>
              </ProfileFormField>

              <ProfileFormField
                label="Education Goals"
                description="Select all that apply"
                success={!!data.education_goals && data.education_goals.length > 0}
              >
                <div className="flex flex-wrap gap-2">
                  {educationGoalsList.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArray('education_goals', g.toLowerCase().replace(' ', '-').replace('/', '-'))}
                      className={`px-3 py-2 rounded-lg border font-medium transition-all text-sm ${
                        data.education_goals?.includes(g.toLowerCase().replace(' ', '-').replace('/', '-'))
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </ProfileFormField>
            </div>
          </ProfileSection>

          {/* Section 8: Preferences */}
          <ProfileSection
            number={8}
            title="Preferences"
            icon="⚙️"
            description="How we communicate and deliver content"
            expanded={expandedSections.has(8)}
            onToggle={() => toggleSection(8)}
            completion={getSectionCompletion(8)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileFormField
                label="Content Difficulty"
                description="Preferred content level"
                success={!!data.content_difficulty_pref}
              >
                <select
                  className={getInputClass(false, !!data.content_difficulty_pref)}
                  value={data.content_difficulty_pref ?? 'all'}
                  onChange={e => setData(d => ({ ...d, content_difficulty_pref: e.target.value || 'all' }))}
                >
                  {contentDifficultyPrefs.map(p => <option key={p} value={p.toLowerCase().replace(' ', '-')}>{p}</option>)}
                </select>
              </ProfileFormField>

              <ProfileFormField
                label="Communication Preference"
                description="How to reach you"
                success={!!data.communication_pref}
              >
                <select
                  className={getInputClass(false, !!data.communication_pref)}
                  value={data.communication_pref ?? ''}
                  onChange={e => setData(d => ({ ...d, communication_pref: e.target.value || null }))}
                >
                  <option value="">Select (optional)</option>
                  {communicationPrefs.map(p => <option key={p} value={p.toLowerCase().replace(' ', '-').replace('/', '-')}>{p}</option>)}
                </select>
              </ProfileFormField>

              <ProfileFormField
                label="Urgency Level"
                description="How soon do you need help?"
                success={!!data.urgency_level}
              >
                <select
                  className={getInputClass(false, !!data.urgency_level)}
                  value={data.urgency_level ?? 'normal'}
                  onChange={e => setData(d => ({ ...d, urgency_level: e.target.value || 'normal' }))}
                >
                  {urgencyLevels.map(u => <option key={u} value={u.toLowerCase().replace(/[() ]/g, '-').replace(/--+/g, '-')}>{u}</option>)}
                </select>
              </ProfileFormField>

              <ProfileFormField
                label="Timezone"
                description="For scheduling and deadlines"
                success={!!data.timezone}
              >
                <input
                  type="text"
                  placeholder="e.g., America/New_York"
                  className={getInputClass(false, !!data.timezone)}
                  value={data.timezone ?? ''}
                  onChange={e => setData(d => ({ ...d, timezone: e.target.value || null }))}
                  maxLength={50}
                />
              </ProfileFormField>
            </div>
          </ProfileSection>
        </div>

        {/* Mobile Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg z-50">
          <button
            onClick={submit}
            disabled={saving || saved}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors">
              Back to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


