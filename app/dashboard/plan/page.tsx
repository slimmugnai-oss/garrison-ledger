'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';

type Item = { title: string; url: string; tags: string[] };

export default function PlanPage() {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const stage = p.get('stage') || 'pcs_soon';
  const housing = p.get('housing') || 'onbase';
  const kids = p.get('kids') === 'true';
  const goalTsp = p.get('tsp') === 'true';
  const goalHouse = p.get('house') === 'true';
  const sdp = p.get('sdp') === 'true';

  const [items, setItems] = useState<Item[]>([]);
  
  useEffect(() => {
    fetch('/toolkit-map.json')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const needTags = useMemo(() => {
    const t = [`stage:${stage}`];
    if (kids) t.push('audience:kids');
    if (housing) t.push(`housing:${housing}`);
    if (goalTsp) t.push('goal:tsp');
    if (goalHouse) t.push('goal:buy_multiunit');
    if (sdp) t.push('goal:sdp');
    return t;
  }, [stage, housing, kids, goalTsp, goalHouse, sdp]);

  const ranked = useMemo(() => {
    const score = (it: Item) => {
      const overlap = it.tags.filter(tag => needTags.includes(tag)).length;
      // stage matches are heavy
      const stageHit = it.tags.includes(`stage:${stage}`) ? 1 : 0;
      return overlap * 2 + stageHit * 2;
    };
    return items
      .map(it => ({ it, sc: score(it) }))
      .filter(x => x.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 10)
      .map(x => x.it);
  }, [items, needTags, stage]);

  // Prefill tool deeplinks
  const tspLink = `/dashboard/tools/tsp-modeler?age=30&retire=50&bal=50000&cont=500&mix=C:70,S:30`;
  const sdpLink = `/dashboard/tools/sdp-strategist?amount=10000`;
  const houseLink = `/dashboard/tools/house-hacking?price=400000&rate=6.5&tax=4800&ins=1600&bah=2400&rent=2200`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Personalized Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored financial roadmap based on your military service stage and goals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Priority Actions Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Priority Actions</h2>
              </div>
              <p className="text-gray-600 mb-6">Focus on these next 2 weeks:</p>
              <div className="space-y-4">
                {stage === 'pcs_soon' && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">PCS Preparation</p>
                      <p className="text-gray-600">Start PCS checklist and document inventory photos/videos</p>
                    </div>
                  </div>
                )}
                {kids && (
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Family Planning</p>
                      <p className="text-gray-600">Review childcare/schools at your base; note waitlists</p>
                    </div>
                  </div>
                )}
                {goalTsp && (
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">TSP Optimization</p>
                      <p className="text-gray-600">Run your TSP model and review the difference number</p>
                    </div>
                  </div>
                )}
                {goalHouse && (
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Property Analysis</p>
                      <p className="text-gray-600">Try a duplex scenario in House Hacking and sanity-check cash flow</p>
                    </div>
                  </div>
                )}
                {sdp && (
                  <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">SDP Strategy</p>
                      <p className="text-gray-600">Plan where your SDP payout will go on return</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wealth Builder Tools Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Wealth Builder Tools</h2>
              </div>
              <p className="text-gray-600 mb-6">Run these calculations now:</p>
              <div className="space-y-4">
                {goalTsp && (
                  <Link 
                    href={tspLink} 
                    className="block p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">TSP Modeler</p>
                        <p className="text-blue-100">Optimize your retirement contributions</p>
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                )}
                {sdp && (
                  <Link 
                    href={sdpLink} 
                    className="block p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">SDP Strategist</p>
                        <p className="text-green-100">Maximize deployment savings</p>
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                )}
                {goalHouse && (
                  <Link 
                    href={houseLink} 
                    className="block p-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-white hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">House Hacking</p>
                        <p className="text-purple-100">Analyze multi-unit investments</p>
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-xl">📚</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personalized Resources</h2>
            </div>
            <p className="text-gray-600 mb-6">Curated content based on your profile:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ranked.map((it, index) => (
                <a 
                  key={it.url}
                  href={it.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {it.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">External resource</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
              <p className="text-xl mb-6 opacity-90">
                Start implementing your personalized plan today
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Return to Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
