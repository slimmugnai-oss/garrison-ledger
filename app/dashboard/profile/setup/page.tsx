'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BaseAutocomplete from '@/app/components/ui/BaseAutocomplete';
import militaryRanks from '@/lib/data/military-ranks.json';
import militaryComponents from '@/lib/data/military-components.json';

type ProfilePayload = {
  age?: number | null;
  gender?: string | null;
  years_of_service?: number | null;
  education_level?: string | null;
  service_status?: string | null;
  spouse_service_status?: string | null;
  branch?: string | null;
  rank?: string | null;
  component?: string | null;
  current_base?: string | null;
  next_base?: string | null;
  pcs_date?: string | null;
  marital_status?: string | null;
  spouse_age?: number | null;
  num_children?: number | null;
  children?: Array<{ age: number }> | null;
  has_efmp?: boolean | null;
  tsp_balance_range?: string | null;
  debt_amount_range?: string | null;
  emergency_fund_range?: string | null;
  housing_situation?: string | null;
  career_interests?: string[] | null;
  financial_priorities?: string[] | null;
  urgency_level?: string | null;
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
const yesNo = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];
const ranges = ['none','1-5k','5-10k','10-25k','25-50k','50k+','prefer-not-to-say'];
const tspRanges = ['0-25k','25k-50k','50k-100k','100k-200k','200k+','prefer-not-to-say'];
const interests = ['federal','entrepreneur','remote','education'];
const priorities = ['tsp','debt','emergency','house-hack','budget','sdp'];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<ProfilePayload>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/user-profile', { cache: 'no-store' });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          setData({
            service_status: json?.service_status || null,
            spouse_service_status: json?.spouse_service_status || null,
            branch: json?.branch || null,
            rank: json?.rank || null,
            component: json?.component || null,
            current_base: json?.current_base || null,
            next_base: json?.next_base || null,
            pcs_date: json?.pcs_date || null,
            marital_status: json?.marital_status || null,
            num_children: json?.num_children ?? null,
            children: json?.children || null,
            has_efmp: json?.has_efmp ?? null,
            tsp_balance_range: json?.tsp_balance_range || null,
            debt_amount_range: json?.debt_amount_range || null,
            emergency_fund_range: json?.emergency_fund_range || null,
            housing_situation: json?.housing_situation || null,
            career_interests: json?.career_interests || [],
            financial_priorities: json?.financial_priorities || [],
            urgency_level: json?.urgency_level || 'normal',
            profile_completed: json?.profile_completed || false,
          });
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

  const step = useMemo(() => {
    // Simple step derivation based on filled fields
    if (!data.age || !data.gender) return 1;
    if (!data.rank || !data.branch) return 2;
    if (!data.current_base) return 3;
    if (data.marital_status == null || data.num_children == null || data.has_efmp == null) return 4;
    if (!data.tsp_balance_range || !data.debt_amount_range || !data.emergency_fund_range) return 5;
    return 6;
  }, [data]);

  async function submit() {
    setSaving(true);
    setError(null);
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
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-black text-text">Set up your profile</h1>
          <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:underline">Skip</Link>
        </div>

        <div className="mb-6">
          <div className="text-sm text-muted">Step {step} of 6</div>
          <div className="w-full bg-gray-100 h-2 rounded">
            <div className="bg-blue-600 h-2 rounded" style={{ width: `${(step/6)*100}%` }} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 border border-red-200 bg-red-50 text-red-800 rounded">{error}</div>
        )}
        {saved && (
          <div className="mb-6 p-4 border-2 border-green-300 bg-green-50 text-green-900 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold">Profile saved successfully!</p>
                <p className="text-sm text-green-700">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">About you</h2>
            <p className="text-sm text-muted mb-4">Basic info helps us tailor calculations and advice</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Age</label>
                <input type="number" min={17} max={100} placeholder="e.g., 28" className="w-full border border-border rounded-lg px-3 py-2" value={data.age ?? ''} onChange={e => setData(d => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Gender</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.gender ?? ''} onChange={e => setData(d => ({ ...d, gender: e.target.value || null }))}>
                  <option value="">Select</option>
                  {genders.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Years of service</label>
                <input type="number" min={0} max={40} placeholder="e.g., 6" className="w-full border border-border rounded-lg px-3 py-2" value={data.years_of_service ?? ''} onChange={e => setData(d => ({ ...d, years_of_service: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Military identity</h2>
            <p className="text-sm text-muted mb-4">Optional - helps us personalize your plan</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Service Status</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.service_status ?? ''} onChange={e => setData(d => ({ ...d, service_status: e.target.value || null }))}>
                  <option value="">Select</option>
                  {serviceStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {data.service_status === 'military_spouse' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-muted mb-2">Spouse&apos;s Service Status</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2" value={data.spouse_service_status ?? ''} onChange={e => setData(d => ({ ...d, spouse_service_status: e.target.value || null }))}>
                      <option value="">Select</option>
                      {spouseServiceStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted italic">
                    Branch/rank not applicable
                  </div>
                </>
              ) : data.service_status === 'dod_civilian' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-muted mb-2">Which service do you work with?</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2" value={data.branch ?? ''} onChange={e => setData(d => ({ ...d, branch: e.target.value || null }))}>
                      <option value="">Select (optional)</option>
                      {civilianBranches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted italic">
                    Rank not applicable
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-muted mb-2">Branch</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2" value={data.branch ?? ''} onChange={e => setData(d => ({ ...d, branch: e.target.value || null }))}>
                      <option value="">Select</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted mb-2">Rank</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2" value={data.rank ?? ''} onChange={e => setData(d => ({ ...d, rank: e.target.value || null }))} disabled={!data.branch}>
                      <option value="">Select {!data.branch ? '(select branch first)' : '(optional)'}</option>
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
                  </div>
                </>
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
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Location & timeline</h2>
            <p className="text-sm text-muted mb-4">Optional - helps us tailor move and deployment advice</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Current base</label>
                <BaseAutocomplete 
                  value={data.current_base ?? ''} 
                  onChange={(value) => setData(d => ({ ...d, current_base: value || null }))}
                  placeholder="e.g., Fort Liberty, NC (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Next base</label>
                <BaseAutocomplete 
                  value={data.next_base ?? ''} 
                  onChange={(value) => setData(d => ({ ...d, next_base: value || null }))}
                  placeholder="If known (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">PCS date</label>
                <input type="date" placeholder="Optional" className="w-full border border-border rounded-lg px-3 py-2" value={data.pcs_date ?? ''} onChange={e => setData(d => ({ ...d, pcs_date: e.target.value || null }))} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Family</h2>
            <p className="text-sm text-muted mb-4">Optional - helps with family-specific recommendations</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Marital status</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.marital_status ?? ''} onChange={e => setData(d => ({ ...d, marital_status: e.target.value || null }))}>
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Number of children</label>
                <input type="number" min={0} max={10} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2" value={data.num_children ?? 0} onChange={e => setData(d => ({ ...d, num_children: Number(e.target.value) }))} />
              </div>
              {data.marital_status === 'married' && (
                <div>
                  <label className="block text-sm font-semibold text-muted mb-2">Spouse age</label>
                  <input type="number" min={17} max={100} placeholder="Optional" className="w-full border border-border rounded-lg px-3 py-2" value={data.spouse_age ?? ''} onChange={e => setData(d => ({ ...d, spouse_age: e.target.value ? Number(e.target.value) : null }))} />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">EFMP enrolled</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.has_efmp === null || data.has_efmp === undefined ? '' : String(data.has_efmp)} onChange={e => setData(d => ({ ...d, has_efmp: e.target.value === '' ? null : e.target.value === 'true' }))}>
                  <option value="">Select</option>
                  {yesNo.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Children Ages - Dynamic fields */}
            {data.num_children !== null && data.num_children !== undefined && data.num_children > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
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
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Financial snapshot</h2>
            <p className="text-sm text-muted mb-4">Optional - use ranges for privacy. This helps tailor financial advice.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">TSP balance</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.tsp_balance_range ?? ''} onChange={e => setData(d => ({ ...d, tsp_balance_range: e.target.value || null }))}>
                  <option value="">Select</option>
                  {tspRanges.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Debt amount</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.debt_amount_range ?? ''} onChange={e => setData(d => ({ ...d, debt_amount_range: e.target.value || null }))}>
                  <option value="">Select</option>
                  {ranges.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Emergency fund</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.emergency_fund_range ?? ''} onChange={e => setData(d => ({ ...d, emergency_fund_range: e.target.value || null }))}>
                  <option value="">Select</option>
                  {ranges.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Education & goals</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-muted mb-2">Education level</label>
              <select className="w-full border border-border rounded-lg px-3 py-2" value={data.education_level ?? ''} onChange={e => setData(d => ({ ...d, education_level: e.target.value || null }))}>
                <option value="">Select (optional)</option>
                {educationLevels.map(e => <option key={e} value={e.toLowerCase().replace(' ', '-')}>{e}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Career interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleArray('career_interests', i)}
                      className={`px-3 py-1 rounded-full border ${data.career_interests?.includes(i) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-text border-border'}`}
                    >{i}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Financial priorities</label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleArray('financial_priorities', p)}
                      className={`px-3 py-1 rounded-full border ${data.financial_priorities?.includes(p) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-text border-border'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={saving || saved}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : saved ? 'Saved! Redirecting...' : 'Save profile'}
            </button>
            {!saved && (
              <Link href="/dashboard" className="text-sm text-muted hover:underline">Back to dashboard</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


