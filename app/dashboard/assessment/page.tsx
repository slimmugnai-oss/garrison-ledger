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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🎯 Readiness Assessment</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized financial recommendations based on your military service stage and goals.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="space-y-8">
              <Field label="Current Stage">
                <select 
                  value={stage} 
                  onChange={e => setStage(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                >
                  <option value="pcs_soon" className="text-gray-900">PCS soon</option>
                  <option value="pcs_later" className="text-gray-900">PCS later</option>
                  <option value="deploy" className="text-gray-900">Deployment</option>
                  <option value="reintegration" className="text-gray-900">Reintegration</option>
                </select>
              </Field>
              
              <Field label="Housing Preference">
                <select 
                  value={housing} 
                  onChange={e => setHousing(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                >
                  <option value="onbase" className="text-gray-900">On base</option>
                  <option value="offbase" className="text-gray-900">Off base</option>
                  <option value="unsure" className="text-gray-900">Unsure</option>
                </select>
              </Field>
              
              <Field label="Family Status">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={kids} 
                    onChange={e => setKids(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">I have children</span>
                </div>
              </Field>
              
              <Field label="Financial Goals">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={goalTsp} 
                      onChange={e => setGoalTsp(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 font-medium">Improve TSP allocation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={goalHouse} 
                      onChange={e => setGoalHouse(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 font-medium">Buy multi-unit property</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={sdp} 
                      onChange={e => setSdp(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 font-medium">Use SDP effectively</span>
                  </div>
                </div>
              </Field>

              <div className="pt-6">
                <button
                  onClick={() => r.push(`/dashboard/plan?stage=${stage}&housing=${housing}&kids=${kids}&tsp=${goalTsp}&house=${goalHouse}&sdp=${sdp}`)}
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
      <div className="text-lg font-semibold text-gray-900">{label}</div>
      {children}
    </div>
  );
}
