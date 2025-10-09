'use client';

import { useMemo, useState, useEffect } from 'react';
import PremiumGate from '@/app/components/premium/PremiumGate';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

type Rates = { C: number; S: number; I: number; F: number; G: number };
const DEFAULT_RATES: Rates = { C: 0.10, S: 0.11, I: 0.07, F: 0.04, G: 0.02 };

function fvSeries(start: number, monthly: number, years: number, annual: number) {
  const out: number[] = [start];
  let b = start;
  const rmo = Math.pow(1 + annual, 1 / 12) - 1;
  for (let i = 0; i < years * 12; i++) {
    b = b * (1 + rmo) + monthly;
    if (i % 12 === 11) out.push(b);
  }
  return out;
}

const fmt = (v: number) => v.toLocaleString(undefined, { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

export default function TspModeler() {
  const { isPremium } = usePremiumStatus();

  // inputs
  const [age, setAge] = useState(30);
  const [ret, setRet] = useState(50);
  const [bal, setBal] = useState(50000);
  const [cont, setCont] = useState(500);
  const [wC, setWC] = useState(70);
  const [wS, setWS] = useState(30);
  const [wI, setWI] = useState(0);
  const [wF, setWF] = useState(0);
  const [wG, setWG] = useState(0);

  // optional prefill via query
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = (k: string, def: number) => Number(p.get(k) ?? def);
    setAge(n('age', 30));
    setRet(n('retire', 50));
    setBal(n('bal', 50000));
    setCont(n('cont', 500));
    const mix = p.get('mix');
    if (mix) {
      const m: Record<string, number> = {};
      mix.split(',').forEach(kv => {
        const [k, v] = kv.split(':');
        m[k] = Number(v);
      });
      setWC(m.C ?? 70);
      setWS(m.S ?? 30);
      setWI(m.I ?? 0);
      setWF(m.F ?? 0);
      setWG(m.G ?? 0);
    }
  }, []);

  const years = Math.max(0, ret - age);

  // proxy rates (could move to Supabase later)
  const r = DEFAULT_RATES;

  // L2050 rough default mix (you can expand later)
  const mixDefault = { C: 0.45, S: 0.25, I: 0.15, F: 0.10, G: 0.05 };

  const weights = useMemo(() => {
    const arr = [wC, wS, wI, wF, wG];
    const sum = arr.reduce((a, b) => a + b, 0) || 1;
    return arr.map(v => v / sum);
  }, [wC, wS, wI, wF, wG]);

  const rDefault = mixDefault.C * r.C + mixDefault.S * r.S + mixDefault.I * r.I + mixDefault.F * r.F + mixDefault.G * r.G;
  const rCustom = weights[0] * r.C + weights[1] * r.S + weights[2] * r.I + weights[3] * r.F + weights[4] * r.G;

  const A = useMemo(() => fvSeries(bal, cont, years, rDefault), [bal, cont, years, rDefault]);
  const B = useMemo(() => fvSeries(bal, cont, years, rCustom), [bal, cont, years, rCustom]);

  // secure preview: trim series BEFORE render if not premium
  const visLen = isPremium ? A.length : Math.max(2, Math.ceil(A.length * 0.33));
  const Atrim = A.slice(0, visLen);
  const Btrim = B.slice(0, visLen);

  // lightweight SVG line plot (no external lib)
  const Chart = ({ seriesA, seriesB }: { seriesA: number[]; seriesB: number[] }) => {
    const w = 560, h = 240, pad = 24;
    const all = [...seriesA, ...seriesB];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const X = (i: number, n: number) => pad + (i / (n - 1)) * (w - 2 * pad);
    const Y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    const toPath = (s: number[]) => s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${X(i, s.length)} ${Y(v)}`).join(' ');
    
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-60 border rounded bg-white">
        <path d={toPath(seriesA)} fill="none" stroke="#94a3b8" strokeWidth="2" />
        <path d={toPath(seriesB)} fill="none" stroke="#0b3d91" strokeWidth="2" />
        <text x={20} y={20} className="text-xs fill-gray-600">Default Mix</text>
        <text x={20} y={40} className="text-xs fill-blue-800">Custom Mix</text>
      </svg>
    );
  };

  // final values computed but NOT rendered if not premium
  const endA = A[A.length - 1];
  const endB = B[B.length - 1];
  const diff = endB - endA;

  return (
    <div className="space-y-6">
      <div className="rounded border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <label className="text-sm">
            Age
            <input 
              type="number" 
              className="ml-2 w-20 border rounded px-2 py-1" 
              value={age} 
              onChange={e => setAge(Number(e.target.value))} 
            />
          </label>
          <label className="text-sm">
            Retire at
            <input 
              type="number" 
              className="ml-2 w-20 border rounded px-2 py-1" 
              value={ret} 
              onChange={e => setRet(Number(e.target.value))} 
            />
          </label>
          <label className="text-sm">
            Current balance
            <input 
              type="number" 
              className="ml-2 w-28 border rounded px-2 py-1" 
              value={bal} 
              onChange={e => setBal(Number(e.target.value))} 
            />
          </label>
          <label className="text-sm">
            Monthly contrib
            <input 
              type="number" 
              className="ml-2 w-24 border rounded px-2 py-1" 
              value={cont} 
              onChange={e => setCont(Number(e.target.value))} 
            />
          </label>
        </div>

        <div className="mt-4">
          <div className="text-sm mb-1">Custom mix (C/S/I/F/G)</div>
          <div className="flex flex-wrap gap-4">
            <Range label="C" v={wC} set={setWC} />
            <Range label="S" v={wS} set={setWS} />
            <Range label="I" v={wI} set={setWI} />
            <Range label="F" v={wF} set={setWF} />
            <Range label="G" v={wG} set={setWG} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Weights normalize automatically. Education only. Past performance is not predictive.
          </div>
        </div>
      </div>

      <div className="rounded border bg-white p-4 shadow-sm">
        <Chart seriesA={Atrim} seriesB={Btrim} />
        {!isPremium && (
          <div className="mt-2 text-sm text-gray-600">
            Preview shows the first third of the timeline. Unlock to view full projection and ROI.
          </div>
        )}
      </div>

      <PremiumGate
        placeholder={
          <div>
            <div className="text-lg font-semibold mb-2">Unlock your ROI</div>
            <p className="text-sm text-gray-600">
              See projected balances and the potential difference at retirement.
            </p>
          </div>
        }
      >
        <div className="rounded border bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold mb-2">Projected balances</div>
          <div className="text-sm">
            Default mix: <span className="font-semibold">{fmt(endA)}</span>
          </div>
          <div className="text-sm">
            Custom mix: <span className="font-semibold">{fmt(endB)}</span>
          </div>
          <div className="text-xl font-bold mt-2">
            Potential difference: 
            <span className="text-green-700 ml-2">{fmt(diff)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Illustrative only (proxy returns). Past performance is not predictive.
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}

function Range({ label, v, set }: { label: string; v: number; set: (n: number) => void }) {
  return (
    <label className="text-sm inline-flex items-center gap-2">
      {label}
      <input 
        type="range" 
        min={0} 
        max={100} 
        value={v} 
        onChange={e => set(Number(e.target.value))}
        className="w-40" 
      />
      <span className="w-10 text-right">{v}%</span>
    </label>
  );
}
