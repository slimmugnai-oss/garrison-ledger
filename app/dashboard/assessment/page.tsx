'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/app/components/Header';

export default function Assessment() {
  const r = useRouter();
  const [stage, setStage] = useState('pcs_soon');
  const [kids, setKids] = useState(false);
  const [housing, setHousing] = useState('onbase');
  const [goalTsp, setGoalTsp] = useState(true);
  const [goalHouse, setGoalHouse] = useState(false);
  const [sdp, setSdp] = useState(true);

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Readiness Assessment</h1>
        <div className="rounded border bg-white p-6 shadow-sm space-y-3">
          <Field label="Stage">
            <select 
              value={stage} 
              onChange={e => setStage(e.target.value)} 
              className="border rounded px-2 py-1"
            >
              <option value="pcs_soon">PCS soon</option>
              <option value="pcs_later">PCS later</option>
              <option value="deploy">Deployment</option>
              <option value="reintegration">Reintegration</option>
            </select>
          </Field>
          
          <Field label="Housing">
            <select 
              value={housing} 
              onChange={e => setHousing(e.target.value)} 
              className="border rounded px-2 py-1"
            >
              <option value="onbase">On base</option>
              <option value="offbase">Off base</option>
              <option value="unsure">Unsure</option>
            </select>
          </Field>
          
          <Field label="Kids">
            <input 
              type="checkbox" 
              checked={kids} 
              onChange={e => setKids(e.target.checked)} 
            />
          </Field>
          
          <Field label="Goals">
            <label className="mr-4 text-sm">
              <input 
                type="checkbox" 
                checked={goalTsp} 
                onChange={e => setGoalTsp(e.target.checked)} 
              /> Improve TSP
            </label>
            <label className="mr-4 text-sm">
              <input 
                type="checkbox" 
                checked={goalHouse} 
                onChange={e => setGoalHouse(e.target.checked)} 
              /> Buy multi-unit
            </label>
            <label className="text-sm">
              <input 
                type="checkbox" 
                checked={sdp} 
                onChange={e => setSdp(e.target.checked)} 
              /> Use SDP well
            </label>
          </Field>

          <button
            onClick={() => r.push(`/dashboard/plan?stage=${stage}&housing=${housing}&kids=${kids}&tsp=${goalTsp}&house=${goalHouse}&sdp=${sdp}`)}
            className="rounded bg-blue-700 text-white px-4 py-2 hover:bg-blue-800 transition-colors"
          >
            Generate my plan
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode | React.ReactElement }) {
  return (
    <div>
      <div className="text-sm font-medium mb-1">{label}</div>
      {children}
    </div>
  );
}
