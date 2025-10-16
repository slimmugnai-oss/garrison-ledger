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
      <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-4">🎯 Readiness Assessment</h1>
            <p className="text-xl text-body max-w-2xl mx-auto">
              Get personalized financial recommendations based on your military service stage and goals.
            </p>
          </div>
          
          <div className="bg-surface rounded-xl p-8 border border-subtle" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="space-y-8">
              <Field label="Current Stage">
                <select 
                  value={stage} 
                  onChange={e => setStage(e.target.value)} 
                  className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-primary bg-surface"
                >
                  <option value="pcs_soon" className="text-primary">PCS soon</option>
                  <option value="pcs_later" className="text-primary">PCS later</option>
                  <option value="deploy" className="text-primary">Deployment</option>
                  <option value="reintegration" className="text-primary">Reintegration</option>
                </select>
              </Field>
              
              <Field label="Housing Preference">
                <select 
                  value={housing} 
                  onChange={e => setHousing(e.target.value)} 
                  className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-info transition-colors text-primary bg-surface"
                >
                  <option value="onbase" className="text-primary">On base</option>
                  <option value="offbase" className="text-primary">Off base</option>
                  <option value="unsure" className="text-primary">Unsure</option>
                </select>
              </Field>
              
              <Field label="Family Status">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={kids} 
                    onChange={e => setKids(e.target.checked)}
                    className="w-5 h-5 text-info border-default rounded focus:ring-blue-500"
                  />
                  <span className="text-primary font-medium">I have children</span>
                </div>
              </Field>
              
              <Field label="Financial Goals">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={goalTsp} 
                      onChange={e => setGoalTsp(e.target.checked)}
                      className="w-5 h-5 text-info border-default rounded focus:ring-blue-500"
                    />
                    <span className="text-primary font-medium">Improve TSP allocation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={goalHouse} 
                      onChange={e => setGoalHouse(e.target.checked)}
                      className="w-5 h-5 text-info border-default rounded focus:ring-blue-500"
                    />
                    <span className="text-primary font-medium">Buy multi-unit property</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={sdp} 
                      onChange={e => setSdp(e.target.checked)}
                      className="w-5 h-5 text-info border-default rounded focus:ring-blue-500"
                    />
                    <span className="text-primary font-medium">Use SDP effectively</span>
                  </div>
                </div>
              </Field>

              <div className="pt-6">
                <button
                  onClick={async () => {
                    // Save assessment to API
                    const answers = {
                      stage,
                      housing,
                      kids,
                      goals: { tsp: goalTsp, house: goalHouse, sdp }
                    };
                    
                    try {
                      await fetch('/api/assessment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ answers })
                      });
                    } catch (error) {
                      console.error('Error saving assessment:', error);
                    }
                    
                    // Navigate to plan page
                    r.push('/dashboard/plan');
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  Generate My Personalized Plan 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode | React.ReactElement }) {
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold text-primary">{label}</div>
      {children}
    </div>
  );
}
