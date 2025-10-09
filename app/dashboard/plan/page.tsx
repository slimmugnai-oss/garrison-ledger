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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Your Personalized Plan</h1>

        <div className="rounded border bg-white p-6 shadow-sm">
          <div className="font-semibold mb-2">Top actions (next 2 weeks)</div>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {stage === 'pcs_soon' && (
              <li>Start PCS checklist and document inventory photos/videos.</li>
            )}
            {kids && (
              <li>Review childcare/schools at your base; note waitlists.</li>
            )}
            {goalTsp && (
              <li>Run your TSP model and review the difference number.</li>
            )}
            {goalHouse && (
              <li>Try a duplex scenario in House Hacking and sanity-check cash flow.</li>
            )}
            {sdp && (
              <li>Plan where your SDP payout will go on return.</li>
            )}
          </ul>
        </div>

        <div className="rounded border bg-white p-6 shadow-sm">
          <div className="font-semibold mb-2">Your resources</div>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {ranked.map(it => (
              <li key={it.url}>
                <a 
                  className="text-blue-700 underline" 
                  href={it.url} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  {it.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border bg-white p-6 shadow-sm">
          <div className="font-semibold mb-2">Wealth-Builder tools to run now</div>
          <div className="flex flex-wrap gap-3 text-sm">
            {goalTsp && (
              <Link 
                href={tspLink} 
                className="rounded bg-blue-700 text-white px-3 py-2 hover:bg-blue-800 transition-colors"
              >
                Open TSP Modeler
              </Link>
            )}
            {sdp && (
              <Link 
                href={sdpLink} 
                className="rounded bg-blue-700 text-white px-3 py-2 hover:bg-blue-800 transition-colors"
              >
                Open SDP Strategist
              </Link>
            )}
            {goalHouse && (
              <Link 
                href={houseLink} 
                className="rounded bg-blue-700 text-white px-3 py-2 hover:bg-blue-800 transition-colors"
              >
                Open House Hacking
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
