'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BaseAutocomplete from '@/app/components/ui/BaseAutocomplete';

type ProfilePayload = {
  age?: number | null;
  gender?: string | null;
  years_of_service?: number | null;
  education_level?: string | null;
  rank?: string | null;
  branch?: string | null;
  component?: string | null;
  current_base?: string | null;
  next_base?: string | null;
  pcs_date?: string | null;
  marital_status?: string | null;
  spouse_age?: number | null;
  num_children?: number | null;
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

const ranks = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9','O-1','O-2','O-3','O-4','O-5','O-6'];
const branches = ['Army','Navy','Air Force','Marines','Coast Guard','Space Force'];
const components = ['Active','Reserve','Guard'];
const genders = ['Male','Female','Other','Prefer not to say'];
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
            rank: json?.rank || null,
            branch: json?.branch || null,
            component: json?.component || null,
            current_base: json?.current_base || null,
            next_base: json?.next_base || null,
            pcs_date: json?.pcs_date || null,
            marital_status: json?.marital_status || null,
            num_children: json?.num_children ?? null,
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
          <div className="mb-6 p-3 border border-green-200 bg-green-50 text-green-800 rounded">Profile saved!</div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Rank</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.rank ?? ''} onChange={e => setData(d => ({ ...d, rank: e.target.value || null }))}>
                  <option value="">Select (optional)</option>
                  {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Branch</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.branch ?? ''} onChange={e => setData(d => ({ ...d, branch: e.target.value || null }))}>
                  <option value="">Select</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Component</label>
                <select className="w-full border border-border rounded-lg px-3 py-2" value={data.component ?? ''} onChange={e => setData(d => ({ ...d, component: e.target.value || null }))}>
                  <option value="">Select</option>
                  {components.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
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
                <label className="block text-sm font-semibold text-muted mb-2">Children</label>
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
              disabled={saving}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            <Link href="/dashboard" className="text-sm text-muted hover:underline">Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


